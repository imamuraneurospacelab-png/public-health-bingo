PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS rooms (
  code TEXT PRIMARY KEY,
  pin TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting',
  current_pos INTEGER NOT NULL DEFAULT -1,
  revealed INTEGER NOT NULL DEFAULT 0,
  question_order TEXT NOT NULL,
  win_lines INTEGER NOT NULL DEFAULT 1,
  winner_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  room_code TEXT NOT NULL,
  name TEXT NOT NULL,
  card TEXT NOT NULL,
  marked TEXT NOT NULL DEFAULT '[]',
  lines INTEGER NOT NULL DEFAULT 0,
  rank INTEGER,
  joined_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_code) REFERENCES rooms(code) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS responses (
  room_code TEXT NOT NULL,
  player_id TEXT NOT NULL,
  question_id INTEGER NOT NULL,
  choice INTEGER NOT NULL,
  answered_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (room_code, player_id, question_id),
  FOREIGN KEY (room_code) REFERENCES rooms(code) ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_players_room ON players(room_code);
CREATE INDEX IF NOT EXISTS idx_responses_room_question ON responses(room_code, question_id);
