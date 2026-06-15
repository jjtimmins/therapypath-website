export type Locale = 'en' | 'fr'

export function getLocaleFromPath(pathname: string): Locale {
  return pathname === '/fr' || pathname.startsWith('/fr/') ? 'fr' : 'en'
}

export function localePath(locale: Locale, path: string): string {
  if (locale === 'fr') {
    return path === '/' ? '/fr' : `/fr${path}`
  }
  return path
}
