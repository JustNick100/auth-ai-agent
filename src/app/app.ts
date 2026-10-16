import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { auth } from './firebase';


@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('auth-app');
  constructor() {
    console.log('Firebase project:', auth.app.options.projectId);
  }
}
