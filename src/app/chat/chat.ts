import { Component, ElementRef, HostListener, inject, signal, viewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth';
import { AgentService } from '../agent';
import { HistoryService } from '../history';
import { I18nService, Lang } from '../i18n';
import { LangSwitcher } from '../lang-switcher';
import { extractPdfText } from '../pdf';
import { TestResult, extractResult } from '../result';

interface Message {
  role: 'user' | 'bot';
  text: string;
}

type Mode = 'resources' | 'notes' | 'quiz';

const MIN_CHARS = 500;
const MAX_CHARS = 40000;
const MAX_FILE_MB = 10;

const SHORT_RULE =
  'Если в документе слишком мало информации для качественного ответа, прямо напиши об этом и не придумывай лишнего.';

const LANG_RULE: Record<Lang, string> = {
  ru: 'Отвечай на русском языке.',
  kk: 'Отвечай строго на казахском языке (кроме служебного блока результата: он всегда содержит обе версии, русскую и казахскую).',
};

const RESULT_RULE =
  'Блок результата: только после того, как я отвечу на последний вопрос и ты дашь общий вывод, в самом конце этого ответа добавь на отдельной строке служебный блок строго в формате: [[RESULT]]{"score":число верных ответов,"total":число вопросов,"ru":{"topic":"тема","summary":"вывод об уровне знаний в 1-2 предложения","strengths":["..."],"weaknesses":["..."],"recommendations":["..."]},"kk":{"topic":"тема","summary":"вывод","strengths":["..."],"weaknesses":["..."],"recommendations":["..."]}}[[/RESULT]] Правила: блок всегда содержит обе версии независимо от языка ответа: в "ru" всё по-русски, в "kk" всё по-казахски, смысл и количество пунктов одинаковые; topic это тема материала (например, «Основы C++»), а не название файла; в каждом списке 2-4 коротких конкретных пункта, основанных на моих ответах; если сильных сторон нет, оставь пустой список; не используй двойные кавычки внутри текста; весь блок в одну строку, без markdown; не добавляй его в промежуточных ответах и не упоминай в тексте.';

  
const PROMPTS: Record<Mode, string> = {
  resources:
    'Порекомендуй ресурсы для дальнейшего изучения темы документа: книги, курсы, статьи, видео, сайты. Для каждого коротко объясни, чем он полезен. Не выдумывай несуществующие ресурсы и ссылки: если не уверен в точном названии, назови тему или поисковый запрос.',
  notes:
    'Составь структурированный конспект документа: ключевые понятия, определения, главные идеи, примеры. Используй заголовки и списки. Опирайся только на содержимое документа.',
  quiz:
    'Проверь мои знания по документу. Задай ровно 5 вопросов разной сложности, только по содержимому документа. Задавай вопросы строго по одному: сейчас напиши только первый вопрос и дождись моего ответа. После каждого моего ответа коротко скажи, верно ли я ответил (если нет, дай правильный ответ одним предложением) и сразу задай следующий вопрос. Не показывай следующие вопросы заранее. Нумеруй их в формате «Вопрос 1 из 5». Когда я отвечу на пятый вопрос, дай общий вывод об уровне знаний. ' +
    RESULT_RULE,
};

@Component({
  selector: 'app-chat',
  imports: [FormsModule, DatePipe, LangSwitcher],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat {
  private authService = inject(AuthService);
  private agent = inject(AgentService);
  private history = inject(HistoryService);
  private router = inject(Router);
  i18n = inject(I18nService);

  user = this.authService.currentUser;
  messagesEl = viewChild<ElementRef<HTMLDivElement>>('messagesEl');

  messages = signal<Message[]>([]);
  typing = signal(false);
  doc = signal<{ name: string; text: string } | null>(null);
  draft = '';

  menuOpen = signal(false);
  view = signal<'chat' | 'progress' | 'profile'>('chat');
  results = signal<TestResult[]>([]);

  currentPassword = '';
  newPassword = '';
  repeatPassword = '';
  profileError = signal('');
  profileInfo = signal('');
  profileLoading = signal(false);

  constructor() {
    this.loadHistory();
  }

  private async loadHistory() {
    try {
      this.results.set(await this.history.load());
    } catch (e) {
      console.error('Не удалось загрузить историю', e);
    }
  }

  async send() {
    const text = this.draft.trim();
    if (!text || this.typing()) return;
    this.draft = '';
    await this.ask(text, text);
  }

  async onFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file || this.typing()) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      this.addBot(this.i18n.t('pdf.notPdf'));
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      this.addBot(this.i18n.t('pdf.tooBig', { mb: MAX_FILE_MB }));
      return;
    }

    this.doc.set(null);
    this.messages.update((m) => [...m, { role: 'user', text: `📄 ${file.name}` }]);
    this.typing.set(true);
    this.scrollDown();

    try {
      const { text, pages } = await extractPdfText(file);

      if (text.length < MIN_CHARS) {
        this.addBot(this.i18n.t('pdf.tooShort'));
      } else {
        const truncated = text.length > MAX_CHARS;
        this.doc.set({ name: file.name, text: text.slice(0, MAX_CHARS) });
        this.addBot(
          this.i18n.t('pdf.loaded', {
            pages,
            note: truncated ? this.i18n.t('pdf.truncated') : '',
          }),
        );
      }
    } catch {
      this.addBot(this.i18n.t('pdf.readError'));
    } finally {
      this.typing.set(false);
      this.scrollDown();
    }
  }

  async runMode(mode: Mode) {
    const d = this.doc();
    if (!d || this.typing()) return;
    const langRule = LANG_RULE[this.i18n.lang()];
    const full = `${PROMPTS[mode]}\n${SHORT_RULE}\n${langRule}\n\nДокумент «${d.name}»:\n${d.text}`;
    await this.ask(full, this.i18n.t('mode.' + mode));
  }

  toggleMenu(event: Event) {
    event.stopPropagation();
    this.menuOpen.update((v) => !v);
  }

  @HostListener('document:click')
  @HostListener('document:keydown.escape')
  closeMenu() {
    this.menuOpen.set(false);
  }

  openProgress() {
    this.view.set('progress');
    this.menuOpen.set(false);
  }

  openChat() {
    this.view.set('chat');
    this.scrollDown();
  }

  openProfile() {
    this.currentPassword = '';
    this.newPassword = '';
    this.repeatPassword = '';
    this.profileError.set('');
    this.profileInfo.set('');
    this.view.set('profile');
    this.menuOpen.set(false);
  }

  async changePassword() {
    this.profileError.set('');
    this.profileInfo.set('');

    if (this.newPassword.length < 6) {
      this.profileError.set('pw.short');
      return;
    }
    if (this.newPassword !== this.repeatPassword) {
      this.profileError.set('pw.mismatch');
      return;
    }
    if (this.newPassword === this.currentPassword) {
      this.profileError.set('pw.same');
      return;
    }

    this.profileLoading.set(true);
    try {
      await this.authService.changePassword(this.currentPassword, this.newPassword);
      this.profileInfo.set('pw.success');
      this.currentPassword = '';
      this.newPassword = '';
      this.repeatPassword = '';
    } catch (e) {
      this.profileError.set(this.passwordErrorKey(e));
    } finally {
      this.profileLoading.set(false);
    }
  }

  private passwordErrorKey(e: unknown): string {
    const code = (e as { code?: string }).code;
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
        return 'pw.wrongCurrent';
      case 'auth/weak-password':
        return 'pw.weak';
      case 'auth/too-many-requests':
        return 'err.tooMany';
      default:
        return 'pw.failed';
    }
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }

  private async ask(sent: string, shown: string) {
    this.messages.update((m) => [...m, { role: 'user', text: shown }]);
    this.typing.set(true);
    this.scrollDown();

    try {
      const reply = await this.agent.ask(sent);
      const { text, result } = extractResult(reply);
      this.addBot(text);
      if (result) {
        this.results.update((list) => [result, ...list]);
        this.history
          .save(result)
          .catch((e) => console.error('Не удалось сохранить результат', e));
      }
    } catch {
      this.addBot(this.i18n.t('chat.error'));
    } finally {
      this.typing.set(false);
      this.scrollDown();
    }
  }

  private addBot(text: string) {
    this.messages.update((m) => [...m, { role: 'bot', text }]);
  }

  private scrollDown() {
    setTimeout(() => {
      const el = this.messagesEl()?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }
}