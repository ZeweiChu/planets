export const locales = ['en', 'zh-Hans', 'zh-Hant', 'es', 'fr', 'de', 'ja', 'ko', 'hi', 'ar'] as const;
export type Locale = typeof locales[number];
export const localeNames: Record<Locale, string> = {
  en: 'English', 'zh-Hans': '简体中文', 'zh-Hant': '繁體中文', es: 'Español', fr: 'Français',
  de: 'Deutsch', ja: '日本語', ko: '한국어', hi: 'हिन्दी', ar: 'العربية',
};
export const isLocale = (value: string | null): value is Locale => locales.includes(value as Locale);

export function matchLocale(preferences: readonly string[]): Locale {
  for (const preference of preferences) {
    const p = preference.toLowerCase();
    if (p.startsWith('zh')) return /tw|hk|mo|hant/.test(p) ? 'zh-Hant' : 'zh-Hans';
    const base = p.split('-')[0];
    if (isLocale(base)) return base;
  }
  return 'en';
}

export function pickLocale(): Locale {
  const query = new URLSearchParams(location.search).get('lang');
  if (isLocale(query)) return query;
  try {
    const saved = localStorage.getItem('planets-lang');
    if (isLocale(saved)) return saved;
  } catch { /* Storage can be unavailable in private/embedded contexts. */ }
  return matchLocale(navigator.languages?.length ? navigator.languages : [navigator.language]);
}

export function saveLocale(locale: Locale) {
  try { localStorage.setItem('planets-lang', locale); } catch { /* Selection still works in memory. */ }
}
