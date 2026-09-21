'use strict';
/* Display branding only. Technical identifiers and the orb renderer stay intact. */
(() => {
  const originalRender = render;
  const description = 'AI systems for construction businesses that connect existing software, automate repetitive work and turn project information into action.';
  function applyBrand() {
    document.title = 'Construction Intelligence | Construct Systems';
    const current = window.TwinCore.getState();
    const hero = !current.category || matchMedia('(max-width:720px)').matches;
    const titleRegion = document.querySelector('.title');
    titleRegion.classList.toggle('jurosai-hero', hero);
    if (hero) {
      $('title').innerHTML = 'Construction <span>Intelligence</span>';
      $('subtitle').textContent = description;
    }
    titleRegion.setAttribute('aria-label', hero ? 'Construction Intelligence' : $('title').textContent);
    $('home').innerHTML = '<span class="twin-wordmark-main">Construct<span class="brand-dot">.</span></span><span class="twin-wordmark-subtitle">SYSTEMS</span>';
    $('home').setAttribute('aria-label', 'Construct Systems home');
    $('hero-hit').setAttribute('aria-label', 'Explore capabilities');
    $('explore').innerHTML = 'Explore capabilities <span aria-hidden="true">↗</span>';
    $('voice-title').textContent = 'Speak to Construct';
    $('browse-title').textContent = 'Explore capabilities';
  }
  let entrance = null;
  let entranceFrame = 0;
  let wasChat = document.body.classList.contains('chat-focused');
  function revealOrb() {
    cancelAnimationFrame(entranceFrame);
    entrance?.cancel();
    const orbCanvas = $('canvas');
    if (reduced.matches || paused || document.body.classList.contains('chat-focused')) return;
    // Keep the orb at its final layout position. Only its canvas materialises.
    entrance = orbCanvas.animate([
      { opacity: 0, scale: '.88' },
      { opacity: 1, scale: '1' }
    ], { duration: 950, easing: 'cubic-bezier(.2,.65,.25,1)', fill: 'backwards' });
    entrance.pause();
    entranceFrame = requestAnimationFrame(() => {
      resize();
      entrance?.play();
    });
  }
  render = function(previous) {
    originalRender(previous);
    applyBrand();
    const current = window.TwinCore.getState();
    if (previous && !current.category &&
        (previous.category || previous.view !== current.view)) revealOrb();
  };
  document.addEventListener('twin-home-return', revealOrb);
  new MutationObserver(() => {
    const chat = document.body.classList.contains('chat-focused');
    if (wasChat && !chat) revealOrb();
    if (chat || paused || reduced.matches) {
      cancelAnimationFrame(entranceFrame);
      entrance?.cancel();
    }
    wasChat = chat;
  }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  reduced.addEventListener('change', () => {
    if (reduced.matches) { cancelAnimationFrame(entranceFrame); entrance?.cancel(); }
  });
  window.TwinBrand = { accent: '#167CB4', revision: 'construct-white-label-1' };
  applyBrand();
  revealOrb();
})();
