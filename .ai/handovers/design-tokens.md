# Design Tokens — LMS Frontend Enterprise Refresh

Status: **Confirmed by project owner — first screen built, pending visual approval** (per `workflows/ui-phase.md` Step 2/3, Path B)
Owner: frontend-builder
Phase: `ui_iteration`

## Implementation notes (added during build)

- Added a third text tier, `--text-tertiary` (between `--text-secondary` and `--text-muted`), to map cleanly onto the three grey tones the existing dark UI already used.
- Elevation uses Tailwind's native `shadow-sm` / `shadow-xl` utilities rather than the hand-rolled `--shadow-*` vars below — close enough to the documented scale, one less system to wire up.
- Dark-mode is implemented via `data-color-mode="dark"` on `<html>`, toggled by `components/ThemeToggle.tsx` and persisted to `localStorage`. A no-flash inline script in `app/layout.tsx` applies it before first paint.
- Built so far: `app/globals.css` (tokens), `components/layout/{DashboardLayout,Sidebar,Topbar}.tsx`, `app/(dashboard)/student/dashboard/page.tsx`.

## Brand & color decisions (from project owner)

| Question | Answer |
|---|---|
| Background tone | Light, with a dark-mode toggle |
| Primary accent | Deep blue / indigo |
| UI style | Corporate / Professional |
| Component feel | Rounded corners, subtle shadows, spacious |

## Design call requiring confirmation

The current app uses a dark navy sidebar (`#0F172A`) as its visual identity. Rather than discard that on the move to a light theme, the proposal is a **light content area + a deep indigo/navy sidebar** — the standard enterprise SaaS pattern (Workday, SAP Fiori, most admin dashboards). This keeps the existing brand anchor, gives strong wayfinding contrast, and avoids an all-white "flat" look. Dark mode then becomes the sidebar's tone applied to the whole app.

If you'd rather have a fully light sidebar (nav and content same tone), say so before screens are built — this is the one judgment call beyond your direct answers above.

---

## 1. Color — Light mode (default)

| Token | Value | Usage |
|---|---|---|
| `--bg-canvas` | `#F4F6FA` | page background behind cards |
| `--bg-surface` | `#FFFFFF` | cards, panels, modals, table rows |
| `--bg-surface-muted` | `#F8FAFC` | zebra rows, nested panels |
| `--border-default` | `#E2E8F0` | card/table borders |
| `--border-subtle` | `#EDF1F7` | dividers |
| `--text-primary` | `#0F172A` | headings, primary text |
| `--text-secondary` | `#475569` | body copy |
| `--text-muted` | `#94A3B8` | placeholders, captions |
| `--accent` | `#2563EB` | primary actions, links, active states |
| `--accent-hover` | `#1D4ED8` | hover/pressed |
| `--accent-subtle` | `#EFF6FF` | selected nav item bg, info banners |
| `--success` | `#16A34A` / bg `#F0FDF4` | |
| `--warning` | `#D97706` / bg `#FFFBEB` | |
| `--danger` | `#DC2626` / bg `#FEF2F2` | |
| `--focus-ring` | `#2563EB` @ 35% opacity, 3px | keyboard focus |

**Sidebar (brand anchor, same in light & dark):**

| Token | Value |
|---|---|
| `--sidebar-bg` | `#0B1220` |
| `--sidebar-bg-active` | `#15213A` |
| `--sidebar-text` | `#CBD5E1` |
| `--sidebar-text-active` | `#FFFFFF` |
| `--sidebar-accent` | `#3B82F6` |
| `--sidebar-border` | `#1E293B` |

## 2. Color — Dark mode (toggle)

| Token | Value |
|---|---|
| `--bg-canvas` | `#0B1220` |
| `--bg-surface` | `#141C2E` |
| `--bg-surface-muted` | `#1A2438` |
| `--border-default` | `#26324A` |
| `--border-subtle` | `#1E293B` |
| `--text-primary` | `#F1F5F9` |
| `--text-secondary` | `#CBD5E1` |
| `--text-muted` | `#7C8AA5` |
| `--accent` | `#3B82F6` |
| `--accent-hover` | `#60A5FA` |
| `--accent-subtle` | `#1E2A45` |

Sidebar tokens stay the same in both modes — it's the constant brand element.

## 3. Typography

- Font family: keep `Geist Sans` (already loaded), `Geist Mono` for code.
- Base size: 14px (comfortable density for data-heavy LMS screens).

| Token | Size / Line height | Weight |
|---|---|---|
| `display` | 32px / 40px | 700 |
| `h1` | 24px / 32px | 700 |
| `h2` | 20px / 28px | 600 |
| `h3` | 16px / 24px | 600 |
| `body` | 14px / 20px | 400 |
| `body-strong` | 14px / 20px | 600 |
| `small` | 12px / 16px | 500 |

## 4. Spacing

4px base scale (Tailwind default). Semantic usage:

- Card padding: 24px (`p-6`)
- Section gap: 32px (`gap-8`)
- Page gutter: 32px desktop / 16px mobile
- Form field gap: 16px (`gap-4`)

## 5. Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | 6px | badges, chips, inputs |
| `--radius-md` | 10px | buttons, form controls |
| `--radius-lg` | 14px | cards, modals, dropdowns |
| `--radius-xl` | 20px | hero/feature panels |
| `--radius-full` | 9999px | avatars, pill badges |

## 6. Elevation (shadows)

| Token | Value | Usage |
|---|---|---|
| `--shadow-xs` | `0 1px 2px rgba(15,23,42,0.04)` | inputs, low emphasis |
| `--shadow-sm` | `0 1px 3px rgba(15,23,42,0.08), 0 1px 2px rgba(15,23,42,0.04)` | cards |
| `--shadow-md` | `0 4px 12px rgba(15,23,42,0.08)` | dropdowns, popovers |
| `--shadow-lg` | `0 12px 24px rgba(15,23,42,0.10)` | modals |

## 7. Component conventions

- Buttons: `radius-md`, height 40px (default) / 32px (sm) / 48px (lg), `shadow-xs` on primary only, no shadow on ghost/outline.
- Cards: `radius-lg`, `shadow-sm`, `bg-surface`, `border-default` 1px, 24px padding.
- Tables: flat (no shadow), `border-subtle` row dividers, `bg-surface-muted` on hover, 12–16px cell padding.
- Inputs: `radius-sm`, 1px `border-default`, `focus-ring` on focus, 40px height.
- Modals: `radius-lg`, `shadow-lg`, max-width per content, 24–32px padding.

---

## Rollout plan — complete

1. ~~Collect brand/style answers~~ — done
2. ~~Confirm this token set (and the sidebar judgment call above)~~ — done
3. ~~Implement tokens in `app/globals.css` + dark-mode toggle~~ — done
4. ~~Build/restyle one representative screen first (student dashboard) for approval~~ — done, approved
5. ~~Roll remaining `app/(dashboard)/**` screens (admin, student, tutor) + shared components~~ — done
6. ~~Roll `/instructor/*` portal~~ — done: shell (`InstructorSidebar`, `InstructorPageShell`), all pages including the two large builders (`CourseEditor.tsx`, `trainings/new/page.tsx`)
7. ~~Roll global `SiteHeader`~~ — done: kept dark intentionally, using the same `--sidebar-*` tokens as the brand-chrome sidebar (it's the header equivalent of the same anchor)
8. ~~Roll auth pages~~ — done: `(auth)/login`, `(auth)/register`, `instructor/login`, `instructor/register` — all split-screen pattern (dark branded panel via `--sidebar-*` + light form panel via standard tokens)
9. ~~Roll public marketing pages~~ — done: home, course catalog (`/courses/[category]`), instructor directory + profile

Every screen in the app is now on the enterprise light theme (or intentionally dark per the ADR below). Awaiting client sign-off to mark `ui.status: frozen`.

## Explicitly out of scope (see `.ai/decisions/2026-06-29-video-call-ui-stays-dark.md`)

- Video player (`student/videos/[id]`), three live call rooms (`student/live/[id]`, `student/live-session/[id]`, `instructor/live-session/[id]`) and the shared chat panel — stay dark, matching universal video/call UI convention
- `CourseThumbnail.tsx` — dark scrim is an image-legibility overlay, not chrome

## Known remaining minor item

- `lib/theme.ts` (Chakra v3 config) — not wired into the app; left untouched since Chakra isn't mounted in any restyled component. No action needed unless a future screen actually mounts Chakra.

## Implementation note — background agent reliability

Across two rollout waves, parallel background agents repeatedly hit session limits, stalls, and mid-response connection drops. This wasn't always visible from `git status` alone — one file showed as "modified" after its assigned agent batch but only had 5 of 471 lines actually changed. The same quote-anchored substitution approach used by agents (and my own first-pass scripts) also systematically missed two patterns: hex codes embedded in CSS shorthand strings (e.g. `border: "1px solid #334155"`, where the hex isn't immediately preceded by a quote) and form input `color: "#F8FAFC"` left as literal white on now-light backgrounds (invisible typed text).

Caught by: (1) a `var(--)` density audit (count of token usages relative to file size) to flag suspiciously under-converted files, (2) a hex-boundary-aware regex sweep (`(?<![0-9A-Fa-f])#HEX(?![0-9A-Fa-f])`) re-run across the entire diff to catch the shorthand-string gap, (3) a targeted check for literal `"#F8FAFC"` project-wide. All confirmed-safe exceptions (data arrays feeding `${color}NN` alpha-template strings, decorative non-token colors, the video-poster dark exemption) were preserved by hand after each bulk pass. Final state verified via full `tsc` + `eslint` + screenshots.

**Lesson for future agent-based rollouts on this codebase:** don't trust "file shows as modified" as a completion signal — check actual content coverage (var() density, or a direct re-grep for the literal hex codes that should have been replaced) before trusting a sub-agent's "done" report.
