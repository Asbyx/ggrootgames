DROP TABLE IF EXISTS games;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS factions;
DROP TABLE IF EXISTS game_participants;

-- Users table to store player information
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  preferred_faction_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (preferred_faction_id) REFERENCES factions(id)
);

-- Factions table to store all available Root factions
CREATE TABLE factions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT
);

-- Games table to store basic game information
CREATE TABLE games (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  report_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT
);

-- Game participants table to store detailed player performance in each game
CREATE TABLE game_participants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  faction_id INTEGER NOT NULL,
  points INTEGER NOT NULL,
  ranking INTEGER NOT NULL,
  FOREIGN KEY (game_id) REFERENCES games(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (faction_id) REFERENCES factions(id)
);

-- Insert default factions
INSERT INTO factions (name, description) VALUES
  ('Marquise de Cat', 'Industrial might'),
  ('Eyrie Dynasties', 'Ancient birthright'),
  ('Woodland Alliance', 'Guerrilla insurgency'),
  ('Vagabond', 'Forest wanderer'),
  ('Riverfolk Company', 'Mercantile venture'),
  ('Lizard Cult', 'Religious order'),
  ('Underground Duchy', 'Subterranean empire'),
  ('Corvid Conspiracy', 'Masters of trickery'),
  ('Lord of the Hundreds', 'Ravenous hordes'),
  ('Keepers in Iron', 'Ancient guardians'); 