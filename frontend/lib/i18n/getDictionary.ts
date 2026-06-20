import type { Locale } from './config'
import type esDict from './messages/es.json'

export type Dictionary = typeof esDict

type DictLoader = () => Promise<Dictionary>

const loaders: Record<Locale, DictLoader> = {
  es: () => import('./messages/es.json').then(m => m.default),
  en: () => import('./messages/en.json').then(m => m.default),
  pt: () => import('./messages/pt.json').then(m => m.default),
  fr: () => import('./messages/fr.json').then(m => m.default),
  de: () => import('./messages/de.json').then(m => m.default),
  it: () => import('./messages/it.json').then(m => m.default),
  ja: () => import('./messages/ja.json').then(m => m.default),
}

const cache = new Map<Locale, Dictionary>()

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  if (cache.has(locale)) return cache.get(locale)!
  const dict = await loaders[locale]()
  cache.set(locale, dict)
  return dict
}
