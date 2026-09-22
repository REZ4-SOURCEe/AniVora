/* ============================================
   ANIVORA — APP
   Entry point
============================================ */

import {
  showPage, openDrawer, closeDrawer, goFromDrawer, toggleNotif,
  triggerPageLoader, toggleList, toggleLike, showToast,
  initCustomSelects, bindGlobalEvents, isInList, isLiked,
  getListStatus, setListStatus, openListStatusSheet, closeListStatusSheet,
  updateAddBtnUI, getLastPage, setLastPage, isLoggedIn,
  handleDrawerAuth, updateDrawerAuth
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
  toggleClearBtn, clearSearch, addFilter, removeFilter, filterResults,
  renderCharsAndStaff, renderReviews, renderDetailEpisodes,
  removeFromWatchingUI, removeFromFavoritesUI,
  bindWatchlistEvents, restoreStateAfterRefresh,
  renderLoginPage, renderSignupPage, handleLogin, handleSignup, handleLogout,
  initProfile, bindProfileEvents, bindDetailEvents,
  openEditProfileModal, closeEditProfileModal,
  handleAvatarUpload, removeAvatar, saveProfileChanges
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

window.openListStatusSheet = openListStatusSheet;
window.closeListStatusSheet = closeListStatusSheet;
window.getListStatus = getListStatus;
window.setListStatus = setListStatus;

/* ★ Drawer Auth */
window.handleDrawerAuth = handleDrawerAuth;
window.updateDrawerAuth = updateDrawerAuth;

/* Auth */
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.handleLogout = handleLogout;
window.goToProfile = function() {
  if (isLoggedIn()) showPage('profile');
  else showPage('login');
};

/* Edit Profile */
window.openEditProfileModal = openEditProfileModal;
window.closeEditProfileModal = closeEditProfileModal;
window.handleAvatarUpload = handleAvatarUpload;
window.removeAvatar = removeAvatar;
window.saveProfileChanges = saveProfileChanges;

/* ============================================
   INIT
============================================ */
function init() {
  renderLoginPage();
  renderSignupPage();

  initHome();
  initExplore();
  initWatchlist();
  initWatchlistTabs();
  initCalendar();
  initCustomSelects();
  bindGlobalEvents();
  bindFullscreenChange();
  bindDownloadOutsideClick();
  bindWatchlistEvents();
  bindProfileEvents();
  bindDetailEvents();
  bindPlayerKeyboard();
  bindPlayerMouseMove();

  // ★ آپدیت اولیه drawer auth
  updateDrawerAuth();

  if (isLoggedIn()) initProfile();

  const hash = location.hash ? location.hash.replace('#', '') : 'home';
  const validPages = ['home', 'explore', 'detail', 'watch', 'seasonal', 'watchlist', 'profile', 'calendar', 'login', 'signup'];

  const isFirstVisit = !sessionStorage.getItem('anivora_visited');

  if (isFirstVisit) {
    sessionStorage.setItem('anivora_visited', '1');
    setLastPage(null);

    if (!history.state) {
      history.replaceState({ page: 'home' }, '', '#home');
    }
    window.__currentPage = 'home';

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const p = document.getElementById('page-home');
    if (p) p.classList.add('active');
  } else {
    const isRestoreHash = hash === 'watch' || hash === 'detail';

    if (isRestoreHash) {
      const restored = restoreStateAfterRefresh();
      if (restored) {
        window.__currentPage = hash;
      } else {
        setLastPage(null);
        history.replaceState({ page: 'home' }, '', '#home');
        window.__currentPage = 'home';
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        const p = document.getElementById('page-home');
        if (p) p.classList.add('active');
      }
    } else if (validPages.includes(hash) && hash !== 'home') {
      let pageId = hash;
      if (pageId === 'profile' && !isLoggedIn()) pageId = 'login';

      window.__currentPage = pageId;
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      const p = document.getElementById('page-' + pageId);
      if (p) p.classList.add('active');

      if (!history.state) {
        history.replaceState({ page: pageId }, '', '#' + pageId);
      }
    } else {
      setLastPage(null);
      history.replaceState({ page: 'home' }, '', '#home');
      window.__currentPage = 'home';
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      const p = document.getElementById('page-home');
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