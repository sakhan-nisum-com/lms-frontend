export type AnnouncementAudience = "all" | "students" | "tutors"
export type AnnouncementPriority = "normal" | "high"

export interface Announcement {
  id: string
  title: string
  body: string
  audience: AnnouncementAudience
  priority: AnnouncementPriority
  author: string
  publishedAt: string
  pinned: boolean
}

export const ANNOUNCEMENT_SEED: Announcement[] = [
  {
    id: "ann-1",
    title: "Scheduled maintenance — Jun 22, 1–3 AM EST",
    body: "LearnFlow will be briefly unavailable while we roll out database upgrades. Live sessions scheduled in this window have been notified separately.",
    audience: "all",
    priority: "high",
    author: "Morgan Patel",
    publishedAt: "2026-06-18",
    pinned: true,
  },
  {
    id: "ann-2",
    title: "New compliance track: Anti-Harassment & Workplace Ethics renewal",
    body: "Annual recertification is now open for all enterprise employees. Deadline is Aug 1 — managers will see completion stats on their team dashboards.",
    audience: "students",
    priority: "high",
    author: "Lena Kowalski",
    publishedAt: "2026-06-15",
    pinned: true,
  },
  {
    id: "ann-3",
    title: "Updated instructor payout schedule",
    body: "Starting next cycle, payouts move from monthly to bi-weekly. No action needed — your existing payout method stays the same.",
    audience: "tutors",
    priority: "normal",
    author: "Owen Brooks",
    publishedAt: "2026-06-10",
    pinned: false,
  },
  {
    id: "ann-4",
    title: "New discussion moderation tools",
    body: "Admins can now pin, lock, and remove discussion threads directly from the Discussions panel. See the audit log for a full history of moderation actions.",
    audience: "all",
    priority: "normal",
    author: "Morgan Patel",
    publishedAt: "2026-06-02",
    pinned: false,
  },
]
