-- Bot Tracking tables (Pro feature)

-- Raw ingest table (temporary, aggregated hourly then deleted)
CREATE TABLE IF NOT EXISTS bot_visits (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  domain TEXT NOT NULL,
  bot_name TEXT NOT NULL,
  bot_category TEXT NOT NULL,
  path TEXT NOT NULL,
  user_agent TEXT,
  visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_bot_visits_visited_at ON bot_visits (visited_at);

-- Aggregated table (powers dashboard, retained 30 days)
CREATE TABLE IF NOT EXISTS bot_visits_hourly (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  domain TEXT NOT NULL,
  bot_name TEXT NOT NULL,
  bot_category TEXT NOT NULL,
  path TEXT NOT NULL,
  visit_count INT NOT NULL DEFAULT 1,
  hour_bucket TIMESTAMPTZ NOT NULL,
  UNIQUE (user_id, domain, bot_name, path, hour_bucket)
);
CREATE INDEX IF NOT EXISTS idx_bot_hourly_user_domain ON bot_visits_hourly (user_id, domain, hour_bucket);
