---
name: StudyBuddy
description: An AI study tutor that adapts to what you know.
colors:
  burnt-amber: "#b45309"
  burnt-amber-deep: "#92400e"
  burnt-amber-tint: "#f8eee6"
  warm-off-white: "#faf9f7"
  ink: "#1c1917"
  card-white: "#ffffff"
  muted-stone: "#f5f5f4"
  muted-ink: "#78716c"
  border-stone: "#e7e5e4"
  input-stone: "#d6d3d1"
  success-green: "#047857"
  success-subtle: "#ecfdf5"
  destructive-red: "#b91c1c"
  destructive-subtle: "#fef2f2"
typography:
  display:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "3rem"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    letterSpacing: "0.05em"
rounded:
  md: "6px"
  lg: "8px"
  xl: "12px"
  full: "9999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.burnt-amber}"
    textColor: "{colors.card-white}"
    rounded: "{rounded.lg}"
    padding: "0 16px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.burnt-amber-deep}"
    textColor: "{colors.card-white}"
  button-secondary:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "0 16px"
    height: "40px"
  button-destructive:
    backgroundColor: "{colors.destructive-red}"
    textColor: "{colors.card-white}"
    rounded: "{rounded.lg}"
  card:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
  badge-neutral:
    backgroundColor: "{colors.muted-stone}"
    textColor: "{colors.muted-ink}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
  badge-primary:
    backgroundColor: "{colors.burnt-amber-tint}"
    textColor: "{colors.burnt-amber}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
  input:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "0 12px"
    height: "40px"
---

# Design System: StudyBuddy

## 1. Overview

**Creative North Star: "The Patient Tutor"**

StudyBuddy looks and behaves like a knowledgeable person who is on the student's side: warm, attentive, and never rushed, but exact about what matters. The surface is a warm off-white (#faf9f7) lit by a single burnt-amber accent (#b45309), the way a study lamp warms a desk. Type pairs a humanist serif (Fraunces) for headings with a clean sans (Geist) for everything a student reads and acts on. Nothing shouts. The interface earns trust by being calm, legible, and consistent, then gets out of the way so the studying is the focus.

The discipline underneath the warmth is borrowed from Linear: tight geometry, a small and rigorously reused component set, fast state feedback, visible focus on every control. Warmth is carried by color, serif headings, and supportive copy; precision is carried by the layout grid, the 8px-family radii, and the restraint of a single accent. The two are not in tension here, they are the brand: a tutor who is kind *and* rigorous.

This system explicitly rejects four neighbors. It is not **gamified ed-tech** (no mascots, streaks, confetti, or badge-spam). It is not **cold corporate SaaS** (no navy enterprise chrome, no chart-everywhere density). It is not a **sterile AI chat clone** (the agent's output is structured into cards, reasoning, and a plan, never an undifferentiated gray transcript). And it is not a **cluttered cram-site** (no ad rails, no banner noise; each screen holds what the current step needs and little else).

**Key Characteristics:**
- Warm off-white canvas, white cards, a single burnt-amber accent used sparingly.
- Serif display (Fraunces) over sans body (Geist); one mono (Geist Mono) for code.
- Flat surfaces with tonal layering; shadows stay whisper-light.
- 8px-family radii (8 / 12px), generous padding, a max-w-3xl reading column.
- Visible amber focus ring on every interactive element.
- State communicated through warm/cool subtle fills (amber, emerald, red), never color alone.

## 2. Colors

A warm-neutral stone foundation lit by one earthy amber accent, with reserved emerald and red for success and danger.

### Primary
- **Burnt Amber** (#b45309): The single brand accent. Primary buttons, the active segment of toggles, links, the focus ring, the tutor's sparkle mark, and the "has flashcards" badge. Deep and earthy so it reads as encouragement and focus, never as an alarm. Clears AA against white text.
- **Burnt Amber Deep** (#92400e): The pressed/hover state of primary surfaces only.
- **Burnt Amber Tint** (#f8eee6): A ~10% amber wash behind icon chips and the primary badge. Carries the accent hue without the weight.

### Neutral
- **Warm Off-White** (#faf9f7): The page canvas. The single most-used color; warmth lives here, not in the accent.
- **Card White** (#ffffff): Raised reading surfaces (cards, inputs, toggles) that sit a half-step above the canvas.
- **Muted Stone** (#f5f5f4): Quiet fills, the neutral badge, inline code, hover backgrounds for ghost controls.
- **Ink** (#1c1917): Primary text, headings, and high-emphasis values.
- **Muted Ink** (#78716c): Secondary text, captions, placeholders, helper copy.
- **Border Stone** (#e7e5e4): Hairline borders and dividers between sections and inside cards.
- **Input Stone** (#d6d3d1): The resting stroke on form fields, one step darker than card borders so inputs read as interactive.

### Tertiary (semantic state)
- **Success Green** (#047857) on **Success Subtle** (#ecfdf5): Correct answers, completed sessions.
- **Destructive Red** (#b91c1c) on **Destructive Subtle** (#fef2f2): Incorrect answers, delete affordances, error messages.

### Named Rules
**The One Lamp Rule.** Burnt Amber is the only accent and appears on a small fraction of any screen: the primary action, the current selection, the focus ring, the agent's mark. Its rarity is what makes it read as "the important thing." Never use amber as a decorative fill or to color body text.

**The Warmth-Lives-In-The-Canvas Rule.** Warmth comes from the off-white background and serif headings, not from tinting every surface. Do not push neutrals further toward beige to "feel warmer"; #faf9f7 is the warm note, white cards are the contrast against it.

## 3. Typography

**Display Font:** Fraunces (with Georgia, serif fallback)
**Body Font:** Geist (with ui-sans-serif, system-ui fallback)
**Label/Mono Font:** Geist Mono (inline code only)

**Character:** A humanist serif with optical warmth (Fraunces) paired against a clean, modern sans (Geist) on a true contrast axis (serif vs. geometric-humanist sans). Fraunces gives headings a studious, human voice; Geist keeps everything a student reads or types crisp and unfussy. Fixed rem sizes throughout, not fluid clamps: this is product UI viewed at consistent DPI.

### Hierarchy
- **Display** (Fraunces, 600, ~2.25–3rem, line-height 1.1, tracking -0.025em): Page heroes and the top of primary screens ("Study smarter…", "Your documents"). Ceiling is 3rem; this system never shouts.
- **Headline** (Fraunces, 600, 1.875rem, tracking -0.025em): Section headings ("How it works", "Session complete") and feature titles.
- **Title** (Geist, 600, ~1.125–1.25rem): In-card titles, the flashcard question, mode labels. Sans, not serif, so it sits quietly inside dense UI.
- **Body** (Geist, 400, 1rem, line-height 1.6): Reading copy, tutor prose, study-plan markdown. Secondary copy drops to 0.875rem (text-sm) but never below for content a student must read.
- **Label** (Geist, 500, 0.75rem, letter-spacing 0.05em, uppercase): Eyebrow microlabels only ("QUESTION", "YOUR STUDY PLAN", "STEP 1"). Reserved for ≤4-word tags.

### Named Rules
**The Serif-For-Voice Rule.** Fraunces is reserved for headings and moments where the product speaks in its own voice. Never set buttons, inputs, data, or body copy in the serif; that is Geist's job. Display fonts in UI labels are forbidden.

**The Reading-Comfort Rule.** Tutor prose and long answers cap at a 65–75ch measure with line-height 1.6. Never shrink answer or feedback text for density; legibility outranks compactness in a study tool.

## 4. Elevation

The system is **flat with tonal layering**. Depth is conveyed by a three-step tonal stack, warm off-white canvas (#faf9f7) → white card (#ffffff) → muted-stone fills (#f5f5f4), reinforced by hairline borders (#e7e5e4), not by stacked shadows. Cards carry only a whisper-light resting shadow so they lift a hair off the canvas without casting drama. The sticky top nav is the one translucent surface: a `bg-background/80` with `backdrop-blur`, so content scrolls softly beneath it.

### Shadow Vocabulary
- **Resting card** (`box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)`): The only standing shadow. Used on cards to separate them from the canvas. Do not deepen it for emphasis; use the border and tonal step instead.
- **Focus ring** (`box-shadow`/`outline: 2px solid #b45309` with a 2px background-colored offset): Not elevation, but the one universal "lifted" treatment. Every interactive element gets it on `:focus-visible`.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. The only shadow is the resting card lift. Hover changes the *border* (toward amber) or the *background* (toward muted), not the shadow. If a hover effect reaches for a bigger drop shadow, it is wrong here.

## 5. Components

Every interactive element shares one focus treatment (a 2px amber ring with a 2px offset) and a 150ms color transition. The set is small and reused verbatim across screens; that consistency is the point.

### Buttons
- **Shape:** Gently rounded (8px / `rounded-lg`). Two sizes: md (40px tall, 16px sides) and sm (32px tall, 12px sides). Always `font-medium`, single-line.
- **Primary:** Burnt Amber fill (#b45309), white text. Hover deepens to #92400e. The default for the one main action per view.
- **Secondary:** White fill, ink text, hairline border (#e7e5e4); hover fills muted-stone. For the lower-priority sibling action.
- **Ghost:** No fill or border; ink text; hover fills muted-stone. For tertiary/inline actions.
- **Destructive:** Red fill (#b91c1c), white text; hover at 90% opacity. Rare, for confirmed deletes.
- **Disabled:** 50% opacity, pointer events off, across all variants.

### Badges / Chips
- **Style:** Pill (`rounded-full`), 0.75rem medium text, compact padding (2px / 10px).
- **Neutral:** Muted-stone fill, muted-ink text. Counts and inert metadata.
- **Primary:** Amber-tint fill (#f8eee6), Burnt Amber text. Signals an active/positive count ("has flashcards").
- **Success:** Success-subtle fill, success-green text.

### Cards / Containers
- **Corner Style:** 12px (`rounded-xl`).
- **Background:** Card White (#ffffff) on the warm canvas.
- **Shadow Strategy:** Resting card shadow only (see Elevation).
- **Border:** 1px Border Stone (#e7e5e4). Interactive cards shift the border toward amber (`primary/40`) on hover.
- **Internal Padding:** 20–32px (`p-5` to `p-8`) depending on density; comfortable, never cramped.

### Inputs / Fields
- **Style:** White fill, 1px Input Stone (#d6d3d1) stroke, 8px radius, 40px tall (textarea grows by rows). Placeholder in muted-ink.
- **Focus:** Amber ring (2px) with a 2px background-colored offset; no border-color change needed.
- **Disabled:** 50% opacity, `not-allowed` cursor.

### Navigation
- **Style:** Thin sticky top bar (56px), translucent `bg-background/80` with `backdrop-blur`, 1px bottom border. Wordmark left (Fraunces, hover → amber), nav links right (Geist, muted-ink → ink on hover with a muted-stone hover fill). Visible focus ring on every link.

### Mode Toggle (signature)
A segmented control: an `inline-flex` track (white fill, hairline border, 8px radius, 2px inset padding) holding two rounded-md segments. The active segment is a Burnt Amber fill with white text; the inactive segment is muted-ink that darkens to ink on hover. Used to switch between "Self-rate" and "Short answer". This is the project's standard binary switch; do not reinvent it as a checkbox or dropdown elsewhere.

### Agent Reasoning Callout (signature)
The brand-defining element. A subtle panel (`bg-muted/60`, hairline border, 8px radius, 16px padding) that pairs a small Burnt Amber sparkle mark with a "Why this card" lead-in (ink, medium weight, not italic) followed by the agent's rationale in italic muted-ink. It appears above the flashcard in Tutor Mode to make the agent's reasoning legible. This is how StudyBuddy "shows the agent thinking" instead of claiming it; treat it as a first-class component, never as decoration, and never hide the reasoning behind a chat bubble.

## 6. Do's and Don'ts

### Do:
- **Do** keep Burnt Amber (#b45309) rare: the primary action, the current selection, the focus ring, the agent mark. One lamp per room.
- **Do** carry warmth in the off-white canvas (#faf9f7) and serif headings, not by tinting every surface beige.
- **Do** set headings in Fraunces and everything actionable or readable in Geist.
- **Do** give every interactive element the 2px amber `:focus-visible` ring; it is the system's accessibility backbone.
- **Do** convey state with both a subtle fill and text/icon (amber, emerald, red), so meaning never rests on color alone.
- **Do** make the agent's reasoning visible via the Agent Reasoning Callout; structure the tutor's output into reasoning + card + plan.
- **Do** keep tutor prose and long answers at a 65–75ch measure with line-height 1.6.

### Don't:
- **Don't** add gamified ed-tech furniture: no mascots, streak counters, confetti, or badge-spam. Encouragement lives in copy and tone.
- **Don't** drift toward cold corporate SaaS: no navy/blue enterprise chrome, no chart-everywhere density, no warmth-free grids.
- **Don't** render the tutor as a sterile AI chat clone: never a gray, undifferentiated wall of transcript text.
- **Don't** build a cluttered cram-site: no ad rails, banner noise, or competing modules; show what the current step needs.
- **Don't** use the serif (Fraunces) for buttons, inputs, data, or body copy.
- **Don't** reach for a deeper drop shadow on hover; shift the border or background instead (Flat-By-Default).
- **Don't** ship muted-ink text below 4.5:1 against its background; the neutral badge on muted-stone is the known offender, darken it before shipping.
- **Don't** introduce a second accent hue or a gradient; emphasis comes from weight, size, and the one amber.
