import { Injectable, Signal, computed, inject } from '@angular/core';

import {
  CryptoService,
  SerializedEncryptedObject,
} from '@rusbe/services/crypto/crypto.service';
import { FirebaseService } from '@rusbe/services/firebase/firebase.service';
import { GeneralGoodsService } from '@rusbe/services/general-goods/general-goods.service';
import { GoogleDriveService } from '@rusbe/services/google-drive/google-drive.service';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private readonly ENCRYPTION_KEY_FILE_NAME = 'encryption-key.json';

  private firebaseService: FirebaseService = inject(FirebaseService);
  private generalGoodsService: GeneralGoodsService =
    inject(GeneralGoodsService);
  private googleDriveService: GoogleDriveService = inject(GoogleDriveService);
  private cryptoService: CryptoService = inject(CryptoService);

  public readonly currentUser: Signal<User | null | undefined> = computed(
    () => {
      const firebaseUser = this.firebaseService.currentUser();

      if (!firebaseUser) {
        // Careful: `undefined` means Firebase is still loading,
        // while `null` means the user is logged out.
        return firebaseUser;
      }

      return {
        displayName: firebaseUser.displayName,
        email: firebaseUser.email,
        photoUrl: firebaseUser.photoURL,
        uid: firebaseUser.uid,
      };
    },
  );

  public async signIn(
    options: { suggestSameUser: boolean } = {
      suggestSameUser: false,
    },
  ) {
    const userCredential = await this.firebaseService.signInWithPopup(options);

    const token = this.extractTokenFromUserCredential(userCredential);

    if (token) {
      this.googleDriveService.cacheToken(token);
    }
  }

  public async signOut() {
    await this.firebaseService.signOut();
    this.googleDriveService.clearToken();
    await this.generalGoodsService.logout();
  }

  public async generateGeneralGoodsAccountStub(
    integrationType: GeneralGoodsIntegrationType,
    customEmail?: string,
  ): Promise<GeneralGoodsAccountStub> {
    const user = this.ensureCurrentUser();
    const password = this.cryptoService.generateRandomPassword();

    return {
      email: customEmail ?? user.email!,
      password,
      integrationType,
    };
  }

  public async createNewGeneralGoodsAccount(
    stub: GeneralGoodsAccountStub,
    identifier: string,
  ) {
    try {
      await this.generalGoodsService.registerAccount({
        email: stub.email,
        identifier,
        password: stub.password,
      });
      await this.commitGeneralGoodsIntegrationData(stub);
    } catch {
      throw new Error('GeneralGoodsAccountCreationFailed');
      // TODO: Distinguish between different errors (e.g. account already exists)
    }
  }

  public async sendNewGeneralGoodsAccountVerificationEmail(
    stub: GeneralGoodsAccountStub,
  ) {
    try {
      await this.generalGoodsService.sendVerificationEmail(stub.email);
    } catch {
      throw new Error('GeneralGoodsAccountVerificationEmailFailed');
    }
  }

  public async sendExistingGeneralGoodsAccountPasswordResetEmail(
    stub: GeneralGoodsAccountStub,
  ) {
    try {
      await this.generalGoodsService.sendPasswordResetEmail(stub.email);
      await this.commitGeneralGoodsIntegrationData(stub);
    } catch {
      // TODO: Distinguish between different errors (e.g. account does not exist)
      throw new Error('GeneralGoodsAccountResetEmailFailed');
    }
  }

  public async completeGeneralGoodsAccountSetup(stub: GeneralGoodsAccountStub) {
    try {
      await this.generalGoodsService.login({
        email: stub.email,
        password: stub.password,
      });
      await this.markGeneralGoodsIntegrationAsCompleted();
    } catch {
      throw new Error('GeneralGoodsAccountLoginFailed');
    }
  }

  public async saveLegalConsent() {
    const userDocumentPath = this.getUserDocumentPath();
    await this.firebaseService.updateFirestoreDocument(userDocumentPath, {
      legalConsentTimestamp: new Date().toISOString(),
    });
  }

  public async fetchGeneralGoodsAccountCredentials(): Promise<GeneralGoodsAccountStub> {
    const encryptionKey = await this.fetchEncryptionKey();
    const integrationData = await this.fetchGeneralGoodsIntegrationData();

    const password = await this.cryptoService.decryptUsingKey(
      integrationData.encryptedPassword,
      encryptionKey,
    );

    return {
      email: integrationData.email,
      password,
      integrationType: integrationData.integrationType,
    };
  }

  public async fetchGeneralGoodsAuthToken() {
    const encryptionKey = await this.fetchEncryptionKey();
    const integrationData = await this.fetchGeneralGoodsIntegrationData();

    const password = await this.cryptoService.decryptUsingKey(
      integrationData.encryptedPassword,
      encryptionKey,
    );

    await this.generalGoodsService.login({
      email: integrationData.email,
      password,
    });
  }

  async deleteGeneralGoodsIntegrationData() {
    await this.firebaseService.deleteFirestoreDocument(
      this.getGeneralGoodsIntegrationDataDocumentPath(),
    );
    await this.googleDriveService.deleteFile(this.ENCRYPTION_KEY_FILE_NAME);
  }

  async deleteAccount() {
    await this.deleteGeneralGoodsIntegrationData();
    await this.firebaseService.deleteFirestoreDocument(
      this.getUserDocumentPath(),
    );
    await this.firebaseService.deleteAccount();
  }

  private async fetchEncryptionKey(fileId?: string): Promise<JsonWebKey> {
    const encrytionKeyFileId =
      fileId ?? (await this.fetchEncryptionKeyFileId());

    if (!encrytionKeyFileId) {
      throw new Error('EncryptionKeyNotFound');
    }

    const encryptionKeyBlob =
      await this.googleDriveService.downloadFile(encrytionKeyFileId);
    const encryptionKey = JSON.parse(
      await encryptionKeyBlob.text(),
    ) as JsonWebKey;
    return encryptionKey;
  }

  private async fetchEncryptionKeyFileId(): Promise<string | undefined> {
    const fileList = await this.googleDriveService.listAppDataFiles();
    const encrytionKeyFileId = fileList.files.find(
      (file) => file.name === this.ENCRYPTION_KEY_FILE_NAME,
    )?.id;

    return encrytionKeyFileId;
  }

  private async uploadEncryptionKey(encryptionKey: JsonWebKey) {
    const encryptionKeyBlob = new Blob([JSON.stringify(encryptionKey)]);
    await this.googleDriveService.uploadFileToAppData(
      this.ENCRYPTION_KEY_FILE_NAME,
      encryptionKeyBlob,
    );
  }

  private async fetchOrCreateEncryptionKey(): Promise<JsonWebKey> {
    const encryptionKeyFileId = await this.fetchEncryptionKeyFileId();

    if (encryptionKeyFileId) {
      return await this.fetchEncryptionKey(encryptionKeyFileId);
    } else {
      const encryptionKey = await this.cryptoService.generateKey();
      await this.uploadEncryptionKey(encryptionKey);
      return encryptionKey;
    }
  }

  private async commitGeneralGoodsIntegrationData(
    stub: GeneralGoodsAccountStub,
  ) {
    const encryptionKey = await this.fetchOrCreateEncryptionKey();

    const encryptedPassword = await this.cryptoService.encryptUsingKey(
      stub.password,
      encryptionKey,
    );

    const generalGoodsIntegrationData: GeneralGoodsIntegrationData = {
      encryptedPassword,
      email: stub.email,
      integrationType: stub.integrationType,
      integrationCompleted: false,
    };

    await this.firebaseService.setFirestoreDocument(
      this.getGeneralGoodsIntegrationDataDocumentPath(),
      generalGoodsIntegrationData,
    );
  }

  private async markGeneralGoodsIntegrationAsCompleted() {
    await this.firebaseService.updateFirestoreDocument(
      this.getGeneralGoodsIntegrationDataDocumentPath(),
      { integrationCompleted: true },
    );
  }

  private async fetchGeneralGoodsIntegrationData(): Promise<
    Required<GeneralGoodsIntegrationData>
  > {
    const integrationData =
      await this.firebaseService.getFirestoreDocument<GeneralGoodsIntegrationData>(
        this.getGeneralGoodsIntegrationDataDocumentPath(),
      );

    if (
      !integrationData ||
      !this.integrationDataHasAllFields(integrationData)
    ) {
      throw new Error('GeneralGoodsIntegrationDataMissing');
    }

    return integrationData as Required<GeneralGoodsIntegrationData>;
  }

  public async fetchGeneralGoodsIntegrationStatus(): Promise<
    Required<GeneralGoodsIntegrationStatus>
  > {
    const { integrationType, integrationCompleted } =
      await this.fetchGeneralGoodsIntegrationData();

    return {
      integrationCompleted,
      integrationType,
    };
  }

  private getUserDocumentPath(): string {
    const user = this.ensureCurrentUser();
    return `users/${user.uid}`;
  }

  private getGeneralGoodsIntegrationDataDocumentPath(): string {
    const userDocumentPath = this.getUserDocumentPath();
    return `${userDocumentPath}/integrations/general-goods`;
  }

  private extractTokenFromUserCredential(
    userCredential: unknown,
  ): string | undefined {
    return (
      userCredential as {
        _tokenResponse?: {
          oauthAccessToken: string;
        };
      }
    )?.['_tokenResponse']?.oauthAccessToken;
  }

  private ensureCurrentUser(): User {
    const user = this.currentUser();

    if (!user) {
      throw new Error('UserNotLoggedIn');
    }

    if (!this.userHasAllFields(user)) {
      throw new Error('RequiredUserDataMissing');
    }

    return user;
  }

  private userHasAllFields(user: User): user is Required<User> {
    return (
      user.displayName != null && user.email != null && user.photoUrl != null
    );
  }

  private integrationDataHasAllFields(
    integrationData: GeneralGoodsIntegrationData,
  ): integrationData is Required<GeneralGoodsIntegrationData> {
    return (
      integrationData.encryptedPassword != null &&
      integrationData.email != null &&
      integrationData.integrationType != null &&
      integrationData.integrationCompleted != null
    );
  }
}

export interface GeneralGoodsIntegrationStatus {
  integrationType?: GeneralGoodsIntegrationType;
  integrationCompleted?: boolean;
}

interface GeneralGoodsIntegrationData extends GeneralGoodsIntegrationStatus {
  encryptedPassword?: SerializedEncryptedObject;
  email?: string;
  integrationType?: GeneralGoodsIntegrationType;
  integrationCompleted?: boolean;
}

export interface GeneralGoodsAccountStub {
  email: string;
  password: string;
  integrationType: GeneralGoodsIntegrationType;
}

export interface User {
  displayName?: string | null;
  email?: string | null;
  photoUrl?: string | null;
  uid: string;
}

export enum GeneralGoodsIntegrationType {
  NewAccount = 'new-account',
  ExistingAccount = 'existing-account',
}
