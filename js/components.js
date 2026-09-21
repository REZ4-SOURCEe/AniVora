/* ============================================
   ANIVORA — COMPONENTS
   card, player, download menu
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
  const added = isInList(a.id);
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
        <div class="card-poster-overlay">
          <button class="card-watch-btn" onclick="event.stopPropagation();watchAnime(${a.id})">
            <svg class="icon icon-sm" style="fill:#fff;stroke:none;"><use href="#ico-play"/></svg> Watch
          </button>
          <button class="card-list-btn ${added ? 'is-added' : ''}" data-add-btn="${a.id}"
                  onclick="event.stopPropagation();toggleList(${a.id}, this)">
            <svg class="icon icon-sm"><use href="#${added ? 'ico-check' : 'ico-plus'}"/></svg> ${added ? 'Added' : 'Add'}
          </button>
        </div>
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
   DOWNLOAD MENU
============================================ */
export function toggleDownloadMenu(e, animeId, epNum) {
  if (e) e.stopPropagation();
  const anime = ANIME_DATA.find(a => a.id === animeId);
  if (!anime) return;

  const ep = anime.episodes.find(x => x.num === epNum) || anime.episodes[0];
  if (!ep) return;

  const qualities = (ep.qualities && ep.qualities.length)
    ? ep.qualities
    : [{ label: '1080p', url: ep.videoUrl }];

  document.querySelectorAll('.download-menu.open').forEach(m => m.classList.remove('open'));

  const btn = e ? e.currentTarget : null;
  let menu;
  if (btn && btn.parentElement) {
    menu = btn.parentElement.querySelector('.download-menu');
    if (!menu) {
      menu = document.createElement('div');
      menu.className = 'download-menu';
      btn.parentElement.appendChild(menu);
    }
  } else {
    menu = document.getElementById('dlMenuDetail');
  }
  if (!menu) return;

  menu.innerHTML = `
    <div class="download-menu-header">Download · Ep ${ep.num}</div>
    ${qualities.map(q => `
      <a class="download-menu-item" href="${q.url}" download target="_blank" rel="noopener" onclick="event.stopPropagation()">
        <svg class="icon icon-sm"><use href="#ico-download"/></svg>
        <span>${q.label}</span>
        <span class="download-menu-size">MKV</span>
      </a>
    `).join('')}
  `;
  menu.classList.add('open');

  setTimeout(() => {
    document.addEventListener('click', closeDownloadMenusOnce, { once: true });
  }, 0);
}

function closeDownloadMenusOnce() {
  document.querySelectorAll('.download-menu.open').forEach(m => m.classList.remove('open'));
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
    if (playerWrap) {
      clearTimeout(hideControlsTimer);
      hideControlsTimer = setTimeout(() => {
        if (video && !video.paused) {
          playerWrap.classList.add('playing');
        }
      }, 3000);
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

export function handlePlayerTap(e) {
  if (e.target.closest('button') || e.target.closest('select') || e.target.closest('.player-progress')) return;
  const playerWrap = document.querySelector('.player-wrap');
  if (!playerWrap) return;

  const video = window.__realVideo;
  if (!video) return;

  if (video.paused) {
    togglePlay();
    return;
  }

  if (playerWrap.classList.contains('playing')) {
    playerWrap.classList.remove('playing');
    clearTimeout(hideControlsTimer);
    hideControlsTimer = setTimeout(() => {
      if (video && !video.paused) {
        playerWrap.classList.add('playing');
      }
    }, 3000);
  } else {
    playerWrap.classList.add('playing');
    clearTimeout(hideControlsTimer);
  }
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
   FULLSCREEN (با چرخش افقی)
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