/* ============================================
   ANIVORA — COMPONENTS
   card, player, download menu
============================================ */

import { isInList, toggleList } from './core.js';
import { formatTime, showToast } from './core.js';
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
   PLAYER
============================================ */
let isPlaying = false;
let hideControlsTimer = null;

export function togglePlay(e) {
  if (e) e.stopPropagation();
  const video = window.__realVideo;
  if (video) {
    if (video.paused) video.play().catch(err => console.log(err));
    else video.pause();
    isPlaying = !video.paused;
    updatePlayerUI();
    return;
  }
  isPlaying = !isPlaying;
  updatePlayerUI();
}

export function updatePlayerUI() {
  const center = document.getElementById('playerCenter');
  const ppBtn = document.getElementById('playPauseBtn');
  const playerWrap = document.querySelector('.player-wrap');

  if (isPlaying) {
    center?.classList.add('hidden');
    if (ppBtn) ppBtn.innerHTML = `<svg class="icon icon-md" style="fill:rgba(255,255,255,0.85);stroke:none;"><use href="#ico-pause"/></svg>`;
    playerWrap?.classList.add('playing');
  } else {
    center?.classList.remove('hidden');
    if (ppBtn) ppBtn.innerHTML = `<svg class="icon icon-md" style="fill:rgba(255,255,255,0.85);stroke:none;"><use href="#ico-play"/></svg>`;
    playerWrap?.classList.remove('playing');
  }
}

export function handlePlayerTap(e) {
  if (e.target.closest('button') || e.target.closest('select') || e.target.closest('.player-progress')) return;
  const playerWrap = document.querySelector('.player-wrap');
  if (!playerWrap) return;
  if (!isPlaying) { togglePlay(); return; }
  playerWrap.classList.toggle('playing');
}

export function seekPlayer(e) {
  e.stopPropagation();
  const bar = e.currentTarget;
  const rect = bar.getBoundingClientRect();
  const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  const video = window.__realVideo;
  if (video && video.duration) video.currentTime = pct * video.duration;
  const el = document.getElementById('playerProgress');
  if (el) el.style.width = (pct * 100) + '%';
}

export function updatePlayerTime() {
  const video = window.__realVideo;
  if (!video) return;
  const progressFill = document.getElementById('playerProgress');
  if (progressFill && video.duration) {
    progressFill.style.width = ((video.currentTime / video.duration) * 100) + '%';
  }
  const timeEl = document.querySelector('.player-time');
  if (timeEl && video.duration) {
    timeEl.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
  }
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
    if (req) req.call(playerWrap).catch(() => {});
  } else {
    const exit = document.exitFullscreen || document.webkitExitFullscreen;
    if (exit) exit.call(document);
  }
}

export function bindFullscreenChange() {
  document.addEventListener('fullscreenchange', () => {
    const btn = document.getElementById('fullscreenBtn');
    if (!btn) return;
    btn.innerHTML = document.fullscreenElement
      ? `<svg class="icon icon-md"><use href="#ico-minimize"/></svg>`
      : `<svg class="icon icon-md"><use href="#ico-maximize"/></svg>`;
  });
}