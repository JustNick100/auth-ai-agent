import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth';
import { I18nService } from '../i18n';
import { LangSwitcher } from '../lang-switcher';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, LangSwitcher],
  templateUrl: './login.html',
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);
  i18n = inject(I18nService);

  email = '';
  password = '';

  error = signal('');
  loading = signal(false);

  async onSubmit() {
    this.error.set('');
    this.loading.set(true);
    try {
      await this.authService.login(this.email, this.password);
      await this.router.navigate(['/home']);
    } catch (e) {
      this.error.set(this.toKey(e));
    } finally {
      this.loading.set(false);
    }
  }

  private toKey(e: unknown): string {
    const code = (e as { code?: string }).code ?? (e as Error).message;
    switch (code) {
      case 'email-not-verified':
        return 'err.emailNotVerified';
      case 'auth/invalid-credential':
      case 'auth/invalid-email':
        return 'err.invalidCredentials';
      case 'auth/user-disabled':
        return 'err.userDisabled';
      case 'auth/too-many-requests':
        return 'err.tooMany';
      default:
        return 'err.loginFailed';
    }
  }
}