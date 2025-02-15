import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CryptoService {
  public generateRandomPassword(
    passwordLength = DEFAULT_GENERATED_PASSWORD_LENGTH,
  ): string {
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
  ): Promise<SerializedEncryptedObject> {
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

    const encryptedObject: EncryptedObject = {
      data: encryptedData,
      iv,
    };

    return this.serializeEncryptedObject(encryptedObject);
  }

  public async decryptUsingKey(
    serializedEncryptedObject: SerializedEncryptedObject,
    jwk: JsonWebKey,
  ): Promise<string> {
    const key = await this.importKey(jwk);
    const encryptedObject = this.deserializeEncryptedObject(
      serializedEncryptedObject,
    );

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

  private serializeEncryptedObject(
    encryptedObject: EncryptedObject,
  ): SerializedEncryptedObject {
    return {
      data: this.arrayBufferToBase64(encryptedObject.data),
      iv: this.arrayBufferToBase64(encryptedObject.iv),
    };
  }

  private deserializeEncryptedObject(
    serializedEncryptedObject: SerializedEncryptedObject,
  ): EncryptedObject {
    return {
      data: this.base64ToArrayBuffer(serializedEncryptedObject.data),
      iv: new Uint8Array(
        this.base64ToArrayBuffer(serializedEncryptedObject.iv),
      ),
    };
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
}

interface EncryptedObject {
  data: ArrayBuffer;
  iv: Uint8Array;
}

export interface SerializedEncryptedObject {
  data: string;
  iv: string;
}

export const DEFAULT_GENERATED_PASSWORD_LENGTH = 32;
