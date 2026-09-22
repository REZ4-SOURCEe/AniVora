/* ============================================
   ANIVORA — COMPONENTS
   card, player, download sheet
============================================ */

import { isInList, toggleList, formatTime, showToast } from './core.js';
import { ANIME_DATA } from './data.js';

/* ============================================
   CARD RENDERER
============================================ */
export function renderAnimeCard(a) {
  const sc = a.status === 'Airing' ? 'status-airing'
           : a.status === 'Upcoming' ? 'status-upcoming'
           : 'status-finished';
  return `
    <div class="anime-card" onclick="openAnimeDetail(${a.id})">
      <div class="card-poster">
        <img src="${a.img}" alt="${a.title}" loading="lazy">
        <div class="card-score">
          <svg style="width:10px;height:10px;fill:var(--gold);stroke:none;"><use href="#ico-star"/></svg>
          ${a.score}
        </div>
        <div class="card-type">${a.type}</div>
        ${a.status === 'Airing' ? '<div class="card-airing-dot"></div>' : ''}
      </div>
      <div class="card-body">
        <div class="card-title">${a.title}</div>
        <div class="card-meta">
          <span class="card-meta-item">${a.year}</span>
          <span class="status-badge ${sc}" style="font-size:9px;padding:1px 5px;">${a.status}</span>
        </div>
        <div class="card-meta" style="margin-top:2px;"><span class="card-meta-item">${a.eps} eps</span></div>
        <div class="card-genres">${a.genres.slice(0,2).map(g => `<span class="card-genre-tag">${g}</span>`).join('')}</div>
      </div>
    </div>`;
}

export function populateSection(id, data) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = data.map(a => renderAnimeCard(a)).join('');
}

/* ============================================
   DOWNLOAD SHEET (Episodes → Qualities)
============================================ */
export function toggleDownloadMenu(e, animeId, epNum) {
  if (e) e.stopPropagation();
  const anime = ANIME_DATA.find(a => a.id === animeId);
  if (!anime) return;

  const existing = document.querySelector('.download-sheet-overlay');
  if (existing) {
    closeDownloadSheet();
    return;
  }

  openDownloadSheet(anime);
}

function openDownloadSheet(anime) {
  document.querySelectorAll('.download-sheet-overlay').forEach(el => el.remove());
  document.querySelectorAll('.download-sheet').forEach(el => el.remove());

  const overlay = document.createElement('div');
  overlay.className = 'download-sheet-overlay';
  overlay.onclick = () => closeDownloadSheet();

  const sheet = document.createElement('div');
  sheet.className = 'download-sheet';

  sheet.innerHTML = `
    <div class="download-sheet-handle"></div>
    <div class="download-sheet-header">
      <div class="download-sheet-header-left">
        <button class="download-sheet-back" id="dlSheetBack" style="display:none;">
          <svg class="icon icon-md"><use href="#ico-chevron-l"/></svg>
        </button>
      </div>
      <div class="download-sheet-title" id="dlSheetTitle">${anime.title}</div>
      <div class="download-sheet-header-right">
        <button class="download-sheet-close" id="dlSheetClose">
          <svg class="icon icon-md"><use href="#ico-x"/></svg>
        </button>
      </div>
    </div>
    <div class="download-sheet-body" id="dlSheetBody"></div>
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(sheet);

  const body = sheet.querySelector('#dlSheetBody');
  const titleEl = sheet.querySelector('#dlSheetTitle');
  const backBtn = sheet.querySelector('#dlSheetBack');

  /* ---------- Step 1: Episodes ---------- */
  function renderEpisodes(withLoading = true) {
    backBtn.style.display = 'none';
    titleEl.textContent = anime.title;

    const episodesHTML = `
      <div class="download-sheet-subtitle">Select Episode</div>
      <div class="download-ep-list">
        ${anime.episodes.map(ep => `
          <button class="download-ep-item" data-ep="${ep.num}">
            <div class="download-ep-num">EP ${String(ep.num).padStart(2,'0')}</div>
            <div class="download-ep-info">
              <div class="download-ep-name">${ep.title}</div>
              <div class="download-ep-dur">${ep.duration || '24:00'}</div>
            </div>
            <svg class="icon icon-md download-ep-arrow"><use href="#ico-chevron-r"/></svg>
          </button>
        `).join('')}
      </div>
    `;

    const bindEpisodes = () => {
      body.querySelectorAll('.download-ep-item').forEach(item => {
        item.onclick = (e) => {
          e.stopPropagation();
          const num = parseInt(item.dataset.ep);
          const ep = anime.episodes.find(x => x.num === num);
          if (ep) renderQualities(ep);
        };
      });
    };

    if (!withLoading) {
      body.innerHTML = episodesHTML;
      bindEpisodes();
      return;
    }

    body.innerHTML = `
      <div class="dl-loading">
        <div class="dl-loading-spinner"></div>
        <div class="dl-loading-text">Loading episodes...</div>
      </div>
    `;

    setTimeout(() => {
      body.innerHTML = episodesHTML;
      bindEpisodes();
    }, 400);
  }

  /* ---------- Step 2: Qualities ---------- */
  function renderQualities(ep) {
    backBtn.style.display = 'flex';
    titleEl.textContent = `Episode ${ep.num}`;

    body.innerHTML = `
      <div class="dl-loading">
        <div class="dl-loading-spinner"></div>
        <div class="dl-loading-text">Loading qualities...</div>
      </div>
    `;

    const qualities = (ep.qualities && ep.qualities.length)
      ? ep.qualities
      : [{ label: '1080p', url: ep.videoUrl }];

    setTimeout(() => {
      body.innerHTML = `
        <div class="download-sheet-subtitle">Select Quality</div>
        <div class="download-quality-list">
          ${qualities.map(q => `
            <a class="download-quality-item" href="${q.url}" download target="_blank" rel="noopener" onclick="event.stopPropagation()">
              <div class="download-quality-icon">
                <svg class="icon icon-md"><use href="#ico-download"/></svg>
              </div>
              <div class="download-quality-info">
                <div class="download-quality-label">${q.label}</div>
                <div class="download-quality-desc">MKV · Video File</div>
              </div>
              <svg class="icon icon-md download-quality-arrow"><use href="#ico-chevron-r"/></svg>
            </a>
          `).join('')}
        </div>
      `;
    }, 400);
  }

  /* ---------- Back Button ---------- */
  backBtn.onclick = (e) => {
    e.stopPropagation();
    renderEpisodes(false);
  };

  /* ---------- Close Button ---------- */
  sheet.querySelector('#dlSheetClose').onclick = (e) => {
    e.stopPropagation();
    closeDownloadSheet();
  };

  /* ---------- Start with Episodes ---------- */
  renderEpisodes(true);

  requestAnimationFrame(() => {
    overlay.classList.add('show');
    sheet.classList.add('show');
  });
  document.body.style.overflow = 'hidden';
}

export function closeDownloadSheet() {
  const overlay = document.querySelector('.download-sheet-overlay');
  const sheet = document.querySelector('.download-sheet');
  if (overlay) { overlay.classList.remove('show'); setTimeout(() => overlay.remove(), 250); }
  if (sheet) { sheet.classList.remove('show'); setTimeout(() => sheet.remove(), 300); }
  document.body.style.overflow = '';
}

export function bindDownloadOutsideClick() {
  document.addEventListener('click', e => {
    if (!e.target.closest('.download-menu') && !e.target.closest('[title="Download"]')) {
      document.querySelectorAll('.download-menu.open').forEach(m => m.classList.remove('open'));
    }
  });
}

/* ============================================
   SHARE
============================================ */
export function shareAnime(animeId) {
  const url = location.origin + location.pathname + '#detail';
  if (navigator.share) {
    navigator.share({ title: 'Anivora', url }).catch(() => {});
  } else {
    navigator.clipboard.writeText(url).then(() => showToast('Link copied!')).catch(() => {});
  }
}

/* ============================================
   PLAYER — Core
============================================ */
let isPlaying = false;
let hideControlsTimer = null;

export function togglePlay(e) {
  if (e) e.stopPropagation();
  const video = window.__realVideo;

  if (video) {
    if (video.paused) {
      video.muted = false;
      video.volume = 1;

      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            isPlaying = true;
            updatePlayerUI();
            updateVolumeIcon();
          })
          .catch((error) => {
            console.log("Play error:", error);
            video.muted = true;
            video.play().then(() => {
              isPlaying = true;
              updatePlayerUI();
              updateVolumeIcon();
            }).catch(()=>{});
          });
      }
    } else {
      video.pause();
      isPlaying = false;
      updatePlayerUI();
    }
    return;
  }
  isPlaying = !isPlaying;
  updatePlayerUI();
}

export function updatePlayerUI() {
  const center = document.getElementById('playerCenter');
  const ppBtn = document.getElementById('playPauseBtn');
  const playerWrap = document.querySelector('.player-wrap');
  const video = window.__realVideo;
  const playing = video ? !video.paused : isPlaying;

  if (playing) {
    if (center) center.classList.add('hidden');
    if (ppBtn) ppBtn.innerHTML = `<svg class="icon icon-md" style="fill:rgba(255,255,255,0.85);stroke:none;"><use href="#ico-pause"/></svg>`;
    // ★ مخفی کردن خودکار کنترل‌ها بعد از 5 ثانیه (قبلاً 15 بود)
    if (playerWrap) {
      clearTimeout(hideControlsTimer);
      hideControlsTimer = setTimeout(() => {
        if (video && !video.paused) {
          playerWrap.classList.add('playing');
        }
      }, 5000);
    }
  } else {
    if (center) center.classList.remove('hidden');
    if (ppBtn) ppBtn.innerHTML = `<svg class="icon icon-md" style="fill:rgba(255,255,255,0.85);stroke:none;"><use href="#ico-play"/></svg>`;
    if (playerWrap) {
      playerWrap.classList.remove('playing');
      clearTimeout(hideControlsTimer);
    }
  }
}

export function updateVolumeIcon() {
  const video = window.__realVideo;
  const vBtn = document.getElementById('volumeBtn');
  if (!video || !vBtn) return;
  if (video.muted || video.volume === 0) {
    vBtn.innerHTML = `<svg class="icon icon-md"><use href="#ico-volume-x"/></svg>`;
    vBtn.setAttribute('title', 'Unmute');
  } else {
    vBtn.innerHTML = `<svg class="icon icon-md"><use href="#ico-volume"/></svg>`;
    vBtn.setAttribute('title', 'Mute');
  }
}

export function toggleMute(e) {
  if (e) e.stopPropagation();
  const video = window.__realVideo;
  if (!video) return;
  video.muted = !video.muted;
  updateVolumeIcon();
}

/* ============================================
   PLAYER TAP
============================================ */
let lastTapTime = 0;
let singleTapTimer = null;
let seekAccumulator = 0;
let seekTimer = null;

export function handlePlayerTap(e) {
  if (e.target.closest('button') || e.target.closest('select') || e.target.closest('.player-progress')) return;

  const playerWrap = document.querySelector('.player-wrap');
  if (!playerWrap) return;

  const video = window.__realVideo;
  if (!video) return;

  const now = Date.now();
  const timeSinceLastTap = now - lastTapTime;
  lastTapTime = now;

  if (timeSinceLastTap < 300) {
    clearTimeout(singleTapTimer);

    const rect = playerWrap.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;

    const leftZone = width * 0.35;
    const rightZone = width * 0.65;

    let delta = 0;
    let dir = null;

    if (clickX < leftZone) {
      delta = -10;
      dir = 'left';
    } else if (clickX > rightZone) {
      delta = 10;
      dir = 'right';
    }

    if (delta !== 0) {
      seekAccumulator += delta;
      showSeekFeedback(playerWrap, dir, Math.abs(seekAccumulator));

      clearTimeout(seekTimer);
      seekTimer = setTimeout(() => {
        const newTime = video.currentTime + seekAccumulator;
        video.currentTime = Math.max(0, Math.min(video.duration || Infinity, newTime));
        seekAccumulator = 0;
      }, 220);
    }
    return;
  }

  clearTimeout(singleTapTimer);
  singleTapTimer = setTimeout(() => {
    if (video.paused) {
      togglePlay();
      return;
    }

    // ★ toggle بین نمایش و مخفی کنترل‌ها
    if (playerWrap.classList.contains('playing')) {
      playerWrap.classList.remove('playing');
      clearTimeout(hideControlsTimer);
      hideControlsTimer = setTimeout(() => {
        if (video && !video.paused) {
          playerWrap.classList.add('playing');
        }
      }, 5000);
    } else {
      playerWrap.classList.add('playing');
      clearTimeout(hideControlsTimer);
      // ★ بعد از 5 ثانیه دوباره مخفی کن
      hideControlsTimer = setTimeout(() => {
        if (video && !video.paused) {
          playerWrap.classList.add('playing');
        }
      }, 5000);
    }
  }, 300);
}

function showSeekFeedback(playerWrap, direction, seconds = 10) {
  const existing = playerWrap.querySelector('.seek-feedback');

  if (existing && existing.classList.contains(`seek-${direction}`)) {
    const span = existing.querySelector('span');
    if (span) span.textContent = `${seconds}s`;

    clearTimeout(existing.__removeTimer);
    existing.__removeTimer = setTimeout(() => {
      existing.classList.remove('show');
      setTimeout(() => existing.remove(), 300);
    }, 600);
    return;
  }

  playerWrap.querySelectorAll('.seek-feedback').forEach(el => el.remove());

  const fb = document.createElement('div');
  fb.className = `seek-feedback seek-${direction}`;

  if (direction === 'left') {
    fb.innerHTML = `
      <svg class="icon icon-lg" style="fill:#fff;stroke:none;">
        <use href="#ico-skip-b"/>
      </svg>
      <span>${seconds}s</span>
    `;
  } else {
    fb.innerHTML = `
      <span>${seconds}s</span>
      <svg class="icon icon-lg" style="fill:#fff;stroke:none;">
        <use href="#ico-skip-f"/>
      </svg>
    `;
  }

  playerWrap.appendChild(fb);
  requestAnimationFrame(() => fb.classList.add('show'));

  fb.__removeTimer = setTimeout(() => {
    fb.classList.remove('show');
    setTimeout(() => fb.remove(), 300);
  }, 600);
}

export function seekPlayer(e) {
  e.stopPropagation();
  const video = window.__realVideo;
  if (!video || !video.duration || isNaN(video.duration)) return;

  const bar = e.currentTarget;
  const rect = bar.getBoundingClientRect();
  const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));

  video.currentTime = pct * video.duration;

  const el = document.getElementById('playerProgress');
  if (el) el.style.width = (pct * 100) + '%';
}

export function updatePlayerTime() {
  const video = window.__realVideo;
  if (!video) return;
  const progressFill = document.getElementById('playerProgress');
  if (progressFill && video.duration && !isNaN(video.duration)) {
    progressFill.style.width = ((video.currentTime / video.duration) * 100) + '%';
  }
  const timeEl = document.querySelector('.player-time');
  if (timeEl && video.duration && !isNaN(video.duration)) {
    timeEl.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
  }
}

/* ============================================
   QUALITY SELECTOR
============================================ */
export function initQualitySelector(ep, defaultQuality) {
  const qualitySelect = document.querySelector('select[title="Quality"]');
  if (!qualitySelect) return;

  if (ep.qualities && ep.qualities.length > 0) {
    qualitySelect.innerHTML = ep.qualities.map((q, i) =>
      `<option value="${q.url}" ${q.label === defaultQuality.label ? 'selected' : ''}>${q.label}</option>`
    ).join('');
  }

  qualitySelect.onchange = (e) => {
    const video = window.__realVideo;
    if (!video) return;

    const newUrl = e.target.value;
    if (!newUrl || video.src === newUrl) return;

    const currentTime = video.currentTime;
    const wasPlaying = !video.paused;
    const currentRate = video.playbackRate;

    video.src = newUrl;
    video.load();

    video.addEventListener('loadedmetadata', function onLoad() {
      video.currentTime = currentTime;
      video.playbackRate = currentRate;
      if (wasPlaying) video.play().catch(()=>{});
      video.removeEventListener('loadedmetadata', onLoad);
    });
  };
}

/* ============================================
   SPEED SELECTOR
============================================ */
export function initSpeedSelector() {
  const speedSelect = document.querySelector('select[title="Playback speed"]');
  if (!speedSelect) return;

  speedSelect.value = '1×';

  speedSelect.onchange = (e) => {
    const video = window.__realVideo;
    if (!video) return;

    const speedStr = e.target.value.replace('×', '').trim();
    const speed = parseFloat(speedStr);

    if (!isNaN(speed) && speed > 0) {
      video.playbackRate = speed;
    }
  };
}

/* ============================================
   FULLSCREEN
============================================ */
export function toggleFullscreen(e) {
  if (e) e.stopPropagation();
  const playerWrap = document.querySelector('.player-wrap');
  if (!playerWrap) return;

  const isFs = document.fullscreenElement || document.webkitFullscreenElement;

  if (!isFs) {
    const req = playerWrap.requestFullscreen || playerWrap.webkitRequestFullscreen;
    if (req) {
      const result = req.call(playerWrap);
      if (result && result.catch) result.catch(() => {});
    }
    setTimeout(() => {
      if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape').catch(() => {});
      } else if (screen.lockOrientation) {
        screen.lockOrientation('landscape').catch(() => {});
      }
    }, 100);
  } else {
    const exit = document.exitFullscreen || document.webkitExitFullscreen;
    if (exit) exit.call(document);
    setTimeout(() => {
      if (screen.orientation && screen.orientation.unlock) {
        try { screen.orientation.unlock(); } catch (err) {}
      } else if (screen.unlockOrientation) {
        try { screen.unlockOrientation(); } catch (err) {}
      }
    }, 100);
  }
}

export function bindFullscreenChange() {
  document.addEventListener('fullscreenchange', () => {
    const btn = document.getElementById('fullscreenBtn');
    if (!btn) return;
    if (document.fullscreenElement) {
      btn.innerHTML = `<svg class="icon icon-md"><use href="#ico-minimize"/></svg>`;
      if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape').catch(() => {});
      }
    } else {
      btn.innerHTML = `<svg class="icon icon-md"><use href="#ico-maximize"/></svg>`;
      if (screen.orientation && screen.orientation.unlock) {
        try { screen.orientation.unlock(); } catch (err) {}
      }
    }
  });
}

/* ============================================
   NEXT EPISODE
============================================ */
export function playNextEpisode(e) {
  if (e) e.stopPropagation();
  const anime = window.__currentAnime;
  const currentEp = window.__currentEpisode;
  if (!anime || !currentEp) return;

  const nextEp = anime.episodes.find(ep => ep.num === currentEp.num + 1);
  if (!nextEp) {
    alert('این آخرین قسمت این انیمه هست.');
    return;
  }
  window.openEpisode(anime.id, nextEp.num);
}

/* ============================================
   KEYBOARD SHORTCUTS (Desktop)
============================================ */
export function bindPlayerKeyboard() {
  document.addEventListener('keydown', (e) => {
    if (window.__currentPage !== 'watch') return;

    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

    const video = window.__realVideo;
    if (!video) return;

    if (e.code === 'ArrowRight') {
      e.preventDefault();
      video.currentTime = Math.min(video.duration || 0, video.currentTime + 10);
      showSeekFeedbackSimple('right', 10);
    }
    else if (e.code === 'ArrowLeft') {
      e.preventDefault();
      video.currentTime = Math.max(0, video.currentTime - 10);
      showSeekFeedbackSimple('left', 10);
    }
    else if (e.code === 'Space') {
      e.preventDefault();
      togglePlay();
    }
  });
}

function showSeekFeedbackSimple(direction, seconds) {
  const playerWrap = document.querySelector('.player-wrap');
  if (!playerWrap) return;

  playerWrap.querySelectorAll('.seek-feedback').forEach(el => el.remove());

  const fb = document.createElement('div');
  fb.className = `seek-feedback seek-${direction}`;

  if (direction === 'left') {
    fb.innerHTML = `
      <svg class="icon icon-lg" style="fill:#fff;stroke:none;"><use href="#ico-skip-b"/></svg>
      <span>${seconds}s</span>
    `;
  } else {
    fb.innerHTML = `
      <span>${seconds}s</span>
      <svg class="icon icon-lg" style="fill:#fff;stroke:none;"><use href="#ico-skip-f"/></svg>
    `;
  }

  playerWrap.appendChild(fb);
  requestAnimationFrame(() => fb.classList.add('show'));

  setTimeout(() => {
    fb.classList.remove('show');
    setTimeout(() => fb.remove(), 300);
  }, 600);
}

/* ============================================
   MOUSE MOVE → نمایش Controls (فقط دسکتاپ)
============================================ */
export function bindPlayerMouseMove() {
  // ★ فقط روی دستگاه‌های دسکتاپ (بدون touch) فعال باشه
  if (window.matchMedia('(pointer: coarse)').matches) return;

  document.addEventListener('mousemove', (e) => {
    if (window.__currentPage !== 'watch') return;

    const playerWrap = document.querySelector('.player-wrap');
    if (!playerWrap) return;

    if (!e.target.closest('.player-wrap')) return;

    playerWrap.classList.remove('playing');

    if (window.__hideControlsTimer) {
      clearTimeout(window.__hideControlsTimer);
    }

    window.__hideControlsTimer = setTimeout(() => {
      const v = window.__realVideo;
      if (v && !v.paused) {
        playerWrap.classList.add('playing');
      }
    }, 5000);
  });
}