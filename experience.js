'use strict';
/* Frontend-only experiences. No API calls, stored transcripts or live business operations. */
(function () {
  const signal = { level: 0, until: 0, mode: 'idle' };
  const dispose = [];
  let transitionTimer = 0;
  let noteTimer = 0;
  let currentAudio = null;
  const note = node('div', 'Ready', 'orb-note');
  note.id = 'orb-state';
  note.setAttribute('aria-hidden', 'true');
  $('stage').append(note);

  function mode(value, level = 0) {
    signal.mode = value;
    signal.level = Math.max(0, Math.min(1, Number(level) || 0));
    note.dataset.state = value;
    document.body.classList.toggle('listening', value === 'listening');
    note.textContent =
      value === 'listening'
        ? 'Listening'
        : value === 'playback'
          ? 'Playing your sample'
          : value === 'opening'
            ? 'Opening capability'
            : value === 'thinking'
              ? 'Thinking'
              : 'Ready';
    restart();
  }
  function pulse(label = 'Opening capability') {
    clearTimeout(noteTimer);
    signal.until = 0;
    if (!listening && !currentAudio) {
      mode('opening');
      note.textContent = label;
      noteTimer = setTimeout(() => {
        if (!listening && !currentAudio) mode('idle');
      }, 650);
    }
    restart();
  }
  function suspend() {
    currentAudio?.pause();
    currentAudio = null;
    mode('idle');
  }
  function cleanup() {
    clearTimeout(noteTimer);
    clearTimeout(transitionTimer);
    signal.focused = false;
    $('stage').classList.remove('engaged');
    document.body.classList.remove('core-opening', 'revealing');
    for (const fn of dispose.splice(0)) fn();
    suspend();
  }
  function demoShell(title, label = 'Illustrative demo · fictional data') {
    const box = node('section', undefined, 'demo');
    box.append(node('p', label, 'demo-label'), node('h3', title));
    return box;
  }
  function control(text, fn, primary = false) {
    return button(text, fn, 'demo-button' + (primary ? ' primary' : ''));
  }
  function replaceKeepingFocus(parent, children, fallback) {
    const key = parent.contains(document.activeElement)
      ? document.activeElement.dataset.key
      : null;
    parent.replaceChildren(...children);
    if (key)
      (parent.querySelector(`[data-key="${key}"]`) || fallback?.())?.focus({
        preventScroll: true,
      });
  }

  // A pure, bounded simulation model. Human approval and takeover are actual gates.
  function workflowStep(s, event) {
    if (event === 'reset') return { step: 0, approved: false, paused: false };
    if (event === 'takeover') return { ...s, paused: true };
    if (event === 'resume') return { ...s, paused: false };
    if (s.paused) return s;
    if (event === 'approve' && s.step === 3)
      return { ...s, approved: true, step: 4 };
    if (event === 'next' && s.step < 5 && (s.step !== 3 || s.approved))
      return { ...s, step: s.step + 1 };
    return s;
  }
  const workflowScenes = [
    [
      'Customer enquiry',
      'A new enquiry arrives',
      '“I’m looking for a black Ranger. Around $85,000, ideally in the next month. Can you help?”',
      ['Example customer: Jordan', 'Website enquiry'],
    ],
    [
      'Relevant memory',
      'The conversation has context',
      'An earlier discussion says Jordan plans to sell a Hilux first. The enquiry adds a budget, colour preference and buying timeframe.',
      ['Verified example identity', 'Previous conversation'],
    ],
    [
      'Prepared response',
      'A response in the configured style',
      '“Hey Jordan, happy to help. Are you still waiting to sell the Hilux, or is that sorted? I’ve noted black, around $85k and within a month. Any must-have features?”',
      ['Draft only', 'No stock or finance promises'],
    ],
    [
      'Human approval',
      'Review before the workflow proceeds',
      'The draft is ready for a person to review. Nothing has been sent and the example CRM has not been updated. Approve it or take over the conversation.',
      ['Approval required', 'Workflow paused'],
    ],
    [
      'Example CRM record',
      'The approved context becomes a record',
      'Jordan · black Ranger · budget around $85k · within one month. Outstanding question: trade-in or sale of current vehicle. Owner: sales team.',
      ['Simulated record', 'No live CRM connection'],
    ],
    [
      'Next step',
      'Follow-through, with stopping rules',
      'Example task: follow up in two days if Jordan has not replied. Stop the sequence on reply, opt-out or operator takeover. Record the outcome rather than assuming delivery.',
      ['Illustrative schedule', 'No message was sent'],
    ],
  ];
  function workflowDemo(feature) {
    const box = demoShell(feature.id === 'human-handover' ? 'A person takes control' : feature.id === 'audit-approvals' ? 'Approval before action' : 'From enquiry to follow-through');
    box.dataset.demo = 'workflow';
    const content = node('div');
    box.append(content);
    let model = {
      step: feature.id === 'audit-approvals' ? 3 : 0,
      approved: false,
      paused: feature.id === 'human-handover',
    };
    function update(event) {
      model = workflowStep(model, event);
      pulse(model.paused ? 'Human handover' : 'Exploring workflow');
      renderDemo();
    }
    function renderDemo() {
      const guide = node('p', undefined, 'demo-guide');
      ['Understand', 'Communicate', 'Automate'].forEach((text, i) =>
        guide.append(
          node(
            'span',
            text,
            Math.min(2, Math.floor(model.step / 2)) === i ? 'active' : ''
          )
        )
      );
      const track = node('ol', undefined, 'demo-progress');
      track.setAttribute(
        'aria-label',
        `Example workflow, step ${model.step + 1} of 6`
      );
      workflowScenes.forEach((scene, i) => {
        const item = node(
          'li',
          undefined,
          i < model.step ? 'done' : i === model.step ? 'active' : ''
        );
        item.setAttribute(
          'aria-label',
          scene[0] +
            (i === model.step
              ? ', current step'
              : i < model.step
                ? ', inspected'
                : ', pending')
        );
        track.append(item);
      });
      const scene = workflowScenes[model.step];
      const output = node('div', undefined, 'demo-output');
      output.append(
        node(
          'small',
          `${String(model.step + 1).padStart(2, '0')} / 06 · ${scene[0]}`
        ),
        node('h4', model.paused ? 'A person is in control' : scene[1]),
        node(
          'p',
          model.paused
            ? 'Automated responses and the next workflow step are paused. An authorised operator must explicitly resume this example.'
            : scene[2]
        )
      );
      const chips = node('div', undefined, 'demo-context');
      scene[3].forEach(text => chips.append(node('span', text)));
      output.append(chips);
      const controls = node('div', undefined, 'demo-controls');
      if (model.paused) {
        const resume = control(
          'Resume example workflow',
          () => update('resume'),
          true
        );
        resume.dataset.key = 'next';
        controls.append(resume);
      } else if (model.step < 5) {
        const approval = model.step === 3;
        const next = control(
          approval ? 'Approve example draft' : 'Continue example →',
          () => update(approval ? 'approve' : 'next'),
          true
        );
        next.dataset.key = 'next';
        controls.append(next);
        const takeover = control('Take over', () => update('takeover'));
        takeover.dataset.key = 'takeover';
        controls.append(takeover);
      }
      const reset = button('Restart demo', () => update('reset'), 'demo-reset');
      reset.dataset.key = 'reset';
      controls.append(reset);
      const status = node(
        'p',
        model.paused
          ? 'Simulation paused. No real systems are connected.'
          : model.step === 5
            ? 'Example complete. No message, CRM update or task was sent to a real system.'
            : 'Step through the example. All customer data and results are fictional.',
        'demo-result'
      );
      status.setAttribute('role', 'status');
      replaceKeepingFocus(
        content,
        [guide, track, output, controls, status],
        () => reset
      );
      box.dataset.step = String(model.step);
      box.dataset.paused = String(model.paused);
      box.dataset.approved = String(model.approved);
    }
    renderDemo();
    return box;
  }

  const priorities = [
    {
      title: 'Review a qualified vehicle enquiry',
      meta: 'Sales · response requires approval',
      source: 'CRM record EX-014',
      evidence:
        'Budget $85,000; black Ranger; one-month timeframe. The reply is a draft, not a delivered message.',
      next: 'Review the prepared reply to Jordan.',
      freshness: 'Example snapshot · 08:42',
    },
    {
      title: 'Verify a delivery update',
      meta: 'Operations · information needs checking',
      source: 'Delivery record EX-028',
      evidence:
        'Transport booking is recorded. Final collection time is not confirmed. The assistant must not invent a delivery date.',
      next: 'Confirm the transport time before updating the customer.',
      freshness: 'Example snapshot · verification pending',
    },
    {
      title: 'Prepare for the next customer call',
      meta: 'Calendar · outstanding questions',
      source: 'Calendar and notes EX-006',
      evidence:
        'Customer call at 11:00 in the example calendar. Notes list three requested accessories; availability has not been checked.',
      next: 'Review the accessories list before the 11:00 call.',
      freshness: 'Example snapshot · 08:35',
    },
  ];
  function briefingDemo() {
    const box = demoShell('Your business, brought into focus');
    box.dataset.demo = 'briefing';
    box.append(
      node(
        'p',
        'Inspect a priority, see the source behind it, then assemble the example owner’s briefing.'
      )
    );
    const rows = node('div', undefined, 'briefing-items');
    const source = node('div', undefined, 'demo-source');
    source.setAttribute('role', 'status');
    const summary = node('div', undefined, 'briefing-summary');
    summary.hidden = true;
    const buttons = [];
    function select(i) {
      buttons.forEach((b, n) =>
        b.setAttribute('aria-pressed', String(n === i))
      );
      const p = priorities[i];
      source.replaceChildren(
        node('small', `${p.source} · ${p.freshness}`),
        node('p', p.evidence)
      );
      pulse('Inspecting example source');
    }
    priorities.forEach((p, i) => {
      const b = control('', () => select(i));
      b.className = 'briefing-item';
      const copy = node('span');
      copy.append(node('b', p.title), node('small', p.meta));
      b.append(node('span', `0${i + 1}`, 'briefing-number'), copy);
      b.setAttribute('aria-pressed', String(i === 0));
      buttons.push(b);
      rows.append(b);
    });
    const assemble = control(
      'Assemble example briefing →',
      () => {
        summary.hidden = false;
        summary.replaceChildren(
          node('h3', 'Today’s priorities'),
          ...priorities.map(p => node('p', p.next)),
          node(
            'small',
            'Built from the three fictional source records above. No live business information.'
          )
        );
        assemble.textContent = 'Example briefing assembled';
        assemble.setAttribute('aria-expanded', 'true');
        pulse('Example briefing ready');
      },
      true
    );
    assemble.setAttribute('aria-expanded', 'false');
    box.append(rows, source, node('div', undefined, 'demo-controls'));
    box.lastChild.append(assemble);
    box.append(summary);
    const p = priorities[0];
    source.append(
      node('small', `${p.source} · ${p.freshness}`),
      node('p', p.evidence)
    );
    return box;
  }

  function privacyDemo() {
    const box = demoShell(
      'See the data boundaries',
      'Illustrative architecture · custom deployment'
    );
    box.dataset.demo = 'privacy';
    box.append(
      node(
        'p',
        'Explore two deployment patterns. The final design depends on the integrations and providers selected.'
      )
    );
    const controls = node('div', undefined, 'demo-controls');
    const path = node('div', undefined, 'privacy-path');
    path.setAttribute('role', 'status');
    const modes = ['Customer-controlled', 'Dedicated managed'];
    let selected = 0;
    const buttons = modes.map((text, i) =>
      control(text, () => {
        selected = i;
        renderPath();
        pulse('Exploring data boundaries');
      })
    );
    controls.append(...buttons);
    box.append(controls, path);
    function zone(title, text) {
      const z = node('div', undefined, 'privacy-zone');
      z.append(node('small', title), node('p', text));
      return z;
    }
    function renderPath() {
      buttons.forEach((b, i) =>
        b.setAttribute('aria-pressed', String(i === selected))
      );
      path.replaceChildren(
        zone(
          selected === 0
            ? 'Customer-controlled environment'
            : 'Dedicated managed environment',
          selected === 0
            ? 'Customer account: application, memory, business records and scoped integration credentials.'
            : 'An isolated deployment managed under agreed operational and access arrangements.'
        ),
        node('div', 'Approved information only ↓', 'privacy-connector'),
        zone(
          'External processing, when configured',
          'An approved model, voice or connected software provider may process the information needed for its task.'
        ),
        node('div', 'Provider response ↓', 'privacy-connector'),
        zone(
          'Governed output',
          'Permissions, approval requirements and activity records apply before an output reaches a connected system.'
        )
      );
    }
    renderPath();
    box.append(
      node(
        'p',
        'Owning the cloud account does not automatically mean all processing stays inside it. Provider access, support access and retention must be specified.'
      )
    );
    return box;
  }

  function voiceOverview(feature) {
    const box = demoShell(
      feature.id === 'voice-cloning' ? 'Your voice. A recognisable identity.' : 'Personal communication, in your voice.',
      'Voice capability · arranged with Twin'
    );
    box.dataset.demo = 'voice-overview';
    box.append(node('p', feature.id === 'voice-cloning'
      ? 'Twin can configure an authorised voice identity for AI-generated speech, shaped around your tone and the experience you want to create.'
      : 'Twin can help turn approved responses into spoken messages using an authorised voice identity and relevant conversation context.'));
    const steps = node('div', undefined, 'memory-cards');
    for (const [label, text] of [
      ['Authorise', 'Use only a voice you own or have permission to use.'],
      ['Shape', 'Agree the tone, use cases and boundaries with Twin.'],
      ['Review', 'Test the voice privately before enabling an agreed workflow.']
    ]) {
      const item = node('div', undefined, 'memory-card');
      item.append(node('strong', label), node('p', text));
      steps.append(item);
    }
    box.append(steps, node('p', 'Contact Twin to arrange a guided test of the voice cloning system. No recording, upload or voice generation takes place on this page.', 'memory-note'));
    return box;
  }

  function storyDemo(story) {
    const box = demoShell(story.title, 'Interactive example · fictional data');
    box.classList.add('memory-showcase');
    box.dataset.demo = 'capability-story';
    const facts = node('div', undefined, 'memory-cards');
    for (const [label, value] of story.facts) {
      const card = node('div', undefined, 'memory-card');
      card.append(node('span', label), node('strong', value));
      facts.append(card);
    }
    const output = node('div', undefined, 'memory-result');
    output.hidden = true;
    output.setAttribute('role', 'status');
    output.append(node('p', story.answer, 'memory-answer'));
    const why = node('details', undefined, 'memory-reason');
    why.append(node('summary', 'Why this result?'), node('p', story.reason));
    output.append(why);
    const reveal = control(story.action, () => {
      output.hidden = !output.hidden;
      reveal.setAttribute('aria-expanded', String(!output.hidden));
      reveal.textContent = output.hidden ? story.action : 'Hide the example result';
    }, true);
    reveal.classList.add('memory-next');
    reveal.setAttribute('aria-expanded', 'false');
    box.append(facts, node('p', story.question, 'memory-prompt'), reveal, output,
      node('p', 'Fictional example. No connected records or external actions.', 'memory-note'));
    return box;
  }

  function revenueDemo() {
    const box = demoShell('Numbers you can trace', 'Interactive example · fictional data');
    box.classList.add('memory-showcase');
    box.dataset.demo = 'revenue';
    box.append(node('p', 'Compare two fictional channels without hiding refunds or mixing conversion definitions.'));
    const options = node('div', undefined, 'memory-choices');
    const result = node('div', undefined, 'memory-result');
    result.setAttribute('role', 'status');
    const records = [
      { name: 'Website', gross: 12000, refunds: 1200, fees: 324, buyers: 45, audience: 900, population: 'unique website visitors' },
      { name: 'Partner referrals', gross: 8000, refunds: 0, fees: 200, buyers: 20, audience: 80, population: 'qualified referrals' }
    ];
    const controls = records.map((record, index) => control(record.name, () => show(index)));
    options.append(...controls);
    function show(index) {
      const r = records[index];
      controls.forEach((b, i) => b.setAttribute('aria-pressed', String(i === index)));
      const money = value => 'A$' + value.toLocaleString('en-AU');
      const fields = node('div', undefined, 'memory-cards');
      for (const [key, value] of [
        ['Gross sales', money(r.gross)], ['Refunds', money(r.refunds)],
        ['Processing fees', money(r.fees)], ['After refunds & fees', money(r.gross - r.refunds - r.fees)]
      ]) {
        const card = node('div', undefined, 'memory-card');
        card.append(node('span', key), node('strong', value));
        fields.append(card);
      }
      result.replaceChildren(fields,
        node('p', r.buyers + ' buyers / ' + r.audience + ' ' + r.population + ' = ' + (100 * r.buyers / r.audience).toFixed(1) + '% conversion.'),
        node('p', 'This is not profit: product costs, tax and other expenses are excluded. The channel conversion rates use different populations and should not be combined.', 'memory-note'));
    }
    box.append(options, result, node('p', 'One fictional period. All amounts are AUD. No live sales data is connected.', 'memory-note'));
    show(0);
    return box;
  }

  function memoryManagementDemo() {
    const box = demoShell('Memory you can inspect and change', 'Interactive example · fictional data');
    box.classList.add('memory-showcase');
    box.dataset.demo = 'memory-management';
    box.append(node('p', 'A corrected fact should replace an old one. A forgotten fact should no longer guide the answer.'));
    const record = node('div', undefined, 'demo-source');
    const output = node('div', undefined, 'memory-result');
    output.setAttribute('role', 'status');
    const controls = node('div', undefined, 'memory-choices');
    let current = 'Brisbane';
    const correct = control('Correct to Noosa', () => { current = 'Noosa'; renderRecord(); }, true);
    const forget = control('Forget location', () => {
      if (!current) return;
      confirm.hidden = false;
      confirmButton.focus({ preventScroll: true });
    });
    const confirm = node('div', undefined, 'memory-confirm');
    confirm.hidden = true;
    confirm.append(node('p', 'Remove the location from this example’s active memory?'));
    const confirmButton = control('Confirm removal', () => {
      current = '';
      confirm.hidden = true;
      renderRecord();
      reset.focus({ preventScroll: true });
    });
    confirm.append(confirmButton, control('Keep location', () => {
      confirm.hidden = true;
      forget.focus({ preventScroll: true });
    }));
    const reset = control('Restart example', () => { current = 'Brisbane'; renderRecord(); });
    controls.append(correct, forget, reset);
    function renderRecord() {
      confirm.hidden = true;
      record.replaceChildren(node('small', 'Active memory · business location'),
        node('strong', current || 'Not remembered'),
        node('p', current === 'Brisbane' ? 'Source: the customer’s first message.' :
          current === 'Noosa' ? 'Source: the customer’s correction. Brisbane is no longer the active location.' :
          'No location is available to the next answer.'));
      output.replaceChildren(node('p', 'Next question: “Where is our business based?”', 'memory-kicker'),
        node('p', current ? '“Your business is based in ' + current + '.”' : '“I don’t have your location in this example. Where are you based?”', 'memory-answer'));
      correct.disabled = current === 'Noosa' || !current;
      forget.disabled = !current;
    }
    box.append(record, controls, confirm, output,
      node('p', 'Local fictional example only. It does not delete chat requests or provider records. A live system needs defined retention, permissions and deletion scope.', 'memory-note'));
    renderRecord();
    return box;
  }

  function mountFeatureDemo(feature, demo) {
    const panel = $('panel');
    for (const child of [...panel.children]) {
      if (!child.matches('.panel-top, #feature-title, .enquiry-link')) child.remove();
    }
    const enquiry = panel.querySelector('.enquiry-link');
    const voice = feature.id === 'voice-cloning' || feature.id === 'voice-messages';
    const controls = node('details', undefined, 'memory-explanation');
    controls.append(node('summary', 'Controls & requirements'), node('p', feature.controls));
    if (!voice) panel.insertBefore(node('p', feature.description, 'feature-intro'), enquiry);
    panel.insertBefore(demo, enquiry);
    panel.insertBefore(controls, enquiry);
    if (voice) {
      enquiry.textContent = 'Contact Twin to test voice cloning';
      enquiry.dataset.enquiryTopic = 'Voice cloning test';
    }
  }

  function memoryDemo() {
    const box = demoShell('Intelligence that remembers', 'Interactive example · fictional data');
    box.classList.add('memory-showcase');
    box.dataset.demo = 'memory-showcase';
    box.append(node('p', 'See how past conversations shape the next answer.', 'memory-intro'));
    const tabs = node('div', undefined, 'memory-scenarios');
    tabs.setAttribute('role', 'group');
    tabs.setAttribute('aria-label', 'Memory scenario');
    const customerTab = control('A returning customer', () => selectScenario('customer'));
    const projectTab = control('An ongoing project', () => selectScenario('project'));
    tabs.append(customerTab, projectTab);
    const workspace = node('div', undefined, 'memory-workspace');
    const context = node('div', undefined, 'memory-context');
    const contextLabel = node('p', '', 'memory-kicker');
    const cards = node('div', undefined, 'memory-cards');
    context.append(contextLabel, cards);
    const exchange = node('div', undefined, 'memory-exchange');
    const promptLabel = node('p', '', 'memory-kicker');
    const prompt = node('p', '', 'memory-prompt');
    const choices = node('div', undefined, 'memory-choices');
    choices.setAttribute('aria-label', 'Change the project constraint');
    const result = node('div', undefined, 'memory-result');
    result.hidden = true;
    const resultLabel = node('p', 'Construct’s answer', 'memory-kicker');
    const resultText = node('p', '', 'memory-answer');
    const reason = node('details', undefined, 'memory-reason');
    reason.append(node('summary', 'Why this answer?'), node('p', '', 'memory-reason-text'));
    result.append(resultLabel, resultText, reason);
    exchange.append(promptLabel, prompt, choices, result);
    const action = control('Show Construct’s response', reveal, true);
    action.classList.add('memory-next');
    const note = node('p', 'Fictional demonstration. No customer or project record is connected.', 'memory-note');
    const status = node('p', '', 'visually-hidden');
    status.setAttribute('role', 'status');
    workspace.append(context, exchange);
    box.append(tabs, workspace, action, note, status);

    const scenarios = {
      customer: {
        context: 'What Twin already knows',
        memories: [
          ['Previous launch', 'Noosa studio'],
          ['Experience', 'Minimal website + online booking'],
          ['Approval', 'Maya approves brand changes']
        ],
        promptLabel: 'A new message arrives',
        prompt: '“We’re opening in Brisbane. Can we do the same again?”',
        answer: 'Yes. I’d mirror the Noosa launch: the same minimal website and booking flow, updated for Brisbane, with any brand changes sent to Maya for approval.',
        reason: 'Uses the previous launch, chosen experience and approval rule. The customer does not have to explain them again.'
      },
      project: {
        context: 'Current project memory',
        memories: [
          ['Launch', '18 November'],
          ['Budget', 'A$35,000 ceiling'],
          ['Priority', 'Booking before analytics'],
          ['Decision', 'Advanced reporting in phase two']
        ],
        promptLabel: 'Change one constraint',
        prompt: '“What should we do next?”'
      }
    };
    const projectAnswers = {
      sooner: ['Aim for 4 November', 'To target 4 November, propose booking and essential pages for phase one, with advanced reporting still in phase two. Check effort and team availability against the A$35,000 ceiling before agreeing the earlier date.', 'Replaces the target launch date. Budget, booking priority and phased reporting remain in memory. Feasibility still needs review.'],
      budget: ['Set budget to A$25,000', 'With a proposed A$25,000 ceiling, prioritise booking and essential pages. Review scope and estimates before retaining the 18 November target; advanced reporting stays in phase two.', 'Replaces the budget ceiling, not the launch target. It proposes a scope review rather than guaranteeing the same delivery at a lower cost.'],
      priority: ['Prioritise basic analytics', 'Propose basic analytics alongside the essential launch pages, with booking sequenced after analytics. Check the estimate against 18 November and A$35,000. Advanced reporting remains in phase two.', 'Replaces the booking-first priority. Preserves the target date, budget and distinction between basic analytics and advanced reporting.']
    };
    let scenario = 'customer';
    let constraint = 'sooner';

    function selectScenario(next) {
      scenario = next;
      result.hidden = true;
      action.hidden = false;
      reason.open = false;
      render();
    }
    function selectConstraint(next) {
      constraint = next;
      result.hidden = true;
      action.hidden = false;
      reason.open = false;
      render();
      choices.querySelector('[data-key="' + next + '"]')?.focus({ preventScroll: true });
    }
    function reveal() {
      const data = scenario === 'customer' ? scenarios.customer : scenarios.project;
      const project = projectAnswers[constraint];
      resultText.textContent = scenario === 'customer' ? data.answer : project[1];
      reason.querySelector('.memory-reason-text').textContent = scenario === 'customer' ? data.reason : project[2];
      result.hidden = false;
      action.textContent = 'Response shown';
      action.setAttribute('aria-expanded', 'true');
      for (const card of cards.children) card.classList.add('is-used');
      status.textContent = resultText.textContent;
      if (!reduced.matches && !paused) result.animate([
        { opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }
      ], { duration: 320, easing: 'ease-out' });
    }
    function render() {
      const data = scenarios[scenario];
      customerTab.setAttribute('aria-pressed', String(scenario === 'customer'));
      projectTab.setAttribute('aria-pressed', String(scenario === 'project'));
      action.setAttribute('aria-expanded', 'false');
      contextLabel.textContent = data.context;
      promptLabel.textContent = data.promptLabel;
      prompt.textContent = data.prompt;
      cards.replaceChildren(...data.memories.map(([label, original]) => {
        let value = original;
        if (scenario === 'project') {
          if (constraint === 'sooner' && label === 'Launch') value = '4 November target';
          if (constraint === 'budget' && label === 'Budget') value = 'A$25,000 ceiling';
          if (constraint === 'priority' && label === 'Priority') value = 'Basic analytics before booking';
        }
        const card = node('div', undefined, 'memory-card');
        card.append(node('span', label), node('strong', value));
        return card;
      }));
      choices.replaceChildren();
      choices.hidden = scenario !== 'project';
      if (scenario === 'project') {
        for (const [key, [label]] of Object.entries(projectAnswers)) {
          const option = control(label, () => selectConstraint(key));
          option.setAttribute('aria-pressed', String(key === constraint));
          option.dataset.key = key;
          choices.append(option);
        }
        action.textContent = 'Show the revised plan';
      } else action.textContent = 'Show Construct’s response';
    }
    render();
    return box;
  }

  function mountMemoryDemo(feature) {
    const panel = $('panel');
    // Keep the native panel heading, close control and existing enquiry action.
    // Replace the process copy with one compact, high-value interactive example.
    for (const child of [...panel.children]) {
      if (!child.matches('.panel-top, #feature-title, .enquiry-link')) child.remove();
    }
    const details = node('details', undefined, 'memory-explanation');
    details.append(node('summary', 'How memory is governed'), node('p', 'A live implementation would define who can view, correct or remove remembered information, how long it is retained and which sources Twin may use. ' + feature.controls));
    panel.insertBefore(memoryDemo(), panel.querySelector('.enquiry-link'));
    panel.insertBefore(details, panel.querySelector('.enquiry-link'));
  }

  function documentDemo() {
    const box = demoShell('From job notes to reviewed information');
    box.dataset.demo = 'document';
    box.append(node('p', 'Inspect a fictional plumbing note, extract its details and resolve uncertainty before preparing a draft.'));
    const source = node('div', undefined, 'demo-source');
    source.append(node('small', 'Sample job note · JOB-014'), node('p', '“Replaced kitchen mixer. 2 hours labour. One mixer, model unclear. Customer: Jordan. Check which part was fitted.”'));
    const output = node('div', undefined, 'demo-output');
    output.setAttribute('role', 'status');
    let step = 0;
    const next = control('Extract sample fields', () => { step = Math.min(3, step + 1); update(); }, true);
    const reset = control('Restart example', () => { step = 0; update(); });
    function update() {
      output.replaceChildren();
      if (step === 0) output.append(node('p', 'The sample note is ready to inspect.'));
      else {
        const list = node('dl', undefined, 'document-fields');
        for (const [key, value] of [['Job', 'JOB-014'], ['Customer', 'Jordan'], ['Labour', '2 hours'], ['Part', step === 1 ? 'Mixer model unknown · review required' : 'Example mixer A · confirmed by reviewer']]) {
          list.append(node('dt', key), node('dd', value));
        }
        output.append(list);
        output.append(node('p', step === 1 ? 'The unclear part is flagged. No price or part number is invented.' : step === 2 ? 'The example reviewer has resolved the uncertain field. A draft can now be prepared for review.' : 'Local example draft: replace one Example mixer A; labour 2 hours. Pricing still requires an approved price list. Nothing has been written to external software.'));
      }
      next.textContent = ['Extract sample fields', 'Confirm the example part', 'Prepare example draft', 'Example draft prepared'][step];
      next.disabled = step === 3;
    }
    const controls = node('div', undefined, 'demo-controls');
    controls.append(next, reset);
    box.append(source, output, controls);
    update();
    return box;
  }

  const workflowIds = new Set([
    'relationship-context',
    'conversational-intelligence',
    'human-handover',
    'workflow-orchestration',
    'email-automation',
    'documents-data',
    'lead-qualification',
    'nurturing-follow-up',
    'customer-lifecycle',
    'retention',
    'crm-workspace',
    'team-collaboration',
    'audit-approvals',
  ]);
  const briefingIds = new Set([
    'business-knowledge',
    'persistent-memory',
    'memory-management',
    'calendar-tasks',
    'automated-briefings',
    'pipeline-intelligence',
    'revenue-performance',
  ]);
  function refresh(category, feature, previous) {
    cleanup();
    note.hidden = state.view !== 'core';
    const groupChanged =
      previous &&
      (previous.view !== state.view || previous.category !== state.category);
    if (groupChanged && !reduced.matches && !paused) {
      document.body.classList.add('core-opening', 'revealing');
      transitionTimer = setTimeout(
        () => document.body.classList.remove('core-opening', 'revealing'),
        800
      );
      pulse(state.category ? 'Opening category' : 'Exploring capabilities');
    } else if (previous && previous.feature !== state.feature)
      pulse(feature ? 'Opening capability' : 'Returning to category');
    if (feature) {
      let demo = null;
      if (feature.id === 'persistent-memory') mountMemoryDemo(feature);
      else if (feature.id === 'memory-management') demo = memoryManagementDemo();
      else if (feature.id === 'revenue-performance') demo = revenueDemo();
      else if (feature.id === 'documents-data') demo = documentDemo();
      else if (feature.id === 'voice-cloning' || feature.id === 'voice-messages')
        demo = voiceOverview(feature);
      else if (window.TwinStories?.[feature.id]) demo = storyDemo(window.TwinStories[feature.id]);
      else if (workflowIds.has(feature.id)) demo = workflowDemo(feature);
      else if (briefingIds.has(feature.id)) demo = briefingDemo();
      else if (category.id === 'privacy') demo = privacyDemo();
      if (demo) mountFeatureDemo(feature, demo);
      $('panel').scrollTop = 0;
    }
    const stage = $('stage');
    const labels = [...$('nodes').querySelectorAll('.node')];
    labels.forEach((label, i) => {
      const highlight = () => {
        stage.classList.add('engaged');
        stage.style.setProperty(
          '--bearing',
          label.style.getPropertyValue('--angle')
        );
        signal.targetX = Number(label.style.getPropertyValue('--nx'));
        signal.targetY = Number(label.style.getPropertyValue('--ny'));
        signal.focused = true;
        restart();
      };
      label.onpointerenter = label.onfocus = highlight;
      label.onpointerleave = label.onblur = () => {
        stage.classList.remove('engaged');
        signal.focused = false;
        restart();
      };
      label.onkeydown = e => {
        let index = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown')
          index = (i + 1) % labels.length;
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp')
          index = (i + labels.length - 1) % labels.length;
        if (e.key === 'Home') index = 0;
        if (e.key === 'End') index = labels.length - 1;
        if (index !== null) {
          e.preventDefault();
          labels[index].focus({ preventScroll: true });
        }
      };
    });
  }
  $('query').addEventListener('input', () => {
    if (listening || window.TwinSpeech?.isActive()) stopVoice();
    if ($('query').value) pulse('Receiving your request');
  });
  window.TwinExperience = {
    signal,
    mode,
    pulse,
    suspend,
    cleanup,
    refresh,
    workflowStep,
  };
  window.TwinCore.workflowStep = workflowStep;
  refresh(
    getCategory(state.category),
    getCategory(state.category)?.features.find(f => f.id === state.feature)
  );
})();
