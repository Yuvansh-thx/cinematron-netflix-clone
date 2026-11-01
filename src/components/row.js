// Row and Carousel Component for Cinematron
import { CATALOG } from '../data/catalog.js';
import { storage } from '../utils/storage.js';
import { sound } from '../utils/audio.js';

export function createContentRow(config, onPlay, onOpenModal) {
  const rowElem = document.createElement('section');
  rowElem.className = `content-row row-type-${config.type}`;
  rowElem.id = `row-${config.id}`;
  rowElem.setAttribute('aria-label', config.title);

  // Filter items in catalog according to config
  const items = config.itemIds
    .map(id => CATALOG.find(m => m.id === id))
    .filter(Boolean);

  if (items.length === 0) return null;

  rowElem.innerHTML = `
    <div class="row-header">
      <h2 class="row-title">
        <span class="row-title-text">${config.title}</span>
        <span class="row-explore-arrow">
          <span>Explore All</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </span>
      </h2>
      <div class="row-indicators" id="indicators-${config.id}"></div>
    </div>

    <div class="row-carousel-container">
      <!-- Left Navigation Arrow -->
      <button class="carousel-arrow left-arrow" id="arrow-left-${config.id}" aria-label="Previous items" style="display: none;">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <!-- Scrollable Track -->
      <div class="carousel-track" id="track-${config.id}">
        ${items.map((item, index) => renderCard(item, config, index)).join('')}
      </div>

      <!-- Right Navigation Arrow -->
      <button class="carousel-arrow right-arrow" id="arrow-right-${config.id}" aria-label="Next items">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>
  `;

  // Attach carousel scroll & card interactions
  attachRowListeners(rowElem, config, onPlay, onOpenModal);

  return rowElem;
}

function renderCard(item, rowConfig, index) {
  const inList = storage.isInMyList(item.id);
  const likes = storage.getLikes();
  const currentLike = likes[item.id] || null;
  const isContinue = rowConfig.type === 'continue';
  const isTop10 = rowConfig.type === 'top10';
  const isOriginals = rowConfig.type === 'originals';

  // Continue watching progress
  const progress = isContinue && rowConfig.progressMap && rowConfig.progressMap[item.id]
    ? rowConfig.progressMap[item.id]
    : { percent: 45, current: '45m', total: '1h 30m' };

  if (isTop10) {
    const rank = index + 1;
    return `
      <div class="movie-card top10-card" data-id="${item.id}">
        <div class="top10-rank-svg-container">
          <span class="top10-number top10-num-${rank}">${rank}</span>
        </div>
        <div class="card-media-wrapper">
          <img src="${item.posterUrl}" alt="${item.title}" class="card-img" loading="lazy" />
          ${item.videoUrl ? `
            <video class="card-hover-video" muted loop playsinline preload="none">
              <source src="${item.videoUrl}" type="video/mp4" />
            </video>
          ` : ''}
          <div class="card-quick-preview">
            ${renderQuickPreview(item, inList, currentLike)}
          </div>
        </div>
      </div>
    `;
  }

  if (isOriginals) {
    return `
      <div class="movie-card originals-card" data-id="${item.id}">
        <div class="card-media-wrapper">
          <img src="${item.posterUrl}" alt="${item.title}" class="card-img" loading="lazy" />
          ${item.videoUrl ? `
            <video class="card-hover-video" muted loop playsinline preload="none">
              <source src="${item.videoUrl}" type="video/mp4" />
            </video>
          ` : ''}
          <div class="originals-corner-ribbon">
            <span class="c-logo-mini">C</span>
            <span class="orig-tag">ORIGINAL</span>
          </div>
          <div class="card-quick-preview">
            ${renderQuickPreview(item, inList, currentLike)}
          </div>
        </div>
      </div>
    `;
  }

  // Standard or Continue Watching Card
  return `
    <div class="movie-card standard-card ${isContinue ? 'continue-card' : ''}" data-id="${item.id}">
      <div class="card-media-wrapper">
        <img src="${item.backdropUrl}" alt="${item.title}" class="card-img" loading="lazy" />
        ${item.videoUrl ? `
          <video class="card-hover-video" muted loop playsinline preload="none">
            <source src="${item.videoUrl}" type="video/mp4" />
          </video>
        ` : ''}
        
        ${isContinue ? `
          <div class="continue-progress-bar">
            <div class="continue-progress-fill" style="width: ${progress.percent}%"></div>
          </div>
          <div class="continue-meta">
            <span class="continue-time">${progress.current} of ${progress.total}</span>
          </div>
        ` : ''}

        <div class="card-quick-preview">
          ${renderQuickPreview(item, inList, currentLike)}
        </div>
      </div>
    </div>
  `;
}

function renderQuickPreview(item, inList, currentLike) {
  const isTV = item.type === 'tv';
  return `
    <div class="quick-preview-body">
      <div class="quick-action-row">
        <div class="action-buttons-left">
          <button class="card-action-btn play-action-btn" data-action="play" data-id="${item.id}" aria-label="Play ${item.title}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </button>

          <button class="card-action-btn list-action-btn ${inList ? 'in-list' : ''}" data-action="list" data-id="${item.id}" aria-label="${inList ? 'Remove from My List' : 'Add to My List'}">
            ${inList ? `
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            ` : `
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            `}
          </button>

          <button class="card-action-btn like-action-btn ${currentLike === 'like' ? 'liked' : ''}" data-action="like" data-id="${item.id}" aria-label="I like this">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="${currentLike === 'like' ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
            </svg>
          </button>
        </div>

        <button class="card-action-btn details-action-btn" data-action="details" data-id="${item.id}" aria-label="More Information">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </div>

      <div class="card-meta-row">
        <span class="card-match">${item.match}</span>
        <span class="card-rating">${item.rating}</span>
        <span class="card-duration">${isTV ? item.seasons : item.duration}</span>
        <span class="card-badge-hd">HD</span>
      </div>

      <div class="card-genre-row">
        ${item.genre.map((g, idx) => `
          <span class="genre-item">${g}</span>${idx < item.genre.length - 1 ? '<span class="genre-dot">•</span>' : ''}
        `).join('')}
      </div>
    </div>
  `;
}

function attachRowListeners(rowElem, config, onPlay, onOpenModal) {
  const track = rowElem.querySelector(`#track-${config.id}`);
  const leftArrow = rowElem.querySelector(`#arrow-left-${config.id}`);
  const rightArrow = rowElem.querySelector(`#arrow-right-${config.id}`);

  // Arrow scrolling with smooth scroll
  function updateArrowVisibility() {
    if (!track) return;
    const maxScrollLeft = track.scrollWidth - track.clientWidth - 5;
    leftArrow.style.display = track.scrollLeft > 20 ? 'flex' : 'none';
    rightArrow.style.display = track.scrollLeft < maxScrollLeft ? 'flex' : 'none';
  }

  leftArrow.addEventListener('click', () => {
    sound.playPop();
    const scrollAmount = track.clientWidth * 0.75;
    track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  });

  rightArrow.addEventListener('click', () => {
    sound.playPop();
    const scrollAmount = track.clientWidth * 0.75;
    track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  });

  track.addEventListener('scroll', updateArrowVisibility, { passive: true });
  window.addEventListener('resize', updateArrowVisibility);
  setTimeout(updateArrowVisibility, 300);

  // Card hover trailer video preview
  rowElem.querySelectorAll('.movie-card').forEach(card => {
    let hoverTimer = null;
    card.addEventListener('mouseenter', () => {
      const vid = card.querySelector('.card-hover-video');
      if (vid) {
        hoverTimer = setTimeout(() => {
          vid.currentTime = 0;
          vid.play().then(() => {
            vid.classList.add('playing');
          }).catch(() => {});
        }, 380);
      }
    });

    card.addEventListener('mouseleave', () => {
      clearTimeout(hoverTimer);
      const vid = card.querySelector('.card-hover-video');
      if (vid) {
        vid.pause();
        vid.classList.remove('playing');
      }
    });
  });

  // Card click actions delegation
  rowElem.addEventListener('click', (e) => {
    const actionBtn = e.target.closest('[data-action]');
    const movieCard = e.target.closest('.movie-card');

    if (actionBtn) {
      e.stopPropagation();
      const action = actionBtn.dataset.action;
      const movieId = actionBtn.dataset.id;
      const movie = CATALOG.find(m => m.id === movieId);
      if (!movie) return;

      if (action === 'play') {
        sound.playTaDum();
        onPlay(movie);
      } else if (action === 'details') {
        sound.playPop();
        onOpenModal(movie);
      } else if (action === 'list') {
        sound.playChime();
        const added = storage.toggleMyList(movieId);
        updateCardListState(movieId, added);
        window.dispatchEvent(new CustomEvent('cinematron:toast', {
          detail: { 
            message: added ? `Added "${movie.title}" to My List` : `Removed "${movie.title}" from My List`,
            type: 'info' 
          }
        }));
      } else if (action === 'like') {
        sound.playPop();
        const newStatus = storage.setLike(movieId, 'like');
        updateCardLikeState(movieId, newStatus);
        window.dispatchEvent(new CustomEvent('cinematron:toast', {
          detail: { 
            message: newStatus ? `Rated "${movie.title}" with Thumbs Up` : `Rating removed`,
            type: 'info' 
          }
        }));
      }
      return;
    }

    // Clicking anywhere on card opens modal details
    if (movieCard) {
      const movieId = movieCard.dataset.id;
      const movie = CATALOG.find(m => m.id === movieId);
      if (movie) {
        sound.playPop();
        onOpenModal(movie);
      }
    }
  });

  function updateCardListState(movieId, added) {
    document.querySelectorAll(`.list-action-btn[data-id="${movieId}"]`).forEach(btn => {
      btn.classList.toggle('in-list', added);
      btn.innerHTML = added ? `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      ` : `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      `;
    });
  }

  function updateCardLikeState(movieId, status) {
    document.querySelectorAll(`.like-action-btn[data-id="${movieId}"]`).forEach(btn => {
      btn.classList.toggle('liked', status === 'like');
      btn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="${status === 'like' ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
        </svg>
      `;
    });
  }
}
