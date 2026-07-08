export const SUPPORTED_LOCALES = ["ar", "en"] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]
export const DEFAULT_LOCALE: Locale = "ar"

/** Extract the locale segment at the start of a pathname, e.g. "/ar/foo" → "ar" */
export function getLocaleFromPath(pathname: string): Locale | null {
  for (const l of SUPPORTED_LOCALES) {
    if (pathname === `/${l}` || pathname.startsWith(`/${l}/`)) return l
  }
  return null
}

/** Remove leading /{locale} from a pathname, returning "/" if nothing remains */
export function stripLocaleFromPath(pathname: string): string {
  const locale = getLocaleFromPath(pathname)
  if (!locale) return pathname
  const rest = pathname.slice(locale.length + 1)
  return rest || "/"
}

/** Return the same path but with a different leading /{locale} */
export function switchLocalePath(pathname: string, next: Locale): string {
  const stripped = stripLocaleFromPath(pathname)
  return `/${next}${stripped === "/" ? "" : stripped}`
}
