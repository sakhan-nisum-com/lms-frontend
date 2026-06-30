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
  const locale = await getUserLocale()
  return {
    locale,
    messages: loadMessages(locale),
  }
})
