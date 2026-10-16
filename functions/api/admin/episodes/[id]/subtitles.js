import { json, readBody } from '../../../../_shared/admin.js';
import { convertSubtitle } from '../../../../_shared/subtitles.js';

// آپلود زیرنویس برای یک قسمت: { label, lang, content }  (content = متن فایل ass/srt/vtt)
// اگر زیرنویسی با همین lang و label باشد جایگزین می‌شود.
export async function onRequestPost({ request, env, params }) {
  let b, conv;
  try {
    b = await readBody(request);
    if (String(b.content || '').length > 2_000_000) throw new Error('فایل زیرنویس خیلی بزرگ است');
    conv = convertSubtitle(b.content);
  } catch (e) { return json({ error: e.message }, 400); }

  const label = String(b.label || '').trim().slice(0, 40) || 'فارسی';
  const lang = String(b.lang || 'fa').trim().toLowerCase().slice(0, 10) || 'fa';

  const ep = await env.DB.prepare('SELECT id FROM episodes WHERE id = ?').bind(params.id).first();
  if (!ep) return json({ error: 'قسمت پیدا نشد' }, 404);

  await env.DB.batch([
    env.DB.prepare('DELETE FROM subtitles WHERE episode_id = ? AND lang = ? AND label = ?').bind(params.id, lang, label),
    env.DB.prepare(`INSERT INTO subtitles (episode_id, label, lang, vtt, source, source_format, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)`)
      .bind(params.id, label, lang, conv.vtt, conv.format === 'vtt' ? null : String(b.content), conv.format, new Date().toISOString()),
  ]);
  return json({ ok: true, cues: conv.cues, format: conv.format }, 201);
}
