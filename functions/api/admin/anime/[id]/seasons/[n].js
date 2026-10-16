import { json } from '../../../../../_shared/admin.js';

// حذف کل یک فصل (همه‌ی قسمت‌هایش)
export async function onRequestDelete({ env, params }) {
  try {
    await env.DB.prepare('DELETE FROM subtitles WHERE episode_id IN (SELECT id FROM episodes WHERE anime_id = ? AND season = ?)').bind(params.id, params.n).run();
  } catch {}
  const res = await env.DB.prepare(
    'DELETE FROM episodes WHERE anime_id = ? AND season = ?'
  ).bind(params.id, params.n).run();
  return json({ ok: true, deleted: res.meta.changes });
}
