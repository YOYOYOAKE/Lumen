PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS contents (
  id TEXT PRIMARY KEY,
  collection TEXT NOT NULL CHECK (collection IN ('posts', 'jottings', 'docs')),
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  create_time INTEGER NOT NULL,
  last_edited_time INTEGER,
  published_at INTEGER,
  completed INTEGER NOT NULL DEFAULT 1 CHECK (completed IN (0, 1)),
  top INTEGER NOT NULL DEFAULT 0 CHECK (top IN (0, 1)),
  words INTEGER,
  content_format TEXT NOT NULL DEFAULT 'markdown' CHECK (content_format IN ('markdown', 'html')),
  content_r2_key TEXT NOT NULL,
  tags_cache TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (collection, slug)
);

CREATE INDEX IF NOT EXISTS idx_contents_collection_time
  ON contents (collection, create_time DESC);

CREATE INDEX IF NOT EXISTS idx_contents_collection_top_time
  ON contents (collection, top DESC, create_time DESC);

CREATE INDEX IF NOT EXISTS idx_contents_status_collection
  ON contents (status, collection);

CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL COLLATE NOCASE UNIQUE,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS content_tags (
  content_id TEXT NOT NULL,
  tag_id INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  PRIMARY KEY (content_id, tag_id),
  FOREIGN KEY (content_id) REFERENCES contents (id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_content_tags_tag
  ON content_tags (tag_id);

CREATE TABLE IF NOT EXISTS content_headings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content_id TEXT NOT NULL,
  depth INTEGER NOT NULL CHECK (depth BETWEEN 1 AND 6),
  slug TEXT NOT NULL,
  text TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  FOREIGN KEY (content_id) REFERENCES contents (id) ON DELETE CASCADE,
  UNIQUE (content_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_content_headings_content_sort
  ON content_headings (content_id, sort_order ASC);

CREATE TABLE IF NOT EXISTS friends (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  website TEXT NOT NULL,
  icon TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (website)
);

CREATE INDEX IF NOT EXISTS idx_friends_sort
  ON friends (sort_order ASC, created_at ASC);

CREATE TABLE IF NOT EXISTS site_kv (
  key TEXT PRIMARY KEY,
  value_json TEXT NOT NULL,
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE VIRTUAL TABLE IF NOT EXISTS content_fts USING fts5(
  content_id UNINDEXED,
  title,
  description,
  tags,
  tokenize = 'unicode61'
);

CREATE TRIGGER IF NOT EXISTS trg_contents_ai_fts
AFTER INSERT ON contents
BEGIN
  INSERT INTO content_fts (content_id, title, description, tags)
  VALUES (new.id, new.title, new.description, new.tags_cache);
END;

CREATE TRIGGER IF NOT EXISTS trg_contents_ad_fts
AFTER DELETE ON contents
BEGIN
  DELETE FROM content_fts WHERE content_id = old.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_contents_au_fts
AFTER UPDATE OF title, description, tags_cache ON contents
BEGIN
  UPDATE content_fts
  SET title = new.title,
      description = new.description,
      tags = new.tags_cache
  WHERE content_id = new.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_contents_touch_updated_at
AFTER UPDATE ON contents
FOR EACH ROW
WHEN new.updated_at = old.updated_at
BEGIN
  UPDATE contents
  SET updated_at = unixepoch()
  WHERE id = new.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_friends_touch_updated_at
AFTER UPDATE ON friends
FOR EACH ROW
WHEN new.updated_at = old.updated_at
BEGIN
  UPDATE friends
  SET updated_at = unixepoch()
  WHERE id = new.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_content_tags_ai_refresh_tags_cache
AFTER INSERT ON content_tags
BEGIN
  UPDATE contents
  SET tags_cache = (
    SELECT COALESCE(group_concat(t.name, ' '), '')
    FROM content_tags ct
    JOIN tags t ON t.id = ct.tag_id
    WHERE ct.content_id = new.content_id
  )
  WHERE id = new.content_id;
END;

CREATE TRIGGER IF NOT EXISTS trg_content_tags_ad_refresh_tags_cache
AFTER DELETE ON content_tags
BEGIN
  UPDATE contents
  SET tags_cache = (
    SELECT COALESCE(group_concat(t.name, ' '), '')
    FROM content_tags ct
    JOIN tags t ON t.id = ct.tag_id
    WHERE ct.content_id = old.content_id
  )
  WHERE id = old.content_id;
END;
