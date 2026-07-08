import { NextRequest, NextResponse } from "next/server"

const LOCALES = ["ar", "en"] as const
type Locale = (typeof LOCALES)[number]
const DEFAULT_LOCALE: Locale = "ar"
const LOCALE_COOKIE = "locale"

function localeFromPath(pathname: string): Locale | null {
  for (const l of LOCALES) {
    if (pathname === `/${l}` || pathname.startsWith(`/${l}/`)) return l
  }
  return null
}

function stripLocale(pathname: string): string {
  for (const l of LOCALES) {
    if (pathname === `/${l}`) return "/"
    if (pathname.startsWith(`/${l}/`)) return pathname.slice(l.length + 1)
  }
  return pathname
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const locale = localeFromPath(pathname)

  if (locale) {
    // URL has /{locale}/… prefix — rewrite internally to path without prefix
    // and pass the locale to server components via a request header.
    const internalPath = stripLocale(pathname)
    const url = request.nextUrl.clone()
    url.pathname = internalPath

    const reqHeaders = new Headers(request.headers)
    reqHeaders.set("x-locale", locale)

    const res = NextResponse.rewrite(url, { request: { headers: reqHeaders } })
    res.cookies.set(LOCALE_COOKIE, locale, { path: "/", maxAge: 60 * 60 * 24 * 365 })
    return res
  }

  // No locale prefix — redirect to /{locale}/…
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value
  const redirectTo = (LOCALES.includes(cookieLocale as Locale) ? cookieLocale : DEFAULT_LOCALE) as Locale

  const url = request.nextUrl.clone()
  url.pathname = `/${redirectTo}${pathname === "/" ? "" : pathname}`
  return NextResponse.redirect(url)
}

export const config = {
  // Run on all routes except Next.js internals and static assets
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|eot)$).*)"],
}
