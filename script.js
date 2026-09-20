/* ============================================
   DATA
============================================ */
const ANIME_DATA = [
  {id:1,title:"Attack on Titan",jp:"進撃の巨人",score:9.0,year:2013,type:"TV",status:"Finished",eps:87,genres:["Action","Fantasy","Military"],img:"https://picsum.photos/200/300?random=101"},
  {id:2,title:"Demon Slayer",jp:"鬼滅の刃",score:8.7,year:2019,type:"TV",status:"Airing",eps:44,genres:["Action","Supernatural"],img:"https://picsum.photos/200/300?random=102"},
  {id:3,title:"Jujutsu Kaisen",jp:"呪術廻戦",score:8.6,year:2020,type:"TV",status:"Airing",eps:47,genres:["Action","Supernatural"],img:"https://picsum.photos/200/300?random=103"},
  {id:4,title:"My Hero Academia",jp:"僕のヒーローアカデミア",score:7.9,year:2016,type:"TV",status:"Airing",eps:113,genres:["Action","Sci-Fi"],img:"https://picsum.photos/200/300?random=104"},
  {id:5,title:"Chainsaw Man",jp:"チェンソーマン",score:8.5,year:2022,type:"TV",status:"Finished",eps:12,genres:["Action","Horror"],img:"https://picsum.photos/200/300?random=105"},
  {id:6,title:"Spy × Family",jp:"スパイファミリー",score:8.2,year:2022,type:"TV",status:"Airing",eps:37,genres:["Comedy","Action"],img:"https://picsum.photos/200/300?random=106"},
  {id:7,title:"One Piece",jp:"ワンピース",score:8.7,year:1999,type:"TV",status:"Airing",eps:1100,genres:["Action","Adventure"],img:"https://picsum.photos/200/300?random=107"},
  {id:8,title:"Death Note",jp:"デスノート",score:8.6,year:2006,type:"TV",status:"Finished",eps:37,genres:["Mystery","Psychological"],img:"https://picsum.photos/200/300?random=108"},
  {id:9,title:"Vinland Saga",jp:"ヴィンランド・サガ",score:8.8,year:2019,type:"TV",status:"Finished",eps:48,genres:["Action","Drama"],img:"https://picsum.photos/200/300?random=109"},
  {id:10,title:"Mushishi",jp:"蟲師",score:8.7,year:2005,type:"TV",status:"Finished",eps:26,genres:["Mystery","Slice of Life"],img:"https://picsum.photos/200/300?random=110"},
  {id:11,title:"Neon Genesis Evangelion",jp:"新世紀エヴァンゲリオン",score:8.5,year:1995,type:"TV",status:"Finished",eps:26,genres:["Sci-Fi","Psychological"],img:"https://picsum.photos/200/300?random=111"},
  {id:12,title:"Violet Evergarden",jp:"ヴァイオレット・エヴァーガーデン",score:8.7,year:2018,type:"TV",status:"Finished",eps:13,genres:["Drama","Fantasy"],img:"https://picsum.photos/200/300?random=112"},
  {id:13,title:"Steins;Gate",jp:"シュタインズ・ゲート",score:9.1,year:2011,type:"TV",status:"Finished",eps:24,genres:["Sci-Fi","Thriller"],img:"https://picsum.photos/200/300?random=113"},
  {id:14,title:"Hunter x Hunter",jp:"ハンター×ハンター",score:9.0,year:2011,type:"TV",status:"Finished",eps:148,genres:["Action","Adventure"],img:"https://picsum.photos/200/300?random=114"},
  {id:15,title:"Cowboy Bebop",jp:"カウボーイビバップ",score:8.8,year:1998,type:"TV",status:"Finished",eps:26,genres:["Action","Sci-Fi"],img:"https://picsum.photos/200/300?random=115"},
  {id:16,title:"Your Name",jp:"君の名は。",score:8.9,year:2016,type:"Movie",status:"Finished",eps:1,genres:["Drama","Romance"],img:"https://picsum.photos/200/300?random=116"},
  {id:17,title:"Spirited Away",jp:"千と千尋の神隠し",score:8.8,year:2001,type:"Movie",status:"Finished",eps:1,genres:["Fantasy","Adventure"],img:"https://picsum.photos/200/300?random=117"},
  {id:18,title:"Akira",jp:"AKIRA",score:8.0,year:1988,type:"Movie",status:"Finished",eps:1,genres:["Sci-Fi","Action"],img:"https://picsum.photos/200/300?random=118"},
  {id:19,title:"Frieren: Beyond Journey's End",jp:"葬送のフリーレン",score:9.0,year:2023,type:"TV",status:"Finished",eps:28,genres:["Fantasy","Drama"],img:"https://picsum.photos/200/300?random=119"},
  {id:20,title:"Oshi no Ko",jp:"【推しの子】",score:8.7,year:2023,type:"TV",status:"Airing",eps:11,genres:["Drama","Supernatural"],img:"https://picsum.photos/200/300?random=120"},
  {id:21,title:"Blue Lock",jp:"ブルーロック",score:8.3,year:2022,type:"TV",status:"Airing",eps:24,genres:["Sports","Action"],img:"https://picsum.photos/200/300?random=121"},
  {id:22,title:"The Garden of Words",jp:"言の葉の庭",score:8.1,year:2013,type:"Movie",status:"Finished",eps:1,genres:["Drama","Romance"],img:"https://picsum.photos/200/300?random=122"},
  {id:23,title:"Made in Abyss",jp:"メイドインアビス",score:8.7,year:2017,type:"TV",status:"Finished",eps:13,genres:["Adventure","Fantasy"],img:"https://picsum.photos/200/300?random=123"},
  {id:24,title:"Ping Pong The Animation",jp:"ピンポン THE ANIMATION",score:8.6,year:2014,type:"TV",status:"Finished",eps:11,genres:["Sports","Drama"],img:"https://picsum.photos/200/300?random=124"},
];

const EPISODES_DATA = Array.from({length:24},(_,i)=>({
  num:i+1,
  title:["The Day It Began","The Struggle","Dark Secrets","A New Alliance","Truth Revealed","The Long Journey","Shadows Fall","Breaking Point","The Final Stand","Revelations","Into the Void","The Price of Freedom","Bonds of Brotherhood","The Enemy Within","Rising Storm","Last Chance","The Cost of War","A Moment's Peace","Broken Chains","The Path Forward","End of an Era","One Last Battle","The Downfall","Resolution"][i]||`Episode ${i+1}`,
  duration:"24:00",
  watched:i<22,
  img:`https://picsum.photos/160/90?random=${200+i}`,
}));

const CHARACTERS = [
  {name:"Edward Elric",role:"Main Character",img:"https://picsum.photos/80/80?random=301"},
  {name:"Alphonse Elric",role:"Main Character",img:"https://picsum.photos/80/80?random=302"},
  {name:"Roy Mustang",role:"Supporting",img:"https://picsum.photos/80/80?random=303"},
  {name:"Winry Rockbell",role:"Supporting",img:"https://picsum.photos/80/80?random=304"},
  {name:"Riza Hawkeye",role:"Supporting",img:"https://picsum.photos/80/80?random=305"},
  {name:"Scar",role:"Antagonist",img:"https://picsum.photos/80/80?random=306"},
];

const ACHIEVEMENTS = [
  {name:"First Episode",desc:"Watch your first episode",icon:"ico-play",unlocked:true},
  {name:"10 Episodes",desc:"Watch 10 episodes",icon:"ico-tv",unlocked:true},
  {name:"100 Episodes",desc:"Watch 100 episodes",icon:"ico-zap",unlocked:true},
  {name:"500 Episodes",desc:"Watch 500 episodes",icon:"ico-trending",unlocked:true},
  {name:"1000 Episodes",desc:"Watch 1000 episodes",icon:"ico-award",unlocked:false},
  {name:"First Completed",desc:"Complete your first anime",icon:"ico-check",unlocked:true},
  {name:"10 Completed",desc:"Complete 10 anime",icon:"ico-layers",unlocked:true},
  {name:"50 Completed",desc:"Complete 50 anime",icon:"ico-star",unlocked:false},
  {name:"Binge Watcher",desc:"Watch 10+ eps in one day",icon:"ico-clock",unlocked:true},
  {name:"Night Owl",desc:"Watch after midnight",icon:"ico-eye",unlocked:true},
  {name:"Explorer",desc:"Watch 10 different genres",icon:"ico-compass",unlocked:true},
  {name:"Critic",desc:"Write 10 reviews",icon:"ico-msg",unlocked:false},
];

const CALENDAR_DATA = {
  "Monday":["One Piece — Ep 1142","Blue Lock — Ep 24"],
  "Tuesday":["Demon Slayer — Ep 14","Oshi no Ko — Ep 11"],
  "Wednesday":["Jujutsu Kaisen — Ep 47","Spy × Family — Ep 37"],
  "Thursday":["My Hero Academia — Ep 113"],
  "Friday":["Chainsaw Man — Ep 13","Frieren — Ep 29"],
  "Saturday":["Attack on Titan — OVA","Vinland Saga — Ep 49","Made in Abyss — Ep 14"],
  "Sunday":["Violet Evergarden — Special"],
};

const STUDIOS = [
  {name:"Bones",count:48,founded:"1998"},
  {name:"Mappa",count:32,founded:"2011"},
  {name:"Wit Studio",count:24,founded:"2012"},
  {name:"Ufotable",count:18,founded:"2000"},
  {name:"Madhouse",count:65,founded:"1972"},
  {name:"Kyoto Animation",count:42,founded:"1981"},
];

/* ============================================
   NAVIGATION
============================================ */
function showPage(id) {
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const page = document.getElementById('page-'+id);
  if(page) { page.classList.add('active'); window.scrollTo(0,0); }
  document.getElementById('notifPanel').classList.remove('open');
}
function openDrawer() {
  document.getElementById('mobileDrawer').classList.add('open');
  document.getElementById('drawerOverlay').classList.add('open');
}
function closeDrawer() {
  document.getElementById('mobileDrawer').classList.remove('open');
  document.getElementById('drawerOverlay').classList.remove('open');
}
function toggleNotif() {
  document.getElementById('notifPanel').classList.toggle('open');
}
document.addEventListener('click',e=>{
  if(!e.target.closest('#notifPanel')&&!e.target.closest('[onclick="toggleNotif()"]'))
    document.getElementById('notifPanel').classList.remove('open');
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
function switchAdmin(btn,sectionId) {
  document.querySelectorAll('.admin-content > div').forEach(d=>d.style.display='none');
  document.getElementById(sectionId).style.display='block';
  document.querySelectorAll('.admin-menu-item').forEach(i=>i.classList.remove('active'));
  if(btn) btn.classList.add('active');
  if(sectionId==='admin-anime') renderAdminAnimeTable2();
  if(sectionId==='admin-users') renderAdminUserTable2();
  if(sectionId==='admin-genres') renderGenreManagement();
  if(sectionId==='admin-studios') renderStudioTable();
  if(sectionId==='admin-comments') renderCommentTable();
}

/* ============================================
   CARD RENDERER
============================================ */
function renderAnimeCard(a) {
  const sc = a.status==='Airing'?'status-airing':a.status==='Upcoming'?'status-upcoming':'status-finished';
  return `
    <div class="anime-card" onclick="showPage('detail')">
      <div class="card-poster">
        <img src="${a.img}" alt="${a.title}" loading="lazy">
        <div class="card-score">
          <svg style="width:10px;height:10px;fill:var(--gold);stroke:none;"><use href="#ico-star"/></svg>
          ${a.score}
        </div>
        <div class="card-type">${a.type}</div>
        ${a.status==='Airing'?'<div class="card-airing-dot"></div>':''}
        <div class="card-poster-overlay">
          <button class="card-watch-btn" onclick="event.stopPropagation();showPage('watch')">
            <svg style="width:11px;height:11px;fill:#fff;stroke:none;"><use href="#ico-play"/></svg>
            Watch
          </button>
          <button class="card-list-btn" onclick="event.stopPropagation()">
            <svg style="width:11px;height:11px;"><use href="#ico-plus"/></svg>
            Add
          </button>
        </div>
      </div>
      <div class="card-body">
        <div class="card-title">${a.title}</div>
        <div class="card-meta">
          <span class="card-meta-item">${a.year}</span>
          <span class="status-badge ${sc}" style="font-size:9px;padding:1px 5px;">${a.status}</span>
        </div>
        <div class="card-meta" style="margin-top:2px;">
          <span class="card-meta-item">${a.eps} eps</span>
        </div>
        <div class="card-genres">
          ${a.genres.slice(0,2).map(g=>`<span class="card-genre-tag">${g}</span>`).join('')}
        </div>
      </div>
    </div>`;
}

function shuffle(arr) { return [...arr].sort(()=>Math.random()-0.5); }
function populateSection(id,data) {
  const el=document.getElementById(id);
  if(el) el.innerHTML=data.map(a=>renderAnimeCard(a)).join('');
}

/* ============================================
   CONTINUE WATCHING
============================================ */
function initContinueWatching() {
  const data = [
    {title:"Attack on Titan",ep:"S1 E23",progress:68,timeLeft:"9 min",img:"https://picsum.photos/320/180?random=1"},
    {title:"Demon Slayer",ep:"S2 E08",progress:25,timeLeft:"18 min",img:"https://picsum.photos/320/180?random=2"},
    {title:"Jujutsu Kaisen",ep:"S1 E12",progress:90,timeLeft:"2 min",img:"https://picsum.photos/320/180?random=3"},
    {title:"My Hero Academia",ep:"S3 E05",progress:50,timeLeft:"12 min",img:"https://picsum.photos/320/180?random=4"},
    {title:"Chainsaw Man",ep:"S1 E01",progress:10,timeLeft:"22 min",img:"https://picsum.photos/320/180?random=5"},
  ];
  const row = document.getElementById('continueRow');
  if(!row) return;
  row.innerHTML = data.map(d=>`
    <div class="continue-card" onclick="showPage('watch')">
      <div class="continue-thumb">
        <img src="${d.img}" alt="" loading="lazy">
        <div class="continue-overlay">
          <div class="play-circle">
            <svg class="icon icon-md" style="fill:#fff;stroke:none;"><use href="#ico-play"/></svg>
          </div>
        </div>
        <div class="continue-ep-badge">${d.ep}</div>
        <div class="progress-bar-wrap">
          <div class="progress-bar-fill" style="width:${d.progress}%;"></div>
        </div>
      </div>
      <div class="continue-body">
        <div class="continue-title">${d.title}</div>
        <div class="continue-time-left">${d.timeLeft} remaining</div>
        <button class="continue-btn">
          <svg class="icon icon-sm" style="fill:#fff;stroke:none;"><use href="#ico-play"/></svg>
          Continue
        </button>
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
  populateSection('airingRow', ANIME_DATA.filter(a=>a.status==='Airing'));
  populateSection('popularRow', [...ANIME_DATA].sort((a,b)=>b.score-a.score).slice(0,10));
  populateSection('ratedRow', [...ANIME_DATA].sort((a,b)=>b.score-a.score).slice(0,8));
  populateSection('gemsRow', shuffle(ANIME_DATA).filter(a=>a.score<8.5).slice(0,8));
  populateSection('moviesRow', ANIME_DATA.filter(a=>a.type==='Movie'));
  populateSection('recommendedRow', shuffle(ANIME_DATA).slice(0,8));
  populateSection('seasonalGrid', shuffle(ANIME_DATA).slice(0,16));
}

/* ============================================
   SEARCH
============================================ */
let activeFilters = [];
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
    <span class="active-filter-tag">
      ${f.key}
      <span class="active-filter-remove" onclick="removeFilter(${i})">
        <svg style="width:13px;height:13px;"><use href="#ico-x"/></svg>
      </span>
    </span>`).join('');
}
function removeFilter(idx) {
  activeFilters.splice(idx,1);
  renderActiveFilters();
  filterResults();
}
function filterResults() {
  const q=(document.getElementById('mainSearchInput')?.value||'').toLowerCase();
  let res=[...ANIME_DATA];
  if(q) res=res.filter(a=>a.title.toLowerCase().includes(q)||a.jp.toLowerCase().includes(q));
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
   EPISODES
============================================ */
function initEpisodes() {
  const grid=document.getElementById('episodesGrid');
  if(!grid) return;
  grid.innerHTML=EPISODES_DATA.map(ep=>`
    <div class="episode-row" onclick="showPage('watch')">
      <div class="ep-thumb">
        <img src="${ep.img}" alt="" loading="lazy">
        <div class="ep-play">
          <svg class="icon icon-md" style="fill:#fff;stroke:none;"><use href="#ico-play"/></svg>
        </div>
      </div>
      <div class="ep-info">
        <div class="ep-number">Episode ${ep.num}</div>
        <div class="ep-title">${ep.title}</div>
        <div class="ep-duration">${ep.duration}</div>
      </div>
      ${ep.watched?`<span class="ep-watched"><svg class="icon icon-sm" style="color:var(--accent);"><use href="#ico-check"/></svg></span>`:''}
    </div>`).join('');
}

/* ============================================
   CHARACTERS & STAFF
============================================ */
function initChars() {
  const grid=document.getElementById('charGrid');
  if(grid) {
    grid.innerHTML=CHARACTERS.map(c=>`
      <div style="display:flex;align-items:center;gap:12px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);padding:12px;transition:var(--transition);" onmouseover="this.style.borderColor='var(--border-hover)'" onmouseout="this.style.borderColor='var(--border)'">
        <img src="${c.img}" style="width:52px;height:52px;border-radius:50%;object-fit:cover;flex-shrink:0;background:var(--bg-elevated);" alt="">
        <div>
          <div style="font-size:13.5px;font-weight:600;">${c.name}</div>
          <div style="font-size:11.5px;color:var(--text-muted);margin-top:2px;">${c.role}</div>
        </div>
      </div>`).join('');
  }
  const staff=document.getElementById('staffGrid');
  if(staff) {
    const staffData=[
      {name:"Yasuhiro Irie",role:"Director",img:"https://picsum.photos/52/52?random=401"},
      {name:"Noriaki Akitaya",role:"Character Design",img:"https://picsum.photos/52/52?random=402"},
      {name:"Akira Senju",role:"Music Composer",img:"https://picsum.photos/52/52?random=403"},
      {name:"Hiroshi Ohnogi",role:"Screenplay",img:"https://picsum.photos/52/52?random=404"},
    ];
    staff.innerHTML=staffData.map(s=>`
      <div style="display:flex;align-items:center;gap:12px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);padding:12px;">
        <img src="${s.img}" style="width:52px;height:52px;border-radius:50%;object-fit:cover;flex-shrink:0;" alt="">
        <div>
          <div style="font-size:13.5px;font-weight:600;">${s.name}</div>
          <div style="font-size:11.5px;color:var(--text-muted);margin-top:2px;">${s.role}</div>
        </div>
      </div>`).join('');
  }
}

function initRelated() {
  const row=document.getElementById('relatedRow');
  if(!row) return;
  row.style.cssText='display:flex;gap:12px;overflow-x:auto;padding-bottom:8px;scrollbar-width:none;';
  row.innerHTML=shuffle(ANIME_DATA).slice(0,8).map(a=>renderAnimeCard(a)).join('');
}

/* ============================================
   REVIEWS
============================================ */
const REVIEWS = [
  {user:"otaku_master",initial:"O",score:10,text:"An absolute masterpiece. The storytelling, characters, and animation are all top-tier. One of the greatest anime ever made.",date:"2 days ago"},
  {user:"anime_critic",initial:"A",score:9,text:"Phenomenal series with incredible character development. The themes of sacrifice and brotherhood are beautifully executed.",date:"1 week ago"},
  {user:"nakama_spirit",initial:"N",score:10,text:"Every episode had me on the edge of my seat. The ending was perfect and deeply satisfying.",date:"2 weeks ago"},
];
function initReviews() {
  const list=document.getElementById('reviewsList');
  if(!list) return;
  list.innerHTML=REVIEWS.map(r=>`
    <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);padding:16px;margin-bottom:12px;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
        <div style="width:34px;height:34px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;flex-shrink:0;">${r.initial}</div>
        <div>
          <div style="font-size:13.5px;font-weight:600;">${r.user}</div>
          <div style="font-size:11px;color:var(--text-muted);">${r.date}</div>
        </div>
        <div style="margin-left:auto;display:flex;align-items:center;gap:4px;font-weight:700;font-size:13px;color:var(--gold);">
          <svg style="width:13px;height:13px;fill:var(--gold);stroke:none;"><use href="#ico-star"/></svg>
          ${r.score}/10
        </div>
      </div>
      <p style="font-size:13.5px;color:var(--text-secondary);line-height:1.65;">${r.text}</p>
    </div>`).join('');
}
function setRating(n) {
  document.querySelectorAll('#ratingStars .star-btn').forEach((s,i)=>{
    s.style.color=i<n?'var(--gold)':'var(--text-muted)';
  });
}

/* ============================================
   PLAYER
============================================ */
let isPlaying=false, progressInterval;
function togglePlay() {
  isPlaying=!isPlaying;
  const center=document.getElementById('playerCenter');
  const ppBtn=document.getElementById('playPauseBtn');
  if(isPlaying) {
    if(center) center.style.opacity='0';
    if(ppBtn) ppBtn.innerHTML=`<svg class="icon icon-md" style="fill:rgba(255,255,255,0.85);stroke:none;"><use href="#ico-pause"/></svg>`;
    startProgress();
  } else {
    if(center) center.style.opacity='1';
    if(ppBtn) ppBtn.innerHTML=`<svg class="icon icon-md" style="fill:rgba(255,255,255,0.85);stroke:none;"><use href="#ico-play"/></svg>`;
    clearInterval(progressInterval);
  }
}
function startProgress() {
  clearInterval(progressInterval);
  const el=document.getElementById('playerProgress');
  if(!el) return;
  let w=parseFloat(el.style.width)||42;
  progressInterval=setInterval(()=>{
    w=Math.min(w+0.08,100);
    el.style.width=w+'%';
    if(w>=100) clearInterval(progressInterval);
  },100);
}
function seekPlayer(e) {
  const bar=e.currentTarget;
  const rect=bar.getBoundingClientRect();
  const pct=Math.max(0,Math.min(1,(e.clientX-rect.left)/rect.width));
  const el=document.getElementById('playerProgress');
  if(el) el.style.width=(pct*100)+'%';
}

function initSidebarEps() {
  const list=document.getElementById('sidebarEpList');
  if(!list) return;
  list.innerHTML=EPISODES_DATA.slice(0,15).map(ep=>`
    <div class="sidebar-ep-item ${ep.num===23?'active':''}" onclick="showPage('watch')">
      <div class="sidebar-ep-thumb">
        <img src="${ep.img}" alt="" loading="lazy">
      </div>
      <div class="sidebar-ep-info">
        <div class="sidebar-ep-num">Ep ${ep.num}</div>
        <div class="sidebar-ep-name">${ep.title}</div>
        <div class="sidebar-ep-dur">${ep.duration}</div>
      </div>
      ${ep.watched?`<svg class="icon icon-sm" style="color:var(--accent);flex-shrink:0;"><use href="#ico-check"/></svg>`:''}
    </div>`).join('');
}

function initUpNext() {
  const row=document.getElementById('upNextRow');
  if(!row) return;
  row.innerHTML=EPISODES_DATA.slice(23,27).map(ep=>`
    <div style="flex-shrink:0;width:200px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);overflow:hidden;cursor:pointer;transition:var(--transition);" onclick="showPage('watch')" onmouseover="this.style.borderColor='var(--border-hover)'" onmouseout="this.style.borderColor='var(--border)'">
      <div style="height:110px;background:var(--bg-elevated);overflow:hidden;position:relative;">
        <img src="${ep.img}" style="width:100%;height:100%;object-fit:cover;" alt="" loading="lazy">
      </div>
      <div style="padding:10px;">
        <div style="font-size:10.5px;color:var(--text-muted);">Episode ${ep.num}</div>
        <div style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${ep.title}</div>
        <div style="font-size:10.5px;color:var(--text-muted);margin-top:2px;display:flex;align-items:center;gap:3px;">
          <svg style="width:10px;height:10px;"><use href="#ico-clock"/></svg> ${ep.duration}
        </div>
      </div>
    </div>`).join('');
}

/* ============================================
   CALENDAR
============================================ */
function initCalendar() {
  const grid=document.getElementById('calendarGrid');
  if(!grid) return;
  const days=Object.keys(CALENDAR_DATA);
  const today="Saturday";
  grid.innerHTML=days.map(day=>`
    <div class="cal-day ${day===today?'today':''}">
      <div class="cal-day-header">${day.slice(0,3)}</div>
      ${CALENDAR_DATA[day].map((show,i)=>{
        const parts=show.split(' — ');
        const title=parts[0]||show;
        const ep=parts[1]||'';
        return `
        <div class="cal-anime-item" onclick="showPage('detail')">
          <div class="cal-anime-thumb">
            <img src="https://picsum.photos/36/36?random=${300+days.indexOf(day)*10+i}" alt="" loading="lazy">
          </div>
          <div class="cal-anime-info">
            <div class="cal-anime-name">${title}</div>
            <div class="cal-anime-ep">${ep}</div>
          </div>
        </div>`;
      }).join('')}
    </div>`).join('');
}

/* ============================================
   PROFILE
============================================ */
function initProfile() {
  const activity=document.getElementById('recentActivity');
  if(activity) {
    const acts=[
      {title:"Attack on Titan",desc:"Watched Episode 23",time:"2 hours ago",img:"https://picsum.photos/44/44?random=501"},
      {title:"Demon Slayer",desc:"Completed Season 2",time:"Yesterday",img:"https://picsum.photos/44/44?random=502"},
      {title:"Frieren",desc:"Rated 9/10",time:"2 days ago",img:"https://picsum.photos/44/44?random=503"},
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

  const genres=[{name:"Action",pct:78},{name:"Fantasy",pct:65},{name:"Drama",pct:52},{name:"Sci-Fi",pct:40},{name:"Romance",pct:28}];
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

  const ach=document.getElementById('achievementsGrid');
  if(ach) {
    ach.innerHTML=ACHIEVEMENTS.map(a=>`
      <div class="achievement-card ${a.unlocked?'':'locked'}">
        <div class="achievement-icon">
          <svg class="icon icon-md"><use href="#${a.icon}"/></svg>
        </div>
        <div class="achievement-info">
          <div class="achievement-name">${a.name}</div>
          <div class="achievement-desc">${a.desc}</div>
          ${a.unlocked
            ?`<div class="achievement-unlocked"><svg class="icon" style="width:10px;height:10px;"><use href="#ico-check"/></svg> Unlocked</div>`
            :`<div class="achievement-locked">Locked</div>`}
        </div>
      </div>`).join('');
  }

  const hist=document.getElementById('historyList');
  if(hist) {
    hist.innerHTML=EPISODES_DATA.filter(e=>e.watched).reverse().slice(0,8).map((ep,i)=>`
      <div style="display:flex;align-items:center;gap:14px;padding:12px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);margin-bottom:8px;cursor:pointer;transition:var(--transition);" onclick="showPage('watch')" onmouseover="this.style.borderColor='var(--border-hover)'" onmouseout="this.style.borderColor='var(--border)'">
        <div style="width:80px;height:46px;border-radius:6px;overflow:hidden;flex-shrink:0;">
          <img src="${ep.img}" style="width:100%;height:100%;object-fit:cover;" alt="" loading="lazy">
        </div>
        <div style="flex:1;">
          <div style="font-size:13.5px;font-weight:600;">Attack on Titan</div>
          <div style="font-size:12px;color:var(--text-muted);">Episode ${ep.num}: ${ep.title}</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:2px;display:flex;align-items:center;gap:3px;">
            <svg style="width:10px;height:10px;"><use href="#ico-clock"/></svg>
            ${i<2?'Today':i<4?'Yesterday':`${i} days ago`}
          </div>
        </div>
        <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();showPage('watch')">
          <svg class="icon icon-sm" style="fill:currentColor;stroke:none;"><use href="#ico-play"/></svg>
        </button>
      </div>`).join('');
  }

  const tg=document.getElementById('topGenres');
  if(tg) {
    const gs=[{name:"Action",n:56},{name:"Fantasy",n:42},{name:"Drama",n:35},{name:"Sci-Fi",n:28},{name:"Romance",n:18}];
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
   WATCHLIST
============================================ */
function initWatchlist() {
  const el=document.getElementById('watchlistContent');
  if(!el) return;
  el.innerHTML=shuffle(ANIME_DATA).slice(0,12).map(a=>`
    <div style="display:flex;align-items:center;gap:14px;padding:12px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);margin-bottom:8px;cursor:pointer;transition:var(--transition);" onclick="showPage('detail')" onmouseover="this.style.borderColor='var(--border-hover)'" onmouseout="this.style.borderColor='var(--border)'">
      <img src="${a.img}" style="width:54px;height:78px;border-radius:8px;object-fit:cover;flex-shrink:0;" alt="" loading="lazy">
      <div style="flex:1;min-width:0;">
        <div style="font-size:14px;font-weight:600;margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${a.title}</div>
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:6px;">${a.type} · ${a.year} · ${a.eps} eps</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          <span class="status-badge ${a.status==='Airing'?'status-airing':a.status==='Upcoming'?'status-upcoming':'status-finished'}" style="font-size:10px;">${a.status}</span>
          <span class="status-badge status-airing" style="font-size:10px;">Watching</span>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;">
        <span style="color:var(--gold);font-weight:700;font-size:13px;display:flex;align-items:center;gap:3px;">
          <svg style="width:11px;height:11px;fill:var(--gold);stroke:none;"><use href="#ico-star"/></svg> ${a.score}
        </span>
        <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();showPage('watch')">
          <svg class="icon icon-sm" style="fill:#fff;stroke:none;"><use href="#ico-play"/></svg>
        </button>
        <select style="background:var(--bg-elevated);border:1px solid var(--border);color:var(--text-secondary);border-radius:4px;padding:3px 6px;font-size:11px;cursor:pointer;outline:none;" onclick="event.stopPropagation()">
          <option>Watching</option>
          <option>Completed</option>
          <option>Plan to Watch</option>
          <option>On Hold</option>
          <option>Dropped</option>
        </select>
      </div>
    </div>`).join('');
}

/* ============================================
   ADMIN TABLES
============================================ */
function renderAdminAnimeTable() {
  const tbody=document.getElementById('adminAnimeTable');
  if(!tbody) return;
  tbody.innerHTML=ANIME_DATA.slice(0,8).map(a=>`
    <tr>
      <td>
        <div style="display:flex;align-items:center;gap:10px;">
          <img src="${a.img}" style="width:34px;height:50px;border-radius:5px;object-fit:cover;" alt="" loading="lazy">
          <div>
            <div style="font-size:13.5px;font-weight:600;">${a.title}</div>
            <div style="font-size:11px;color:var(--text-muted);">${a.jp}</div>
          </div>
        </div>
      </td>
      <td><span class="badge badge-genre">${a.type}</span></td>
      <td><span class="status-badge ${a.status==='Airing'?'status-airing':a.status==='Upcoming'?'status-upcoming':'status-finished'}">${a.status}</span></td>
      <td style="color:var(--text-secondary);">${a.eps}</td>
      <td style="color:var(--gold);font-weight:600;display:flex;align-items:center;gap:3px;"><svg style="width:11px;height:11px;fill:var(--gold);stroke:none;"><use href="#ico-star"/></svg> ${a.score}</td>
      <td>
        <div class="table-actions">
          <button class="table-btn"><svg class="icon icon-sm"><use href="#ico-edit"/></svg> Edit</button>
          <button class="table-btn"><svg class="icon icon-sm"><use href="#ico-tv"/></svg> Eps</button>
          <button class="table-btn danger"><svg class="icon icon-sm"><use href="#ico-trash"/></svg></button>
        </div>
      </td>
    </tr>`).join('');
}
function renderAdminUserTable() {
  const tbody=document.getElementById('adminUserTable');
  if(!tbody) return;
  const users=["AniSenpai","OtakuKing","SakuraFan","NinjaWatcher","MangaLord","AnimeQueen"];
  tbody.innerHTML=users.map((u,i)=>`
    <tr>
      <td>
        <div style="display:flex;align-items:center;gap:8px;">
          <div style="width:30px;height:30px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;">${u[0]}</div>
          <span style="font-size:13.5px;font-weight:500;">${u}</span>
        </div>
      </td>
      <td style="color:var(--text-secondary);font-size:13px;">${u.toLowerCase()}@example.com</td>
      <td style="color:var(--text-secondary);font-size:13px;">${['2024-06-01','2024-05-28','2024-05-20','2024-05-15','2024-05-10','2024-05-05'][i]}</td>
      <td style="color:var(--text-secondary);font-size:13px;">${[148,94,220,67,312,85][i]}</td>
      <td>
        <div class="table-actions">
          <button class="table-btn"><svg class="icon icon-sm"><use href="#ico-eye"/></svg> View</button>
          <button class="table-btn danger"><svg class="icon icon-sm"><use href="#ico-flag"/></svg> Ban</button>
        </div>
      </td>
    </tr>`).join('');
}
function renderAdminAnimeTable2() {
  const tbody=document.getElementById('adminAnimeTable2');
  if(!tbody) return;
  tbody.innerHTML=ANIME_DATA.map(a=>`
    <tr>
      <td>
        <div style="display:flex;align-items:center;gap:10px;">
          <img src="${a.img}" style="width:28px;height:42px;border-radius:4px;object-fit:cover;" alt="" loading="lazy">
          <div style="font-size:13px;font-weight:600;">${a.title}</div>
        </div>
      </td>
      <td><span class="badge badge-genre">${a.type}</span></td>
      <td><span class="status-badge ${a.status==='Airing'?'status-airing':a.status==='Upcoming'?'status-upcoming':'status-finished'}">${a.status}</span></td>
      <td style="color:var(--text-secondary);">${a.eps}</td>
      <td style="color:var(--gold);font-weight:600;">${a.score}</td>
      <td>
        <div class="table-actions">
          <button class="table-btn"><svg class="icon icon-sm"><use href="#ico-edit"/></svg></button>
          <button class="table-btn danger"><svg class="icon icon-sm"><use href="#ico-trash"/></svg></button>
        </div>
      </td>
    </tr>`).join('');
}
function renderAdminUserTable2() {
  const tbody=document.getElementById('adminUserTable2');
  if(!tbody) return;
  const users=[
    {name:"AniSenpai",email:"senpai@ex.com",role:"User",joined:"2024-06-01"},
    {name:"OtakuKing",email:"king@ex.com",role:"Moderator",joined:"2024-05-28"},
    {name:"AdminUser",email:"admin@aniverse.com",role:"Admin",joined:"2024-01-01"},
  ];
  tbody.innerHTML=users.map(u=>`
    <tr>
      <td>
        <div style="display:flex;align-items:center;gap:8px;">
          <div style="width:30px;height:30px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;">${u.name[0]}</div>
          <span style="font-size:13px;font-weight:500;">${u.name}</span>
        </div>
      </td>
      <td style="color:var(--text-secondary);font-size:13px;">${u.email}</td>
      <td><span class="badge ${u.role==='Admin'?'badge-accent':u.role==='Moderator'?'badge-airing':'badge-genre'}">${u.role}</span></td>
      <td style="color:var(--text-secondary);font-size:13px;">${u.joined}</td>
      <td>
        <div class="table-actions">
          <button class="table-btn"><svg class="icon icon-sm"><use href="#ico-edit"/></svg> Edit</button>
          <button class="table-btn danger"><svg class="icon icon-sm"><use href="#ico-lock"/></svg> Suspend</button>
        </div>
      </td>
    </tr>`).join('');
}
function renderGenreManagement() {
  const el=document.getElementById('genreManagement');
  if(!el) return;
  const genres=["Action","Adventure","Comedy","Drama","Fantasy","Horror","Mystery","Psychological","Romance","Sci-Fi","Slice of Life","Sports","Supernatural","Thriller","Historical","Military","Music","Mecha"];
  el.innerHTML=genres.map(g=>`
    <span style="display:inline-flex;align-items:center;gap:6px;background:var(--bg-elevated);border:1px solid var(--border);color:var(--text-secondary);border-radius:20px;padding:5px 12px;font-size:12.5px;font-weight:500;">
      ${g}
      <span style="cursor:pointer;color:var(--danger);opacity:0.7;display:flex;align-items:center;transition:opacity 0.15s;" onclick="this.parentElement.remove()" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.7">
        <svg style="width:13px;height:13px;"><use href="#ico-x"/></svg>
      </span>
    </span>`).join('');
}
function renderStudioTable() {
  const tbody=document.getElementById('studioTable');
  if(!tbody) return;
  tbody.innerHTML=STUDIOS.map(s=>`
    <tr>
      <td style="font-size:13.5px;font-weight:600;">${s.name}</td>
      <td style="color:var(--text-secondary);">${s.count}</td>
      <td style="color:var(--text-secondary);">${s.founded}</td>
      <td>
        <div class="table-actions">
          <button class="table-btn"><svg class="icon icon-sm"><use href="#ico-edit"/></svg> Edit</button>
          <button class="table-btn danger"><svg class="icon icon-sm"><use href="#ico-trash"/></svg></button>
        </div>
      </td>
    </tr>`).join('');
}
function renderCommentTable() {
  const tbody=document.getElementById('commentTable');
  if(!tbody) return;
  const comments=[
    {user:"otaku_fan",anime:"Attack on Titan",text:"This episode was incredible!",date:"1 hour ago"},
    {user:"sakura_watcher",anime:"Demon Slayer",text:"Best anime of the season by far.",date:"3 hours ago"},
    {user:"ninja_viewer",anime:"Jujutsu Kaisen",text:"The animation quality is on another level.",date:"Yesterday"},
  ];
  tbody.innerHTML=comments.map(c=>`
    <tr>
      <td style="font-size:13px;">${c.user}</td>
      <td style="color:var(--accent);font-size:13px;cursor:pointer;" onclick="showPage('detail')">${c.anime}</td>
      <td style="color:var(--text-secondary);font-size:12.5px;max-width:280px;">${c.text}</td>
      <td style="color:var(--text-muted);font-size:12px;">${c.date}</td>
      <td>
        <div class="table-actions">
          <button class="table-btn"><svg class="icon icon-sm"><use href="#ico-eye"/></svg></button>
          <button class="table-btn danger"><svg class="icon icon-sm"><use href="#ico-trash"/></svg></button>
        </div>
      </td>
    </tr>`).join('');
}

/* ============================================
   AUTH
============================================ */
let isLoginMode=true;
function toggleAuthMode() {
  isLoginMode=!isLoginMode;
  document.getElementById('authTitle').textContent=isLoginMode?'Welcome Back':'Create Account';
  document.getElementById('authSubtitle').textContent=isLoginMode?'Sign in to your account':'Join Anivora today';
  const uw=document.getElementById('usernameGroupWrap');
  if(uw) uw.style.display=isLoginMode?'none':'block';
  const form=document.getElementById('loginForm');
  const btn=form.querySelector('button[onclick*="showPage"]');
  if(btn) btn.textContent=isLoginMode?'Sign In':'Create Account';
  const sw=form.querySelector('.auth-switch');
  if(sw) sw.innerHTML=isLoginMode
    ?`Don't have an account? <a href="#" onclick="toggleAuthMode()">Create one</a>`
    :`Already have an account? <a href="#" onclick="toggleAuthMode()">Sign in</a>`;
}

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
   SECTION REVEAL
============================================ */
function initSectionObserver() {
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting) {
        entry.target.style.opacity='1';
        entry.target.style.transform='translateY(0)';
      }
    });
  },{threshold:0.04});
  document.querySelectorAll('.section').forEach(sec=>{
    sec.style.opacity='0';
    sec.style.transform='translateY(12px)';
    sec.style.transition='opacity 0.3s ease, transform 0.3s ease';
    obs.observe(sec);
  });
}

/* ============================================
   INIT
============================================ */
function init() {
  initContinueWatching();
  initSections();
  filterResults();
  initEpisodes();
  initChars();
  initRelated();
  initReviews();
  initSidebarEps();
  initUpNext();
  initCalendar();
  initProfile();
  initWatchlist();
  renderAdminAnimeTable();
  renderAdminUserTable();
  // Admin: show dashboard only
  document.querySelectorAll('.admin-content > div').forEach((d,i)=>{
    d.style.display=i===0?'block':'none';
  });
  initSectionObserver();
}

document.addEventListener('DOMContentLoaded', init);

// Image error fallback
document.addEventListener('error',e=>{
  if(e.target.tagName==='IMG') {
    e.target.src=`https://picsum.photos/200/300?random=${Math.floor(Math.random()*999)+1}`;
  }
},true);