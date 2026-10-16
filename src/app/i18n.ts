import { Injectable, signal } from '@angular/core';

export type Lang = 'ru' | 'kk';

const STORAGE_KEY = 'lang';

const DICT: Record<Lang, Record<string, string>> = {
  ru: {
    'hero.title': 'ИИ-агент NavIQ',
    'hero.text': 'ИИ-агент, помогающий в учёбе',

    'login.title': 'Вход',
    'login.subtitle': 'Войдите в свой аккаунт',
    'login.email': 'Email',
    'login.password': 'Пароль',
    'login.submit': 'Войти',
    'login.noAccount': 'Нет аккаунта?',
    'login.toRegister': 'Зарегистрироваться',

    'reg.title': 'Регистрация',
    'reg.subtitle': 'Создайте новый аккаунт',
    'reg.username': 'Имя пользователя',
    'reg.email': 'Email',
    'reg.password': 'Пароль (минимум 6 символов)',
    'reg.submit': 'Зарегистрироваться',
    'reg.haveAccount': 'Уже есть аккаунт?',
    'reg.toLogin': 'Войти',
    'reg.success':
      'Аккаунт создан! Мы отправили письмо со ссылкой подтверждения на вашу почту. Подтвердите её и затем войдите.',

    'err.emailNotVerified': 'Почта не подтверждена. Перейдите по ссылке из письма и войдите снова.',
    'err.invalidCredentials': 'Неверная почта или пароль.',
    'err.userDisabled': 'Этот аккаунт отключён.',
    'err.tooMany': 'Слишком много попыток. Попробуйте позже.',
    'err.loginFailed': 'Не удалось войти. Попробуйте ещё раз.',
    'err.invalidUsername': 'Имя: 3–20 символов, только латиница, цифры и «_».',
    'err.usernameTaken': 'Это имя пользователя уже занято.',
    'err.emailInUse': 'Эта почта уже зарегистрирована.',
    'err.invalidEmail': 'Некорректный email.',
    'err.weakPassword': 'Слишком простой пароль (минимум 6 символов).',
    'err.registerFailed': 'Не удалось зарегистрироваться. Попробуйте ещё раз.',

    'menu.profile': 'Мой профиль',
    'menu.progress': 'Трекинг прогресса',
    'menu.logout': 'Выйти',

    'chat.title': 'ИИ-агент',
    'chat.online': 'онлайн',
    'chat.greeting': 'Привет! Я ИИ-агент. Напишите сообщение или загрузите PDF (кнопка 📎).',
    'chat.attach': 'Загрузить PDF',
    'chat.placeholder': 'Напишите сообщение...',
    'chat.error': 'Не удалось получить ответ. Попробуйте ещё раз.',

    'mode.resources': '📚 Рекомендовать ресурсы',
    'mode.notes': '📝 Написать конспект',
    'mode.quiz': '❓ Проверить знания',

    'pdf.notPdf': 'Нужен файл в формате PDF.',
    'pdf.tooBig': 'Файл слишком большой (максимум {mb} МБ).',
    'pdf.tooShort':
      'В этом документе слишком мало информации (или это скан без текстового слоя), поэтому качественно разобрать его не получится. Загрузите документ побольше или такой, где текст можно выделить мышкой.',
    'pdf.loaded': 'Документ загружен ({pages} стр.).{note} Что сделать?',
    'pdf.truncated': ' Он большой, поэтому я буду использовать только первую часть.',
    'pdf.readError': 'Не удалось прочитать PDF. Возможно, файл повреждён или защищён паролем.',

    'back': '← К чату',

    'progress.title': 'Трекинг прогресса',
    'progress.subtitle': 'История пройденных тестов',
    'progress.empty1': 'Пока нет пройденных тестов.',
    'progress.empty2': 'Попросите агента проверить ваши знания, и результат появится здесь.',
    'result.score': 'Результат: {score} из {total}',
    'result.strengths': '💪 Сильные стороны',
    'result.weaknesses': '⚠️ Слабые стороны',
    'result.recommendations': '💡 Рекомендации',

    'profile.title': 'Мой профиль',
    'profile.subtitle': 'Управление аккаунтом',
    'profile.data': 'Данные аккаунта',
    'profile.username': 'Имя пользователя',
    'profile.email': 'Email',
    'profile.passwordTitle': 'Смена пароля',
    'profile.current': 'Текущий пароль',
    'profile.new': 'Новый пароль (минимум 6 символов)',
    'profile.repeat': 'Повторите новый пароль',
    'profile.submit': 'Сменить пароль',

    'pw.short': 'Новый пароль должен быть не короче 6 символов.',
    'pw.mismatch': 'Новые пароли не совпадают.',
    'pw.same': 'Новый пароль должен отличаться от текущего.',
    'pw.success': 'Пароль успешно изменён.',
    'pw.wrongCurrent': 'Текущий пароль указан неверно.',
    'pw.weak': 'Слишком простой пароль.',
    'pw.failed': 'Не удалось изменить пароль. Попробуйте ещё раз.',
  },

  kk: {
    'hero.title': 'ЖИ-агент NavIQ',
    'hero.text': 'Оқуға көмектесетін ЖИ-агент',

    'login.title': 'Кіру',
    'login.subtitle': 'Аккаунтыңызға кіріңіз',
    'login.email': 'Email',
    'login.password': 'Құпия сөз',
    'login.submit': 'Кіру',
    'login.noAccount': 'Аккаунтыңыз жоқ па?',
    'login.toRegister': 'Тіркелу',

    'reg.title': 'Тіркелу',
    'reg.subtitle': 'Жаңа аккаунт жасаңыз',
    'reg.username': 'Пайдаланушы аты',
    'reg.email': 'Email',
    'reg.password': 'Құпия сөз (кемінде 6 таңба)',
    'reg.submit': 'Тіркелу',
    'reg.haveAccount': 'Аккаунтыңыз бар ма?',
    'reg.toLogin': 'Кіру',
    'reg.success':
      'Аккаунт жасалды! Растау сілтемесі бар хатты поштаңызға жібердік. Поштаны растап, содан кейін кіріңіз.',

    'err.emailNotVerified': 'Пошта расталмаған. Хаттағы сілтеме арқылы өтіп, қайта кіріңіз.',
    'err.invalidCredentials': 'Пошта немесе құпия сөз қате.',
    'err.userDisabled': 'Бұл аккаунт өшірілген.',
    'err.tooMany': 'Әрекет тым көп. Кейінірек қайталап көріңіз.',
    'err.loginFailed': 'Кіру мүмкін болмады. Қайтадан көріңіз.',
    'err.invalidUsername': 'Аты: 3–20 таңба, тек латын әріптері, сандар және «_».',
    'err.usernameTaken': 'Бұл пайдаланушы аты бос емес.',
    'err.emailInUse': 'Бұл пошта бұрын тіркелген.',
    'err.invalidEmail': 'Email дұрыс емес.',
    'err.weakPassword': 'Құпия сөз тым оңай (кемінде 6 таңба).',
    'err.registerFailed': 'Тіркелу мүмкін болмады. Қайтадан көріңіз.',

    'menu.profile': 'Менің профилім',
    'menu.progress': 'Прогресті бақылау',
    'menu.logout': 'Шығу',

    'chat.title': 'ЖИ-агент',
    'chat.online': 'онлайн',
    'chat.greeting': 'Сәлем! Мен ЖИ-агентпін. Хабарлама жазыңыз немесе PDF жүктеңіз (📎 түймесі).',
    'chat.attach': 'PDF жүктеу',
    'chat.placeholder': 'Хабарлама жазыңыз...',
    'chat.error': 'Жауап алу мүмкін болмады. Қайтадан көріңіз.',

    'mode.resources': '📚 Ресурстар ұсыну',
    'mode.notes': '📝 Конспект жазу',
    'mode.quiz': '❓ Білімді тексеру',

    'pdf.notPdf': 'PDF форматындағы файл керек.',
    'pdf.tooBig': 'Файл тым үлкен (ең көбі {mb} МБ).',
    'pdf.tooShort':
      'Бұл құжатта ақпарат тым аз (немесе мәтіні жоқ скан), сондықтан оны сапалы талдау мүмкін емес. Үлкенірек құжатты немесе мәтінін тінтуірмен белгілеуге болатын құжатты жүктеңіз.',
    'pdf.loaded': 'Құжат жүктелді ({pages} бет).{note} Не істейміз?',
    'pdf.truncated': ' Ол үлкен, сондықтан тек бірінші бөлігін қолданамын.',
    'pdf.readError': 'PDF-ті оқу мүмкін болмады. Файл бүлінген немесе құпия сөзбен қорғалған болуы мүмкін.',

    'back': '← Чатқа оралу',

    'progress.title': 'Прогресті бақылау',
    'progress.subtitle': 'Өткен тесттер тарихы',
    'progress.empty1': 'Әзірге өткен тесттер жоқ.',
    'progress.empty2': 'Агенттен білімді тексеруді сұраңыз, нәтиже осында көрінеді.',
    'result.score': 'Нәтиже: {total} ішінен {score}',
    'result.strengths': '💪 Күшті жақтары',
    'result.weaknesses': '⚠️ Әлсіз жақтары',
    'result.recommendations': '💡 Ұсыныстар',

    'profile.title': 'Менің профилім',
    'profile.subtitle': 'Аккаунтты басқару',
    'profile.data': 'Аккаунт деректері',
    'profile.username': 'Пайдаланушы аты',
    'profile.email': 'Email',
    'profile.passwordTitle': 'Құпия сөзді өзгерту',
    'profile.current': 'Ағымдағы құпия сөз',
    'profile.new': 'Жаңа құпия сөз (кемінде 6 таңба)',
    'profile.repeat': 'Жаңа құпия сөзді қайталаңыз',
    'profile.submit': 'Құпия сөзді өзгерту',

    'pw.short': 'Жаңа құпия сөз кемінде 6 таңбадан тұруы керек.',
    'pw.mismatch': 'Жаңа құпия сөздер сәйкес келмейді.',
    'pw.same': 'Жаңа құпия сөз ағымдағыдан өзгеше болуы керек.',
    'pw.success': 'Құпия сөз сәтті өзгертілді.',
    'pw.wrongCurrent': 'Ағымдағы құпия сөз қате көрсетілген.',
    'pw.weak': 'Құпия сөз тым оңай.',
    'pw.failed': 'Құпия сөзді өзгерту мүмкін болмады. Қайтадан көріңіз.',
  },
};

@Injectable({ providedIn: 'root' })
export class I18nService {
  lang = signal<Lang>(this.initial());

  constructor() {
    document.documentElement.lang = this.lang();
  }

  private initial(): Lang {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'ru' || saved === 'kk') return saved;
    } catch {
      // хранилище недоступно, берём язык по умолчанию
    }
    return 'ru';
  }

  setLang(lang: Lang) {
    this.lang.set(lang);
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // не страшно, язык просто не запомнится
    }
  }

  t(key: string, params?: Record<string, string | number>): string {
    let text = DICT[this.lang()][key] ?? DICT.ru[key] ?? key;
    if (params) {
      for (const [name, value] of Object.entries(params)) {
        text = text.replaceAll(`{${name}}`, String(value));
      }
    }
    return text;
  }
}