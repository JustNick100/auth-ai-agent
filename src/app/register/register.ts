import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth';
import { I18nService } from '../i18n';
import { LangSwitcher } from '../lang-switcher';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink, LangSwitcher],
  templateUrl: './register.html',
})
export class Register {
  private authService = inject(AuthService);
  i18n = inject(I18nService);

  username = '';
  email = '';
  password = '';

  error = signal('');
  info = signal('');
  loading = signal(false);

  async onSubmit() {
    this.error.set('');
    this.info.set('');
    this.loading.set(true);
    try {
      await this.authService.register(this.username, this.email, this.password);
      this.info.set('reg.success');
      this.username = '';
      this.email = '';
      this.password = '';
    } catch (e) {
      this.error.set(this.toKey(e));
    } finally {
      this.loading.set(false);
    }
  }

  private toKey(e: unknown): string {
    const code = (e as { code?: string }).code ?? (e as Error).message;
    switch (code) {
      case 'invalid-username':
        return 'err.invalidUsername';
      case 'username-taken':
        return 'err.usernameTaken';
      case 'auth/email-already-in-use':
        return 'err.emailInUse';
      case 'auth/invalid-email':
        return 'err.invalidEmail';
      case 'auth/weak-password':
        return 'err.weakPassword';
      case 'auth/too-many-requests':
        return 'err.tooMany';
      default:
        return 'err.registerFailed';
    }
  }
}