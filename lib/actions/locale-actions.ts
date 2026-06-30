"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { LOCALE_COOKIE_NAME, type Locale } from "@/lib/locale"

export async function setUserLocale(locale: Locale) {
  const cookieStore = await cookies()
  cookieStore.set(LOCALE_COOKIE_NAME, locale, { path: "/", maxAge: 60 * 60 * 24 * 365 })
  revalidatePath("/", "layout")
}
