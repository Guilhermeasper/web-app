import { Injectable, Signal, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import {
  Auth,
  GoogleAuthProvider,
  UserCredential,
  UserInfo,
  signInWithPopup,
  user,
} from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';

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
  public readonly isLoggedIn: Signal<boolean> = computed(() => {
    return Boolean(this.currentUser());
  });

  public async signInWithPopup(): Promise<UserCredential> {
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/drive.appdata');
    provider.setCustomParameters({ hd: environment.accountMailDomain });

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
}
