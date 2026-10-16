import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Register } from './register/register';
import { Chat } from './chat/chat';
import { authGuard, guestGuard } from './guards';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: 'register', component: Register, canActivate: [guestGuard] },
  { path: 'home', component: Chat, canActivate: [authGuard] },
  { path: '**', redirectTo: 'home' },
];