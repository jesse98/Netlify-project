type NavigationAction = 'capabilities' | 'ask' | 'contact' | 'privacy';

export function mountHeaderNavigation(actions: Record<NavigationAction, () => void>) {
  const trigger = document.getElementById('navigation-toggle') as HTMLButtonElement | null;
  const menu = document.getElementById('navigation-menu') as HTMLDialogElement | null;
  if (!trigger || !menu) return;
  const mobile = matchMedia('(max-width: 720px)');
  const motion = document.getElementById('motion') as HTMLButtonElement | null;
  const motionToggle = document.getElementById('navigation-motion') as HTMLButtonElement | null;
  const syncMotion = () => {
    const paused = document.body.classList.contains('motion-off');
    if (!motionToggle) return;
    motionToggle.textContent = paused ? 'Resume animation' : 'Pause animation';
    motionToggle.setAttribute('aria-pressed', String(paused));
  };
  motionToggle?.addEventListener('click', () => {
    motion?.click();
    syncMotion();
  });
  motion?.addEventListener('click', syncMotion);

  const closeMenu = () => {
    if (menu.open) menu.close();
    trigger.setAttribute('aria-expanded', 'false');
  };

  trigger.addEventListener('click', () => {
    if (!mobile.matches || menu.open) return;
    syncMotion();
    trigger.focus({ preventScroll: true });
    menu.showModal();
    trigger.setAttribute('aria-expanded', 'true');
  });
  menu.addEventListener('close', () => trigger.setAttribute('aria-expanded', 'false'));
  document.getElementById('navigation-close')?.addEventListener('click', closeMenu);
  menu.addEventListener('click', event => {
    if (event.target !== menu) return;
    const bounds = menu.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom) closeMenu();
  });
  mobile.addEventListener('change', () => {
    if (!mobile.matches && menu.open) {
      closeMenu();
      document.querySelector<HTMLButtonElement>('.header-navigation button')?.focus();
    }
  });
  document.querySelectorAll<HTMLButtonElement>('[data-core-navigation]').forEach(control => {
    control.addEventListener('click', () => {
      const action = control.dataset.coreNavigation as NavigationAction;
      if (!Object.prototype.hasOwnProperty.call(actions, action)) return;
      closeMenu();
      actions[action]();
    });
  });
}
