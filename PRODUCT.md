# Product

## Register

product

## Users

**Primary: students.** High-school and college students preparing for exams or quizzes. They upload their own material (PDF, PowerPoint, Word, plain text) and want adaptive practice on it. Context: studying alone, often under time pressure, unsure what to focus on. The job to be done is "turn my own notes into focused practice and tell me what I actually need to work on."

**Secondary: technical reviewers and recruiters.** People evaluating StudyBuddy as a demonstration of hand-built agentic-AI engineering. Context: exploring the live app and/or reading the code, looking for evidence the tutor genuinely reasons (tool-calling, replayable transcripts, an eval harness) rather than just prompting an LLM. Their job to be done is "show me this agent actually thinks."

Both audiences matter equally. A design choice that helps a student focus should not bury the proof-of-engineering a reviewer is looking for, and vice versa.

## Product Purpose

StudyBuddy converts a user's own documents into flashcards, then offers two ways to practice:

- **Study Mode** — review cards weakest-first; self-rate each one or type a short answer and have it AI-graded (graded on whether the concept is right, generously, not on matching the reference answer word-for-word).
- **Tutor Mode** — an AI agent runs the session. Each turn it calls tools to read the student's mastery and card history, decides which card to show next, explains *why* it chose that card, and writes a personalized study plan when mastery is high enough to stop. Every decision is logged in a transcript that can be replayed.

It exists to make solo study adaptive (practice the right thing next, not a fixed deck) and to demonstrate a real agent loop built by hand. Success for a student: they finish a session knowing what to study next. Success for a reviewer: they come away convinced the agent reasons rather than guesses.

## Brand Personality

**Warm, encouraging, precise.** The voice is a patient, knowledgeable tutor who is genuinely on the student's side: supportive when they get something wrong, clear without being cold, never saccharine. Three words: warm, encouraging, precise.

The warmth is carried by tone, palette, and copy, not by mascots or rewards. The precision comes from Linear's discipline: fast, tight, confident, keyboard-friendly, no wasted chrome. The combination is the brand: a tutor that's kind *and* rigorous.

Emotional goals: students feel supported and focused (not judged when an answer is wrong); reviewers feel the product is credible and carefully built.

## Anti-references

This should explicitly NOT look like any of these:

- **Gamified ed-tech (Duolingo-style).** No cartoon mascots, streak counters, confetti, or badge-spam. Encouragement comes through honest copy and tone, not extrinsic reward loops.
- **Cold corporate SaaS.** No navy/blue enterprise dashboard, generic chart-everywhere layouts, or warmth-free density.
- **Sterile AI chat clone.** Not a gray ChatGPT-style wall of text. The agent's output is structured (the card, the reasoning, the plan), not an undifferentiated transcript.
- **Cluttered cram-site (Quizlet/Chegg).** No ad-heavy, banner-laden, busy density. The screen holds what the student needs for the current step and little else.

## Design Principles

1. **Show the agent thinking, don't just claim it.** The agentic tutor is the differentiator. Make its reasoning legible: the "why this card" rationale, the mastery it's reacting to, and the end-of-session plan should be visible and well-designed, not hidden behind a chat bubble. This serves students (trust) and reviewers (proof) at once.
2. **Warm, but disciplined.** Human encouragement without gimmickry. If a choice tips toward cute (mascots, confetti, exclamation copy), cut it; if it tips toward cold (enterprise gray, dense charts), warm it. The target is a kind tutor with Linear-grade precision.
3. **The tool disappears into studying.** On study and tutor surfaces, reduce friction and chrome so the content (the question, the answer, the feedback) is the hero. Fast feedback over choreography; calm focus over decoration.
4. **Dual surface, one identity.** The home/marketing page is a brand surface (design is the product; it makes the first impression and showcases the work). The app — documents, study, tutor — is a product surface (design serves the task). Both must read as the same product. Treat the landing with the brand register and the in-app screens with the product register.
5. **Earn trust through craft.** Both students and recruiters are judging credibility. Honest empty and error states, accurate grading copy, fast responses, and consistent components do more for trust than any single flourish.

## Accessibility & Inclusion

Target **WCAG 2.1 AA**, with extra attention to reading comfort given this is a study tool:

- Body text ≥ 4.5:1 contrast, large text ≥ 3:1; placeholder and "muted" text must still clear 4.5:1 (don't let the warm-gray muted token drop below it).
- Full keyboard navigation with visible focus rings (the existing `focus-visible:ring` pattern is the baseline; keep it on every interactive element).
- Honor `prefers-reduced-motion`: every animation needs a crossfade or instant fallback.
- Reading ergonomics: comfortable measure (65–75ch) for tutor prose and long short-answer text, generous line-height (body is 1.6), and legible type sizes; never shrink answer/feedback text for density.

Known gap: the app is light-mode only for now (dark mode is explicitly out of scope in `globals.css`). Revisit if students report studying in low light.
