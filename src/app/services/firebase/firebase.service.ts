import { Injectable, inject } from '@angular/core';

import {
  Auth,
  GoogleAuthProvider,
  UserCredential,
  UserInfo,
  signInWithPopup,
  user,
} from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';

import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);

  public async signInWithPopup(): Promise<UserCredential> {
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/drive.appdata');
    provider.setCustomParameters({ hd: environment.accountMailDomain });

    return await signInWithPopup(this.auth, provider);
  }

  public async signOut() {
    await this.auth.signOut();
  }

  public get currentUser(): Promise<UserInfo | null> {
    return firstValueFrom(user(this.auth));
  }

  public get isLoggedIn(): Promise<boolean> {
    return new Promise((resolve) => {
      this.currentUser.then((user) => {
        resolve(Boolean(user));
      });
    });
  }

  public async getFirestoreDocument<T>(path: string): Promise<T | null> {
    try {
      const documentReference = doc(this.firestore, path);
      const documentSnapshot = await getDoc(documentReference);

      if (documentSnapshot.exists()) {
        return documentSnapshot.data() as T;
      }
    } catch {
      throw new Error('FirestoreDocumentGetError');
    }

    return null;
  }

  public async setFirestoreDocument(path: string, data: unknown) {
    try {
      const documentReference = doc(this.firestore, path);
      await setDoc(documentReference, data);
    } catch {
      throw new Error('FirestoreDocumentSetError');
    }
  }
}
