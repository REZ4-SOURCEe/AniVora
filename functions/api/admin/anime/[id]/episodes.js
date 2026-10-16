import { json, cleanEpisode, readBody } from '../../../../_shared/admin.js';

// افزودن یک یا چند قسمت: { episodes: [ {season, num, title, duration, img, qualities:[{label,url}]} ] }
export async function onRequestPost({ request, env, params }) {
  let list;
  try {
    const body = await readBody(request);
    const items = Array.isArray(body.episodes) ? body.episodes : [body];
    if (!items.length) throw new Error('هیچ قسمتی ارسال نشده');
    if (items.length > 300) throw new Error('حداکثر ۳۰۰ قسمت در هر بار');
    list = items.map(cleanEpisode);
  } catch (e) { return json({ error: e.message }, 400); }

  const anime = await env.DB.prepare('SELECT id FROM anime WHERE id = ?').bind(params.id).first();
  if (!anime) return json({ error: 'انیمه پیدا نشد' }, 404);

  const { results: existing } = await env.DB.prepare(
    'SELECT season, number FROM episodes WHERE anime_id = ?'
  ).bind(params.id).all();
  const taken = new Set(existing.map((e) => `${e.season}:${e.number}`));
  for (const ep of list) {
    const k = `${ep.season}:${ep.number}`;
    if (taken.has(k)) return json({ error: `قسمت ${ep.number} فصل ${ep.season} از قبل وجود دارد` }, 409);
    taken.add(k);
  }

  await env.DB.batch(list.map((ep) =>
    env.DB.prepare(`
      INSERT INTO episodes (anime_id, season, number, title, duration, thumb, video_url, qualities)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(params.id, ep.season, ep.number, ep.title, ep.duration, ep.thumb, ep.video_url, ep.qualities)
  ));
  return json({ ok: true, added: list.length }, 201);
}
