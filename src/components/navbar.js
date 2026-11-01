// Navbar Component for Cinematron
import { PROFILES } from '../data/catalog.js';
import { storage } from '../utils/storage.js';
import { sound } from '../utils/audio.js';

export function initNavbar(container, onNavigate, onSearch) {
  const currentProfile = storage.getCurrentProfile();

  container.innerHTML = `
    <nav class="netflix-nav" id="netflix-nav">
      <div class="nav-left">
        <a href="#home" class="brand-logo" id="brand-logo" aria-label="Cinematron Home">
          <span class="brand-c-mark" aria-hidden="true">C</span>
          <span class="brand-logo-text">CINEMATRON</span>
        </a>
        <ul class="nav-links" id="nav-links">
          <li><button class="nav-link active" data-route="home">Home</button></li>
          <li><button class="nav-link" data-route="tv">TV Shows</button></li>
          <li><button class="nav-link" data-route="movies">Movies</button></li>
          <li><button class="nav-link" data-route="popular">New & Popular</button></li>
          <li><button class="nav-link" data-route="mylist">My List</button></li>
          <li><button class="nav-link" data-route="originals">Originals</button></li>
        </ul>
      </div>

      <div class="nav-right">
        <!-- Search Box -->
        <div class="search-box" id="search-box">
          <button class="search-toggle-btn" id="search-toggle-btn" aria-label="Search" title="Search titles, actors, genres">
            <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
          <div class="search-input-wrapper" id="search-input-wrapper">
            <input 
              type="text" 
              class="search-input" 
              id="search-input" 
              placeholder="Titles, people, genres..." 
              autocomplete="off" 
            />
            <button class="search-clear-btn" id="search-clear-btn" aria-label="Clear search" style="display: none;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <!-- Surprise Me / Play Something -->
        <button class="nav-action-btn surprise-btn" id="surprise-btn" aria-label="Surprise Me" title="Play Something (Surprise Me)">
          <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m16 3 3 3-3 3M4 14v-2a4 4 0 0 1 4-4h11M20 10l-3-3 3-3M20 14v2a4 4 0 0 1-4 4H8M4 10l3 3-3 3"></path>
          </svg>
        </button>

        <!-- Audio FX Toggle -->
        <button class="nav-action-btn sound-toggle-btn" id="global-sound-btn" aria-label="Toggle Sound Effects" title="Play Intro Ta-Dum Chime">
          <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          </svg>
        </button>

        <!-- Keyboard Shortcuts Help -->
        <button class="nav-action-btn help-btn" id="shortcuts-help-btn" aria-label="Keyboard Shortcuts" title="Keyboard Shortcuts (?)">
          <svg class="nav-icon" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </button>

        <!-- Notification Bell -->
        <div class="notifications-wrapper" id="notifications-wrapper">
          <button class="nav-action-btn notif-btn" id="notif-btn" aria-label="Notifications">
            <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span class="notif-badge">3</span>
          </button>
          <div class="notifications-menu" id="notifications-menu">
            <div class="notif-header">
              <span>Notifications</span>
              <button class="mark-read-btn" id="mark-read-btn">Mark all read</button>
            </div>
            <div class="notif-list">
              <div class="notif-item unread">
                <img src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=100&q=80" alt="Cyberpunk" class="notif-thumb" />
                <div class="notif-body">
                  <div class="notif-title">New Season Alert</div>
                  <div class="notif-desc">Cyberpunk: Neo Syndicate Season 3 is now streaming.</div>
                  <div class="notif-time">2 hours ago</div>
                </div>
              </div>
              <div class="notif-item unread">
                <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=100&q=80" alt="Apex Horizon" class="notif-thumb" />
                <div class="notif-body">
                  <div class="notif-title">Top 10 Today #1</div>
                  <div class="notif-desc">Apex Horizon: Void Odyssey surged to #1 in India.</div>
                  <div class="notif-time">1 day ago</div>
                </div>
              </div>
              <div class="notif-item">
                <img src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=100&q=80" alt="Redline" class="notif-thumb" />
                <div class="notif-body">
                  <div class="notif-title">Cinematron Premiere</div>
                  <div class="notif-desc">Keanu Reeves in Redline Protocol is now available in 4K HDR.</div>
                  <div class="notif-time">3 days ago</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Profile Menu -->
        <div class="profile-wrapper" id="profile-wrapper">
          <button class="profile-btn" id="profile-btn" aria-label="User Profile" aria-expanded="false">
            <img src="${currentProfile.avatar}" alt="${currentProfile.name}" class="profile-avatar" id="nav-avatar" />
            <svg class="caret-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          <div class="profile-dropdown" id="profile-dropdown">
            <div class="profile-list" id="profile-list">
              ${storage.getAllProfiles().map(p => `
                <button class="profile-option ${p.id === currentProfile.id ? 'active' : ''}" data-profile-id="${p.id}">
                  <img src="${p.avatar}" alt="${p.name}" class="profile-thumb" />
                  <span class="profile-name">${p.name}</span>
                  ${p.isKids ? '<span class="kids-pill">KIDS</span>' : ''}
                </button>
              `).join('')}
            </div>
            <div class="profile-divider"></div>
            <button class="dropdown-item" id="manage-profiles-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Manage Profiles
            </button>
            <button class="dropdown-item" id="account-settings-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
              Account & Playback
            </button>
            <div class="profile-divider"></div>
            <button class="dropdown-item sign-out" id="sign-out-btn">
              Sign out of Cinematron
            </button>
          </div>
        </div>
      </div>
    </nav>
  `;

  // Attach event listeners
  const nav = container.querySelector('#netflix-nav');
  const searchBox = container.querySelector('#search-box');
  const searchToggleBtn = container.querySelector('#search-toggle-btn');
  const searchInput = container.querySelector('#search-input');
  const searchClearBtn = container.querySelector('#search-clear-btn');
  const notifBtn = container.querySelector('#notif-btn');
  const notifMenu = container.querySelector('#notifications-menu');
  const profileBtn = container.querySelector('#profile-btn');
  const profileDropdown = container.querySelector('#profile-dropdown');
  const soundBtn = container.querySelector('#global-sound-btn');
  const brandLogo = container.querySelector('#brand-logo');

  // Sticky scroll transparent -> solid obsidian background
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });

  // Logo navigation (smooth & tranquil)
  brandLogo.addEventListener('click', (e) => {
    e.preventDefault();
    onNavigate('home');
    updateActiveNav('home');
  });

  // Tranquil Sound / Mute Toggle Button
  function updateSoundBtnIcon() {
    if (sound.isMuted) {
      soundBtn.innerHTML = `
        <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <line x1="23" y1="9" x2="17" y2="15"></line>
          <line x1="17" y1="9" x2="23" y2="15"></line>
        </svg>
      `;
      soundBtn.title = "Audio Muted (Silent Mode) — Click to enable Tranquil Zen Sounds";
    } else {
      soundBtn.innerHTML = `
        <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        </svg>
      `;
      soundBtn.title = "Tranquil Audio Active — Click to Silence / Mute";
    }
  }

  updateSoundBtnIcon();

  soundBtn.addEventListener('click', () => {
    const isMuted = sound.toggleMute();
    updateSoundBtnIcon();
    if (!isMuted) {
      sound.playTaDum();
    }
    window.dispatchEvent(new CustomEvent('cinematron:toast', {
      detail: { 
        message: isMuted ? 'Silent Mode — All sound effects removed' : 'Tranquil Zen Audio Enabled (432Hz Serene Harmonics)', 
        type: 'info' 
      }
    }));
  });

  // Navigation Links
  const navLinks = container.querySelectorAll('.nav-link');
  function updateActiveNav(route) {
    navLinks.forEach(btn => {
      if (btn.dataset.route === route) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      sound.playPop();
      const route = link.dataset.route;
      updateActiveNav(route);
      onNavigate(route);
    });
  });

  // Search Toggle
  searchToggleBtn.addEventListener('click', () => {
    sound.playPop();
    const isActive = searchBox.classList.toggle('active');
    if (isActive) {
      searchInput.focus();
    } else {
      searchInput.value = '';
      searchClearBtn.style.display = 'none';
      onSearch('');
    }
  });

  searchInput.addEventListener('input', (e) => {
    const val = e.target.value;
    searchClearBtn.style.display = val.length > 0 ? 'flex' : 'none';
    onSearch(val.trim());
  });

  searchClearBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchClearBtn.style.display = 'none';
    searchInput.focus();
    onSearch('');
  });

  // Notifications Toggle
  notifBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    sound.playPop();
    const isOpen = notifMenu.classList.toggle('open');
    profileDropdown.classList.remove('open');
  });

  const markReadBtn = container.querySelector('#mark-read-btn');
  markReadBtn.addEventListener('click', () => {
    container.querySelectorAll('.notif-item').forEach(el => el.classList.remove('unread'));
    const badge = container.querySelector('.notif-badge');
    if (badge) badge.style.display = 'none';
  });

  // Profile Toggle
  profileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    sound.playPop();
    const isOpen = profileDropdown.classList.toggle('open');
    notifMenu.classList.remove('open');
    profileBtn.setAttribute('aria-expanded', isOpen);
  });

  // Profile switching
  const profileOptions = container.querySelectorAll('.profile-option');
  profileOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      const pid = opt.dataset.profileId;
      storage.setCurrentProfile(pid);
      sound.playTaDum();
      profileDropdown.classList.remove('open');
      const selected = PROFILES.find(p => p.id === pid);
      if (selected) {
        container.querySelector('#nav-avatar').src = selected.avatar;
        profileOptions.forEach(o => o.classList.toggle('active', o.dataset.profileId === pid));
        window.dispatchEvent(new CustomEvent('cinematron:toast', {
          detail: { message: `Switched profile to ${selected.name}`, type: 'info' }
        }));
      }
    });
  });

  // Close menus on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#notifications-wrapper')) {
      notifMenu.classList.remove('open');
    }
    if (!e.target.closest('#profile-wrapper')) {
      profileDropdown.classList.remove('open');
      profileBtn.setAttribute('aria-expanded', 'false');
    }
  });

  // Surprise Me / Play Something
  const surpriseBtn = container.querySelector('#surprise-btn');
  if (surpriseBtn) {
    surpriseBtn.addEventListener('click', () => {
      sound.playTaDum();
      window.dispatchEvent(new CustomEvent('cinematron:surprise-me'));
    });
  }

  // Keyboard Shortcuts Modal Trigger
  const helpBtn = container.querySelector('#shortcuts-help-btn');
  if (helpBtn) {
    helpBtn.addEventListener('click', () => {
      sound.playPop();
      window.dispatchEvent(new CustomEvent('cinematron:open-shortcuts'));
    });
  }

  // Manage Profiles Modal Trigger
  const manageProfilesBtn = container.querySelector('#manage-profiles-btn');
  if (manageProfilesBtn) {
    manageProfilesBtn.addEventListener('click', () => {
      sound.playPop();
      profileDropdown.classList.remove('open');
      window.dispatchEvent(new CustomEvent('cinematron:open-manage-profiles'));
    });
  }

  // Sign out dummy feedback
  container.querySelector('#sign-out-btn').addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('cinematron:toast', {
      detail: { message: 'Demo Mode: Signed in as guest profile.', type: 'info' }
    }));
    profileDropdown.classList.remove('open');
  });
}
