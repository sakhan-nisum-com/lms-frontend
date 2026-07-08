import { getRequestConfig } from "next-intl/server"
import { getUserLocale } from "@/lib/locale"
import fs from "node:fs"
import path from "node:path"

// Messages are split into one JSON file per feature area under messages/<locale>/*.json
// (one file per area lets parallel contributors add translations without colliding
// on a single shared file). They're deep-merged into a single messages object here.
function loadMessages(locale: string) {
  const dir = path.join(process.cwd(), "messages", locale)
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"))
  const merged: Record<string, unknown> = {}
  for (const file of files) {
    const content = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"))
    for (const [namespace, value] of Object.entries(content)) {
      if (merged[namespace] && typeof merged[namespace] === "object") {
        merged[namespace] = { ...(merged[namespace] as object), ...(value as object) }
      } else {
        merged[namespace] = value
      }
    }
  }
  return merged
}

export default getRequestConfig(async () => {
  // Prefer the locale injected by middleware via x-locale header (URL-based routing).
  // Fall back to the cookie value so cookie-only flows still work.
  const { headers } = await import("next/headers")
  const headersList = await headers()
  const headerLocale = headersList.get("x-locale")
  const locale = (headerLocale === "ar" || headerLocale === "en")
    ? headerLocale
    : await getUserLocale()
  return {
    locale,
    messages: loadMessages(locale),
  }
})
