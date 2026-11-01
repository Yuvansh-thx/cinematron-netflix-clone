// Full Cinematic Netflix-Style Video Player ("The Theatre")
import { sound } from '../utils/audio.js';

export function initPlayer(container) {
  let video = null;
  let ambientCanvas = null;
  let ambientCtx = null;
  let ambientAnimId = null;
  let idleTimer = null;
  let currentMovie = null;
  let isMuted = false;
  let currentSpeed = 1.0;
  let currentAudio = 'English [Original]';
  let currentSub = 'Off';

  function formatTime(seconds) {
    if (isNaN(seconds)) return '00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  }

  function render(movie) {
    currentMovie = movie;

    container.innerHTML = `
      <div class="theatre-container" id="theatre-container">
        <!-- Ambient Canvas Glow -->
        <canvas class="ambient-glow-canvas" id="ambient-canvas"></canvas>

        <!-- Video Element -->
        <video 
          class="theatre-video" 
          id="theatre-video" 
          playsinline 
          preload="auto"
          poster="${movie.backdropUrl}"
        >
          <source src="${movie.videoUrl}" type="video/mp4" />
        </video>

        <!-- Big Center Play / Pause Pulse Icon -->
        <div class="center-pulse-indicator" id="pulse-indicator">
          <svg class="pulse-icon play-pulse" width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          <svg class="pulse-icon pause-pulse" width="64" height="64" viewBox="0 0 24 24" fill="currentColor" style="display:none;">
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
          </svg>
        </div>

        <!-- Player Controls Overlay (Auto-Hides) -->
        <div class="theatre-overlay" id="theatre-overlay">
          <!-- Top Bar -->
          <div class="theatre-top-bar">
            <button class="theatre-back-btn" id="theatre-back-btn" aria-label="Back to browsing">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span class="back-text">Back to Browse</span>
            </button>

            <div class="theatre-title-block">
              <h3 class="theatre-movie-title">${movie.title}</h3>
              <span class="theatre-subtitle">${movie.type === 'tv' ? 'Season 1 Episode 1' : movie.quality + ' • ' + movie.audio}</span>
            </div>

            <div class="theatre-top-right">
              <span class="theatre-age-badge">${movie.rating}</span>
            </div>
          </div>

          <!-- Bottom Bar -->
          <div class="theatre-bottom-bar">
            <!-- Floating Skip Intro Button (Appears between 5s and 25s) -->
            <div class="skip-intro-wrapper" id="skip-intro-wrapper" style="display: none;">
              <button class="skip-intro-btn" id="skip-intro-btn">
                <span>Skip Intro</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 4 15 12 5 20 5 4"></polygon>
                  <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" stroke-width="3"></line>
                </svg>
              </button>
            </div>

            <!-- Scrubber Timeline with Tooltip -->
            <div class="timeline-container" id="timeline-container">
              <div class="timeline-tooltip" id="timeline-tooltip">00:00</div>
              <div class="timeline-track">
                <div class="timeline-buffered" id="timeline-buffered"></div>
                <div class="timeline-progress" id="timeline-progress">
                  <div class="timeline-scrubber-knob"></div>
                </div>
              </div>
            </div>

            <!-- Controls Row -->
            <div class="controls-row">
              <div class="controls-left">
                <!-- Play / Pause -->
                <button class="player-btn" id="play-pause-btn" aria-label="Play">
                  <svg class="icon-play" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                  <svg class="icon-pause" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="display:none;">
                    <rect x="6" y="4" width="4" height="16"></rect>
                    <rect x="14" y="4" width="4" height="16"></rect>
                  </svg>
                </button>

                <!-- 10s Rewind -->
                <button class="player-btn" id="rewind-btn" aria-label="Rewind 10 seconds" title="Rewind 10s">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="1 4 1 10 7 10"></polyline>
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                  </svg>
                  <span class="btn-subtext">10</span>
                </button>

                <!-- 10s Forward -->
                <button class="player-btn" id="forward-btn" aria-label="Forward 10 seconds" title="Forward 10s">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                  </svg>
                  <span class="btn-subtext">10</span>
                </button>

                <!-- Volume & Slider -->
                <div class="volume-control-group">
                  <button class="player-btn" id="volume-btn" aria-label="Mute / Unmute">
                    <svg class="icon-vol-high" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    </svg>
                    <svg class="icon-vol-mute" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:none;">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                      <line x1="23" y1="9" x2="17" y2="15"></line>
                      <line x1="17" y1="9" x2="23" y2="15"></line>
                    </svg>
                  </button>
                  <div class="volume-slider-wrapper">
                    <input type="range" class="volume-slider" id="volume-slider" min="0" max="1" step="0.05" value="1" />
                  </div>
                </div>

                <!-- Time Display -->
                <div class="time-display" id="time-display">
                  <span id="current-time">00:00</span> / <span id="total-duration">00:00</span>
                </div>
              </div>

              <div class="controls-right">
                <!-- Speed Selector Popover -->
                <div class="popover-wrapper">
                  <button class="player-btn speed-btn" id="speed-btn" aria-label="Playback speed" title="Playback speed">
                    <span id="speed-label">1x</span>
                  </button>
                  <div class="speed-menu" id="speed-menu">
                    <button class="speed-opt" data-speed="0.5">0.5x</button>
                    <button class="speed-opt" data-speed="0.75">0.75x</button>
                    <button class="speed-opt active" data-speed="1.0">1.0x (Normal)</button>
                    <button class="speed-opt" data-speed="1.25">1.25x</button>
                    <button class="speed-opt" data-speed="1.5">1.5x</button>
                  </div>
                </div>

                <!-- Audio & Subtitles Selector Popover -->
                <div class="popover-wrapper">
                  <button class="player-btn" id="subtitles-btn" aria-label="Audio and Subtitles" title="Audio and Subtitles">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                      <path d="M7 15h4M15 15h2M7 11h2M13 11h4"></path>
                    </svg>
                  </button>
                  <div class="subtitles-menu" id="subtitles-menu">
                    <div class="subs-columns">
                      <div class="subs-column">
                        <h4>Audio</h4>
                        <button class="sub-opt audio-opt active" data-audio="English [Original]">English [Original]</button>
                        <button class="sub-opt audio-opt" data-audio="Spanish (Dolby 5.1)">Spanish (Dolby 5.1)</button>
                        <button class="sub-opt audio-opt" data-audio="Hindi (Dolby Atmos)">Hindi (Dolby Atmos)</button>
                        <button class="sub-opt audio-opt" data-audio="Japanese (5.1)">Japanese (5.1)</button>
                      </div>
                      <div class="subs-column">
                        <h4>Subtitles</h4>
                        <button class="sub-opt subtitle-opt active" data-sub="Off">Off</button>
                        <button class="sub-opt subtitle-opt" data-sub="English [CC]">English [CC]</button>
                        <button class="sub-opt subtitle-opt" data-sub="Spanish">Spanish</button>
                        <button class="sub-opt subtitle-opt" data-sub="Hindi">Hindi</button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Next Episode (if series) -->
                ${movie.type === 'tv' ? `
                  <button class="player-btn" id="next-ep-btn" aria-label="Next Episode" title="Next Episode">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 4 15 12 5 20 5 4"></polygon>
                      <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" stroke-width="3"></line>
                    </svg>
                  </button>
                ` : ''}

                <!-- Picture-in-Picture Toggle -->
                <button class="player-btn" id="pip-btn" aria-label="Picture in Picture" title="Picture in Picture">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                    <rect x="12" y="10" width="8" height="6" rx="1" fill="currentColor"></rect>
                  </svg>
                </button>

                <!-- Fullscreen Toggle -->
                <button class="player-btn" id="fullscreen-btn" aria-label="Toggle Fullscreen" title="Fullscreen">
                  <svg class="icon-expand" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                  </svg>
                  <svg class="icon-compress" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:none;">
                    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Elements
    const playerWrapper = container.querySelector('#theatre-container');
    video = container.querySelector('#theatre-video');
    ambientCanvas = container.querySelector('#ambient-canvas');
    if (ambientCanvas) ambientCtx = ambientCanvas.getContext('2d', { willReadFrequently: true });

    const overlay = container.querySelector('#theatre-overlay');
    const backBtn = container.querySelector('#theatre-back-btn');
    const playPauseBtn = container.querySelector('#play-pause-btn');
    const iconPlay = container.querySelector('.icon-play');
    const iconPause = container.querySelector('.icon-pause');
    const pulseIndicator = container.querySelector('#pulse-indicator');
    const playPulse = container.querySelector('.play-pulse');
    const pausePulse = container.querySelector('.pause-pulse');
    const rewindBtn = container.querySelector('#rewind-btn');
    const forwardBtn = container.querySelector('#forward-btn');
    const volumeBtn = container.querySelector('#volume-btn');
    const iconVolHigh = container.querySelector('.icon-vol-high');
    const iconVolMute = container.querySelector('.icon-vol-mute');
    const volumeSlider = container.querySelector('#volume-slider');
    const currentTimeEl = container.querySelector('#current-time');
    const totalDurationEl = container.querySelector('#total-duration');
    const timelineContainer = container.querySelector('#timeline-container');
    const timelineProgress = container.querySelector('#timeline-progress');
    const timelineBuffered = container.querySelector('#timeline-buffered');
    const timelineTooltip = container.querySelector('#timeline-tooltip');
    const speedBtn = container.querySelector('#speed-btn');
    const speedMenu = container.querySelector('#speed-menu');
    const speedLabel = container.querySelector('#speed-label');
    const subtitlesBtn = container.querySelector('#subtitles-btn');
    const subtitlesMenu = container.querySelector('#subtitles-menu');
    const fullscreenBtn = container.querySelector('#fullscreen-btn');
    const iconExpand = container.querySelector('.icon-expand');
    const iconCompress = container.querySelector('.icon-compress');

    // Start video playback
    video.play().then(() => {
      iconPlay.style.display = 'none';
      iconPause.style.display = 'block';
      startAmbientLighting();
    }).catch(() => {
      iconPlay.style.display = 'block';
      iconPause.style.display = 'none';
    });

    // Ambient Lighting Loop
    function startAmbientLighting() {
      if (!ambientCanvas || !ambientCtx || !video) return;
      ambientCanvas.width = 160;
      ambientCanvas.height = 90;

      function draw() {
        if (!video.paused && !video.ended) {
          try {
            ambientCtx.drawImage(video, 0, 0, ambientCanvas.width, ambientCanvas.height);
          } catch (e) {}
        }
        ambientAnimId = requestAnimationFrame(draw);
      }
      ambientAnimId = requestAnimationFrame(draw);
    }

    // Toggle Play/Pause
    function togglePlay() {
      if (video.paused) {
        video.play();
        iconPlay.style.display = 'none';
        iconPause.style.display = 'block';
        triggerPulse('play');
      } else {
        video.pause();
        iconPlay.style.display = 'block';
        iconPause.style.display = 'none';
        triggerPulse('pause');
      }
    }

    function triggerPulse(type) {
      if (type === 'play') {
        playPulse.style.display = 'block';
        pausePulse.style.display = 'none';
      } else {
        playPulse.style.display = 'none';
        pausePulse.style.display = 'block';
      }
      pulseIndicator.classList.remove('animate');
      void pulseIndicator.offsetWidth; // Force reflow
      pulseIndicator.classList.add('animate');
    }

    playPauseBtn.addEventListener('click', togglePlay);
    video.addEventListener('click', togglePlay);

    // 10s Rewind and Forward
    rewindBtn.addEventListener('click', () => {
      video.currentTime = Math.max(0, video.currentTime - 10);
      sound.playPop();
    });

    forwardBtn.addEventListener('click', () => {
      video.currentTime = Math.min(video.duration, video.currentTime + 10);
      sound.playPop();
    });

    const skipIntroWrapper = container.querySelector('#skip-intro-wrapper');
    const skipIntroBtn = container.querySelector('#skip-intro-btn');
    const pipBtn = container.querySelector('#pip-btn');
    const nextEpBtn = container.querySelector('#next-ep-btn');

    if (skipIntroBtn) {
      skipIntroBtn.addEventListener('click', () => {
        sound.playPop();
        video.currentTime = 26;
        skipIntroWrapper.style.display = 'none';
        window.dispatchEvent(new CustomEvent('cinematron:toast', {
          detail: { message: 'Skipped Intro', type: 'info' }
        }));
      });
    }

    if (pipBtn) {
      pipBtn.addEventListener('click', async () => {
        sound.playPop();
        try {
          if (document.pictureInPictureElement) {
            await document.exitPictureInPicture();
          } else if (document.pictureInPictureEnabled) {
            await video.requestPictureInPicture();
          }
        } catch (err) {
          console.warn('PiP error:', err);
        }
      });
    }

    if (nextEpBtn) {
      nextEpBtn.addEventListener('click', () => {
        sound.playTaDum();
        video.currentTime = 0;
        video.play();
        window.dispatchEvent(new CustomEvent('cinematron:toast', {
          detail: { message: 'Playing Next Episode: Season 1 Episode 2', type: 'info' }
        }));
      });
    }

    // Time update & Progress bar
    video.addEventListener('timeupdate', () => {
      if (!video.duration) return;
      const progressPercent = (video.currentTime / video.duration) * 100;
      timelineProgress.style.width = `${progressPercent}%`;
      currentTimeEl.textContent = formatTime(video.currentTime);

      // Skip Intro trigger (5s to 25s)
      if (skipIntroWrapper) {
        if (video.currentTime >= 4 && video.currentTime <= 25) {
          skipIntroWrapper.style.display = 'block';
        } else {
          skipIntroWrapper.style.display = 'none';
        }
      }

      // Buffered progress
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const bufferedPercent = (bufferedEnd / video.duration) * 100;
        timelineBuffered.style.width = `${bufferedPercent}%`;
      }
    });

    video.addEventListener('loadedmetadata', () => {
      totalDurationEl.textContent = formatTime(video.duration);
    });

    // Scrubber click & drag
    let isScrubbing = false;

    function seekTimeline(e) {
      const rect = timelineContainer.getBoundingClientRect();
      const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      video.currentTime = pos * video.duration;
      timelineProgress.style.width = `${pos * 100}%`;
    }

    timelineContainer.addEventListener('mousedown', (e) => {
      isScrubbing = true;
      seekTimeline(e);
    });

    window.addEventListener('mousemove', (e) => {
      if (isScrubbing) {
        seekTimeline(e);
      }
      // Tooltip positioning
      const rect = timelineContainer.getBoundingClientRect();
      if (e.clientY >= rect.top - 40 && e.clientY <= rect.bottom + 20 && e.clientX >= rect.left && e.clientX <= rect.right) {
        const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        timelineTooltip.style.display = 'block';
        timelineTooltip.style.left = `${pos * 100}%`;
        timelineTooltip.textContent = formatTime(pos * (video.duration || 0));
      } else {
        timelineTooltip.style.display = 'none';
      }
    });

    window.addEventListener('mouseup', () => {
      isScrubbing = false;
    });

    // Volume control
    volumeSlider.addEventListener('input', (e) => {
      video.volume = parseFloat(e.target.value);
      video.muted = video.volume === 0;
      updateVolumeIcons();
    });

    volumeBtn.addEventListener('click', () => {
      video.muted = !video.muted;
      updateVolumeIcons();
    });

    function updateVolumeIcons() {
      if (video.muted || video.volume === 0) {
        iconVolHigh.style.display = 'none';
        iconVolMute.style.display = 'block';
        volumeSlider.value = 0;
      } else {
        iconVolHigh.style.display = 'block';
        iconVolMute.style.display = 'none';
        volumeSlider.value = video.volume;
      }
    }

    // Speed Selector
    speedBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      speedMenu.classList.toggle('open');
      subtitlesMenu.classList.remove('open');
    });

    container.querySelectorAll('.speed-opt').forEach(opt => {
      opt.addEventListener('click', () => {
        const speed = parseFloat(opt.dataset.speed);
        currentSpeed = speed;
        video.playbackRate = speed;
        speedLabel.textContent = `${speed}x`;
        container.querySelectorAll('.speed-opt').forEach(o => o.classList.toggle('active', o === opt));
        speedMenu.classList.remove('open');
        sound.playPop();
      });
    });

    // Subtitles & Audio Selector
    subtitlesBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      subtitlesMenu.classList.toggle('open');
      speedMenu.classList.remove('open');
    });

    container.querySelectorAll('.audio-opt').forEach(opt => {
      opt.addEventListener('click', () => {
        currentAudio = opt.dataset.audio;
        container.querySelectorAll('.audio-opt').forEach(o => o.classList.toggle('active', o === opt));
        sound.playPop();
      });
    });

    container.querySelectorAll('.subtitle-opt').forEach(opt => {
      opt.addEventListener('click', () => {
        currentSub = opt.dataset.sub;
        container.querySelectorAll('.subtitle-opt').forEach(o => o.classList.toggle('active', o === opt));
        sound.playPop();
        window.dispatchEvent(new CustomEvent('cinematron:toast', {
          detail: { message: `Subtitles set to: ${currentSub}`, type: 'info' }
        }));
      });
    });

    // Fullscreen Toggle
    fullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        playerWrapper.requestFullscreen?.() || playerWrapper.webkitRequestFullscreen?.();
        iconExpand.style.display = 'none';
        iconCompress.style.display = 'block';
      } else {
        document.exitFullscreen?.() || document.webkitExitFullscreen?.();
        iconExpand.style.display = 'block';
        iconCompress.style.display = 'none';
      }
    });

    // Auto-hide controls on mouse idle (3.5 seconds)
    function wakeControls() {
      overlay.classList.remove('idle-hide');
      playerWrapper.style.cursor = 'default';
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        if (!video.paused) {
          overlay.classList.add('idle-hide');
          playerWrapper.style.cursor = 'none';
          speedMenu.classList.remove('open');
          subtitlesMenu.classList.remove('open');
        }
      }, 3500);
    }

    playerWrapper.addEventListener('mousemove', wakeControls);
    playerWrapper.addEventListener('click', wakeControls);

    // Keyboard Shortcuts
    function handleKeydown(e) {
      if (container.style.display === 'none') return;

      if (e.code === 'Space' || e.code === 'KeyK') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        video.muted = !video.muted;
        updateVolumeIcons();
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        fullscreenBtn.click();
      } else if (e.code === 'ArrowLeft' || e.code === 'KeyJ') {
        e.preventDefault();
        video.currentTime = Math.max(0, video.currentTime - 10);
      } else if (e.code === 'ArrowRight' || e.code === 'KeyL') {
        e.preventDefault();
        video.currentTime = Math.min(video.duration, video.currentTime + 10);
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        video.volume = Math.min(1, video.volume + 0.1);
        updateVolumeIcons();
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        video.volume = Math.max(0, video.volume - 0.1);
        updateVolumeIcons();
      } else if (e.code === 'Escape') {
        closePlayer();
      }
    }

    window.addEventListener('keydown', handleKeydown);

    // Close Player
    function closePlayer() {
      if (ambientAnimId) cancelAnimationFrame(ambientAnimId);
      if (video) video.pause();
      clearTimeout(idleTimer);
      window.removeEventListener('keydown', handleKeydown);
      container.style.display = 'none';
      container.innerHTML = '';
      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {});
      }
    }

    backBtn.addEventListener('click', () => {
      sound.playPop();
      closePlayer();
    });

    // Close menus on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.popover-wrapper')) {
        speedMenu.classList.remove('open');
        subtitlesMenu.classList.remove('open');
      }
    });
  }

  return {
    play(movie) {
      container.style.display = 'block';
      render(movie);
    }
  };
}
