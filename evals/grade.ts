/**
 * Eval harness for the short-answer grader.
 *
 * Throws deliberately-flawed answers at gradeAnswer() and asserts the verdict
 * (and, for a couple of cases, that the feedback names the gap and invents no
 * rewards). No DB seeding — the grader is a pure function of the question,
 * reference answer, and student answer.
 *
 * Run:
 *   node --env-file=.env --import tsx evals/grade.ts
 *
 * Requires ANTHROPIC_API_KEY in the environment.
 */

import { gradeAnswer, type Verdict } from "@/lib/grading";

type Case = {
  name: string;
  question: string;
  referenceAnswer: string;
  studentAnswer: string;
  expect: Verdict | Verdict[];
  // Feedback must contain at least one of these (case-insensitive)...
  feedbackMustInclude?: string[];
  // ...and none of these (the sycophancy tells).
  feedbackMustNotInclude?: string[];
};

// The complete answer to the general disk-I/O question, covering BOTH spinning
// disks and SSDs — so an HDD-only answer reads as overgeneralized (partial).
const DISK_Q =
  "Why do disks prefer sequential and large I/Os over small random ones?";
const DISK_REF =
  "On HDDs, random I/O forces the head to seek to a new track and wait for the platter to rotate, so sequential access amortizes that mechanical cost over a large transfer. SSDs have no moving parts but still favor large sequential I/O because of internal parallelism across flash chips, the flash translation layer, and write amplification from scattered small writes. Larger requests also cut fixed per-request overhead.";

const CASES: Case[] = [
  {
    name: "genuinely correct (covers HDD and SSD)",
    question: DISK_Q,
    referenceAnswer: DISK_REF,
    studentAnswer:
      "Two reasons. On spinning disks, random reads pay seek time and rotational latency every time, while sequential reads amortize that over a big transfer. And on SSDs, even with no head, large sequential I/O wins because of internal parallelism, the FTL mapping, and write amplification on small scattered writes. Bigger requests also cut fixed per-request overhead.",
    expect: "correct",
  },
  {
    name: "minimal but correct",
    question: "What is rotational latency in a hard disk drive?",
    referenceAnswer:
      "The delay spent waiting for the platter to rotate so the target sector passes under the read/write head.",
    studentAnswer: "The time you wait for the disk to spin around to the right sector.",
    expect: "correct",
  },
  {
    name: "half-true / overgeneralized (HDD-only)",
    question: DISK_Q,
    referenceAnswer: DISK_REF,
    studentAnswer:
      "Because the read/write head has to physically move to a new spot on the spinning platter for each random request (seek time) and then wait for the right sector to rotate under it (rotational latency). Sequential reads let the head glide along, amortizing that mechanical cost over a big chunk of data.",
    expect: "partial",
    // The gap is "this only explains spinning disks; SSDs prefer sequential too".
    feedbackMustInclude: ["ssd", "solid", "moving part", "flash"],
  },
  {
    name: "keyword salad (no real understanding)",
    question: DISK_Q,
    referenceAnswer: DISK_REF,
    studentAnswer:
      "Seek time, rotational latency, throughput, IOPS, bandwidth, caching, the platter, sectors, amortization.",
    expect: ["incorrect", "partial"], // must NOT be "correct"
  },
  {
    name: "confidently wrong",
    question: DISK_Q,
    referenceAnswer: DISK_REF,
    studentAnswer:
      "Because disks keep sequential data in fast memory chips and random data in slower ones, so sequential reads physically come from the fast tier.",
    expect: "incorrect",
  },
  {
    name: "anti-sycophancy guard (correct answer, no invented rewards)",
    question: "What is seek time on a hard disk drive?",
    referenceAnswer:
      "The time for the read/write head to move to the track holding the target data.",
    studentAnswer: "How long the head takes to move to the right track before it can read.",
    expect: "correct",
    feedbackMustNotInclude: ["bonus", "excellent", "amazing", "nice touch"],
  },
];

function checkCase(
  c: Case,
  result: { verdict: Verdict; feedback: string }
): string | null {
  const allowed = Array.isArray(c.expect) ? c.expect : [c.expect];
  if (!allowed.includes(result.verdict)) {
    return `verdict ${result.verdict}, expected ${allowed.join(" | ")}`;
  }
  const fb = result.feedback.toLowerCase();
  if (c.feedbackMustInclude) {
    const hit = c.feedbackMustInclude.some((t) => fb.includes(t.toLowerCase()));
    if (!hit) {
      return `feedback names no gap (expected one of: ${c.feedbackMustInclude.join(", ")}) — got: "${result.feedback}"`;
    }
  }
  if (c.feedbackMustNotInclude) {
    const bad = c.feedbackMustNotInclude.find((t) =>
      fb.includes(t.toLowerCase())
    );
    if (bad) {
      return `feedback contains banned filler "${bad}" — got: "${result.feedback}"`;
    }
  }
  return null;
}

type Outcome =
  | { kind: "pass" }
  | { kind: "fail"; reason: string }
  | { kind: "error"; reason: string };

async function runCase(c: Case): Promise<Outcome> {
  try {
    const result = await gradeAnswer({
      question: c.question,
      referenceAnswer: c.referenceAnswer,
      studentAnswer: c.studentAnswer,
    });
    const reason = checkCase(c, result);
    return reason === null ? { kind: "pass" } : { kind: "fail", reason };
  } catch (err) {
    return {
      kind: "error",
      reason: err instanceof Error ? err.message : String(err),
    };
  }
}

async function main() {
  console.log(`Running ${CASES.length} grading scenarios\n`);
  const failures: Array<{ name: string; reason: string }> = [];
  let passed = 0;

  for (const c of CASES) {
    process.stdout.write(`▸ ${c.name} ... `);
    const outcome = await runCase(c);
    if (outcome.kind === "pass") {
      console.log("PASS");
      passed++;
    } else if (outcome.kind === "fail") {
      console.log(`FAIL — ${outcome.reason}`);
      failures.push({ name: c.name, reason: outcome.reason });
    } else {
      console.log(`ERROR — ${outcome.reason}`);
      failures.push({ name: c.name, reason: `threw: ${outcome.reason}` });
    }
  }

  console.log(`\n${passed}/${CASES.length} passed`);
  if (failures.length) {
    console.log("\nFailures:");
    for (const f of failures) console.log(`  - ${f.name}: ${f.reason}`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
