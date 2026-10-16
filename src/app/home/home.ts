import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
})
export class Home {
  private authService = inject(AuthService);
  private router = inject(Router);

  user = this.authService.currentUser;

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}