export const locales = ['es', 'en', 'pt', 'fr', 'de', 'it', 'ja'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'es'

export function isValidLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}

export const localeNames: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
  pt: 'Português',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  ja: '日本語',
}
