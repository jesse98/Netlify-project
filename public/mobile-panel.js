'use strict';
/* Option B explorer and a dedicated mobile capability sheet. */
(() => {
  const media = matchMedia('(max-width:720px)');
  const baseRender = render;
  const detailPanel = $('panel');
  const panelParent = detailPanel.parentElement;
  const query = $('query');
  const examples = [
    'What could I automate in my construction business?',
    'We use Procore and Xero. What could Construct automate?',
    'How could AI process subcontractor quotes?',
    'What happens when a variation comes through by email?',
    'How could we automate invoice and purchase order admin?',
    'How could Construct connect Outlook to our projects?',
    'How could we spot material overruns earlier?',
    'How could AI prepare our weekly project status report?'
  ];
  const benefits = {
    identity: 'Understand each project, its people, documents and decisions.',
    communication: 'Turn project correspondence into structured, useful context.',
    automation: 'Automate repetitive work across the systems your team already uses.',
    sales: 'Surface commercial changes, quote activity and potential cost pressure.',
    crm: 'Connect Procore, Xero, Microsoft 365 and other supported construction systems.',
    privacy: 'Keep sensitive actions controlled with permissions, approvals and audit history.'
  };
  const exampleButton = button('', () => {
    query.value = examples[exampleIndex];
    query.dispatchEvent(new Event('input'));
    query.focus({ preventScroll: true });
  }, 'question-example');
  const exampleLabel = node('span', 'TRY ASKING', 'question-example-label');
  const exampleText = node('span', '', 'question-example-text');
  exampleButton.append(exampleLabel, exampleText);
  const questionHelp = node('span', 'Ask about a business problem. Tap an example to put it in the field, then send when ready.', 'visually-hidden');
  questionHelp.id = 'question-help';
  let exampleIndex = 0;
  let rotationTimer = 0;
  function scheduleExamples() {
    clearTimeout(rotationTimer);
    exampleText.textContent = examples[exampleIndex];
    exampleButton.setAttribute('aria-label', 'Use example: ' + examples[exampleIndex]);
    exampleButton.hidden = Boolean(query.value);
    query.placeholder = 'Ask Construct…';
    if (document.hidden || reduced.matches || paused || query.value || document.activeElement === query || document.querySelector('dialog[open]') || document.body.classList.contains('chat-focused')) return;
    // The full question wraps instead of disappearing through a narrow input.
    const duration = Math.max(5000, examples[exampleIndex].split(' ').length * 450 + 1000);
    rotationTimer = setTimeout(() => {
      exampleIndex = (exampleIndex + 1) % examples.length;
      scheduleExamples();
    }, duration);
  }
  function ensureQuestionPrompt() {
    if (!exampleButton.isConnected) $('command').before(exampleButton);
    if (!questionHelp.isConnected) $('command-area').append(questionHelp);
    query.setAttribute('aria-label', 'Ask Construct a question');
    query.setAttribute('aria-describedby', 'question-help');
    $('command').lastElementChild.setAttribute('aria-label', 'Ask Construct');
    $('browse').hidden = true;
  }

  const section = node('section', undefined, 'capability-panel');
  section.id = 'capability-panel';
  section.setAttribute('aria-labelledby', 'capabilities-heading');
  const headingRow = node('div', undefined, 'capability-heading');
  const heading = node('h2', 'Explore capabilities');
  heading.id = 'capabilities-heading';
  headingRow.append(heading, node('span', `${CATALOGUE.length} systems`));
  const grid = node('div', undefined, 'capability-grid');
  const featureSection = node('section', undefined, 'system-features');
  featureSection.id = 'system-features';
  const gridButtons = CATALOGUE.map(category => {
    const b = button('', () => navigate({ view: 'core', category: category.id }), 'system-button');
    b.dataset.system = category.id;
    b.setAttribute('aria-haspopup', 'dialog');
    b.append(node('span', category.name, 'system-name'), node('span', `${category.features.length} capabilities`, 'system-count'));
    grid.append(b);
    return b;
  });
  grid.addEventListener('keydown', event => {
    const index = gridButtons.indexOf(document.activeElement);
    if (index < 0) return;
    const offsets = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 2, ArrowUp: -2 };
    let next = event.key === 'Home' ? 0 : event.key === 'End' ? gridButtons.length - 1 : null;
    if (event.key in offsets) next = (index + offsets[event.key] + gridButtons.length) % gridButtons.length;
    if (next !== null) {
      event.preventDefault();
      gridButtons[next].focus();
    }
  });
  section.append(headingRow, grid);

  const sheet = node('dialog', undefined, 'mobile-capability-sheet');
  sheet.setAttribute('aria-labelledby', 'capability-sheet-title');
  const sheetHeader = node('div', undefined, 'capability-sheet-header');
  const sheetTitle = node('h2');
  sheetTitle.id = 'capability-sheet-title';
  const sheetClose = button('×', closeSheet, 'capability-sheet-close');
  sheetClose.setAttribute('aria-label', 'Close capabilities');
  const sheetBack = button('← All capabilities in this system', () => {
    const current = window.TwinCore.getState();
    navigate({ view: 'core', category: current.category });
  }, 'capability-sheet-back');
  const sheetContent = node('div', undefined, 'capability-sheet-content');
  sheetHeader.append(sheetTitle, sheetClose);
  sheetContent.append(sheetBack, featureSection, detailPanel);
  sheet.append(sheetHeader, sheetContent);
  document.body.append(sheet);
  let sheetOrigin = { view: 'core' };
  let originFocus = null;
  let originScroll = 0;
  let navigationFocus = null;
  let contactRequested = false;
  function closeSheet() {
    navigate(sheetOrigin);
  }
  document.addEventListener('twin-contact-request', () => {
    if (sheet.open) { contactRequested = true; closeSheet(); }
  });
  sheet.addEventListener('cancel', event => {
    event.preventDefault();
    closeSheet();
  });
  sheet.addEventListener('click', event => {
    if (event.target === sheet) {
      const rect = sheet.getBoundingClientRect();
      if (event.clientY < rect.top || event.clientX < rect.left || event.clientX > rect.right) closeSheet();
    }
  });
  function restoreOrigin() {
    if (!sheet.open) return;
    sheet.close();
    document.body.classList.remove('capability-sheet-open');
    if (contactRequested) { contactRequested = false; return; }
    requestAnimationFrame(() => {
      window.scrollTo({ top: originScroll, behavior: 'auto' });
      if (originFocus?.isConnected) originFocus.focus({ preventScroll: true });
    });
  }
  function apply(previous) {
    ensureQuestionPrompt();
    const current = window.TwinCore.getState();
    document.body.classList.toggle('mobile-panel-ui', media.matches);
    if (!media.matches) {
      restoreOrigin();
      panelParent.append(detailPanel);
      section.remove();
      $('back').hidden = false;
      scheduleExamples();
      return;
    }
    $('title').innerHTML = 'Construction <span>Intelligence</span>';
    $('subtitle').textContent = 'AI systems for construction businesses that connect existing software, automate repetitive work and turn project information into action.';
    $('command-area').hidden = false;
    $('hero-hit').hidden = true;
    $('explore').hidden = true;
    $('nodes').hidden = true;
    $('preview-note').hidden = true;
    $('back').hidden = true;
    document.querySelector('.core-side').append(section);
    sheetContent.append(detailPanel);
    gridButtons.forEach(b => b.dataset.selected = String(current.category === b.dataset.system));
    if (!current.category) {
      restoreOrigin();
      scheduleExamples();
      requestAnimationFrame(resize);
      return;
    }
    const category = getCategory(current.category);
    const feature = category.features.find(item => item.id === current.feature);
    if (!sheet.open) {
      sheetOrigin = previous && !previous.category ? { ...previous } : { view: 'core' };
      originFocus = navigationFocus || document.activeElement;
      originScroll = window.scrollY;
    }
    sheetTitle.textContent = feature?.name || category.name;
    sheetBack.hidden = !feature;
    featureSection.hidden = Boolean(feature);
    featureSection.replaceChildren();
    if (!feature) {
      featureSection.append(node('p', benefits[category.id]));
      const links = node('div', undefined, 'system-feature-links');
      for (const item of category.features) {
        const b = button(item.name, () => navigate({ view: 'core', category: category.id, feature: item.id }), 'system-feature');
        b.append(node('span', '↗', 'feature-link-arrow'));
        links.append(b);
      }
      featureSection.append(links);
    }
    document.body.classList.add('capability-sheet-open');
    if (!sheet.open) sheet.showModal();
    sheetContent.scrollTop = 0;
    sheetTitle.tabIndex = -1;
    sheetTitle.focus({ preventScroll: true });
    scheduleExamples();
    requestAnimationFrame(resize);
  }
  render = function(previous) {
    navigationFocus = document.activeElement;
    if (media.matches) focusHint = null;
    baseRender(previous);
    apply(previous);
  };
  query.addEventListener('input', scheduleExamples);
  query.addEventListener('focus', scheduleExamples);
  query.addEventListener('blur', scheduleExamples);
  media.addEventListener('change', () => apply());
  reduced.addEventListener('change', scheduleExamples);
  document.addEventListener('visibilitychange', scheduleExamples);
  $('motion').addEventListener('click', scheduleExamples);
  window.addEventListener('pagehide', () => clearTimeout(rotationTimer));
  window.addEventListener('pageshow', scheduleExamples);
  new MutationObserver(scheduleExamples).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  window.TwinUI = Object.freeze({ revision: 'mobile-workspace-1', examples: examples.map(question => ({ question })) });
  apply();
})();
