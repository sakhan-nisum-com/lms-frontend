import { cookies } from "next/headers"

export type Locale = "en" | "ar"
export const DEFAULT_LOCALE: Locale = "ar"
export const LOCALES: Locale[] = ["ar", "en"]
export const LOCALE_COOKIE_NAME = "locale"

export async function getUserLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const value = cookieStore.get(LOCALE_COOKIE_NAME)?.value
  return value === "en" || value === "ar" ? value : DEFAULT_LOCALE
}
