import type { Locale } from '@/lib/i18n/config'

const LOCALE_BCP47: Record<Locale, string> = {
  es: 'es-CO',
  en: 'en-US',
  pt: 'pt-BR',
  fr: 'fr-FR',
  de: 'de-DE',
  it: 'it-IT',
  ja: 'ja-JP',
}

export function formatDate(
  isoDate: string,
  locale: Locale,
  opts?: Intl.DateTimeFormatOptions & { timeZone?: string },
): string {
  return new Intl.DateTimeFormat(LOCALE_BCP47[locale], {
    dateStyle: 'medium',
    ...opts,
  }).format(new Date(isoDate))
}

export function formatDateTime(
  isoDate: string,
  locale: Locale,
  timeZone = 'UTC',
): string {
  return new Intl.DateTimeFormat(LOCALE_BCP47[locale], {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone,
  }).format(new Date(isoDate))
}

export function formatCurrency(
  amount: number,
  currencyCode: string,
  locale: Locale,
): string {
  return new Intl.NumberFormat(LOCALE_BCP47[locale], {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatRelativeTime(isoDate: string, locale: Locale): string {
  const bcp = LOCALE_BCP47[locale]
  const diff = Date.now() - new Date(isoDate).getTime()
  const min = Math.floor(diff / 60_000)

  if (min < 1) return new Intl.RelativeTimeFormat(bcp, { numeric: 'auto' }).format(0, 'minute')
  if (min < 60) return new Intl.RelativeTimeFormat(bcp, { numeric: 'always' }).format(-min, 'minute')
  const hours = Math.floor(min / 60)
  if (hours < 24) return new Intl.RelativeTimeFormat(bcp, { numeric: 'always' }).format(-hours, 'hour')
  const days = Math.floor(hours / 24)
  return new Intl.RelativeTimeFormat(bcp, { numeric: 'always' }).format(-days, 'day')
}

export function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? `{${key}}`))
}
