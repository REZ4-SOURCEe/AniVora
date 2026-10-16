/* ============================================
   ANIVORA ADMIN PANEL
============================================ */

// اگر پنل روی همان دامنه‌ی Cloudflare Pages (یا localhost) باز شود، بدون CORS کار می‌کند.
// اگر از GitHub Pages باز شود به آدرس زیر وصل می‌شود.
const REMOTE_API = 'https://anivora.pages.dev';
const SAME_ORIGIN = /pages\.dev$|^localhost$|^127\.0\.0\.1$/.test(location.hostname) && location.port !== '5500';
const API = SAME_ORIGIN ? '' : REMOTE_API;

const STATUSES = ['Airing', 'Finished', 'Upcoming'];
const TYPES = ['TV', 'Movie', 'OVA', 'ONA', 'Special'];
const BASE_GENRES = ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller'];

const $ = (s, r = document) => r.querySelector(s);
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const app = $('#app');

/* ---------- API ---------- */
async function api(path, method = 'GET', body) {
  let res;
  try {
    res = await fetch(API + '/api/admin' + path, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store',
    });
  } catch { throw new Error('اتصال به سرور برقرار نشد'); }
  let data = {};
  try { data = await res.json(); } catch {}
  if (!res.ok) throw new Error(data.error || `خطا (${res.status})`);
  return data;
}

/* ---------- UI helpers ---------- */
function toast(msg, kind = 'ok') {
  const el = document.createElement('div');
  el.className = 'toast ' + kind;
  el.textContent = msg;
  $('#toasts').append(el);
  setTimeout(() => el.remove(), 3500);
}

function modal(html, onMount) {
  const ov = document.createElement('div');
  ov.className = 'overlay';
  ov.innerHTML = `<div class="modal">${html}</div>`;
  ov.addEventListener('mousedown', (e) => { if (e.target === ov) close(); });
  const close = () => ov.remove();
  document.body.append(ov);
  onMount?.(ov.firstElementChild, close);
  return close;
}

function confirmBox(message, okLabel = 'حذف') {
  return new Promise((resolve) => {
    const close = modal(`<h3>${esc(message)}</h3><div class="foot"><button class="btn danger" id="y">${okLabel}</button><button class="btn" id="n">انصراف</button></div>`, (m) => {
      m.querySelector('#y').onclick = () => { close(); resolve(true); };
      m.querySelector('#n').onclick = () => { close(); resolve(false); };
    });
  });
}

const statusBadge = (s) => `<span class="badge ${s === 'Finished' ? 'ok' : s === 'Airing' ? 'live' : ''}">${esc(s || '-')}</span>`;

/* ---------- Shell ---------- */
function shell(active, inner) {
  app.innerHTML = `
    <header class="topbar">
      <div class="brand"><img src="../assets/avatars/logo.png" alt=""> Anivora <small>پنل مدیریت</small></div>
      <nav class="nav">
        <a href="#/" class="${active === 'list' ? 'active' : ''}">مدیریت انیمه‌ها</a>
        <a href="#/new" class="${active === 'new' ? 'active' : ''}">افزودن انیمه</a>
      </nav>
      <div class="spacer"></div>
      <a href="../" target="_blank" class="btn sm">مشاهده سایت</a>
    </header>
    <main class="container">${inner}</main>`;
}

/* ---------- List ---------- */
let listCache = [];

async function listView() {
  shell('list', `<div class="head"><div class="grow"><h1>مدیریت انیمه‌ها</h1><div class="sub" id="cnt">در حال بارگذاری…</div></div>
    <a class="btn primary" href="#/new">+ افزودن انیمه</a></div>
    <div class="toolbar"><input class="input" id="q" placeholder="جستجو در عنوان، استودیو، کارگردان…"></div>
    <div class="rows" id="rows"></div>`);
  try { listCache = await api('/anime'); } catch (e) { $('#cnt').textContent = e.message; return; }
  const draw = () => {
    const q = $('#q').value.trim().toLowerCase();
    const items = listCache.filter((a) => !q || [a.title, a.jp, a.studio, a.director, a.writer].join(' ').toLowerCase().includes(q));
    $('#cnt').textContent = `${listCache.length} انیمه در دیتابیس`;
    $('#rows').innerHTML = items.length ? items.map((a) => `
      <div class="row">
        <img src="${esc(a.img)}" alt="" onerror="this.style.visibility='hidden'">
        <div class="meta">
          <div class="t">${esc(a.title)}</div>
          <div class="j">${esc(a.jp || '')}</div>
          <div class="stats">${statusBadge(a.status)}<span class="badge">${esc(a.type)}</span><span class="badge">${esc(a.year ?? '-')}</span>
            <span class="badge acc">${a.seasonCount} فصل · ${a.epCount} قسمت</span>
            ${a.director ? `<span class="badge">کارگردان: ${esc(a.director)}</span>` : ''}</div>
        </div>
        <div class="acts">
          <a class="btn sm" href="#/edit/${a.id}">ویرایش</a>
          <button class="btn sm danger" data-del="${a.id}">حذف</button>
        </div>
      </div>`).join('') : '<div class="empty">چیزی پیدا نشد</div>';
  };
  draw();
  $('#q').oninput = draw;
  $('#rows').onclick = async (e) => {
    const id = e.target.dataset.del;
    if (!id) return;
    const a = listCache.find((x) => x.id == id);
    if (!(await confirmBox(`«${a.title}» و همه‌ی قسمت‌هایش حذف شود؟`))) return;
    try { await api('/anime/' + id, 'DELETE'); listCache = listCache.filter((x) => x.id != id); draw(); toast('حذف شد'); }
    catch (err) { toast(err.message, 'bad'); }
  };
}

/* ---------- Editor ---------- */
function blankAnime() {
  return { title: '', jp: '', description: '', img: '', backdrop: '', score: '', year: new Date().getFullYear(), status: 'Airing', type: 'TV', genres: [], studio: '', director: '', writer: '', episodes: [] };
}

async function editorView(id) {
  const isNew = !id;
  shell(isNew ? 'new' : 'list', '<div class="empty">در حال بارگذاری…</div>');
  let a = blankAnime();
  if (!isNew) {
    try { a = await api('/anime/' + id); } catch (e) { return shell('list', `<div class="empty">${esc(e.message)}</div>`); }
  }
  let tab = 'info';
  let season = null;

  const paint = () => {
    $('.container').innerHTML = `
      <div class="head"><div class="grow"><h1>${isNew ? 'افزودن انیمه‌ی جدید' : 'ویرایش: ' + esc(a.title)}</h1>
        <div class="sub">${isNew ? 'بعد از ذخیره می‌توانید فصل و قسمت‌ها را اضافه کنید.' : `شناسه ${a.id}`}</div></div>
        <a class="btn" href="#/">بازگشت به لیست</a></div>
      ${isNew ? '' : `<div class="tabs"><button data-tab="info" class="${tab === 'info' ? 'active' : ''}">اطلاعات و تصاویر</button>
        <button data-tab="eps" class="${tab === 'eps' ? 'active' : ''}">فصل‌ها، قسمت‌ها و لینک‌ها (${a.episodes.length})</button></div>`}
      <div id="pane"></div>`;
    document.querySelectorAll('[data-tab]').forEach((b) => (b.onclick = () => { tab = b.dataset.tab; paint(); }));
    tab === 'info' ? infoPane() : epsPane();
  };

  /* --- info pane --- */
  function infoPane() {
    const genreSet = new Set([...BASE_GENRES, ...listCache.flatMap((x) => x.genres || [])]);
    $('#pane').innerHTML = `
      <form id="af">
        <div class="card"><h2>مشخصات اصلی</h2>
          <div class="grid2">
            <label class="f"><span>عنوان *</span><input class="input" name="title" value="${esc(a.title)}" required></label>
            <label class="f"><span>عنوان ژاپنی / اصلی</span><input class="input ltr" name="jp" value="${esc(a.jp)}"></label>
          </div>
          <label class="f"><span>توضیحات</span><textarea class="input" name="description">${esc(a.description)}</textarea></label>
          <div class="grid3">
            <label class="f"><span>سال</span><input class="input ltr" type="number" name="year" value="${esc(a.year)}"></label>
            <label class="f"><span>امتیاز (۰ تا ۱۰)</span><input class="input ltr" type="number" step="0.1" min="0" max="10" name="score" value="${esc(a.score)}"></label>
            <label class="f"><span>وضعیت</span><select class="input" name="status">${STATUSES.map((s) => `<option ${s === a.status ? 'selected' : ''}>${s}</option>`).join('')}</select></label>
          </div>
          <div class="grid2">
            <label class="f"><span>نوع</span><select class="input" name="type">${TYPES.map((s) => `<option ${s === a.type ? 'selected' : ''}>${s}</option>`).join('')}</select></label>
            <label class="f"><span>استودیو</span><input class="input ltr" name="studio" value="${esc(a.studio)}"></label>
          </div>
          <div class="grid2">
            <label class="f"><span>کارگردان</span><input class="input ltr" name="director" value="${esc(a.director)}"></label>
            <label class="f"><span>نویسنده</span><input class="input ltr" name="writer" value="${esc(a.writer)}"></label>
          </div>
          <div class="f"><span style="display:block;color:var(--text2);font-size:12.5px;margin-bottom:5px">ژانرها (با Enter یا ویرگول اضافه کنید، روی چیپ بزنید تا حذف شود)</span>
            <div class="chips" id="chips"></div><div class="sugs" id="sugs"></div></div>
        </div>
        <div class="card"><h2>تصاویر</h2>
          <div class="imgs"><div><div class="pv" id="pv1"></div></div>
            <label class="f"><span>لینک پوستر (عمودی)</span><input class="input ltr" name="img" value="${esc(a.img)}" placeholder="https://…"></label></div>
          <div class="imgs" style="margin-top:8px"><div><div class="pv wide" id="pv2"></div></div>
            <label class="f"><span>لینک بک‌دراپ (افقی، پس‌زمینه‌ی صفحه‌ی انیمه)</span><input class="input ltr" name="backdrop" value="${esc(a.backdrop)}" placeholder="https://…"></label></div>
        </div>
        <div class="savebar"><button class="btn primary" id="save">${isNew ? 'ایجاد انیمه' : 'ذخیره‌ی تغییرات'}</button></div>
      </form>`;

    const form = $('#af');
    const genres = [...a.genres];
    const drawChips = () => {
      $('#chips').innerHTML = genres.map((g, i) => `<span class="chip" data-i="${i}">${esc(g)} ×</span>`).join('') + '<input id="gin" placeholder="ژانر…">';
      $('#sugs').innerHTML = [...genreSet].filter((g) => !genres.includes(g)).map((g) => `<button type="button" data-g="${esc(g)}">+ ${esc(g)}</button>`).join('');
      const inp = $('#gin');
      inp.onkeydown = (e) => {
        if ((e.key === 'Enter' || e.key === ',') && inp.value.trim()) { e.preventDefault(); add(inp.value.trim()); }
        else if (e.key === 'Backspace' && !inp.value && genres.length) { genres.pop(); drawChips(); $('#gin').focus(); }
      };
    };
    const add = (g) => { if (!genres.includes(g)) genres.push(g); drawChips(); $('#gin').focus(); };
    $('#chips').onclick = (e) => { const i = e.target.dataset.i; if (i != null) { genres.splice(i, 1); drawChips(); } };
    $('#sugs').onclick = (e) => { if (e.target.dataset.g) add(e.target.dataset.g); };
    drawChips();

    const pv = (box, input) => {
      const draw = () => {
        const u = form[input].value.trim();
        box.innerHTML = u ? `<img src="${esc(u)}" alt="" onerror="this.parentNode.textContent='لینک تصویر باز نشد'">` : 'پیش‌نمایش';
      };
      form[input].addEventListener('input', draw); draw();
    };
    pv($('#pv1'), 'img'); pv($('#pv2'), 'backdrop');

    form.onsubmit = async (e) => {
      e.preventDefault();
      const fd = Object.fromEntries(new FormData(form));
      const pending = $('#gin').value.trim();
      if (pending && !genres.includes(pending)) genres.push(pending);
      const body = { ...fd, genres };
      $('#save').disabled = true;
      try {
        if (isNew) {
          const { id: newId } = await api('/anime', 'POST', body);
          toast('انیمه ساخته شد؛ حالا فصل و قسمت‌ها را اضافه کنید');
          location.hash = '#/edit/' + newId;
        } else {
          await api('/anime/' + a.id, 'PUT', body);
          Object.assign(a, { ...fd, genres });
          toast('ذخیره شد');
          $('.head h1').textContent = 'ویرایش: ' + a.title;
        }
      } catch (err) { toast(err.message, 'bad'); }
      $('#save') && ($('#save').disabled = false);
    };
  }

  /* --- episodes pane --- */
  function epsPane() {
    const seasons = [...new Set(a.episodes.map((e) => e.season))].sort((x, y) => x - y);
    if (season == null || (!seasons.includes(season) && seasons.length)) season = seasons[0] ?? 1;
    const eps = a.episodes.filter((e) => e.season === season);
    const nextSeason = (seasons[seasons.length - 1] || 0) + 1;

    $('#pane').innerHTML = `
      <div class="card">
        <div class="seasons">${seasons.map((s) => `<button data-s="${s}" class="${s === season ? 'active' : ''}">فصل ${s}</button>`).join('')}
          <button class="add" id="newSeason">+ فصل جدید</button></div>
        ${seasons.length ? `<div class="toolbar">
          <button class="btn primary sm" id="addEp">+ افزودن قسمت</button>
          <button class="btn sm" id="addMany">افزودن چند قسمت با هم</button>
          <button class="btn sm" id="repl">جایگزینی گروهی لینک‌ها</button>
          <button class="btn sm" id="bulkSub">آپلود گروهی زیرنویس</button>
          <div class="spacer"></div>
          <button class="btn sm danger" id="delSeason">حذف فصل ${season}</button></div>
        <table><thead><tr><th>#</th><th>تصویر</th><th>عنوان</th><th>مدت</th><th>لینک‌ها</th><th>زیرنویس</th><th></th></tr></thead><tbody>
          ${eps.map((e) => `<tr>
            <td class="n">${e.num}</td>
            <td>${e.img ? `<img class="thumb" src="${esc(e.img)}" alt="" onerror="this.style.visibility='hidden'">` : ''}</td>
            <td>${esc(e.title)}</td><td>${esc(e.duration)}</td>
            <td><div class="links">${e.qualities.length ? e.qualities.map((q) => `<span class="badge acc" title="${esc(q.url)}">${esc(q.label)}</span>`).join('') : '<span class="badge">بدون لینک</span>'}</div></td>
            <td><div class="links">${(e.subtitles || []).length ? e.subtitles.map((s) => `<span class="badge ok">${esc(s.label)}</span>`).join('') : '<span class="badge">ندارد</span>'}</div></td>
            <td class="a"><button class="btn sm" data-sub="${e.id}">زیرنویس</button><button class="btn sm" data-edit="${e.id}">ویرایش</button><button class="btn sm danger" data-rm="${e.id}">حذف</button></td></tr>`).join('')}
        </tbody></table>` : '<div class="empty">این انیمه هنوز قسمتی ندارد. «فصل جدید» را بزنید.</div>'}
      </div>`;

    document.querySelectorAll('[data-s]').forEach((b) => (b.onclick = () => { season = +b.dataset.s; epsPane(); }));
    $('#newSeason').onclick = () => bulkModal(nextSeason);
    $('#addEp')?.addEventListener('click', () => episodeModal({ season, num: (eps[eps.length - 1]?.num || 0) + 1, title: '', duration: '24:00', img: '', qualities: [{ label: '1080p', url: '' }] }));
    $('#addMany')?.addEventListener('click', () => bulkModal(season));
    $('#repl')?.addEventListener('click', replaceModal);
    $('#bulkSub')?.addEventListener('click', () => bulkSubModal(eps));
    $('#delSeason')?.addEventListener('click', async () => {
      if (!(await confirmBox(`کل فصل ${season} (${eps.length} قسمت) حذف شود؟`))) return;
      try { await api(`/anime/${a.id}/seasons/${season}`, 'DELETE'); toast('فصل حذف شد'); await reload(); } catch (e) { toast(e.message, 'bad'); }
    });
    $('#pane').onclick = async (e) => {
      const ed = e.target.dataset.edit, rm = e.target.dataset.rm, sb = e.target.dataset.sub;
      if (sb) subtitleModal(a.episodes.find((x) => x.id == sb));
      if (ed) episodeModal(a.episodes.find((x) => x.id == ed));
      if (rm) {
        const ep = a.episodes.find((x) => x.id == rm);
        if (!(await confirmBox(`قسمت ${ep.num} حذف شود؟`))) return;
        try { await api('/episodes/' + rm, 'DELETE'); toast('قسمت حذف شد'); await reload(); } catch (err) { toast(err.message, 'bad'); }
      }
    };
  }

  async function reload() {
    a = await api('/anime/' + a.id);
    paint();
  }

  /* --- single episode modal (add / edit) --- */
  function episodeModal(ep) {
    const editing = !!ep.id;
    const quals = ep.qualities.length ? ep.qualities.map((q) => ({ ...q })) : [{ label: '1080p', url: '' }];
    modal(`<h3>${editing ? 'ویرایش قسمت' : 'افزودن قسمت'}</h3>
      <div class="grid3">
        <label class="f"><span>فصل</span><input class="input ltr" type="number" min="1" id="e_season" value="${ep.season}"></label>
        <label class="f"><span>شماره‌ی قسمت</span><input class="input ltr" type="number" min="0" id="e_num" value="${ep.num}"></label>
        <label class="f"><span>مدت (mm:ss)</span><input class="input ltr" id="e_dur" value="${esc(ep.duration)}"></label>
      </div>
      <label class="f"><span>عنوان قسمت</span><input class="input" id="e_title" value="${esc(ep.title)}"></label>
      <label class="f"><span>لینک تصویر قسمت (اختیاری)</span><input class="input ltr" id="e_img" value="${esc(ep.img || '')}"></label>
      <div style="color:var(--text2);font-size:12.5px;margin-bottom:6px">لینک‌های ویدیو (هر کیفیت یک لینک)</div>
      <div id="qs"></div>
      <button class="btn sm" id="addQ" type="button">+ کیفیت جدید</button>
      <div class="foot"><button class="btn primary" id="ok">${editing ? 'ذخیره' : 'افزودن'}</button><button class="btn" id="cancel">انصراف</button></div>`,
    (m, close) => {
      const drawQ = () => {
        m.querySelector('#qs').innerHTML = quals.map((q, i) => `<div class="qrow">
          <input class="input ltr" data-l="${i}" value="${esc(q.label)}" placeholder="1080p">
          <input class="input ltr" data-u="${i}" value="${esc(q.url)}" placeholder="https://…">
          <button class="btn sm danger" type="button" data-x="${i}">×</button></div>`).join('');
      };
      drawQ();
      m.addEventListener('input', (e) => {
        if (e.target.dataset.l != null) quals[e.target.dataset.l].label = e.target.value;
        if (e.target.dataset.u != null) quals[e.target.dataset.u].url = e.target.value;
      });
      m.addEventListener('click', (e) => { if (e.target.dataset.x != null) { quals.splice(e.target.dataset.x, 1); drawQ(); } });
      m.querySelector('#addQ').onclick = () => { quals.push({ label: '', url: '' }); drawQ(); };
      m.querySelector('#cancel').onclick = close;
      m.querySelector('#ok').onclick = async () => {
        const body = {
          season: m.querySelector('#e_season').value, num: m.querySelector('#e_num').value,
          duration: m.querySelector('#e_dur').value, title: m.querySelector('#e_title').value,
          img: m.querySelector('#e_img').value, qualities: quals,
        };
        try {
          editing ? await api('/episodes/' + ep.id, 'PUT', body) : await api(`/anime/${a.id}/episodes`, 'POST', body);
          close(); season = +body.season; toast('ذخیره شد'); await reload();
        } catch (err) { toast(err.message, 'bad'); }
      };
    });
  }

  /* --- bulk add modal (also creates a new season) --- */
  function bulkModal(seasonNum) {
    const exists = a.episodes.some((e) => e.season === seasonNum);
    const last = Math.max(0, ...a.episodes.filter((e) => e.season === seasonNum).map((e) => e.num));
    modal(`<h3>${exists ? `افزودن چند قسمت به فصل ${seasonNum}` : `ساخت فصل ${seasonNum}`}</h3>
      <div class="grid3">
        <label class="f"><span>فصل</span><input class="input ltr" type="number" min="1" id="b_season" value="${seasonNum}"></label>
        <label class="f"><span>از قسمت</span><input class="input ltr" type="number" min="0" id="b_start" value="${last + 1}"></label>
        <label class="f"><span>تعداد قسمت</span><input class="input ltr" type="number" min="1" max="300" id="b_count" value="12"></label>
      </div>
      <div class="grid2">
        <label class="f"><span>قالب عنوان</span><input class="input ltr" id="b_title" value="Episode {n}"></label>
        <label class="f"><span>مدت</span><input class="input ltr" id="b_dur" value="24:00"></label>
      </div>
      <label class="f"><span>لینک تصویر مشترک (اختیاری)</span><input class="input ltr" id="b_img"></label>
      <div style="color:var(--text2);font-size:12.5px;margin-bottom:6px">قالب لینک ویدیو برای هر کیفیت</div>
      <div id="bq"></div>
      <div class="hint">به‌جای شماره‌ی قسمت در لینک بنویسید <code>{n}</code> (مثل 5) یا <code>{nn}</code> (مثل 05).
        مثال: <code>https://host/Show.S01E{nn}.1080p.mkv</code></div>
      <div id="prev" class="hint" style="color:var(--accent-h);direction:ltr;text-align:left;word-break:break-all"></div>
      <button class="btn sm" id="addQ" type="button">+ کیفیت جدید</button>
      <div class="foot"><button class="btn primary" id="ok">ساخت قسمت‌ها</button><button class="btn" id="cancel">انصراف</button></div>`,
    (m, close) => {
      const quals = [{ label: '1080p', url: '' }];
      const fill = (t, n) => t.replace(/\{nn\}/g, String(n).padStart(2, '0')).replace(/\{n\}/g, String(n));
      const preview = () => {
        const s = +m.querySelector('#b_start').value;
        const q = quals.filter((x) => x.url).map((x) => `${x.label}: ${fill(x.url, s)}`)[0];
        m.querySelector('#prev').textContent = q ? 'پیش‌نمایش قسمت اول → ' + q : '';
      };
      const drawQ = () => {
        m.querySelector('#bq').innerHTML = quals.map((q, i) => `<div class="qrow">
          <input class="input ltr" data-l="${i}" value="${esc(q.label)}" placeholder="1080p">
          <input class="input ltr" data-u="${i}" value="${esc(q.url)}" placeholder="https://…{nn}…">
          <button class="btn sm danger" type="button" data-x="${i}">×</button></div>`).join('');
      };
      drawQ();
      m.addEventListener('input', (e) => {
        if (e.target.dataset.l != null) quals[e.target.dataset.l].label = e.target.value;
        if (e.target.dataset.u != null) quals[e.target.dataset.u].url = e.target.value;
        preview();
      });
      m.addEventListener('click', (e) => { if (e.target.dataset.x != null) { quals.splice(e.target.dataset.x, 1); drawQ(); preview(); } });
      m.querySelector('#addQ').onclick = () => { quals.push({ label: '', url: '' }); drawQ(); };
      m.querySelector('#cancel').onclick = close;
      m.querySelector('#ok').onclick = async () => {
        const s = +m.querySelector('#b_season').value, start = +m.querySelector('#b_start').value, count = +m.querySelector('#b_count').value;
        const tpl = m.querySelector('#b_title').value || 'Episode {n}';
        const episodes = Array.from({ length: count }, (_, i) => {
          const n = start + i;
          return {
            season: s, num: n, title: fill(tpl, n), duration: m.querySelector('#b_dur').value,
            img: m.querySelector('#b_img').value,
            qualities: quals.filter((q) => q.label && q.url).map((q) => ({ label: q.label, url: fill(q.url, n) })),
          };
        });
        try {
          await api(`/anime/${a.id}/episodes`, 'POST', { episodes });
          close(); season = s; toast(`${count} قسمت اضافه شد`); await reload();
        } catch (err) { toast(err.message, 'bad'); }
      };
    });
  }


  /* --- subtitles: single episode --- */
  const readFile = async (file) => {
    const text = await file.text();
    if ((text.match(/�/g) || []).length > 5) throw new Error(`فایل «${file.name}» UTF-8 نیست؛ آن را با ذخیره‌ی UTF-8 دوباره بسازید`);
    return text;
  };

  function subtitleModal(ep) {
    modal(`<h3>زیرنویس قسمت ${ep.num} فصل ${ep.season}</h3>
      <div id="sl"></div>
      <div class="card" style="margin:14px 0 0;background:var(--bg2)">
        <h2 style="font-size:13.5px">افزودن زیرنویس</h2>
        <label class="f"><span>فایل زیرنویس (ass، ssa، srt یا vtt)</span><input class="input" type="file" id="sf" accept=".ass,.ssa,.srt,.vtt"></label>
        <div class="grid2">
          <label class="f"><span>نام نمایشی در پلیر</span><input class="input" id="sl_label" value="فارسی"></label>
          <label class="f"><span>کد زبان</span><input class="input ltr" id="sl_lang" value="fa"></label>
        </div>
        <div class="hint">اگر زیرنویسی با همین نام و زبان وجود داشته باشد جایگزین می‌شود.</div>
        <button class="btn primary" id="up">آپلود</button>
      </div>
      <div class="foot"><button class="btn" id="cl">بستن</button></div>`,
    (m, close) => {
      const draw = () => {
        const cur = a.episodes.find((x) => x.id === ep.id);
        m.querySelector('#sl').innerHTML = (cur.subtitles || []).length
          ? cur.subtitles.map((s) => `<div class="row" style="padding:8px 12px;margin-bottom:8px"><div class="meta"><b>${esc(s.label)}</b> <span class="badge">${esc(s.lang)}</span></div>
              <a class="btn sm" target="_blank" href="${API}/api/subtitle/${s.id}.vtt">مشاهده</a>
              <button class="btn sm danger" data-ds="${s.id}">حذف</button></div>`).join('')
          : '<div class="hint" style="margin:0">هنوز زیرنویسی برای این قسمت نیست.</div>';
      };
      draw();
      m.querySelector('#cl').onclick = close;
      m.addEventListener('click', async (e) => {
        const id = e.target.dataset.ds;
        if (!id) return;
        try { await api('/subtitles/' + id, 'DELETE'); toast('زیرنویس حذف شد'); await reload(); draw(); } catch (err) { toast(err.message, 'bad'); }
      });
      m.querySelector('#up').onclick = async () => {
        const f = m.querySelector('#sf').files[0];
        if (!f) return toast('فایل را انتخاب کنید', 'bad');
        const btn = m.querySelector('#up'); btn.disabled = true;
        try {
          const r = await api(`/episodes/${ep.id}/subtitles`, 'POST', { content: await readFile(f), label: m.querySelector('#sl_label').value, lang: m.querySelector('#sl_lang').value });
          toast(`زیرنویس اضافه شد (${r.cues} خط، فرمت ${r.format})`); m.querySelector('#sf').value = '';
          await reload(); draw();
        } catch (err) { toast(err.message, 'bad'); }
        btn.disabled = false;
      };
    });
  }

  /* --- subtitles: bulk by episode number --- */
  function bulkSubModal(eps) {
    const guess = (name) => {
      const n = name.replace(/\.[^.]+$/, '');
      let m = n.match(/S\d+\s*[._-]?\s*E(\d+)/i) || n.match(/(?:^|[^a-z])E(?:p|pisode)?[ ._-]?(\d{1,3})(?!\d)/i) || n.match(/(\d{1,3})(?!.*\d)/);
      return m ? +m[1] : null;
    };
    let files = [];
    modal(`<h3>آپلود گروهی زیرنویس — فصل ${season}</h3>
      <div class="hint" style="margin-top:0">چند فایل را با هم انتخاب کنید. شماره‌ی قسمت از نام فایل تشخیص داده می‌شود (مثلاً <code>Show.S01E05.ass</code> یا <code>05.srt</code>).</div>
      <label class="f"><span>فایل‌های زیرنویس</span><input class="input" type="file" id="bf" multiple accept=".ass,.ssa,.srt,.vtt"></label>
      <div class="grid2">
        <label class="f"><span>نام نمایشی در پلیر</span><input class="input" id="bl_label" value="فارسی"></label>
        <label class="f"><span>کد زبان</span><input class="input ltr" id="bl_lang" value="fa"></label>
      </div>
      <div id="bp"></div>
      <div class="foot"><button class="btn primary" id="go" disabled>آپلود همه</button><button class="btn" id="cl">انصراف</button></div>`,
    (m, close) => {
      const byNum = new Map(eps.map((e) => [e.num, e]));
      const drawPrev = () => {
        m.querySelector('#bp').innerHTML = files.length ? `<table><thead><tr><th>فایل</th><th>قسمت</th></tr></thead><tbody>${files.map((f) =>
          `<tr><td class="ltr">${esc(f.file.name)}</td><td>${f.ep ? `قسمت ${f.ep.num}` : '<span class="badge" style="color:#ff8585">قسمت پیدا نشد</span>'}</td></tr>`).join('')}</tbody></table>` : '';
        m.querySelector('#go').disabled = !files.some((f) => f.ep);
      };
      m.querySelector('#cl').onclick = close;
      m.querySelector('#bf').onchange = (e) => {
        files = [...e.target.files].map((file) => ({ file, ep: byNum.get(guess(file.name)) })).sort((x, y) => (x.ep?.num ?? 999) - (y.ep?.num ?? 999));
        drawPrev();
      };
      m.querySelector('#go').onclick = async () => {
        const todo = files.filter((f) => f.ep);
        m.querySelector('#go').disabled = true;
        let ok = 0; const bad = [];
        for (const f of todo) {
          try {
            await api(`/episodes/${f.ep.id}/subtitles`, 'POST', { content: await readFile(f.file), label: m.querySelector('#bl_label').value, lang: m.querySelector('#bl_lang').value });
            ok++;
          } catch (err) { bad.push(`${f.file.name}: ${err.message}`); }
        }
        close(); toast(`${ok} زیرنویس آپلود شد` + (bad.length ? ` — ${bad.length} خطا` : ''), bad.length ? 'bad' : 'ok');
        if (bad.length) alert(bad.join('\n'));
        await reload();
      };
    });
  }

  /* --- bulk link replace --- */
  function replaceModal() {
    modal(`<h3>جایگزینی گروهی لینک‌ها</h3>
      <div class="hint" style="margin-top:0">یک تکه از لینک (مثلاً دامنه‌ی سرور قدیمی) را در لینک ویدیوی همه‌ی قسمت‌ها با متن جدید عوض می‌کند.</div>
      <label class="f"><span>متن قدیمی</span><input class="input ltr" id="r_find" placeholder="old-server.example.com"></label>
      <label class="f"><span>متن جدید</span><input class="input ltr" id="r_with" placeholder="new-server.example.com"></label>
      <label class="f"><span>محدوده</span><select class="input" id="r_scope"><option value="">همه‌ی فصل‌ها</option><option value="${season}">فقط فصل ${season}</option></select></label>
      <div class="foot"><button class="btn primary" id="ok">جایگزین کن</button><button class="btn" id="cancel">انصراف</button></div>`,
    (m, close) => {
      m.querySelector('#cancel').onclick = close;
      m.querySelector('#ok').onclick = async () => {
        try {
          const r = await api(`/anime/${a.id}/replace-links`, 'POST', { find: m.querySelector('#r_find').value, replace: m.querySelector('#r_with').value, season: m.querySelector('#r_scope').value });
          close(); toast(`لینک ${r.changed} قسمت تغییر کرد`); await reload();
        } catch (err) { toast(err.message, 'bad'); }
      };
    });
  }

  paint();
}

/* ---------- Router ---------- */
async function render() {
  const h = location.hash.replace(/^#/, '') || '/';
  if (h === '/new') return editorView(null);
  const m = h.match(/^\/edit\/(\d+)$/);
  if (m) return editorView(m[1]);
  return listView();
}
window.addEventListener('hashchange', render);
render();
