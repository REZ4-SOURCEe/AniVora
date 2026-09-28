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