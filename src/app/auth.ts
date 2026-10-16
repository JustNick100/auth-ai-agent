import { Injectable, signal } from '@angular/core';
import {
  EmailAuthProvider,
  User,
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<User | null>(null);

  constructor() {
    onAuthStateChanged(auth, (user) => this.currentUser.set(user));
  }

  async register(username: string, email: string, password: string): Promise<void> {
    const name = username.trim();
    const key = name.toLowerCase();

    if (!/^[a-z0-9_]{3,20}$/.test(key)) {
      throw new Error('invalid-username');
    }

    const taken = await getDoc(doc(db, 'usernames', key));
    if (taken.exists()) {
      throw new Error('username-taken');
    }

    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const user = cred.user;

    try {
      await runTransaction(db, async (tx) => {
        const nameRef = doc(db, 'usernames', key);
        if ((await tx.get(nameRef)).exists()) {
          throw new Error('username-taken');
        }
        tx.set(nameRef, { uid: user.uid });
        tx.set(doc(db, 'users', user.uid), {
          username: name,
          email: user.email,
          createdAt: serverTimestamp(),
        });
      });
    } catch (e) {
      await deleteUser(user);
      throw e;
    }

    await updateProfile(user, { displayName: name });
    await sendEmailVerification(user);
    await signOut(auth);
  }

  async login(email: string, password: string): Promise<void> {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    if (!cred.user.emailVerified) {
      await signOut(auth);
      throw new Error('email-not-verified');
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error('not-authenticated');
    }
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
  }

  logout(): Promise<void> {
    return signOut(auth);
  }
}

