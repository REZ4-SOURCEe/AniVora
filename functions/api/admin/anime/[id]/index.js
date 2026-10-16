import { json, cleanAnime, animeOut, episodeOut, readBody } from '../../../../_shared/admin.js';

export async function onRequestGet({ env, params }) {
  const anime = await env.DB.prepare('SELECT * FROM anime WHERE id = ?').bind(params.id).first();
  if (!anime) return json({ error: 'انیمه پیدا نشد' }, 404);
  const { results } = await env.DB.prepare(
    'SELECT * FROM episodes WHERE anime_id = ? ORDER BY season, number'
  ).bind(params.id).all();
  let subs = [];
  try {
    ({ results: subs } = await env.DB.prepare(`
      SELECT s.id, s.episode_id, s.label, s.lang FROM subtitles s
      JOIN episodes e ON e.id = s.episode_id WHERE e.anime_id = ? ORDER BY s.id
    `).bind(params.id).all());
  } catch {}
  const episodes = results.map(episodeOut).map((e) => ({ ...e, subtitles: subs.filter((s) => s.episode_id === e.id).map(({ id, label, lang }) => ({ id, label, lang })) }));
  return json({ ...animeOut(anime), episodes });
}

export async function onRequestPut({ request, env, params }) {
  let data;
  try { data = cleanAnime(await readBody(request)); } catch (e) { return json({ error: e.message }, 400); }

  const res = await env.DB.prepare(`
    UPDATE anime SET title=?, title_jp=?, description=?, poster=?, backdrop=?, score=?, year=?,
      status=?, type=?, genres=?, studio=?, director=?, writer=? WHERE id=?
  `).bind(
    data.title, data.title_jp, data.description, data.poster, data.backdrop, data.score,
    data.year, data.status, data.type, data.genres, data.studio, data.director, data.writer, params.id
  ).run();
  if (!res.meta.changes) return json({ error: 'انیمه پیدا نشد' }, 404);
  return json({ ok: true });
}

export async function onRequestDelete({ env, params }) {
  try {
    await env.DB.prepare('DELETE FROM subtitles WHERE episode_id IN (SELECT id FROM episodes WHERE anime_id = ?)').bind(params.id).run();
  } catch {}
  await env.DB.batch([
    env.DB.prepare('DELETE FROM episodes WHERE anime_id = ?').bind(params.id),
    env.DB.prepare('DELETE FROM anime WHERE id = ?').bind(params.id),
  ]);
  // لیست‌های کاربران (اگر جدولش هست) هم پاک شود
  try { await env.DB.prepare('DELETE FROM user_anime WHERE anime_id = ?').bind(params.id).run(); } catch {}
  return json({ ok: true });
}
