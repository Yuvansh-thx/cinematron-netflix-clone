// Main Application Controller for Cinematron
import './style.css';
import { CATALOG, ROWS_CONFIG } from './data/catalog.js';
import { storage } from './utils/storage.js';
import { sound } from './utils/audio.js';
import { initNavbar } from './components/navbar.js';
import { initHero } from './components/hero.js';
import { createContentRow } from './components/row.js';
import { initModal } from './components/modal.js';
import { initPlayer } from './components/player.js';
import { initToast } from './components/toast.js';
import { initProfileModal } from './components/profileModal.js';
import { initShortcutsModal } from './components/shortcutsModal.js';

class CinematronApp {
  constructor() {
    this.currentRoute = 'home';
    this.searchQuery = '';
    this.searchFilter = 'all';

    // DOM References
    this.navbarContainer = document.getElementById('navbar-container');
    this.heroContainer = document.getElementById('hero-container');
    this.rowsContainer = document.getElementById('rows-container');
    this.searchContainer = document.getElementById('search-container');
    this.searchGrid = document.getElementById('search-grid');
    this.searchHeading = document.getElementById('search-heading');
    this.searchFilterPills = document.getElementById('search-filter-pills');
    this.mylistContainer = document.getElementById('mylist-container');
    this.mylistGrid = document.getElementById('mylist-grid');
    this.titleModal = document.getElementById('title-modal');
    this.profileModal = document.getElementById('profile-modal');
    this.shortcutsModal = document.getElementById('shortcuts-modal');
    this.theatrePlayerContainer = document.getElementById('theatre-player-container');
    this.toastContainer = document.getElementById('toast-container');

    // Component instances
    this.modalController = null;
    this.playerController = null;
    this.profileModalController = null;
    this.shortcutsModalController = null;
  }

  init() {
    // 1. Initialize Toasts
    initToast(this.toastContainer);

    // 2. Initialize Player Controller
    this.playerController = initPlayer(this.theatrePlayerContainer);

    // 3. Initialize Modal Controllers
    this.modalController = initModal(this.titleModal, (movie) => {
      this.playerController.play(movie);
    });

    if (this.profileModal) {
      this.profileModalController = initProfileModal(this.profileModal);
    }

    if (this.shortcutsModal) {
      this.shortcutsModalController = initShortcutsModal(this.shortcutsModal);
    }

    // 4. Initialize Navbar
    initNavbar(
      this.navbarContainer,
      (route) => this.handleNavigate(route),
      (query) => this.handleSearch(query)
    );

    // 5. Initialize Hero Billboard
    initHero(
      this.heroContainer,
      (movie) => this.playerController.play(movie),
      (movie) => this.modalController.open(movie)
    );

    // 6. Setup Search Filter Pills
    this.setupSearchFilters();

    // 7. Render Initial Route
    this.renderRoute('home');

    // 8. Listen to profile switch and list updates
    window.addEventListener('cinematron:profile-changed', () => {
      this.renderRoute(this.currentRoute);
    });

    window.addEventListener('cinematron:list-updated', () => {
      if (this.currentRoute === 'mylist') {
        this.renderMyListView();
      }
    });

    // 9. Manage Profiles Modal Event
    window.addEventListener('cinematron:open-manage-profiles', () => {
      this.profileModalController?.open();
    });

    // 10. Keyboard Shortcuts Modal Event
    window.addEventListener('cinematron:open-shortcuts', () => {
      this.shortcutsModalController?.open();
    });

    // 11. Surprise Me / Play Something Event
    window.addEventListener('cinematron:surprise-me', () => {
      const profile = storage.getCurrentProfile();
      let candidates = CATALOG;
      if (profile.isKids) {
        candidates = CATALOG.filter(m => m.rating !== '18+');
      }
      const randomMovie = candidates[Math.floor(Math.random() * candidates.length)];
      if (randomMovie) {
        window.dispatchEvent(new CustomEvent('cinematron:toast', {
          detail: { message: `Surprise Me: Starting "${randomMovie.title}"`, type: 'info' }
        }));
        this.playerController.play(randomMovie);
      }
    });

    console.log('Cinematron Streaming Platform initialized.');
  }

  handleNavigate(route) {
    this.currentRoute = route;
    this.searchQuery = '';
    this.renderRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  handleSearch(query) {
    this.searchQuery = query;
    if (query.length > 0) {
      this.heroContainer.style.display = 'none';
      this.rowsContainer.style.display = 'none';
      this.mylistContainer.style.display = 'none';
      this.searchContainer.style.display = 'block';
      this.renderSearchResults();
    } else {
      this.renderRoute(this.currentRoute);
    }
  }

  setupSearchFilters() {
    this.searchFilterPills.querySelectorAll('.pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playPop();
        this.searchFilterPills.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.searchFilter = btn.dataset.filter;
        this.renderSearchResults();
      });
    });
  }

  renderSearchResults() {
    const q = this.searchQuery.toLowerCase();
    this.searchHeading.textContent = `Search results for "${this.searchQuery}"`;

    let filtered = CATALOG.filter(m => {
      const matchText = (
        m.title.toLowerCase().includes(q) ||
        m.genre.some(g => g.toLowerCase().includes(q)) ||
        (m.cast && m.cast.some(c => c.toLowerCase().includes(q))) ||
        (m.director && m.director.toLowerCase().includes(q)) ||
        m.shortDescription.toLowerCase().includes(q)
      );

      if (!matchText) return false;

      if (this.searchFilter === 'movie') return m.type === 'movie';
      if (this.searchFilter === 'tv') return m.type === 'tv';
      if (this.searchFilter === 'original') return m.isOriginal;
      return true;
    });

    if (filtered.length === 0) {
      this.searchGrid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <svg class="empty-state-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <h3 class="empty-state-title">No matches found for "${this.searchQuery}"</h3>
          <p class="empty-state-desc">Try different keywords, genres like "Sci-Fi", "Action", or actor names like "Keanu Reeves".</p>
        </div>
      `;
      return;
    }

    this.searchGrid.innerHTML = filtered.map(item => this.renderGridCard(item)).join('');
    this.attachGridListeners(this.searchGrid);
  }

  renderRoute(route) {
    this.searchContainer.style.display = 'none';

    if (route === 'mylist') {
      this.heroContainer.style.display = 'none';
      this.rowsContainer.style.display = 'none';
      this.mylistContainer.style.display = 'block';
      this.renderMyListView();
      return;
    }

    this.mylistContainer.style.display = 'none';
    this.heroContainer.style.display = 'block';
    this.rowsContainer.style.display = 'flex';

    // Filter rows based on route
    let activeRows = [];
    const profile = storage.getCurrentProfile();

    if (route === 'home') {
      if (profile.isKids) {
        activeRows = [
          ROWS_CONFIG.find(r => r.id === 'kids-favorites'),
          {
            id: 'kids-adventures',
            title: 'Animated Adventures & Magic',
            type: 'standard',
            itemIds: ['c-21', 'c-22', 'c-24', 'c-15']
          },
          {
            id: 'kids-nature',
            title: 'Creatures, Oceans & Wonder',
            type: 'standard',
            itemIds: ['c-23', 'c-17', 'c-10', 'c-14']
          },
          {
            id: 'kids-trending',
            title: 'Top Kids Picks Today',
            type: 'top10',
            itemIds: ['c-21', 'c-22', 'c-23', 'c-24', 'c-14', 'c-17', 'c-04', 'c-05']
          }
        ];
      } else {
        // Update continue watching title for active profile
        const continueConfig = { 
          ...ROWS_CONFIG.find(r => r.id === 'continue-watching'),
          title: `Continue Watching for ${profile.name}`
        };
        activeRows = [
          continueConfig,
          ROWS_CONFIG.find(r => r.id === 'trending-now'),
          ROWS_CONFIG.find(r => r.id === 'top-10'),
          ROWS_CONFIG.find(r => r.id === 'cinematron-originals'),
          ROWS_CONFIG.find(r => r.id === 'action-blockbusters'),
          ROWS_CONFIG.find(r => r.id === 'mind-bending-thrillers'),
          ROWS_CONFIG.find(r => r.id === 'binge-series')
        ];
      }
    } else if (route === 'tv') {
      activeRows = [
        {
          id: 'tv-binge',
          title: 'Critically Acclaimed TV Series',
          type: 'standard',
          itemIds: ['c-02', 'c-03', 'c-07', 'c-09', 'c-11', 'c-14', 'c-15', 'c-16', 'c-18']
        },
        {
          id: 'tv-originals',
          title: 'Cinematron Original Series',
          type: 'originals',
          itemIds: ['c-02', 'c-03', 'c-07', 'c-09', 'c-11', 'c-14', 'c-15', 'c-18']
        },
        {
          id: 'tv-trending',
          title: 'Top TV Series Today',
          type: 'top10',
          itemIds: ['c-02', 'c-03', 'c-07', 'c-09', 'c-11', 'c-14', 'c-15', 'c-16', 'c-18', 'c-01']
        }
      ];
    } else if (route === 'movies') {
      activeRows = [
        {
          id: 'movies-trending',
          title: 'Blockbuster Feature Films',
          type: 'standard',
          itemIds: ['c-01', 'c-04', 'c-05', 'c-06', 'c-08', 'c-10', 'c-12', 'c-13', 'c-17', 'c-19', 'c-20']
        },
        {
          id: 'movies-top10',
          title: 'Top 10 Movies Today',
          type: 'top10',
          itemIds: ['c-01', 'c-04', 'c-05', 'c-06', 'c-08', 'c-10', 'c-12', 'c-13', 'c-17', 'c-20']
        },
        {
          id: 'movies-scifi',
          title: 'Action & Sci-Fi Epics',
          type: 'standard',
          itemIds: ['c-01', 'c-04', 'c-06', 'c-08', 'c-13', 'c-17', 'c-20']
        }
      ];
    } else if (route === 'popular') {
      activeRows = [
        ROWS_CONFIG.find(r => r.id === 'top-10'),
        ROWS_CONFIG.find(r => r.id === 'trending-now'),
        ROWS_CONFIG.find(r => r.id === 'cinematron-originals')
      ];
    } else if (route === 'originals') {
      activeRows = [
        ROWS_CONFIG.find(r => r.id === 'cinematron-originals'),
        {
          id: 'orig-featured',
          title: 'Only On Cinematron',
          type: 'standard',
          itemIds: ['c-01', 'c-02', 'c-03', 'c-05', 'c-07', 'c-08', 'c-11', 'c-12', 'c-15', 'c-20']
        }
      ];
    }

    // Render rows
    this.rowsContainer.innerHTML = '';
    activeRows.forEach(cfg => {
      if (!cfg) return;
      const rowNode = createContentRow(
        cfg,
        (movie) => this.playerController.play(movie),
        (movie) => this.modalController.open(movie)
      );
      if (rowNode) {
        this.rowsContainer.appendChild(rowNode);
      }
    });
  }

  renderMyListView() {
    const listIds = storage.getMyList();
    const items = listIds.map(id => CATALOG.find(m => m.id === id)).filter(Boolean);

    if (items.length === 0) {
      this.mylistGrid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <svg class="empty-state-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <h3 class="empty-state-title">Your list is currently empty</h3>
          <p class="empty-state-desc">Explore movies and TV shows to add them to your personalized watchlist.</p>
          <button class="empty-browse-btn" id="empty-browse-btn">Browse Popular Titles</button>
        </div>
      `;
      const btn = this.mylistGrid.querySelector('#empty-browse-btn');
      if (btn) {
        btn.addEventListener('click', () => {
          sound.playPop();
          this.handleNavigate('home');
        });
      }
      return;
    }

    this.mylistGrid.innerHTML = items.map(item => this.renderGridCard(item)).join('');
    this.attachGridListeners(this.mylistGrid);
  }

  renderGridCard(item) {
    const inList = storage.isInMyList(item.id);
    return `
      <div class="movie-card standard-card" data-id="${item.id}">
        <div class="card-media-wrapper">
          <img src="${item.backdropUrl}" alt="${item.title}" class="card-img" loading="lazy" />
          <div class="card-quick-preview">
            <div class="quick-action-row">
              <div class="action-buttons-left">
                <button class="card-action-btn play-action-btn" data-action="play" data-id="${item.id}" aria-label="Play ${item.title}">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </button>
                <button class="card-action-btn list-action-btn ${inList ? 'in-list' : ''}" data-action="list" data-id="${item.id}" aria-label="Toggle My List">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    ${inList ? '<polyline points="20 6 9 17 4 12"></polyline>' : '<line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>'}
                  </svg>
                </button>
              </div>
              <button class="card-action-btn details-action-btn" data-action="details" data-id="${item.id}">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>
            <div class="card-meta-row">
              <span class="card-match">${item.match}</span>
              <span class="card-rating">${item.rating}</span>
              <span class="card-duration">${item.duration || item.seasons}</span>
            </div>
            <div class="card-genre-row">
              ${item.genre.join(' • ')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  attachGridListeners(container) {
    container.addEventListener('click', (e) => {
      const actionBtn = e.target.closest('[data-action]');
      const movieCard = e.target.closest('.movie-card');

      if (actionBtn) {
        e.stopPropagation();
        const action = actionBtn.dataset.action;
        const mid = actionBtn.dataset.id;
        const movie = CATALOG.find(m => m.id === mid);
        if (!movie) return;

        if (action === 'play') {
          sound.playTaDum();
          this.playerController.play(movie);
        } else if (action === 'details') {
          sound.playPop();
          this.modalController.open(movie);
        } else if (action === 'list') {
          sound.playChime();
          const added = storage.toggleMyList(mid);
          window.dispatchEvent(new CustomEvent('cinematron:toast', {
            detail: { message: added ? `Added "${movie.title}" to My List` : `Removed "${movie.title}" from My List`, type: 'info' }
          }));
        }
        return;
      }

      if (movieCard) {
        const mid = movieCard.dataset.id;
        const movie = CATALOG.find(m => m.id === mid);
        if (movie) {
          sound.playPop();
          this.modalController.open(movie);
        }
      }
    });
  }
}

// Instantiate and start app on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
  const app = new CinematronApp();
  app.init();
});
