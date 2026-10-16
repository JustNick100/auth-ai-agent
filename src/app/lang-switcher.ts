import { Component, inject } from '@angular/core';
import { I18nService } from './i18n';

@Component({
  selector: 'app-lang-switcher',
  template: `
    <div class="lang">
      <button [class.active]="i18n.lang() === 'kk'" (click)="i18n.setLang('kk')">ҚАЗ</button>
      <button [class.active]="i18n.lang() === 'ru'" (click)="i18n.setLang('ru')">РУС</button>
    </div>
  `,
  styles: [
    `
      .lang {
        display: inline-flex;
        padding: 3px;
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        background: rgba(255, 255, 255, 0.08);
      }
      button {
        padding: 6px 12px;
        border: none;
        border-radius: 999px;
        background: none;
        color: #cbd5e1;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s, color 0.15s;
      }
      button:hover { color: #fff; }
      button.active {
        background: linear-gradient(135deg, #6366f1, #a855f7);
        color: #fff;
      }
    `,
  ],
})
export class LangSwitcher {
  i18n = inject(I18nService);
}