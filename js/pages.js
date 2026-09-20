/* ============================================
   ANIVORA — PAGES
   منطق و init همه صفحات
============================================ */

import { ANIME_DATA, CONTINUE_WATCHING, CHARACTERS, STAFF_DATA, CALENDAR_DATA, REVIEWS } from './data.js';
import {
  showPage, updateBottomNav, triggerPageLoader,
  isInList, isLiked, toggleList, toggleLike, showToast, shuffle,
  getStore
} from './core.js';
import {
  renderAnimeCard, populateSection, toggleDownloadMenu,
  shareAnime, updatePlayerTime, togglePlay, toggleFullscreen
} from './components.js';

/* ============================================
   STATE (برای فیلترها)
============================================ */
let activeFilters = [];
let watchlistFilter = 'all';

/* ============================================
   HOME PAGE
============================================ */
export function initHome() {
  initContinueWatching();
  populateSection('trendingRow', shuffle(ANIME_DATA).slice(0, 10));
  populateSection('newEpsRow', shuffle(ANIME_DATA).slice(0, 8));
  populateSection('ratedRow', [...ANIME_DATA].sort((a,b) => b.score - a.score).slice(0, 8));
  populateSection('seasonalGrid', shuffle(ANIME_DATA).slice(0, 16));
}

function initContinueWatching() {
  const row = document.getElementById('continueRow');
  if (!row || typeof CONTINUE_WATCHING === 'undefined') return;
  row.innerHTML = CONTINUE_WATCHING.map(d => `
    <div class="continue-card" onclick="openEpisode(${d.animeId}, ${d.epNum})">
      <div class="continue-thumb">
        <img src="${d.img}" alt="" loading="lazy">
        <div class="continue-overlay">
          <div class="play-circle">
            <svg style="width:20px;height:20px;fill:#fff;stroke:none;display:block;transform:translateX(2px);"><use href="#ico-play"/></svg>
          </div>
        </div>
        <div class="continue-ep-badge">${d.ep}</div>
        <div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${d.progress}%;"></div></div>
      </div>
      <div class="continue-body">
        <div class="continue-title">${d.title}</div>
        <div class="continue-time-left">${d.timeLeft} remaining</div>
      </div>
    </div>
  `).join('');
}

/* ============================================
   EXPLORE PAGE
============================================ */
export function initExplore() {
  filterResults();
}

export function toggleClearBtn() {
  const input = document.getElementById('mainSearchInput');
  const btn = document.getElementById('searchClearBtn');
  if (!input || !btn) return;
  if (input.value.length > 0) btn.classList.add('visible');
  else btn.classList.remove('visible');
}

export function clearSearch() {
  const input = document.getElementById('mainSearchInput');
  if (!input) return;
  input.value = '';
  input.focus();
  toggleClearBtn();
  filterResults();
}

export function addFilter(val, type) {
  if (!val) return;
  const key = `${type}: ${val}`;
  if (!activeFilters.find(f => f.key === key)) {
    activeFilters.push({ key, type, val });
    renderActiveFilters();
    filterResults();
  }
}

export function renderActiveFilters() {
  const el = document.getElementById('activeFilters');
  if (!el) return;
  el.innerHTML = activeFilters.map((f, i) => `
    <span class="active-filter-tag">${f.key}
      <span class="active-filter-remove" onclick="removeFilter(${i})">
        <svg style="width:13px;height:13px;"><use href="#ico-x"/></svg>
      </span>
    </span>`).join('');
}

export function removeFilter(idx) {
  activeFilters.splice(idx, 1);
  renderActiveFilters();
  filterResults();
}

export function filterResults() {
  const q = (document.getElementById('mainSearchInput')?.value || '').toLowerCase();
  let res = [...ANIME_DATA];
  if (q) res = res.filter(a => a.title.toLowerCase().includes(q) || (a.jp || '').toLowerCase().includes(q));

  activeFilters.forEach(f => {
    if (f.type === 'Type') res = res.filter(a => a.type === f.val);
    if (f.type === 'Status') res = res.filter(a => a.status === f.val);
    if (f.type === 'Genre') res = res.filter(a => a.genres.includes(f.val));
  });

  const grid = document.getElementById('resultsGrid');
  const cnt = document.getElementById('resultCount');
  if (grid) grid.innerHTML = res.map(a => renderAnimeCard(a)).join('');
  if (cnt) cnt.textContent = res.length;
}

/* ============================================
   DETAIL PAGE
============================================ */
export function openAnimeDetail(animeId) {
  const anime = ANIME_DATA.find(a => a.id === animeId);
  if (!anime) return;
  window.__currentAnime = anime;

  const posterImg = document.querySelector('#page-detail .detail-poster img');
  if (posterImg) posterImg.src = anime.img;

  document.querySelector('.detail-jp-title').textContent = anime.jp || '';
  document.querySelector('.detail-title').textContent = anime.title;

  document.querySelector('.detail-stats-row').innerHTML = `
    <div class="detail-stat">
      <span class="detail-stat-label">Score</span>
      <span class="detail-stat-value" style="color:var(--gold);display:flex;align-items:center;gap:4px;">
        <svg class="icon icon-sm" style="fill:var(--gold);stroke:none;"><use href="#ico-star"/></svg> ${anime.score}
      </span>
    </div>
    <div class="detail-stat"><span class="detail-stat-label">Year</span><span class="detail-stat-value">${anime.year}</span></div>
    <div class="detail-stat"><span class="detail-stat-label">Status</span><span class="status-badge ${anime.status === 'Airing' ? 'status-airing' : 'status-finished'}">${anime.status}</span></div>
    <div class="detail-stat"><span class="detail-stat-label">Episodes</span><span class="detail-stat-value">${anime.eps}</span></div>
    <div class="detail-stat"><span class="detail-stat-label">Type</span><span class="detail-stat-value">${anime.type}</span></div>
    <div class="detail-stat"><span class="detail-stat-label">Duration</span><span class="detail-stat-value">${anime.duration || '24 min'}</span></div>
    <div class="detail-stat"><span class="detail-stat-label">Studio</span><span class="detail-stat-value">${anime.studio || '-'}</span></div>
  `;

  const genreColors = {
    'Action':'genre-action','Fantasy':'genre-fantasy','Drama':'genre-drama',
    'Romance':'genre-romance','Sci-Fi':'genre-scifi','Horror':'genre-horror',
    'Comedy':'genre-comedy','Military':'genre-scifi','Supernatural':'genre-fantasy'
  };
  document.querySelector('.detail-genres-row').innerHTML = anime.genres.map(g => {
    const cls = genreColors[g] || 'badge-genre';
    return `<span class="tag ${cls}">${g}</span>`;
  }).join('');

  const desc = document.getElementById('detailDesc');
  desc.textContent = anime.description || 'No description available.';
  desc.classList.add('collapsed');
  document.getElementById('readMoreBtn').textContent = 'Read More';

  const backdrop = document.querySelector('.detail-backdrop img');
  if (backdrop && anime.backdrop) backdrop.src = anime.backdrop;

  renderDetailActions(anime);
  renderDetailEpisodes(anime);
  renderCharsAndStaff();
  renderReviews();
  showPage('detail');
}

function renderDetailActions(anime) {
  const row = document.querySelector('.detail-actions-row');
  if (!row) return;
  const added = isInList(anime.id);
  const liked = isLiked(anime.id);

  row.innerHTML = `
    <button class="btn btn-primary" onclick="watchAnime(${anime.id})">
      <svg class="icon icon-sm" style="fill:#fff;stroke:none;"><use href="#ico-play"/></svg>Watch Now
    </button>
    <button class="btn btn-ghost ${added ? 'is-added' : ''}" data-add-btn="${anime.id}" onclick="toggleList(${anime.id}, this)">
      <svg class="icon icon-sm"><use href="#${added ? 'ico-check' : 'ico-plus'}"/></svg> ${added ? 'Added' : 'Add to List'}
    </button>
    <button class="btn btn-ghost btn-icon ${liked ? 'is-liked' : ''}" data-like-btn="${anime.id}" onclick="toggleLike(${anime.id}, this)" title="Like">
      <svg class="icon icon-md"><use href="#${liked ? 'ico-heart-fill' : 'ico-heart'}"/></svg>
    </button>
    <button class="btn btn-ghost btn-icon" onclick="shareAnime(${anime.id})" title="Share">
      <svg class="icon icon-md"><use href="#ico-share"/></svg>
    </button>
    <button class="btn btn-ghost btn-icon" onclick="toggleDownloadMenu(event, ${anime.id}, 1)" title="Download">
      <svg class="icon icon-md"><use href="#ico-download"/></svg>
    </button>
    <div class="download-menu" id="dlMenuDetail"></div>
  `;
}

export function renderDetailEpisodes(anime) {
  const grid = document.getElementById('episodesGrid');
  if (!grid) return;
  document.querySelector('.season-count-badge').textContent = `${anime.episodes.length} Episodes`;
  grid.innerHTML = anime.episodes.map(ep => `
    <div class="episode-row" onclick="openEpisode(${anime.id}, ${ep.num})">
      <div class="ep-thumb" style="background:linear-gradient(135deg,var(--bg-elevated),var(--bg-card));">
        <div class="ep-play"><svg class="icon icon-md" style="fill:#fff;stroke:none;"><use href="#ico-play"/></svg></div>
      </div>
      <div class="ep-info">
        <div class="ep-number">Episode ${ep.num}</div>
        <div class="ep-title">${ep.title}</div>
        <div class="ep-duration">${ep.duration}</div>
      </div>
    </div>
  `).join('');
}

export function renderCharsAndStaff() {
  const grid = document.getElementById('charGrid');
  if (grid && typeof CHARACTERS !== 'undefined') {
    grid.innerHTML = CHARACTERS.map(c => `
      <div class="detail-person-card">
        <img src="${c.img}" alt="">
        <div>
          <div class="detail-person-name">${c.name}</div>
          <div class="detail-person-role">${c.role}</div>
        </div>
      </div>`).join('');
  }
  const staff = document.getElementById('staffGrid');
  if (staff && typeof STAFF_DATA !== 'undefined') {
    staff.innerHTML = STAFF_DATA.map(s => `
      <div class="detail-person-card">
        <img src="${s.img}" alt="">
        <div>
          <div class="detail-person-name">${s.name}</div>
          <div class="detail-person-role">${s.role}</div>
        </div>
      </div>`).join('');
  }
}

export function renderReviews() {
  const list = document.getElementById('reviewsList');
  if (!list || typeof REVIEWS === 'undefined') return;
  list.innerHTML = REVIEWS.map(r => `
    <div class="review-card">
      <div class="review-header">
        <div class="review-avatar">${r.initial}</div>
        <div>
          <div class="review-user">${r.user}</div>
          <div class="review-date">${r.date}</div>
        </div>
        <div class="review-score">
          <svg style="width:13px;height:13px;fill:var(--gold);stroke:none;"><use href="#ico-star"/></svg> ${r.score}/10
        </div>
      </div>
      <p class="review-text">${r.text}</p>
    </div>`).join('');
}

export function toggleDesc() {
  const desc = document.getElementById('detailDesc');
  const btn = document.getElementById('readMoreBtn');
  if (!desc || !btn) return;
  desc.classList.toggle('collapsed');
  btn.textContent = desc.classList.contains('collapsed') ? 'Read More' : 'Show Less';
}

export function switchTab(btn, panelId) {
  btn.closest('.detail-tabs').querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  btn.closest('.detail-main').querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.getElementById(panelId).classList.add('active');
}

export function switchProfileTab(btn, panelId) {
  btn.closest('.profile-tabs').querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.profile-content .tab-panel').forEach(p => p.classList.remove('active'));
  document.getElementById(panelId).classList.add('active');
}

/* ============================================
   WATCH PAGE
============================================ */
export function openEpisode(animeId, epNum) {
  const anime = ANIME_DATA.find(a => a.id === animeId);
  if (!anime) return;
  const ep = anime.episodes.find(e => e.num === epNum);
  if (!ep) return;

  window.__currentAnime = anime;
  window.__currentEpisode = ep;

  showPage('watch');

  setTimeout(() => {
    loadEpisodeInPlayer(anime, ep);
    renderWatchSidebar(anime, epNum);
    renderUpNext(anime, epNum);
    renderWatchActions(anime, ep);
  }, 100);
}

export function watchAnime(animeId) {
  const anime = ANIME_DATA.find(a => a.id === animeId);
  if (!anime || !anime.episodes || anime.episodes.length === 0) return;
  openEpisode(animeId, anime.episodes[0].num);
}

function loadEpisodeInPlayer(anime, ep) {
  document.querySelector('.watch-ep-title').textContent = `Episode ${ep.num}: "${ep.title}"`;
  document.querySelector('.watch-ep-label').textContent = `${anime.title} · Season 1`;
  document.querySelector('.watch-ep-desc').textContent = anime.description || '';

  const playerWrap = document.querySelector('.player-wrap');
  if (!playerWrap) return;

  const oldVideo = playerWrap.querySelector('video');
  if (oldVideo) oldVideo.remove();

  const video = document.createElement('video');
  video.id = 'realVideo';
  video.src = ep.videoUrl;
  video.controls = false;
  video.playsInline = true;
  video.preload = 'metadata';
  video.setAttribute('playsinline', '');
  video.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:contain;background:#000;z-index:2;';

  playerWrap.insertBefore(video, playerWrap.firstChild);

  const bg = playerWrap.querySelector('.player-bg');
  if (bg) bg.style.display = 'none';

  window.__realVideo = video;

  const center = document.getElementById('playerCenter');
  if (center) center.classList.remove('hidden');

  video.addEventListener('timeupdate', updatePlayerTime);
  video.addEventListener('loadedmetadata', updatePlayerTime);
}

function renderWatchActions(anime, ep) {
  const wrap = document.getElementById('watchActionsRow');
  if (!wrap) return;
  const added = isInList(anime.id);
  const liked = isLiked(anime.id);

  wrap.innerHTML = `
    <button class="btn btn-ghost btn-sm ${liked ? 'is-liked' : ''}" data-like-btn="${anime.id}" onclick="toggleLike(${anime.id}, this)">
      <svg class="icon icon-sm"><use href="#${liked ? 'ico-heart-fill' : 'ico-heart'}"/></svg>
      <span class="like-label">${liked ? 'Liked' : 'Like'}</span>
    </button>
    <button class="btn btn-ghost btn-sm ${added ? 'is-added' : ''}" data-add-btn="${anime.id}" onclick="toggleList(${anime.id}, this)">
      <svg class="icon icon-sm"><use href="#${added ? 'ico-check' : 'ico-plus'}"/></svg>
      <span class="add-label">${added ? 'Added' : 'Add to List'}</span>
    </button>
    <button class="btn btn-ghost btn-sm" onclick="shareAnime(${anime.id})">
      <svg class="icon icon-sm"><use href="#ico-share"/></svg> Share
    </button>
    <button class="btn btn-ghost btn-sm" onclick="toggleDownloadMenu(event, ${anime.id}, ${ep.num})">
      <svg class="icon icon-sm"><use href="#ico-download"/></svg> Download
    </button>
    <div class="download-menu" id="dlMenuWatch"></div>
  `;
}

function renderWatchSidebar(anime, currentEpNum) {
  const list = document.getElementById('sidebarEpList');
  if (!list) return;
  list.innerHTML = anime.episodes.map(ep => `
    <div class="sidebar-ep-item ${ep.num === currentEpNum ? 'active' : ''}" onclick="openEpisode(${anime.id}, ${ep.num})">
      <div class="sidebar-ep-thumb">
        <svg class="icon icon-sm"><use href="#ico-play"/></svg>
      </div>
      <div class="sidebar-ep-info">
        <div class="sidebar-ep-num">Ep ${ep.num}</div>
        <div class="sidebar-ep-name">${ep.title}</div>
        <div class="sidebar-ep-dur">${ep.duration}</div>
      </div>
    </div>
  `).join('');
}

function renderUpNext(anime, currentEpNum) {
  const row = document.getElementById('upNextRow');
  if (!row) return;
  const nextEps = anime.episodes.filter(e => e.num > currentEpNum).slice(0, 4);
  if (nextEps.length === 0) {
    row.innerHTML = '<div style="color:var(--text-muted);padding:12px;font-size:13px;">No more episodes.</div>';
    return;
  }
  row.innerHTML = nextEps.map(ep => `
    <div class="up-next-card" onclick="openEpisode(${anime.id}, ${ep.num})">
      <div class="up-next-thumb">
        <svg class="icon icon-lg"><use href="#ico-play"/></svg>
      </div>
      <div class="up-next-body">
        <div class="up-next-ep">Episode ${ep.num}</div>
        <div class="up-next-title">${ep.title}</div>
      </div>
    </div>
  `).join('');
}

/* ============================================
   WATCHLIST
============================================ */
export function initWatchlist() {
  const el = document.getElementById('watchlistContent');
  if (!el) return;

  const listIds = getStore('anivora_list');
  let items = ANIME_DATA.filter(a => listIds.includes(a.id));

  if (watchlistFilter === 'watching') items = items.filter(a => a.status === 'Airing');
  if (watchlistFilter === 'completed') items = items.filter(a => a.status === 'Finished');

  if (items.length === 0) {
    el.innerHTML = `
      <div class="watchlist-empty">
        <svg class="icon icon-xl" style="width:48px;height:48px;"><use href="#ico-bookmark"/></svg>
        No anime in this list yet. Add some from the cards!
      </div>`;
    return;
  }

  el.innerHTML = items.map(a => {
    const added = isInList(a.id);
    return `
    <div class="watchlist-item" onclick="openAnimeDetail(${a.id})">
      <img src="${a.img}" alt="">
      <div class="watchlist-item-info">
        <div class="watchlist-item-title">${a.title}</div>
        <div class="watchlist-item-meta">${a.type} · ${a.year} · ${a.eps} eps</div>
      </div>
      <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();watchAnime(${a.id})" title="Play">
        <svg class="icon icon-sm" style="fill:#fff;stroke:none;"><use href="#ico-play"/></svg>
      </button>
      <button class="btn btn-ghost btn-sm" data-add-btn="${a.id}" onclick="event.stopPropagation();toggleList(${a.id}, this)" title="Remove">
        <svg class="icon icon-sm"><use href="#${added ? 'ico-check' : 'ico-plus'}"/></svg>
      </button>
    </div>`;
  }).join('');
}

export function initWatchlistTabs() {
  const btns = document.querySelectorAll('.list-cat-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const label = btn.textContent.trim().toLowerCase();
      watchlistFilter = label === 'watching' ? 'watching' : label === 'completed' ? 'completed' : 'all';
      initWatchlist();
    });
  });
}

/* ============================================
   PROFILE
============================================ */
export function initProfile() {
  const activity = document.getElementById('recentActivity');
  if (activity) {
    const acts = [
      { title: "Jujutsu Kaisen", desc: "Watched Episode 12", time: "2 hours ago", img: "https://picsum.photos/44/44?random=501" },
      { title: "Jujutsu Kaisen", desc: "Watched Episode 11", time: "Yesterday", img: "https://picsum.photos/44/44?random=502" },
      { title: "Jujutsu Kaisen", desc: "Rated 9/10", time: "2 days ago", img: "https://picsum.photos/44/44?random=503" },
    ];
    activity.innerHTML = acts.map(a => `
      <div style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);margin-bottom:8px;">
        <img src="${a.img}" style="width:44px;height:44px;border-radius:8px;object-fit:cover;flex-shrink:0;" alt="">
        <div style="flex:1;">
          <div style="font-size:13.5px;font-weight:600;">${a.title}</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">${a.desc} · ${a.time}</div>
        </div>
        <svg class="icon icon-sm" style="color:var(--text-muted);"><use href="#ico-chevron-r"/></svg>
      </div>`).join('');
  }

  const genres = [
    { name: "Action", pct: 78 },
    { name: "Supernatural", pct: 65 },
    { name: "Drama", pct: 52 },
    { name: "Sci-Fi", pct: 40 },
    { name: "Romance", pct: 28 }
  ];
  const gp = document.getElementById('genreProgress');
  if (gp) {
    gp.innerHTML = genres.map(g => `
      <div>
        <div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:4px;">
          <span style="color:var(--text-secondary);">${g.name}</span>
          <span style="color:var(--text-primary);font-weight:600;">${g.pct}%</span>
        </div>
        <div style="height:4px;background:var(--bg-elevated);border-radius:2px;">
          <div style="height:100%;background:var(--accent);border-radius:2px;width:${g.pct}%;"></div>
        </div>
      </div>`).join('');
  }

  populateSection('favoritesGrid', shuffle(ANIME_DATA).slice(0, 8));

  const hist = document.getElementById('historyList');
  if (hist) hist.innerHTML = '<p style="color:var(--text-muted);font-size:13px;padding:12px;">No history yet.</p>';

  const tg = document.getElementById('topGenres');
  if (tg) {
    const gs = [
      { name: "Action", n: 56 }, { name: "Supernatural", n: 42 },
      { name: "Drama", n: 35 }, { name: "Sci-Fi", n: 28 }, { name: "Romance", n: 18 }
    ];
    const max = gs[0].n;
    tg.innerHTML = gs.map(g => `
      <div style="margin-bottom:10px;">
        <div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:3px;">
          <span style="color:var(--text-secondary);">${g.name}</span>
          <span style="color:var(--text-primary);font-weight:600;">${g.n}</span>
        </div>
        <div style="height:3px;background:var(--bg-elevated);border-radius:2px;">
          <div style="height:100%;background:var(--accent);border-radius:2px;width:${(g.n / max) * 100}%;"></div>
        </div>
      </div>`).join('');
  }

  const sd = document.getElementById('scoreDist');
  if (sd) {
    const scores = [
      { s: "10", n: 8 }, { s: "9", n: 18 }, { s: "8", n: 25 },
      { s: "7", n: 14 }, { s: "6", n: 7 }, { s: "5", n: 3 }, { s: "≤4", n: 1 }
    ];
    const max = 25;
    sd.innerHTML = scores.map(s => `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
        <span style="font-size:11.5px;color:var(--text-muted);width:24px;text-align:right;">${s.s}</span>
        <div style="flex:1;height:14px;background:var(--bg-elevated);border-radius:3px;overflow:hidden;">
          <div style="height:100%;background:var(--accent);border-radius:3px;width:${(s.n / max) * 100}%;opacity:0.85;"></div>
        </div>
        <span style="font-size:11px;color:var(--text-muted);width:20px;">${s.n}</span>
      </div>`).join('');
  }

  const wby = document.getElementById('watchByYear');
  if (wby) {
    const years = [
      { y: "2024", n: 24 }, { y: "2023", n: 38 }, { y: "2022", n: 42 },
      { y: "2021", n: 30 }, { y: "2020", n: 28 }
    ];
    const max = 42;
    wby.innerHTML = years.map(y => `
      <div style="margin-bottom:10px;">
        <div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:3px;">
          <span style="color:var(--text-secondary);">${y.y}</span>
          <span style="color:var(--text-primary);font-weight:600;">${y.n} anime</span>
        </div>
        <div style="height:3px;background:var(--bg-elevated);border-radius:2px;">
          <div style="height:100%;background:var(--accent);border-radius:2px;width:${(y.n / max) * 100}%;"></div>
        </div>
      </div>`).join('');
  }
}

/* ============================================
   CALENDAR
============================================ */
export function initCalendar() {
  const grid = document.getElementById('calendarGrid');
  if (!grid || typeof CALENDAR_DATA === 'undefined') return;
  const days = Object.keys(CALENDAR_DATA);
  const today = "Saturday";

  grid.innerHTML = days.map(day => `
    <div class="cal-day ${day === today ? 'today' : ''}">
      <div class="cal-day-header">${day.slice(0, 3)}</div>
      ${CALENDAR_DATA[day].map(show => `
        <div class="cal-anime-item">
          <div class="cal-anime-info">
            <div class="cal-anime-name">${show.title}</div>
            <div class="cal-anime-ep">${show.ep}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `).join('');
}