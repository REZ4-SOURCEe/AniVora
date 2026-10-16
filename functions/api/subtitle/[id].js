// زیرنویس عمومی برای پلیر: /api/subtitle/12.vtt
export async function onRequestGet({ env, params }) {
  const id = parseInt(params.id, 10);
  if (!id) return new Response('Not found', { status: 404 });
  const row = await env.DB.prepare('SELECT vtt FROM subtitles WHERE id = ?').bind(id).first();
  if (!row) return new Response('Not found', { status: 404 });
  return new Response(row.vtt, {
    headers: { 'Content-Type': 'text/vtt; charset=utf-8', 'Cache-Control': 'public, max-age=300' },
  });
}
