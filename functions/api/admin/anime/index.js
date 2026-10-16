import { json, cleanAnime, animeOut, readBody } from '../../../_shared/admin.js';

// لیست سبک برای صفحه‌ی مدیریت
export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(`
    SELECT a.*, COUNT(e.id) AS ep_count, COUNT(DISTINCT e.season) AS season_count
    FROM anime a LEFT JOIN episodes e ON e.anime_id = a.id
    GROUP BY a.id ORDER BY a.id DESC
  `).all();
  return json(results.map((r) => ({
    ...animeOut(r), epCount: r.ep_count, seasonCount: r.season_count,
  })));
}

export async function onRequestPost({ request, env }) {
  let data;
  try { data = cleanAnime(await readBody(request)); } catch (e) { return json({ error: e.message }, 400); }

  const res = await env.DB.prepare(`
    INSERT INTO anime (title, title_jp, description, poster, backdrop, score, year, status, type, genres, studio, director, writer)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    data.title, data.title_jp, data.description, data.poster, data.backdrop, data.score,
    data.year, data.status, data.type, data.genres, data.studio, data.director, data.writer
  ).run();
  return json({ id: res.meta.last_row_id }, 201);
}
