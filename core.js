'use strict';
// Standalone public visual, adapted from TwinAssistant.tsx blob 83bb5068a6d4ab517a9ce810c16d4bdccaa515a7.
// No dashboard authentication, credentials, APIs, random learning timers or canned AI responses.
const $ = id => document.getElementById(id);
const makeFeature = (
  id,
  name,
  description,
  inputs,
  process,
  output,
  controls
) => ({ id, name, description, inputs, process, output, controls });
const F = makeFeature;
const CATALOGUE = [
  { id: "identity", name: "Project Intelligence", description: "Understand projects, people, suppliers, subcontractors and the context that connects them.", features: [
    F("identity-personality", "Project Context", "Understand the project, scope, client, site, status and key constraints before recommending or automating work.", "Project records", "Context assembly", "Project-aware intelligence", "Use verified project records and flag missing or conflicting information."),
    F("business-knowledge", "Company & Project Knowledge", "Retrieve relevant information from approved project documents, company procedures, contracts and records.", "Approved sources", "Relevant retrieval", "Grounded project answer", "Keep sources current and preserve project and company boundaries."),
    F("persistent-memory", "Project Memory", "Retain relevant decisions, constraints, commitments and unresolved items across the life of a project.", "Verified project events", "Scoped memory", "Project continuity", "Save useful facts with provenance rather than indiscriminate transcripts."),
    F("relationship-context", "Project Relationships", "Connect clients, suppliers, subcontractors and team members to the projects and responsibilities they belong to.", "Verified relationships", "Relationship mapping", "Connected project context", "Confirm identity and project association before joining information."),
    F("memory-management", "Context Management", "Review, correct and remove saved project context so the intelligence layer stays accurate.", "Saved context", "Review and correction", "Updated context", "Keep corrections traceable and respect retention requirements.")
  ] },
  { id: "communication", name: "Communication Intelligence", description: "Understand construction email, messages and correspondence and route each item into the right project workflow.", features: [
    F("voice-cloning", "Email & Message Intake", "Capture authorised project communication and identify the project, sender, document and request involved.", "Email or message", "Classification and matching", "Structured communication", "Verify mailbox access, project match and permitted data scope."),
    F("conversational-intelligence", "Construction Correspondence", "Interpret requests, questions and changes using the relevant project history and construction context.", "Project correspondence", "Context and intent", "Relevant response or action", "Escalate ambiguity and never invent project facts."),
    F("voice-messages", "Client & Trade Updates", "Prepare accurate project updates for clients, subcontractors and suppliers using verified information.", "Verified project status", "Contextual drafting", "Reviewable update", "Human approval can be required before external delivery."),
    F("speech-interaction", "RFI & RFQ Intelligence", "Recognise information and quotation requests, gather relevant context and prepare the next step.", "RFI or RFQ", "Project-aware routing", "Prepared response workflow", "Keep contractual and commercial approvals explicit."),
    F("human-handover", "Human Handover", "Escalate uncertain, sensitive or high-value matters to the right person with relevant context attached.", "Escalation condition", "Pause and transfer", "Human-led decision", "Automation remains paused until an authorised person continues it.")
  ] },
  { id: "automation", name: "Workflow Automation", description: "Turn incoming construction information into controlled, repeatable work across the systems the company already uses.", features: [
    F("workflow-orchestration", "Workflow Orchestration", "Coordinate triggers, checks, approvals, actions and exceptions across construction workflows.", "Defined trigger", "Controlled workflow", "Verified result", "Apply approvals, duplicate protection and exception handling."),
    F("email-automation", "Email-to-Action Automation", "Turn relevant inbox traffic into project tasks, drafts, reviews and follow-ups instead of manual re-entry.", "Permitted email", "Triage and routing", "Reviewable action", "Sending and external writes remain permission-controlled."),
    F("calendar-tasks", "Scheduling & Follow-Ups", "Coordinate project reminders, commitments, follow-ups and assigned actions from verified project events.", "Project commitments", "Scheduling rules", "Coordinated work", "Check dates, owners and dependencies before committing changes."),
    F("documents-data", "Document & Data Automation", "Read construction documents, extract structured fields and route them into the correct project process.", "Approved documents", "Extraction and validation", "Structured project data", "Flag uncertain fields for human review."),
    F("automated-briefings", "Automated Project Briefings", "Assemble concise project and company briefings from current priorities, changes, risks and unresolved work.", "Connected project records", "Priority synthesis", "Management briefing", "Show source freshness and distinguish unknowns from zeroes.")
  ] },
  { id: "sales", name: "Commercial & Cost Intelligence", description: "Use project, quote, invoice and material information to surface commercial changes and potential cost issues earlier.", features: [
    F("lead-qualification", "Estimating & Quote Context", "Bring scope, allowances, pricing and project context together to support faster estimating and quoting workflows.", "Scope and pricing data", "Commercial context", "Reviewable estimate inputs", "Do not invent quantities, rates or contractual assumptions."),
    F("nurturing-follow-up", "Automated Quote Follow-Up", "Track eligible proposals and prepare follow-ups when agreed timing and stopping rules are met.", "Proposal status", "Follow-up rules", "Relevant follow-up", "Stop on reply, decision, opt-out or human takeover."),
    F("pipeline-intelligence", "Cost & Margin Intelligence", "Compare estimates, commitments, purchases and progress to surface potential margin pressure and missing information.", "Commercial records", "Variance analysis", "Prioritised commercial review", "Forecasts are decision support, not guaranteed final outcomes."),
    F("customer-lifecycle", "Variation Intelligence", "Identify potential scope changes, collect supporting context and prepare a controlled variation review workflow.", "Scope change evidence", "Change detection", "Variation review", "Require appropriate contractual and commercial approval before issue."),
    F("retention", "Material Usage Intelligence", "Compare estimated quantities with purchased or delivered quantities and project progress to surface unusual consumption.", "Estimate, invoices and progress", "Quantity comparison", "Potential overrun signal", "Validate units, invoice interpretation and physical progress before relying on a forecast.")
  ] },
  { id: "crm", name: "Construction Integrations", description: "Connect Construct to the construction, accounting and communication systems a business already uses.", features: [
    F("crm-workspace", "Construction Workspace", "Bring project, contact, document, activity and AI workflow context into one management workspace.", "Company and project records", "Organised workspace", "Operational context", "Keep tenant, project and role boundaries explicit."),
    F("content-commerce", "Procore Integration", "Connect approved Procore project data and workflows where the customer plan, API access and permissions support it.", "Verified Procore access", "Scoped data exchange", "Connected project workflow", "Required endpoints and write permissions are verified during implementation."),
    F("revenue-performance", "Xero Integration", "Connect approved accounting data and draft workflows while preserving human approval for financial writes where required.", "Verified Xero access", "Scoped accounting exchange", "Connected financial workflow", "Approval, duplicate protection and accounting scope must be configured."),
    F("team-collaboration", "Microsoft 365 Integration", "Use authorised Outlook and Microsoft 365 information as inputs to project communication and workflow automation.", "Verified Microsoft access", "Authorised communication flow", "Connected office workflow", "Mailbox, tenant and permission scope are verified before use."),
    F("system-integrations", "Other Construction Systems", "Connect supported construction software through available APIs, webhooks and approved integration methods.", "Supported connection", "Scoped integration", "Connected workflow", "Integration feasibility is checked rather than assumed.")
  ] },
  { id: "privacy", name: "Approvals & Control", description: "Keep people in control of sensitive construction decisions with permissions, approvals, audit history and clear data boundaries.", features: [
    F("deployment", "Company Workspaces", "Separate each construction company into its own secure workspace and data boundary.", "Company account", "Tenant isolation", "Separated workspace", "Isolation must be enforced at the data layer as well as the interface."),
    F("access-permissions", "Roles & Permissions", "Define what owners, admins, managers, members and viewers may see or change.", "Authorised role", "Permission checks", "Scoped access", "Sensitive actions require the appropriate role."),
    F("data-boundaries", "Project Data Boundaries", "Keep project, company and customer information within the correct authorised context.", "Scoped information", "Boundary enforcement", "Permitted context", "Never use another company’s data to fill a gap."),
    F("audit-approvals", "Human Approvals & Audit", "Require review for selected actions and maintain a traceable record of what the system proposed and what people approved.", "Requested action", "Approval and record", "Traceable outcome", "Separate proposed, approved and completed work."),
    F("data-lifecycle", "Document & Data Lifecycle", "Define retention, export and deletion arrangements for project documents and saved context.", "Stored information", "Lifecycle rules", "Managed retention", "Include backups and provider retention in the implementation design."),
    F("ai-provider-controls", "AI Processing Controls", "Define what project information AI providers may process and what must remain excluded or redacted.", "Approved data scope", "Processing review", "Controlled AI scope", "Provider, retention and processing requirements are implementation decisions.")
  ] }
];
const getCategory = id => CATALOGUE.find(c => c.id === id);
function parseHash(hash) {
  const parts = hash.replace(/^#/, '').split('/');
  if (parts[0] !== 'core') return { view: 'home' };
  const c = getCategory(parts[1]);
  if (!c) return { view: 'core' };
  const f = c.features.find(x => x.id === parts[2]);
  return { view: 'core', category: c.id, ...(f ? { feature: f.id } : {}) };
}
const hashFor = s =>
  s.view === 'home'
    ? ''
    : `#core${s.category ? '/' + s.category : ''}${s.feature ? '/' + s.feature : ''}`;
function parentOf(s) {
  return s.feature
    ? { view: 'core', category: s.category }
    : s.category
      ? { view: 'core' }
      : { view: 'home' };
}
const normalise = q =>
  q
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
function resolveIntent(raw, current) {
  const q = normalise(raw),
    open = (category, feature) => ({
      kind: 'open',
      state: { view: 'core', category, ...(feature ? { feature } : {}) },
    });
  if (/^(please )?(go |take me )?back( please)?$/.test(q))
    return { kind: 'back' };
  if (
    /\b(show all|all capabilities|all categories|main menu|back to core)\b/.test(
      q
    )
  )
    return { kind: 'open', state: { view: 'core' } };
  if (/^(go |take me )?(home|exit core)( please)?$/.test(q))
    return { kind: 'open', state: { view: 'home' } };
  for (const c of CATALOGUE)
    if (
      q === normalise(c.name) ||
      q === `show me ${normalise(c.name)}` ||
      q === `open ${normalise(c.name)}`
    )
      return open(c.id);
  for (const c of CATALOGUE)
    for (const f of c.features)
      if (q.includes(normalise(f.name))) return open(c.id, f.id);
  const rules = [
    [/memory bound|data bound|isolat/, 'privacy', 'data-boundaries'],
    [/audit|approval/, 'privacy', 'audit-approvals'],
    [
      /data ownership|own my data|customer controlled|hosting|deployment/,
      'privacy',
      'deployment',
    ],
    [/\baccess\b|permission/, 'privacy', 'access-permissions'],
    [/delete|deletion|export|data retention/, 'privacy', 'data-lifecycle'],
    [/provider|processor/, 'privacy', 'ai-provider-controls'],
    [/security|secure|privacy|private|data protection/, 'privacy'],
    [
      /clon.*voice|voice.*clon|replicat.*voice/,
      'communication',
      'voice-cloning',
    ],
    [/human|handover|takeover/, 'communication', 'human-handover'],
    [/voice|speech|speak/, 'communication'],
    [/email|inbox automation/, 'automation', 'email-automation'],
    [
      /calendar|appointment|scheduling|reminder/,
      'automation',
      'calendar-tasks',
    ],
    [/briefing|rundown|daily summary/, 'automation', 'automated-briefings'],
    [/document|extract/, 'automation', 'documents-data'],
    [/workflow/, 'automation', 'workflow-orchestration'],
    [/follow up|followup|nurtur/, 'sales', 'nurturing-follow-up'],
    [/lead.*qualif|qualif.*lead/, 'sales', 'lead-qualification'],
    [/deliver|aftercare|customer update/, 'sales', 'customer-lifecycle'],
    [/re engag|retention|dormant/, 'sales', 'retention'],
    [/pipeline|stalled|deal/, 'sales', 'pipeline-intelligence'],
    [/sales|leads/, 'sales'],
    [/integrat|connect|webhook|api/, 'crm', 'system-integrations'],
    [/crm/, 'crm'],
    [/personality|tone|identity/, 'identity', 'identity-personality'],
    [/knowledge|policies/, 'identity', 'business-knowledge'],
    [/memory|remember/, 'identity', 'persistent-memory'],
  ];
  for (const [regex, c, f] of rules) if (regex.test(q)) return open(c, f);
  if (/automat/.test(q)) return open('automation');
  if (/customer/.test(q))
    return { kind: 'choices', ids: ['identity', 'sales', 'crm'] };
  if (current) {
    const c = getCategory(current);
    const matches = c.features.filter(f =>
      normalise(f.name)
        .split(' ')
        .some(w => w.length > 5 && q.includes(w))
    );
    if (matches.length === 1) return open(current, matches[0].id);
  }
  return { kind: 'unknown' };
}
// Exposed pure functions support local tests, not remote model calls.
window.TwinCore = { CATALOGUE, parseHash, parentOf, resolveIntent };
let state = parseHash(location.hash),
  hover = false,
  paused = false,
  listening = false,
  raf = 0,
  frameTime = 0,
  phase = 0,
  scale = 1,
  focusHint = null;
function navigate(next, focus = true) {
  const validated = parseHash(hashFor(next));
  if (hashFor(validated) === hashFor(state)) return;
  stopVoice();
  window.TwinExperience?.cleanup();
  const previous = state;
  focusHint = focus ? previous : null;
  state = validated;
  history.pushState(null, '', hashFor(state) || location.href.split('#')[0]);
  render(previous);
}

function node(tag, text, className) {
  const el = document.createElement(tag);
  if (text !== undefined) el.textContent = text;
  if (className) el.className = className;
  return el;
}
function button(text, fn, className = 'text-button') {
  const b = node('button', text, className);
  b.type = 'button';
  b.onclick = fn;
  return b;
}
function render(previous) {
  const c = getCategory(state.category),
    f = c?.features.find(x => x.id === state.feature),
    entered = state.view === 'core';
  document.body.classList.toggle('exploring', entered);
  document.body.classList.toggle('has-detail', !!f);
  for (const id of [
    'crumbs',
    'motion',
    'nodes',
    'command-area',
    'preview-note',
  ])
    $(id).hidden = !entered;
  $('hero-hit').hidden = entered;
  $('explore').hidden = entered;
  $('panel').hidden = !f;
  $('nodes').replaceChildren();
  $('choices').replaceChildren();
  $('crumbs').replaceChildren();
  $('status').textContent = '';
  if (!entered) {
    $('title').innerHTML = 'Construction <span>Intelligence</span>';
    $('subtitle').textContent =
      'Construction intelligence, project context and automation—connected.';
  } else {
    if (c) $('title').textContent = c.name;
    else $('title').innerHTML = 'Construction <span>Intelligence</span>';
    $('subtitle').textContent = c
      ? c.description
      : 'Select a system, or ask Construct about your construction business.';
    $('crumbs').append(button('Capabilities', () => navigate({ view: 'core' })));
    if (c) {
      $('crumbs').append(node('span', '/'));
      const crumb = button(c.name, () =>
        navigate({ view: 'core', category: c.id })
      );
      crumb.classList.add('category-crumb');
      $('crumbs').append(crumb);
    }
    const items = c ? c.features : CATALOGUE;
    $('nodes').dataset.count = String(items.length);
    items.forEach((item, i) => {
      const angle = ((-90 + (i * 360) / items.length) * Math.PI) / 180;
      const b = button(
        item.name,
        () =>
          navigate({
            view: 'core',
            category: c ? c.id : item.id,
            ...(c ? { feature: item.id } : {}),
          }),
        'node'
      );
      b.style.setProperty('--nx', Math.cos(angle).toFixed(6));
      b.style.setProperty('--ny', Math.sin(angle).toFixed(6));
      b.style.setProperty('--order', i);
      b.style.setProperty('--angle', `${angle + Math.PI / 2}rad`);
      b.dataset.id = item.id;
      b.dataset.side =
        Math.cos(angle) > 0.3
          ? 'right'
          : Math.cos(angle) < -0.3
            ? 'left'
            : 'centre';
      const label = node('span', item.name, 'node-title');
      b.replaceChildren(label);
      if (!c) {
        const meta = node(
          'span',
          `${item.features.length} capabilities`,
          'node-meta'
        );
        meta.setAttribute('aria-hidden', 'true');
        b.append(meta);
      }
      b.setAttribute('aria-label', item.name);
      b.setAttribute('aria-current', String(f?.id === item.id));
      $('nodes').append(b);
    });
  }
  if (f) {
    const p = $('panel');
    p.replaceChildren();
    const top = node('div', undefined, 'panel-top');
    top.append(
      node('small', c.name),
      button('×', () => navigate({ view: 'core', category: c.id }), 'close')
    );
    top.lastChild.setAttribute('aria-label', 'Close capability');
    p.append(top);
    const title = node('h2', f.name);
    title.id = 'feature-title';
    title.tabIndex = -1;
    p.setAttribute('aria-labelledby', 'feature-title');
    p.append(
      title,
      node('p', f.description, 'panel-summary'),
      node(
        'span',
        c.id === 'privacy'
          ? 'Custom deployment'
          : 'Configured per implementation',
        'context-note'
      )
    );
    p.append(
      node('h3', 'How it works'),
      node(
        'p',
        `Input: ${f.inputs.toLowerCase()}. Process: ${f.process.toLowerCase()}. Output: ${f.output.toLowerCase()}.`
      )
    );
    const visual = node('div', undefined, 'visual');
    visual.setAttribute('aria-label', 'Illustrative process');
    [f.inputs, f.process, f.output].forEach((label, i) => {
      if (i) visual.append(node('i', '→'));
      visual.append(node('span', label));
    });
    p.append(
      visual,
      node('h3', 'Controls & requirements'),
      node('p', f.controls)
    );
    const enquiry = button(
      'Discuss your implementation ↗',
      () => {
        $('enquiry').value =
          `I would like to discuss ${f.name} within ${c.name}.\n\nOur business needs:\n`;
        $('copy-status').textContent = '';
        $('enquiry-dialog').showModal();
      },
      'enquiry-link'
    );
    p.append(enquiry);
  }
  $('panel').scrollTop = 0;
  $('title').tabIndex = -1;
  window.TwinExperience?.refresh(c, f, previous);
  if (focusHint) {
    const old = focusHint;
    focusHint = null;
    let target = f ? $('feature-title') : $('title');
    if (old.feature && !f && old.category === state.category)
      target = $('nodes').querySelector(`[data-id="${old.feature}"]`) || target;
    else if (old.category && !state.category && entered)
      target =
        $('nodes').querySelector(`[data-id="${old.category}"]`) || target;
    else if (!entered) target = $('explore');
    target.focus({ preventScroll: true });
    if (matchMedia('(max-width:1100px)').matches)
      target.scrollIntoView({
        behavior: reduced.matches || paused ? 'instant' : 'smooth',
        block: 'start',
      });
  }
  restart();
}

function submitQuery(text) {
  if (window.TwinAsk) { window.TwinAsk.submit(text); return; }
  const r = resolveIntent(text, state.category);
  if (r.kind === 'open') {
    navigate(r.state);
    const c = getCategory(r.state.category),
      f = c?.features.find(x => x.id === r.state.feature);
    $('status').textContent = `${f?.name || c?.name || 'Construction Intelligence'} is open.`;
  } else if (r.kind === 'back') {
    navigate(parentOf(state));
    $('status').textContent = 'Returned to the previous level.';
  } else if (r.kind === 'choices') {
    $('status').textContent = 'Choose the area you would like to explore.';
    $('choices').replaceChildren(
      ...r.ids.map(id =>
        button(getCategory(id).name, () =>
          navigate({ view: 'core', category: id })
        )
      )
    );
  } else {
    $('status').textContent =
      'No matching capability. Try “show me security”, “email automation” or “clone my voice”.';
  }
}
$('explore').onclick = $('hero-hit').onclick = () => navigate({ view: 'core' });
$('home').onclick = () => navigate({ view: 'home' });
$('back').onclick = () => navigate(parentOf(state));
$('motion').onclick = () => {
  paused = !paused;
  $('motion').textContent = paused ? 'Resume motion' : 'Pause motion';
  document.body.classList.toggle('motion-off', paused);
  restart();
};
$('command').onsubmit = e => {
  e.preventDefault();
  const q = $('query').value.trim();
  if (q) {
    submitQuery(q);
    $('query').value = '';
  }
};
$('browse').onclick = () => {
  $('browse-list').replaceChildren(
    ...CATALOGUE.map(c =>
      button(c.name, () => {
        $('browse-dialog').close();
        navigate({ view: 'core', category: c.id });
      })
    )
  );
  $('browse-dialog').showModal();
};
$('browse-close').onclick = () => $('browse-dialog').close();
$('enquiry-close').onclick = () => $('enquiry-dialog').close();
$('copy').onclick = async () => {
  const text = $('enquiry').value;
  try {
    await navigator.clipboard.writeText(text);
    $('copy-status').textContent = 'Copied. Nothing was sent.';
  } catch {
    $('enquiry').focus();
    $('enquiry').select();
    $('copy-status').textContent =
      'Select and copy the highlighted note. Nothing was sent.';
  }
};
function syncHistory() {
  const next = parseHash(location.hash);
  if (hashFor(next) === hashFor(state)) return;
  stopVoice();
  window.TwinExperience?.cleanup();
  const previous = state;
  state = next;
  focusHint = previous;
  render(previous);
}
window.addEventListener('hashchange', syncHistory);
window.addEventListener('popstate', syncHistory);
document.addEventListener('keydown', e => {
  if (
    e.key === 'Escape' &&
    !document.querySelector('dialog[open]') &&
    state.view === 'core'
  ) {
    e.preventDefault();
    navigate(parentOf(state));
  }
});
// The permissioned speech adapter is separate from the visual and navigation code.
function stopVoice() {
  window.TwinSpeech?.stop();
  listening = false;
  restart();
}
// Original golden-angle geometry and palette. Navigation lives outside the graphics layer.
function makeSphere(count) {
  const particles = [],
    links = [],
    used = new Set(),
    g = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - ((i + 0.5) / count) * 2,
      r = Math.sqrt(Math.max(0, 1 - y * y)),
      theta = g * i;
    particles.push({
      x: Math.cos(theta) * r,
      y,
      z: Math.sin(theta) * r,
      size: 0.6 + ((i * 17) % 11) / 10,
      phase: ((i * 29) % 101) / 101,
    });
  }
  particles.forEach((p, i) => {
    particles
      .map((q, j) => ({
        j,
        d: (p.x - q.x) ** 2 + (p.y - q.y) ** 2 + (p.z - q.z) ** 2,
      }))
      .filter(x => x.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, i % 5 === 0 ? 5 : 4)
      .forEach(({ j }) => {
        const a = Math.min(i, j),
          b = Math.max(i, j),
          key = `${a}:${b}`;
        if (!used.has(key)) {
          used.add(key);
          links.push({ a, b, phase: ((a * 13 + b * 31) % 97) / 97 });
        }
      });
  });
  return { particles, links };
}
const sphere = makeSphere(216),
  canvas = $('canvas'),
  ctx = canvas.getContext('2d', { alpha: true }),
  reduced = matchMedia('(prefers-reduced-motion: reduce)'),
  pointer = { x: 0, y: 0 };
let width = 510,
  height = 510,
  dpr = 1,
  visible = true,
  clock = 2000;
function resize() {
  const r = canvas.getBoundingClientRect();
  width = Math.max(1, r.width);
  height = Math.max(1, r.height);
  dpr = Math.min(Math.max(devicePixelRatio || 1, 2), 3);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  restart();
}
function draw(now) {
  raf = 0;
  if (!ctx || document.hidden || !visible) return;
  const frozen = paused || reduced.matches;
  const delta = Math.min(32, Math.max(0, now - frameTime));
  frameTime = now;
  if (!frozen) {
    clock += delta;
    phase += delta * 0.00018;
  }
  const t = clock;
  const signal = window.TwinExperience?.signal || { level: 0, until: 0 };
  const activity = frozen
    ? 0
    : Math.max(0, Math.min(1, (signal.until - now) / 650));
  const energy = frozen ? 0 : Math.max(0, Math.min(1, signal.level));
  scale += ((hover ? 1.055 : 1) - scale) * (frozen ? 1 : 0.1);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  const cx = width / 2,
    cy = height * 0.47,
    radius =
      Math.min(width * 0.345, height * 0.405) *
      scale *
      (frozen ? 1 : 1 + Math.sin(t * 0.0018) * 0.018) *
      (1 + energy * 0.2 + Math.sin(activity * Math.PI) * 0.045),
    yaw = pointer.x * (hover ? 0.28 : 0.06),
    tilt = -0.16 + pointer.y * (hover ? 0.2 : 0.04);
  const glow = ctx.createRadialGradient(
    cx,
    cy,
    radius * 0.08,
    cx,
    cy,
    radius * 1.28
  );
  glow.addColorStop(0, 'rgba(224,247,255,.08)');
  glow.addColorStop(0.33, 'rgba(56,189,248,.095)');
  glow.addColorStop(0.66, 'rgba(37,99,235,.03)');
  glow.addColorStop(1, 'rgba(2,12,34,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 1.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const scanY = cy - radius + ((t * 0.035) % (radius * 2)),
    scanWidth = Math.sqrt(Math.max(0, radius ** 2 - (scanY - cy) ** 2)),
    scan = ctx.createLinearGradient(
      cx - scanWidth,
      scanY,
      cx + scanWidth,
      scanY
    );
  scan.addColorStop(0, 'rgba(56,189,248,0)');
  scan.addColorStop(0.5, 'rgba(224,247,255,.14)');
  scan.addColorStop(1, 'rgba(56,189,248,0)');
  ctx.strokeStyle = scan;
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(cx - scanWidth, scanY);
  ctx.lineTo(cx + scanWidth, scanY);
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  [
    { rx: 1.18, ry: 0.38, angle: -0.44, speed: 0.018, alpha: 0.16 },
    { rx: 1.08, ry: 0.56, angle: 0.58, speed: -0.011, alpha: 0.11 },
    { rx: 0.98, ry: 0.72, angle: -1.02, speed: 0.008, alpha: 0.08 },
  ].forEach((ring, i) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(ring.angle + yaw * 0.2);
    ctx.setLineDash(i === 1 ? [1.5, 5.5] : [3, 7]);
    ctx.lineDashOffset = t * ring.speed;
    ctx.strokeStyle = `rgba(103,232,249,${ring.alpha})`;
    ctx.lineWidth = i === 0 ? 0.7 : 0.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, radius * ring.rx, radius * ring.ry, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  });
  // Restrained volume under the original network, calibrated for the white canvas.
  const volume = ctx.createRadialGradient(
    cx - radius * 0.27,
    cy - radius * 0.34,
    radius * 0.04,
    cx,
    cy,
    radius * 0.95
  );
  volume.addColorStop(0, 'rgba(133,224,255,.30)');
  volume.addColorStop(0.32, 'rgba(56,189,248,.51)');
  volume.addColorStop(0.72, 'rgba(36,134,233,.56)');
  volume.addColorStop(0.9, 'rgba(103,232,249,.22)');
  volume.addColorStop(1, 'rgba(103,232,249,0)');
  ctx.fillStyle = volume;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.95, 0, Math.PI * 2);
  ctx.fill();
  const co = Math.cos(phase + yaw),
    si = Math.sin(phase + yaw),
    ct = Math.cos(tilt),
    st = Math.sin(tilt),
    projected = sphere.particles.map(p => {
      const drift = frozen
          ? 1
          : 1 + Math.sin(t * 0.0014 + p.phase * 12) * 0.022,
        x1 = (p.x * co - p.z * si) * drift,
        z1 = (p.x * si + p.z * co) * drift,
        y2 = p.y * drift * ct - z1 * st,
        z2 = p.y * drift * st + z1 * ct,
        perspective = 1 / (1.14 - z2 * 0.22);
      return {
        x: cx + x1 * radius * perspective,
        y: cy + y2 * radius * perspective,
        z: z2,
        perspective,
        p,
      };
    });
  sphere.links.forEach(link => {
    const a = projected[link.a],
      b = projected[link.b],
      depth = Math.max(0.12, (a.z + b.z + 2) / 4),
      focusEnergy = signal.focused
        ? Math.max(
            0,
            (((a.x + b.x) / 2 - cx) / radius) * signal.targetX +
              (((a.y + b.y) / 2 - cy) / radius) * signal.targetY
          ) * 0.24
        : 0;
    ctx.strokeStyle = `rgba(45,190,255,${Math.min(0.75, (0.2 + depth * 0.44) * (hover ? 1.18 : 1) * (1 + energy * 0.7 + activity * 0.24 + focusEnergy))})`;
    ctx.lineWidth = 0.58 + depth * 0.25;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  });
  projected.forEach(({ x, y, z, perspective, p }) => {
    const depth = Math.max(0.25, (z + 1.2) / 2.2);
    ctx.fillStyle = `rgba(36,134,233,${0.12 + depth * 0.22})`;
    ctx.beginPath();
    ctx.arc(
      x,
      y,
      Math.max(1.1, p.size * perspective * depth * 1.8),
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.fillStyle = `rgba(${z > 0.25 ? '238,252,255' : '103,232,249'},${Math.min(0.95, 0.38 + depth * 0.56)})`;
    ctx.beginPath();
    ctx.arc(
      x,
      y,
      Math.max(0.62, p.size * perspective * depth * 1.08 * (1 + energy * 0.22)),
      0,
      Math.PI * 2
    );
    ctx.fill();
  });
  for (let i = 0; i < 5; i++) {
    const a = phase * (i % 2 === 0 ? 1.4 : -1.1) + i * 2.17,
      x = cx + Math.cos(a) * radius * (0.72 + (i % 3) * 0.08),
      y = cy + Math.sin(a) * radius * (0.72 + (i % 3) * 0.08),
      p = 0.32 + Math.abs(Math.sin(t * 0.0028 + i * 1.9)) * 0.42,
      r = 2.4 + p * 3.4,
      g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(255,255,255,${p * 0.82})`);
    g.addColorStop(0.2, `rgba(224,247,255,${p * 0.62})`);
    g.addColorStop(1, 'rgba(56,189,248,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let bolt = 0; bolt < 3; bolt++) {
    const life = (t * 0.00042 + bolt * 0.31) % 1,
      ba = Math.sin(life * Math.PI) * (0.28 + (bolt % 2) * 0.14);
    if (ba < 0.05) continue;
    const start =
      phase * (bolt % 2 === 0 ? 1.6 : -1.25) + bolt * 2.11 + life * 0.42;
    for (const [lineWidth, alpha, rgb] of [
      [3.2, 0.2, '56,189,248'],
      [0.82, 0.94, '248,254,255'],
    ]) {
      ctx.strokeStyle = `rgba(${rgb},${alpha * ba})`;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      for (let s = 0; s <= 8; s++) {
        const u = s / 8,
          a = start + (0.5 + bolt * 0.12) * u,
          j =
            s === 0 || s === 8
              ? 0
              : Math.sin(t * 0.026 + bolt * 17 + s * 9.4) * radius * 0.055,
          r = radius * (1.01 + Math.sin(u * Math.PI) * 0.08) + j,
          x = cx + Math.cos(a) * r,
          y = cy + Math.sin(a) * r;
        s ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
    }
  }
  ctx.restore();
  if (!frozen) raf = requestAnimationFrame(draw);
}
function restart() {
  cancelAnimationFrame(raf);
  frameTime = performance.now();
  if (!document.hidden && visible) raf = requestAnimationFrame(draw);
}
$('stage').addEventListener('pointermove', e => {
  const r = canvas.getBoundingClientRect();
  const x = ((e.clientX - r.left) / r.width) * 2 - 1,
    y = ((e.clientY - r.top) / r.height) * 2 - 1;
  hover = Math.abs(x) < 0.75 && Math.abs(y) < 0.75;
  pointer.x = hover ? x : 0;
  pointer.y = hover ? y : 0;
  if (reduced.matches || paused) restart();
});
$('stage').addEventListener('pointerleave', () => {
  hover = false;
  pointer.x = pointer.y = 0;
  restart();
});
const ro = new ResizeObserver(resize);
ro.observe(canvas);
const io = new IntersectionObserver(entries => {
  visible = entries[0].isIntersecting;
  restart();
});
io.observe(canvas);
reduced.addEventListener('change', restart);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopVoice();
    window.TwinExperience?.suspend();
    $('status').textContent = '';
  }
  restart();
});
window.addEventListener('pagehide', () => {
  stopVoice();
  window.TwinExperience?.cleanup();
  cancelAnimationFrame(raf);
});
window.addEventListener('pageshow', restart);
window.TwinCore.navigate = navigate;
window.TwinCore.getState = () => ({ ...state });
render();
resize();
