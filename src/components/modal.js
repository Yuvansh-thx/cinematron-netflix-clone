// Detailed Title Modal Component for Cinematron (<dialog>)
import { CATALOG } from '../data/catalog.js';
import { storage } from '../utils/storage.js';
import { sound } from '../utils/audio.js';

export function initModal(dialogElem, onPlay) {
  let currentMovie = null;
  let isVideoMuted = true;

  // Render modal content
  function render(movie) {
    currentMovie = movie;
    const isTV = movie.type === 'tv';
    const inList = storage.isInMyList(movie.id);
    const likes = storage.getLikes();
    const currentLike = likes[movie.id] || null;

    // Find similar movies
    const similarMovies = (movie.similar || [])
      .map(id => CATALOG.find(m => m.id === id))
      .filter(Boolean);

    dialogElem.innerHTML = `
      <div class="modal-inner" id="modal-inner">
        <!-- Close Button -->
        <button class="modal-close-btn" id="modal-close-btn" aria-label="Close dialog">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <!-- Modal Hero Media -->
        <div class="modal-hero-media">
          <img src="${movie.backdropUrl}" alt="${movie.title}" class="modal-hero-poster" id="modal-hero-poster" />
          ${movie.videoUrl ? `
            <video 
              class="modal-hero-video" 
              id="modal-hero-video" 
              autoplay 
              muted 
              loop 
              playsinline
              poster="${movie.backdropUrl}"
            >
              <source src="${movie.videoUrl}" type="video/mp4" />
            </video>
          ` : ''}
          
          <div class="modal-hero-gradient"></div>

          <!-- Hero Bottom Action Overlay -->
          <div class="modal-hero-actions-container">
            ${movie.isOriginal ? `
              <div class="modal-original-tag">
                <span class="cinematron-c-badge">C</span>
                <span class="series-badge">${isTV ? 'CINEMATRON SERIES' : 'CINEMATRON FILM'}</span>
              </div>
            ` : ''}
            <h2 class="modal-title">${movie.title}</h2>

            <div class="modal-actions-row">
              <button class="modal-play-btn" id="modal-play-btn">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                <span>Play</span>
              </button>

              <button class="modal-icon-btn ${inList ? 'in-list' : ''}" id="modal-list-btn" aria-label="${inList ? 'Remove from My List' : 'Add to My List'}">
                ${inList ? `
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                ` : `
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                `}
              </button>

              <button class="modal-icon-btn ${currentLike === 'like' ? 'liked' : ''}" id="modal-like-btn" aria-label="Rate this title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="${currentLike === 'like' ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                </svg>
              </button>

              <!-- Video Sound Toggle -->
              <button class="modal-icon-btn modal-sound-btn" id="modal-sound-btn" aria-label="Toggle Sound">
                ${isVideoMuted ? `
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <line x1="23" y1="9" x2="17" y2="15"></line>
                    <line x1="17" y1="9" x2="23" y2="15"></line>
                  </svg>
                ` : `
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  </svg>
                `}
              </button>
            </div>
          </div>
        </div>

        <!-- Details Main Content -->
        <div class="modal-details-body">
          <div class="modal-meta-grid">
            <!-- Left Info Column -->
            <div class="modal-left-info">
              <div class="modal-specs-line">
                <span class="match-score">${movie.match}</span>
                <span class="year-badge">${movie.year}</span>
                <span class="maturity-badge">${movie.rating}</span>
                <span class="duration-badge">${isTV ? movie.seasons : movie.duration}</span>
                <span class="quality-badge">${movie.quality}</span>
                <span class="audio-badge">${movie.audio}</span>
              </div>

              ${movie.awards ? `
                <div class="modal-awards-pill">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                  <span>${movie.awards}</span>
                </div>
              ` : ''}

              <p class="modal-long-synopsis">${movie.synopsisLong || movie.shortDescription}</p>
            </div>

            <!-- Right Details Column -->
            <div class="modal-right-details">
              <div class="detail-group">
                <span class="detail-label">Cast:</span>
                <span class="detail-value">${movie.cast ? movie.cast.join(', ') : 'Ensemble Cast'}</span>
              </div>
              <div class="detail-group">
                <span class="detail-label">Director:</span>
                <span class="detail-value">${movie.director || 'Cinematron Studios'}</span>
              </div>
              <div class="detail-group">
                <span class="detail-label">Genres:</span>
                <span class="detail-value">${movie.genre.join(', ')}</span>
              </div>
              <div class="detail-group">
                <span class="detail-label">This title is:</span>
                <span class="detail-value">Mind-Bending, Visually Striking, Immersive, Suspenseful</span>
              </div>
            </div>
          </div>

          <!-- TV Episodes Section (if TV Show) -->
          ${isTV && movie.episodes && movie.episodes.length ? `
            <div class="modal-episodes-section">
              <div class="episodes-header">
                <h3 class="section-title">Episodes</h3>
                <div class="season-select-wrapper">
                  <select class="season-select" id="season-select">
                    <option value="1">Season 1</option>
                    <option value="2">Season 2</option>
                  </select>
                </div>
              </div>

              <div class="episodes-list">
                ${movie.episodes.map(ep => `
                  <div class="episode-card" data-ep="${ep.ep}">
                    <span class="episode-number">${ep.ep}</span>
                    <div class="episode-thumb-container">
                      <img src="${ep.thumb}" alt="${ep.title}" class="episode-thumb" />
                      <button class="episode-play-overlay-btn" aria-label="Play Episode ${ep.ep}: ${ep.title}">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                      </button>
                    </div>
                    <div class="episode-info">
                      <div class="episode-title-row">
                        <h4 class="episode-title">${ep.title}</h4>
                        <span class="episode-duration">${ep.duration}</span>
                      </div>
                      <p class="episode-plot">${ep.desc}</p>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- More Like This Grid -->
          ${similarMovies.length > 0 ? `
            <div class="modal-similar-section">
              <h3 class="section-title">More Like This</h3>
              <div class="similar-grid">
                ${similarMovies.map(item => `
                  <div class="similar-card" data-id="${item.id}">
                    <div class="similar-media">
                      <img src="${item.backdropUrl}" alt="${item.title}" class="similar-img" />
                      <div class="similar-duration">${item.duration || item.seasons}</div>
                    </div>
                    <div class="similar-content">
                      <div class="similar-meta">
                        <span class="match-score">${item.match}</span>
                        <span class="maturity-badge">${item.rating}</span>
                        <button class="similar-add-btn" data-id="${item.id}" aria-label="Add to My List">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                        </button>
                      </div>
                      <h4 class="similar-title">${item.title}</h4>
                      <p class="similar-desc">${item.shortDescription.substring(0, 100)}...</p>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- About Modal Section -->
          <div class="modal-about-section">
            <h3 class="section-title">About <strong>${movie.title}</strong></h3>
            <div class="about-grid">
              <div>
                <span class="about-label">Director:</span>
                <span class="about-value">${movie.director || 'Cinematron Productions'}</span>
              </div>
              <div>
                <span class="about-label">Cast:</span>
                <span class="about-value">${movie.cast ? movie.cast.join(', ') : 'Ensemble'}</span>
              </div>
              <div>
                <span class="about-label">Writer:</span>
                <span class="about-value">${movie.director || 'Aiden Vance'}</span>
              </div>
              <div>
                <span class="about-label">Maturity Rating:</span>
                <span class="about-value">${movie.rating} (Recommended for mature audiences)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Hook internal event listeners
    const closeBtn = dialogElem.querySelector('#modal-close-btn');
    const playBtn = dialogElem.querySelector('#modal-play-btn');
    const listBtn = dialogElem.querySelector('#modal-list-btn');
    const likeBtn = dialogElem.querySelector('#modal-like-btn');
    const soundBtn = dialogElem.querySelector('#modal-sound-btn');
    const video = dialogElem.querySelector('#modal-hero-video');

    if (video) {
      video.muted = isVideoMuted;
      video.play().catch(() => {});
    }

    closeBtn.addEventListener('click', () => {
      sound.playPop();
      dialogElem.close();
    });

    playBtn.addEventListener('click', () => {
      sound.playTaDum();
      dialogElem.close();
      onPlay(movie);
    });

    listBtn.addEventListener('click', () => {
      sound.playChime();
      const added = storage.toggleMyList(movie.id);
      listBtn.classList.toggle('in-list', added);
      listBtn.innerHTML = added ? `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      ` : `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      `;
      window.dispatchEvent(new CustomEvent('cinematron:toast', {
        detail: { message: added ? `Added to My List` : `Removed from My List`, type: 'info' }
      }));
    });

    likeBtn.addEventListener('click', () => {
      sound.playPop();
      const newStatus = storage.setLike(movie.id, 'like');
      likeBtn.classList.toggle('liked', newStatus === 'like');
      likeBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="${newStatus === 'like' ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
        </svg>
      `;
    });

    if (soundBtn && video) {
      soundBtn.addEventListener('click', () => {
        isVideoMuted = !isVideoMuted;
        video.muted = isVideoMuted;
        sound.playPop();
        soundBtn.innerHTML = isVideoMuted ? `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <line x1="23" y1="9" x2="17" y2="15"></line>
            <line x1="17" y1="9" x2="23" y2="15"></line>
          </svg>
        ` : `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          </svg>
        `;
      });
    }

    // Episode play buttons
    dialogElem.querySelectorAll('.episode-card').forEach(card => {
      card.addEventListener('click', () => {
        sound.playTaDum();
        dialogElem.close();
        onPlay(movie);
      });
    });

    // Similar cards click
    dialogElem.querySelectorAll('.similar-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.similar-add-btn')) {
          e.stopPropagation();
          const sid = card.dataset.id;
          const added = storage.toggleMyList(sid);
          sound.playChime();
          window.dispatchEvent(new CustomEvent('cinematron:toast', {
            detail: { message: added ? 'Added to My List' : 'Removed from My List', type: 'info' }
          }));
          return;
        }
        const sid = card.dataset.id;
        const targetMovie = CATALOG.find(m => m.id === sid);
        if (targetMovie) {
          sound.playPop();
          dialogElem.scrollTop = 0;
          render(targetMovie);
        }
      });
    });
  }

  // Light dismiss fallback according to modern web guidance
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

  // When dialog closes, stop any video
  dialogElem.addEventListener('close', () => {
    const video = dialogElem.querySelector('#modal-hero-video');
    if (video) video.pause();
    dialogElem.returnValue = '';
  });

  return {
    open(movie) {
      render(movie);
      dialogElem.showModal();
    },
    close() {
      dialogElem.close();
    }
  };
}
