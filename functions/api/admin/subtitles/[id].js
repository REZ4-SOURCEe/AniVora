import { json } from '../../../_shared/admin.js';

export async function onRequestDelete({ env, params }) {
  await env.DB.prepare('DELETE FROM subtitles WHERE id = ?').bind(params.id).run();
  return json({ ok: true });
}
