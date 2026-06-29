# Cadence — Proposed Changes (v3)

**Scope of v3:** Project-plan-quality focus. Budget de-emphasized throughout — cost is always optional. Two new feature scopes (light mode + accent color customization). One new template (Course Development / ADDIE). One new module (`benchmarks.js` for the scope estimator). Phase schema grows from 8 fields to ~16 (adds tasks, dates, status, deliverable, notes).

**Goal reframe:** Cadence is no longer "the doc that lands the project" (or "gets the budget"). It is **the project plan the work actually needs.** The diagnostic discipline (is this even a learning problem? what did you rule out? what does success look like?) stays front and center. The funding-flavored framing throughout the README, the templates, and the field labels is removed or softened. Cost is a field the user can fill; it's not the throughline.

---

## 1. Goal reframe

### Old (v2) framing
- "the doc that lands the project"
- "gets the budget"
- "fund the project"
- TDBP who can defend the mix gets the budget

### New (v3) framing
- "the project plan the work actually needs"
- "gets the project done"
- TDBP who can defend the mix gets the project done right
- Cost is a field the user can fill; it is not the throughline

### Specific line changes
- `README.md:11` — drop "the doc that lands the project" → "the project plan the work actually needs"
- `README.md:13` — drop "the hard part isn't instructional design, it's the doc that lands the project" → "the hard part isn't instructional design, it's the plan that gets the work done right"
- `templates.js` (all 5 templates, `approachRationale` prompt, lines 95, 170, 245, 320, 395) — change "gets the budget" → "gets the project done"
- `templates.js` (all 5 templates, `costOfCurrent` label + placeholder) — soften further: "Cost or scope (optional — leave blank if no cost to quantify)"
- `templates.js` (all 5 templates, `totalCost` label + placeholder) — same softening
- `index.html` summary card — drop "Investment" → "Budget" (neutral) or keep "Investment" but render only if `totalCost` is filled, never with "—"
- `index.html` section 01 stat row — hide "Cost / scope" cell when empty, collapse the grid to fewer columns automatically
- `app.jsx` standalone HTML export + slide deck — mirror the above

---

## 2. Source-of-truth decision: `app.jsx` duplication

**Current state:** The working app code lives inlined inside `index.html` in the `<script type="text/plain" id="cadence-app-source">` block (`index.html:1390-3508`). The on-disk `app.jsx` is an orphan — `index.html` does not load it. Both copies are currently identical (~2,110 lines, same symbol positions) but that won't survive one more refactor.

**Three options considered:**

| Option | Description | file:// | Netlify | Source of truth |
|---|---|---|---|---|
| A. Remove `app.jsx` | Keep inlined block; delete orphan | works | works | Inlined block |
| B. `<script type="text/babel" src="app.jsx">` | Make `app.jsx` the source; use the auto-loader | fails (CORS on external script src — Babel Standalone fetches via XHR) | works | `app.jsx` |
| C. Make `app.jsx` the source + a build step to inline | `app.jsx` is canonical, a small Node script inlines it into `index.html` on save | works | works | `app.jsx` |

**Recommendation: Option A.** The project's stated ethos is "no build step" (`README.md:84-99`). The file:// path is the documented install (`README.md:27-37`). Option A is the lowest-friction answer that works for both deployment models. The "downside" — that the source of truth is a `<script type="text/plain">` block — is well-commented in place and explicitly noted in the bootstrap.

**Implementation:**
- Delete `app.jsx`
- Update the comment at `index.html:1390-1396` to read: "This is the source of truth. The orphan `app.jsx` was removed in v3 to eliminate the two-source-of-truth hazard."
- Update `README.md:84-99` to remove the `app.jsx` reference in the file tree

---

## 3. Cost de-emphasis

**Principle:** Cost is one optional field among many. The plan view never renders "—" for cost (that's worse than empty). The summary card and section 01 stats are designed to look complete with or without cost data.

**Changes:**

### Summary card (`app.jsx:1183-1200`, `app.jsx:1674-1679` HTML export, `app.jsx:1796-1810` slide deck)
- Drop "Investment" → "Budget" (or rename to something neutral — "Effort" if `totalEffort` is filled, "Budget" if `totalCost` is filled, hidden if neither)
- The summary card has 4 cells. The 4th cell ("Team") can stay. The 1st cell ("Budget") auto-hides when neither `totalCost` nor `totalEffort` is filled. Layout collapses gracefully.

### Section 01 stat row (`app.jsx:1228-1244`, `app.jsx:1684-1688` HTML export, `app.jsx:1804-1807` slide deck)
- Currently: 3 cells (Affected, Status quo, Cost / scope), shown if any of the 3 is filled. Cost cell renders "—" if empty.
- New: 1-3 cells. Each cell hides when its own data is empty. The grid auto-fits. Cost cell is the *last* one to fill (it's the most optional).
- Rename "Status quo" → "Current state" (less jargon-y, also the user's phrasing in the Excel examples).
- Rename "Cost / scope" → "Cost" (drop the qualifier; the field already says "scope of the gap" in the prompt).

### Template prompts (all 5 templates, `templates.js`)
- `costOfCurrent` label: "Cost or scope (optional)" → "Cost (optional — leave blank if not quantified)"
- `costOfCurrent` placeholder: drop dollar-only examples; add a non-dollar example: "e.g., 12-week ramp, 8% error rate, or $1.4M — whatever makes the size of the gap concrete"
- `totalCost` label: "Estimated cost or scope (optional)" → "Estimated budget (optional)"
- `totalCost` placeholder: "e.g., $75K — or describe the team effort if no dollar cost applies" (keep — the dual-rail prompt is good)

---

## 4. Light mode + accent color customization (new feature scope)

### Light mode
- **Storage:** new `prefs` IndexedDB object store (or a single `prefs` key in the existing `projects` store — TBD, probably separate store for clarity). Fields: `{ theme: 'dark' | 'light', accent: '#hex' }`.
- **Default:** dark (current behavior, no flash on load).
- **Toggle:** a small button in the topbar (sun/moon icon, near the save pill). One click flips the theme; persists across reloads.
- **CSS strategy:** the codebase already uses CSS custom properties (`--bg`, `--text`, `--accent`, etc.) at `index.html:22-30`. The light theme is a `[data-theme="light"]` block that re-defines the same variables to light-mode values. All component CSS uses `var(--name)`, so the override is automatic.
- **No per-component changes.** This is purely a CSS exercise.
- **Print:** the standalone HTML export (`app.jsx:1546-1758`) gets a `prefers-color-scheme: light` block so the print-to-PDF default is always light, regardless of the in-app theme.

### Accent color customization
- **Storage:** `prefs.accent` in the same store. Default: `#d8ff5c` (the current lime).
- **Picker:** a small popover from the theme toggle. A grid of 8 preset swatches (the current lime, plus 7 alternatives — see below) plus a custom hex input.
- **Application:** the picked color overrides `var(--accent)` at the `:root` level. Everything that uses `--accent` (active states, status dots, section numbers, the byline rule, the rail-logo dot, the focus ring, etc.) recolors. Template-specific accent colors (the `accent: '#d8ff5c'` field per template) are *replaced* by the user accent — the template accent is a fallback if the user hasn't picked one.
- **Default presets (8):**
  - Lime `#d8ff5c` (current)
  - Cyan `#5cb8ff`
  - Orange `#ff9f5c`
  - Purple `#b88aff`
  - Pink `#ff6b8a`
  - Mint `#5cffb8`
  - Amber `#ffc15c`
  - Slate `#a8b3c7` (low-saturation, for a more muted look)
- **Plan view + exports:** the standalone HTML and slide deck exports also pick up the accent override. Stored in a CSS variable on the exported file's `:root`.
- **Per-template accent still works as a hint.** The dashboard row's left-border accent bar (currently `var(--accent)` from the template) becomes "user accent if set, else template accent."

### Implementation cost
- ~50 lines of new CSS (light theme overrides + accent swatch styles)
- ~30 lines of new JS (prefs store, theme toggle, accent picker)
- ~10 lines of new HTML (toggle + picker in the topbar)
- New `prefs` IndexedDB store migration

---

## 5. Already complete (v1 → v2)

The 23 items from the prior `PROPOSED_CHANGES.md` are implemented in the current code. Listed for the record.

| # | Item | Implemented at |
|---|---|---|
| 1 | Inline `app.jsx` into `index.html` (fixes `file://` CORS) | `index.html:1390-3527` (inlined) + `app.jsx` (orphan, see §2) |
| 2 | Surface `rulesOut` in section 02 | `templates.js:87`, `app.jsx:1257-1259`, `app.jsx:1695` |
| 3 | Separate "Evidence this is the right fix" paragraph | `app.jsx:1255-1256`, `app.jsx:1694` |
| 4 | Multi-format `extractStat` + per-template `statHints` + optional cost card | `app.jsx:161-175`, `templates.js:56-58, 133, 208, 283, 358` |
| 5 | ~~Per-component rationale on approach cards~~ — **superseded by #16** | — |
| 6 | "Saved" indicator in topbar | `app.jsx:440-452`, `app.jsx:195-205` |
| 7 | Duplicate project in dashboard | `app.jsx:527-537`, `app.jsx:610` |
| 8 | Wizard keyboard nav (Enter / Esc) | `app.jsx:783-800` |
| 9 | Dashboard search + sort | `app.jsx:540-554, 569-582` |
| 10 | README + step counter consistency | `README.md` (6 steps), `app.jsx:837` |
| 10b | Soften funding-flavored copy | `templates.js` (all 5 templates) |
| 11 | Custom confirm popover for delete | `app.jsx:508-525, 613-621` |
| 12 | Drag-and-drop JSON import | `app.jsx:660-704` |
| 13 | Soften cost field labels and placeholders | `templates.js` (all 5 templates) |
| 14 | Verification sweep | (no file; process item) |
| 15 | Deliverables section 04 in plan view | `app.jsx:1354-1378`, `app.jsx:1714-1723` |
| 16 | Intervention multiselect per-option detail (`{ value, detail }`) | `templates.js:20-27`, `app.jsx:1315-1316, 1554-1555, 1768-1769`, `app.jsx:71-89` (migrations) |
| 17 | Structured audience fields (role / size / context) | `templates.js:75-77, 150-152, 225-227, 300-302, 375-377`, `app.jsx:71-89` (migrations) |
| 18 | Measurement framework selector | `templates.js:29-37, 117, 192, 266, 342, 416`, `app.jsx:1142, 1459-1461` |
| 19 | Risks & assumptions list | `templates.js:108, 183, 258, 333, 408`, `app.jsx:1428-1434, 1739` |
| 20 | Phase dependencies (`dependsOn`) | `app.jsx:1077-1099`, `app.jsx:1407, 1731` |
| 21 | RACI-lite on phases (approver / supporters) | `app.jsx:1081-1087, 1415-1421, 1734` |
| 22 | Sustainment block (owner + handoff plan) | `templates.js:120-121, 195-196, 270-271, 345-346, 420-421`, `app.jsx:1470-1476, 1747-1751` |
| 23 | Pre-launch readiness checklist | `templates.js:109, 184, 258, 333, 408`, `app.jsx:1388-1395, 1727` |

---

## 6. New work (v2 → v3)

### Tier 1 — diagnostic completeness

These are the must-haves. They are the difference between "good template-filler" and "indispensable diagnostic tool for a working TDBP."

#### T1.1 — Stakeholder map
- **Why:** Confirmed by both my review and the user's two real Excel plans. Both real plans distinguish TD (doer), SMEs (validators), Stakeholders (approvers), and internal/external review checkpoints. A single `sponsor` field is insufficient.
- **Schema (new field type `stakeholders`):** list of `{ name, role, type, interest, power, notes }` where:
  - `name`: text
  - `role`: text (e.g., "VP Sales", "Sr. Sales Enablement Manager")
  - `type`: enum — `'sponsor' | 'approver' | 'doer' | 'SME' | 'implementer' | 'champion' | 'resister' | 'impacted'`
  - `interest`: 1-3 word descriptor ("high / medium / low" or specific interest like "owns the rollout metrics")
  - `power`: 1-3 word descriptor (same scale or "decision / consult / inform")
  - `notes`: text (optional)
- **Placement:** Step 1 of every template (sits next to the single `sponsor` field; the `sponsor` field stays as a shortcut for "the one person who signs off" but is now redundant with the stakeholder map).
- **UI:** new `FieldRenderer` branch for `stakeholders`. Inline list with type-as-color-coded chip. Add-row / remove-row buttons (like `deliverables` at `app.jsx:1001-1036`).
- **Plan view:** new sub-block in section 01 (above the stat row). Renders as a compact table: name · role · type. Type is color-coded.
- **Standalone HTML + slide deck:** mirror. The stakeholder table in the HTML export is right after the byline.

#### T1.2 — Business case structure
- **Why:** Confirmed by review. `costOfCurrent` and `totalCost` are free-text. Real TDBP business cases need structure: baseline, intervention, expected benefit, payback, source, confidence.
- **Schema (replaces `costOfCurrent` and `totalCost` in all 5 templates):** object `businessCase = { baseline, intervention, expectedBenefit, paybackPeriod, source, confidence }` where:
  - `baseline`: text (current state cost/scope — was `costOfCurrent`)
  - `intervention`: text (the cost of doing the project — was `totalCost`)
  - `expectedBenefit`: text (what we expect to gain)
  - `paybackPeriod`: text (e.g., "12 months", "first cohort")
  - `source`: text (where the numbers come from — e.g., "industry benchmark", "HRIS analysis 2024")
  - `confidence`: enum — `'low' | 'medium' | 'high'`
- **Migration:** existing `costOfCurrent` and `totalCost` values migrate to `businessCase.baseline` and `businessCase.intervention` respectively (in `migrateProject` at `app.jsx:71-89`).
- **UI:** new `FieldRenderer` branch for `businessCase`. A small grid of inputs (like `deliverables`). Optional fields — the user can leave the whole block empty.
- **Plan view:** section 01 stat row *or* a new mini-section in 01 below the stat row. Shows as a 3-row table: Baseline · Intervention · Expected benefit. Hides entirely when all three are empty.
- **Standalone HTML + slide deck:** mirror.

#### T1.3 — Scope-exclusion field
- **Why:** Every real project plan has a "what we will NOT do" list. Right now scope is implicit in what the user fills in.
- **Schema:** `scopeExclusions` — list of strings (a new variant of the `list` field type, no per-row structure).
- **Placement:** step 2 ("Frame the problem") in all 5 templates, after the audience fields.
- **Prompt:** "What is explicitly out of scope? (e.g., 'Eastern region — handled by separate workstream', 'Manager-track onboarding — only ICs in scope', 'Module translations — English only for v1')"
- **Plan view:** top of section 01, below the byline, above the stat row. Renders as a labeled list with × glyphs. Hides when empty.
- **Standalone HTML + slide deck:** mirror.

#### T1.4 — Open-questions / decisions log
- **Why:** Real L&D projects stall on unresolved questions: "Is budget approved?", "Will Sales Enablement co-own?", "Is the manager framework landing first?" A TDBP iterating with their VP needs this visible.
- **Schema:** `openQuestions` — list of `{ question, owner, due, status }` where:
  - `question`: text
  - `owner`: text (who is responsible for resolving it)
  - `due`: text (target resolution date, free-form "before kickoff" / "Q2 review")
  - `status`: enum — `'open' | 'in-progress' | 'resolved'`
- **Placement:** step 5 (Build the plan), under `+ Advanced` (Pattern B — keeps the lean flow intact for projects that don't need this).
- **Plan view:** section 05 (The plan), a new "Open questions" subsection, after the phases and before the risks. Hides when empty.
- **Standalone HTML + slide deck:** mirror.

#### T1.5 — Pilot design structure
- **Why:** Non-trivial rollouts need an explicit pilot step: scope, success criteria, scale/pivot decision. Currently the system-rollout template's `phases` field prompt says "typically pre-launch / launch / post-launch" (`templates.js:253`) but no field forces the TDBP to think about pilot success criteria.
- **Schema:** `pilotDesign` — object `{ scope, successCriteria, scaleTrigger, pivotTrigger }` where each is text.
- **Placement:** step 1 of `system-rollout`, `onboarding`, and `performance-gap` templates. Skipped from `leadership-dev` and `compliance` (pilot semantics differ for those — cohorts and required coverage don't follow the same scale/pivot pattern).
- **UI:** a `FieldRenderer` branch for `pilotDesign` (a small grid of text inputs, similar to `businessCase`).
- **Plan view:** a new mini-section in section 05 (between phases and open questions). Renders as a 2x2 labeled grid: Scope · Success criteria · Scale trigger · Pivot trigger. Hides when all four are empty.
- **Standalone HTML + slide deck:** mirror.

#### T1.6 — Compliance template strengthening
- **Why:** The current compliance template is structurally weak. It frames compliance as "required training with retention as the win" (`templates.js:354-358`). Real compliance work is about attestation, documentation, and audit trail. The "How you will measure" prompt is generic.
- **Changes to `templates.js` compliance template:**
  - Step 2 (Frame the problem): add explicit fields for "regulatory requirement" (text), "audit cycle" (text), "documentation required" (text), "consequence of non-compliance" (text — was `costOfCurrent`)
  - Step 4 (Approach): add `attestationMethod` field (text — "manager attestation, LMS completion log, signed acknowledgment, etc.")
  - Step 5 (Plan): add `escalationPath` field (text — "what happens when someone doesn't complete by deadline")
  - Step 6 (Win): change the success metrics prompt to be coverage- and audit-focused ("Add a coverage or audit metric"); the measurement approach prompt to specifically mention "LMS completion reports, knowledge checks, manager attestations, audit-ready documentation"
- **No new field type** — all text/list fields. ~30 lines of template changes.

#### T1.7 — Task-level structure (phases → phases with tasks)
- **Why:** Confirmed by the user's two real plans. Both have 25–40 *tasks* per project, not 4–6 phases. Phases are buckets; tasks are the unit of work. The user's plans live at the task level (with explicit owner, dates, % complete, deliverable per task), not the phase level.
- **Schema (new `tasks` field type, lives inside each phase):** each phase is now `{ name, duration, owner, cost, description, approver, supporters, dependsOn, startDate, endDate, status, deliverable, notes, tasks: [{ name, owner, startDate, endDate, status, deliverable, effort, notes }] }`.
  - Top-level phase gets: `startDate`, `endDate`, `status` (not-started / in-progress / done), `deliverable` (text), `notes` (text), `tasks` (array).
  - Each task: `name`, `owner`, `startDate`, `endDate`, `status` (same enum), `deliverable` (text), `effort` (text — "40 hours"), `notes` (text).
- **Migration:** existing phases get the new fields as empty defaults. Backward-compatible.
- **UI:** `PhaseCard` gets a `+ Tasks` disclosure (Pattern B, defaults collapsed). Inside: a list of `TaskCard` components, each with the 8 fields above. Add task / remove task buttons.
- **Plan view:** phases render as today, but each phase has:
  - A status pill (color-coded: gray/blue/green)
  - The deliverable shown in a labeled line
  - The notes shown if populated
  - The tasks shown as a sub-list (P1.1, P1.2, etc.) when populated
- **Standalone HTML + slide deck:** mirror. The slide deck's "Plan" slide gets a denser treatment if tasks are present.
- **% complete rollup:** the project's overall progress becomes the sum of task `status` (not-started=0, in-progress=0.5, done=1) divided by total tasks. The `projectProgress` function at `app.jsx:126-138` is rewritten to use this if tasks exist, fall back to field-count otherwise.

#### T1.8 — Date ranges per phase
- **Why:** Confirmed by user's plans. They use absolute dates ("7/9 – 7/22") not durations ("2 weeks"). Real TDBPs need both.
- **Schema:** added to phases in T1.7. Free-text input (not a date picker — too heavy for a "no build step" tool). User types "7/9" or "Q2" or "Week of July 9" — whatever the convention.
- **Plan view:** when both `startDate` and `endDate` are filled, the phase line gets a date-range label (e.g., "7/9 – 7/22 · 3 weeks").
- **Standalone HTML + slide deck:** mirror.

#### T1.9 — Status / % complete tracking
- **Why:** Confirmed by user's plans. Every task has a status. Cadence currently has binary `isComplete`.
- **Schema:** see T1.7 (per-task and per-phase `status` enum).
- **UI:** a small color-coded status pill in `PhaseCard` header and `TaskCard` header. Click to cycle (not-started → in-progress → done → not-started). Persists on next save.
- **Dashboard:** the row's progress indicator becomes a real percentage (using the rollup from T1.7) instead of a fuzzy field-count.
- **Plan view:** the section nav "Progress" indicator (`app.jsx:1217`) uses the new rollup.
- **Standalone HTML + slide deck:** the slide deck "Plan" slide shows the rollup as a progress fraction ("3 of 5 phases done · 60%").

#### T1.10 — Scope estimator with ATD-defaulted benchmarks
- **Why:** Confirmed by user's Sheet 3 (ILT 49:1, eLearning 48.5:1, 585 hours total). This is the biggest single insight from the Excel. The estimator answers "how much work is this project?" with defensible numbers ("ATD ratio: 1 hour ILT = 49 hours dev").
- **New module:** `benchmarks.js` (sibling to `templates.js`). Loaded via `<script src="benchmarks.js"></script>`.
- **Schema:** array of `{ deliverable, unit, hoursPerUnit, source, activityBreakdown: { design, develop, review, revise } }`.
- **Default lookup (ATD-sourced; user-editable):**

  | Deliverable | Unit | Hours/unit | Source | Design / Develop / Review / Revise |
  |---|---|---|---|---|
  | ILT (live or vILT) | 1 hr instruction | 49 | ATD | 30 / 50 / 10 / 10 |
  | eLearning (standard) | 1 hr instruction | 48.5 | ATD | 25 / 55 / 10 / 10 |
  | eLearning (high interactivity) | 1 hr instruction | 120 | ATD | 25 / 60 / 10 / 5 |
  | Video (simple) | 1 min | 1 | ATD | 20 / 60 / 10 / 10 |
  | Video (moderate) | 1 min | 3 | ATD | 25 / 55 / 10 / 10 |
  | Video (complex) | 1 min | 6 | ATD | 30 / 50 / 10 / 10 |
  | Microlearning module | 1 module (~5 min) | 20 | ATD | 30 / 50 / 10 / 10 |
  | One-pager / quick reference | 1 page | 4 | ATD | 40 / 40 / 10 / 10 |
  | Job aid / playbook | 1 page | 6 | ATD | 30 / 50 / 10 / 10 |
  | Storyboard | 1 hr source | 12 | ATD | 50 / 40 / 5 / 5 |
  | Assessment / quiz | 1 question | 1 | ATD | 20 / 60 / 10 / 10 |
  | Participant guide | 1 module | 16 | ATD | 30 / 50 / 10 / 10 |
  | Instructor guide | 1 module | 12 | ATD | 30 / 50 / 10 / 10 |
  | Infographic | 1 piece | 8 | ATD | 40 / 40 / 10 / 10 |
  | Podcast / audio edit | 1 min finished | 3 | ATD | 10 / 70 / 10 / 10 |
  | Worksheet / workbook | 1 page | 2 | ATD | 30 / 50 / 10 / 10 |
  | Translation | 1 hr source | 8 | ATD | 20 / 60 / 10 / 10 |

  *(Specific hour values to be confirmed against current ATD research. The schema and structure are the deliverable; the values are placeholders consistent with ATD's general range.)*

- **UI:** a "Scope estimator" panel in step 1 of the wizard (or as a separate `/scope` route — see implementation note below). The user adds deliverables from a dropdown (autocomplete from the benchmark list), enters the unit count, and sees:
  - Total estimated hours
  - Breakdown by activity (design / develop / review / revise)
  - A "Save to project" button that writes `totalEffort` to the project and stores the per-deliverable list as `scopeBreakdown`
- **Storage on the project:** `totalEffort` (number, hours) and `scopeBreakdown` (array of `{ deliverable, units, hours }`).
- **Editable benchmarks:** the benchmark list itself is editable in a small "Benchmarks" sub-view (under the estimator panel — a "Edit ratios" link that opens an inline editor with all 17 rows, the user overrides any value, saves back to IndexedDB).
- **Recommendation on placement:** separate `/scope` route (like `/templates`) — keeps the wizard lean, gives the estimator its own screen. A button in step 1 of the wizard links to `/scope` and back.

#### T1.11 — Recurring status-reporting cadence
- **Why:** Confirmed by user's Sheet 2. The "Status Reports" task runs the full project length with a biweekly cadence. Cadence's `reviewCadence` is about *outcome measurement*, not *project status reporting*. Two different review cycles are conflated.
- **Schema:** new `statusReviewCadence` field (text) in step 6 of all 5 templates. E.g., "Biweekly status to VP Sales" or "Weekly standup with project team."
- **Migration:** none needed — new field, defaults to empty.
- **Plan view:** section 06 (The win) gets a "Project status cadence" line, separate from "When we will review" (which is outcome-focused). Renders below the framework banner.
- **Standalone HTML + slide deck:** mirror.

#### T1.12 — Format choice at project level
- **Why:** Confirmed by user's plans. Sheet 1 and Sheet 2 are elearning projects. The TDBP chose the format up front. Cadence's intervention mix covers this implicitly (select "Training program" + detail = "eLearning module") but the format choice should be established at the project level, before interventions.
- **Schema:** new `format` field — single-select with options: `'ILT' | 'vILT' | 'eLearning' | 'blended' | 'cohort' | 'self-paced' | 'workshop' | 'other'`. New `'format'` branch in `FieldRenderer` (uses the same `<select>` element as the existing `'select'` branch).
- **Placement:** step 1 of all 5 templates, after `timeline`.
- **Plan view:** section 01 byline, after the existing "Sponsor / Timeline / Team" lines. Renders as "Format · **{format}**". Hides when empty.
- **Standalone HTML + slide deck:** mirror.

#### T1.13 — 6th template: Course Development (ADDIE)
- **Why:** Confirmed by user's two real plans. They use a consistent 4-phase structure (PM → Design → Development → Implementation). This is the user's *own* working pattern and the canonical instructional-design lifecycle. A dedicated template would map directly to the user's workflow.
- **Template shape (mirrors the user's plans):**
  - Step 1: Project basics (title, sponsor, format, timeline)
  - Step 2: Frame the problem (audience, performance gap, scope-exclusions)
  - Step 3: Course design (course outline, performance objectives, learning objectives, assessment strategy)
  - Step 4: Build (deliverables, intervention mix — this is "develop the modules / storyboard / media / assessment")
  - Step 5: Plan (phases with tasks: PM → Design → Development → Implementation, with the user's review-cycle checkpoints: Pre-Alpha, Alpha, Pre-Beta, Beta, Pre-Gold, Gold, Stakeholder sign-off)
  - Step 6: Define the win (success metrics, measurement framework, measurement approach, review cadence, status review cadence, sustainment owner, handoff plan, plus a *maintenance log* field specific to course work)
- **Phase scaffolding:** the template's `phases` field has a `defaultPhases` array that pre-loads the user's typical 4-phase structure. The user can edit/delete.
- **Review-cycle sub-tasks:** each phase's `tasks` field has a `defaultTasks` array that pre-loads the review checkpoints. E.g., "Design" phase gets "Pre-Alpha review" and "Alpha review" as default tasks; "Development" gets "Pre-Beta review", "Beta review", "Pre-Gold review", "Gold review", "Stakeholder sign-off".
- **Color:** accent `#5cffd8` (a teal that doesn't collide with the existing 5).

---

### Tier 2 — strong-value additions

#### T2.1 — Assumptions log distinct from risks
- **Why:** Risks are forward-looking ("this might go wrong"). Assumptions are different ("we're assuming X is true"). A real plan has both. Currently the `risks` field mixes them.
- **Schema:** new `assumptions` list field (text rows), separate from `risks`. Placed in step 5 under `+ Advanced` (alongside `risks`).
- **Plan view:** section 05 (The plan), a new "Assumptions" subsection, before "Open questions." Hides when empty.
- **Standalone HTML + slide deck:** mirror.

#### T2.2 — Existing-materials audit
- **Why:** "What do we already have we can reuse?" is a TDBP's first scoping question. Not asked anywhere.
- **Schema:** new `existingMaterials` list field (text rows). Placed in step 2 ("Frame the problem"), after the audience fields. The user lists existing courses, job aids, decks, recordings, etc. that are relevant.
- **Plan view:** section 01, a small "Existing materials" line below the scope-exclusion block. Renders as a comma-separated list. Hides when empty.
- **Standalone HTML + slide deck:** mirror.

#### T2.3 — Baseline / current-state quantification
- **Why:** `problemDetail` is free-text. A TDBP benefits from being forced to write: "Currently X. Target Y. Source: Z." Currently this discipline is enforced only by self-restraint.
- **Schema:** new `baseline` field — object `{ current, target, source }` where each is text. Placed in step 2, after the problem detail.
- **Plan view:** section 01, a new "Current vs. target" line in the stat row area. Shows as `current → target` with the source as a small mono sub-line.
- **Standalone HTML + slide deck:** mirror.

#### T2.4 — Plan-level RACI
- **Why:** Phase `approver`/`supporters` is RACI-lite (per phase). The plan itself doesn't have a plan-level accountable/responsible/consulted/informed list. Sponsor is implied but not structured.
- **Schema:** new `planRACI` field — object `{ accountable, responsible, consulted, informed }` where each is text. Placed in step 1 (or step 2) of all 5 templates.
- **Plan view:** section 01, a small "RACI" sub-block below the byline. Renders as `A · {accountable} · R · {responsible} · C · {consulted} · I · {informed}`. Hides when all empty.
- **Standalone HTML + slide deck:** mirror.

#### T2.5 — "Validate this plan" quality check
- **Why:** A TDBP iterating alone would benefit from a sanity check: "Did you specify a baseline? Did you specify a measurement source? Did you specify a sponsor or explicitly mark this as solo/internal?"
- **UI:** a "Validate plan" button in the plan view's FAB group. Runs a checklist against the project's fields and renders a results panel:
  - ✅ Title set
  - ✅ Headline set
  - ✅ Audience defined
  - ✅ Root cause described
  - ⚠ No explicit "ruled out" — risk of un-diagnosed project
  - ⚠ No business case fields populated
  - ❌ No success metrics
  - ❌ No measurement source
  - etc.
- **Severity:** the panel highlights missing-critical fields (no metrics, no sponsor, no phases) versus nice-to-haves (no sustainment plan, no localization). The TDBP sees what's blocking a real plan versus what's polish.
- **Exportable:** the validation result is a markdown block the user can paste into Slack/email ("here's what my plan is missing") — but the markdown export is out of scope for v3 (deferred to v4).

#### T2.6 — Sub-tasks within a phase
- **Why:** Confirmed by user's Sheet 2. "Develop PPT" with sub-tasks Whole Numbers / Fractions / Decimals / Geometry, etc. The new `tasks` field in T1.7 covers this directly. (Listed in Tier 2 because it could also be a separate field, but bundling it with T1.7 keeps the schema cleaner.)
- **Status:** covered by T1.7. Re-listed here for visibility.

#### T2.7 — Translation / localization field
- **Why:** Confirmed by user's Sheet 2 ("Translate to Spanish" as a first-class task with its own effort, owner, and deliverable).
- **Schema:** new `localization` field — list of `{ language, scope, effort }` where:
  - `language`: text (e.g., "Spanish", "French-CA")
  - `scope`: enum — `'full' | 'assessment-only' | 'captions-only' | 'voiceover-only'`
  - `effort`: text (e.g., "2 weeks", "80 hours")
- **Placement:** step 5 of all 5 templates, under `+ Advanced`.
- **Plan view:** section 05 (The plan), a new "Localization" subsection. Renders as a small table: language · scope · effort. Hides when empty.
- **Standalone HTML + slide deck:** mirror.

#### T2.8 — Maintenance log / refresh cycle
- **Why:** Confirmed by user's Sheet 2. "Develop maintenance log" is a distinct sustainment task from handoff. `sustainmentOwner` and `handoffPlan` cover the *who*, but the *what* (the operational artifact for ongoing updates) isn't structured.
- **Schema:** new `maintenanceLog` field — object `{ refreshCycle, updateTracker, lastReviewed, nextReview }` where:
  - `refreshCycle`: text (e.g., "annual", "quarterly")
  - `updateTracker`: text (where updates are tracked — e.g., "SharePoint list", "Confluence page")
  - `lastReviewed`: text (date or "Q1 2026")
  - `nextReview`: text (date or target quarter)
- **Placement:** step 6 of all 5 templates, after `sustainmentOwner` and `handoffPlan`.
- **Plan view:** section 06 (The win), a new "Maintenance" sub-block, after the sustainment block. Hides when empty.
- **Standalone HTML + slide deck:** mirror.

#### T2.9 — Multi-stage approval gates
- **Why:** The user's plans have *six* distinct approval/review checkpoints. Each is a discrete event with a date, owner, and artifact. Cadence has phase-level approver (added in v2) but no plan-level list.
- **Schema:** new `approvalGates` field — list of `{ name, owner, due, artifact }` where each is text. Placed in step 5 (alongside phases, under `+ Advanced`).
- **Plan view:** section 05, a new "Approval gates" sub-block. Renders as a table: gate · owner · due. Hides when empty.
- **Standalone HTML + slide deck:** mirror.

#### T2.10 — Per-phase deliverable, distinct from per-phase description
- **Why:** Real plans have a "Deliverable(s)" column separate from the task name. Cadence phases have `description` (the work) but no structured "what comes out of this phase."
- **Status:** covered by T1.7 (per-phase `deliverable` field is part of the new phase schema).
- **Re-listed here for visibility.**

#### T2.11 — Total effort hours field, separate from cost
- **Why:** A TDBP who bills internally or has to estimate team load needs effort hours as a distinct concept from dollar cost. The plans end with "420 hours total" and "260 hours Development."
- **Status:** covered by T1.10 (the scope estimator writes to `totalEffort`).

#### T2.12 — The plan itself as a deliverable that needs sign-off
- **Why:** Both real plans start with "Develop Project Plan → Approve Project Plan" as a discrete two-task sequence. Cadence produces the plan but doesn't acknowledge the act of *getting the plan approved* is itself a milestone.
- **Schema:** new `planApproval` field — object `{ approver, due, status }` where `status` is enum `'draft' | 'in-review' | 'approved'`. Placed in step 1 of all 5 templates.
- **Plan view:** top of section 01, a small "Plan status: Draft / In review / Approved" indicator. Renders with color (gray / amber / green).
- **Standalone HTML + slide deck:** mirror.

#### T2.13 — Per-task notes / deviations log
- **Why:** Real plans have a "Notes" column capturing decisions, deviations, and context. Cadence's `risks` covers *forward-looking* risks; per-task notes cover *retrospective* context. Different things.
- **Status:** covered by T1.7 (per-task and per-phase `notes` fields).

#### T2.14 — Plan-level scope estimator integration
- **Why:** T1.10 introduces the scope estimator as a separate view. This adds a "View scope estimate" button in step 1 of the wizard that opens `/scope` and prefills the project ID, so the user can scope → save → continue with the wizard.
- **UI:** a small "📐" icon in step 1's top-right that links to `/scope?project={id}`. After saving the scope estimate, the user is returned to step 1 of the wizard with `totalEffort` populated.
- **Status:** small integration change, ~20 lines.

---

### Tier 3 — polish

#### T3.1 — Error boundary
- **Why:** If a render throws, the whole app dies. A TDBP loses their work mid-typing.
- **Implementation:** a small `ErrorBoundary` component that catches render errors in its children and renders a fallback ("Something went wrong rendering this view. Your work is saved. Reload to continue.") with a "Reload" button. Wrap `PlanView`, `BuildFlow`, and `Dashboard` each in one.

#### T3.2 — Slide deck hero-stat bug
- **Why:** Current code at `app.jsx:1908-1910` does `extractStat(firstMetric)`, which for "Reduce ramp time from 91 to 65 days" returns "91 days" (the *baseline*, not the target). The deck's headline says "91 days" when the win is 65 days. Embarrassing.
- **Fix:** the hero stat is a *separate* field on the project, `heroStat` (text, single line). The user writes "65 days" or "60% quota attainment" — whatever the headline number is. The deck uses this; the plan view's "Current state" cell uses the auto-extracted baseline.
- **Placement:** step 6 of all 5 templates, in `+ Advanced`.

#### T3.3 — Breadcrumb "Step —" bug
- **Why:** `app.jsx:283` shows "Step —" for new projects because the route carries `templateId`, not `stepIdx`. The `route.templateId ? '—' : ''` is a fallback that should be a "1".
- **Fix:** use `route.stepIdx != null ? route.stepIdx + 1 : '1'` (or similar). One-line fix.

#### T3.4 — "Edit" hint fix
- **Why:** `app.jsx:1226, 1252, etc.` renders an "edit" label on each plan section that does nothing. A TDBP clicking it expects something to happen.
- **Fix:** the "edit" label becomes a real button that scrolls to the build flow (or opens an inline edit affordance for that specific field). For v3: simplest fix is to remove the "edit" label entirely and rely on the FAB's "✎" button to enter edit mode.

#### T3.5 — Save-indicator consolidation
- **Why:** Two different save indicators: `Topbar` shows "Saving… / Saved · HH:MM" (`app.jsx:444-447`); `BuildFlow` cmd-bar shows "Auto-saved · 400ms" (`app.jsx:869`). Redundant.
- **Fix:** remove the cmd-bar indicator. The topbar pill is the single source of truth.

#### T3.6 — `extractStat` improvements
- **Why:** Current regex (`app.jsx:162-175`) is first-match greedy. `"$1.4M"` works; `"$1,400,000"` only matches the first comma-separated chunk; `"$1.4 million"` returns verbose text.
- **Fix:** normalize the matched output. If the match contains "million" or "thousand", convert to `$X.XM` / `$XK`. If the match is a comma-separated number, keep the first chunk. If the match is a percentage or duration, keep as-is.
- **Bonus:** add a unit test (in a `tests/` folder using a tiny zero-dep test runner, since the project has no build step — the tests run in a separate test HTML file that imports the function).

#### T3.7 — Phase cost summing
- **Why:** A TDBP reviewing the plan can see individual phase costs but not the sum. The math should auto-check against `totalCost` (in `businessCase.intervention` after T1.2).
- **Fix:** in the plan view's section 05, a small "Total: $X" line below the phases if any phase has a cost. Renders only if at least 2 phases have costs (otherwise the individual values are visible without the sum). Sums are simple parseInt of dollar values — no need to be currency-perfect.

#### T3.8 — IndexedDB capacity warning
- **Why:** A TDBP with 50 projects in a private window or under storage pressure gets silent data loss.
- **Fix:** on save, catch quota errors and show a topbar warning ("Storage almost full — export your projects to JSON to be safe"). On dashboard load, if any project fails to load, show a "Some projects couldn't be loaded — storage may be full" banner.

#### T3.9 — "Custom / mixed" measurement framework guidance
- **Why:** A TDBP picking "Custom" gets an empty text field with no scaffolding.
- **Fix:** when "custom" is selected, the `measurementApproach` field's placeholder expands to show the 5 listed frameworks as references ("e.g., 'mix of Kirkpatrick L1–L2 (LMS survey + completion) and Brinkerhoff Success Case (interview-based impact stories)'"). One-line placeholder change.

#### T3.10 — "Linked to 04 Deliverables" tag → real linkage
- **Why:** `app.jsx:1323` shows a "→ linked to 04 Deliverables" tag that isn't structurally enforced. The linkage is a visual claim, not a real one.
- **Fix:** remove the tag. The approach and deliverables sections are simply adjacent. If the user wants to show a link, they do it in the rationale text.

#### T3.11 — Hero stat / "current state" cell separation
- **Why:** The current plan view's section 01 stat row has "Status quo" as a single cell. After T1.7 / T1.10, this should be the auto-extracted baseline, *not* the win.
- **Status:** covered by T1.10 (the `heroStat` field is the win; the stat row's "Current state" cell uses the auto-extracted baseline).

#### T3.12 — Time format i18n
- **Why:** `formatTime` at `app.jsx:146-152` hardcodes en-US (`"2:14 PM"`). A TDBP in another locale gets American time.
- **Fix:** use `toLocaleTimeString()` instead. Or accept that v3 is en-US-only and note it.

---

## 7. Implementation order

The 13 Tier 1 items are the bulk of the work. Suggested order, sized by dependency:

| Pass | Items | Why this order |
|---|---|---|
| **0. Foundation** | §2 source-of-truth, §3 cost de-emphasis, §4 light mode + accent | Structural / cross-cutting. Must be done before feature work so subsequent changes don't fight the source-of-truth duplication. Light mode is a small CSS exercise that touches everything; do it early so the rest is light-mode-correct by default. |
| **1. Schema foundations** | T1.1 stakeholder map, T1.2 business case, T1.12 format choice, T1.7 task-level phases, T1.8 dates, T1.9 status | New field types and the phase schema change. Everything else layers on top. The phase schema change in T1.7 is the riskiest single change — it touches the FieldRenderer, PlanView, and all three export functions. |
| **2. Estimator + 6th template** | T1.10 scope estimator, T1.13 Course Development template | The estimator is a new module + a new route + a new UI surface. The 6th template is a new entry in `templates.js` that consumes the new field types from pass 1. |
| **3. Cadence** | T1.3 scope-exclusion, T1.4 open-questions, T1.11 status review cadence, T1.5 pilot design, T1.6 compliance strengthening, T2.1 assumptions, T2.2 existing-materials, T2.3 baseline, T2.4 plan-RACI, T2.7 localization, T2.8 maintenance log, T2.9 approval gates, T2.12 plan approval | Field additions and template prompt rewrites. Most are 5-30 lines each. The compliance template (T1.6) is the only one with non-trivial template work. |
| **4. Polish** | All Tier 2 / 3 items | T2.5 validate-this-plan (new UI), T2.6 / T2.10 / T2.11 / T2.13 (covered by T1.7), T2.14 scope estimator integration, T3.1 error boundary, T3.2 slide deck bug, T3.3 breadcrumb bug, T3.4 edit hint, T3.5 save indicator, T3.6 extractStat, T3.7 phase cost sum, T3.8 IDB warning, T3.9 custom framework, T3.10 linked-to tag, T3.12 time i18n. |
| **5. Reframe** | §1 goal reframe | Done last so all the new code already has the reframe-correct copy. |

Estimated total: ~2,000 lines of new code, ~500 lines of changes to existing code.

---

## 8. Out of scope (deferred)

Items not in v3, with reasoning:

- **Version history.** Iterations overwrite. A TDBP who iterates with their VP would want a "this is the version we sent Maria" trail. Needs a new IndexedDB store and a diff UI. Defer to v4.
- **Comments / annotations.** A VP redlining a plan via JSON email can't leave inline feedback. Defer to v4.
- **Undo / redo.** Standard editor affordance. Defer to v4.
- **Multi-user editing.** Cadence is single-user. Stays that way.
- **Mobile-optimized editor.** The plan view is responsive; the build flow is desktop-first. Stays that way for v3.
- **Markdown / clipboard export.** Originally item E in the old PROPOSED_CHANGES. Still deferred. The slide deck export covers most of the "paste into a doc" use case.
- **Empty-state copy polish.** Originally item F. Defer.
- **"Templates that don't need a sponsor" (item from v2 future work).** Sponsor is already optional in v2 code. No further work needed.
- **Custom measurement frameworks (user-defined additions).** The 7-framework dropdown is sufficient for v3. v4 could let users add their own.
- **Sync between devices.** No server, no sync. The JSON export covers it.
- **Server-side anything.** Cadence is local-first. Stays that way.

---

## 9. Notes / tradeoffs

- **Phase schema change (T1.7) is the biggest risk.** It touches the FieldRenderer, the PlanView, the PlanSection, all three export functions (HTML, slides, sample), the buildSampleProject, and the migrateProject. The change is *additive* — old fields stay, new fields default to empty — so the migration is zero-effort. But the field renderer rewrite is ~100 lines. Worth a separate commit and a manual test pass.
- **Scope estimator (T1.10) is the biggest single new feature.** It's a new module, a new route, a new UI surface, a new IndexedDB write path, and 17 new benchmark rows. The benchmark values are placeholders — the user (or I, with the user's sign-off) populates them from ATD research. Easy to break into: (a) `benchmarks.js` schema + defaults, (b) the `/scope` route, (c) the integration with `totalEffort` on the project.
- **Light mode (T4) is a small change with high visual impact.** The CSS is already in custom properties. The work is just the light-mode overrides (~50 lines) + the toggle. But it touches every component visually, so regressions are possible. The verification: open in light mode, walk all 5 templates end-to-end, export HTML, export slides, import JSON, delete a project. Should take 30 minutes.
- **Accent customization (T4) interacts with template accents.** The current code uses each template's `accent` field for the dashboard row's left-border bar (`app.jsx:599`). After T4, the user accent overrides this. The template accent becomes a fallback only when the user hasn't picked a custom accent. This is the right behavior, but it's a design decision worth confirming.
- **No tests in v3.** Adding tests would require a test runner (a separate test HTML or a Node script). Out of scope. The Tier 1 features are testable by hand: walk all 5 templates end-to-end, check each new field renders and saves, check the exports include the new content. ~2 hours of manual QA.
- **Migrations are all additive.** The new fields default to empty. No existing project breaks. The only migration concern is T1.2 (business case), which moves `costOfCurrent` and `totalCost` into a `businessCase` object — a one-line migration in `migrateProject`.
- **The reframe (item 1) is the smallest change with the highest leverage.** It touches ~10 lines of prose (README, template prompts, summary card label) but signals the whole shift in the product's voice. Worth doing as the first commit even if the rest is deferred.
