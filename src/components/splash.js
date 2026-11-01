// Cinematic Intro Splash Animation with Netflix "Ta-Dum" sound
import { sound } from '../utils/audio.js';

export function initSplash(container) {
  const hasSeenSplash = sessionStorage.getItem('cinematron_seen_splash');
  if (hasSeenSplash) return;

  function showSplash() {
    const splash = document.createElement('div');
    splash.className = 'cinematron-splash';
    splash.id = 'cinematron-splash';
    splash.innerHTML = `
      <div class="splash-inner">
        <div class="splash-ribbon-container">
          <div class="splash-ribbon ribbon-1"></div>
          <div class="splash-ribbon ribbon-2"></div>
          <div class="splash-ribbon ribbon-3"></div>
          <div class="splash-c-logo">C</div>
        </div>
        <div class="splash-brand-text">CINEMATRON</div>
        <div class="splash-audio-hint">Click anywhere to start with sound</div>
      </div>
    `;

    container.appendChild(splash);

    function triggerDismiss() {
      sound.playTaDum();
      splash.classList.add('fade-out');
      sessionStorage.setItem('cinematron_seen_splash', 'true');
      setTimeout(() => {
        splash.remove();
      }, 900);
    }

    splash.addEventListener('click', triggerDismiss);

    // Auto dismiss after 2.5s if user hasn't clicked
    setTimeout(() => {
      if (document.body.contains(splash)) {
        triggerDismiss();
      }
    }, 2800);
  }

  showSplash();
}
