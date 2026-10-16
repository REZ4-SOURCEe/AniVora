import { json, readBody } from '../../../../_shared/admin.js';

// جایگزینی متن در لینک همه‌ی قسمت‌ها: { find, replace, season? }
// مثال: عوض کردن دامنه‌ی سرور ویدیو در یک حرکت
export async function onRequestPost({ request, env, params }) {
  let body;
  try { body = await readBody(request); } catch (e) { return json({ error: e.message }, 400); }
  const find = String(body.find ?? '');
  const replace = String(body.replace ?? '');
  if (!find) return json({ error: 'متن مورد جستجو خالی است' }, 400);

  const season = body.season ? Number(body.season) : null;
  const { results } = await env.DB.prepare(
    `SELECT id, video_url, qualities FROM episodes WHERE anime_id = ?${season ? ' AND season = ?' : ''}`
  ).bind(...(season ? [params.id, season] : [params.id])).all();

  const swap = (s) => (s ? s.split(find).join(replace) : s);
  const stmts = [];
  for (const ep of results) {
    let q = [];
    try { q = JSON.parse(ep.qualities || '[]'); } catch {}
    const newQ = JSON.stringify(q.map((x) => ({ ...x, url: swap(x.url) })));
    const newUrl = swap(ep.video_url);
    if (newQ !== (ep.qualities || '[]') || newUrl !== ep.video_url) {
      stmts.push(env.DB.prepare('UPDATE episodes SET video_url = ?, qualities = ? WHERE id = ?').bind(newUrl, newQ, ep.id));
    }
  }
  for (let i = 0; i < stmts.length; i += 50) await env.DB.batch(stmts.slice(i, i + 50));
  return json({ ok: true, changed: stmts.length });
}
