// Manage Profiles Modal Component for Cinematron
import { AVATAR_OPTIONS } from '../data/catalog.js';
import { storage } from '../utils/storage.js';
import { sound } from '../utils/audio.js';

export function initProfileModal(dialogElem) {
  let selectedProfile = null;
  let selectedAvatar = '';

  function render() {
    const profiles = storage.getAllProfiles();
    const current = storage.getCurrentProfile();
    selectedProfile = selectedProfile || current;
    selectedAvatar = selectedAvatar || selectedProfile.avatar;

    dialogElem.innerHTML = `
      <div class="profile-modal-inner">
        <div class="profile-modal-header">
          <h2 class="profile-modal-title">Manage Profiles</h2>
          <button class="modal-close-btn" id="profile-close-btn" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="profile-select-bar">
          <span class="profile-bar-label">Select Profile to Edit:</span>
          <div class="profile-chips">
            ${profiles.map(p => `
              <button class="profile-chip ${p.id === selectedProfile.id ? 'active' : ''}" data-id="${p.id}">
                <img src="${p.avatar}" alt="${p.name}" class="chip-avatar" />
                <span>${p.name}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <div class="profile-edit-body">
          <div class="avatar-selection-panel">
            <span class="edit-section-label">Choose Avatar</span>
            <div class="avatar-grid">
              ${AVATAR_OPTIONS.map(img => `
                <button class="avatar-choice-btn ${img === selectedAvatar ? 'selected' : ''}" data-avatar="${img}">
                  <img src="${img}" alt="Avatar option" />
                </button>
              `).join('')}
            </div>
          </div>

          <div class="profile-form-panel">
            <div class="form-group">
              <label for="profile-name-input" class="form-label">Profile Name</label>
              <input 
                type="text" 
                id="profile-name-input" 
                class="profile-input" 
                value="${selectedProfile.name}" 
                maxlength="20"
              />
            </div>

            <div class="form-group checkbox-group">
              <label class="custom-checkbox-label">
                <input 
                  type="checkbox" 
                  id="profile-kids-checkbox" 
                  ${selectedProfile.isKids ? 'checked' : ''} 
                />
                <span class="custom-checkbox-box"></span>
                <span class="checkbox-text">Kids Profile (Filters 18+ titles automatically)</span>
              </label>
            </div>

            <div class="profile-modal-actions">
              <button class="btn-primary-save" id="profile-save-btn">Save Changes</button>
              <button class="btn-secondary-cancel" id="profile-cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Hook listeners
    const closeBtn = dialogElem.querySelector('#profile-close-btn');
    const cancelBtn = dialogElem.querySelector('#profile-cancel-btn');
    const saveBtn = dialogElem.querySelector('#profile-save-btn');
    const nameInput = dialogElem.querySelector('#profile-name-input');
    const kidsCheckbox = dialogElem.querySelector('#profile-kids-checkbox');

    closeBtn.addEventListener('click', () => {
      sound.playPop();
      dialogElem.close();
    });

    cancelBtn.addEventListener('click', () => {
      sound.playPop();
      dialogElem.close();
    });

    // Profile switch in modal
    dialogElem.querySelectorAll('.profile-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const pid = chip.dataset.id;
        selectedProfile = profiles.find(p => p.id === pid);
        selectedAvatar = selectedProfile.avatar;
        sound.playPop();
        render();
      });
    });

    // Avatar pick
    dialogElem.querySelectorAll('.avatar-choice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedAvatar = btn.dataset.avatar;
        sound.playPop();
        dialogElem.querySelectorAll('.avatar-choice-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });

    // Save
    saveBtn.addEventListener('click', () => {
      const newName = nameInput.value.trim() || selectedProfile.name;
      const isKids = kidsCheckbox.checked;

      storage.updateProfile(selectedProfile.id, {
        name: newName,
        avatar: selectedAvatar,
        isKids: isKids
      });

      sound.playChime();
      dialogElem.close();

      window.dispatchEvent(new CustomEvent('cinematron:toast', {
        detail: { message: `Profile "${newName}" updated successfully!`, type: 'info' }
      }));
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

  return {
    open() {
      selectedProfile = null;
      selectedAvatar = '';
      render();
      dialogElem.showModal();
    }
  };
}
