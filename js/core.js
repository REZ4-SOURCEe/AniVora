/* ============================================
   ANIVORA — CORE
   + Cloudflare Worker Auth
   + Smart Loader Management
   + Collapse History (A→B→A)
============================================ */

import {
  apiSignup, apiLogin, apiLogout, apiGetMe,
  apiSaveAnime, apiGetList, apiDeleteAnime, apiUpdateProfile,
  getToken, getCachedUser, setCachedUser, clearCachedUser
} from './api.js';

/* ============================================
   PAGE LOADER
============================================ */
let loaderTimeout = null;

export function showLoader() {
  const loader = document.getElementById('pageLoader');
  if (!loader) return;
  loader.classList.add('active');
  clearTimeout(loaderTimeout);
}

export function hideLoader() {
  const loader = document.getElementById('pageLoader');
  if (!loader) return;
  loader.classList.remove('active');
  clearTimeout(loaderTimeout);
}

export function triggerPageLoader() {
  const loader = document.getElementById('pageLoader');
  if (!loader) return;
  loader.classList.add('active');
  clearTimeout(loaderTimeout);
  loaderTimeout = setTimeout(() => {
    loader.classList.remove('active');
  }, 400);
}

/* ============================================
   STORE (localStorage)
============================================ */
const LIST_KEY = 'anivora_list_v2';
const LIKES_KEY = 'anivora_likes';
const WATCHING_KEY = 'anivora_watching';
const LAST_EP_KEY = 'anivora_last_ep';
const PROGRESS_KEY = 'anivora_progress';
const DROPPED_KEY = 'anivora_dropped';
const LAST_PAGE_KEY = 'anivora_last_page';
const DETAIL_STATE_KEY = 'anivora_detail_state';

export function getStore(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; }
  catch(e) { return []; }
}
export function setStore(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch(e) {}
}

/* ---------- LAST PAGE ---------- */
export function getLastPage() {
  try { return JSON.parse(localStorage.getItem(LAST_PAGE_KEY)) || null; }
  catch(e) { return null; }
}
export function setLastPage(page) {
  try { localStorage.setItem(LAST_PAGE_KEY, JSON.stringify(page)); } catch(e) {}
}

/* ---------- DETAIL STATE ---------- */
export function getDetailState() {
  try { return JSON.parse(sessionStorage.getItem(DETAIL_STATE_KEY)) || null; }
  catch(e) { return null; }
}
export function setDetailState(state) {
  try { sessionStorage.setItem(DETAIL_STATE_KEY, JSON.stringify(state)); } catch(e) {}
}
export function clearDetailState() {
  try { sessionStorage.removeItem(DETAIL_STATE_KEY); } catch(e) {}
}

/* ---------- LAST EPISODE ---------- */
export function getLastEpisode(animeId) {
  const store = getStore(LAST_EP_KEY);
  const v = store[animeId];
  if (typeof v === 'number') return { seasonNumber: 1, epNum: v };
  return v || null;
}
export function setLastEpisode(animeId, value) {
  const store = getStore(LAST_EP_KEY);
  if (typeof value === 'number') {
    store[animeId] = { seasonNumber: 1, epNum: value };
  } else {
    store[animeId] = value;
  }
  setStore(LAST_EP_KEY, store);
  scheduleSyncToServer(animeId);
}
export function getLastEpNumber(animeId) {
  const v = getLastEpisode(animeId);
  if (!v) return 0;
  return v.epNum || 0;
}
export function clearLastEpisode(animeId) {
  const store = getStore(LAST_EP_KEY);
  delete store[animeId];
  setStore(LAST_EP_KEY, store);
}

/* ---------- PROGRESS ---------- */
export function getProgress(animeId) {
  const store = getStore(PROGRESS_KEY);
  return store[animeId] || 0;
}
export function setProgress(animeId, pct) {
  const store = getStore(PROGRESS_KEY);
  store[animeId] = Math.max(0, Math.min(100, pct));
  setStore(PROGRESS_KEY, store);
  scheduleSyncToServer(animeId);
}

/* ---------- DROPPED ---------- */
export function isDropped(animeId) {
  return getStore(DROPPED_KEY).includes(animeId);
}
export function setDropped(animeId, dropped) {
  let arr = getStore(DROPPED_KEY);
  if (dropped) {
    if (!arr.includes(animeId)) arr.push(animeId);
  } else {
    arr = arr.filter(id => id !== animeId);
  }
  setStore(DROPPED_KEY, arr);
  scheduleSyncToServer(animeId);
}

/* ============================================
   LIST WITH STATUS
============================================ */
export function getListStore() {
  try { return JSON.parse(localStorage.getItem(LIST_KEY)) || {}; }
  catch(e) { return {}; }
}
export function setListStore(obj) {
  try { localStorage.setItem(LIST_KEY, JSON.stringify(obj)); } catch(e) {}
}

export function isInList(animeId) {
  const list = getListStore();
  return !!list[animeId];
}

export function getListStatus(animeId) {
  const list = getListStore();
  return list[animeId] || null;
}

export function setListStatus(animeId, status) {
  const list = getListStore();
  const oldStatus = list[animeId];

  if (status === null) {
    delete list[animeId];
    const progressStore = getStore(PROGRESS_KEY);
    delete progressStore[animeId];
    setStore(PROGRESS_KEY, progressStore);

    let dropped = getStore(DROPPED_KEY);
    dropped = dropped.filter(id => id !== animeId);
    setStore(DROPPED_KEY, dropped);

    clearLastEpisode(animeId);
  } else {
    list[animeId] = status;
  }
  setListStore(list);

  document.querySelectorAll(`[data-add-btn="${animeId}"]`).forEach(b => {
    try { updateAddBtnUI(b, animeId); } catch(e) {}
  });

  scheduleSyncToServer(animeId);

  if (oldStatus !== status) {
    if (window.__currentPage === 'watchlist') {
      window.dispatchEvent(new CustomEvent('anivora:watchlist-refresh'));
    }
    if (window.__currentPage === 'profile') {
      window.dispatchEvent(new CustomEvent('anivora:profile-refresh'));
    }
    window.dispatchEvent(new CustomEvent('anivora:list-changed', {
      detail: { animeId, status }
    }));
  }
}

export function toggleList(animeId, btn) {
  openListStatusSheet(animeId, btn);
}

export function updateAddBtnUI(btn, animeId) {
  if (!btn) return;
  const status = getListStatus(animeId);
  const inList = !!status;
  const icon = inList ? 'ico-check' : 'ico-plus';

  let label = 'Add to List';
  if (status === 'watching')      label = 'Watching';
  if (status === 'completed')     label = 'Completed';
  if (status === 'plan_to_watch') label = 'Plan to Watch';
  if (status === 'not_watched')   label = 'Not Watched';

  const labelEl = btn.querySelector('.add-label');
  if (labelEl) {
    labelEl.textContent = label;
    const svg = btn.querySelector('svg use');
    if (svg) svg.setAttribute('href', `#${icon}`);
  } else {
    const svg = btn.querySelector('svg use');
    if (svg) svg.setAttribute('href', `#${icon}`);
  }
  btn.classList.toggle('is-added', inList);
}

/* ---------- LIKES ---------- */
export function isLiked(animeId) {
  return getStore(LIKES_KEY).includes(animeId);
}
export function toggleLike(animeId, btn) {
  let likes = getStore(LIKES_KEY);
  if (likes.includes(animeId)) likes = likes.filter(id => id !== animeId);
  else likes.push(animeId);
  setStore(LIKES_KEY, likes);

  document.querySelectorAll(`[data-like-btn="${animeId}"]`).forEach(b => {
    try { updateLikeBtnUI(b, animeId); } catch(e) {}
  });
  if (btn) updateLikeBtnUI(btn, animeId);

  if (window.__currentPage === 'watchlist') {
    window.dispatchEvent(new CustomEvent('anivora:watchlist-refresh'));
  }
  if (window.__currentPage === 'profile') {
    window.dispatchEvent(new CustomEvent('anivora:profile-refresh'));
  }

  window.dispatchEvent(new CustomEvent('anivora:likes-changed', {
    detail: { animeId }
  }));
}
export function updateLikeBtnUI(btn, animeId) {
  if (!btn) return;
  const liked = isLiked(animeId);
  btn.classList.toggle('is-liked', liked);
  const svg = btn.querySelector('svg use');
  if (svg) svg.setAttribute('href', liked ? '#ico-heart-fill' : '#ico-heart');
  const label = btn.querySelector('.like-label');
  if (label) label.textContent = liked ? 'Liked' : 'Like';
}
export function getFavorites() {
  return getStore(LIKES_KEY);
}
export function removeFromFavorites(animeId) {
  let likes = getStore(LIKES_KEY);
  likes = likes.filter(id => id !== animeId);
  setStore(LIKES_KEY, likes);
  document.querySelectorAll(`[data-like-btn="${animeId}"]`).forEach(b => updateLikeBtnUI(b, animeId));

  if (window.__currentPage === 'watchlist') {
    window.dispatchEvent(new CustomEvent('anivora:watchlist-refresh'));
  }
  if (window.__currentPage === 'profile') {
    window.dispatchEvent(new CustomEvent('anivora:profile-refresh'));
  }

  window.dispatchEvent(new CustomEvent('anivora:likes-changed', {
    detail: { animeId }
  }));
}

/* ---------- WATCHING ---------- */
export function isWatching(animeId) {
  return getStore(WATCHING_KEY).includes(animeId);
}
export function addToWatching(animeId) {
  let watching = getStore(WATCHING_KEY);
  if (!watching.includes(animeId)) {
    watching.push(animeId);
    setStore(WATCHING_KEY, watching);
  }
}
export function removeFromWatching(animeId) {
  let watching = getStore(WATCHING_KEY);
  watching = watching.filter(id => id !== animeId);
  setStore(WATCHING_KEY, watching);
}
export function toggleWatching(animeId) {
  if (isWatching(animeId)) removeFromWatching(animeId);
  else addToWatching(animeId);
}

/* ============================================
   AUTH SYSTEM — Cloudflare Worker
============================================ */
let CURRENT_USER = null;

export function getCurrentUser() {
  if (CURRENT_USER) return CURRENT_USER;
  CURRENT_USER = getCachedUser();
  return CURRENT_USER;
}

export function isLoggedIn() {
  return !!getToken() && !!getCurrentUser();
}

export async function signup(email, password, username) {
  try {
    const user = await apiSignup(email, password, username);
    CURRENT_USER = user;
    return { success: true, user };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export async function login(email, password) {
  try {
    const user = await apiLogin(email, password);
    CURRENT_USER = user;
    await syncListFromServer();
    return { success: true, user };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export function logout() {
  apiLogout();
  CURRENT_USER = null;
}

export async function refreshCurrentUser() {
  if (!getToken()) return null;
  try {
    const user = await apiGetMe();
    CURRENT_USER = user;
    return user;
  } catch (e) {
    logout();
    return null;
  }
}

export async function updateUserProfile(username, avatar) {
  try {
    await apiUpdateProfile(username, avatar);
    await refreshCurrentUser();
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

/* ============================================
   SYNC FROM SERVER
============================================ */
export async function syncListFromServer() {
  if (!isLoggedIn()) return;
  try {
    const list = await apiGetList();
    if (!Array.isArray(list)) return;

    const listStore = {};
    const lastEpStore = {};
    const progressStore = {};
    const droppedArr = [];

    for (const item of list) {
      if (item.status) listStore[item.anime_id] = item.status;
      if (item.last_ep) {
        lastEpStore[item.anime_id] = {
          seasonNumber: item.last_season || 1,
          epNum: item.last_ep
        };
      }
      if (item.progress) progressStore[item.anime_id] = item.progress;
      if (item.dropped) droppedArr.push(item.anime_id);
    }

    localStorage.setItem(LIST_KEY, JSON.stringify(listStore));
    localStorage.setItem(LAST_EP_KEY, JSON.stringify(lastEpStore));
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progressStore));
    localStorage.setItem(DROPPED_KEY, JSON.stringify(droppedArr));
  } catch (e) {
    console.error('syncListFromServer error:', e);
  }
}

/* ============================================
   SYNC TO SERVER (debounced)
============================================ */
let syncTimers = {};
function scheduleSyncToServer(animeId) {
  if (!isLoggedIn()) return;
  if (syncTimers[animeId]) clearTimeout(syncTimers[animeId]);

  syncTimers[animeId] = setTimeout(async () => {
    try {
      const status = getListStatus(animeId);
      const lastEp = getLastEpisode(animeId);
      const progress = getProgress(animeId);
      const dropped = isDropped(animeId);

      if (!status && !lastEp && !progress && !dropped) {
        await apiDeleteAnime(animeId);
      } else {
        await apiSaveAnime(animeId, {
          status: status || null,
          progress: progress || 0,
          lastEp: lastEp ? lastEp.epNum : 0,
          lastSeason: lastEp ? lastEp.seasonNumber : 1,
          dropped: dropped
        });
      }
    } catch (e) {
      console.error('syncToServer error:', e);
    }
  }, 500);
}

/* ============================================
   PROFILE STATS
============================================ */
export function computeProfileStats(ANIME_DATA) {
  const listStore = getListStore();
  const likes = getStore(LIKES_KEY);
  const lastEpStore = getStore(LAST_EP_KEY);

  let totalAnime = 0, totalEpisodes = 0, totalMinutes = 0;
  let completed = 0, watching = 0, planToWatch = 0, dropped = 0;

  const genreCount = {};
  const yearCount = {};

  if (!Array.isArray(ANIME_DATA)) ANIME_DATA = [];

  Object.keys(listStore).forEach(animeIdStr => {
    const animeId = parseInt(animeIdStr);
    const anime = ANIME_DATA.find(a => a.id === animeId);
    if (!anime) return;

    totalAnime++;
    const status = listStore[animeId];

    let watchedEps = lastEpStore[animeId] || 0;
    if (typeof watchedEps === 'object' && watchedEps) watchedEps = watchedEps.epNum || 0;

    totalEpisodes += watchedEps;
    totalMinutes += watchedEps * 24;

    if (status === 'completed') completed++;
    if (status === 'watching')  watching++;
    if (status === 'plan_to_watch') planToWatch++;
    if (isDropped(animeId)) dropped++;

    const genres = Array.isArray(anime.genres) ? anime.genres : [];
    genres.forEach(g => { genreCount[g] = (genreCount[g] || 0) + 1; });

    if (anime.year) {
      yearCount[anime.year] = (yearCount[anime.year] || 0) + 1;
    }
  });

  let meanScore = 0;
  const listAnimeIds = Object.keys(listStore).map(id => parseInt(id));
  const listAnimes = ANIME_DATA.filter(a => listAnimeIds.includes(a.id));
  if (listAnimes.length > 0) {
    meanScore = listAnimes.reduce((sum, a) => sum + (a.score || 0), 0) / listAnimes.length;
  }

  const sortedGenres = Object.entries(genreCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxGenreCount = sortedGenres[0]?.[1] || 1;
  const favoriteGenres = sortedGenres.map(([name, count]) => ({
    name, count,
    pct: Math.round((count / maxGenreCount) * 100)
  }));

  const sortedYears = Object.entries(yearCount).sort((a, b) => parseInt(b[0]) - parseInt(a[0])).slice(0, 5);
  const maxYearCount = Math.max(...sortedYears.map(y => y[1]), 1);
  const watchByYear = sortedYears.map(([year, count]) => ({
    year, count,
    pct: Math.round((count / maxYearCount) * 100)
  }));

  const totalHours = Math.floor(totalMinutes / 60);
  const watchTimeDisplay = totalHours > 24
    ? `${Math.floor(totalHours / 24)}d ${totalHours % 24}h`
    : `${totalHours}h`;

  return {
    totalAnime, totalEpisodes, totalMinutes, watchTimeDisplay,
    completed, watching, planToWatch, dropped,
    favorites: likes.length,
    meanScore: meanScore.toFixed(1),
    favoriteGenres, watchByYear
  };
}

/* ============================================
   TOAST
============================================ */
export function showToast(msg) {
  let t = document.getElementById('anivoraToast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'anivoraToast';
    t.className = 'anivora-toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t.__timer);
  t.__timer = setTimeout(() => t.classList.remove('show'), 1800);
}

/* ============================================
   HELPERS
============================================ */
export function shuffle(arr) {
  if (!Array.isArray(arr)) return [];
  return [...arr].sort(() => Math.random() - 0.5);
}
export function formatTime(sec) {
  if (!sec || isNaN(sec)) return '00:00';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

/* ============================================
   LIST STATUS SHEET
============================================ */
export function openListStatusSheet(animeId, triggerBtn) {
  document.querySelectorAll('.list-status-overlay').forEach(el => el.remove());
  document.querySelectorAll('.list-status-sheet').forEach(el => el.remove());

  let currentStatus = getListStatus(animeId);
  const inList = !!currentStatus;

  let progressPct = getProgress(animeId);
  let dropped = isDropped(animeId);

  const lastEpData = getLastEpisode(animeId);
  let lastEp = lastEpData ? (lastEpData.epNum || 0) : 0;

  let totalEps = 12;
  let airedEps = 12;
  if (window.__animeData && window.__animeData[animeId]) {
    const anime = window.__animeData[animeId];
    if (anime.seasons && anime.seasons.length > 0) {
      totalEps = anime.seasons.reduce((sum, s) => sum + s.episodes.length, 0);
      airedEps = anime.seasons.reduce((sum, s) => sum + (s.episodesAired || s.episodes.length), 0);
    } else {
      totalEps = anime.eps || anime.episodes?.length || 12;
      airedEps = anime.episodesAired || anime.episodes?.length || 12;
    }
  }

  if (lastEp > airedEps) lastEp = airedEps;
  if (!lastEp && progressPct > 0) lastEp = Math.round((progressPct / 100) * airedEps);
  if (!lastEp) lastEp = 1;

  let selectedStatus = currentStatus || 'watching';

  const overlay = document.createElement('div');
  overlay.className = 'list-status-overlay';

  const sheet = document.createElement('div');
  sheet.className = 'list-status-sheet';

  const progressPctInitial = Math.round((lastEp / airedEps) * 100);

  sheet.innerHTML = `
    <div class="list-status-handle"></div>
    <div class="list-status-title">WATCH STATUS</div>

    <button class="list-status-item ${selectedStatus === 'not_watched' ? 'selected' : ''}" data-status="not_watched">
      <span class="list-status-radio"></span>
      <span class="list-status-name">Not Watched</span>
    </button>

    <button class="list-status-item ${selectedStatus === 'plan_to_watch' ? 'selected' : ''}" data-status="plan_to_watch">
      <span class="list-status-radio"></span>
      <span class="list-status-name">Plan to Watch</span>
    </button>

    <button class="list-status-item ${selectedStatus === 'completed' ? 'selected' : ''}" data-status="completed">
      <span class="list-status-radio"></span>
      <span class="list-status-name">Completed</span>
    </button>

    <div class="list-status-item list-status-watching ${selectedStatus === 'watching' ? 'selected' : ''}" data-status="watching">
      <span class="list-status-radio"></span>
      <span class="list-status-name">Watching</span>
      <div class="list-status-watching-body">
        <div class="list-status-progress-row">
          <span class="list-status-progress-count" id="progressCount">${lastEp}/${airedEps}</span>
          <div class="list-status-slider-wrap" id="sliderWrap">
            <div class="list-status-slider-track">
              <div class="list-status-slider-fill" id="sliderFill" style="width:${progressPctInitial}%;"></div>
            </div>
            <div class="list-status-slider-thumb" id="sliderThumb" style="left:${progressPctInitial}%;">
              ${lastEp}
            </div>
          </div>
        </div>
        <label class="list-status-checkbox-row" onclick="event.stopPropagation();">
          <input type="checkbox" id="dropCheckbox" ${dropped ? 'checked' : ''}>
          <span>I don't plan to continue this series</span>
        </label>
      </div>
    </div>

    <div class="list-status-actions-row">
      ${inList ? `
      <button class="list-status-item list-status-item-danger" data-status="remove">
        <span class="list-status-name">Delete</span>
      </button>` : ''}
      <button class="list-status-item list-status-item-save" id="listStatusSaveBtn">
        <span class="list-status-name">Save</span>
      </button>
    </div>
  `;

  let currentEp = lastEp;

  const updateSliderFromEp = (ep) => {
    currentEp = Math.max(1, Math.min(airedEps, ep));
    const pct = (currentEp / airedEps) * 100;
    const fill = sheet.querySelector('#sliderFill');
    const thumb = sheet.querySelector('#sliderThumb');
    const count = sheet.querySelector('#progressCount');
    if (fill)  fill.style.width = pct + '%';
    if (thumb) { thumb.style.left = pct + '%'; thumb.textContent = currentEp; }
    if (count) count.textContent = `${currentEp}/${airedEps}`;
    if (selectedStatus !== 'watching') {
      selectedStatus = 'watching';
      sheet.querySelectorAll('.list-status-item').forEach(b => b.classList.remove('selected'));
      const watchBtn = sheet.querySelector('.list-status-item[data-status="watching"]');
      if (watchBtn) watchBtn.classList.add('selected');
    }
  };

  const sliderWrap = sheet.querySelector('#sliderWrap');
  const sliderThumb = sheet.querySelector('#sliderThumb');

  const getPctFromEvent = (clientX) => {
    const rect = sliderWrap.getBoundingClientRect();
    let pct = (clientX - rect.left) / rect.width;
    return Math.max(0, Math.min(1, pct));
  };

  const handleMove = (clientX) => {
    const pct = getPctFromEvent(clientX);
    const ep = Math.round(pct * airedEps) || 1;
    updateSliderFromEp(ep);
  };

  let isDragging = false;
  const onStart = (e) => {
    if (e.cancelable) e.preventDefault();
    e.stopPropagation();
    isDragging = true;
    sliderThumb?.classList.add('dragging');
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    handleMove(clientX);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
  };
  const onMove = (e) => {
    if (!isDragging) return;
    if (e.cancelable) e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    handleMove(clientX);
  };
  const onEnd = () => {
    isDragging = false;
    sliderThumb?.classList.remove('dragging');
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onEnd);
    document.removeEventListener('touchmove', onMove);
    document.removeEventListener('touchend', onEnd);
  };

  if (sliderThumb) {
    sliderThumb.addEventListener('mousedown', onStart);
    sliderThumb.addEventListener('touchstart', onStart, { passive: false });
  }
  if (sliderWrap) {
    sliderWrap.addEventListener('click', (e) => {
      if (e.target.closest('.list-status-slider-thumb')) return;
      e.stopPropagation();
      handleMove(e.clientX);
    });
  }

  const dropCheckbox = sheet.querySelector('#dropCheckbox');
  if (dropCheckbox) {
    dropCheckbox.addEventListener('change', (e) => { e.stopPropagation(); dropped = dropCheckbox.checked; });
    dropCheckbox.parentElement.addEventListener('click', (e) => { e.stopPropagation(); });
  }

  sheet.querySelectorAll('.list-status-item').forEach(btn => {
    btn.onclick = (ev) => {
      if (ev.target.closest('.list-status-checkbox-row')) return;
      if (ev.target.closest('.list-status-slider-wrap')) return;
      if (ev.target.closest('.list-status-slider-thumb')) return;

      const status = btn.dataset.status;
      if (status === 'remove') {
        setListStatus(animeId, null);
        showToast('Removed from list');
        document.removeEventListener('keydown', escHandler);
        closeListStatusSheet();
        return;
      }
      sheet.querySelectorAll('.list-status-item').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedStatus = status;
    };
  });

  const saveBtn = sheet.querySelector('#listStatusSaveBtn');
  if (saveBtn) {
    saveBtn.onclick = (e) => {
      e.stopPropagation();
      if (selectedStatus === 'watching') {
        setLastEpisode(animeId, { seasonNumber: 1, epNum: currentEp });
        const pct = Math.round((currentEp / airedEps) * 100);
        setProgress(animeId, pct);
        setDropped(animeId, dropped);
        if (currentEp >= airedEps && airedEps >= totalEps) {
          setListStatus(animeId, 'completed');
          showToast('Marked as Completed');
        } else {
          setListStatus(animeId, 'watching');
          showToast('Added to Watching');
        }
      } else if (selectedStatus === 'completed') {
        setListStatus(animeId, 'completed');
        setProgress(animeId, 100);
        setLastEpisode(animeId, { seasonNumber: 1, epNum: totalEps });
        setDropped(animeId, false);
        showToast('Marked as Completed');
      } else if (selectedStatus === 'plan_to_watch') {
        setListStatus(animeId, 'plan_to_watch');
        setDropped(animeId, false);
        showToast('Added to Plan to Watch');
      } else if (selectedStatus === 'not_watched') {
        setListStatus(animeId, 'not_watched');
        setDropped(animeId, false);
        showToast('Marked as Not Watched');
      }
      document.removeEventListener('keydown', escHandler);
      closeListStatusSheet();
    };
  }

  const escHandler = (e) => {
    if (e.key === 'Escape') { document.removeEventListener('keydown', escHandler); closeListStatusSheet(); }
  };
  overlay.onclick = () => { document.removeEventListener('keydown', escHandler); closeListStatusSheet(); };
  document.addEventListener('keydown', escHandler);

  document.body.appendChild(overlay);
  document.body.appendChild(sheet);
  window.__listStatusSheetOpen = true;

  requestAnimationFrame(() => {
    overlay.classList.add('show');
    sheet.classList.add('show');
  });
  document.body.style.overflow = 'hidden';
}

export function closeListStatusSheet() {
  const overlay = document.querySelector('.list-status-overlay');
  const sheet = document.querySelector('.list-status-sheet');
  if (overlay) { overlay.classList.remove('show'); setTimeout(() => overlay.remove(), 250); }
  if (sheet) { sheet.classList.remove('show'); setTimeout(() => sheet.remove(), 300); }
  document.body.style.overflow = '';
  window.__listStatusSheetOpen = false;
}

/* ============================================
   STOP VIDEO
============================================ */
export function stopVideo() {
  const video = window.__realVideo;
  if (video) {
    try {
      video.pause();
      video.removeAttribute('src');
      video.load();
      video.remove();
    } catch (e) {}
    window.__realVideo = null;
  }
  const playerWrap = document.querySelector('.player-wrap');
  if (playerWrap) {
    playerWrap.classList.remove('playing');
    playerWrap.style.cursor = '';
  }
  if (window.__hideControlsTimer) {
    clearTimeout(window.__hideControlsTimer);
    window.__hideControlsTimer = null;
  }
}

/* ============================================
   NAVIGATION STACK (برای Collapse A→B→A)
============================================ */
let navStack = [];                    // آرایه صفحات: [home, explore, watchlist, profile, watchlist, ...]
let pendingCollapse = null;           // { id, state } — اگه در حال Collapse هستیم

export function getNavStack() {
  return [...navStack];
}

/* ============================================
   ROUTER
============================================ */
export function showPage(id, skipHistory) {
  const prevPage = window.__currentPage;
  if (prevPage === id && !skipHistory) return;

  if (prevPage === 'watch' && id !== 'watch') stopVideo();

  // ★ ریدایرکت هوشمند
  if ((id === 'login' || id === 'signup') && isLoggedIn()) {
    id = 'profile';
  }
  if (id === 'profile' && !isLoggedIn()) {
    id = 'login';
  }

  // ★ اگه کاربر روی Home کلیک کرد، history رو ریست کن
  const isHomeClick = (id === 'home') && prevPage && prevPage !== 'home' && !skipHistory;

  if (isHomeClick) {
    navStack = ['home'];
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const page = document.getElementById('page-home');
    if (page) {
      page.classList.add('active');
      window.scrollTo(0, 0);
    }
    const notif = document.getElementById('notifPanel');
    if (notif) notif.classList.remove('open');
    updateBottomNav('home');

    // ★ history رو کامل ریست کن
    history.replaceState({ page: 'home' }, '', '#home');
    window.__currentPage = 'home';

    return;
  }

  // ★ Collapse check: A → B → A
  const shouldCollapse = !skipHistory &&
    navStack.length >= 2 &&
    navStack[navStack.length - 2] === id &&
    navStack[navStack.length - 1] === prevPage &&
    prevPage !== id;

  if (shouldCollapse) {
    // user does A → B → A
    // 1. از کاربر می‌خوایم به B برگرده (back)
    // 2. توی popstate، B رو با A2 جایگزین می‌کنیم

    pendingCollapse = {
      id: id,
      state: {
        page: id,
        ...(id === 'detail' && window.__currentAnimeId ? { animeId: window.__currentAnimeId } : {}),
        ...(id === 'watch' && window.__currentAnimeId ? {
          animeId: window.__currentAnimeId,
          seasonNumber: window.__currentSeason,
          epNum: window.__currentEpNum
        } : {})
      }
    };

    // navStack رو اصلاح کن: [A, B, A] → [A]
    navStack = navStack.slice(0, navStack.length - 2);
    navStack.push(id);

    history.back();
    return;  // popstate handle می‌کنه
  }

  // ★ ناوبری معمولی
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById('page-' + id);
  if (page) {
    page.classList.add('active');
    window.scrollTo(0, 0);
  }

  const notif = document.getElementById('notifPanel');
  if (notif) notif.classList.remove('open');

  updateBottomNav(id);

  const isAuthRedirect =
    (prevPage === 'login' || prevPage === 'signup') && id === 'profile';

  if (!skipHistory) {
    const currentHash = location.hash.replace('#', '') || 'home';
    if (currentHash !== id) {
      const state = { page: id };
      if (id === 'detail' && window.__currentAnimeId) {
        state.animeId = window.__currentAnimeId;
      }
      if (id === 'watch' && window.__currentAnimeId) {
        state.animeId = window.__currentAnimeId;
        state.seasonNumber = window.__currentSeason;
        state.epNum = window.__currentEpNum;
      }

      if (isAuthRedirect) {
        history.replaceState(state, '', '#' + id);
      } else {
        history.pushState(state, '', '#' + id);
        // navStack رو آپدیت کن
        if (navStack.length > 0 && navStack[navStack.length - 1] === id) {
          // تکراری پشت سر هم نذار
        } else {
          navStack.push(id);
        }
      }
    }
  } else {
    // skipHistory — navStack رو دست نزن
  }

  window.__currentPage = id;

  if (id === 'watchlist') {
    window.dispatchEvent(new CustomEvent('anivora:watchlist-refresh'));
  }
  if (id === 'profile') {
    window.dispatchEvent(new CustomEvent('anivora:profile-refresh'));
  }
}

export function goBack() {
  if (history.state && history.state.page) {
    history.back();
  } else {
    showPage('home');
  }
}
window.goBack = goBack;

export function updateBottomNav(id) {
  const items = document.querySelectorAll('.bottom-nav-item');
  items.forEach(it => it.classList.remove('active'));
  const map = { 'home': 0, 'explore': 1, 'seasonal': 2, 'watchlist': 3, 'profile': 4 };
  const idx = map[id];
  if (idx !== undefined && items[idx]) items[idx].classList.add('active');
}

export function openDrawer() {
  const drawer = document.getElementById('mobileDrawer');
  const overlay = document.getElementById('drawerOverlay');
  if (drawer) drawer.classList.add('open');
  if (overlay) overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  if (window.updateDrawerAuth) window.updateDrawerAuth();
}
export function closeDrawer() {
  const drawer = document.getElementById('mobileDrawer');
  const overlay = document.getElementById('drawerOverlay');
  if (drawer) drawer.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}
export function goFromDrawer(pageId) {
  closeDrawer();
  setTimeout(() => showPage(pageId), 200);
}

export function toggleNotif() {
  document.getElementById('notifPanel')?.classList.toggle('open');
}

/* ============================================
   DRAWER AUTH + HEADER AVATAR
============================================ */
export function handleDrawerAuth() {
  if (isLoggedIn()) {
    logout();
    showToast('Signed out');
    closeDrawer();
    setTimeout(() => {
      showPage('home');
      updateDrawerAuth();
    }, 200);
  } else {
    closeDrawer();
    setTimeout(() => showPage('login'), 200);
  }
}

export function updateDrawerAuth() {
  const label = document.getElementById('drawerAuthLabel');
  const btn = document.getElementById('drawerAuthBtn');

  if (label && btn) {
    const svg = btn.querySelector('svg use');
    if (isLoggedIn()) {
      label.textContent = 'Sign Out';
      if (svg) svg.setAttribute('href', '#ico-logout');
    } else {
      label.textContent = 'Login';
      if (svg) svg.setAttribute('href', '#ico-login');
    }
  }

  updateHeaderAvatar();
}

export function updateHeaderAvatar() {
  const headerAvatar = document.querySelector('.header-actions .avatar');
  if (!headerAvatar) return;

  const user = getCurrentUser();

  if (user && user.avatar) {
    headerAvatar.innerHTML = `<img src="${user.avatar}" alt="${user.username}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;">`;
    headerAvatar.style.background = 'transparent';
  } else {
    headerAvatar.innerHTML = `<svg class="icon icon-sm" style="color:#fff;"><use href="#ico-user"/></svg>`;
    headerAvatar.style.background = 'var(--accent)';
  }
}

window.handleDrawerAuth = handleDrawerAuth;
window.updateDrawerAuth = updateDrawerAuth;
window.updateHeaderAvatar = updateHeaderAvatar;
window.showLoader = showLoader;
window.hideLoader = hideLoader;

/* ============================================
   CUSTOM BOTTOM-SHEET SELECT
============================================ */
export function initCustomSelects() {
  document.querySelectorAll('select').forEach(sel => {
    sel.addEventListener('mousedown', handleCustomSelect);
    sel.addEventListener('touchstart', handleCustomSelect, { passive: false });
  });
}
function handleCustomSelect(e) {
  if (e.currentTarget.matches('select[title="Quality"]')) return;
  if (e.currentTarget.matches('select[title="Playback speed"]')) return;
  if (e.currentTarget.classList.contains('player-ctrl-select')) return;
  if (e.cancelable) e.preventDefault();
  const sel = e.currentTarget;
  const existing = document.querySelector('.custom-select-sheet');
  if (existing) existing.remove();
  if (sel.disabled) return;
  openCustomSheet(sel);
}
function openCustomSheet(sel) {
  const options = Array.from(sel.options);
  const currentIndex = sel.selectedIndex;
  const overlay = document.createElement('div');
  overlay.className = 'custom-select-overlay';
  overlay.onclick = () => closeCustomSheet();
  const sheet = document.createElement('div');
  sheet.className = 'custom-select-sheet';
  sheet.innerHTML = '<div class="custom-select-handle"></div>';
  const list = document.createElement('div');
  list.className = 'custom-select-list';
  options.forEach((opt, i) => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'custom-select-item' + (i === currentIndex ? ' selected' : '');
    item.innerHTML = `<span class="custom-select-radio"></span><span class="custom-select-label">${opt.textContent}</span>`;
    item.onclick = (ev) => {
      ev.stopPropagation();
      sel.selectedIndex = i;
      sel.dispatchEvent(new Event('change', { bubbles: true }));
      closeCustomSheet();
    };
    list.appendChild(item);
  });
  sheet.appendChild(list);
  document.body.appendChild(overlay);
  document.body.appendChild(sheet);
  requestAnimationFrame(() => { overlay.classList.add('show'); sheet.classList.add('show'); });
  document.body.style.overflow = 'hidden';
}
export function closeCustomSheet() {
  const overlay = document.querySelector('.custom-select-overlay');
  const sheet = document.querySelector('.custom-select-sheet');
  if (overlay) { overlay.classList.remove('show'); setTimeout(() => overlay.remove(), 250); }
  if (sheet) { sheet.classList.remove('show'); setTimeout(() => sheet.remove(), 300); }
  document.body.style.overflow = '';
}

/* ============================================
   GLOBAL EVENTS
============================================ */
export function bindGlobalEvents() {
  document.addEventListener('click', e => {
    if (!e.target.closest('#notifPanel') && !e.target.closest('[onclick="toggleNotif()"]')) {
      document.getElementById('notifPanel')?.classList.remove('open');
    }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCustomSheet(); });
  document.addEventListener('error', e => {
    if (e.target.tagName === 'IMG') {
      e.target.src = `https://picsum.photos/200/300?random=${Math.floor(Math.random()*999)+1}`;
    }
  }, true);

  window.addEventListener('popstate', function(e) {
    // ★ اگه در حال Collapse هستیم
    if (pendingCollapse) {
      const { id, state } = pendingCollapse;
      pendingCollapse = null;

      // ما الان توی B هستیم (بعد از back)
      // حالا B رو با A (id) جایگزین می‌کنیم
      history.replaceState(state, '', '#' + id);

      // صفحه رو به A عوض کن
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      const page = document.getElementById('page-' + id);
      if (page) {
        page.classList.add('active');
        window.scrollTo(0, 0);
      }
      window.__currentPage = id;
      updateBottomNav(id);

      if (id === 'watchlist') {
        window.dispatchEvent(new CustomEvent('anivora:watchlist-refresh'));
      }
      if (id === 'profile') {
        window.dispatchEvent(new CustomEvent('anivora:profile-refresh'));
      }

      return;
    }

    // ★ اگه Edit Profile modal بازه، بستش بده
    if (window.__editProfileModalOpen) {
      window.__editProfileModalOpen = false;
      const overlay = document.querySelector('.edit-profile-overlay');
      const modal = document.querySelector('.edit-profile-modal');
      if (overlay) { overlay.classList.remove('show'); setTimeout(() => overlay.remove(), 250); }
      if (modal) { modal.classList.remove('show'); setTimeout(() => modal.remove(), 300); }
      document.body.style.overflow = '';
      window.__pendingAvatar = null;
      history.pushState(e.state, '', location.href);
      return;
    }

    // ★ اگه List Status sheet بازه
    if (window.__listStatusSheetOpen) {
      closeListStatusSheet();
      history.pushState(e.state, '', location.href);
      return;
    }

    // ★ اگه Download sheet بازه
    if (document.querySelector('.download-sheet-overlay')) {
      const overlay = document.querySelector('.download-sheet-overlay');
      const sheet = document.querySelector('.download-sheet');
      if (overlay) { overlay.classList.remove('show'); setTimeout(() => overlay.remove(), 250); }
      if (sheet) { sheet.classList.remove('show'); setTimeout(() => sheet.remove(), 300); }
      document.body.style.overflow = '';
      history.pushState(e.state, '', location.href);
      return;
    }

    if (e.state && e.state.page === 'detail' && e.state.animeId) {
      if (window.openAnimeDetail) {
        window.openAnimeDetail(e.state.animeId, true);
        return;
      }
    }
    if (e.state && e.state.page === 'watch' && e.state.animeId) {
      if (window.openEpisode) {
        window.openEpisode(e.state.animeId, e.state.seasonNumber || 1, e.state.epNum);
        return;
      }
    }
    if (e.state && e.state.page) {
      // ★ از history واقعی استفاده کن، نه showPage (چون showPage دوباره push میکنه)
      const page = e.state.page;
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      const pageEl = document.getElementById('page-' + page);
      if (pageEl) {
        pageEl.classList.add('active');
        window.scrollTo(0, 0);
      }
      window.__currentPage = page;
      updateBottomNav(page);

      // navStack رو هم آپدیت کن (کوتاه کن تا صفحه فعلی)
      const idx = navStack.lastIndexOf(page);
      if (idx >= 0) {
        navStack = navStack.slice(0, idx + 1);
      } else {
        navStack.push(page);
      }

      if (page === 'watchlist') {
        window.dispatchEvent(new CustomEvent('anivora:watchlist-refresh'));
      }
      if (page === 'profile') {
        window.dispatchEvent(new CustomEvent('anivora:profile-refresh'));
      }
      return;
    }
    // fallback
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const home = document.getElementById('page-home');
    if (home) home.classList.add('active');
    window.__currentPage = 'home';
    updateBottomNav('home');
    navStack = ['home'];
  });
}
