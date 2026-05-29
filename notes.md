Note 1 5/26:
Added "Be very generous with phrasing differences and partial credit" to the ai grading after realizing how hard it was to get short answer to flashcard correct.

AI Generated Talking Points
The one-line pitch: "I built an AI study tutor that uses agentic tool calling to adaptively pick flashcards based on student mastery. It's open source and live at [URL]."
The agentic explanation: "The tutor isn't just an LLM that generates questions — it's an agent. Each turn it calls tools like get_cards_overview and get_card_history, reasons about what to show next, and either presents a card or ends the session with a personalized study plan. Every decision is logged in a transcript I can replay."
The critical-review moment: "I used Claude Code for the UI scaffolding but wrote the agent loop by hand because I wanted full understanding of every step. Here's [specific moment from NOTES.md] where I caught it [doing X]."
The eval moment: "I built a small eval harness with seeded student scenarios so I could measure whether the agent was getting better or worse as I tweaked the system prompt."

Note 2:
Used Ai to generate evals/tutor.ts for the tutor and it passed all of them except ending the tutor mode when mastery for all cards was above 0.9, which led me to change the phrasing of the system prompt and default user message.

Note 3 5/28:
Home page is useless right now and very lack luster.
Furthermore, the ai grader is still not lenious and will say googled ai answers as wrong. Getting a short answer correct is almost impossible.
Will change Grading prompt with an additional reasoning field before isCorrect. Redefine what "correct" is, correct is getting the concept right not simply only the reference answer. Added a double check after the verdict is given again too.

Note 4:
Upgraded grader to opus 4.7

Note 5:
Added pptx, docx, txt and other forms of files not just pdfs.

Note 6:
Added UI skill impeccable.style and did learn command. I picked the options I thought were best fit for my project.

Impeccable's critique caught that my documents hub showed zero mastery/progress data — the hub of a 'mastery-adaptive tutor' didn't surface any mastery. Fixed it to answer 'what should I study next?' on load.

Note 7:
Ran impeccable 6 step fix plan on the documents/page.tsx
Original score: 24/40