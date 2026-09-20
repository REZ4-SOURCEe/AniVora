/* ============================================
   ANIVORA — CORE
   store, router, toast, helpers, custom-select
============================================ */

/* ============================================
   PAGE LOADER
============================================ */
let loaderTimeout = null;

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
   STORE (localStorage: list + likes)
============================================ */
const LIST_KEY = 'anivora_list';
const LIKES_KEY = 'anivora_likes';

export function getStore(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; }
  catch(e) { return []; }
}
export function setStore(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch(e) {}
}

export function isInList(animeId) {
  return getStore(LIST_KEY).includes(animeId);
}
export function toggleList(animeId, btn) {
  let list = getStore(LIST_KEY);
  if (list.includes(animeId)) list = list.filter(id => id !== animeId);
  else list.push(animeId);
  setStore(LIST_KEY, list);

  document.querySelectorAll(`[data-add-btn="${animeId}"]`).forEach(b => updateAddBtnUI(b, animeId));
  if (btn) updateAddBtnUI(btn, animeId);
}
export function updateAddBtnUI(btn, animeId) {
  if (!btn) return;
  const added = isInList(animeId);
  const icon = added ? 'ico-check' : 'ico-plus';
  const label = added ? 'Added' : 'Add to List';
  // سازگاری با دکمه‌های کوچک (فقط آیکون)
  const hasLabel = btn.textContent.trim().length > 0 || btn.querySelector('.add-label');
  if (hasLabel) {
    const labelEl = btn.querySelector('.add-label');
    if (labelEl) {
      labelEl.textContent = label;
      const svg = btn.querySelector('svg use');
      if (svg) svg.setAttribute('href', `#${icon}`);
    } else {
      btn.innerHTML = `<svg class="icon icon-sm"><use href="#${icon}"/></svg> ${label}`;
    }
  } else {
    const svg = btn.querySelector('svg use');
    if (svg) svg.setAttribute('href', `#${icon}`);
  }
  btn.classList.toggle('is-added', added);
}

export function isLiked(animeId) {
  return getStore(LIKES_KEY).includes(animeId);
}
export function toggleLike(animeId, btn) {
  let likes = getStore(LIKES_KEY);
  if (likes.includes(animeId)) likes = likes.filter(id => id !== animeId);
  else likes.push(animeId);
  setStore(LIKES_KEY, likes);

  document.querySelectorAll(`[data-like-btn="${animeId}"]`).forEach(b => updateLikeBtnUI(b, animeId));
  if (btn) updateLikeBtnUI(btn, animeId);
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
  return [...arr].sort(() => Math.random() - 0.5);
}
export function formatTime(sec) {
  if (!sec || isNaN(sec)) return '00:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

/* ============================================
   ROUTER
============================================ */
export function showPage(id, skipHistory) {
  if (window.__currentPage === id && !skipHistory) return;
  triggerPageLoader();

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById('page-' + id);
  if (page) {
    page.classList.add('active');
    window.scrollTo(0, 0);
  }

  const notif = document.getElementById('notifPanel');
  if (notif) notif.classList.remove('open');

  updateBottomNav(id);

  if (!skipHistory) history.pushState({ page: id }, '', '#' + id);
  window.__currentPage = id;
}

export function updateBottomNav(id) {
  const items = document.querySelectorAll('.bottom-nav-item');
  items.forEach(it => it.classList.remove('active'));
  const map = { 'home': 0, 'explore': 1, 'seasonal': 2, 'watchlist': 3, 'profile': 4 };
  const idx = map[id];
  if (idx !== undefined && items[idx]) items[idx].classList.add('active');
}

/* DRAWER */
export function openDrawer() {
  const drawer = document.getElementById('mobileDrawer');
  const overlay = document.getElementById('drawerOverlay');
  if (drawer) drawer.classList.add('open');
  if (overlay) overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
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

/* NOTIFICATIONS */
export function toggleNotif() {
  document.getElementById('notifPanel')?.classList.toggle('open');
}

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

  requestAnimationFrame(() => {
    overlay.classList.add('show');
    sheet.classList.add('show');
  });
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
  // close notif on outside click
  document.addEventListener('click', e => {
    if (!e.target.closest('#notifPanel') && !e.target.closest('[onclick="toggleNotif()"]')) {
      document.getElementById('notifPanel')?.classList.remove('open');
    }
  });

  // close custom sheet on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeCustomSheet();
  });

  // image error fallback
  document.addEventListener('error', e => {
    if (e.target.tagName === 'IMG') {
      e.target.src = `https://picsum.photos/200/300?random=${Math.floor(Math.random()*999)+1}`;
    }
  }, true);

  // browser back/forward
  window.addEventListener('popstate', function(e) {
    if (e.state && e.state.page) showPage(e.state.page, true);
    else showPage('home', true);
  });
}