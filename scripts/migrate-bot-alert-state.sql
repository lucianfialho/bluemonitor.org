-- Bot alert state tracking (prevents duplicate alerts)
CREATE TABLE IF NOT EXISTS bot_alert_state (
  user_id TEXT NOT NULL,
  domain TEXT NOT NULL,
  alert_type TEXT NOT NULL DEFAULT 'googlebot_inactive',
  last_alerted_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, domain, alert_type)
);
