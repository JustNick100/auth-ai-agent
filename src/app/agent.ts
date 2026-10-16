import { Injectable } from '@angular/core';
import { auth } from './firebase';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class AgentService {
  async ask(message: string): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error('not-authenticated');

    const token = await user.getIdToken();

    const res = await fetch(environment.n8nWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, token }),
    });
    if (!res.ok) throw new Error('agent-error');

    const data = await res.json();
    return data.reply;
  }
}