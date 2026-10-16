import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { auth } from './firebase';

// Только для вошедших (с подтверждённой почтой)
export const authGuard: CanActivateFn = async () => {
  const router = inject(Router);
  await auth.authStateReady();
  const user = auth.currentUser;
  return user && user.emailVerified ? true : router.createUrlTree(['/login']);
};

// Только для гостей: вошедшего отправляем на главную
export const guestGuard: CanActivateFn = async () => {
  const router = inject(Router);
  await auth.authStateReady();
  return auth.currentUser?.emailVerified ? router.createUrlTree(['/home']) : true;
};