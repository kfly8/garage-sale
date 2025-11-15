-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  github_id TEXT NOT NULL UNIQUE,
  github_username TEXT NOT NULL,
  email TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Projects table (メンテナーを募集しているOSS)
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  repository_url TEXT NOT NULL,
  languages TEXT NOT NULL, -- JSON array as string
  maintainer_requirements TEXT,
  is_paid BOOLEAN NOT NULL DEFAULT 0,
  compensation_amount INTEGER,
  compensation_currency TEXT,
  compensation_description TEXT,
  owner_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open', -- open, matched, closed
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id)
);

-- Maintainers table (メンテナー希望者)
CREATE TABLE maintainers (
  id TEXT PRIMARY KEY,
  github_username TEXT NOT NULL,
  name TEXT NOT NULL,
  bio TEXT,
  skills TEXT NOT NULL, -- JSON array as string
  languages TEXT NOT NULL, -- JSON array as string
  experience TEXT, -- JSON array as string
  availability TEXT NOT NULL, -- full-time, part-time, volunteer
  interested_in_paid BOOLEAN NOT NULL DEFAULT 0,
  portfolio_url TEXT,
  user_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Matches table (マッチング)
CREATE TABLE matches (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  maintainer_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, rejected, completed
  message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (maintainer_id) REFERENCES maintainers(id)
);

-- Sessions table
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  github_id TEXT NOT NULL,
  github_username TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_projects_owner ON projects(owner_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_maintainers_user ON maintainers(user_id);
CREATE INDEX idx_matches_project ON matches(project_id);
CREATE INDEX idx_matches_maintainer ON matches(maintainer_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);
