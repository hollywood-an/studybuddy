---
target: app/documents/page.tsx
total_score: 24
p0_count: 0
p1_count: 2
timestamp: 2026-05-28T23-36-47Z
slug: app-documents-page-tsx
---
# Critique: app/documents/page.tsx (Your Documents hub)

## Design Health Score: 24/40 (Acceptable)

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | "Last studied —" renders a dead em-dash; no mastery/progress shown |
| 2 | Match System / Real World | 2 | "X chunks" is implementation jargon a student doesn't understand |
| 3 | User Control and Freedom | 2 | Native window.confirm delete, no undo, no rename |
| 4 | Consistency and Standards | 3 | Solid component reuse; native confirm/alert break crafted vocabulary |
| 5 | Error Prevention | 3 | Delete confirm names the title and consequences |
| 6 | Recognition Rather Than Recall | 3 | List visible; study state still requires memory |
| 7 | Flexibility and Efficiency | 2 | No search/sort/shortcuts/bulk; two clicks before you can study |
| 8 | Aesthetic and Minimalist Design | 3 | Clean and on-brand but flat/monotonous; chunk badge is noise |
| 9 | Error Recovery | 2 | Delete failure -> generic native alert, no inline recovery |
| 10 | Help and Documentation | 2 | None beyond the empty state |

## Anti-Patterns Verdict
Not surface-slop. detect.mjs returned [] (clean). No gradient text, side-stripes, eyebrows, glass. One tell: identical card grid of inert, low-information cards. Deeper problem: hub of a mastery-adaptive tutor shows zero mastery/progress/"what next". A file browser wearing a study app's clothes. Issues are functional/strategic, not cosmetic.

## What's Working
1. Empty state is genuinely good: icon, clear heading, teaching description, one primary CTA.
2. Consistent component system: Card/Badge/Button reuse, focus-visible rings, delete aria-label + confirm + pending spinner.
3. Whole-card click target with hover feedback; delete button correctly a sibling of the anchor (no nested interactive).

## Priority Issues
[P1] Hub shows no progress or mastery. The product promise (mastery-adaptive tutoring) is invisible on the screen students return to most. Can't tell which doc needs work or where to resume. Fix: per-card mastery meter / "X/Y mastered", real last-studied date, direct Study/Tutor action. Command: bolder, then layout.

[P1] "Last studied —" dead placeholder. Renders a literal em-dash with no data; reads as broken. Fix: wire to real attempts/session data (schema has it) or remove until real. Command: harden.

[P2] "chunks" is implementation jargon. No student mental model; surfaced as a first-class badge equal to flashcards. Fix: drop or relabel (sections/pages); let flashcard count be primary. Command: clarify.

[P2] Neutral badge text likely misses AA. text-muted-foreground (#78716c) on bg-muted (#f5f5f4) ~= 4.3:1, under the committed 4.5:1. "0 flashcards" badge is the offender. Fix: darken neutral badge text (stone-600/700) or darken bg. Command: audit / colorize.

[P2] Native confirm/alert for delete breaks crafted experience. Permanent destructive action confirmed via unstyled OS dialog; failure throws generic alert. Fix: soft-delete + undo toast, or styled dialog; inline error. Command: harden.

## Persona Red Flags
Sam (a11y): neutral badge fails AA (~4.3:1); muted "Last studied" at threshold; no aria-live after delete success.
Alex (power user): no search/sort/filter/shortcuts/bulk; studying takes two clicks (no direct Study/Tutor from card); slow past ~20 docs.
Maya (returning student / audience): flat grid of filenames, unknown word "chunks", dash where progress should be; nothing shows weakest doc or where to resume.

## Minor Observations
- "Upload new" is a vague label; "Upload document" says what happens.
- Long titles don't truncate (no line-clamp); wrap freely and stretch grid row.
- Only 2 columns at every width inside max-w-5xl; sparse on desktop; consider 3 at lg.
- No pagination/virtualization for large libraries.

## Questions to Consider
- What if the hub answered "what should I study next?" on load instead of listing filenames?
- Does a student ever need to see "chunks"?
- What would a confident delete look like (undo toast vs unstyleable OS dialog)?
