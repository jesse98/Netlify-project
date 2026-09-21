import { api } from '@appdeploy/client';
import { briefText, emptyMemory, redactSecrets, requestsImplementationBrief, validResponse, type Brief, type Memory, type Turn, type TwinResponse } from '../shared/contracts';
import { publicFailure } from '../shared/client-errors';
import { mountHeaderNavigation } from './header-navigation';
import './ask-twin.css';
import './mobile-workspace.css';

interface CatalogueSystem { id: string; name: string; features: Array<{ id: string; name: string }> }
interface CoreState { view: 'home' | 'core'; category?: string; feature?: string }
interface Exchange { number: number; question: string; response?: TwinResponse; failure?: string }
declare global {
  interface Window {
    TwinCore: { CATALOGUE: CatalogueSystem[]; navigate: (state: CoreState, focus?: boolean) => void; getState: () => CoreState };
    TwinAsk: { submit: (message: string) => void; isThinking: () => boolean };
    TwinExperience?: { mode: (value: string, level?: number) => void };
    TwinSpeech?: { stop: () => void };
  }
}

const ENQUIRY_FORM_URL = '';
const el = <K extends keyof HTMLElementTagNameMap>(tag: K, text?: string, className?: string): HTMLElementTagNameMap[K] => {
  const element = document.createElement(tag);
  if (text !== undefined) element.textContent = text;
  if (className) element.className = className;
  return element;
};
const button = (label: string, action: () => void, className = 'ask-chip') => {
  const b = el('button', label, className);
  b.type = 'button';
  b.addEventListener('click', action);
  return b;
};

export function mountAskTwin() {
  const form = document.getElementById('command') as HTMLFormElement | null;
  const query = document.getElementById('query') as HTMLTextAreaElement | null;
  const area = document.getElementById('command-area');
  if (!form || !query || !area || !window.TwinCore) return;
  area.classList.add('ask-area');
  const mobile = matchMedia('(max-width: 720px)');
  const reading = el('div', undefined, 'ask-reading');
  const dock = el('div', undefined, 'ask-dock');
  const catalogue = window.TwinCore.CATALOGUE;
  const capabilityMap = new Map(catalogue.map(c => [c.id, new Set(c.features.map(f => f.id))]));
  const log = el('div', undefined, 'ask-log');
  log.setAttribute('role', 'log');
  log.setAttribute('aria-label', 'Ask Construct conversation');
  log.setAttribute('aria-live', 'polite');
  log.setAttribute('aria-relevant', 'additions text');
  const surface = el('section', undefined, 'ask-conversation');
  surface.hidden = true;
  surface.tabIndex = -1;
  surface.setAttribute('aria-label', 'Ask Construct');
  const toolbar = el('div', undefined, 'ask-toolbar');
  const tools = el('div', undefined, 'ask-toolbar-actions');
  tools.append(button('Back to capabilities', explore, 'ask-text-button'), button('New conversation', resetConversation, 'ask-text-button'));
  toolbar.append(el('span', 'Ask Construct', 'ask-label'), tools);
  surface.append(toolbar, log);
  area.prepend(surface);

  let history: Turn[] = [];
  let memory: Memory = emptyMemory();
  let turn = 0;
  let questionNumber = 0;
  let generation = 0;
  let thinking = false;
  let exchanges: Exchange[] = [];
  let selected = 0;

  const contact = el('section', undefined, 'ask-contact-block');
  const contactToggle = button('Discuss a construction automation pilot', toggleContact, 'ask-contact-button');
  contactToggle.setAttribute('aria-expanded', 'false');
  contactToggle.setAttribute('aria-controls', 'ask-contact-form');
  const contactPanel = el('div', undefined, 'ask-contact-panel');
  contactPanel.id = 'ask-contact-form';
  contactPanel.hidden = true;
  let contactFrame: HTMLIFrameElement | null = null;
  let contactTopic = '';
  contact.append(contactToggle, contactPanel);
  area.append(contact);

  const pager = el('nav', undefined, 'ask-history');
  pager.setAttribute('aria-label', 'Question history');
  pager.hidden = true;
  const older = button('←', () => selectExchange(selected - 1), 'ask-history-arrow');
  older.setAttribute('aria-label', 'Previous question');
  const newer = button('→', () => selectExchange(selected + 1), 'ask-history-arrow');
  newer.setAttribute('aria-label', 'Next question');
  const historyDialog = el('dialog', undefined, 'ask-history-dialog');
  historyDialog.setAttribute('aria-labelledby', 'history-title');
  const historyTitle = el('h2', 'Previous questions');
  historyTitle.id = 'history-title';
  const historyList = el('div', undefined, 'ask-history-list');
  historyDialog.append(historyTitle, historyList, button('Close history', () => historyDialog.close(), 'ask-text-button'));
  historyDialog.addEventListener('click', event => {
    if (event.target === historyDialog) historyDialog.close();
  });
  document.body.append(historyDialog);
  const historySelect = button('', () => historyDialog.showModal(), 'ask-history-picker');
  historySelect.setAttribute('aria-label', 'Choose a question');
  const pageCount = el('span', '', 'ask-page-count');
  pageCount.setAttribute('aria-live', 'polite');
  const historyMiddle = el('div', undefined, 'ask-history-middle');
  historyMiddle.append(historySelect);
  pager.append(older, historyMiddle, newer);
  area.append(pager);

  const privacy = el('details', undefined, 'ask-privacy');
  privacy.append(el('summary', 'About this conversation'),
    el('p', 'Ask Construct uses AI and this page’s conversation to answer you. Navigation keeps the context; refresh, close or New conversation clears it from this page. Requests are processed by AppDeploy’s server-side AI. Provider retention is not specified. Do not share passwords, payment details or confidential records. No business systems are connected.'),
    el('p', 'Voice starts after you press Start and grant microphone permission, and stops after 15 seconds. Your browser’s speech service may process audio externally. Recognised text is sent to Ask Construct; this page does not retain audio.'),
    el('p', 'This preview does not submit enquiries automatically. Copy any implementation brief you want to share with the Construct team.'));
  contact.insertBefore(privacy, contactPanel);
  const dataDialog = el('dialog', undefined, 'twin-data-dialog');
  dataDialog.setAttribute('aria-labelledby', 'twin-data-title');
  const dataTitle = el('h2', 'Privacy & data');
  dataTitle.id = 'twin-data-title';
  dataDialog.append(dataTitle, el('p', 'How this public Construction Intelligence website handles your information. Last updated 21 September 2026.'));
  for (const [heading, text] of [
    ['Ask Construct', 'Your question and relevant conversation context are sent to AppDeploy’s server-side AI to generate an answer. The public chat has no access to your business accounts. Do not include passwords, payment details or confidential records.'],
    ['Session memory', 'Conversation context stays in this open page while you navigate. Refreshing, closing the page or choosing New conversation clears it from the page. This does not request deletion from service-provider logs. Provider retention and processing locations have not been confirmed for this public site.'],
    ['Voice questions', 'Microphone access starts only after you press Start and grant permission. The session stops after 15 seconds. Your browser’s speech service may process audio externally; recognised text is sent to Ask Construct. This page does not retain audio. Voice cloning tests are arranged separately with Construct; there is no recording upload here.'],
    ['Contact enquiries', 'This preview does not submit an enquiry or connect to a live mailbox. Copy only the details you want to share with the Construct team.'],
    ['Demonstrations and service operation', 'Capability examples use fictional data and do not change real business records. The chat backend keeps timestamps under a hashed connection identifier for request limits; chat content is not written to that rate-limit database. Hosting and AI providers may maintain their own operational records.'],
    ['Questions or data requests', 'Use the implementation brief or your existing contact with the Construct team. Provider, backup and retention limitations need to be checked for the specific deployment.']
  ]) dataDialog.append(el('h3', heading), el('p', text));
  dataDialog.append(button('Close privacy information', () => dataDialog.close(), 'ask-text-button'));
  document.body.append(dataDialog);
  function showPrivacy() {
    if (!dataDialog.open) dataDialog.showModal();
    dataDialog.scrollTop = 0;
  }
  privacy.append(button('Read privacy & data information', showPrivacy, 'ask-text-button twin-data-link'));
  const help = document.getElementById('question-help');
  if (help) help.textContent = 'Ask Construct what you would like to automate or improve in your construction business.';
  query.maxLength = 2000;
  query.setAttribute('aria-label', 'Ask Construct a question');
  const submitButton = form.lastElementChild as HTMLButtonElement;
  submitButton.setAttribute('aria-label', 'Ask Construct');
  const status = document.getElementById('status');
  const resume = button('Return to conversation', resumeConversation, 'ask-resume');
  resume.hidden = true;
  reading.append(surface, contact, pager);
  for (const child of [...area.children]) dock.append(child);
  dock.append(resume);
  area.append(reading, dock);
  // The text area remains the same DOM node used by speech and the explorer.
  const resizeQuery = () => {
    query.style.height = 'auto';
    query.style.height = Math.min(112, Math.max(40, query.scrollHeight)) + 'px';
  };
  query.addEventListener('input', resizeQuery);
  query.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing && !mobile.matches) {
      event.preventDefault();
      form.requestSubmit();
    }
  });
  const syncViewport = () => {
    const viewport = window.visualViewport;
    const root = document.documentElement;
    root.style.setProperty('--twin-viewport-height', (viewport?.height || innerHeight) + 'px');
    root.style.setProperty('--twin-viewport-top', (viewport?.offsetTop || 0) + 'px');
    document.body.classList.toggle('keyboard-open', Boolean(mobile.matches && viewport && innerHeight - viewport.height > 140));
  };
  window.visualViewport?.addEventListener('resize', syncViewport);
  window.visualViewport?.addEventListener('scroll', syncViewport);
  window.addEventListener('resize', syncViewport);
  mobile.addEventListener('change', () => { syncViewport(); resizeQuery(); });
  syncViewport();
  resizeQuery();

  mountHeaderNavigation({
    capabilities: () => {
      explore();
      requestAnimationFrame(() => {
        const destination = mobile.matches
          ? document.getElementById('capabilities-heading')
          : document.getElementById('nodes');
        if (!destination) return;
        destination.tabIndex = -1;
        destination.focus({ preventScroll: true });
        destination.scrollIntoView({ block: mobile.matches ? 'start' : 'center', behavior: 'auto' });
      });
    },
    ask: () => {
      window.TwinCore.navigate({ view: 'core' });
      resumeConversation();
      query.focus({ preventScroll: true });
      if (!document.body.classList.contains('chat-focused')) {
        form.scrollIntoView({ block: 'center', behavior: 'auto' });
      }
    },
    privacy: showPrivacy,
    contact: () => {
      query.blur();
      window.TwinCore.navigate({ view: 'core' });
      document.dispatchEvent(new Event('twin-contact-request'));
      if (contactPanel.hidden) toggleContact();
      contactPanel.tabIndex = -1;
      contactPanel.focus({ preventScroll: true });
      contactPanel.scrollIntoView({ block: 'start', behavior: 'auto' });
    }
  });

  function returnHome() {
    query!.blur();
    window.TwinSpeech?.stop();
    for (const openDialog of document.querySelectorAll<HTMLDialogElement>('dialog[open]')) openDialog.close();
    document.body.classList.remove('chat-focused', 'capability-sheet-open');
    document.body.classList.toggle('chat-minimised', exchanges.length > 0);
    resume.hidden = !exchanges.length;
    contactPanel.hidden = true;
    contactToggle.setAttribute('aria-expanded', 'false');
    privacy.open = false;
    window.TwinCore.navigate({ view: 'home' }, false);
    document.getElementById('home')?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
    window.dispatchEvent(new Event('resize'));
    document.dispatchEvent(new Event('twin-home-return'));
  }
  const home = document.getElementById('home');
  if (home) home.onclick = returnHome;

  function resumeConversation() {
    if (!exchanges.length) return;
    document.body.classList.add('chat-focused');
    document.body.classList.remove('chat-minimised');
    resume.hidden = true;
    syncViewport();
    requestAnimationFrame(() => {
      resizeQuery();
      reading.scrollTop = 0;
      window.dispatchEvent(new Event('resize'));
    });
  }

  function explore() {
    query!.blur();
    document.body.classList.remove('chat-focused');
    document.body.classList.add('chat-minimised');
    resume.hidden = !exchanges.length;
    window.TwinCore.navigate({ view: 'core' });
    window.scrollTo({ top: 0, behavior: 'auto' });
    window.dispatchEvent(new Event('resize'));
  }

  function showCurrentTop() {
    if (mobile.matches) reading.scrollTop = 0;
    else surface.scrollIntoView({ block: 'start', behavior: 'auto' });
  }

  const dialog = el('dialog', undefined, 'ask-brief-dialog');
  dialog.setAttribute('aria-labelledby', 'ask-brief-title');
  const title = el('h2', 'Your implementation brief');
  title.id = 'ask-brief-title';
  const draft = el('textarea');
  draft.setAttribute('aria-label', 'Implementation enquiry draft');
  draft.rows = 14;
  let draftSource = '';
  const draftStatus = el('p', '', 'ask-draft-status');
  draftStatus.setAttribute('role', 'status');
  const actions = el('div', undefined, 'ask-brief-actions');
  actions.append(button('Copy brief', async () => {
    try { await navigator.clipboard.writeText(draft.value); draftStatus.textContent = 'Brief copied. Nothing has been sent.'; }
    catch { draft.focus(); draft.select(); draftStatus.textContent = 'Select and copy the draft. Nothing has been sent.'; }
  }), button('Download brief', () => {
    const url = URL.createObjectURL(new Blob([draft.value], { type: 'text/plain;charset=utf-8' }));
    const link = el('a');
    link.href = url;
    link.download = 'Construct-Implementation-Brief.txt';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    draftStatus.textContent = 'Download prepared. Nothing has been sent.';
  }), button('Close', () => dialog.close(), 'ask-text-button'));
  dialog.append(title, el('p', 'Review or copy this summary. You can paste any details you want to share into the enquiry form.'), draft, draftStatus, actions);
  document.body.append(dialog);

  function toggleContact() {
    const opening = contactPanel.hidden;
    contactPanel.hidden = !opening;
    contactToggle.setAttribute('aria-expanded', String(opening));
    if (!opening) return;
    if (!contactFrame) {
      const intro = el('p', undefined, 'ask-contact-intro');
      intro.append(el('strong', contactTopic ? 'Enquiry topic: ' + contactTopic : 'Tell Construct what construction workflow you would like to explore.'),
        el('span', 'Use Ask Construct to prepare a brief. No chat history is shared automatically.'));
      intro.append(el('br'), button('Privacy & data', showPrivacy, 'ask-text-button twin-data-link'));
      const loading = el('p', 'Preparing implementation options.', 'ask-contact-loading');
      loading.setAttribute('role', 'status');
      contactFrame = el('iframe', undefined, 'ask-contact-iframe');
      contactFrame.title = 'Construct implementation information';
      contactFrame.src = ENQUIRY_FORM_URL || 'about:blank';
      contactFrame.referrerPolicy = 'no-referrer';
      contactFrame.setAttribute('sandbox', 'allow-forms allow-scripts allow-same-origin allow-popups');
      contactFrame.addEventListener('load', () => { loading.hidden = true; });
      const fallback = el('p', 'Use Ask Construct to prepare an implementation brief, then copy or download it to share with the team.', 'ask-form-fallback');
      loading.hidden = true;
      contactFrame.hidden = true;
      contactPanel.append(intro, fallback);
    }
    contactToggle.scrollIntoView({ block: 'nearest', behavior: 'auto' });
  }

  function setThinking(value: boolean) {
    thinking = value;
    document.body.classList.toggle('ask-thinking', value);
    surface.setAttribute('aria-busy', String(value));
    submitButton.disabled = value;
    window.TwinExperience?.mode(value ? 'thinking' : 'idle');
  }

  function resetConversation() {
    generation += 1;
    history = [];
    memory = emptyMemory();
    exchanges = [];
    selected = 0;
    turn = 0;
    questionNumber = 0;
    log.replaceChildren();
    surface.hidden = true;
    pager.hidden = true;
    document.body.classList.remove('has-conversation', 'chat-focused', 'chat-minimised');
    resume.hidden = true;
    historyDialog.close();
    draft.value = '';
    draftSource = '';
    draftStatus.textContent = '';
    dialog.close();
    contactPanel.hidden = true;
    contactPanel.replaceChildren();
    contactFrame = null;
    contactTopic = '';
    contactToggle.setAttribute('aria-expanded', 'false');
    query!.value = '';
    query!.dispatchEvent(new Event('input'));
    setThinking(false);
    if (status) status.textContent = 'New conversation started. Previous page context cleared.';
    if (!mobile.matches) query!.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'auto' });
    window.dispatchEvent(new Event('resize'));
  }

  function openBrief(brief: Brief) {
    const source = briefText(brief);
    if (source !== draftSource) { draft.value = source; draftSource = source; }
    draftStatus.textContent = 'Draft only. Not submitted.';
    dialog.showModal();
  }

  function selectExchange(index: number) {
    if (!Number.isInteger(index) || index < 0 || index >= exchanges.length) return;
    selected = index;
    renderExchange();
    historyDialog.close();
    showCurrentTop();
    surface.focus({ preventScroll: true });
  }

  function renderExchange() {
    const exchange = exchanges[selected];
    if (!exchange) return;
    surface.hidden = false;
    document.body.classList.add('has-conversation');
    log.replaceChildren();
    const row = el('article', undefined, 'ask-message ask-user');
    row.append(el('h3', 'Question ' + exchange.number, 'ask-speaker'), el('p', exchange.question));
    log.append(row);
    if (exchange.response) {
      const response = exchange.response;
      const message = el('article', undefined, 'ask-message ask-answer');
      message.append(el('h3', 'Construct', 'ask-speaker'));
      const content = el('div', undefined, 'ask-answer-text');
      const paragraphs = response.answer.split(/\n\s*\n/);
      const more = el('details', undefined, 'ask-more-detail');
      more.append(el('summary', 'More detail'));
      paragraphs.forEach((paragraph, index) => {
        const target = paragraphs.length > 3 && response.answer.length > 1000 && index > 1 ? more : content;
        target.append(el('p', paragraph));
      });
      if (more.children.length > 1) content.append(more);
      message.append(content);
      if (response.relevantCapabilities.length) {
        const relevant = el('div', undefined, 'ask-capabilities');
        relevant.append(el('p', 'Relevant capabilities', 'ask-meta'));
        const choices = el('div', undefined, 'ask-chips');
        const extraCapabilities = el('details', undefined, 'ask-extra-capabilities');
        extraCapabilities.append(el('summary', 'More capabilities'));
        for (const [index, item] of response.relevantCapabilities.entries()) {
          const system = catalogue.find(c => c.id === item.systemId)!;
          const feature = system.features.find(f => f.id === item.featureId);
          (index < 2 ? choices : extraCapabilities).append(button(feature?.name || system.name, () => window.TwinCore.navigate({
            view: 'core', category: system.id, ...(feature ? { feature: feature.id } : {})
          })));
        }
        relevant.append(choices);
        if (extraCapabilities.children.length > 1) relevant.append(extraCapabilities);
        message.append(relevant);
      }
      if (response.suggestedQuestions.length) {
        const suggestions = el('div', undefined, 'ask-followups');
        suggestions.setAttribute('aria-label', 'Suggested follow-up questions');
        const extraQuestions = el('details', undefined, 'ask-extra-followups');
        extraQuestions.append(el('summary', 'More questions'));
        for (const [index, question] of response.suggestedQuestions.entries()) {
          (index === 0 ? suggestions : extraQuestions).append(button(question, () => void submit(question), 'ask-followup'));
        }
        if (extraQuestions.children.length > 1) suggestions.append(extraQuestions);
        message.append(suggestions);
      }
      if (response.action === 'handoff' || response.commercialIntent === 'ready' || requestsImplementationBrief(exchange.question)) {
        message.append(button('Review implementation brief', () => openBrief(response.implementationBrief), 'ask-text-button'));
      }
      log.append(message);
    } else if (exchange.failure) {
      const errorBox = el('div', undefined, 'ask-error');
      errorBox.setAttribute('role', 'alert');
      errorBox.append(el('p', exchange.failure), button('Retry question', () => {
        void submit(exchange.question, exchange === exchanges[exchanges.length - 1] ? exchange : undefined);
      }));
      log.append(errorBox);
    } else {
      const working = el('p', 'Construct is thinking…', 'ask-working');
      working.setAttribute('role', 'status');
      log.append(working);
    }
    pager.hidden = exchanges.length < 2;
    older.disabled = selected === 0;
    newer.disabled = selected === exchanges.length - 1;
    historyList.replaceChildren(...exchanges.map((item, index) => {
      const option = button(item.number + '. ' + item.question, () => selectExchange(index), 'ask-history-item');
      option.setAttribute('aria-current', String(index === selected));
      return option;
    }));
    pageCount.textContent = 'Question ' + exchange.number + ' of ' + questionNumber;
    historySelect.replaceChildren(pageCount, el('span', 'View history', 'ask-history-hint'));
  }

  async function submit(raw: string, retry?: Exchange) {
    const message = redactSecrets(raw.trim());
    if (thinking) return;
    if (!message || message.length > 2000) {
      if (status) status.textContent = 'Type a question of 1–2,000 characters.';
      query!.focus();
      return;
    }
    window.TwinSpeech?.stop();
    if (mobile.matches) query!.blur();
    const mine = ++generation;
    const exchange = retry || { number: ++questionNumber, question: message };
    if (!retry) exchanges.push(exchange);
    if (exchanges.length > 20) exchanges.shift();
    exchange.failure = undefined;
    selected = exchanges.length - 1;
    if (status) status.textContent = '';
    query!.value = '';
    query!.dispatchEvent(new Event('input'));
    setThinking(true);
    renderExchange();
    resumeConversation();
    showCurrentTop();
    let recent = history.slice(-24);
    while (JSON.stringify({ message, history: recent, memory }).length > 44000 && recent.length) recent = recent.slice(2);
    try {
      let timeoutId = 0;
      const timeout = new Promise<never>((_, reject) => {
        timeoutId = window.setTimeout(() => reject(new Error('request_timeout')), 45000);
      });
      const result = await Promise.race([
        api.post('/api/ask-twin', { message, history: recent, memory, turn: turn + 1 }),
        timeout
      ]).finally(() => window.clearTimeout(timeoutId));
      if (mine !== generation) return;
      if (!validResponse(result.data, capabilityMap)) throw new Error('invalid_response');
      exchange.response = result.data;
      history.push({ role: 'user', content: message }, { role: 'assistant', content: result.data.answer });
      history = history.slice(-40);
      memory = result.data.memory;
      turn += 1;
      if (exchanges[selected] === exchange) renderExchange();
    } catch (caught) {
      if (mine !== generation) return;
      exchange.failure = publicFailure(caught);
      if (exchanges[selected] === exchange) renderExchange();
      query!.value = message;
      query!.dispatchEvent(new Event('input'));
    } finally {
      if (mine === generation) {
        setThinking(false);
        resizeQuery();
        if (!mobile.matches) query!.focus({ preventScroll: true });
      }
    }
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    void submit(query.value);
  }, true);
  window.TwinAsk = { submit: message => { void submit(message); }, isThinking: () => thinking };
  document.addEventListener('click', event => {
    const target = event.target as Element | null;
    if (target?.closest('.enquiry-link')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const enquiry = target.closest<HTMLElement>('.enquiry-link');
      contactTopic = enquiry?.dataset.enquiryTopic || '';
      document.dispatchEvent(new Event('twin-contact-request'));
      if (window.TwinCore.getState().feature) window.TwinCore.navigate({ view: 'core' });
      const topicLabel = contactPanel.querySelector('.ask-contact-intro strong');
      if (topicLabel) topicLabel.textContent = contactTopic ? 'Enquiry topic: ' + contactTopic : 'Tell Construct what construction workflow you would like to explore.';
      if (contactPanel.hidden) toggleContact();
      else contactToggle.scrollIntoView({ block: 'start', behavior: 'auto' });
      contactPanel.tabIndex = -1;
      contactPanel.focus({ preventScroll: true });
      contactPanel.scrollIntoView({ block: 'start', behavior: 'auto' });
    }
  }, true);
}
