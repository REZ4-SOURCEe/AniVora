/* ============================================
   ANIVORA — APP
   Entry point
============================================ */

import {
  showPage, openDrawer, closeDrawer, goFromDrawer, toggleNotif,
  triggerPageLoader, toggleList, toggleLike, showToast,
  initCustomSelects, bindGlobalEvents, isInList, isLiked,
  getListStatus, setListStatus, openListStatusSheet, closeListStatusSheet,
  updateAddBtnUI, getLastPage
} from './core.js';

import {
  toggleDownloadMenu, shareAnime, togglePlay, handlePlayerTap,
  seekPlayer, toggleFullscreen, bindFullscreenChange, bindDownloadOutsideClick,
  renderAnimeCard, populateSection,
  toggleMute, playNextEpisode, initQualitySelector, initSpeedSelector,
  bindPlayerKeyboard, bindPlayerMouseMove
} from './components.js';

import {
  initHome, initExplore, initWatchlist, initWatchlistTabs, initProfile,
  initCalendar, openAnimeDetail, openEpisode, watchAnime,
  toggleDesc, switchTab, switchProfileTab,
  toggleClearBtn, clearSearch, addFilter, removeFilter, filterResults,
  renderCharsAndStaff, renderReviews, renderDetailEpisodes,
  removeFromWatchingUI, removeFromFavoritesUI,
  bindWatchlistEvents, restoreStateAfterRefresh
} from './pages.js';

import { ANIME_DATA } from './data.js';

/* ============================================
   EXPOSE ANIME_DATA TO WINDOW
============================================ */
window.__animeData = {};
ANIME_DATA.forEach(a => { window.__animeData[a.id] = a; });

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
window.toggleClearBtn = toggleClearBtn;
window.clearSearch = clearSearch;
window.addFilter = addFilter;
window.removeFilter = removeFilter;
window.filterResults = filterResults;
window.removeFromWatchingUI = removeFromWatchingUI;
window.removeFromFavoritesUI = removeFromFavoritesUI;

/* List status sheet */
window.openListStatusSheet = openListStatusSheet;
window.closeListStatusSheet = closeListStatusSheet;
window.getListStatus = getListStatus;
window.setListStatus = setListStatus;

/* ============================================
   INIT
============================================ */
function init() {
  // ★ اول init عمومی
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
  bindWatchlistEvents();

  // ★ کیبورد + موس پلیر
  bindPlayerKeyboard();
  bindPlayerMouseMove();

  // ★ بررسی State قبلی
  const lastPage = getLastPage();
  if (lastPage && lastPage.page && lastPage.page !== 'home') {
    // بازیابی صفحه قبلی
    const restored = restoreStateAfterRefresh();
    if (!restored) {
      // اگه بازیابی نشد → home
      showPage('home', true);
      window.__currentPage = 'home';
    } else {
      window.__currentPage = lastPage.page;
    }
  } else {
    // صفحه پیش‌فرض
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
  }

  refreshStoredButtons();
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

document.addEventListener('DOMContentLoaded', init);