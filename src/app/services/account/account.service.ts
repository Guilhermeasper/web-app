import { Injectable, inject } from '@angular/core';

import { CryptoService, EncryptedObject } from '../crypto/crypto.service';
import { FirebaseService } from '../firebase/firebase.service';
import { GeneralGoodsService } from '../general-goods/general-goods.service';
import { GoogleDriveService } from '../google-drive/google-drive.service';

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

  public async signInWithPopup() {
    const userCredential = await this.firebaseService.signInWithPopup();

    const token = (
      userCredential.user as unknown as { accessToken: string } | null
    )?.accessToken;

    if (token) {
      this.googleDriveService.cacheToken(token);
    }
  }

  get currentUser(): Promise<User | null> {
    return new Promise((resolve) => {
      (async () => {
        const firebaseUser = await this.firebaseService.currentUser;

        if (!firebaseUser) {
          resolve(null);
          return;
        }

        resolve({
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoUrl: firebaseUser.photoURL,
          uid: firebaseUser.uid,
        });
      })();
    });
  }

  get isLoggedIn(): Promise<boolean> {
    return new Promise((resolve) => {
      (async () => {
        resolve(await this.firebaseService.isLoggedIn);
      })();
    });
  }

  public async signOut() {
    await this.firebaseService.signOut();
  }

  public async setupNewGeneralGoodsAccount(identifier: string) {
    const user = await this.currentUser;

    if (!user) {
      throw new Error('UserNotLoggedIn');
    }

    if (!this.userHasAllFields(user)) {
      throw new Error('RequiredUserDataMissing');
    }

    const password = this.cryptoService.generateRandomPassword();

    try {
      await this.generalGoodsService.registerAccount({
        email: user.email!,
        identifier,
        password,
      });
    } catch {
      throw new Error('GeneralGoodsAccountCreationFailed');
      // TODO: Distinguish between different errors (e.g. account already exists)
    }

    let encryptionKey: JsonWebKey;

    try {
      encryptionKey = await this.getEncryptionKey();
    } catch {
      // TODO: Move this to a function
      encryptionKey = await this.cryptoService.generateKey();
      this.googleDriveService.uploadFileToAppData(
        this.ENCRYPTION_KEY_FILE_NAME,
        new Blob([JSON.stringify(encryptionKey)]),
      );
    }

    const encryptedPassword = await this.cryptoService.encryptUsingKey(
      password,
      encryptionKey,
    );

    // TODO: Move this to a function
    const generalGoodsIntegrationData: GeneralGoodsIntegrationData = {
      encryptedPassword,
      personId: identifier,
      email: user.email!,
    };

    await this.firebaseService.setFirestoreDocument(
      `users/${user.uid}/integrations/general-goods`,
      generalGoodsIntegrationData,
    );
  }

  public async setupExistingGeneralGoodsAccount(
    identifier: string,
    email: string,
  ) {
    throw new Error(`NotImplemented ${identifier} ${email}`);
    // TODO: Check if token is actually working (does the user need to confirm the email? does the password need to be reset?)
  }

  public async getGeneralGoodsAuthToken() {
    const integrationData = await this.getGeneralGoodsIntegrationData();
    const encryptionKey = await this.getEncryptionKey();

    const password = await this.cryptoService.decryptUsingKey(
      integrationData.encryptedPassword,
      encryptionKey,
    );

    this.generalGoodsService.login({
      email: integrationData.email,
      password,
    });
  }

  private async getEncryptionKey(): Promise<JsonWebKey> {
    // TODO: Test if Google Drive token needs to be refreshed

    const fileList = await this.googleDriveService.listAppDataFiles();
    const encrytionKeyFileId = fileList.files.find(
      (file) => file.name === this.ENCRYPTION_KEY_FILE_NAME,
    )?.id;

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

  private async getGeneralGoodsIntegrationData(): Promise<
    Required<GeneralGoodsIntegrationData>
  > {
    const user = await this.currentUser;

    if (!user) {
      throw new Error('UserNotLoggedIn');
    }

    if (!this.userHasAllFields(user)) {
      throw new Error('RequiredUserDataMissing');
    }

    const integrationData =
      await this.firebaseService.getFirestoreDocument<GeneralGoodsIntegrationData>(
        `users/${user.uid}/integrations/general-goods`,
      );

    if (integrationData && !this.integrationDataHasAllFields(integrationData)) {
      throw new Error('GeneralGoodsDataMissing');
    }

    return integrationData as Required<GeneralGoodsIntegrationData>;
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
      integrationData.personId != null &&
      integrationData.email != null
    );
  }
}

interface GeneralGoodsIntegrationData {
  encryptedPassword?: EncryptedObject;
  personId?: string;
  email?: string;
}

export interface User {
  displayName?: string | null;
  email?: string | null;
  photoUrl?: string | null;
  uid: string;
}
