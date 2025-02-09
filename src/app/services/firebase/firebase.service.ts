import { Injectable, Signal, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import {
  Auth,
  CustomParameters,
  GoogleAuthProvider,
  UserCredential,
  UserInfo,
  signInWithPopup,
  user,
} from '@angular/fire/auth';
import {
  Firestore,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
} from '@angular/fire/firestore';

import { environment } from '@rusbe/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);

  public readonly currentUser: Signal<UserInfo | null | undefined> = toSignal(
    user(this.auth),
  );
  public readonly isLoggedIn: Signal<boolean | undefined> = computed(() => {
    if (this.currentUser() === undefined) {
      return undefined;
    }

    return Boolean(this.currentUser());
  });

  public async signInWithPopup(
    options: { suggestSameUser: boolean } = {
      suggestSameUser: false,
    },
  ): Promise<UserCredential> {
    const provider = new GoogleAuthProvider();
    const authCustomParameters: CustomParameters = {
      hd: environment.accountMailDomain,
    };

    const currentUser = this.currentUser();
    if (options.suggestSameUser && currentUser?.email) {
      authCustomParameters['login_hint'] = currentUser.email;
    }

    provider.addScope('https://www.googleapis.com/auth/drive.appdata');
    provider.setCustomParameters(authCustomParameters);
    return await signInWithPopup(this.auth, provider);
  }

  public async signOut() {
    await this.auth.signOut();
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

  public async updateFirestoreDocument(path: string, data: unknown) {
    try {
      const documentReference = doc(this.firestore, path);
      await setDoc(documentReference, data as Partial<unknown>, {
        merge: true,
      });
    } catch {
      throw new Error('FirestoreDocumentUpdateError');
    }
  }

  public async deleteFirestoreDocument(path: string) {
    try {
      const documentReference = doc(this.firestore, path);
      await deleteDoc(documentReference);
    } catch {
      throw new Error('FirestoreDocumentDeleteError');
    }
  }

  public async deleteAccount() {
    try {
      await this.auth.currentUser?.delete();
    } catch {
      throw new Error('FirebaseAccountDeleteError');
    }
  }
}
