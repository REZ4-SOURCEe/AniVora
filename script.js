/* ============================================
   PAGE LOADER
============================================ */
let loaderTimeout = null;
function triggerPageLoader() {
  const loader = document.getElementById('pageLoader');
  if (!loader) return;
  loader.classList.add('active');
  clearTimeout(loaderTimeout);
  loaderTimeout = setTimeout(() => {
    loader.classList.remove('active');
  }, 400);
}

/* ============================================
   NAVIGATION
============================================ */
function showPage(id, skipHistory) {
  if (window.__currentPage === id && !skipHistory) return;
  triggerPageLoader();
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const page = document.getElementById('page-'+id);
  if(page) {
    page.classList.add('active');
    window.scrollTo(0,0);
  }
  document.getElementById('notifPanel').classList.remove('open');
  updateBottomNav(id);
  if (!skipHistory) history.pushState({ page: id }, '', '#' + id);
  window.__currentPage = id;
}

function updateBottomNav(id) {
  const items = document.querySelectorAll('.bottom-nav-item');
  items.forEach(it => it.classList.remove('active'));
  const map = { 'home': 0, 'explore': 1, 'seasonal': 2, 'watchlist': 3, 'profile': 4 };
  const idx = map[id];
  if (idx !== undefined && items[idx]) items[idx].classList.add('active');
}

function openDrawer() {
  const drawer = document.getElementById('mobileDrawer');
  const overlay = document.getElementById('drawerOverlay');
  if (drawer) drawer.classList.add('open');
  if (overlay) overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeDrawer() {
  const drawer = document.getElementById('mobileDrawer');
  const overlay = document.getElementById('drawerOverlay');
  if (drawer) drawer.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}
function goFromDrawer(pageId) {
  closeDrawer();
  setTimeout(() => {
    showPage(pageId);
  }, 200);
}
function toggleNotif() {
  document.getElementById('notifPanel').classList.toggle('open');
}
document.addEventListener('click',e=>{
  if(!e.target.closest('#notifPanel')&&!e.target.closest('[onclick="toggleNotif()"]'))
    document.getElementById('notifPanel').classList.remove('open');
});

window.addEventListener('popstate', function(e) {
  if (e.state && e.state.page) showPage(e.state.page, true);
  else showPage('home', true);
});

/* ============================================
   TABS
============================================ */
function switchTab(btn,panelId) {
  btn.closest('.detail-tabs').querySelectorAll('.tab-btn').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
  btn.closest('.detail-main').querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
  document.getElementById(panelId).classList.add('active');
}
function switchProfileTab(btn,panelId) {
  btn.closest('.profile-tabs').querySelectorAll('.tab-btn').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.profile-content .tab-panel').forEach(p=>p.classList.remove('active'));
  document.getElementById(panelId).classList.add('active');
}

/* ============================================
   CARD RENDERER
============================================ */
function renderAnimeCard(a) {
  const sc = a.status==='Airing'?'status-airing':a.status==='Upcoming'?'status-upcoming':'status-finished';
  return `
    <div class="anime-card" onclick="openAnimeDetail(${a.id})">
      <div class="card-poster">
        <img src="${a.img}" alt="${a.title}" loading="lazy">
        <div class="card-score">
          <svg style="width:10px;height:10px;fill:var(--gold);stroke:none;"><use href="#ico-star"/></svg>
          ${a.score}
        </div>
        <div class="card-type">${a.type}</div>
        ${a.status==='Airing'?'<div class="card-airing-dot"></div>':''}
        <div class="card-poster-overlay">
          <button class="card-watch-btn" onclick="event.stopPropagation();watchAnime(${a.id})">Watch</button>
          <button class="card-list-btn" onclick="event.stopPropagation()">Add</button>
        </div>
      </div>
      <div class="card-body">
        <div class="card-title">${a.title}</div>
        <div class="card-meta">
          <span class="card-meta-item">${a.year}</span>
          <span class="status-badge ${sc}" style="font-size:9px;padding:1px 5px;">${a.status}</span>
        </div>
        <div class="card-meta" style="margin-top:2px;"><span class="card-meta-item">${a.eps} eps</span></div>
        <div class="card-genres">${a.genres.slice(0,2).map(g=>`<span class="card-genre-tag">${g}</span>`).join('')}</div>
      </div>
    </div>`;
}

function shuffle(arr) { return [...arr].sort(()=>Math.random()-0.5); }
function populateSection(id,data) {
  const el=document.getElementById(id);
  if(el) el.innerHTML=data.map(a=>renderAnimeCard(a)).join('');
}

/* ============================================
   ANIME DETAIL
============================================ */
function openAnimeDetail(animeId) {
  const anime = ANIME_DATA.find(a => a.id === animeId);
  if (!anime) return;
  window.__currentAnime = anime;

  const posterImg = document.querySelector('#page-detail .detail-poster img');
  if (posterImg) posterImg.src = anime.img;
  document.querySelector('.detail-jp-title').textContent = anime.jp || '';
  document.querySelector('.detail-title').textContent = anime.title;

  document.querySelector('.detail-stats-row').innerHTML = `
    <div class="detail-stat"><span class="detail-stat-label">Score</span><span class="detail-stat-value" style="color:var(--gold);display:flex;align-items:center;gap:4px;"><svg class="icon icon-sm" style="fill:var(--gold);stroke:none;"><use href="#ico-star"/></svg> ${anime.score}</span></div>
    <div class="detail-stat"><span class="detail-stat-label">Year</span><span class="detail-stat-value">${anime.year}</span></div>
    <div class="detail-stat"><span class="detail-stat-label">Status</span><span class="status-badge ${anime.status==='Airing'?'status-airing':'status-finished'}">${anime.status}</span></div>
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

  renderDetailEpisodes(anime);
  showPage('detail');
}

function renderDetailEpisodes(anime) {
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

/* ============================================
   OPEN EPISODE
============================================ */
function openEpisode(animeId, epNum) {
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
  }, 100);
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
  isPlaying = false;
  const center = document.getElementById('playerCenter');
  if (center) center.classList.remove('hidden');

  video.addEventListener('timeupdate', updatePlayerTime);
  video.addEventListener('loadedmetadata', updatePlayerTime);
}

function updatePlayerTime() {
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

function formatTime(sec) {
  if (!sec || isNaN(sec)) return '00:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function renderWatchSidebar(anime, currentEpNum) {
  const list = document.getElementById('sidebarEpList');
  if (!list) return;
  list.innerHTML = anime.episodes.map(ep => `
    <div class="sidebar-ep-item ${ep.num===currentEpNum?'active':''}" onclick="openEpisode(${anime.id}, ${ep.num})">
      <div class="sidebar-ep-thumb" style="background:linear-gradient(135deg,var(--bg-elevated),var(--bg-card));display:flex;align-items:center;justify-content:center;">
        <svg class="icon icon-sm" style="color:var(--text-muted);"><use href="#ico-play"/></svg>
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
    <div style="flex-shrink:0;width:200px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);overflow:hidden;cursor:pointer;" onclick="openEpisode(${anime.id}, ${ep.num})">
      <div style="height:110px;background:linear-gradient(135deg,var(--bg-elevated),var(--bg-card));display:flex;align-items:center;justify-content:center;">
        <svg class="icon icon-lg" style="color:var(--text-muted);"><use href="#ico-play"/></svg>
      </div>
      <div style="padding:10px;">
        <div style="font-size:10.5px;color:var(--text-muted);">Episode ${ep.num}</div>
        <div style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${ep.title}</div>
      </div>
    </div>
  `).join('');
}

function watchAnime(animeId) {
  const anime = ANIME_DATA.find(a => a.id === animeId);
  if (!anime || !anime.episodes || anime.episodes.length === 0) return;
  openEpisode(animeId, anime.episodes[0].num);
}

/* ============================================
   CONTINUE WATCHING
============================================ */
function initContinueWatching() {
  const row = document.getElementById('continueRow');
  if(!row || typeof CONTINUE_WATCHING === 'undefined') return;
  row.innerHTML = CONTINUE_WATCHING.map(d=>`
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
   INIT SECTIONS
============================================ */
function initSections() {
  populateSection('trendingRow', shuffle(ANIME_DATA).slice(0,10));
  populateSection('newEpsRow', shuffle(ANIME_DATA).slice(0,8));
  populateSection('ratedRow', [...ANIME_DATA].sort((a,b)=>b.score-a.score).slice(0,8));
  populateSection('seasonalGrid', shuffle(ANIME_DATA).slice(0,16));
}

/* ============================================
   SEARCH
============================================ */
let activeFilters = [];
function toggleClearBtn() {
  const input = document.getElementById('mainSearchInput');
  const btn = document.getElementById('searchClearBtn');
  if (!input || !btn) return;
  if (input.value.length > 0) btn.classList.add('visible');
  else btn.classList.remove('visible');
}
function clearSearch() {
  const input = document.getElementById('mainSearchInput');
  if (!input) return;
  input.value = '';
  input.focus();
  toggleClearBtn();
  filterResults();
}
function addFilter(val,type) {
  if(!val) return;
  const key=`${type}: ${val}`;
  if(!activeFilters.find(f=>f.key===key)) {
    activeFilters.push({key,type,val});
    renderActiveFilters();
    filterResults();
  }
}
function renderActiveFilters() {
  const el = document.getElementById('activeFilters');
  if(!el) return;
  el.innerHTML = activeFilters.map((f,i)=>`
    <span class="active-filter-tag">${f.key}<span class="active-filter-remove" onclick="removeFilter(${i})"><svg style="width:13px;height:13px;"><use href="#ico-x"/></svg></span></span>`).join('');
}
function removeFilter(idx) {
  activeFilters.splice(idx,1);
  renderActiveFilters();
  filterResults();
}
function filterResults() {
  const q=(document.getElementById('mainSearchInput')?.value||'').toLowerCase();
  let res=[...ANIME_DATA];
  if(q) res=res.filter(a=>a.title.toLowerCase().includes(q)||(a.jp||'').toLowerCase().includes(q));
  activeFilters.forEach(f=>{
    if(f.type==='Type') res=res.filter(a=>a.type===f.val);
    if(f.type==='Status') res=res.filter(a=>a.status===f.val);
    if(f.type==='Genre') res=res.filter(a=>a.genres.includes(f.val));
  });
  const grid=document.getElementById('resultsGrid');
  const cnt=document.getElementById('resultCount');
  if(grid) grid.innerHTML=res.map(a=>renderAnimeCard(a)).join('');
  if(cnt) cnt.textContent=res.length;
}

/* ============================================
   CHARACTERS & STAFF
============================================ */
function initChars() {
  const grid=document.getElementById('charGrid');
  if(grid && typeof CHARACTERS !== 'undefined') {
    grid.innerHTML=CHARACTERS.map(c=>`
      <div style="display:flex;align-items:center;gap:12px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);padding:12px;">
        <img src="${c.img}" style="width:52px;height:52px;border-radius:50%;object-fit:cover;flex-shrink:0;" alt="">
        <div>
          <div style="font-size:13.5px;font-weight:600;">${c.name}</div>
          <div style="font-size:11.5px;color:var(--text-muted);margin-top:2px;">${c.role}</div>
        </div>
      </div>`).join('');
  }
  const staff=document.getElementById('staffGrid');
  if(staff && typeof STAFF_DATA !== 'undefined') {
    staff.innerHTML=STAFF_DATA.map(s=>`
      <div style="display:flex;align-items:center;gap:12px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);padding:12px;">
        <img src="${s.img}" style="width:52px;height:52px;border-radius:50%;object-fit:cover;flex-shrink:0;" alt="">
        <div>
          <div style="font-size:13.5px;font-weight:600;">${s.name}</div>
          <div style="font-size:11.5px;color:var(--text-muted);margin-top:2px;">${s.role}</div>
        </div>
      </div>`).join('');
  }
}

/* ============================================
   REVIEWS
============================================ */
function initReviews() {
  const list=document.getElementById('reviewsList');
  if(!list || typeof REVIEWS === 'undefined') return;
  list.innerHTML=REVIEWS.map(r=>`
    <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);padding:16px;margin-bottom:12px;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
        <div style="width:34px;height:34px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;">${r.initial}</div>
        <div>
          <div style="font-size:13.5px;font-weight:600;">${r.user}</div>
          <div style="font-size:11px;color:var(--text-muted);">${r.date}</div>
        </div>
        <div style="margin-left:auto;display:flex;align-items:center;gap:4px;font-weight:700;font-size:13px;color:var(--gold);">
          <svg style="width:13px;height:13px;fill:var(--gold);stroke:none;"><use href="#ico-star"/></svg> ${r.score}/10
        </div>
      </div>
      <p style="font-size:13.5px;color:var(--text-secondary);line-height:1.65;">${r.text}</p>
    </div>`).join('');
}

/* ============================================
   CALENDAR
============================================ */
function initCalendar() {
  const grid = document.getElementById('calendarGrid');
  if (!grid || typeof CALENDAR_DATA === 'undefined') return;
  const days = Object.keys(CALENDAR_DATA);
  const today = "Saturday";
  grid.innerHTML = days.map(day => `
    <div class="cal-day ${day===today?'today':''}">
      <div class="cal-day-header">${day.slice(0,3)}</div>
      ${CALENDAR_DATA[day].map((show) => `
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

/* ============================================
   WATCHLIST
============================================ */
function initWatchlist() {
  const el=document.getElementById('watchlistContent');
  if(!el) return;
  el.innerHTML=ANIME_DATA.map(a=>`
    <div style="display:flex;align-items:center;gap:14px;padding:12px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);margin-bottom:8px;cursor:pointer;" onclick="openAnimeDetail(${a.id})">
      <img src="${a.img}" style="width:54px;height:78px;border-radius:8px;object-fit:cover;" alt="">
      <div style="flex:1;">
        <div style="font-size:14px;font-weight:600;">${a.title}</div>
        <div style="font-size:12px;color:var(--text-muted);">${a.type} · ${a.year} · ${a.eps} eps</div>
      </div>
      <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();watchAnime(${a.id})">
        <svg class="icon icon-sm" style="fill:#fff;stroke:none;"><use href="#ico-play"/></svg>
      </button>
    </div>`).join('');
}

/* ============================================
   PROFILE
============================================ */
function initProfile() {
  const activity=document.getElementById('recentActivity');
  if(activity) {
    const acts=[
      {title:"Jujutsu Kaisen",desc:"Watched Episode 12",time:"2 hours ago",img:"https://picsum.photos/44/44?random=501"},
      {title:"Jujutsu Kaisen",desc:"Watched Episode 11",time:"Yesterday",img:"https://picsum.photos/44/44?random=502"},
      {title:"Jujutsu Kaisen",desc:"Rated 9/10",time:"2 days ago",img:"https://picsum.photos/44/44?random=503"},
    ];
    activity.innerHTML=acts.map(a=>`
      <div style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);margin-bottom:8px;">
        <img src="${a.img}" style="width:44px;height:44px;border-radius:8px;object-fit:cover;flex-shrink:0;" alt="">
        <div style="flex:1;">
          <div style="font-size:13.5px;font-weight:600;">${a.title}</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">${a.desc} · ${a.time}</div>
        </div>
        <svg class="icon icon-sm" style="color:var(--text-muted);"><use href="#ico-chevron-r"/></svg>
      </div>`).join('');
  }

  const genres=[{name:"Action",pct:78},{name:"Supernatural",pct:65},{name:"Drama",pct:52},{name:"Sci-Fi",pct:40},{name:"Romance",pct:28}];
  const gp=document.getElementById('genreProgress');
  if(gp) {
    gp.innerHTML=genres.map(g=>`
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

  populateSection('favoritesGrid', shuffle(ANIME_DATA).slice(0,8));

  const hist=document.getElementById('historyList');
  if(hist) hist.innerHTML='<p style="color:var(--text-muted);font-size:13px;padding:12px;">No history yet.</p>';

  const tg=document.getElementById('topGenres');
  if(tg) {
    const gs=[{name:"Action",n:56},{name:"Supernatural",n:42},{name:"Drama",n:35},{name:"Sci-Fi",n:28},{name:"Romance",n:18}];
    const max=gs[0].n;
    tg.innerHTML=gs.map(g=>`
      <div style="margin-bottom:10px;">
        <div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:3px;">
          <span style="color:var(--text-secondary);">${g.name}</span>
          <span style="color:var(--text-primary);font-weight:600;">${g.n}</span>
        </div>
        <div style="height:3px;background:var(--bg-elevated);border-radius:2px;">
          <div style="height:100%;background:var(--accent);border-radius:2px;width:${(g.n/max)*100}%;"></div>
        </div>
      </div>`).join('');
  }

  const sd=document.getElementById('scoreDist');
  if(sd) {
    const scores=[{s:"10",n:8},{s:"9",n:18},{s:"8",n:25},{s:"7",n:14},{s:"6",n:7},{s:"5",n:3},{s:"≤4",n:1}];
    const max=25;
    sd.innerHTML=scores.map(s=>`
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
        <span style="font-size:11.5px;color:var(--text-muted);width:24px;text-align:right;">${s.s}</span>
        <div style="flex:1;height:14px;background:var(--bg-elevated);border-radius:3px;overflow:hidden;">
          <div style="height:100%;background:var(--accent);border-radius:3px;width:${(s.n/max)*100}%;opacity:0.85;"></div>
        </div>
        <span style="font-size:11px;color:var(--text-muted);width:20px;">${s.n}</span>
      </div>`).join('');
  }

  const wby=document.getElementById('watchByYear');
  if(wby) {
    const years=[{y:"2024",n:24},{y:"2023",n:38},{y:"2022",n:42},{y:"2021",n:30},{y:"2020",n:28}];
    const max=42;
    wby.innerHTML=years.map(y=>`
      <div style="margin-bottom:10px;">
        <div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:3px;">
          <span style="color:var(--text-secondary);">${y.y}</span>
          <span style="color:var(--text-primary);font-weight:600;">${y.n} anime</span>
        </div>
        <div style="height:3px;background:var(--bg-elevated);border-radius:2px;">
          <div style="height:100%;background:var(--accent);border-radius:2px;width:${(y.n/max)*100}%;"></div>
        </div>
      </div>`).join('');
  }
}

/* ============================================
   PLAYER
============================================ */
let isPlaying = false;
let hideControlsTimer = null;

function togglePlay(e) {
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

function updatePlayerUI() {
  const center = document.getElementById('playerCenter');
  const ppBtn = document.getElementById('playPauseBtn');
  const playerWrap = document.querySelector('.player-wrap');
  if (isPlaying) {
    if (center) center.classList.add('hidden');
    if (ppBtn) ppBtn.innerHTML = `<svg class="icon icon-md" style="fill:rgba(255,255,255,0.85);stroke:none;"><use href="#ico-pause"/></svg>`;
    if (playerWrap) playerWrap.classList.add('playing');
  } else {
    if (center) center.classList.remove('hidden');
    if (ppBtn) ppBtn.innerHTML = `<svg class="icon icon-md" style="fill:rgba(255,255,255,0.85);stroke:none;"><use href="#ico-play"/></svg>`;
    if (playerWrap) playerWrap.classList.remove('playing');
  }
}

function handlePlayerTap(e) {
  if (e.target.closest('button') || e.target.closest('select') || e.target.closest('.player-progress')) return;
  const playerWrap = document.querySelector('.player-wrap');
  if (!playerWrap) return;
  if (!isPlaying) { togglePlay(); return; }
  playerWrap.classList.toggle('playing');
}

function seekPlayer(e) {
  e.stopPropagation();
  const bar = e.currentTarget;
  const rect = bar.getBoundingClientRect();
  const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  const video = window.__realVideo;
  if (video && video.duration) video.currentTime = pct * video.duration;
  const el = document.getElementById('playerProgress');
  if (el) el.style.width = (pct * 100) + '%';
}

/* ============================================
   FULLSCREEN
============================================ */
function toggleFullscreen(e) {
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

document.addEventListener('fullscreenchange', () => {
  const btn = document.getElementById('fullscreenBtn');
  if (!btn) return;
  btn.innerHTML = document.fullscreenElement
    ? `<svg class="icon icon-md"><use href="#ico-minimize"/></svg>`
    : `<svg class="icon icon-md"><use href="#ico-maximize"/></svg>`;
});

/* ============================================
   DETAIL HELPERS
============================================ */
function toggleDesc() {
  const desc=document.getElementById('detailDesc');
  const btn=document.getElementById('readMoreBtn');
  if(!desc||!btn) return;
  desc.classList.toggle('collapsed');
  btn.textContent=desc.classList.contains('collapsed')?'Read More':'Show Less';
}

/* ============================================
   CUSTOM BOTTOM-SHEET SELECT
============================================ */
function initCustomSelects() {
  document.querySelectorAll('select').forEach(sel => {
    sel.addEventListener('mousedown', handleCustomSelect);
    sel.addEventListener('touchstart', handleCustomSelect, {passive: false});
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
  requestAnimationFrame(() => { overlay.classList.add('show'); sheet.classList.add('show'); });
  document.body.style.overflow = 'hidden';
}
function closeCustomSheet() {
  const overlay = document.querySelector('.custom-select-overlay');
  const sheet = document.querySelector('.custom-select-sheet');
  if (overlay) { overlay.classList.remove('show'); setTimeout(() => overlay.remove(), 250); }
  if (sheet) { sheet.classList.remove('show'); setTimeout(() => sheet.remove(), 300); }
  document.body.style.overflow = '';
}
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCustomSheet(); });

/* ============================================
   INIT
============================================ */
function init() {
  const startPage = (location.hash ? location.hash.replace('#','') : 'home');
  const validPages = ['home','explore','detail','watch','seasonal','watchlist','profile','calendar','login'];
  const initialPage = validPages.includes(startPage) ? startPage : 'home';

  if (!history.state) history.replaceState({ page: initialPage }, '', '#' + initialPage);
  window.__currentPage = initialPage;

  if (initialPage !== 'home') {
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    const p = document.getElementById('page-'+initialPage);
    if (p) p.classList.add('active');
  }

  initContinueWatching();
  initSections();
  filterResults();
  initChars();
  initReviews();
  initCalendar();
  initWatchlist();
  initProfile();
  updateBottomNav(initialPage);
  initCustomSelects();
}

document.addEventListener('DOMContentLoaded', init);

document.addEventListener('error',e=>{
  if(e.target.tagName==='IMG') {
    e.target.src=`https://picsum.photos/200/300?random=${Math.floor(Math.random()*999)+1}`;
  }
},true);