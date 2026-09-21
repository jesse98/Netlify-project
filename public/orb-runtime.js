'use strict';
/* One renderer for the hero and compact conversation orb. */
(() => {
  let orbFrame = null;
  let miniCanvas = null;
  let miniContext = null;
  const orbMetrics = { frames: 0, mainFrames: 0, miniFrames: 0 };

  function visibleMini() {
    const found = $('mini-orb');
    if (found !== miniCanvas) {
      miniCanvas = found;
      miniContext = found?.getContext('2d', { alpha: true }) || null;
    }
    if (!miniCanvas || !miniContext || !miniCanvas.isConnected) return null;
    const rect = miniCanvas.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < innerHeight ? rect : null;
  }

  function updateFrame(now, advance) {
    const frozen = paused || reduced.matches;
    const delta = Math.min(32, Math.max(0, now - frameTime));
    frameTime = now;
    if (advance && !frozen) {
      clock += delta;
      phase += delta * .00018;
    }
    const signal = window.TwinExperience?.signal || {};
    const mode = frozen ? 'idle' : window.TwinAsk?.isThinking() ? 'thinking'
      : signal.mode === 'opening' ? 'idle' : signal.mode === 'playback' ? 'speaking' : signal.mode || 'idle';
    const energy = frozen ? 0 : Math.max(0, Math.min(1, Number(signal.level) || 0));
    scale += ((hover && !frozen ? 1.055 : 1) - scale) * .1;
    orbFrame = {
      time: clock,
      rotation: phase,
      reduced: frozen,
      energy,
      settings: {
        mode, scale, fit: innerWidth > 720 ? .852 : 1,
        hover: hover && !frozen, pointer: { ...pointer }
      }
    };
  }

  function paintMain() {
    if (!ctx || !orbFrame || width <= 0 || height <= 0) return;
    const { time, rotation, reduced, energy, settings } = orbFrame;
    window.TwinOrbRenderer.paint(ctx, width, height, dpr, time, rotation, reduced, energy, 0, false, settings);
    orbMetrics.mainFrames++;
  }

  draw = function(now) {
    raf = 0;
    if (!ctx || document.hidden) return;
    const miniRect = visibleMini();
    if (!visible && !miniRect) return;
    updateFrame(now, true);
    if (visible) paintMain();
    if (miniRect) {
      const ratio = Math.min(Math.max(devicePixelRatio || 1, 2), 3);
      const w = Math.round(miniRect.width * ratio), h = Math.round(miniRect.height * ratio);
      if (miniCanvas.width !== w || miniCanvas.height !== h) {
        miniCanvas.width = w;
        miniCanvas.height = h;
      }
      const { time, rotation, reduced, energy, settings } = orbFrame;
      window.TwinOrbRenderer.paint(miniContext, miniRect.width, miniRect.height, ratio, time, rotation, reduced, energy, 0, true, settings);
      orbMetrics.miniFrames++;
    }
    orbMetrics.frames++;
    if (!paused && !reduced.matches) raf = requestAnimationFrame(draw);
  };

  restart = function() {
    cancelAnimationFrame(raf);
    raf = 0;
    frameTime = performance.now();
    // Resizing a canvas clears its pixels. Paint immediately, including a static
    // frame when paused, reduced-motion, hidden, or awaiting the first RAF.
    updateFrame(frameTime, false);
    paintMain();
    if (!document.hidden && (visible || visibleMini()) && !paused && !reduced.matches) {
      raf = requestAnimationFrame(draw);
    }
  };
  window.TwinCore.orbRevision = window.TwinOrbRenderer.revision;
  window.TwinCore.orbMetrics = orbMetrics;
  restart();
})();
