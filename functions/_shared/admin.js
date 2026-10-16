// ابزارهای مشترک پنل ادمین (توکن، پاسخ JSON، اعتبارسنجی)
// این فایل route نیست؛ فقط import می‌شود.

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

// ---------- اعتبارسنجی ----------
const str = (v, max = 5000) => (v == null ? null : String(v).trim().slice(0, max) || null);
const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : null; };

export function cleanAnime(b) {
  const title = str(b.title, 300);
  if (!title) throw new Error('عنوان انیمه الزامی است');
  let genres = Array.isArray(b.genres) ? b.genres : [];
  genres = [...new Set(genres.map((g) => str(g, 40)).filter(Boolean))].slice(0, 30);
  let score = num(b.score);
  if (score != null) score = Math.min(10, Math.max(0, score));
  let year = num(b.year);
  if (year != null) year = Math.round(year);
  return {
    title,
    title_jp: str(b.jp ?? b.title_jp, 300),
    description: str(b.description, 5000),
    poster: str(b.img ?? b.poster, 1000),
    backdrop: str(b.backdrop, 1000),
    score,
    year,
    status: str(b.status, 40) || 'Airing',
    type: str(b.type, 40) || 'TV',
    genres: JSON.stringify(genres),
    studio: str(b.studio, 200),
    director: str(b.director, 200),
    writer: str(b.writer, 200),
  };
}

export function cleanEpisode(b) {
  const number = Math.round(num(b.num ?? b.number));
  if (!Number.isFinite(number) || number < 0) throw new Error('شماره‌ی قسمت نامعتبر است');
  const season = Math.round(num(b.season) ?? 1);
  if (!Number.isFinite(season) || season < 1) throw new Error('شماره‌ی فصل نامعتبر است');
  const qualities = (Array.isArray(b.qualities) ? b.qualities : [])
    .map((q) => ({ label: str(q.label, 20), url: str(q.url, 2000) }))
    .filter((q) => q.label && q.url);
  return {
    season,
    number,
    title: str(b.title, 300) || `Episode ${number}`,
    duration: str(b.duration, 20) || '24:00',
    thumb: str(b.img ?? b.thumb, 1000),
    video_url: str(b.videoUrl ?? b.video_url, 2000) || (qualities[0] ? qualities[0].url : null),
    qualities: JSON.stringify(qualities),
  };
}

export function episodeOut(ep) {
  let qualities = [];
  try { qualities = JSON.parse(ep.qualities || '[]'); } catch {}
  return {
    id: ep.id, season: ep.season, num: ep.number, title: ep.title,
    duration: ep.duration, img: ep.thumb, videoUrl: ep.video_url, qualities,
  };
}

export function animeOut(a) {
  let genres = [];
  try { genres = JSON.parse(a.genres || '[]'); } catch {}
  return {
    id: a.id, title: a.title, jp: a.title_jp, description: a.description,
    img: a.poster, backdrop: a.backdrop, score: a.score, year: a.year,
    status: a.status, type: a.type, genres,
    studio: a.studio || '', director: a.director || '', writer: a.writer || '',
  };
}

export async function readBody(request) {
  try { return await request.json(); } catch { throw new Error('بدنه‌ی درخواست JSON معتبر نیست'); }
}
