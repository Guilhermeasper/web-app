import { Injectable, WritableSignal, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';

import {
  Observable,
  combineLatest,
  debounceTime,
  filter,
  map,
  switchMap,
  timer,
} from 'rxjs';

import { AccountService } from '@rusbe/services/account/account.service';
import {
  GeneralGoodsAccountData,
  GeneralGoodsService,
} from '@rusbe/services/general-goods/general-goods.service';

@Injectable({
  providedIn: 'root',
})
export class AuthStateService {
  private readonly ACCOUNT_DATA_UPDATE_INTERVAL_IN_MILLIS = 10 * 60 * 1000; // 10 minutes
  private readonly DEBOUNCE_TIME_IN_MILLIS = 300;

  private accountService: AccountService = inject(AccountService);
  private generalGoodsService: GeneralGoodsService =
    inject(GeneralGoodsService);
  private accountDataUpdateObservable: Observable<void>;
  private writableAccountAuthState: WritableSignal<
    AccountAuthState | undefined
  > = signal(undefined);
  private writableGeneralGoodsAccountData: WritableSignal<
    GeneralGoodsAccountData | undefined
  > = signal(undefined);
  private readonly currentUserObservable = toObservable(
    this.accountService.currentUser,
  );

  public readonly accountAuthState = this.writableAccountAuthState.asReadonly();
  public readonly generalGoodsAccountData =
    this.writableGeneralGoodsAccountData.asReadonly();

  constructor() {
    // Triggers an update change whenever there's an update in Firebase or General Goods user or every 10 minutes.
    // Skips when either of the observables are undefined, which means that services are still initializing.
    this.accountDataUpdateObservable = combineLatest([
      this.currentUserObservable,
      this.generalGoodsService.isLoggedIn,
    ]).pipe(
      filter(
        ([currentUser, generalGoodsIsLoggedIn]) =>
          currentUser !== undefined && generalGoodsIsLoggedIn !== undefined,
      ),
      debounceTime(this.DEBOUNCE_TIME_IN_MILLIS),
      // Refresh every 10 minutes
      switchMap(() =>
        timer(0, this.ACCOUNT_DATA_UPDATE_INTERVAL_IN_MILLIS).pipe(
          map(() => {
            return;
          }),
        ),
      ),
    );

    this.setupAuthStateAutoRefresh();
  }

  public setupAuthStateAutoRefresh() {
    this.accountDataUpdateObservable.subscribe(async () => {
      await this.updateAccountAuthState();
    });
  }

  public async updateAccountAuthState() {
    const currentUser = this.accountService.currentUser();

    if (currentUser === null) {
      await this.generalGoodsService.clearBearerToken();
      this.writableAccountAuthState.set(AccountAuthState.LoggedOut);
      this.writableGeneralGoodsAccountData.set(undefined);
      return;
    }

    if (currentUser === undefined) {
      this.writableAccountAuthState.set(undefined);
      this.writableGeneralGoodsAccountData.set(undefined);
      return;
    }

    await this.tryFetchGeneralGoodsAccountDataUsingCachedToken({
      allowRetry: true,
    });
  }

  private async tryFetchGeneralGoodsAccountDataUsingCachedToken(
    options: { allowRetry: boolean } = {
      allowRetry: false,
    },
  ) {
    try {
      const generalGoodsAccountData =
        await this.generalGoodsService.getAccountData();
      this.writableAccountAuthState.set(AccountAuthState.LoggedIn);
      this.writableGeneralGoodsAccountData.set(generalGoodsAccountData);
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message === 'GeneralGoodsTokenNotAvailable' ||
          error.message === 'GeneralGoodsTokenExpired'
        ) {
          if (options.allowRetry) {
            await this.tryFetchGeneralGoodsAuthToken();
          } else {
            this.writableAccountAuthState.set(
              AccountAuthState.CredentialRefreshRequired,
            );
            this.writableGeneralGoodsAccountData.set(undefined);
          }
        }
      }

      // FIXME: Token precheck may pass, but request might fail later. Check this case.
    }
  }

  private async tryFetchGeneralGoodsAuthToken() {
    try {
      await this.accountService.fetchGeneralGoodsAuthToken();
      await this.tryFetchGeneralGoodsAccountDataUsingCachedToken({
        allowRetry: false,
      });
      // FIXME: Check if we're covering all possible errors
      // TODO: Write a error management method for each of the throwable methods.
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message === 'GeneralGoodsIntegrationDataMissing' ||
          error.message === 'EncryptionKeyNotFound'
        ) {
          this.writableAccountAuthState.set(
            AccountAuthState.PendingGeneralGoodsIntegrationSetup,
          );
          this.writableGeneralGoodsAccountData.set(undefined);
        }
        if (error.message === 'OperationRequiresGoogleDriveCachedToken') {
          this.writableAccountAuthState.set(
            AccountAuthState.CredentialRefreshRequired,
          );
          this.writableGeneralGoodsAccountData.set(undefined);
        }
        if (
          // TODO: Should we include all of these?
          error.message === 'GeneralGoodsServiceUnavailable' ||
          error.message === 'GeneralGoodsInternalServerError' ||
          error.message === 'GeneralGoodsRequestFailed'
        ) {
          this.writableAccountAuthState.set(
            AccountAuthState.GeneralGoodsServiceUnavailable,
          );
          this.writableGeneralGoodsAccountData.set(undefined);
        }
        if (
          error.message ===
            'GeneralGoodsInvalidCredentialsOrEmailNotConfirmed' ||
          error.message === 'GeneralGoodsUnauthorized'
        ) {
          await this.inferReasonForGeneralGoodsLoginUnsuccessful();
        }
      }
    }
  }

  async inferReasonForGeneralGoodsLoginUnsuccessful() {
    try {
      const integrationStatus =
        await this.accountService.fetchGeneralGoodsIntegrationStatus();

      if (integrationStatus.integrationCompleted) {
        this.writableAccountAuthState.set(
          AccountAuthState.GeneralGoodsAccountCredentialMismatch,
        );
        this.writableGeneralGoodsAccountData.set(undefined);
      } else {
        this.writableAccountAuthState.set(
          AccountAuthState.PendingGeneralGoodsVerification,
        );
        this.writableGeneralGoodsAccountData.set(undefined);
      }
    } catch {
      // This should not happen. Since login was attempted, integration data is expected to exist.
      this.writableAccountAuthState.set(
        AccountAuthState.CredentialRefreshRequired,
      );
      this.writableGeneralGoodsAccountData.set(undefined);
    }
  }
}

export enum AccountAuthState {
  LoggedOut = 'logged-out',
  LoggedIn = 'logged-in',
  PendingGeneralGoodsIntegrationSetup = 'pending-general-goods-integration-setup',
  PendingGeneralGoodsVerification = 'pending-general-goods-verification',
  GeneralGoodsAccountCredentialMismatch = 'general-goods-account-credential-mismatch',
  CredentialRefreshRequired = 'credential-refresh-required',
  GeneralGoodsServiceUnavailable = 'general-goods-service-unavailable',
}
