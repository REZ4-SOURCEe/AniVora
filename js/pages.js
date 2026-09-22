/* ============================================
   ANIVORA — PAGES
============================================ */

import { ANIME_DATA, CONTINUE_WATCHING, CHARACTERS, STAFF_DATA, CALENDAR_DATA, REVIEWS,
         getTotalEpisodes, getAiredEpisodes } from './data.js';
import {
  showPage, updateBottomNav, triggerPageLoader,
  isInList, isLiked, toggleList, toggleLike, showToast, shuffle,
  getStore, formatTime,
  getListStore, getListStatus, setListStatus,
  isWatching, addToWatching, removeFromWatching, toggleWatching,
  getFavorites, removeFromFavorites,
  getLastEpisode, setLastEpisode, getLastEpNumber,
  getProgress, setProgress,
  isDropped, setDropped,
  getLastPage, setLastPage,
  getDetailState, setDetailState, clearDetailState,
  stopVideo,
  login, signup, logout, isLoggedIn, getCurrentUser, computeProfileStats,
  getUsers, saveUsers, getSession
} from './core.js';
import {
  renderAnimeCard, populateSection, toggleDownloadMenu,
  shareAnime, updatePlayerTime, togglePlay, toggleFullscreen,
  initQualitySelector, initSpeedSelector
} from './components.js';

let activeFilters = [];
let watchlistFilter = 'all';

/* ============================================
   HOME PAGE
============================================ */
export function initHome() {
  initHero();
  initContinueWatching();
  populateSection('trendingRow', shuffle(ANIME_DATA).slice(0, 10));
  populateSection('newEpsRow', shuffle(ANIME_DATA).slice(0, 8));
  populateSection('ratedRow', [...ANIME_DATA].sort((a,b) => b.score - a.score).slice(0, 8));
  populateSection('seasonalGrid', shuffle(ANIME_DATA).slice(0, 16));
}

function initHero() {
  if (!ANIME_DATA || ANIME_DATA.length === 0) return;
  const heroAnime = ANIME_DATA[Math.floor(Math.random() * ANIME_DATA.length)];
  window.__heroAnimeId = heroAnime.id;

  const heroBg = document.getElementById('heroBg');
  if (heroBg) {
    heroBg.style.backgroundImage = `url('${heroAnime.backdrop || heroAnime.img}')`;
    heroBg.style.backgroundSize = 'cover';
    heroBg.style.backgroundPosition = 'center top';
  }

  const badges = document.getElementById('heroBadges');
  if (badges) {
    const statusBadge = heroAnime.status === 'Airing'
      ? `<span class="badge badge-airing"><span class="airing-dot"></span>Airing</span>`
      : `<span class="badge badge-genre">${heroAnime.status}</span>`;
    const genreBadges = heroAnime.genres.slice(0, 3).map(g =>
      `<span class="badge badge-genre">${g}</span>`
    ).join('');
    badges.innerHTML = statusBadge + genreBadges;
  }

  const title = document.getElementById('heroTitle');
  if (title) title.textContent = heroAnime.title;

  const subtitle = document.getElementById('heroSubtitle');
  if (subtitle) subtitle.textContent = heroAnime.jp || '';

  const meta = document.getElementById('heroMeta');
  if (meta) {
    meta.innerHTML = `
      <div class="hero-rating">
        <svg class="icon icon-sm" style="fill:var(--gold);stroke:none;"><use href="#ico-star"/></svg>
        ${heroAnime.score}
      </div>
      <span style="color:var(--text-muted);font-size:12px;">·</span>
      <div class="hero-meta-item"><svg class="icon icon-sm"><use href="#ico-calendar"/></svg> ${heroAnime.year}</div>
      <div class="hero-meta-item"><svg class="icon icon-sm"><use href="#ico-tv"/></svg> ${heroAnime.eps} Episodes</div>
      <div class="hero-meta-item"><svg class="icon icon-sm"><use href="#ico-clock"/></svg> ${heroAnime.duration || '24 min'}</div>
    `;
  }

  const desc = document.getElementById('heroDesc');
  if (desc) desc.textContent = heroAnime.description || '';

  const actions = document.getElementById('heroActions');
  if (actions) {
    const status = getListStatus(heroAnime.id);
    const added = !!status;
    let addLabel = 'Add to List';
    if (status === 'watching')      addLabel = 'Watching';
    if (status === 'completed')     addLabel = 'Completed';
    if (status === 'plan_to_watch') addLabel = 'Plan to Watch';
    if (status === 'not_watched')   addLabel = 'Not Watched';

    actions.innerHTML = `
      <button class="btn btn-primary" onclick="openAnimeDetail(${heroAnime.id})">
        <svg class="icon icon-sm" style="fill:#fff;stroke:none;"><use href="#ico-play"/></svg>
        Watch Now
      </button>
      <button class="btn btn-ghost ${added ? 'is-added' : ''}" data-add-btn="${heroAnime.id}" onclick="toggleList(${heroAnime.id}, this)">
        <svg class="icon icon-sm"><use href="#${added ? 'ico-check' : 'ico-plus'}"/></svg>
        ${addLabel}
      </button>
    `;
  }
}

function initContinueWatching() {
  const row = document.getElementById('continueRow');
  if (!row || typeof CONTINUE_WATCHING === 'undefined') return;
  row.innerHTML = CONTINUE_WATCHING.map(d => `
    <div class="continue-card" onclick="openEpisode(${d.animeId}, ${d.seasonNumber || 1}, ${d.epNum})">
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
export function initExplore() { filterResults(); }

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
        <svg style="width:11px;height:11px;"><use href="#ico-x"/></svg>
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
export function openAnimeDetail(animeId, keepState = false) {
  const anime = ANIME_DATA.find(a => a.id === animeId);
  if (!anime) return;

  // ★ ذخیره state قبلی (اگه انیمه جدید باز می‌شه)
  const currentActiveTab = document.querySelector('.detail-tabs .tab-btn.active');
  const prevAnimeId = window.__currentAnimeId;

  if (!keepState && prevAnimeId && currentActiveTab && prevAnimeId !== animeId) {
    const tabText = currentActiveTab.textContent.trim();
    let tabKey = 'episodes';
    if (tabText === 'About') tabKey = 'about';
    if (tabText === 'Recommended') tabKey = 'recommended';

    if (tabKey !== 'episodes') {
      setDetailState({
        animeId: prevAnimeId,
        tab: tabKey,
        scrollY: window.scrollY
      });
    }
  }

  window.__currentAnime = anime;
  window.__currentAnimeId = animeId;

  setLastPage({ page: 'detail', animeId });

  const posterImg = document.querySelector('#page-detail .detail-poster img');
  if (posterImg) posterImg.src = anime.img;

  const genreColors = {
    'Action':'genre-action','Fantasy':'genre-fantasy','Drama':'genre-drama',
    'Romance':'genre-romance','Sci-Fi':'genre-scifi','Horror':'genre-horror',
    'Comedy':'genre-comedy','Military':'genre-scifi','Supernatural':'genre-fantasy'
  };
  document.querySelector('.detail-genres-row').innerHTML = anime.genres.map(g => {
    const cls = genreColors[g] || 'badge-genre';
    return `<span class="tag ${cls}">${g}</span>`;
  }).join('');

  document.querySelector('.detail-title').textContent = anime.title;
  document.querySelector('.detail-jp-title').textContent = anime.jp || '';

  document.querySelector('.detail-stats-row').innerHTML = `
    <div class="detail-stat">
      <span class="detail-stat-label">Score</span>
      <span class="detail-stat-value" style="color:var(--gold);display:flex;align-items:center;gap:4px;">
        <svg class="icon icon-sm" style="fill:var(--gold);stroke:none;"><use href="#ico-star"/></svg> ${anime.score}
      </span>
    </div>
    <div class="detail-stat"><span class="detail-stat-label">Year</span><span class="detail-stat-value">${anime.year}</span></div>
    <div class="detail-stat"><span class="detail-stat-label">Episodes</span><span class="detail-stat-value">${anime.eps}</span></div>
    <div class="detail-stat"><span class="detail-stat-label">Studio</span><span class="detail-stat-value">${anime.studio || '-'}</span></div>
  `;

  const backdrop = document.querySelector('.detail-backdrop img');
  if (backdrop && anime.backdrop) backdrop.src = anime.backdrop;

  renderDetailActions(anime);
  renderDetailEpisodes(anime, 1);

  // ★★★ showPage با skipHistory=true (خودمون pushState می‌زنیم)
  showPage('detail', true);

  // ★★★ pushState جدید با animeId (فقط اگه انیمه جدید باز می‌شه)
  if (!keepState) {
    const prevStateAnimeId = history.state?.animeId;
    // فقط اگه animeId با state قبلی فرق داشت، pushState بزن
    if (prevStateAnimeId !== animeId) {
      history.pushState({ page: 'detail', animeId: animeId }, '', '#detail');
    }
  }

  // ★ مدیریت تب فعال
  if (keepState) {
    const savedState = getDetailState();
    if (savedState && savedState.animeId === animeId) {
      setTimeout(() => {
        if (savedState.tab === 'about') {
          const aboutBtn = document.querySelectorAll('.detail-tabs .tab-btn')[1];
          if (aboutBtn) aboutBtn.click();
        } else if (savedState.tab === 'recommended') {
          const recBtn = document.querySelectorAll('.detail-tabs .tab-btn')[2];
          if (recBtn) recBtn.click();
        } else {
          const epBtn = document.querySelectorAll('.detail-tabs .tab-btn')[0];
          if (epBtn) epBtn.click();
        }

        if (savedState.scrollY) {
          setTimeout(() => window.scrollTo(0, savedState.scrollY), 50);
        }

        clearDetailState();
      }, 30);
      return;
    }
  }

  clearDetailState();

  const tabs = document.querySelectorAll('.detail-tabs .tab-btn');
  tabs.forEach((t, i) => {
    if (i === 0) t.classList.add('active');
    else t.classList.remove('active');
  });

  const panels = document.querySelectorAll('.detail-main .tab-panel');
  panels.forEach(p => p.classList.remove('active'));
  const epPanel = document.getElementById('tab-episodes');
  if (epPanel) epPanel.classList.add('active');

  if (window.__scrollToEpisodes) {
    window.__scrollToEpisodes = false;
    setTimeout(() => {
      const epTab = document.getElementById('tab-episodes');
      if (epTab) {
        epTab.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 200);
  }
}

function renderDetailActions(anime) {
  const row = document.querySelector('.detail-actions-row');
  if (!row) return;
  const status = getListStatus(anime.id);
  const added = !!status;
  const liked = isLiked(anime.id);

  row.innerHTML = `
    <button class="btn btn-primary" onclick="watchAnime(${anime.id})">
      <svg class="icon icon-sm" style="fill:#fff;stroke:none;"><use href="#ico-play"/></svg>Watch Now
    </button>

    <button class="btn btn-ghost" onclick="toggleDownloadMenu(event, ${anime.id}, 1)">
      <svg class="icon icon-sm"><use href="#ico-download"/></svg> Download
    </button>

    <button class="btn btn-ghost btn-icon ${added ? 'is-added' : ''}" id="detailAddBtn" title="Add to List">
      <svg class="icon icon-md"><use href="#${added ? 'ico-check' : 'ico-plus'}"/></svg>
    </button>

    <button class="btn btn-ghost btn-icon ${liked ? 'is-liked' : ''}" data-like-btn="${anime.id}" onclick="toggleLike(${anime.id}, this)" title="Like">
      <svg class="icon icon-md"><use href="#${liked ? 'ico-heart-fill' : 'ico-heart'}"/></svg>
    </button>

    <div class="download-menu" id="dlMenuDetail"></div>
  `;

  const addBtn = row.querySelector('#detailAddBtn');
  if (addBtn) {
    addBtn.setAttribute('data-add-btn', anime.id);
    addBtn.onclick = (e) => {
      e.stopPropagation();
      toggleList(anime.id, addBtn);
    };
  }

  if (window.__detailListListener) {
    window.removeEventListener('anivora:list-changed', window.__detailListListener);
  }
  window.__detailListListener = (e) => {
    if (e.detail?.animeId === anime.id) {
      const btn = document.getElementById('detailAddBtn');
      if (btn) {
        const status = getListStatus(anime.id);
        const isAdded = !!status;
        btn.classList.toggle('is-added', isAdded);
        const svg = btn.querySelector('svg use');
        if (svg) svg.setAttribute('href', isAdded ? '#ico-check' : '#ico-plus');
      }
      const currentSeason = window.__currentSeason || 1;
      renderDetailEpisodes(anime, currentSeason);
    }
  };
  window.addEventListener('anivora:list-changed', window.__detailListListener);
}

/* ★★★ رندر اپیزودها با dropdown فصل + About + Recommended ★★★ */
export function renderDetailEpisodes(anime, seasonNumber) {
  window.__currentSeason = seasonNumber || 1;

  const seasons = anime.seasons || [{
    seasonNumber: 1,
    title: "Season 1",
    episodes: anime.episodes || [],
    episodesAired: anime.episodesAired || (anime.episodes?.length || 0)
  }];

  const currentSeasonData = seasons.find(s => s.seasonNumber === window.__currentSeason) || seasons[0];
  const currentEpisodes = currentSeasonData.episodes || [];

  // ★ پر کردن dropdown menu
  const menuEl = document.getElementById('seasonDropdownMenu');
  if (menuEl) {
    menuEl.innerHTML = seasons.map(s => `
      <button class="season-dropdown-item ${s.seasonNumber === window.__currentSeason ? 'active' : ''}"
              type="button"
              onclick="switchSeason(${anime.id}, ${s.seasonNumber})">
        <span>${s.title || `Season ${s.seasonNumber}`}</span>
        <span class="season-ep-count">${s.episodes.length} EP</span>
      </button>
    `).join('');
  }

  // ★ آپدیت برچسب دکمه
  const labelEl = document.getElementById('seasonDropdownLabel');
  if (labelEl) {
    labelEl.textContent = currentSeasonData.title || `Season ${window.__currentSeason}`;
  }

  // ★ آپدیت شمارنده (فقط عدد)
  const countEl = document.getElementById('seasonCountBadge');
  if (countEl) {
    countEl.textContent = currentEpisodes.length;
    countEl.title = `${currentEpisodes.length} Episodes`;
  }

  // ★ پر کردن تب About
  const aboutDescEl = document.getElementById('tabAboutDesc');
  if (aboutDescEl) {
    aboutDescEl.textContent = anime.description || 'No description available.';
  }

  // ★ پر کردن تب Recommended بر اساس ژانرهای مشابه
  const recommendedGrid = document.getElementById('tabRecommendedGrid');
  if (recommendedGrid) {
    const currentGenres = anime.genres || [];

    // ★ فقط توی موبایل: حداکثر ۹ کارت (۳×۳) | دسکتاپ: ۱۲ کارت
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const maxCards = isMobile ? 9 : 12;

    const scored = ANIME_DATA
      .filter(a => a.id !== anime.id)
      .map(a => {
        const commonGenres = (a.genres || []).filter(g => currentGenres.includes(g));
        return { anime: a, score: commonGenres.length };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return b.anime.score - a.anime.score;
      })
      .slice(0, maxCards);

    if (scored.length === 0) {
      recommendedGrid.innerHTML = '<p style="color:var(--text-muted);font-size:13px;">No recommendations available.</p>';
    } else {
      recommendedGrid.innerHTML = scored.map(item => renderAnimeCard(item.anime)).join('');
    }
  }

  // ★ رندر اپیزودها
  const grid = document.getElementById('episodesGrid');
  if (!grid) return;

  const lastEpData = getLastEpisode(anime.id);

  grid.innerHTML = currentEpisodes.map(ep => {
    let isWatched = false;
    if (lastEpData) {
      if (lastEpData.seasonNumber > window.__currentSeason) {
        isWatched = true;
      } else if (lastEpData.seasonNumber === window.__currentSeason && ep.num <= lastEpData.epNum) {
        isWatched = true;
      }
    }

    return `
    <div class="episode-row" onclick="openEpisode(${anime.id}, ${window.__currentSeason}, ${ep.num})">
      <div class="ep-thumb">
        <img src="${ep.img || ''}" alt="" loading="lazy" onerror="this.style.display='none'">
        <div class="ep-play">
          <svg class="icon icon-md" style="fill:#fff;stroke:none;"><use href="#ico-play"/></svg>
        </div>
      </div>
      <div class="ep-info">
        <div class="ep-number">
          Episode ${ep.num}
          ${isWatched ? '<span class="ep-watched" title="Watched">✓</span>' : ''}
        </div>
        <div class="ep-title">${ep.title}</div>
        <div class="ep-duration">${ep.duration}</div>
      </div>
    </div>`;
  }).join('');
}

/* ★★★ سوییچ بین فصل‌ها ★★★ */
export function switchSeason(animeId, seasonNumber) {
  const anime = ANIME_DATA.find(a => a.id === animeId);
  if (!anime) return;

  const dd = document.getElementById('seasonDropdown');
  if (dd) dd.classList.remove('open');

  renderDetailEpisodes(anime, seasonNumber);
}

/* ★★★ توگل dropdown ★★★ */
export function toggleSeasonDropdown(e) {
  if (e) e.stopPropagation();
  const dd = document.getElementById('seasonDropdown');
  if (!dd) return;
  dd.classList.toggle('open');
}

/* ★★★ بستن dropdown با کلیک بیرون ★★★ */
document.addEventListener('click', (e) => {
  const dd = document.getElementById('seasonDropdown');
  if (!dd) return;
  if (!e.target.closest('#seasonDropdown')) {
    dd.classList.remove('open');
  }
});

window.switchSeason = switchSeason;
window.toggleSeasonDropdown = toggleSeasonDropdown;

export function renderCharsAndStaff() {
  const grid = document.getElementById('charGrid');
  if (grid && typeof CHARACTERS !== 'undefined') {
    grid.innerHTML = CHARACTERS.map(c => `
      <div class="detail-person-card">
        <img src="${c.img}" alt="">
        <div><div class="detail-person-name">${c.name}</div><div class="detail-person-role">${c.role}</div></div>
      </div>`).join('');
  }
  const staff = document.getElementById('staffGrid');
  if (staff && typeof STAFF_DATA !== 'undefined') {
    staff.innerHTML = STAFF_DATA.map(s => `
      <div class="detail-person-card">
        <img src="${s.img}" alt="">
        <div><div class="detail-person-name">${s.name}</div><div class="detail-person-role">${s.role}</div></div>
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
        <div><div class="review-user">${r.user}</div><div class="review-date">${r.date}</div></div>
        <div class="review-score">
          <svg style="width:13px;height:13px;fill:var(--gold);stroke:none;"><use href="#ico-star"/></svg> ${r.score}/10
        </div>
      </div>
      <p class="review-text">${r.text}</p>
    </div>`).join('');
}

export function toggleDesc() {
  return;
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
export function openEpisode(animeId, seasonNumber, epNum) {
  const anime = ANIME_DATA.find(a => a.id === animeId);
  if (!anime) return;

  if (epNum === undefined) {
    epNum = seasonNumber;
    seasonNumber = 1;
  }

  const seasons = anime.seasons || [{ seasonNumber: 1, episodes: anime.episodes || [] }];
  const season = seasons.find(s => s.seasonNumber === seasonNumber) || seasons[0];
  const ep = season.episodes.find(e => e.num === epNum);
  if (!ep) return;

  window.__currentAnime = anime;
  window.__currentEpisode = ep;
  window.__currentAnimeId = animeId;
  window.__currentEpNum = epNum;
  window.__currentSeason = seasonNumber;

  setLastPage({ page: 'watch', animeId, seasonNumber, epNum });

  addToWatching(anime.id);

  cleanupPlayer();
  showPage('watch');

  setTimeout(() => {
    loadEpisodeInPlayer(anime, ep, seasonNumber);
    renderWatchSidebar(anime, seasonNumber, epNum);
    renderUpNext(anime, seasonNumber, epNum);
    renderWatchActions(anime, ep, seasonNumber);
  }, 100);
}

function cleanupPlayer() {
  const playerWrap = document.querySelector('.player-wrap');
  if (!playerWrap) return;
  const oldVideo = playerWrap.querySelector('video');
  if (oldVideo) {
    try {
      oldVideo.pause();
      oldVideo.removeAttribute('src');
      oldVideo.load();
      oldVideo.remove();
    } catch (e) {}
  }
  window.__realVideo = null;
  playerWrap.classList.remove('playing');
}

export function watchAnime(animeId) {
  const anime = ANIME_DATA.find(a => a.id === animeId);
  if (!anime) return;
  const seasons = anime.seasons || [{ seasonNumber: 1, episodes: anime.episodes || [] }];
  const firstSeason = seasons[0];
  const firstEp = firstSeason.episodes[0];
  if (!firstEp) return;
  openEpisode(animeId, firstSeason.seasonNumber, firstEp.num);
}

function loadEpisodeInPlayer(anime, ep, seasonNumber) {
  const seasonLabel = seasonNumber > 1 ? ` · Season ${seasonNumber}` : ' · Season 1';
  document.querySelector('.watch-ep-title').textContent = `Episode ${ep.num}: "${ep.title}"`;
  document.querySelector('.watch-ep-label').textContent = `${anime.title}${seasonLabel}`;

  const progressFill = document.getElementById('playerProgress');
  if (progressFill) progressFill.style.width = '0%';
  const timeEl = document.querySelector('.player-time');
  if (timeEl) timeEl.textContent = '00:00 / 00:00';

  const playerWrap = document.querySelector('.player-wrap');
  if (!playerWrap) return;
  playerWrap.classList.remove('playing');

  const oldVideo = playerWrap.querySelector('video');
  if (oldVideo) {
    oldVideo.pause();
    oldVideo.removeAttribute('src');
    oldVideo.load();
    oldVideo.remove();
  }

  const defaultQuality = ep.qualities && ep.qualities.length > 0
    ? ep.qualities[ep.qualities.length - 1]
    : { url: ep.videoUrl, label: 'Auto' };

  const video = document.createElement('video');
  video.id = 'realVideo';
  video.src = defaultQuality.url;
  video.controls = false;
  video.playsInline = true;
  video.muted = false;
  video.volume = 1;
  video.preload = 'metadata';
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');
  video.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:contain;background:#000;z-index:2;';

  playerWrap.insertBefore(video, playerWrap.firstChild);

  const bg = playerWrap.querySelector('.player-bg');
  if (bg) bg.style.display = 'none';

  window.__realVideo = video;

  const center = document.getElementById('playerCenter');
  if (center) center.classList.remove('hidden');

  const vBtn = document.getElementById('volumeBtn');
  if (vBtn) {
    vBtn.innerHTML = `<svg class="icon icon-md"><use href="#ico-volume"/></svg>`;
    vBtn.setAttribute('title', 'Mute');
  }

  video.addEventListener('loadedmetadata', () => {
    const pf = document.getElementById('playerProgress');
    if (pf) pf.style.width = '0%';
    const tEl = document.querySelector('.player-time');
    if (tEl && video.duration && !isNaN(video.duration)) {
      tEl.textContent = `00:00 / ${formatTime(video.duration)}`;
    }
  });

  video.addEventListener('timeupdate', updatePlayerTime);

  let markedAsWatched = false;
  video.addEventListener('timeupdate', () => {
    if (markedAsWatched) return;
    if (!video.duration || isNaN(video.duration)) return;

    const watchedRatio = video.currentTime / video.duration;

    if (watchedRatio >= 0.5) {
      markedAsWatched = true;

      const totalEps = getTotalEpisodes(anime);
      const airedEps = getAiredEpisodes(anime);

      let globalEpNum = 0;
      const seasons = anime.seasons || [];
      for (const s of seasons) {
        if (s.seasonNumber < seasonNumber) {
          globalEpNum += s.episodes.length;
        } else if (s.seasonNumber === seasonNumber) {
          globalEpNum += ep.num;
          break;
        }
      }

      const progressPct = airedEps > 0 ? Math.min(100, Math.round((globalEpNum / airedEps) * 100)) : 0;

      const currentStatus = getListStatus(anime.id);
      const isFirstTime = !currentStatus ||
                          currentStatus === 'not_watched' ||
                          currentStatus === 'plan_to_watch';

      setLastEpisode(anime.id, { seasonNumber, epNum: ep.num });
      setProgress(anime.id, progressPct);

      if (isFirstTime) {
        if (globalEpNum >= airedEps && airedEps >= totalEps) {
          setListStatus(anime.id, 'completed');
          showToast('Marked as Completed');
        } else {
          setListStatus(anime.id, 'watching');
          showToast('Added to Watching');
        }
      } else {
        if (globalEpNum >= airedEps && airedEps >= totalEps) {
          setListStatus(anime.id, 'completed');
        } else if (currentStatus !== 'completed') {
          setListStatus(anime.id, 'watching');
        }
      }

      window.dispatchEvent(new CustomEvent('anivora:watchlist-refresh'));
      window.dispatchEvent(new CustomEvent('anivora:episode-watched', {
        detail: { animeId: anime.id, seasonNumber, epNum: ep.num }
      }));
    }
  });

  initQualitySelector(ep, defaultQuality);
  initSpeedSelector();

  window.__playerIsPlaying = false;
}

function renderWatchActions(anime, ep, seasonNumber) {
  const wrap = document.getElementById('watchActionsRow');
  if (!wrap) return;
  const status = getListStatus(anime.id);
  const added = !!status;
  const liked = isLiked(anime.id);

  wrap.innerHTML = `
    <button class="btn btn-ghost btn-sm btn-action-wide" onclick="window.__scrollToEpisodes = true; openAnimeDetail(${anime.id})">
      <svg class="icon icon-sm"><use href="#ico-info"/></svg>
      <span>Details</span>
    </button>

    <button class="btn btn-ghost btn-sm btn-action-wide" onclick="toggleDownloadMenu(event, ${anime.id}, ${ep.num})">
      <svg class="icon icon-sm"><use href="#ico-download"/></svg>
      <span>Download</span>
    </button>

    <button class="btn btn-ghost btn-sm btn-action-icon ${added ? 'is-added' : ''}" data-add-btn="${anime.id}" onclick="toggleList(${anime.id}, this)" title="Add to List">
      <svg class="icon icon-sm"><use href="#${added ? 'ico-check' : 'ico-plus'}"/></svg>
    </button>

    <button class="btn btn-ghost btn-sm btn-action-icon ${liked ? 'is-liked' : ''}" data-like-btn="${anime.id}" onclick="toggleLike(${anime.id}, this)" title="Like">
      <svg class="icon icon-sm"><use href="#${liked ? 'ico-heart-fill' : 'ico-heart'}"/></svg>
    </button>

    <div class="download-menu" id="dlMenuWatch"></div>
  `;
}

function renderWatchSidebar(anime, seasonNumber, currentEpNum) {
  const list = document.getElementById('sidebarEpList');
  if (!list) return;

  const seasons = anime.seasons || [{ seasonNumber: 1, episodes: anime.episodes || [] }];
  const season = seasons.find(s => s.seasonNumber === seasonNumber) || seasons[0];
  const lastEpData = getLastEpisode(anime.id);

  list.innerHTML = season.episodes.map(ep => {
    let isWatched = false;
    if (lastEpData) {
      if (lastEpData.seasonNumber > seasonNumber) isWatched = true;
      else if (lastEpData.seasonNumber === seasonNumber && ep.num <= lastEpData.epNum) isWatched = true;
    }
    return `
    <div class="sidebar-ep-item ${ep.num === currentEpNum ? 'active' : ''}" onclick="openEpisode(${anime.id}, ${seasonNumber}, ${ep.num})">
      <div class="sidebar-ep-thumb"><svg class="icon icon-sm"><use href="#ico-play"/></svg></div>
      <div class="sidebar-ep-info">
        <div class="sidebar-ep-num">Ep ${ep.num} ${isWatched ? '✓' : ''}</div>
        <div class="sidebar-ep-name">${ep.title}</div>
        <div class="sidebar-ep-dur">${ep.duration}</div>
      </div>
    </div>`;
  }).join('');
}

/* ★★★ Up Next — اپیزودهای بعدی ★★★ */
function renderUpNext(anime, seasonNumber, currentEpNum) {
  const row = document.getElementById('upNextRow');
  if (!row) return;

  const seasons = anime.seasons || [{ seasonNumber: 1, episodes: anime.episodes || [] }];
  const season = seasons.find(s => s.seasonNumber === seasonNumber) || seasons[0];

  let nextEps = season.episodes.filter(e => e.num > currentEpNum).slice(0, 4)
    .map(e => ({ ...e, seasonNumber }));

  if (nextEps.length < 4) {
    const nextSeason = seasons.find(s => s.seasonNumber === seasonNumber + 1);
    if (nextSeason) {
      const more = nextSeason.episodes.slice(0, 4 - nextEps.length)
        .map(e => ({ ...e, seasonNumber: nextSeason.seasonNumber }));
      nextEps = nextEps.concat(more);
    }
  }

  if (nextEps.length === 0) {
    row.innerHTML = '<div style="color:var(--text-muted);padding:12px;font-size:13px;">No more episodes.</div>';
    return;
  }

  row.innerHTML = nextEps.map(ep => `
    <div class="up-next-card" onclick="openEpisode(${anime.id}, ${ep.seasonNumber}, ${ep.num})">
      <div class="up-next-thumb">
        ${ep.img ? `<img src="${ep.img}" alt="" loading="lazy">` : ''}
        <div class="up-next-play-overlay">
          <svg class="icon icon-lg" style="fill:#fff;stroke:none;"><use href="#ico-play"/></svg>
        </div>
      </div>
      <div class="up-next-body">
        <div class="up-next-ep">S${ep.seasonNumber} · Episode ${ep.num}</div>
        <div class="up-next-title">${ep.title}</div>
      </div>
    </div>
  `).join('');
}

/* ============================================
   AUTH PAGES
============================================ */
export function renderLoginPage() {
  const loginPage = document.getElementById('page-login');
  if (!loginPage) return;

  if (isLoggedIn()) {
    loginPage.innerHTML = `
      <div class="auth-page">
        <div class="auth-card">
          <div class="auth-logo" style="gap:0;">Ani<span>vora</span></div>
          <div class="auth-title">You're already signed in</div>
          <div class="auth-subtitle">Go to your profile</div>
          <button class="btn btn-primary" style="width:100%;justify-content:center;" onclick="showPage('profile')">Go to Profile</button>
          <button class="btn btn-ghost" style="width:100%;justify-content:center;margin-top:10px;" onclick="handleLogout()">Sign Out</button>
        </div>
      </div>`;
    return;
  }

  loginPage.innerHTML = `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo" style="gap:0;">Ani<span>vora</span></div>
        <div class="auth-title">Welcome Back</div>
        <div class="auth-subtitle">Sign in to your account</div>
        <div class="form-group"><label class="form-label">Email</label>
          <input type="email" id="loginEmail" class="form-input" placeholder="you@example.com"></div>
        <div class="form-group"><label class="form-label">Password</label>
          <input type="password" id="loginPassword" class="form-input" placeholder="••••••••"></div>
        <div id="loginError" class="auth-error" style="display:none;"></div>
        <button class="btn btn-primary" style="width:100%;justify-content:center;" onclick="handleLogin()">Sign In</button>
        <div class="auth-switch">Don't have an account? <a onclick="showPage('signup')">Create one</a></div>
      </div>
    </div>`;

  setTimeout(() => {
    const emailInput = document.getElementById('loginEmail');
    const passInput = document.getElementById('loginPassword');
    if (emailInput) emailInput.focus();
    [emailInput, passInput].forEach(inp => {
      if (inp) inp.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleLogin();
      });
    });
  }, 50);
}

export function handleLogin() {
  const email = document.getElementById('loginEmail')?.value.trim();
  const password = document.getElementById('loginPassword')?.value;
  const errorEl = document.getElementById('loginError');

  const result = login(email, password);
  if (!result.success) {
    if (errorEl) { errorEl.textContent = result.error; errorEl.style.display = 'block'; }
    return;
  }
  showToast('Welcome back, ' + result.user.username + '!');
  if (window.updateDrawerAuth) window.updateDrawerAuth();
  if (window.updateHeaderAvatar) window.updateHeaderAvatar();
  showPage('profile');
}

export function handleLogout() {
  logout();
  showToast('Signed out');
  renderLoginPage();
  if (window.updateDrawerAuth) window.updateDrawerAuth();
  if (window.updateHeaderAvatar) window.updateHeaderAvatar();
  showPage('home');
}

export function renderSignupPage() {
  const signupPage = document.getElementById('page-signup');
  if (!signupPage) return;

  signupPage.innerHTML = `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo" style="gap:0;">Ani<span>vora</span></div>
        <div class="auth-title">Create Account</div>
        <div class="auth-subtitle">Join Anivora today</div>
        <div class="form-group"><label class="form-label">Username</label>
          <input type="text" id="signupUsername" class="form-input" placeholder="YourName"></div>
        <div class="form-group"><label class="form-label">Email</label>
          <input type="email" id="signupEmail" class="form-input" placeholder="you@example.com"></div>
        <div class="form-group"><label class="form-label">Password</label>
          <input type="password" id="signupPassword" class="form-input" placeholder="Min 6 characters"></div>
        <div id="signupError" class="auth-error" style="display:none;"></div>
        <button class="btn btn-primary" style="width:100%;justify-content:center;" onclick="handleSignup()">Create Account</button>
        <div class="auth-switch">Already have an account? <a onclick="showPage('login')">Sign in</a></div>
      </div>
    </div>`;

  setTimeout(() => {
    const uInput = document.getElementById('signupUsername');
    if (uInput) uInput.focus();
  }, 50);
}

export function handleSignup() {
  const username = document.getElementById('signupUsername')?.value.trim();
  const email = document.getElementById('signupEmail')?.value.trim();
  const password = document.getElementById('signupPassword')?.value;
  const errorEl = document.getElementById('signupError');

  const result = signup(email, password, username);
  if (!result.success) {
    if (errorEl) { errorEl.textContent = result.error; errorEl.style.display = 'block'; }
    return;
  }

  const PRESET_AVATARS = [
    'assets/avatars/avatar-1.jpg','assets/avatars/avatar-2.jpg','assets/avatars/avatar-3.jpg',
    'assets/avatars/avatar-4.jpg','assets/avatars/avatar-5.jpg','assets/avatars/avatar-6.jpg',
    'assets/avatars/avatar-7.jpg','assets/avatars/avatar-8.jpg','assets/avatars/avatar-9.jpg',
    'assets/avatars/avatar-10.jpg','assets/avatars/avatar-11.jpg','assets/avatars/avatar-12.jpg',
  ];
  const randomAvatar = PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)];

  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === result.user.id);
  if (userIndex !== -1) {
    users[userIndex].avatar = randomAvatar;
    saveUsers(users);
  }

  if (window.updateDrawerAuth) window.updateDrawerAuth();
  if (window.updateHeaderAvatar) window.updateHeaderAvatar();
  showToast('Account created!');
  showPage('profile');
}

/* ============================================
   PROFILE
============================================ */
export function initProfile() {
  if (!isLoggedIn()) return;
  const user = getCurrentUser();
  if (!user) return;
  const stats = computeProfileStats(ANIME_DATA);

  const avatarContainer = document.getElementById('profileAvatar');
  if (avatarContainer) {
    if (user.avatar) avatarContainer.innerHTML = `<img src="${user.avatar}" alt="">`;
    else avatarContainer.innerHTML = `<svg class="icon icon-xl" style="color:rgba(255,255,255,0.5);margin:auto;display:block;"><use href="#ico-user"/></svg>`;
  }

  const nameEl = document.querySelector('.profile-name');
  if (nameEl) nameEl.textContent = user.username;

  const sinceEl = document.querySelector('.profile-since');
  if (sinceEl) {
    const date = new Date(user.createdAt);
    const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    sinceEl.textContent = `Member since ${monthYear}`;
  }

  const editBtn = document.querySelector('.profile-edit-btn');
  if (editBtn) editBtn.onclick = (e) => { e.stopPropagation(); openEditProfileModal(user); };

  const statsStrip = document.querySelector('.profile-stats-strip');
  if (statsStrip) {
    statsStrip.innerHTML = `
      <div class="profile-stat"><span class="profile-stat-val">${stats.totalAnime}</span><span class="profile-stat-label">Anime</span></div>
      <div class="profile-stat"><span class="profile-stat-val">${stats.totalEpisodes}</span><span class="profile-stat-label">Episodes</span></div>
      <div class="profile-stat"><span class="profile-stat-val">${stats.watchTimeDisplay}</span><span class="profile-stat-label">Watch Time</span></div>
      <div class="profile-stat"><span class="profile-stat-val">${stats.completed}</span><span class="profile-stat-label">Completed</span></div>
      <div class="profile-stat"><span class="profile-stat-val">${stats.favorites}</span><span class="profile-stat-label">Favorites</span></div>
    `;
  }

  const overviewStats = document.querySelector('.profile-stats-grid');
  if (overviewStats) {
    const listStore = getListStore();
    const listIds = Object.keys(listStore).map(id => parseInt(id));
    const favIds = getStore('anivora_likes');
    const allIds = new Set([...listIds, ...favIds]);
    const totalAnime = allIds.size;

    const lastEpStore = getStore('anivora_last_ep');
    let totalMinutesAll = 0, totalMinutesWatched = 0;

    allIds.forEach(id => {
      const anime = ANIME_DATA.find(a => a.id === id);
      if (!anime) return;
      const epsCount = getTotalEpisodes(anime);
      const epDuration = 24;
      totalMinutesAll += epsCount * epDuration;

      let watchedEps = lastEpStore[id] || 0;
      if (typeof watchedEps === 'object') watchedEps = watchedEps.epNum || 0;
      totalMinutesWatched += Math.min(watchedEps, epsCount) * epDuration;
    });

    function formatWatchTime(minutes) {
      if (!minutes || minutes <= 0 || isNaN(minutes)) return '0m';
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      if (h === 0) return `${m}m`;
      if (m === 0) return `${h}h`;
      return `${h}h ${m}m`;
    }

    const watchedFormatted = formatWatchTime(Math.round(totalMinutesWatched));
    const progressPct = totalMinutesAll > 0 ? Math.min(100, Math.round((totalMinutesWatched / totalMinutesAll) * 100)) : 0;
    const dashArray = 2 * Math.PI * 45;
    const dashOffset = dashArray * (1 - progressPct / 100);

    overviewStats.innerHTML = `
      <div class="profile-stats-new">
        <div class="profile-stats-fields">
          <div class="profile-stat-field field-completed"><div class="profile-stat-field-value">${stats.completed}</div><div class="profile-stat-field-label">Completed</div></div>
          <div class="profile-stat-field field-episodes"><div class="profile-stat-field-value">${stats.totalEpisodes}</div><div class="profile-stat-field-label">Episodes</div></div>
          <div class="profile-stat-field field-favorites"><div class="profile-stat-field-value">${stats.favorites}</div><div class="profile-stat-field-label">Favorites</div></div>
          <div class="profile-stat-field field-total"><div class="profile-stat-field-value">${totalAnime}</div><div class="profile-stat-field-label">Total Anime</div></div>
        </div>
        <div class="profile-watch-time-circle">
          <svg viewBox="0 0 100 100" class="profile-circle-svg">
            <circle cx="50" cy="50" r="45" class="profile-circle-bg"/>
            <circle cx="50" cy="50" r="45" class="profile-circle-fill" stroke-dasharray="${dashArray}" stroke-dashoffset="${dashOffset}"/>
          </svg>
          <div class="profile-circle-content"><div class="profile-circle-value">${watchedFormatted}</div></div>
        </div>
      </div>
      <button class="profile-view-stats-btn" onclick="switchProfileTab(document.querySelector('.profile-tabs .tab-btn:last-child'), 'ptab-stats')">
        View Full Statistics <svg class="icon icon-sm"><use href="#ico-chevron-r"/></svg>
      </button>
    `;
  }

  const recentActivity = document.getElementById('recentActivity');
  if (recentActivity) {
    const listStore = getListStore();
    const lastEpStore = getStore('anivora_last_ep');
    const activities = [];
    Object.keys(listStore).forEach(animeIdStr => {
      const animeId = parseInt(animeIdStr);
      const anime = ANIME_DATA.find(a => a.id === animeId);
      if (!anime) return;
      let lastEp = lastEpStore[animeId] || 0;
      if (typeof lastEp === 'object') lastEp = lastEp.epNum || 0;
      const status = listStore[animeId];

      if (lastEp > 0) {
        activities.push({ title: anime.title, desc: `Watched Episode ${lastEp}`, time: status === 'completed' ? 'Completed' : 'In progress', img: anime.img, ts: animeId });
      } else if (status) {
        activities.push({ title: anime.title, desc: `Added to list (${status.replace('_', ' ')})`, time: 'Recently', img: anime.img, ts: animeId });
      }
    });
    activities.sort((a, b) => b.ts - a.ts);
    const top = activities.slice(0, 5);
    if (top.length === 0) recentActivity.innerHTML = '<p style="color:var(--text-muted);font-size:13px;padding:12px;">No activity yet.</p>';
    else recentActivity.innerHTML = top.map(a => `
        <div class="recent-activity-item" onclick="openAnimeDetail(${a.ts})" style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);margin-bottom:8px;cursor:pointer;transition:var(--transition);">
          <img src="${a.img}" style="width:44px;height:44px;border-radius:8px;object-fit:cover;flex-shrink:0;" alt="">
          <div style="flex:1;"><div style="font-size:13.5px;font-weight:600;">${a.title}</div><div style="font-size:12px;color:var(--text-muted);margin-top:2px;">${a.desc} · ${a.time}</div></div>
          <svg class="icon icon-sm" style="color:var(--text-muted);"><use href="#ico-chevron-r"/></svg>
        </div>`).join('');
  }

  const genreProgress = document.getElementById('genreProgress');
  if (genreProgress) {
    if (stats.favoriteGenres.length === 0) genreProgress.innerHTML = '<p style="color:var(--text-muted);font-size:13px;">No data yet.</p>';
    else genreProgress.innerHTML = stats.favoriteGenres.map(g => `
        <div><div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:4px;"><span style="color:var(--text-secondary);">${g.name}</span><span style="color:var(--text-primary);font-weight:600;">${g.pct}%</span></div>
        <div style="height:4px;background:var(--bg-elevated);border-radius:2px;"><div style="height:100%;background:var(--accent);border-radius:2px;width:${g.pct}%;"></div></div></div>`).join('');
  }

  const topGenres = document.getElementById('topGenres');
  if (topGenres) {
    if (stats.favoriteGenres.length === 0) topGenres.innerHTML = '<p style="color:var(--text-muted);font-size:13px;">No data.</p>';
    else {
      const maxN = stats.favoriteGenres[0].count;
      topGenres.innerHTML = stats.favoriteGenres.map(g => `
        <div style="margin-bottom:10px;"><div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:3px;"><span style="color:var(--text-secondary);">${g.name}</span><span style="color:var(--text-primary);font-weight:600;">${g.count}</span></div>
        <div style="height:3px;background:var(--bg-elevated);border-radius:2px;"><div style="height:100%;background:var(--accent);border-radius:2px;width:${(g.count / maxN) * 100}%;"></div></div></div>`).join('');
    }
  }

  const scoreDist = document.getElementById('scoreDist');
  if (scoreDist) {
    const listStore = getListStore();
    const scores = {};
    [10,9,8,7,6,5,4].forEach(s => scores[s] = 0);
    Object.keys(listStore).forEach(idStr => {
      const anime = ANIME_DATA.find(a => a.id === parseInt(idStr));
      if (!anime) return;
      const bucket = Math.min(10, Math.max(4, Math.floor(anime.score)));
      scores[bucket] = (scores[bucket] || 0) + 1;
    });
    const maxCount = Math.max(...Object.values(scores), 1);
    scoreDist.innerHTML = [10,9,8,7,6,5,4].map(s => `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
        <span style="font-size:11.5px;color:var(--text-muted);width:24px;text-align:right;">${s}</span>
        <div style="flex:1;height:14px;background:var(--bg-elevated);border-radius:3px;overflow:hidden;"><div style="height:100%;background:var(--accent);border-radius:3px;width:${(scores[s] / maxCount) * 100}%;opacity:0.85;"></div></div>
        <span style="font-size:11px;color:var(--text-muted);width:20px;">${scores[s]}</span>
      </div>`).join('');
  }

  const watchByYear = document.getElementById('watchByYear');
  if (watchByYear) {
    if (stats.watchByYear.length === 0) watchByYear.innerHTML = '<p style="color:var(--text-muted);font-size:13px;">No data.</p>';
    else watchByYear.innerHTML = stats.watchByYear.map(y => `
        <div style="margin-bottom:10px;"><div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:3px;"><span style="color:var(--text-secondary);">${y.year}</span><span style="color:var(--text-primary);font-weight:600;">${y.count} anime</span></div>
        <div style="height:3px;background:var(--bg-elevated);border-radius:2px;"><div style="height:100%;background:var(--accent);border-radius:2px;width:${y.pct}%;"></div></div></div>`).join('');
  }

  const favGrid = document.getElementById('favoritesGrid');
  if (favGrid) {
    const favIds = getStore('anivora_likes');
    const favAnimes = ANIME_DATA.filter(a => favIds.includes(a.id));
    if (favAnimes.length === 0) favGrid.innerHTML = '<p style="color:var(--text-muted);font-size:13px;padding:12px;">No favorites yet.</p>';
    else favGrid.innerHTML = favAnimes.map(a => renderAnimeCard(a)).join('');
  }

  const historyList = document.getElementById('historyList');
  if (historyList) {
    const listStore = getListStore();
    const lastEpStore = getStore('anivora_last_ep');
    const items = [];
    Object.keys(listStore).forEach(idStr => {
      const anime = ANIME_DATA.find(a => a.id === parseInt(idStr));
      if (!anime) return;
      let lastEp = lastEpStore[anime.id] || 0;
      if (typeof lastEp === 'object') lastEp = lastEp.epNum || 0;
      if (lastEp > 0) items.push({ anime, lastEp, status: listStore[anime.id] });
    });
    items.sort((a, b) => b.lastEp - a.lastEp);
    if (items.length === 0) historyList.innerHTML = '<p style="color:var(--text-muted);font-size:13px;padding:12px;">No history yet.</p>';
    else historyList.innerHTML = items.map(item => `
        <div class="watchlist-item" onclick="openAnimeDetail(${item.anime.id})" style="cursor:pointer;">
          <div class="wl-main-row">
            <img src="${item.anime.img}" alt="">
            <div class="watchlist-item-info">
              <div class="watchlist-item-title">${item.anime.title}</div>
              <div class="watchlist-item-meta">Watched up to Episode ${item.lastEp}</div>
            </div>
          </div>
        </div>`).join('');
  }

  // Other List
  const otherListContent = document.getElementById('otherListContent');
  if (otherListContent) {
    const listStore = getListStore();
    function collectLists() {
      const notWatched = [], planToWatch = [], dropped = [];
      Object.keys(listStore).forEach(idStr => {
        const animeId = parseInt(idStr);
        const anime = ANIME_DATA.find(a => a.id === animeId);
        if (!anime) return;
        const status = listStore[animeId];
        if (status === 'not_watched')        notWatched.push(anime);
        else if (status === 'plan_to_watch') planToWatch.push(anime);
        if (isDropped(animeId))              dropped.push(anime);
      });
      return { notWatched, planToWatch, dropped };
    }
    function renderAnimeListItem(a) {
      let lastEp = getStore('anivora_last_ep')[a.id] || 0;
      if (typeof lastEp === 'object') lastEp = lastEp.epNum || 0;
      const totalEps = getTotalEpisodes(a);
      const isDroppedItem = isDropped(a.id);
      const droppedNote = isDroppedItem ? `<div style="font-size:10.5px;color:var(--danger);margin-top:4px;font-style:italic;">Dropped${lastEp ? ` at Ep ${lastEp}` : ''}</div>` : '';
      let sub = (lastEp && lastEp > 0) ? `Watched up to Ep ${lastEp} / ${totalEps}` : `${a.type} · ${a.year} · ${a.eps} eps`;
      return `
        <div class="watchlist-item" onclick="openAnimeDetail(${a.id})" style="cursor:pointer;margin-bottom:0;">
          <div class="wl-main-row"><img src="${a.img}" alt="">
            <div class="watchlist-item-info"><div class="watchlist-item-title">${a.title}</div><div class="watchlist-item-meta">${sub}</div>${droppedNote}</div>
          </div></div>`;
    }
    function renderOverview(notWatched, planToWatch, dropped) {
      function section(title, items, color, key) {
        if (items.length === 0) return `
            <div style="margin-bottom:22px;"><div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
              <span style="width:3px;height:16px;background:${color};border-radius:2px;"></span><span style="font-size:14px;font-weight:700;">${title}</span>
              <span style="font-size:11px;color:var(--text-muted);background:var(--bg-elevated);padding:2px 8px;border-radius:20px;">0</span></div>
              <p style="font-size:12.5px;color:var(--text-muted);padding:8px 12px;">No anime in this list.</p></div>`;
        return `
          <div style="margin-bottom:24px;"><div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
            <span style="width:3px;height:16px;background:${color};border-radius:2px;"></span>
            <span style="font-size:14px;font-weight:700;">${title}</span>
            <span style="font-size:11px;color:var(--text-muted);background:var(--bg-elevated);padding:2px 8px;border-radius:20px;">${items.length}</span>
            <button onclick="document.getElementById('otherListOverview').style.display='none'; document.getElementById('otherListDetail_${key}').style.display='block';"
              style="margin-left:auto;background:transparent;border:1px solid var(--border-hover);color:var(--accent);font-size:11.5px;font-weight:600;padding:5px 12px;border-radius:6px;cursor:pointer;display:inline-flex;align-items:center;gap:4px;">
              See All <svg class="icon icon-sm" style="width:13px;height:13px;"><use href="#ico-chevron-r"/></svg></button>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px;">${items.slice(0, 3).map(renderAnimeListItem).join('')}</div></div>`;
      }
      return `${section('Not Watched', notWatched, 'var(--text-muted)', 'notWatched')}
              ${section('Plan to Watch', planToWatch, '#40c4ff', 'planToWatch')}
              ${section('Dropped', dropped, 'var(--danger)', 'dropped')}`;
    }
    function renderDetailView(title, items, key) {
      return `
        <div id="otherListDetail_${key}" style="display:none;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;">
            <button onclick="document.getElementById('otherListDetail_${key}').style.display='none'; document.getElementById('otherListOverview').style.display='block';"
              style="width:36px;height:36px;border-radius:50%;background:var(--bg-elevated);color:var(--text-primary);display:flex;align-items:center;justify-content:center;border:none;cursor:pointer;flex-shrink:0;">
              <svg class="icon icon-md" style="width:18px;height:18px;"><use href="#ico-chevron-l"/></svg></button>
            <div><div style="font-size:16px;font-weight:800;">${title}</div><div style="font-size:12px;color:var(--text-muted);">${items.length} anime</div></div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px;">${items.map(renderAnimeListItem).join('')}</div>
        </div>`;
    }
    const { notWatched, planToWatch, dropped } = collectLists();
    otherListContent.innerHTML = `
      <div id="otherListOverview">${renderOverview(notWatched, planToWatch, dropped)}</div>
      ${renderDetailView('Not Watched', notWatched, 'notWatched')}
      ${renderDetailView('Plan to Watch', planToWatch, 'planToWatch')}
      ${renderDetailView('Dropped', dropped, 'dropped')}`;
  }
}

export function bindProfileEvents() {
  window.addEventListener('anivora:profile-refresh', () => { if (isLoggedIn()) initProfile(); });
  window.addEventListener('anivora:list-changed', () => { if (window.__currentPage === 'profile' && isLoggedIn()) initProfile(); });
  window.addEventListener('anivora:likes-changed', () => { if (window.__currentPage === 'profile' && isLoggedIn()) initProfile(); });
}

export function bindDetailEvents() {
  window.addEventListener('anivora:detail-refresh', (e) => {
    const animeId = e.detail?.animeId || window.__currentAnimeId;
    if (animeId) openAnimeDetail(animeId);
  });
  window.addEventListener('anivora:episode-watched', (e) => {
    const animeId = e.detail?.animeId;
    if (!animeId) return;
    const anime = ANIME_DATA.find(a => a.id === animeId);
    if (!anime) return;
    const currentSeason = window.__currentSeason || 1;
    renderDetailEpisodes(anime, currentSeason);
  });
}

/* ============================================
   EDIT PROFILE MODAL
============================================ */
export function openEditProfileModal(user) {
  document.querySelectorAll('.edit-profile-overlay').forEach(el => el.remove());
  document.querySelectorAll('.edit-profile-modal').forEach(el => el.remove());

  const overlay = document.createElement('div');
  overlay.className = 'edit-profile-overlay';
  overlay.onclick = () => closeEditProfileModal();

  const modal = document.createElement('div');
  modal.className = 'edit-profile-modal';

  const PRESET_AVATARS = [
    'assets/avatars/avatar-1.jpg','assets/avatars/avatar-2.jpg','assets/avatars/avatar-3.jpg',
    'assets/avatars/avatar-4.jpg','assets/avatars/avatar-5.jpg','assets/avatars/avatar-6.jpg',
    'assets/avatars/avatar-7.jpg','assets/avatars/avatar-8.jpg','assets/avatars/avatar-9.jpg',
    'assets/avatars/avatar-10.jpg','assets/avatars/avatar-11.jpg','assets/avatars/avatar-12.jpg',
  ];

  const avatarHTML = user.avatar ? `<img src="${user.avatar}" alt="">` : `<svg class="icon icon-xl" style="color:rgba(255,255,255,0.5);"><use href="#ico-user"/></svg>`;
  const avatarsGridHTML = PRESET_AVATARS.map(url => `
    <button type="button" class="preset-avatar-btn ${user.avatar === url ? 'selected' : ''}" data-avatar-url="${url}" onclick="selectPresetAvatar(this, '${url}')">
      <img src="${url}" alt="Avatar" loading="lazy">
    </button>`).join('');

  modal.innerHTML = `
    <div class="edit-profile-header"><h3>Edit Profile</h3>
      <button class="edit-profile-close" onclick="closeEditProfileModal()" type="button"><svg class="icon icon-md"><use href="#ico-x"/></svg></button></div>
    <div class="edit-profile-body">
      <div class="edit-avatar-section">
        <div class="edit-avatar-preview" id="editAvatarPreview">${avatarHTML}</div>
        <div style="font-size:12px;color:var(--text-muted);text-align:center;margin-top:4px;">Choose an avatar</div>
        <div class="preset-avatars-grid" id="presetAvatarsGrid">${avatarsGridHTML}</div>
        <div class="edit-avatar-actions" style="margin-top:10px;">
          <button class="btn btn-ghost btn-sm" onclick="removeAvatar()" type="button"><svg class="icon icon-sm"><use href="#ico-trash"/></svg> Remove Avatar</button>
        </div>
      </div>
      <div class="form-group"><label class="form-label">Username</label>
        <input type="text" id="editUsername" class="form-input" value="${user.username}" maxlength="30" placeholder="Your username"></div>
      <div class="form-group"><label class="form-label">Email</label>
        <input type="email" class="form-input" value="${user.email}" disabled style="opacity:0.6;cursor:not-allowed;"></div>
      <div id="editProfileError" class="auth-error" style="display:none;"></div>
    </div>
    <div class="edit-profile-footer">
      <button class="btn btn-ghost" onclick="closeEditProfileModal()" type="button">Cancel</button>
      <button class="btn btn-primary" onclick="saveProfileChanges()" type="button">Save Changes</button>
    </div>`;

  document.body.appendChild(overlay);
  document.body.appendChild(modal);
  window.__pendingAvatar = user.avatar || null;

  requestAnimationFrame(() => { overlay.classList.add('show'); modal.classList.add('show'); });
  document.body.style.overflow = 'hidden';

  const escHandler = (e) => {
    if (e.key === 'Escape') { document.removeEventListener('keydown', escHandler); closeEditProfileModal(); }
  };
  document.addEventListener('keydown', escHandler);
  window.__editProfileEscHandler = escHandler;
}

export function closeEditProfileModal() {
  const overlay = document.querySelector('.edit-profile-overlay');
  const modal = document.querySelector('.edit-profile-modal');
  if (overlay) { overlay.classList.remove('show'); setTimeout(() => overlay.remove(), 250); }
  if (modal) { modal.classList.remove('show'); setTimeout(() => modal.remove(), 300); }
  document.body.style.overflow = '';
  window.__pendingAvatar = null;
  if (window.__editProfileEscHandler) {
    document.removeEventListener('keydown', window.__editProfileEscHandler);
    window.__editProfileEscHandler = null;
  }
}

export function selectPresetAvatar(btn, avatarUrl) {
  window.__pendingAvatar = avatarUrl;
  const preview = document.getElementById('editAvatarPreview');
  if (preview) preview.innerHTML = `<img src="${avatarUrl}" alt="">`;
  document.querySelectorAll('.preset-avatar-btn').forEach(b => b.classList.remove('selected'));
  if (btn) btn.classList.add('selected');
}
window.selectPresetAvatar = selectPresetAvatar;

export function handleAvatarUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) return;
  if (file.size > 2 * 1024 * 1024) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    window.__pendingAvatar = dataUrl;
    const preview = document.getElementById('editAvatarPreview');
    if (preview) preview.innerHTML = `<img src="${dataUrl}" alt="">`;
  };
  reader.readAsDataURL(file);
}

export function removeAvatar() {
  window.__pendingAvatar = null;
  const preview = document.getElementById('editAvatarPreview');
  if (preview) preview.innerHTML = `<svg class="icon icon-xl" style="color:rgba(255,255,255,0.5);"><use href="#ico-user"/></svg>`;
  document.querySelectorAll('.preset-avatar-btn').forEach(b => b.classList.remove('selected'));
}

export function saveProfileChanges() {
  const newUsername = document.getElementById('editUsername')?.value.trim();
  const errorEl = document.getElementById('editProfileError');
  if (!newUsername || newUsername.length < 2) {
    if (errorEl) { errorEl.textContent = 'Username must be at least 2 characters.'; errorEl.style.display = 'block'; }
    return;
  }
  if (newUsername.length > 30) {
    if (errorEl) { errorEl.textContent = 'Username must be less than 30 characters.'; errorEl.style.display = 'block'; }
    return;
  }
  const session = getSession();
  if (!session) { showToast('Session expired.'); return; }
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === session.userId);
  if (userIndex === -1) { showToast('User not found.'); return; }
  users[userIndex].username = newUsername;
  users[userIndex].avatar = window.__pendingAvatar;
  saveUsers(users);
  showToast('Profile updated!');
  closeEditProfileModal();
  initProfile();
  if (window.updateHeaderAvatar) window.updateHeaderAvatar();
}

/* ============================================
   WATCHLIST
============================================ */
export function initWatchlist() {
  const el = document.getElementById('watchlistContent');
  if (!el) return;
  const listStore = getListStore();
  const favoriteIds = getStore('anivora_likes');
  let items = [];
  if (watchlistFilter === 'all') items = ANIME_DATA.filter(a => listStore[a.id]);
  else if (watchlistFilter === 'watching') items = ANIME_DATA.filter(a => listStore[a.id] === 'watching');
  else if (watchlistFilter === 'completed') items = ANIME_DATA.filter(a => listStore[a.id] === 'completed');
  else if (watchlistFilter === 'favorites') items = ANIME_DATA.filter(a => favoriteIds.includes(a.id));

  if (items.length === 0) {
    const emptyMsg = { 'all': 'Your list is empty.', 'watching': "You're not watching any anime yet.", 'completed': 'No completed anime yet.', 'favorites': "You haven't liked any anime yet!" }[watchlistFilter] || 'No anime in this list yet.';
    el.innerHTML = `<div class="watchlist-empty"><svg class="icon icon-xl" style="width:48px;height:48px;"><use href="#ico-bookmark"/></svg>${emptyMsg}</div>`;
    return;
  }

  el.innerHTML = items.map(a => {
    const status = listStore[a.id];
    const progressPct = getProgress(a.id);
    let lastEp = getStore('anivora_last_ep')[a.id] || 0;
    if (typeof lastEp === 'object') lastEp = lastEp.epNum || 0;
    const totalEps = getTotalEpisodes(a);
    const airedEps = getAiredEpisodes(a);
    const dropped = isDropped(a.id);
    const showProgress = (status === 'watching' || status === 'completed');
    const isComplete = progressPct >= 100 && airedEps >= totalEps;

    let topActions = '';
    if (watchlistFilter === 'favorites') {
      topActions = `<button class="wl-action-btn" onclick="event.stopPropagation();removeFromFavoritesUI(${a.id}, this)" title="Remove" type="button"><svg class="icon icon-sm"><use href="#ico-x"/></svg></button>`;
    } else {
      topActions = `<button class="wl-action-btn" onclick="event.stopPropagation();openListStatusSheet(${a.id}, this)" title="Change status" type="button"><svg class="icon icon-sm"><use href="#ico-edit"/></svg><span>Change Status</span></button>`;
    }

    let statusBadge = '';
    if (status === 'watching') statusBadge = '<span class="wl-badge wl-badge-watching">Watching</span>';
    if (status === 'completed') statusBadge = '<span class="wl-badge wl-badge-completed">Completed</span>';
    if (status === 'plan_to_watch') statusBadge = '<span class="wl-badge wl-badge-plan">Plan to Watch</span>';
    if (status === 'not_watched') statusBadge = '<span class="wl-badge wl-badge-not">Not Watched</span>';
    if (watchlistFilter === 'favorites') statusBadge = '<span class="wl-badge wl-badge-fav">❤ Favorite</span>';

    const lastEpText = lastEp ? `Ep ${lastEp} / ${airedEps}` : `0 / ${airedEps}`;
    const droppedText = dropped ? '<div class="wl-dropped-text">Dropped — won\'t continue</div>' : '';

    return `
    <div class="watchlist-item">
      <div class="wl-top-row"><div></div>${topActions}</div>
      <div class="wl-main-row" onclick="openAnimeDetail(${a.id})">
        <img src="${a.img}" alt="">
        <div class="watchlist-item-info">
          <div class="watchlist-item-title">${a.title}</div>
          <div class="watchlist-item-meta">${a.type} · ${a.year} · ${totalEps} eps</div>
          <div class="wl-badges">${statusBadge}</div>
          ${showProgress ? `
            <div class="wl-progress-wrap">
              <div class="wl-progress-info"><span class="wl-progress-ep">${lastEpText}</span><span class="wl-progress-pct">${Math.round(progressPct)}%</span></div>
              <div class="wl-progress-bar"><div class="wl-progress-fill ${isComplete ? 'is-complete' : ''}" style="width:${progressPct}%;"></div></div>
              ${droppedText}
            </div>` : ''}
        </div>
      </div>
    </div>`;
  }).join('');
}

export function removeFromWatchingUI(animeId, btn) {
  setListStatus(animeId, null);
  showToast('Removed from list');
  initWatchlist();
}

export function removeFromFavoritesUI(animeId, btn) {
  removeFromFavorites(animeId);
  showToast('Removed from favorites');
  initWatchlist();
}

export function initWatchlistTabs() {
  const btns = document.querySelectorAll('.list-cat-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      watchlistFilter = btn.dataset.filter || 'all';
      initWatchlist();
    });
  });
}

export function bindWatchlistEvents() {
  window.addEventListener('anivora:list-changed', () => initWatchlist());
  window.addEventListener('anivora:likes-changed', () => initWatchlist());
  window.addEventListener('anivora:watchlist-refresh', () => initWatchlist());
}

/* ============================================
   RESTORE STATE AFTER REFRESH
============================================ */
export function restoreStateAfterRefresh() {
  const hashPage = location.hash ? location.hash.replace('#','') : null;
  const lastPage = getLastPage();
  let targetPage = hashPage;
  const validRestorePages = ['detail', 'watch'];
  if (!validRestorePages.includes(targetPage)) {
    if (lastPage && validRestorePages.includes(lastPage.page)) targetPage = lastPage.page;
    else return false;
  }

  if (targetPage === 'watch') {
    let animeId = lastPage?.animeId;
    let epNum = lastPage?.epNum;
    let seasonNumber = lastPage?.seasonNumber || 1;
    if (!animeId || !epNum) {
      const lastEpStore = getStore('anivora_last_ep');
      const ids = Object.keys(lastEpStore).map(id => parseInt(id));
      if (ids.length > 0) {
        animeId = ids[ids.length - 1];
        const d = lastEpStore[animeId];
        if (typeof d === 'object') { epNum = d.epNum; seasonNumber = d.seasonNumber || 1; }
        else epNum = d;
      }
    }
    if (animeId && epNum) {
      const anime = ANIME_DATA.find(a => a.id === animeId);
      if (anime) { openEpisode(animeId, seasonNumber, epNum); return true; }
    }
    return false;
  }

  if (targetPage === 'detail') {
    let animeId = lastPage?.animeId;
    if (!animeId) {
      const lastEpStore = getStore('anivora_last_ep');
      const ids = Object.keys(lastEpStore).map(id => parseInt(id));
      if (ids.length > 0) animeId = ids[ids.length - 1];
    }
    if (animeId) {
      const anime = ANIME_DATA.find(a => a.id === animeId);
      if (anime) {
        openAnimeDetail(animeId);
        history.replaceState({ page: 'detail', animeId }, '', '#detail');
        return true;
      }
    }
    return false;
  }
  return false;
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
        <div class="cal-anime-item"><div class="cal-anime-info">
          <div class="cal-anime-name">${show.title}</div>
          <div class="cal-anime-ep">${show.ep}</div>
        </div></div>`).join('')}
    </div>`).join('');
}