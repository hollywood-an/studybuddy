# StudyBuddy

An AI study tutor that turns your notes into flashcards and runs the session with an agent that picks each card, explains why, and writes you a study plan when you're done.

**Live demo:** [paste your Vercel URL]
**Try it:** upload a PDF (or slides / Word / plain text), wait for the cards to generate, then open **Tutor mode** on the document.

---

## What makes it interesting

The differentiator is the **agentic tutor**, not the flashcards. A Tutor session is a Claude Haiku agent running a tool-calling loop:

- **`get_cards_overview`** reads every card's current mastery and times-seen.
- **`get_card_history`** pulls the last few attempts (verdict + feedback) on a specific card to understand *why* the student is struggling.
- **`select_next_card`** picks the next card with a written rationale that's shown to the student ("Why this card: your mastery here is the lowest, so let's lock it in").
- **`end_session_with_plan`** ends the session with a markdown study plan when mastery is high enough, or when the student explicitly asks to stop.

Every step's full message history is persisted on `TutorSession.transcript`, so any decision is replayable. Card selection runs against a real **eval harness** (`evals/tutor.ts`, 13 scenarios) that pins behaviour: weak-vs-strong card, struggling-card history, end-when-mastered, honour an explicit stop request, plus edge cases. A second harness (`evals/grade.ts`) throws deliberately-flawed answers at the short-answer grader (a half-true HDD-only response to a general disk-I/O question, keyword salad, confidently-wrong fluency, an anti-sycophancy guard) so it doesn't rubber-stamp.

The point isn't that an LLM picks cards. It's that the agent **shows its reasoning, persists a replayable transcript, and pins behaviour with tests**.

---

## Screenshots

Replace these with real captures:

- **Landing** — `./docs/screenshots/home.png`
- **Tutor mode, mid-session** (the "Why this card" rationale above the flashcard) — `./docs/screenshots/tutor-reasoning.png`
- **End-of-session study plan** — `./docs/screenshots/study-plan.png`

A short GIF of one card-to-next-card cycle (reasoning → card → answer → next reasoning) lands harder than a static shot.

---

## Tech stack

- **Next.js 16** (App Router, server components, server actions) + **TypeScript**, **React 19**
- **Tailwind CSS v4** with a small design-token system (warm-stone neutrals + a single burnt-amber accent)
- **Prisma 6** + **PostgreSQL** on **Neon**
- **Anthropic SDK** — Claude **Haiku 4.5** for the tutor agent and flashcard generation, Claude **Opus 4.7** for short-answer grading
- Deployed on **Vercel**

---

## Architecture

### The agent loop

`lib/tutor/agent.ts` runs the tutor as a bounded tool-calling loop (hard cap: 12 steps):

```
for step in 0..MAX_STEPS:
  response = anthropic.messages.create(system, tools, messages)
  messages.push(assistant: response.content)

  for each tool_use in response:
    result = executeTool(documentId, name, input)        // lib/tutor/execute.ts
    if result is terminal:                                // present_card | end_session
      return result

  messages.push(user: tool_results)                       // loop
```

Tools are declared in `lib/tutor/tools.ts`; the system prompt and the decision order (end-check first, then prefer seen-and-weak cards over unseen, then spaced repetition) live in `agent.ts`. Each session's message history is saved on every step, so anything the agent decided can be inspected later.

### From a PDF to flashcards

`app/api/documents/[id]/generate-flashcards/route.ts` extracts text from the upload (`lib/extractText.ts` handles PDF, Word, plain text), splits it into `Chunk` rows, and asks Claude Haiku to turn each chunk into question-and-answer pairs. Each `Flashcard` links back to its source chunk.

### Grading

Short-answer grading lives in `lib/grading.ts`. The grader returns a **three-way verdict** (`correct` / `partial` / `incorrect`) with feedback that names the specific gap; partial earns a smaller mastery gain (+0.1 vs +0.2) so the adaptive signal stays honest. `evals/grade.ts` asserts both the verdict and that the feedback never invents praise like "bonus point."

---

## Local setup

```bash
git clone https://github.com/your-user/studybuddy.git
cd studybuddy
npm install
```

Create a `.env` in the project root:

```
DATABASE_URL="postgresql://..."     # any Postgres; Neon recommended
ANTHROPIC_API_KEY="sk-ant-..."
```

Then apply migrations and run:

```bash
npx prisma migrate deploy
npm run dev                          # http://localhost:3000
```

To run the agent + grader evals (they hit the real API, so they cost a small number of tokens):

```bash
node --env-file=.env --import tsx evals/tutor.ts
node --env-file=.env --import tsx evals/grade.ts
```
