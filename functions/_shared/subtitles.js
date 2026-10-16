// تبدیل زیرنویس ASS/SSA و SRT به WebVTT

const pad = (n, l = 2) => String(n).padStart(l, '0');
function fmt(ms) {
  const h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(ms % 1000, 3)}`;
}
function assTime(t) {
  const m = String(t).trim().match(/^(\d+):(\d{1,2}):(\d{1,2})[.:](\d{1,3})$/);
  if (!m) return null;
  const frac = m[4].length === 3 ? +m[4] : +m[4] * Math.pow(10, 3 - m[4].length);
  return ((+m[1] * 60 + +m[2]) * 60 + +m[3]) * 1000 + frac;
}
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function assText(raw) {
  let out = '', italic = false, bold = false, drawing = false, top = false;
  for (const part of raw.split(/(\{[^}]*\})/)) {
    if (part.startsWith('{') && part.endsWith('}')) {
      if (/\\p[1-9]/.test(part)) drawing = true;
      if (/\\p0/.test(part)) drawing = false;
      if (/\\an[789]/.test(part)) top = true;
      if (/\\i1/.test(part) && !italic) { out += '<i>'; italic = true; }
      if (/\\i0/.test(part) && italic) { out += '</i>'; italic = false; }
      if (/\\b1/.test(part) && !bold) { out += '<b>'; bold = true; }
      if (/\\b0/.test(part) && bold) { out += '</b>'; bold = false; }
    } else if (!drawing) {
      out += esc(part);
    }
  }
  if (italic) out += '</i>';
  if (bold) out += '</b>';
  out = out.replace(/\\N/g, '\n').replace(/\\n/g, ' ').replace(/\\h/g, '\u00a0');
  const text = out.split('\n').map((l) => l.trim()).filter(Boolean).join('\n').replace(/-->/g, '- >');
  return { text, top };
}

function assToVtt(src) {
  const lines = src.split('\n');
  let inEvents = false, fields = null, cues = [];
  for (const line of lines) {
    const l = line.trim();
    if (/^\[.*\]$/.test(l)) { inEvents = /^\[events\]$/i.test(l); continue; }
    if (!inEvents) continue;
    if (/^format\s*:/i.test(l)) { fields = l.replace(/^format\s*:/i, '').split(',').map((x) => x.trim().toLowerCase()); continue; }
    if (!/^dialogue\s*:/i.test(l) || !fields) continue;
    const body = l.replace(/^dialogue\s*:\s*/i, '');
    const vals = []; let rest = body;
    for (let i = 0; i < fields.length - 1; i++) {
      const k = rest.indexOf(',');
      if (k < 0) break;
      vals.push(rest.slice(0, k)); rest = rest.slice(k + 1);
    }
    vals.push(rest);
    const rec = Object.fromEntries(fields.map((f, i) => [f, vals[i]]));
    const start = assTime(rec.start), end = assTime(rec.end);
    if (start == null || end == null || end <= start) continue;
    const { text, top } = assText(rec.text || '');
    if (!text) continue;
    cues.push({ start, end, text, top });
  }
  cues.sort((a, b) => a.start - b.start);
  const vtt = 'WEBVTT\n\n' + cues.map((c, i) =>
    `${i + 1}\n${fmt(c.start)} --> ${fmt(c.end)}${c.top ? ' line:10%' : ''}\n${c.text}\n`).join('\n');
  return { vtt, cues: cues.length };
}

function srtToVtt(src) {
  const body = src.replace(/(\d+:\d\d:\d\d),(\d{1,3})/g, (_, a, b) => `${a}.${b.padEnd(3, '0')}`).trim();
  return { vtt: 'WEBVTT\n\n' + body + '\n', cues: (body.match(/-->/g) || []).length };
}

export function detectFormat(src) {
  if (/^\s*WEBVTT/.test(src)) return 'vtt';
  if (/\[Script Info\]|\[Events\]/i.test(src)) return 'ass';
  if (/-->/.test(src)) return 'srt';
  return null;
}

// خروجی: { vtt, cues, format }
export function convertSubtitle(text) {
  const src = String(text || '').replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  const format = detectFormat(src);
  if (!format) throw new Error('فرمت زیرنویس شناخته نشد (فقط ass، ssa، srt یا vtt)');
  const r = format === 'ass' ? assToVtt(src) : format === 'srt' ? srtToVtt(src) : { vtt: src.trim() + '\n', cues: (src.match(/-->/g) || []).length };
  if (!r.cues) throw new Error('هیچ دیالوگی در فایل زیرنویس پیدا نشد');
  return { ...r, format };
}
