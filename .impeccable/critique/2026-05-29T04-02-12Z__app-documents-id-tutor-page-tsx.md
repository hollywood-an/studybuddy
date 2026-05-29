---
target: app/documents/[id]/tutor/page.tsx
total_score: 35
p0_count: 0
p1_count: 0
timestamp: 2026-05-29T04-02-12Z
slug: app-documents-id-tutor-page-tsx
---
# Critique — app/documents/[id]/tutor/page.tsx

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Page is a static shell; loading/progress live in TutorSession |
| 2 | Match System / Real World | 4 | "Tutor mode" + plain-language subtitle; back link carries the doc title |
| 3 | User Control and Freedom | 3 | Only persistent exit during a live session is the muted top back link |
| 4 | Consistency and Standards | 4 | Container / EmptyState / buttonClasses / icons all from the system |
| 5 | Error Prevention | 4 | notFound() for bad id; empty state blocks a session with zero cards |
| 6 | Recognition Rather Than Recall | 4 | Subtitle explains the mode; nothing hidden |
| 7 | Flexibility and Efficiency | 3 | Nothing to accelerate at the shell level |
| 8 | Aesthetic and Minimalist Design | 4 | Calm, uncluttered, generous spacing |
| 9 | Error Recovery | 3 | No route-level error.tsx/loading.tsx; DB call falls back to Next defaults |
| 10 | Help and Documentation | 3 | Subtitle is the only inline help (fine for this surface) |
| Total | | 35/40 | Good (top of band) |

## Anti-Patterns Verdict — PASS

LLM assessment: Not AI-generated. Disciplined product shell — warm canvas, one Fraunces h1, muted plain-language subtitle, context-bearing back link, single content block. No gradient text, eyebrow, hero-metric, or decorative card grid. Empty state reuses the shared component.

Deterministic scan: detect.mjs returned [] (exit 0) across page.tsx and TutorSession.tsx — zero findings. Agrees with the LLM read.

Visual overlays: No browser automation available; no overlay injected, no live console signal. Fallback path — assessment rests on source review + deterministic scan.

## Overall Impression

A quietly excellent entry surface: orients (back link with doc title), names the mode, sets one honest expectation, gets out of the way for TutorSession. Biggest opportunity is resilience and exit: a DB call with no tailored loading/error state, and a thin exit once a session is live.

## What's Working

1. Deliberately lean data fetch — _count instead of loading cards, with a comment explaining why.
2. Calm, on-brand framing — back link → serif h1 → one-line subtitle; heading echoes the "Tutor mode" button (information scent).
3. A real empty state — teaches + gives a next step, via the shared EmptyState.

## Priority Issues

[P2] No route-level loading.tsx / error.tsx for the tutor route. The page awaits a Prisma query; slow = no skeleton, throw = Next default error. /documents got bespoke ones — inconsistent. Fix: add tutor (and study) loading.tsx + error.tsx mirroring /documents. Command: harden.

[P2] Thin escape during a live session. Only persistent exit is the small muted top back link; no "end session" affordance and the agent decides when it ends. Spans page.tsx (back-link prominence) and TutorSession (no end control). Fix: elevate the exit or add an explicit End session that requests the plan early. Command: harden / shape.

[P3] Empty-state heading skips a level. h1 then EmptyState defaults to h3 (no headingLevel passed) → h1→h3 jump. Already fixed on /documents via the new prop; not applied here or on study. Fix: pass headingLevel={2}. Command: harden.

[P3] Back link can wrap on long document titles. inline-flex arrow + title, no truncation; long titles wrap, especially on mobile. Fix: truncate/clamp the title span. Command: adapt.

## Persona Red Flags

Jordan (First-Timer): Session auto-starts with good "Why this card" scaffolding, but no sense of how long (agent-controlled length) and no visible stop — combined with the thin exit, can feel committed to an open-ended loop.

Sam (Accessibility): Focus ring on back link, label+color verdicts — good. Red flag: empty-state h1→h3 skip breaks heading nav.

Casey (Mobile): Responsive; session touch targets clear 44px on coarse pointers. Red flag: only exit is the top back link (hard thumb reach) and it can wrap on long titles.

## Minor Observations

- &rsquo; entity correct and consistent.
- Muted subtitle on canvas ~4.56:1 (passes AA, thin headroom) — consistent app-wide.
- Low status/flexibility scores are "shell has little to show," not defects.

## Questions to Consider

- Should a student be able to end the tutor session on demand and still get a plan?
- Does the page deserve the same loading skeleton /documents got?
- Is the top back link a strong enough exit for a focused, open-ended session?
