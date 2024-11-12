import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CryptoService {
  public generateRandomPassword(passwordLength = 32): string {
    // Based on the code from Hanno Boeck (0BSD license), available at https://password.hboeck.de/.

    if (!Number.isInteger(passwordLength) || passwordLength <= 0) {
      throw new Error('PasswordLengthNotValid');
    }
    const passwordChars =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@*.';

    const limit = 256 - (256 % passwordChars.length);

    let password = '';
    let randomValue;
    for (let i = 0; i < passwordLength; i++) {
      do {
        randomValue = window.crypto.getRandomValues(new Uint8Array(1))[0];
      } while (randomValue >= limit);
      password += passwordChars[randomValue % passwordChars.length];
    }
    return password;
  }

  public async generateKey() {
    const key = await window.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt'],
    );
    return await window.crypto.subtle.exportKey('jwk', key);
  }

  private async importKey(jwk: JsonWebKey): Promise<CryptoKey> {
    return await window.crypto.subtle.importKey(
      'jwk',
      jwk,
      {
        name: 'AES-GCM',
      },
      false,
      ['encrypt', 'decrypt'],
    );
  }

  public async encryptUsingKey(
    data: string,
    jwk: JsonWebKey,
  ): Promise<EncryptedObject> {
    const encodedData = this.encodeText(data);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const key = await this.importKey(jwk);

    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      encodedData,
    );

    return {
      data: encryptedData,
      iv,
    };
  }

  public async decryptUsingKey(
    encryptedObject: EncryptedObject,
    jwk: JsonWebKey,
  ): Promise<string> {
    const key = await this.importKey(jwk);

    const encodedData = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: encryptedObject.iv,
      },
      key,
      encryptedObject.data,
    );

    return await this.decodeText(encodedData);
  }

  public encodeText(text: string): ArrayBuffer {
    return new TextEncoder().encode(text);
  }

  public decodeText(data: ArrayBuffer): string {
    return new TextDecoder().decode(data);
  }
}

export interface EncryptedObject {
  data: ArrayBuffer;
  iv: Uint8Array;
}
