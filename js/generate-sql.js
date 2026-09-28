// generate-sql.js
// در روت پروژه بذار و با node generate-sql.js اجرا کن

import fs from 'fs';
import { ANIME_DATA } from './js/data.js';

let sql = `-- ============================================
-- ANIVORA — D1 Import Data
-- Generated automatically from data.js
-- ============================================

DROP TABLE IF EXISTS episodes;
DROP TABLE IF EXISTS anime;

CREATE TABLE anime (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  title_jp TEXT,
  description TEXT,
  poster TEXT,
  backdrop TEXT,
  score REAL,
  year INTEGER,
  status TEXT,
  type TEXT,
  genres TEXT
);

CREATE TABLE episodes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  anime_id INTEGER NOT NULL REFERENCES anime(id),
  season INTEGER DEFAULT 1,
  number INTEGER,
  title TEXT,
  duration TEXT,
  thumb TEXT,
  video_url TEXT,
  qualities TEXT
);
CREATE INDEX idx_ep_anime ON episodes(anime_id);

-- ============================================
-- ANIME INSERTS
-- ============================================
`;

function esc(str) {
  if (str === null || str === undefined) return 'NULL';
  return "'" + String(str).replace(/'/g, "''") + "'";
}

// Anime inserts
ANIME_DATA.forEach(a => {
  const genresJson = JSON.stringify(a.genres || []);
  sql += `INSERT INTO anime (id, title, title_jp, description, poster, backdrop, score, year, status, type, genres) VALUES (${a.id}, ${esc(a.title)}, ${esc(a.jp)}, ${esc(a.description)}, ${esc(a.img)}, ${esc(a.backdrop)}, ${a.score}, ${a.year}, ${esc(a.status)}, ${esc(a.type)}, ${esc(genresJson)});\n`;
});

sql += `\n-- ============================================\n-- EPISODE INSERTS\n-- ============================================\n`;

// Episode inserts
ANIME_DATA.forEach(a => {
  if (!a.seasons) return;
  a.seasons.forEach(season => {
    season.episodes.forEach(ep => {
      const qualitiesJson = JSON.stringify(ep.qualities || []);
      sql += `INSERT INTO episodes (anime_id, season, number, title, duration, thumb, video_url, qualities) VALUES (${a.id}, ${season.seasonNumber}, ${ep.num}, ${esc(ep.title)}, ${esc(ep.duration)}, ${esc(ep.img)}, ${esc(ep.videoUrl)}, ${esc(qualitiesJson)});\n`;
    });
  });
});

fs.writeFileSync('import-data.sql', sql);
console.log('✅ Generated import-data.sql with ' + ANIME_DATA.length + ' anime and all episodes');