# Architecture Decision Record (ADR)

**ADR Number:** ADR-001
**Title:** Video player and live-session "call room" screens stay dark, exempt from enterprise light theme
**Date:** 2026-06-29
**Author:** frontend-builder (Claude)
**Status:** Accepted

---

## Context

The enterprise UI refresh (see `design-tokens.md`) moved the dashboard shell and all `app/(dashboard)/**` screens from an all-dark theme to a light theme with a dark indigo sidebar as the brand anchor. Four screens/components don't use the shared `DashboardLayout` shell at all and render their own full-screen dark chrome:

- `app/(dashboard)/student/videos/[id]/page.tsx` — full-screen video player ("theater mode")
- `app/(dashboard)/student/live/[id]/page.tsx` — live video-call room (mic/cam/chat controls)
- `app/(dashboard)/student/live-session/[id]/page.tsx` — Zoom-embed call room
- `app/instructor/live-session/[id]/page.tsx` — instructor-side Zoom-embed control room (QA, assignments, attendance, knowledge checks panel)
- `components/live/LiveChatPanel.tsx` — chat panel used only inside the student call room above
- `components/CourseThumbnail.tsx` — dark gradient/scrim overlaid on course cover images for text legibility

## Decision

Leave these five files untouched. Do not apply the light-theme tokens to them.

## Reason

Video players and video-call interfaces (YouTube, Netflix, Zoom, Google Meet, Microsoft Teams) are conventionally dark regardless of the host site/app's theme — dark chrome reduces eye strain around bright video content and maximizes contrast for call controls. Flipping these to light would be inconsistent with that universal convention and would look out of place compared to every other video product. `CourseThumbnail`'s dark scrim is a legibility overlay on a photo, not page chrome, and is theme-invariant for the same reason cover-image overlays always are.

## Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| Apply light tokens everywhere uniformly for consistency | Would make the video player/call rooms look like a broken light page floating over video content — breaks the universal dark-video-UI convention users expect |
| Add a separate "theater" token set just for these screens | Unnecessary — these screens already have working, intentionally-dark hardcoded styles; no token system needed since they never switch themes |

## Impact

| Area | Impact | Detail |
|---|---|---|
| Frontend | Low | 5 files explicitly excluded from the token rollout |
| Design consistency | None | Matches the established convention for video/call UI everywhere else |

## Consequences

Future screens that play video or host a live call should follow the same exemption. If a future redesign wants the video/call UI to follow the app's light/dark toggle too, that's a new decision, not a fix to this one.

## Decision Log Entry

| 2026-06-29 | Video/call-room UI stays dark, exempt from light theme | Accepted |
