import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable, WritableSignal, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';

import { Observable, lastValueFrom, map } from 'rxjs';

import { jwtDecode } from 'jwt-decode';

import { environment } from '@rusbe/environments/environment';
import {
  LocalStorageService,
  StorageKey,
} from '@rusbe/services/local-storage/local-storage.service';
import { BrlCurrency } from '@rusbe/types/brl-currency';

@Injectable({
  providedIn: 'root',
})
export class GeneralGoodsService {
  private BEARER_TOKEN_REFRESH_THRESHOLD = 3 * 24 * 60 * 60; // 3 days

  private generalGoodsBaseUrl = new URL('api/', environment.generalGoodsApiUrl);
  private http: HttpClient = inject(HttpClient);
  private localStorage: LocalStorageService = inject(LocalStorageService);
  // Using same pattern as Firebase Auth, where `undefined` means the service is
  // still loading, while `null` means the token is not available.
  private bearerTokenSignal: WritableSignal<string | null | undefined> =
    signal(undefined);
  public isLoggedIn: Observable<boolean | undefined> = toObservable(
    this.bearerTokenSignal,
  ).pipe(
    map((bearerToken) => {
      if (bearerToken === undefined) {
        return undefined;
      } else {
        return bearerToken !== null;
      }
    }),
  );

  constructor() {
    this.retrieveBearerTokenFromLocalStorage();
  }

  private async performRequest<T>(
    requestDetails: {
      url: URL;
      method: 'GET' | 'POST' | 'PUT' | 'DELETE';
      bearerToken?: string;
    },
    body?: unknown,
  ): Promise<T> {
    try {
      let additionalHeaders: Record<string, string> = {};

      if (requestDetails.bearerToken) {
        additionalHeaders = {
          Authorization: `Bearer ${requestDetails.bearerToken}`,
        };
      }

      const headers = new HttpHeaders({
        Accept: 'application/json',
        ...additionalHeaders,
      });

      const response = await lastValueFrom(
        this.http.request<T>(
          requestDetails.method,
          requestDetails.url.toString(),
          { body, headers },
        ),
      );
      return response;
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        this.handleRequestError(error.error as GeneralGoodsResponseStatus);
      }

      // This should never happen.
      throw new Error('GeneralGoodsRequestFailed');
    }
  }

  public async registerAccount(accountRegisterData: {
    email: string;
    identifier: string;
    password: string;
  }) {
    const requestUrl = new URL(`register/`, this.generalGoodsBaseUrl);
    const requestBody = {
      email: accountRegisterData.email,
      email_confirmation: accountRegisterData.email,
      identifier: accountRegisterData.identifier,
      password: accountRegisterData.password,
      password_confirmation: accountRegisterData.password,
    };

    // TODO: Investigate if/how the account registration fails if the user doesn't have an account at the restaurant itself (i.e., biometric collection to enter)

    const accountData = await this.performRequest<
      GeneralGoodsAccountDataResponseBody & GeneralGoodsResponseStatus
    >({ url: requestUrl, method: 'POST' }, requestBody);

    await this.saveBearerToken(accountData.authorisation.token);
  }

  public async sendPasswordResetEmail(email: string) {
    const requestUrl = new URL(`recovery/`, this.generalGoodsBaseUrl);
    const requestBody = { email };

    return await this.performRequest(
      { url: requestUrl, method: 'POST' },
      requestBody,
    );
  }

  public async sendVerificationEmail(email: string) {
    const requestUrl = new URL(`verification/send/`, this.generalGoodsBaseUrl);
    const requestBody = { email };

    return await this.performRequest(
      { url: requestUrl, method: 'POST' },
      requestBody,
    );
  }

  public async login({ email, password }: { email: string; password: string }) {
    const requestUrl = new URL(`login/`, this.generalGoodsBaseUrl);
    const requestBody = { email, password };

    const accountData =
      await this.performRequest<GeneralGoodsAccountDataResponseBody>(
        { url: requestUrl, method: 'POST' },
        requestBody,
      );

    await this.saveBearerToken(accountData.authorisation.token);
  }

  public async refreshToken() {
    const requestUrl = new URL(`refresh/`, this.generalGoodsBaseUrl);
    const bearerToken = await this.ensureBearerToken({
      skipRefreshCheck: true,
    });

    const accountData =
      await this.performRequest<GeneralGoodsAccountDataResponseBody>({
        url: requestUrl,
        method: 'POST',
        bearerToken,
      });

    await this.saveBearerToken(accountData.authorisation.token);
  }

  public async logout() {
    const requestUrl = new URL(`logout/`, this.generalGoodsBaseUrl);
    const bearerToken = await this.ensureBearerToken();
    await this.clearBearerToken();
    await this.performRequest({ url: requestUrl, method: 'POST', bearerToken });
  }

  public async getAccountData(): Promise<GeneralGoodsAccountData> {
    const requestUrl = new URL(`user-data/`, this.generalGoodsBaseUrl);
    const bearerToken = await this.ensureBearerToken();

    const responseData =
      await this.performRequest<GeneralGoodsAccountDataResponseBody>({
        url: requestUrl,
        method: 'POST',
        bearerToken,
      });
    return this.parseAccountData(responseData);
  }

  public async startAddCreditsTransactionUsingPix(
    amount: BrlCurrency,
  ): Promise<GeneralGoodsPixTransactionData> {
    const requestUrl = new URL(`payment/pix/`, this.generalGoodsBaseUrl);
    const requestBody = { amount: amount.toNumber(), type: 'Pix' };
    const bearerToken = await this.ensureBearerToken();

    const responseData =
      await this.performRequest<GeneralGoodsPixTransactionDataResponseBody>(
        { url: requestUrl, method: 'POST', bearerToken },
        requestBody,
      );

    if (responseData.errors) {
      throw new Error('GeneralGoodsTransactionFailed');
    }

    return this.parsePixTransactionData(responseData);
  }

  async clearBearerToken() {
    await this.localStorage.remove(StorageKey.GeneralGoodsBearerToken);
    this.bearerTokenSignal.set(null);
  }

  private async retrieveBearerTokenFromLocalStorage() {
    const bearerToken = await this.localStorage.get<string>(
      StorageKey.GeneralGoodsBearerToken,
    );
    if (bearerToken) {
      this.bearerTokenSignal.set(bearerToken);
    } else {
      this.bearerTokenSignal.set(null);
    }
  }

  private async saveBearerToken(token: string) {
    await this.localStorage.set(StorageKey.GeneralGoodsBearerToken, token);
    this.bearerTokenSignal.set(token);
  }

  private async ensureBearerToken(
    options: { skipRefreshCheck?: boolean } = { skipRefreshCheck: false },
  ): Promise<string> {
    const bearerToken = this.bearerTokenSignal();

    if (!bearerToken) {
      throw new Error('GeneralGoodsTokenNotAvailable');
    }

    // If token is expired, throw an error
    const decodedToken = jwtDecode(bearerToken) as { exp: number };
    const now = Date.now() / 1000;

    if (decodedToken.exp < now) {
      throw new Error('GeneralGoodsTokenExpired');
    }

    // If token expires within the threshold, refresh it
    if (
      !options.skipRefreshCheck &&
      decodedToken.exp - now < this.BEARER_TOKEN_REFRESH_THRESHOLD
    ) {
      await this.refreshToken();
      // TODO: Instead of refreshing the token if it's about to expire, schedule it to be refreshed in the background
    }

    return bearerToken;
  }

  private handleRequestError(response: GeneralGoodsResponseStatus) {
    if (
      response.message === 'Credenciais inválidas ou cadastro não confirmado.'
    ) {
      // Although this messages implies that the credentials are invalid, when the password is incorrect,
      // the server usually returns `Unauthorized` instead.
      throw new Error('GeneralGoodsInvalidCredentialsOrEmailNotConfirmed');
    }

    if (response.status === 'success' && response.message === 'hi') {
      throw new Error('GeneralGoodsInternalServerError');
    }

    if (response.status === 'error') {
      if (response.message === 'Unauthorized') {
        throw new Error('GeneralGoodsUnauthorized');
      } else {
        throw new Error('GeneralGoodsRequestFailed');
      }
    }

    throw new Error('GeneralGoodsRequestFailed');

    // TODO: Narrow down when General Goods service is unavailable
  }

  private parseAccountData(
    responseBody: GeneralGoodsAccountDataResponseBody,
  ): GeneralGoodsAccountData {
    const accountData: GeneralGoodsAccountData = {
      apiUserId: responseBody.user.id.toString(),
      personId: responseBody.user.pessoa_id,
      cpfNumber: responseBody.user.pessoa.cpf,
      fullName: responseBody.user.pessoa.nome,
      email: responseBody.user.email,
      balance: this.parseBalance(responseBody),
    };

    return accountData;
  }

  private parseBalance(
    responseBody: GeneralGoodsAccountDataResponseBody,
  ): GeneralGoodsBalance {
    if (
      responseBody.user.pessoa.classificacao_id == '2' ||
      responseBody.user.pessoa.consumo_limite_credito == null
    ) {
      if (
        responseBody.user.pessoa.horarios.find(
          (horario) => horario.inicio === '07:00',
        )
      ) {
        return { type: GeneralGoodsBalanceType.FullGrantStudentHousing };
      } else {
        return { type: GeneralGoodsBalanceType.FullGrant };
      }
    }

    return {
      type: GeneralGoodsBalanceType.PartialGrant,
      value: BrlCurrency.fromGeneralGoodsApiString(
        responseBody.user.pessoa.consumo_limite_credito,
      ),
    };
  }

  private parsePixTransactionData(
    responseBody: GeneralGoodsPixTransactionDataResponseBody,
  ): GeneralGoodsPixTransactionData {
    return {
      apiUserId: responseBody.paymentOrder!.api_user_id.toString(),
      holder: responseBody.paymentOrder!.holder,
      amount: BrlCurrency.fromCents(responseBody.paymentOrder!.amount),
      type: responseBody.paymentOrder!.type,
      paymentId: responseBody.paymentOrder!.paymentId,
      transactionId: responseBody.paymentOrder!.tid,
      receivedDate: new Date(responseBody.paymentOrder!.receivedDate),
      qrCodeString: responseBody.paymentOrder!.qrCodeString,
      qrCodeBase64Image: responseBody.paymentOrder!.qrcodeBase64Image,
    };
  }
}

interface GeneralGoodsAccountDataResponseBody {
  user: {
    id: number;
    pessoa_id: string;
    email: string;
    email_verified_at: Date;
    remember_token: null;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
    pessoa: {
      id: number;
      n_identificador: string;
      nome: string;
      cpf: string;
      empresa_id: string;
      horario_id: string;
      estado: string;
      classificacao_id: string;
      consumo_limite_credito: string;
      horarios: {
        id: number;
        horario_id: string;
        inicio: string;
        fim: string;
        seg: string;
        ter: string;
        qua: string;
        qui: string;
        sex: string;
        sab: string;
        dom: string;
        fer: string;
        tipo_limite: string;
        limite_acessos: string;
        dias_escala: null;
        ciclo: string;
        liberar: string;
        t_minimo_sentido: string;
        t_minimo_tempo: string;
        t_minimo_fora_faixa: string;
      }[];
    };
  };
  authorisation: {
    token: string;
    type: string;
  };
}

interface GeneralGoodsPixTransactionDataResponseBody {
  paymentOrder?: {
    api_user_id: number;
    holder: string;
    amount: number;
    type: GeneralGoodsTransactionType.Pix;
    status: number;
    updated_at: Date;
    created_at: Date;
    id: number;
    tid: string;
    receivedDate: string;
    paymentId: string;
    returnMessage: string;
    returnCode: string;
    acquirerTransactionId: string;
    qrcodeBase64Image: string;
    qrCodeString: string;
  };
  errors?: unknown;
}

interface GeneralGoodsResponseStatus {
  status?: string | number;
  message?: string;
}

export interface GeneralGoodsAccountData {
  apiUserId: string;
  personId: string;
  cpfNumber: string;
  fullName: string;
  email: string;
  balance: GeneralGoodsBalance;
}

export interface GeneralGoodsPixTransactionData {
  apiUserId: string;
  holder: string;
  amount: BrlCurrency;
  type: GeneralGoodsTransactionType.Pix;
  paymentId: string;
  transactionId: string;
  receivedDate: Date;
  qrCodeString: string;
  qrCodeBase64Image: string;
}

export type GeneralGoodsBalance =
  | GeneralGoodsPartialGrantBalance
  | GeneralGoodsFullGrantBalance;

export interface GeneralGoodsPartialGrantBalance {
  type: GeneralGoodsBalanceType.PartialGrant;
  value: BrlCurrency;
}

export interface GeneralGoodsFullGrantBalance {
  type:
    | GeneralGoodsBalanceType.FullGrant
    | GeneralGoodsBalanceType.FullGrantStudentHousing;
}

export enum GeneralGoodsBalanceType {
  FullGrantStudentHousing = 'full-grant-student-housing',
  FullGrant = 'full-grant',
  PartialGrant = 'partial-grant',
  NoGrant = 'no-grant',
}

export enum GeneralGoodsTransactionType {
  Pix = 'Pix',
}
