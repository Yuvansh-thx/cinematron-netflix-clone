// Hero Billboard Component for Cinematron
import { CATALOG } from '../data/catalog.js';
import { sound } from '../utils/audio.js';

export function initHero(container, onPlay, onOpenModal) {
  // Select top 4 flagship titles for billboard rotation
  const heroTitles = CATALOG.filter(item => item.heroRank && item.heroRank <= 4);
  let currentIndex = 0;
  let isVideoMuted = true;
  let autoRotateTimer = null;

  function renderHero(index) {
    const movie = heroTitles[index];
    const isTV = movie.type === 'tv';

    container.innerHTML = `
      <section class="hero-billboard" id="hero-billboard" aria-label="Featured Title">
        <!-- Background Media -->
        <div class="hero-media-container">
          <img 
            src="${movie.backdropUrl}" 
            alt="${movie.title}" 
            class="hero-backdrop-img ${movie.videoUrl ? 'faded' : ''}" 
            id="hero-backdrop-img"
          />
          ${movie.videoUrl ? `
            <video 
              class="hero-video" 
              id="hero-video" 
              autoplay 
              muted 
              loop 
              playsinline
              preload="auto"
              poster="${movie.backdropUrl}"
            >
              <source src="${movie.videoUrl}" type="video/mp4" />
            </video>
          ` : ''}
          <div class="hero-vignette-left"></div>
          <div class="hero-vignette-bottom"></div>
        </div>

        <!-- Hero Content Overlay -->
        <div class="hero-content">
          <!-- Top Badge -->
          <div class="hero-meta-badge">
            <span class="cinematron-c-badge">C</span>
            <span class="series-badge">${isTV ? 'SERIES' : 'FILM'}</span>
            <span class="top10-ribbon">
              <span class="top10-square">TOP<br>10</span>
              <span class="top10-text">#${movie.heroRank} in India Today</span>
            </span>
          </div>

          <!-- Title -->
          <h1 class="hero-title">${movie.title}</h1>

          <!-- Meta Specs -->
          <div class="hero-specs">
            <span class="match-score">${movie.match}</span>
            <span class="maturity-badge">${movie.rating}</span>
            <span class="duration-badge">${isTV ? movie.seasons : movie.duration}</span>
            <span class="quality-badge">${movie.quality}</span>
            <span class="audio-badge">${movie.audio}</span>
          </div>

          <!-- Description -->
          <p class="hero-description">${movie.shortDescription}</p>

          <!-- Buttons & Controls -->
          <div class="hero-actions">
            <button class="hero-btn primary-play-btn" id="hero-play-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              <span>Play</span>
            </button>

            <button class="hero-btn secondary-info-btn" id="hero-info-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <span>More Info</span>
            </button>
          </div>
        </div>

        <!-- Right Side Media Controls -->
        <div class="hero-right-controls">
          <button class="hero-sound-btn" id="hero-sound-btn" aria-label="Toggle Video Sound" title="${isVideoMuted ? 'Unmute' : 'Mute'}">
            ${isVideoMuted ? `
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <line x1="23" y1="9" x2="17" y2="15"></line>
                <line x1="17" y1="9" x2="23" y2="15"></line>
              </svg>
            ` : `
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              </svg>
            `}
          </button>
          <div class="hero-age-pill">${movie.rating}</div>
        </div>

        <!-- Billboard Carousel Switcher Dots -->
        <div class="hero-dots" id="hero-dots">
          ${heroTitles.map((_, i) => `
            <button class="hero-dot ${i === index ? 'active' : ''}" data-index="${i}" aria-label="Go to slide ${i + 1}"></button>
          `).join('')}
        </div>
      </section>
    `;

    // Connect handlers
    const playBtn = container.querySelector('#hero-play-btn');
    const infoBtn = container.querySelector('#hero-info-btn');
    const soundBtn = container.querySelector('#hero-sound-btn');
    const video = container.querySelector('#hero-video');
    const dots = container.querySelectorAll('.hero-dot');

    if (video) {
      video.muted = isVideoMuted;
      video.play().catch(() => {});
    }

    playBtn.addEventListener('click', () => {
      sound.playTaDum();
      onPlay(movie);
    });

    infoBtn.addEventListener('click', () => {
      sound.playPop();
      onOpenModal(movie);
    });

    soundBtn.addEventListener('click', () => {
      if (!video) return;
      isVideoMuted = !isVideoMuted;
      video.muted = isVideoMuted;
      sound.playPop();
      renderHero(currentIndex);
    });

    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        sound.playPop();
        currentIndex = parseInt(dot.dataset.index, 10);
        resetAutoRotate();
        renderHero(currentIndex);
      });
    });
  }

  function startAutoRotate() {
    autoRotateTimer = setInterval(() => {
      currentIndex = (currentIndex + 1) % heroTitles.length;
      renderHero(currentIndex);
    }, 12000);
  }

  function resetAutoRotate() {
    clearInterval(autoRotateTimer);
    startAutoRotate();
  }

  renderHero(0);
  startAutoRotate();
}
