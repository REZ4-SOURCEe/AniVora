import { json, cleanEpisode, readBody } from '../../../_shared/admin.js';

export async function onRequestPut({ request, env, params }) {
  let ep;
  try { ep = cleanEpisode(await readBody(request)); } catch (e) { return json({ error: e.message }, 400); }

  const cur = await env.DB.prepare('SELECT anime_id FROM episodes WHERE id = ?').bind(params.id).first();
  if (!cur) return json({ error: 'قسمت پیدا نشد' }, 404);

  const dup = await env.DB.prepare(
    'SELECT id FROM episodes WHERE anime_id = ? AND season = ? AND number = ? AND id != ?'
  ).bind(cur.anime_id, ep.season, ep.number, params.id).first();
  if (dup) return json({ error: `قسمت ${ep.number} فصل ${ep.season} از قبل وجود دارد` }, 409);

  await env.DB.prepare(`
    UPDATE episodes SET season=?, number=?, title=?, duration=?, thumb=?, video_url=?, qualities=? WHERE id=?
  `).bind(ep.season, ep.number, ep.title, ep.duration, ep.thumb, ep.video_url, ep.qualities, params.id).run();
  return json({ ok: true });
}

export async function onRequestDelete({ env, params }) {
  try { await env.DB.prepare('DELETE FROM subtitles WHERE episode_id = ?').bind(params.id).run(); } catch {}
  await env.DB.prepare('DELETE FROM episodes WHERE id = ?').bind(params.id).run();
  return json({ ok: true });
}
