// Cadence — Benchmark library
// 17 L&D deliverable types with default hours-per-unit ratios.
// Default source: ATD (Association for Talent Development) industry research.
// All values are editable by the user — this file is a starting point, not a fixed standard.
//
// Schema: each row has hoursPerUnit (the base rate), and a global activity
// split (Design / Develop / Review / Revise) applied to the computed total.
// The scope estimator (index.html) reads window.BENCHMARKS and uses these to
// compute the project's totalEffort and scopeBreakdown.

const BENCHMARK_ACTIVITY_SPLIT = {
  design:  0.30,
  develop: 0.50,
  review:  0.10,
  revise:  0.10
};

const BENCHMARKS = [
  // Live / cohort
  { id: 'ilt',         deliverable: 'ILT (live or vILT)',         unit: '1 hr instruction',    unitPlural: 'hrs of instruction', hoursPerUnit: 49,   group: 'Live', aliases: ['ilt'] },
  { id: 'workshop',    deliverable: 'Workshop',                    unit: '1 hr instruction',    unitPlural: 'hrs of instruction', hoursPerUnit: 50,   group: 'Live', aliases: ['workshop'] },
  { id: 'cohort',      deliverable: 'Cohort-based program',        unit: '1 hr instruction',    unitPlural: 'hrs of instruction', hoursPerUnit: 60,   group: 'Live', aliases: [] },

  // Self-paced
  { id: 'elearn-std',  deliverable: 'eLearning: standard (linear content)',     unit: '1 hr instruction',    unitPlural: 'hrs of content',      hoursPerUnit: 48.5, group: 'Self-paced', aliases: ['elearn-std', 'elearn'] },
  { id: 'elearn-hi',   deliverable: 'eLearning: high interactivity (simulations, branching)', unit: '1 hr instruction', unitPlural: 'hrs of content',      hoursPerUnit: 120,  group: 'Self-paced', aliases: ['elearn-hi'] },
  { id: 'micro',       deliverable: 'Microlearning module',        unit: '1 module (~5 min)',    unitPlural: 'modules',             hoursPerUnit: 20,   group: 'Self-paced', aliases: ['micro'] },

  // Video & media
  { id: 'video-sim',   deliverable: 'Video: talking head (record + light edit)',     unit: '1 min finished',      unitPlural: 'min of finished video', hoursPerUnit: 1,   group: 'Video & media', aliases: ['video-sim'] },
  { id: 'video-mod',   deliverable: 'Video: with graphics (record + graphics + edit)', unit: '1 min finished',      unitPlural: 'min of finished video', hoursPerUnit: 3,   group: 'Video & media', aliases: ['video-mod', 'video'] },
  { id: 'video-cplx',  deliverable: 'Video: explainer (script + storyboard + motion + edit)', unit: '1 min finished',      unitPlural: 'min of finished video', hoursPerUnit: 6,   group: 'Video & media', aliases: ['video-cplx'] },

  // Documents & aids
  { id: 'one-pager',   deliverable: 'One-pager / quick reference', unit: '1 page',              unitPlural: 'pages',               hoursPerUnit: 4,    group: 'Documents & aids', aliases: ['one-pager'] },
  { id: 'job-aid',     deliverable: 'Job aid / playbook',          unit: '1 page',              unitPlural: 'pages',               hoursPerUnit: 6,    group: 'Documents & aids', aliases: ['job-aid'] },
  { id: 'storyboard',  deliverable: 'Storyboard',                  unit: '1 hr source',         unitPlural: 'hrs of source',       hoursPerUnit: 12,   group: 'Documents & aids', aliases: [] },
  { id: 'infographic', deliverable: 'Infographic',                 unit: '1 piece',             unitPlural: 'pieces',              hoursPerUnit: 8,    group: 'Documents & aids', aliases: [] },
  { id: 'worksheet',   deliverable: 'Worksheet / workbook',        unit: '1 page',              unitPlural: 'pages',               hoursPerUnit: 2,    group: 'Documents & aids', aliases: [] },

  // People & process
  { id: 'part-guide',  deliverable: 'Participant guide',           unit: '1 module',            unitPlural: 'modules',             hoursPerUnit: 16,   group: 'People & process', aliases: [] },
  { id: 'inst-guide',  deliverable: 'Instructor guide',            unit: '1 module',            unitPlural: 'modules',             hoursPerUnit: 12,   group: 'People & process', aliases: [] },
  { id: 'translation', deliverable: 'Translation',                 unit: '1 hr source',         unitPlural: 'hrs of source',       hoursPerUnit: 8,    group: 'People & process', aliases: [] },
  { id: 'assessment',  deliverable: 'Assessment / quiz',           unit: '1 question',          unitPlural: 'questions',           hoursPerUnit: 1,    group: 'People & process', aliases: [] },
  { id: 'podcast',     deliverable: 'Podcast / audio',             unit: '1 min finished',      unitPlural: 'min of finished audio', hoursPerUnit: 3,   group: 'People & process', aliases: [] }
];

// Exposure for the inlined app in index.html
if (typeof window !== 'undefined') {
  window.BENCHMARKS = BENCHMARKS;
  window.BENCHMARK_ACTIVITY_SPLIT = BENCHMARK_ACTIVITY_SPLIT;
}
