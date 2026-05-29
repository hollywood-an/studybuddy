/**
 * Eval harness for the tutor agent.
 *
 * Each scenario seeds a throwaway Document with a known set of flashcards
 * (and optionally past Attempts), runs the agent against it, and asserts the
 * decision. Test data is deleted after every scenario by cascading from the
 * Document row — nothing persists.
 *
 * Run:
 *   node --env-file=.env --import tsx evals/tutor.ts
 *
 * Requires DATABASE_URL and ANTHROPIC_API_KEY in the environment.
 */

import { prisma } from "@/lib/prisma";
import { runTutorAgent, type AgentDecision } from "@/lib/tutor/agent";
import { verdictToEnum, type Verdict } from "@/lib/grading";

// --- types --------------------------------------------------------------

type SeedAttempt = {
  verdict: Verdict;
  userAnswer?: string | null;
  feedback?: string | null;
};

type SeedCard = {
  question: string;
  answer: string;
  mastery: number;
  timesSeen: number;
  attempts?: SeedAttempt[];
};

// A check returns null on pass, or a human-readable failure reason. seedIds
// are the flashcard ids in the same order as the scenario's seedCards array,
// so checks can refer to cards by index.
type Check = (decision: AgentDecision, seedIds: string[]) => string | null;

type Scenario = {
  name: string;
  seedCards: SeedCard[];
  expected: string;
  check: Check;
  // Optional override for the prompt sent to the agent. Defaults to the same
  // message /api/documents/[id]/tutor-next uses when no userMessage is given.
  userMessage?: string;
};

// --- check helpers ------------------------------------------------------

const expectCardAt =
  (index: number): Check =>
  (decision, seedIds) => {
    if (decision.type !== "present_card") {
      return `expected present_card, got ${decision.type}`;
    }
    const want = seedIds[index];
    if (decision.cardId !== want) {
      const got = seedIds.indexOf(decision.cardId);
      return `picked card #${got >= 0 ? got : "?"}, expected #${index}`;
    }
    return null;
  };

const expectCardOneOf =
  (indices: number[]): Check =>
  (decision, seedIds) => {
    if (decision.type !== "present_card") {
      return `expected present_card, got ${decision.type}`;
    }
    const allowed = new Set(indices.map((i) => seedIds[i]));
    if (!allowed.has(decision.cardId)) {
      const got = seedIds.indexOf(decision.cardId);
      return `picked card #${got >= 0 ? got : "?"}, expected one of ${indices.join(", ")}`;
    }
    return null;
  };

const expectEnd: Check = (decision) =>
  decision.type === "end_session"
    ? null
    : `expected end_session, got ${decision.type}`;

// --- scenarios ----------------------------------------------------------

const SCENARIOS: Scenario[] = [
  {
    name: "weak vs strong card",
    seedCards: [
      { question: "What is mitosis?", answer: "Cell division producing two identical daughter cells.", mastery: 0.1, timesSeen: 3 },
      { question: "What is meiosis?", answer: "Cell division producing four genetically distinct gametes.", mastery: 0.9, timesSeen: 5 },
    ],
    expected: "pick the low-mastery card",
    check: expectCardAt(0),
  },
  {
    name: "all cards fully mastered",
    seedCards: [
      { question: "What is the powerhouse of the cell?", answer: "The mitochondrion.", mastery: 0.95, timesSeen: 6 },
      { question: "What does DNA stand for?", answer: "Deoxyribonucleic acid.", mastery: 0.9, timesSeen: 4 },
      { question: "What is photosynthesis?", answer: "Plants converting sunlight into chemical energy.", mastery: 0.92, timesSeen: 5 },
    ],
    expected: "end the session with a positive plan",
    check: expectEnd,
  },
  {
    name: "one struggling card among mastered",
    seedCards: [
      { question: "Define enthalpy.", answer: "Total heat content of a system at constant pressure.", mastery: 0.85, timesSeen: 4 },
      { question: "Define entropy.", answer: "Measure of disorder in a system.", mastery: 0.9, timesSeen: 5 },
      { question: "Define Gibbs free energy.", answer: "G = H - TS; predicts reaction spontaneity.", mastery: 0.15, timesSeen: 4 },
      { question: "Define activation energy.", answer: "Minimum energy required for a reaction to proceed.", mastery: 0.88, timesSeen: 3 },
    ],
    expected: "pick the only struggling card",
    check: expectCardAt(2),
  },
  {
    name: "two struggling cards, several mastered",
    seedCards: [
      { question: "What is a derivative?", answer: "Instantaneous rate of change of a function.", mastery: 0.2, timesSeen: 3 },
      { question: "What is an integral?", answer: "Area under a curve / antiderivative.", mastery: 0.25, timesSeen: 3 },
      { question: "What is a limit?", answer: "Value a function approaches as input approaches a point.", mastery: 0.9, timesSeen: 4 },
      { question: "What is continuity?", answer: "No jumps, holes, or asymptotes in a function.", mastery: 0.85, timesSeen: 4 },
    ],
    expected: "pick one of the two struggling cards",
    check: expectCardOneOf([0, 1]),
  },
  {
    name: "all mastered except one never-seen",
    seedCards: [
      { question: "Who wrote 'Hamlet'?", answer: "William Shakespeare.", mastery: 0.95, timesSeen: 5 },
      { question: "Who wrote 'Pride and Prejudice'?", answer: "Jane Austen.", mastery: 0.9, timesSeen: 4 },
      { question: "Who wrote 'Beloved'?", answer: "Toni Morrison.", mastery: 0.0, timesSeen: 0 },
    ],
    expected: "surface the never-seen card",
    check: expectCardAt(2),
  },
  {
    name: "weak seen vs weak unseen",
    seedCards: [
      // The system prompt prefers seen+low-mastery over unseen.
      { question: "What is a noun?", answer: "A person, place, thing, or idea.", mastery: 0.3, timesSeen: 2 },
      { question: "What is a participle?", answer: "A verb form used as an adjective.", mastery: 0.0, timesSeen: 0 },
    ],
    expected: "prefer the weak seen card",
    check: expectCardAt(0),
  },
  {
    name: "borderline 0.45 vs solid 0.85",
    seedCards: [
      { question: "What is supply?", answer: "Quantity of a good producers offer at each price.", mastery: 0.45, timesSeen: 3 },
      { question: "What is demand?", answer: "Quantity of a good consumers want at each price.", mastery: 0.85, timesSeen: 4 },
    ],
    expected: "pick the borderline card",
    check: expectCardAt(0),
  },
  {
    name: "okay mastery but bad recent attempts",
    seedCards: [
      {
        question: "What is the Pythagorean theorem?",
        answer: "a² + b² = c² for right triangles.",
        mastery: 0.4,
        timesSeen: 4,
        attempts: [
          { verdict: "incorrect", userAnswer: "a + b = c", feedback: "Missing the squares." },
          { verdict: "incorrect", userAnswer: "a² + b² = c", feedback: "c should be squared too." },
          { verdict: "correct", userAnswer: "a² + b² = c²" },
          { verdict: "incorrect", userAnswer: "I forget", feedback: "Review right triangles." },
        ],
      },
      { question: "What is the quadratic formula?", answer: "x = (-b ± √(b²-4ac)) / 2a", mastery: 0.9, timesSeen: 5 },
    ],
    expected: "pick the struggling card with the bad recent streak",
    check: expectCardAt(0),
  },
  {
    name: "single card, fully mastered",
    seedCards: [
      { question: "What is the speed of light?", answer: "Approximately 3 × 10⁸ m/s in vacuum.", mastery: 0.95, timesSeen: 6 },
    ],
    expected: "end session (nothing left to teach)",
    check: expectEnd,
  },
  {
    name: "single card, low mastery",
    seedCards: [
      { question: "What is Planck's constant?", answer: "h ≈ 6.626 × 10⁻³⁴ J·s.", mastery: 0.1, timesSeen: 2 },
    ],
    expected: "pick the only available card",
    check: expectCardAt(0),
  },
  {
    name: "continuation prompt after a correct answer",
    seedCards: [
      { question: "What is the capital of France?", answer: "Paris.", mastery: 0.9, timesSeen: 4 },
      { question: "What is the capital of Brazil?", answer: "Brasília.", mastery: 0.2, timesSeen: 3 },
      { question: "What is the capital of Australia?", answer: "Canberra.", mastery: 0.85, timesSeen: 4 },
    ],
    expected: "after success elsewhere, still target the weakest card",
    userMessage:
      "Student just got the France card correct. Mastery on that one is now 0.95. What's next?",
    check: expectCardAt(1),
  },
  {
    name: "everything unseen",
    seedCards: [
      { question: "What is HTTP?", answer: "HyperText Transfer Protocol — request/response over the web.", mastery: 0.0, timesSeen: 0 },
      { question: "What is TCP?", answer: "Transmission Control Protocol — reliable, ordered byte streams.", mastery: 0.0, timesSeen: 0 },
      { question: "What is DNS?", answer: "Domain Name System — maps hostnames to IP addresses.", mastery: 0.0, timesSeen: 0 },
    ],
    expected: "pick any card (no preference signal)",
    check: expectCardOneOf([0, 1, 2]),
  },
];

// --- runner -------------------------------------------------------------

async function seedScenario(
  scenarioName: string,
  cards: SeedCard[]
): Promise<{ documentId: string; seedIds: string[] }> {
  // Flashcards require a chunkId. We seed one placeholder chunk that all
  // flashcards point at — the agent never inspects chunk content.
  const document = await prisma.document.create({
    data: {
      title: `[eval] ${scenarioName}`,
      chunks: { create: { content: "eval placeholder chunk", index: 0 } },
    },
    include: { chunks: true },
  });
  const chunkId = document.chunks[0].id;

  const seedIds: string[] = [];
  for (const card of cards) {
    const created = await prisma.flashcard.create({
      data: {
        documentId: document.id,
        chunkId,
        question: card.question,
        answer: card.answer,
        mastery: card.mastery,
        timesSeen: card.timesSeen,
        attempts: card.attempts && {
          create: card.attempts.map((a) => ({
            verdict: verdictToEnum(a.verdict),
            userAnswer: a.userAnswer ?? null,
            feedback: a.feedback ?? null,
          })),
        },
      },
    });
    seedIds.push(created.id);
  }

  return { documentId: document.id, seedIds };
}

async function teardown(documentId: string) {
  // Cascades through chunks / flashcards / attempts / tutor sessions.
  await prisma.document.delete({ where: { id: documentId } });
}

type Outcome =
  | { kind: "pass" }
  | { kind: "fail"; reason: string; decision: AgentDecision }
  | { kind: "error"; reason: string };

async function runScenario(s: Scenario): Promise<Outcome> {
  const { documentId, seedIds } = await seedScenario(s.name, s.seedCards);
  try {
    const decision = await runTutorAgent(
      documentId,
      s.userMessage ??
        "Decide what to do next: present the best card, or end the session if the student has mastered everything."
    );
    const reason = s.check(decision, seedIds);
    return reason === null
      ? { kind: "pass" }
      : { kind: "fail", reason, decision };
  } catch (err) {
    return {
      kind: "error",
      reason: err instanceof Error ? err.message : String(err),
    };
  } finally {
    await teardown(documentId);
  }
}

async function main() {
  console.log(`Running ${SCENARIOS.length} tutor scenarios\n`);
  const failures: Array<{ name: string; reason: string }> = [];
  let passed = 0;

  for (const scenario of SCENARIOS) {
    process.stdout.write(`▸ ${scenario.name} ... `);
    const outcome = await runScenario(scenario);
    if (outcome.kind === "pass") {
      console.log("PASS");
      passed++;
    } else if (outcome.kind === "fail") {
      console.log(`FAIL — ${outcome.reason}`);
      failures.push({ name: scenario.name, reason: outcome.reason });
    } else {
      console.log(`ERROR — ${outcome.reason}`);
      failures.push({ name: scenario.name, reason: `threw: ${outcome.reason}` });
    }
  }

  console.log(`\n${passed}/${SCENARIOS.length} passed`);
  if (failures.length) {
    console.log("\nFailures:");
    for (const f of failures) console.log(`  - ${f.name}: ${f.reason}`);
    process.exitCode = 1;
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
