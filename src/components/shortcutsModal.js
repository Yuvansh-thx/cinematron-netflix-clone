// Keyboard Shortcuts Help Modal for Cinematron
import { sound } from '../utils/audio.js';

export function initShortcutsModal(dialogElem) {
  function render() {
    dialogElem.innerHTML = `
      <div class="shortcuts-modal-inner">
        <div class="shortcuts-modal-header">
          <div class="shortcuts-title-group">
            <h2 class="shortcuts-title">Cinematron Shortcuts</h2>
            <span class="shortcuts-sub">Keyboard controls for cinematic navigation & theatre playback</span>
          </div>
          <button class="modal-close-btn" id="shortcuts-close-btn" aria-label="Close shortcuts dialog">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="shortcuts-grid">
          <div class="shortcut-item">
            <kbd class="key-badge">Space</kbd> or <kbd class="key-badge">K</kbd>
            <span class="shortcut-desc">Play / Pause video</span>
          </div>

          <div class="shortcut-item">
            <kbd class="key-badge">F</kbd>
            <span class="shortcut-desc">Toggle Fullscreen mode</span>
          </div>

          <div class="shortcut-item">
            <kbd class="key-badge">M</kbd>
            <span class="shortcut-desc">Mute / Unmute audio</span>
          </div>

          <div class="shortcut-item">
            <kbd class="key-badge">←</kbd> / <kbd class="key-badge">J</kbd>
            <span class="shortcut-desc">Rewind 10 seconds</span>
          </div>

          <div class="shortcut-item">
            <kbd class="key-badge">→</kbd> / <kbd class="key-badge">L</kbd>
            <span class="shortcut-desc">Forward 10 seconds</span>
          </div>

          <div class="shortcut-item">
            <kbd class="key-badge">↑</kbd> / <kbd class="key-badge">↓</kbd>
            <span class="shortcut-desc">Volume Up / Down</span>
          </div>

          <div class="shortcut-item">
            <kbd class="key-badge">Esc</kbd>
            <span class="shortcut-desc">Exit Video Player / Close dialogs</span>
          </div>

          <div class="shortcut-item">
            <kbd class="key-badge">?</kbd>
            <span class="shortcut-desc">Open Keyboard Shortcuts guide</span>
          </div>
        </div>

        <div class="shortcuts-footer">
          <span>Tip: Hovering over any movie card reveals instant preview and action controls.</span>
        </div>
      </div>
    `;

    const closeBtn = dialogElem.querySelector('#shortcuts-close-btn');
    closeBtn.addEventListener('click', () => {
      sound.playPop();
      dialogElem.close();
    });
  }

  // Light dismiss
  const outside = (e, dialog) => {
    const r = dialog.getBoundingClientRect();
    return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
  };
  let pressedOutside = false;
  dialogElem.addEventListener('pointerdown', (e) => { pressedOutside = outside(e, dialogElem); });
  dialogElem.addEventListener('pointerup', (e) => {
    if (pressedOutside && outside(e, dialogElem)) {
      dialogElem.close();
    }
  });

  // Global keydown '?' listener
  window.addEventListener('keydown', (e) => {
    if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      e.preventDefault();
      dialogElem.open ? dialogElem.close() : open();
    }
  });

  function open() {
    render();
    dialogElem.showModal();
  }

  return { open };
}
