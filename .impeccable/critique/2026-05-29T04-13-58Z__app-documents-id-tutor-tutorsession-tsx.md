---
target: app/documents/[id]/tutor/TutorSession.tsx
total_score: 32
p0_count: 0
p1_count: 1
timestamp: 2026-05-29T04-13-58Z
slug: app-documents-id-tutor-tutorsession-tsx
---
# Critique — app/documents/[id]/tutor/TutorSession.tsx

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Visually strong, but none of it announced to screen readers |
| 2 | Match System / Real World | 4 | "Got it"/"Missed it"/"Why this card"/"Session complete" — natural |
| 3 | User Control and Freedom | 2 | No end-session-on-demand; no undo of a self-rating |
| 4 | Consistency and Standards | 3 | ModeToggle duplicated from StudySession; otherwise consistent |
| 5 | Error Prevention | 3 | Reveal-before-rate + disabled empty submit + double-start guard; misclick rating commits instantly |
| 6 | Recognition Rather Than Recall | 4 | Question visible, answer reveals, reasoning shown |
| 7 | Flexibility and Efficiency | 2 | Zero keyboard accelerators in a rate-many-cards loop |
| 8 | Aesthetic and Minimalist Design | 4 | Reasoning -> question -> controls -> result; clean |
| 9 | Error Recovery | 4 | Retry-able error phase (replays last message) + inline card errors |
| 10 | Help and Documentation | 3 | "Why this card" contextual help; nothing else |
| Total | | 32/40 | Good |

## Anti-Patterns Verdict — PASS

LLM assessment: Opposite of slop — the most distinctive surface in the app. "Why this card" reasoning callout makes the agent's thinking legible (not a chat transcript). Structured: reasoning -> card -> verdict -> plan. No gradient text/eyebrow/decorative cards.

Deterministic scan: detect.mjs -> [] (exit 0). Zero findings.

Visual overlays: No browser automation; no overlay/console signal. Fallback: source review + deterministic scan.

## Overall Impression

Nails what it's for (showing the agent reasons) — the reasoning callout and end plan are strong, async/error handling is production-grade. Gap is control + input efficiency: agent-controlled loop with no on-demand exit, no keyboard, no undo.

## What's Working

1. Reasoning callout is the star — delivers the product thesis (a tutor that thinks) to students and reviewers.
2. Real resilience — distinct loading copy, error phase replays last message, inline card errors, double-invoke guard.
3. Strong peak-end — Session complete + tally + markdown plan rewards finishing.

## Priority Issues

[P1] No way to end the session on demand. Agent decides length; card phase has no exit — only the page's top back link, which abandons and forfeits the plan (the payoff). Fix: add "End session" calling end_session_with_plan; make leaving discoverable. Command: shape then harden.

[P2] System status invisible to screen readers. Loading Card, "Grading…", ResultBox verdict, cardError are plain divs — no role=status/aria-live; focus not moved to the new question after Next card. WCAG AA target. Fix: aria-live on loading/result, role=alert on cardError, move focus on card change. Command: harden.

[P2] No keyboard accelerators in a repeat loop. Rate/submit/advance all mouse-only. Fix: Enter/Right for Next, 1/2 for self-rate, Cmd/Ctrl+Enter to submit. Command: harden.

[P2] Self-rating commits instantly, no undo. Click Got it -> records attempt + bumps mastery + locks; a misclick permanently pollutes the mastery signal the agent reasons over. Fix: allow changing the rating while the result shows, or undo. Command: harden.

[P3] ModeToggle duplicated across Study and Tutor. Copy-pasted; verdict change had to be made in both; next change will drift. Fix: extract shared ModeToggle to components/ui. Command: distill.

## Persona Red Flags

Alex (Power User): No keyboard path for the primary loop; can't skip a card. Friction within a few cards.

Sam (Accessibility): Submits and the screen reader announces nothing (no aria-live on loading/result/error); focus stays on the gone submit button after next card. Labels exist (good) but silent state changes break flow.

Reviewer (project-specific): "Why this card" delivers, but PRODUCT.md's promised replayable transcript isn't surfaced in the live app — can't inspect the full decision trail. Missed proof for the secondary audience.

## Minor Observations

- Reasoning in italic muted — on-brand but italic hurts longer rationales.
- Study-plan markdown links lack target/rel; an external link would lose the session.
- Verdict ResultBox swaps in instantly; a reduced-motion-aware crossfade would soften it (enhancement).

## Questions to Consider

- What lets a student feel they're driving a session the agent paces — an "I'm done" that still earns the plan?
- The transcript exists in the data; is the live app the place to surface replay for reviewers?
- In a rough patch, should the surface reassure, or does honest per-card feedback carry it?
