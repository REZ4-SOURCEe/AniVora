/* ============================================
   ANIVORA — APP
   نقطه ورود: import همه ماژول‌ها،
   اتصال توابع به window برای onclickها،
   init اولیه
============================================ */

import {
  showPage, openDrawer, closeDrawer, goFromDrawer, toggleNotif,
  triggerPageLoader, toggleList, toggleLike, showToast,
  initCustomSelects, bindGlobalEvents, isInList, isLiked
} from './core.js';

import {
  toggleDownloadMenu, shareAnime, togglePlay, handlePlayerTap,
  seekPlayer, toggleFullscreen, bindFullscreenChange, bindDownloadOutsideClick,
  renderAnimeCard, populateSection,
  toggleMute, playNextEpisode, initQualitySelector, initSpeedSelector
} from './components.js';

import {
  initHome, initExplore, initWatchlist, initWatchlistTabs, initProfile,
  initCalendar, openAnimeDetail, openEpisode, watchAnime,
  toggleDesc, switchTab, switchProfileTab,
  toggleClearBtn, clearSearch, addFilter, removeFilter, filterResults,
  renderCharsAndStaff, renderReviews, renderDetailEpisodes
} from './pages.js';

/* ============================================
   EXPOSE TO WINDOW (برای onclickهای HTML)
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
window.toggleClearBtn = toggleClearBtn;
window.clearSearch = clearSearch;
window.addFilter = addFilter;
window.removeFilter = removeFilter;
window.filterResults = filterResults;

/* ============================================
   INIT
============================================ */
function init() {
  /* ---------- صفحه اولیه بر اساس hash ---------- */
  const startPage = (location.hash ? location.hash.replace('#', '') : 'home');
  const validPages = ['home', 'explore', 'detail', 'watch', 'seasonal', 'watchlist', 'profile', 'calendar', 'login'];
  const initialPage = validPages.includes(startPage) ? startPage : 'home';

  if (!history.state) {
    history.replaceState({ page: initialPage }, '', '#' + initialPage);
  }
  window.__currentPage = initialPage;

  if (initialPage !== 'home') {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const p = document.getElementById('page-' + initialPage);
    if (p) p.classList.add('active');
  }

  /* ---------- Init هر بخش ---------- */
  initHome();
  initExplore();
  initWatchlist();
  initWatchlistTabs();
  initProfile();
  initCalendar();
  initCustomSelects();
  bindGlobalEvents();
  bindFullscreenChange();
  bindDownloadOutsideClick();

  /* ---------- به‌روزرسانی دکمه‌های Add/Like بعد از بارگذاری ---------- */
  refreshStoredButtons();
}

/* ============================================
   REFRESH STORED BUTTONS
============================================ */
function refreshStoredButtons() {
  document.querySelectorAll('[data-add-btn]').forEach(btn => {
    const id = parseInt(btn.getAttribute('data-add-btn'));
    if (!isNaN(id) && isInList(id)) {
      btn.classList.add('is-added');
      const svg = btn.querySelector('svg use');
      if (svg) svg.setAttribute('href', '#ico-check');
      const label = btn.querySelector('.add-label');
      if (label) label.textContent = 'Added';
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
document.addEventListener('DOMContentLoaded', init);