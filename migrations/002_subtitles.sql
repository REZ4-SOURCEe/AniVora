-- اجرا فقط یک بار:
--   npx wrangler d1 execute anivora-db --remote --file=migrations/002_subtitles.sql
CREATE TABLE IF NOT EXISTS subtitles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  episode_id INTEGER NOT NULL REFERENCES episodes(id),
  label TEXT NOT NULL,
  lang TEXT NOT NULL DEFAULT 'fa',
  vtt TEXT NOT NULL,        -- نسخه‌ی تبدیل‌شده که پلیر می‌خواند
  source TEXT,              -- فایل اصلی (ass/srt) برای آینده
  source_format TEXT,
  created_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_sub_ep ON subtitles(episode_id);
