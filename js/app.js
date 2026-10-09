/* ============================================
   ANIVORA — APP
   + Smart Loader Management
============================================ */

import {
  showPage, openDrawer, closeDrawer, goFromDrawer, toggleNotif,
  triggerPageLoader, toggleList, toggleLike, showToast,
  initCustomSelects, bindGlobalEvents, isInList, isLiked,
  getListStatus, setListStatus, openListStatusSheet, closeListStatusSheet,
  updateAddBtnUI, getLastPage, setLastPage, isLoggedIn,
  handleDrawerAuth, updateDrawerAuth, updateHeaderAvatar,
  goBack, refreshCurrentUser, syncListFromServer,
  showLoader, hideLoader
} from './core.js';

import {
  toggleDownloadMenu, shareAnime, togglePlay, handlePlayerTap,
  seekPlayer, toggleFullscreen, bindFullscreenChange, bindDownloadOutsideClick,
  renderAnimeCard, populateSection,
  toggleMute, playNextEpisode, initQualitySelector, initSpeedSelector,
  bindPlayerKeyboard, bindPlayerMouseMove
} from './components.js';

import {
  initHome, initExplore, initWatchlist, initWatchlistTabs,
  initCalendar, openAnimeDetail, openEpisode, watchAnime,
  toggleDesc, switchTab, switchProfileTab,
  switchSeason, toggleSeasonDropdown,
  toggleClearBtn, clearSearch, addFilter, removeFilter, filterResults,
  showCategory,
  renderCharsAndStaff, renderReviews, renderDetailEpisodes,
  removeFromWatchingUI, removeFromFavoritesUI,
  bindWatchlistEvents, restoreStateAfterRefresh,
  renderLoginPage, renderSignupPage, handleLogin, handleSignup, handleLogout,
  initProfile, bindProfileEvents, bindDetailEvents,
  openEditProfileModal, closeEditProfileModal,
  handleAvatarUpload, removeAvatar, saveProfileChanges
} from './pages.js';

import { getToken } from './api.js';

/* ============================================
   GLOBAL DATA
============================================ */
let ANIME_DATA = [];

/* ============================================
   LOAD DATA — با Smart Loader
============================================ */
async function loadData() {
  // ★ نمایش loader
  showLoader();

  const startTime = Date.now();
  const MIN_LOADER_TIME = 350; // حداقل زمان نمایش loader (ms)

  try {
    const isGitHubPages = location.hostname.endsWith('github.io');
    const API_URL = isGitHubPages ? 'data.json' : '/api/anime';

    console.log('[Anivora] Loading data from:', API_URL);

    const response = await fetch(API_URL, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Data is not a valid array');
    }

    ANIME_DATA = data;
    window.__animeData = {};
    ANIME_DATA.forEach(a => { window.__animeData[a.id] = a; });
    window.ANIME_DATA = ANIME_DATA;

    console.log(`✅ Loaded ${ANIME_DATA.length} anime from API`);

    // ★ صبر کن تا حداقل زمان loader بگذرد
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, MIN_LOADER_TIME - elapsed);
    if (remaining > 0) await new Promise(r => setTimeout(r, remaining));

    hideLoader();
    return true;
  } catch (error) {
    console.error('❌ Failed to load anime data:', error);

    const loader = document.getElementById('pageLoader');
    if (loader) {
      loader.innerHTML = `
        <div style="text-align:center;color:var(--danger);padding:20px;">
          <svg class="icon icon-xl" style="width:48px;height:48px;margin-bottom:12px;"><use href="#ico-x"/></svg>
          <div style="font-size:14px;font-weight:600;">Failed to load data</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:4px;">Please check your connection and refresh.</div>
          <button onclick="location.reload()" style="margin-top:16px;padding:8px 20px;background:var(--accent);color:#fff;border:none;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;">Retry</button>
        </div>
      `;
      // ★ loader رو فعال نگه دار تا کاربر Retry بزنه
    }
    return false;
  }
}

/* ============================================
   EXPOSE TO WINDOW
============================================ */
window.showPage = showPage;
window.openDrawer = openDrawer;
window.closeDrawer = closeDrawer;
window.goFromDrawer = goFromDrawer;
window.toggleNotif = toggleNotif;
window.toggleList = toggleList;
window.toggleLike = toggleLike;
window.toggleDownloadMenu = toggleDownloadMenu;
window.shareAnime = shareAnime;
window.togglePlay = togglePlay;
window.handlePlayerTap = handlePlayerTap;
window.seekPlayer = seekPlayer;
window.toggleFullscreen = toggleFullscreen;
window.toggleMute = toggleMute;
window.playNextEpisode = playNextEpisode;
window.openAnimeDetail = openAnimeDetail;
window.openEpisode = openEpisode;
window.watchAnime = watchAnime;
window.toggleDesc = toggleDesc;
window.switchTab = switchTab;
window.switchProfileTab = switchProfileTab;
window.switchSeason = switchSeason;
window.toggleSeasonDropdown = toggleSeasonDropdown;
window.toggleClearBtn = toggleClearBtn;
window.clearSearch = clearSearch;
window.addFilter = addFilter;
window.removeFilter = removeFilter;
window.filterResults = filterResults;
window.showCategory = showCategory;
window.removeFromWatchingUI = removeFromWatchingUI;
window.removeFromFavoritesUI = removeFromFavoritesUI;
window.openListStatusSheet = openListStatusSheet;
window.closeListStatusSheet = closeListStatusSheet;
window.getListStatus = getListStatus;
window.setListStatus = setListStatus;
window.handleDrawerAuth = handleDrawerAuth;
window.updateDrawerAuth = updateDrawerAuth;
window.updateHeaderAvatar = updateHeaderAvatar;
window.goBack = goBack;
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.handleLogout = handleLogout;

window.goToProfile = function() {
  if (isLoggedIn()) showPage('profile');
  else showPage('login');
};

window.openEditProfileModal = openEditProfileModal;
window.closeEditProfileModal = closeEditProfileModal;
window.handleAvatarUpload = handleAvatarUpload;
window.removeAvatar = removeAvatar;
window.saveProfileChanges = saveProfileChanges;

/* ============================================
   SHOW PAGE ONLY
============================================ */
function showPageOnly(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById('page-' + pageId);
  if (page) {
    page.classList.add('active');
    window.scrollTo(0, 0);
  }
  window.__currentPage = pageId;
}

/* ============================================
   INIT HOME SECTIONS
============================================ */
function initHomeSections() {
  try { initHome(); } catch(e) { console.error('initHome:', e); }
  try { initCustomSelects(); } catch(e) { console.error('initCustomSelects:', e); }
}

/* ============================================
   INIT ALL PAGES
============================================ */
function initAllPages() {
  try { initHome(); } catch(e) { console.error('initHome:', e); }
  try { initExplore(); } catch(e) { console.error('initExplore:', e); }
  try { initWatchlist(); } catch(e) { console.error('initWatchlist:', e); }
  try { initWatchlistTabs(); } catch(e) { console.error('initWatchlistTabs:', e); }
  try { initCalendar(); } catch(e) { console.error('initCalendar:', e); }
  try { initCustomSelects(); } catch(e) { console.error('initCustomSelects:', e); }
}

/* ============================================
   INIT
============================================ */
async function init() {
  const dataLoaded = await loadData();
  if (!dataLoaded) return;

  window.__currentPage = null;

  renderLoginPage();
  renderSignupPage();

  // ★ اگه توکن داریم، کاربر رو از سرور بگیر (با loader)
  if (getToken()) {
    showLoader();

    try {
      await refreshCurrentUser();
      await syncListFromServer();
    } catch(e) {
      console.error('refreshCurrentUser error:', e);
    }

    hideLoader();
  }

  const hash = location.hash ? location.hash.replace('#', '') : 'home';
  const lastPage = getLastPage();

  const shouldRestore = (hash === 'watch' || hash === 'detail') && lastPage &&
                        (lastPage.page === 'watch' || lastPage.page === 'detail');

  if (shouldRestore) {
    let restored = false;
    try {
      restored = restoreStateAfterRefresh();
    } catch (e) {
      console.error('[Anivora] Restore error:', e);
      restored = false;
    }

    if (!restored) {
      setLastPage(null);
      history.replaceState({ page: 'home' }, '', '#home');
      showPageOnly('home');
    }

    initHomeSections();
  } else {
    const validPages = ['home', 'explore', 'detail', 'watch', 'seasonal', 'watchlist', 'profile', 'calendar', 'login', 'signup'];
    const isFirstVisit = !sessionStorage.getItem('anivora_visited');

    if (isFirstVisit) {
      sessionStorage.setItem('anivora_visited', '1');
      setLastPage(null);
      history.replaceState({ page: 'home' }, '', '#home');
      showPageOnly('home');
    } else if (validPages.includes(hash) && hash !== 'home') {
      let pageId = hash;
      if (pageId === 'profile' && !isLoggedIn()) pageId = 'login';
      if (pageId === 'detail' || pageId === 'watch') pageId = 'home';

      if (!history.state) {
        history.replaceState({ page: pageId }, '', '#' + pageId);
      }
      showPageOnly(pageId);
    } else {
      setLastPage(null);
      history.replaceState({ page: 'home' }, '', '#home');
      showPageOnly('home');
    }

    initAllPages();
  }

  bindGlobalEvents();
  bindFullscreenChange();
  bindDownloadOutsideClick();
  bindWatchlistEvents();
  bindProfileEvents();
  bindDetailEvents();
  bindPlayerKeyboard();
  bindPlayerMouseMove();

  updateDrawerAuth();
  updateHeaderAvatar();

  if (isLoggedIn()) {
    try { initProfile(); } catch(e) { console.error('initProfile error:', e); }
  }

  setTimeout(() => {
    refreshStoredButtons();
  }, 100);
}

/* ============================================
   REFRESH STORED BUTTONS
============================================ */
function refreshStoredButtons() {
  document.querySelectorAll('[data-add-btn]').forEach(btn => {
    const id = parseInt(btn.getAttribute('data-add-btn'));
    if (!isNaN(id) && isInList(id)) {
      updateAddBtnUI(btn, id);
    }
  });

  document.querySelectorAll('[data-like-btn]').forEach(btn => {
    const id = parseInt(btn.getAttribute('data-like-btn'));
    if (!isNaN(id) && isLiked(id)) {
      btn.classList.add('is-liked');
      const svg = btn.querySelector('svg use');
      if (svg) svg.setAttribute('href', '#ico-heart-fill');
      const label = btn.querySelector('.like-label');
      if (label) label.textContent = 'Liked';
    }
  });
}

/* ============================================
   START
============================================ */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
