// Cadence — Template Library
// Each template defines:
//   - id, name, tagline, description, accent
//   - statHints: { population, primary, cost } — field ids ('auto' | 'omit' | fieldId)
//   - 6 steps with prompts (the wizard)
//   - measurement framework options for step 6
//   - schema fields surfaced in the plan view (one-pager output)
//
// v2 changes (per PROPOSED_CHANGES.md):
//   - Cost fields softened to optional (#13), prompts no longer presume budget
//   - Audience split into role / size / context (#17)
//   - Intervention multiselect gains per-option detailPrompt (#16)
//   - New `deliverables` list-of-objects field in step 4 (#15)
//   - New `measurementFramework` select in step 6 (#18)
//   - New `sustainmentOwner` + `handoffPlan` in step 6 (#22)
//   - New `risks` + `readinessItems` lists under Advanced in step 5 (#19, #23)
//   - Phases gain optional approver / supporters / dependsOn (#20, #21)
//   - Per-template statHints (#4) — Cost card auto-hides when 'omit' or empty

const INTERVENTION_OPTIONS_BASE = [
  // Live / cohort — map directly to scope estimator benchmarks
  { value: 'ilt',             label: 'ILT (live or vILT)',         sub: 'instructor-led, live or virtual', quantitative: true,  unitLabel: 'hours of instruction', detailPrompt: 'Hours of instruction (e.g., 6 hrs)' },
  { value: 'workshop',        label: 'Workshop',                   sub: 'interactive live session',       quantitative: true,  unitLabel: 'hours of instruction', detailPrompt: 'Hours (e.g., 4 hrs)' },
  // Self-paced — map to eLearning / microlearning / video
  { value: 'elearn',          label: 'eLearning',                  sub: 'self-paced digital module',      quantitative: true,  unitLabel: 'hours of content',     detailPrompt: 'Hours of content (e.g., 4 hrs)' },
  { value: 'micro',           label: 'Microlearning',              sub: 'short focused module, ~5 min',   quantitative: true,  unitLabel: 'modules',              detailPrompt: 'Number of modules (e.g., 5 modules)' },
  { value: 'video',           label: 'Video',                      sub: 'recorded video content',         quantitative: true,  unitLabel: 'minutes of finished video', detailPrompt: 'Minutes of finished video (e.g., 12 min)' },
  // Documents & aids — map to one-pager / job-aid
  { value: 'one-pager',       label: 'One-pager / quick reference', sub: 'single-page summary or reference', quantitative: true,  unitLabel: 'pages',              detailPrompt: 'Pages (e.g., 1 pp)' },
  { value: 'job-aid',         label: 'Job aid / playbook',          sub: 'in-flow reference',              quantitative: true,  unitLabel: 'pages',              detailPrompt: 'Pages (e.g., 24 pp)' },
  // People & process — no direct benchmark match (relationship / org work)
  { value: 'coaching',        label: 'Coaching',                   sub: 'peer, manager, or external',     quantitative: false, unitLabel: '',                    detailPrompt: 'Format (e.g., peer mentor, weekly 1:1)' },
  { value: 'process',         label: 'Process change',              sub: 'workflow or policy',            quantitative: false, unitLabel: '',                    detailPrompt: 'What changes (e.g., manager 1:1 cadence policy)' },
  { value: 'knowledge-base',  label: 'Knowledge base',              sub: 'documentation library',         quantitative: false, unitLabel: '',                    detailPrompt: 'Format (e.g., searchable wiki, video library)' },
  { value: 'tooling',         label: 'Tooling',                     sub: 'new system, automation',        quantitative: false, unitLabel: '',                    detailPrompt: 'What (e.g., LMS module, Slack bot, CRM integration)' }
];

const STAKEHOLDER_TYPES = [
  { value: 'sponsor',      label: 'Sponsor' },
  { value: 'approver',     label: 'Approver' },
  { value: 'doer',         label: 'Doer' },
  { value: 'SME',          label: 'SME' },
  { value: 'implementer',  label: 'Implementer' },
  { value: 'champion',     label: 'Champion' },
  { value: 'resister',     label: 'Resister' },
  { value: 'impacted',     label: 'Impacted' }
];

const FORMAT_OPTIONS = []; // removed in v3 — step 4 intervention multiselect covers this with per-option format detail

const MEASUREMENT_FRAMEWORKS = [
  { value: '',                  label: '— Select a framework —' },
  { value: 'kirkpatrick',      label: 'Kirkpatrick L1–L4' },
  { value: 'phillips',         label: 'Phillips ROI' },
  { value: 'brinkerhoff',      label: 'Brinkerhoff Success Case' },
  { value: 'action-mapping',   label: 'Action Mapping' },
  { value: 'sam',              label: 'Successive Approximation (SAM)' },
  { value: 'custom',           label: 'Custom / mixed' }
];

const FRAMEWORK_LABELS = {
  'kirkpatrick':    'Kirkpatrick L1–L4',
  'phillips':       'Phillips ROI',
  'brinkerhoff':    'Brinkerhoff Success Case',
  'action-mapping': 'Action Mapping',
  'sam':            'Successive Approximation (SAM)',
  'custom':         'Custom / mixed'
};

const TEMPLATES = {

  'performance-gap': {
    id: 'performance-gap',
    name: 'Performance Gap',
    tagline: 'A team is underperforming. Build the case for what to do about it.',
    description: 'For when you suspect the problem is training, but want to be sure before you commit. Forces the diagnostic thinking that prevents building a course nobody needed.',
    accent: '#d8ff5c',
    statHints: { population: 'audienceSize',
                 primary:     'auto',
                 cost:        'businessCase.baseline' },
    steps: [
      {
        title: 'Project basics',
        prompt: 'Name the project, the sponsor, and the format.',
        fields: [
          { id: 'title',    label: 'Project title',       type: 'text',     placeholder: 'e.g., Reduce ramp time for new field sales reps' },
          { id: 'sponsor',  label: 'Sponsor / stakeholder', type: 'text',     placeholder: 'e.g., Maria Chen, VP Sales (optional — leave blank if no sponsor)' },
          { id: 'timeline', label: 'Target timeline',      type: 'text',     placeholder: 'e.g., Q2 2026 pilot, Q4 2026 full rollout' },
          { id: 'stakeholders', label: 'Stakeholders',      type: 'stakeholders', placeholder: 'Map at least the sponsor, the doers, and the resister.' }
        ]
      },
      {
        title: 'Frame the problem',
        prompt: 'What business outcome is at risk? Be specific. Numbers, timeframes, who is affected.',
        fields: [
          { id: 'problemHeadline', label: 'Problem headline', type: 'text',     placeholder: 'e.g., New field sales reps are taking 90 days to hit quota' },
          { id: 'problemDetail',    label: 'Problem in detail', type: 'textarea', placeholder: 'Describe what is broken, how long it has been happening, and the evidence you have. Specifics beat narrative.' },
          { id: 'audienceRole',     label: 'Audience — role',      type: 'text', placeholder: 'e.g., new field sales hires' },
          { id: 'audienceSize',     label: 'Audience — size',      type: 'text', placeholder: 'e.g., 12–18 per cohort, 4 cohorts / year' },
          { id: 'audienceContext',  label: 'Audience — context',   type: 'text', placeholder: 'e.g., Western region, ramp-critical first 90 days' },
          { id: 'businessCase',     label: 'Business case (optional)', type: 'businessCase' }
        ]
      },
      {
        title: 'Root cause',
        prompt: 'The most important step. Is this actually a learning problem, or something else?',
        fields: [
          { id: 'rootCause',            label: 'What is causing the gap',                              type: 'textarea', placeholder: 'Describe what you have found. Be honest about what you ruled out.' },
          { id: 'evidenceForLearning',  label: 'Evidence this is a learning gap vs. other root causes', type: 'textarea', placeholder: 'Why do you believe training/intervention will fix this rather than compensation, hiring, process, tools, or management?' },
          { id: 'rulesOut',             label: 'What you have already ruled out',                       type: 'text',     placeholder: 'e.g., Compensation, hiring profile, manager coaching quality' }
        ]
      },
      {
        title: 'Choose the approach',
        prompt: 'What kind of intervention fits? A real answer often mixes more than one. Each selected option reveals a per-format detail field below it.',
        fields: [
          { id: 'interventions', label: 'Intervention mix', type: 'multiselect', options: INTERVENTION_OPTIONS_BASE },
          { id: 'approachRationale', label: 'Why this mix', type: 'textarea', placeholder: 'Explain why these interventions and not others. The TDBP who can defend the mix gets the project done.' },
          { id: 'deliverables',  label: 'Deliverables', type: 'deliverables', placeholder: 'Add a deliverable for each artifact the L&D team will ship' }
        ]
      },
      {
        title: 'Build the plan',
        prompt: 'Phases, owners, dates. Realistic beats ambitious.',
        fields: [
          { id: 'phases',    label: 'Plan phases',                type: 'phases', placeholder: 'Add a phase for each major chunk of work. Each phase holds its own task list, dates, and status.' },
          { id: 'team',      label: 'Who is involved',             type: 'text',   placeholder: 'e.g., Ryan Cole (lead), 1 designer, 2 SMEs from Sales' }
        ],
        advanced: [
          { id: 'risks',          label: 'Risks & assumptions',     type: 'list', placeholder: 'Add a risk or assumption' },
          { id: 'readinessItems', label: 'Pre-launch readiness',     type: 'list', placeholder: 'Add a readiness checklist item' },
          { id: 'openQuestions',  label: 'Open questions',           type: 'openQuestions', placeholder: 'Add a question — unknowns to resolve before launch' }
        ]
      },
      {
        title: 'Define the win',
        prompt: 'How will you know it worked? Be specific. "They feel more confident" is not a win.',
        fields: [
          { id: 'successMetrics',        label: 'What success looks like', type: 'list', placeholder: 'Add a measurable outcome' },
          { id: 'measurementFramework',  label: 'Measurement framework',   type: 'select', options: MEASUREMENT_FRAMEWORKS },
          { id: 'measurementApproach',   label: 'How you will measure',    type: 'textarea', placeholder: 'Surveys, performance data, manager check-ins, system telemetry, etc. — tuned to the framework above.' },
          { id: 'reviewCadence',          label: 'When you will review',    type: 'text',  placeholder: 'e.g., 30/60/90 day check-ins, quarterly review with sponsor' },
          { id: 'sustainmentOwner',      label: 'Owner after launch (optional)', type: 'text', placeholder: 'e.g., Sales Enablement team — who owns this once L&D steps back' },
          { id: 'handoffPlan',           label: 'Handoff plan (optional)',       type: 'text', placeholder: 'e.g., transfer at Q4 cohort review; playbook moves into versioned annual update cycle' }
        ]
      }
    ]
  },

  'onboarding': {
    id: 'onboarding',
    name: 'Onboarding',
    tagline: 'A new role, a new hire, a faster ramp.',
    description: 'For building a ramp system for a specific role. The output is a structured 30/60/90 plan with a playbook, not a generic orientation deck.',
    accent: '#5cb8ff',
    statHints: { population: 'audienceSize', primary: 'auto', cost: 'businessCase.baseline' },
    steps: [
      {
        title: 'Project basics',
        prompt: 'What role, and who is sponsoring this?',
        fields: [
          { id: 'title',    label: 'Project title',       type: 'text', placeholder: 'e.g., New Field Technician Onboarding Program' },
          { id: 'sponsor',  label: 'Sponsor / stakeholder', type: 'text', placeholder: 'e.g., David Park, Director of Field Operations (optional)' },
          { id: 'timeline', label: 'Target timeline',      type: 'text', placeholder: 'e.g., Design Q1, pilot Q2, rollout Q3' },
          { id: 'stakeholders', label: 'Stakeholders',      type: 'stakeholders', placeholder: 'Map at least the sponsor, the doers, and the resister.' }
        ]
      },
      {
        title: 'Frame the problem',
        prompt: 'What is the current state of ramping new hires into this role?',
        fields: [
          { id: 'problemHeadline', label: 'Problem headline', type: 'text',     placeholder: 'e.g., New field technicians take 6 months to work independently' },
          { id: 'problemDetail',   label: 'Problem in detail', type: 'textarea', placeholder: 'What does the first 90 days look like now? Where do new hires get stuck? What feedback do hiring managers and new hires give?' },
          { id: 'audienceRole',    label: 'Audience — role',     type: 'text', placeholder: 'e.g., new field technicians' },
          { id: 'audienceSize',    label: 'Audience — size',     type: 'text', placeholder: 'e.g., 8–12 per quarter' },
          { id: 'audienceContext', label: 'Audience — context',  type: 'text', placeholder: 'e.g., field-based, multi-region, 24/7 shift coverage' },
          { id: 'businessCase',    label: 'Business case (optional)', type: 'businessCase' }
        ]
      },
      {
        title: 'Root cause',
        prompt: 'Why is ramp slow? Look beyond "we need more training."',
        fields: [
          { id: 'rootCause',           label: 'What is causing the slow ramp', type: 'textarea', placeholder: 'Gap between hire and first productive work? No structured playbook? Inconsistent peer support? Unclear expectations?' },
          { id: 'evidenceForLearning', label: 'Evidence this can be solved with better onboarding', type: 'textarea', placeholder: 'Do tenured hires in this role ramp new hires faster when given a structure? What does the data say?' },
          { id: 'rulesOut',            label: 'What you have already ruled out', type: 'text', placeholder: 'e.g., Hire quality, compensation competitiveness, tool access' }
        ]
      },
      {
        title: 'Choose the approach',
        prompt: 'Onboarding is more than training. What mix of interventions fits? Each selected option reveals a per-format detail field.',
        fields: [
          { id: 'interventions', label: 'Intervention mix', type: 'multiselect', options: INTERVENTION_OPTIONS_BASE },
          { id: 'approachRationale', label: 'Why this mix', type: 'textarea', placeholder: 'Which parts of the ramp need structured teaching vs. in-flow reference vs. peer support?' },
          { id: 'deliverables',  label: 'Deliverables', type: 'deliverables', placeholder: 'Add a deliverable for each artifact the L&D team will ship' }
        ]
      },
      {
        title: 'Build the plan',
        prompt: 'Build a 30/60/90 or other milestone-anchored plan.',
        fields: [
          { id: 'phases',    label: 'Plan phases',                type: 'phases', placeholder: 'Add a phase — typically 30/60/90 milestones or pre-pilot/pilot/rollout. Each phase holds its own task list, dates, and status.' },
          { id: 'team',      label: 'Who is involved',             type: 'text',   placeholder: 'e.g., Ryan Cole, 1 SME, 1 manager from the role' }
        ],
        advanced: [
          { id: 'risks',          label: 'Risks & assumptions',     type: 'list', placeholder: 'Add a risk or assumption' },
          { id: 'readinessItems', label: 'Pre-launch readiness',     type: 'list', placeholder: 'Add a readiness checklist item' },
          { id: 'openQuestions',  label: 'Open questions',           type: 'openQuestions', placeholder: 'Add a question — unknowns to resolve before launch' }
        ]
      },
      {
        title: 'Define the win',
        prompt: 'What does a successful ramp look like?',
        fields: [
          { id: 'successMetrics',       label: 'What success looks like', type: 'list', placeholder: 'Add a measurable outcome' },
          { id: 'measurementFramework', label: 'Measurement framework',   type: 'select', options: MEASUREMENT_FRAMEWORKS },
          { id: 'measurementApproach',  label: 'How you will measure',    type: 'textarea', placeholder: 'Time to first solo shift, 90-day retention, new hire confidence survey, manager satisfaction' },
          { id: 'reviewCadence',        label: 'When you will review',    type: 'text',  placeholder: 'e.g., Review first cohort at 30/60/90, then quarterly' },
          { id: 'sustainmentOwner',     label: 'Owner after launch (optional)', type: 'text', placeholder: 'e.g., Field Operations manager — who owns this once L&D steps back' },
          { id: 'handoffPlan',          label: 'Handoff plan (optional)',       type: 'text', placeholder: 'e.g., transfer at end of Q3; playbook owned by Field Ops going forward' }
        ]
      }
    ]
  },

  'system-rollout': {
    id: 'system-rollout',
    name: 'New System Rollout',
    tagline: 'New tool, new process, new habit. Adoption is the win.',
    description: 'For when the org bought new software, changed a process, or rolled out a new tool. The hardest part is not teaching — it is adoption. This template forces you to think beyond training to manager enablement and in-flow support.',
    accent: '#ff9f5c',
    statHints: { population: 'audienceSize', primary: 'auto', cost: 'businessCase.baseline' },
    steps: [
      {
        title: 'Project basics',
        prompt: 'What is rolling out, and to whom?',
        fields: [
          { id: 'title',    label: 'Project title',        type: 'text', placeholder: 'e.g., CRM Migration to Salesforce — Western Region' },
          { id: 'sponsor',  label: 'Sponsor / stakeholder', type: 'text', placeholder: 'e.g., Sarah Lin, CIO (optional)' },
          { id: 'timeline', label: 'Target timeline',      type: 'text', placeholder: 'e.g., Go-live March 15, training by March 1' },
          { id: 'stakeholders', label: 'Stakeholders',      type: 'stakeholders', placeholder: 'Map at least the sponsor, the doers, and the resister.' }
        ]
      },
      {
        title: 'Frame the problem',
        prompt: 'What is changing, and what is the cost of the change not sticking?',
        fields: [
          { id: 'problemHeadline', label: 'What is rolling out', type: 'text',     placeholder: 'e.g., Migrating 240 field reps from legacy CRM to Salesforce' },
          { id: 'problemDetail',   label: 'Current state vs. target state', type: 'textarea', placeholder: 'What is the gap today? Why is the change needed? What happens if adoption stalls?' },
          { id: 'audienceRole',    label: 'Audience — role',     type: 'text', placeholder: 'e.g., field sales reps + their managers' },
          { id: 'audienceSize',    label: 'Audience — size',     type: 'text', placeholder: 'e.g., 240 reps, 18 managers, 4 regional directors' },
          { id: 'audienceContext', label: 'Audience — context',  type: 'text', placeholder: 'e.g., multi-region, mobile-first, varying tech literacy' },
          { id: 'businessCase',    label: 'Business case (optional)', type: 'businessCase' }
        ]
      },
      {
        title: 'Root cause',
        prompt: 'Why do rollouts like this fail? What are you designing around?',
        fields: [
          { id: 'rootCause',           label: 'Why rollouts typically fail here', type: 'textarea', placeholder: 'Lack of manager reinforcement? Bad timing? Inadequate in-flow support? Fear of the new tool? Workarounds easier than the right way?' },
          { id: 'evidenceForLearning', label: 'What worked or did not in past rollouts', type: 'textarea', placeholder: 'Reference any past rollouts. What drove adoption? What killed it?' },
          { id: 'rulesOut',            label: 'What you have already addressed', type: 'text', placeholder: 'e.g., IT support coverage, license provisioning, data migration timeline' }
        ]
      },
      {
        title: 'Choose the approach',
        prompt: 'Rollouts fail when training ends and adoption has not started. Build beyond the training event.',
        fields: [
          { id: 'interventions', label: 'Intervention mix', type: 'multiselect', options: INTERVENTION_OPTIONS_BASE },
          { id: 'approachRationale', label: 'Why this mix', type: 'textarea', placeholder: 'How will you reach people before, during, and after go-live? Who reinforces the change?' },
          { id: 'deliverables',  label: 'Deliverables', type: 'deliverables', placeholder: 'Add a deliverable for each artifact the L&D team will ship' }
        ]
      },
      {
        title: 'Build the plan',
        prompt: 'Build a time-anchored plan keyed to go-live.',
        fields: [
          { id: 'phases',    label: 'Plan phases',                type: 'phases', placeholder: 'Add a phase — typically pre-launch / launch / post-launch. Each phase holds its own task list, dates, and status.' },
          { id: 'team',      label: 'Who is involved',             type: 'text',   placeholder: 'e.g., Ryan Cole, IT lead, change manager, 3 power users as SMEs' }
        ],
        advanced: [
          { id: 'risks',          label: 'Risks & assumptions',     type: 'list', placeholder: 'Add a risk or assumption' },
          { id: 'readinessItems', label: 'Pre-launch readiness',     type: 'list', placeholder: 'Add a readiness checklist item' },
          { id: 'openQuestions',  label: 'Open questions',           type: 'openQuestions', placeholder: 'Add a question — unknowns to resolve before launch' }
        ]
      },
      {
        title: 'Define the win',
        prompt: 'Adoption is the metric. Not completion of training.',
        fields: [
          { id: 'successMetrics',       label: 'What success looks like', type: 'list', placeholder: 'Add an adoption metric' },
          { id: 'measurementFramework', label: 'Measurement framework',   type: 'select', options: MEASUREMENT_FRAMEWORKS },
          { id: 'measurementApproach',  label: 'How you will measure',    type: 'textarea', placeholder: 'System usage data, manager check-ins, ticket volume, time-to-task-completion, NPS' },
          { id: 'reviewCadence',        label: 'When you will review',    type: 'text',  placeholder: 'e.g., 30/60/90 days post-launch, monthly until adoption target hit' },
          { id: 'sustainmentOwner',      label: 'Owner after launch (optional)', type: 'text', placeholder: 'e.g., Sales Ops — who owns ongoing enablement' },
          { id: 'handoffPlan',           label: 'Handoff plan (optional)',       type: 'text', placeholder: 'e.g., transfer 60 days post-launch; quarterly refresher built into Sales Ops cadence' }
        ]
      }
    ]
  },

  'leadership-dev': {
    id: 'leadership-dev',
    name: 'Leadership Development',
    tagline: 'Build a leader, not a curriculum.',
    description: 'For leadership pipelines, cohorts, or specific leader development. The hard part is that the ROI is squishy and the structure often is not. This template forces concrete behaviors, milestones, and stakeholder support.',
    accent: '#b88aff',
    statHints: { population: 'audienceSize', primary: 'auto', cost: 'businessCase.baseline' },
    steps: [
      {
        title: 'Project basics',
        prompt: 'Who is being developed, and by whom?',
        fields: [
          { id: 'title',    label: 'Project title',        type: 'text', placeholder: 'e.g., Frontline Manager Development Cohort — Q2' },
          { id: 'sponsor',  label: 'Sponsor / stakeholder', type: 'text', placeholder: 'e.g., Janet Wu, CHRO (optional)' },
          { id: 'timeline', label: 'Target timeline',      type: 'text', placeholder: 'e.g., 6-month cohort starting April' },
          { id: 'stakeholders', label: 'Stakeholders',      type: 'stakeholders', placeholder: 'Map at least the sponsor, the doers, and the resister.' }
        ]
      },
      {
        title: 'Frame the problem',
        prompt: 'What leadership gap are you addressing? Be honest about the business case.',
        fields: [
          { id: 'problemHeadline', label: 'Leadership gap', type: 'text',     placeholder: 'e.g., First-time managers are getting promoted without people skills' },
          { id: 'problemDetail',   label: 'What is the evidence', type: 'textarea', placeholder: 'Engagement scores? Retention of their teams? 360 feedback patterns? Specific incidents? What is the cost of not addressing it?' },
          { id: 'audienceRole',    label: 'Audience — role',     type: 'text', placeholder: 'e.g., first-time managers across 3 regions' },
          { id: 'audienceSize',    label: 'Audience — size',     type: 'text', placeholder: 'e.g., 24 managers, 3 cohorts of 8' },
          { id: 'audienceContext', label: 'Audience — context',  type: 'text', placeholder: 'e.g., newly promoted within last 6 months, varied function' },
          { id: 'businessCase',    label: 'Business case (optional)', type: 'businessCase' }
        ]
      },
      {
        title: 'Root cause',
        prompt: 'Why is the gap there? What is the organization doing (or not doing) that creates it?',
        fields: [
          { id: 'rootCause',           label: 'Why this gap exists', type: 'textarea', placeholder: 'Promotion criteria? No development path? Manager support missing? Role clarity? Skip-level trust?' },
          { id: 'evidenceForLearning', label: 'Why a development program will help', type: 'textarea', placeholder: 'What evidence says structured development works here? What is the alternative?' },
          { id: 'rulesOut',            label: 'What you have already addressed', type: 'text', placeholder: 'e.g., Manager selection criteria, role redesign' }
        ]
      },
      {
        title: 'Choose the approach',
        prompt: 'Leadership development that sticks needs more than a workshop. Build the full system.',
        fields: [
          { id: 'interventions', label: 'Intervention mix', type: 'multiselect', options: INTERVENTION_OPTIONS_BASE },
          { id: 'approachRationale', label: 'Why this mix', type: 'textarea', placeholder: 'How does this build skill, apply it on the job, and reinforce it over time?' },
          { id: 'deliverables',  label: 'Deliverables', type: 'deliverables', placeholder: 'Add a deliverable for each artifact the L&D team will ship' }
        ]
      },
      {
        title: 'Build the plan',
        prompt: 'Build a milestone-anchored cohort plan.',
        fields: [
          { id: 'phases',    label: 'Plan phases',                type: 'phases', placeholder: 'Add a phase — typically kickoff / core / sustain / measure. Each phase holds its own task list, dates, and status.' },
          { id: 'team',      label: 'Who is involved',             type: 'text',   placeholder: 'e.g., Ryan Cole, external coach, CHRO advisor' }
        ],
        advanced: [
          { id: 'risks',          label: 'Risks & assumptions',     type: 'list', placeholder: 'Add a risk or assumption' },
          { id: 'readinessItems', label: 'Pre-launch readiness',     type: 'list', placeholder: 'Add a readiness checklist item' },
          { id: 'openQuestions',  label: 'Open questions',           type: 'openQuestions', placeholder: 'Add a question — unknowns to resolve before launch' }
        ]
      },
      {
        title: 'Define the win',
        prompt: 'What observable change will tell you the cohort landed?',
        fields: [
          { id: 'successMetrics',       label: 'What success looks like', type: 'list', placeholder: 'Add a behavior or outcome metric' },
          { id: 'measurementFramework', label: 'Measurement framework',   type: 'select', options: MEASUREMENT_FRAMEWORKS },
          { id: 'measurementApproach',  label: 'How you will measure',    type: 'textarea', placeholder: 'Pre/post 360, manager observations, team engagement scores, retention of their reports, artifact review' },
          { id: 'reviewCadence',        label: 'When you will review',    type: 'text',  placeholder: 'e.g., Mid-cohort and end-of-cohort reviews, 6-month post check' },
          { id: 'sustainmentOwner',      label: 'Owner after launch (optional)', type: 'text', placeholder: 'e.g., HR Business Partner team — who owns this once L&D steps back' },
          { id: 'handoffPlan',           label: 'Handoff plan (optional)',       type: 'text', placeholder: 'e.g., transfer 90 days post-cohort; alumni network maintained by HRBP' }
        ]
      }
    ]
  },

  'compliance': {
    id: 'compliance',
    name: 'Compliance',
    tagline: 'Required training, done well, with proof.',
    description: 'For training that the org is required to deliver — safety, regulatory, legal, harassment prevention. The hard part is not the content. It is coverage, retention, and audit-ready proof.',
    accent: '#ff6b8a',
    statHints: { population: 'audienceSize', primary: 'auto', cost: 'businessCase.baseline' },
    steps: [
      {
        title: 'Project basics',
        prompt: 'What compliance requirement are you addressing?',
        fields: [
          { id: 'title',    label: 'Project title',       type: 'text', placeholder: 'e.g., Annual Workplace Safety Training — 2026' },
          { id: 'sponsor',  label: 'Sponsor / stakeholder', type: 'text', placeholder: 'e.g., Legal / Risk / HR (optional)' },
          { id: 'timeline', label: 'Target completion',     type: 'text', placeholder: 'e.g., All staff by June 30, 2026' },
          { id: 'stakeholders', label: 'Stakeholders',      type: 'stakeholders', placeholder: 'Map at least the sponsor, the doers, and the resister.' }
        ]
      },
      {
        title: 'Frame the problem',
        prompt: 'What is the requirement, and what is the cost of non-compliance?',
        fields: [
          { id: 'problemHeadline', label: 'Requirement', type: 'text',     placeholder: 'e.g., OSHA-mandated annual safety training for all field staff' },
          { id: 'problemDetail',   label: 'Why this training is required', type: 'textarea', placeholder: 'Cite the regulation, the audit cycle, the documentation needed. What is the consequence of non-compliance?' },
          { id: 'audienceRole',    label: 'Audience — role',     type: 'text', placeholder: 'e.g., field staff + office staff (subset of modules)' },
          { id: 'audienceSize',    label: 'Audience — size',     type: 'text', placeholder: 'e.g., 320 field staff + 80 office staff' },
          { id: 'audienceContext', label: 'Audience — context',  type: 'text', placeholder: 'e.g., multi-shift, multi-region, varying tech access' },
          { id: 'businessCase',    label: 'Business case (optional)', type: 'businessCase' }
        ]
      },
      {
        title: 'Root cause',
        prompt: 'What makes compliance training fail? What are you designing around?',
        fields: [
          { id: 'rootCause',           label: 'Why compliance training typically fails', type: 'textarea', placeholder: 'Low engagement? Click-through culture? Low retention? Inability to prove completion? Inaccessible content?' },
          { id: 'evidenceForLearning', label: 'What effectiveness data exists', type: 'textarea', placeholder: 'What is the baseline? What does the regulator expect beyond completion? What are the high-risk roles?' },
          { id: 'rulesOut',            label: 'What you have already addressed', type: 'text', placeholder: 'e.g., LMS tracking, manager accountability, content legal review' }
        ]
      },
      {
        title: 'Choose the approach',
        prompt: 'Compliance can be boring. It does not have to be ineffective. Pick the delivery that fits the requirement.',
        fields: [
          { id: 'interventions', label: 'Intervention mix', type: 'multiselect', options: INTERVENTION_OPTIONS_BASE },
          { id: 'approachRationale', label: 'Why this delivery', type: 'textarea', placeholder: 'What fits the requirement, the audience, and the audit trail needed?' },
          { id: 'deliverables',  label: 'Deliverables', type: 'deliverables', placeholder: 'Add a deliverable for each artifact the L&D team will ship' }
        ]
      },
      {
        title: 'Build the plan',
        prompt: 'Build a coverage-anchored plan with deadlines and escalation.',
        fields: [
          { id: 'phases',    label: 'Plan phases',                type: 'phases', placeholder: 'Add a phase — typically design / launch / chase / audit. Each phase holds its own task list, dates, and status.' },
          { id: 'team',      label: 'Who is involved',             type: 'text',   placeholder: 'e.g., Ryan Cole, Legal reviewer, LMS admin' }
        ],
        advanced: [
          { id: 'risks',          label: 'Risks & assumptions',     type: 'list', placeholder: 'Add a risk or assumption' },
          { id: 'readinessItems', label: 'Pre-launch readiness',     type: 'list', placeholder: 'Add a readiness checklist item' },
          { id: 'openQuestions',  label: 'Open questions',           type: 'openQuestions', placeholder: 'Add a question — unknowns to resolve before launch' }
        ]
      },
      {
        title: 'Define the win',
        prompt: 'In compliance, the win is coverage, retention, and audit-ready proof.',
        fields: [
          { id: 'successMetrics',       label: 'What success looks like', type: 'list', placeholder: 'Add a coverage or retention metric' },
          { id: 'measurementFramework', label: 'Measurement framework',   type: 'select', options: MEASUREMENT_FRAMEWORKS },
          { id: 'measurementApproach',  label: 'How you will measure',    type: 'textarea', placeholder: 'LMS completion reports, knowledge checks, manager attestations, audit-ready documentation' },
          { id: 'reviewCadence',        label: 'When you will review',    type: 'text',  placeholder: 'e.g., Weekly during rollout, monthly thereafter, annual refresh' },
          { id: 'sustainmentOwner',      label: 'Owner after launch (optional)', type: 'text', placeholder: 'e.g., Compliance team — who owns this once L&D steps back' },
          { id: 'handoffPlan',           label: 'Handoff plan (optional)',       type: 'text', placeholder: 'e.g., transfer after audit window closes; refresh cycle owned by Compliance' }
        ]
      }
    ]
  },

  'course-dev': {
    id: 'course-dev',
    name: 'Course Development',
    tagline: 'Build a course, end to end. ADDIE-flavored, scaffolded.',
    description: 'For building a training course from scratch. The 4-phase structure (PM → Design → Development → Implementation) and 6 review-checkpoint tasks are pre-loaded; you edit, remove, or add. Built for the kind of work a TDBP does when a sponsor says "build me a course" — the project management scaffolding is the hard part, not the design itself.',
    accent: '#5cffd8',
    statHints: { population: 'audienceSize', primary: 'auto', cost: 'businessCase.baseline' },
    steps: [
      {
        title: 'Project basics',
        prompt: 'Name the course, the sponsor, and the timeline.',
        fields: [
          { id: 'title',    label: 'Course title',        type: 'text', placeholder: 'e.g., New Hire Safety Onboarding Course' },
          { id: 'sponsor',  label: 'Sponsor / stakeholder', type: 'text', placeholder: 'e.g., Maria Chen, VP L&D (optional)' },
          { id: 'timeline', label: 'Target launch',        type: 'text', placeholder: 'e.g., Q3 2026 launch' },
          { id: 'stakeholders', label: 'Stakeholders',      type: 'stakeholders', placeholder: 'Map at least the sponsor, the SMEs, and the LMS owner.' }
        ]
      },
      {
        title: 'Frame the problem',
        prompt: 'What is the performance gap, and what audience is the course for?',
        fields: [
          { id: 'problemHeadline', label: 'Performance gap', type: 'text',     placeholder: 'e.g., New hires aren\'t retaining safety procedures' },
          { id: 'problemDetail',   label: 'What is the evidence', type: 'textarea', placeholder: 'What does the data show? Where are the failure points? What is the cost of not addressing it?' },
          { id: 'audienceRole',    label: 'Audience — role',     type: 'text', placeholder: 'e.g., new field staff' },
          { id: 'audienceSize',    label: 'Audience — size',     type: 'text', placeholder: 'e.g., 60–80 hires per quarter' },
          { id: 'audienceContext', label: 'Audience — context',  type: 'text', placeholder: 'e.g., field-based, no prior safety training, 1-week onboarding window' },
          { id: 'businessCase',    label: 'Business case (optional)', type: 'businessCase' }
        ]
      },
      {
        title: 'Root cause',
        prompt: 'Why is a course the right intervention here? What did you rule out?',
        fields: [
          { id: 'rootCause',           label: 'Why a course vs. other interventions', type: 'textarea', placeholder: 'Why is a course the right answer here? What alternatives did you rule out (coaching, job aids, on-the-job training)?' },
          { id: 'evidenceForLearning', label: 'What effectiveness data exists', type: 'textarea', placeholder: 'Past course completions and outcomes? Industry benchmarks for similar content? Pre-existing materials to build on?' },
          { id: 'rulesOut',            label: 'What you have already addressed', type: 'text', placeholder: 'e.g., Manager accountability, on-the-job reinforcement, prior onboarding deck to repurpose' }
        ]
      },
      {
        title: 'Choose the approach',
        prompt: 'What mix of interventions fits the course? Each selected option reveals a per-format detail field below it.',
        fields: [
          { id: 'interventions', label: 'Intervention mix', type: 'multiselect', options: INTERVENTION_OPTIONS_BASE },
          { id: 'approachRationale', label: 'Why this mix', type: 'textarea', placeholder: 'How do the interventions reinforce each other? What\'s the role of the course itself vs. the surrounding system?' },
          { id: 'deliverables',  label: 'Deliverables', type: 'deliverables', placeholder: 'Add a deliverable for each artifact the L&D team will ship (modules, assessments, guides, media)' }
        ]
      },
      {
        title: 'Build the plan',
        prompt: 'Pre-loaded with the standard 4-phase structure (PM → Design → Development → Implementation) and 6 review checkpoints. Edit, remove, or add to the defaults.',
        fields: [
          {
            id: 'phases',
            label: 'Plan phases',
            type: 'phases',
            placeholder: 'Edit any phase to adjust name, dates, owner, tasks.',
            defaultPhases: [
              {
                name: 'Project Management',
                description: 'Develop the project plan and get stakeholder approval before design work begins.',
                duration: '2 weeks',
                approver: '', supporters: '',
                deliverable: 'Approved project plan',
                tasks: [
                  { name: 'Develop project plan' },
                  { name: 'Approve project plan (Stakeholders)' }
                ]
              },
              {
                name: 'Design',
                description: 'Topic analysis with SMEs, course outline, performance objectives, and stakeholder design approval.',
                duration: '4 weeks',
                approver: '', supporters: '',
                deliverable: 'Course outline + performance objectives (approved)',
                tasks: [
                  { name: 'Topic analysis (SMEs)' },
                  { name: 'Course outline / design doc' },
                  { name: 'Develop performance objectives' },
                  { name: 'Stakeholder design approval' }
                ]
              },
              {
                name: 'Development',
                description: 'Storyboard + assessment, develop PPT and modules per topic, three review cycles (Alpha, Beta, Gold), stakeholder sign-off.',
                duration: '8 weeks',
                approver: '', supporters: '',
                deliverable: 'Storyline source files + assessment + stakeholder sign-off',
                tasks: [
                  { name: 'Develop storyboard + assessment' },
                  { name: 'Pre-Alpha review (Talent Development)' },
                  { name: 'Alpha review (SMEs + Stakeholders)' },
                  { name: 'Develop PPT + modules (per topic)' },
                  { name: 'Pre-Beta review (Talent Development)' },
                  { name: 'Beta review (SMEs + Stakeholders, 80% complete)' },
                  { name: 'Complete beta edits + media' },
                  { name: 'Pre-Gold review (Talent Development)' },
                  { name: 'Gold review (SMEs + Stakeholders, 100% complete)' },
                  { name: 'Complete gold edits' },
                  { name: 'Stakeholder sign-off' }
                ]
              },
              {
                name: 'Implementation',
                description: 'LMS testing, final upload, resource channel, train the trainer.',
                duration: '2 weeks',
                approver: '', supporters: '',
                deliverable: 'Course live in LMS + resources uploaded + trainers ready',
                tasks: [
                  { name: 'LMS testing' },
                  { name: 'Final upload to LMS' },
                  { name: 'Upload resources (Teams channel)' },
                  { name: 'Train the trainer (if applicable)' }
                ]
              }
            ]
          },
          { id: 'team', label: 'Who is involved', type: 'text', placeholder: 'e.g., Ryan Cole (lead), 1 designer, 2 SMEs, 1 LMS admin' }
        ],
        advanced: [
          { id: 'risks',          label: 'Risks & assumptions',     type: 'list', placeholder: 'Add a risk or assumption' },
          { id: 'readinessItems', label: 'Pre-launch readiness',     type: 'list', placeholder: 'Add a readiness checklist item' },
          { id: 'openQuestions',  label: 'Open questions',           type: 'openQuestions', placeholder: 'Add a question — unknowns to resolve before launch' }
        ]
      },
      {
        title: 'Define the win',
        prompt: 'How will you know the course worked? Be specific. "They feel more confident" is not a win.',
        fields: [
          { id: 'successMetrics',        label: 'What success looks like', type: 'list', placeholder: 'Add a measurable outcome (knowledge gain, on-job behavior, retention)' },
          { id: 'measurementFramework',  label: 'Measurement framework',   type: 'select', options: MEASUREMENT_FRAMEWORKS },
          { id: 'measurementApproach',   label: 'How you will measure',    type: 'textarea', placeholder: 'Pre/post assessment scores, manager observation, on-job metrics, LMS completion + retention' },
          { id: 'reviewCadence',          label: 'When you will review',    type: 'text',  placeholder: 'e.g., 30/60/90 day post-launch, quarterly' },
          { id: 'sustainmentOwner',      label: 'Owner after launch (optional)', type: 'text', placeholder: 'e.g., L&D team — who owns the refresh cycle' },
          { id: 'handoffPlan',           label: 'Handoff plan (optional)',       type: 'text', placeholder: 'e.g., transfer at Gold sign-off; refresh cycle owned by L&D annually' }
        ]
      }
    ]
  }
};

const TEMPLATE_LIST = Object.values(TEMPLATES);

// Exposure for app.jsx (inlined into index.html; this file loads first)
if (typeof window !== 'undefined') {
  window.TEMPLATES = TEMPLATES;
  window.TEMPLATE_LIST = TEMPLATE_LIST;
  window.MEASUREMENT_FRAMEWORKS = MEASUREMENT_FRAMEWORKS;
  window.FRAMEWORK_LABELS = FRAMEWORK_LABELS;
  window.STAKEHOLDER_TYPES = STAKEHOLDER_TYPES;
}