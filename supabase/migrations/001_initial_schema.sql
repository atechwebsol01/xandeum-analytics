-- Xandeum Analytics Database Schema
-- This creates all tables needed for historical data, alerts, and activity tracking

-- ============================================
-- NETWORK SNAPSHOTS (Historical network stats)
-- ============================================
CREATE TABLE IF NOT EXISTS network_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  total_nodes INTEGER NOT NULL,
  online_nodes INTEGER NOT NULL,
  offline_nodes INTEGER NOT NULL,
  warning_nodes INTEGER NOT NULL,
  total_storage_committed BIGINT NOT NULL,
  total_storage_used BIGINT NOT NULL,
  average_credits DECIMAL(12, 2) NOT NULL,
  total_credits BIGINT NOT NULL,
  average_xscore DECIMAL(5, 2) NOT NULL,
  version_distribution JSONB DEFAULT '{}'
);

-- Index for time-based queries
CREATE INDEX IF NOT EXISTS idx_network_snapshots_created_at ON network_snapshots(created_at DESC);

-- ============================================
-- NODE SNAPSHOTS (Historical per-node stats)
-- ============================================
CREATE TABLE IF NOT EXISTS node_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  pubkey TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('online', 'warning', 'offline')),
  credits INTEGER DEFAULT 0,
  xscore INTEGER DEFAULT 0,
  uptime INTEGER DEFAULT 0,
  storage_committed BIGINT DEFAULT 0,
  storage_used BIGINT DEFAULT 0,
  version TEXT,
  ip TEXT
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_node_snapshots_pubkey ON node_snapshots(pubkey);
CREATE INDEX IF NOT EXISTS idx_node_snapshots_created_at ON node_snapshots(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_node_snapshots_pubkey_created ON node_snapshots(pubkey, created_at DESC);

-- ============================================
-- ACTIVITY HEATMAP (Aggregated activity data)
-- ============================================
CREATE TABLE IF NOT EXISTS activity_heatmap (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  pubkey TEXT NOT NULL,
  hour INTEGER NOT NULL CHECK (hour >= 0 AND hour <= 23),
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  activity_count INTEGER DEFAULT 1,
  average_status DECIMAL(3, 2) DEFAULT 1.0,
  UNIQUE(pubkey, hour, day_of_week)
);

-- Index for heatmap queries
CREATE INDEX IF NOT EXISTS idx_activity_heatmap_pubkey ON activity_heatmap(pubkey);

-- ============================================
-- TELEGRAM SUBSCRIBERS (Alert subscriptions)
-- ============================================
CREATE TABLE IF NOT EXISTS telegram_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  chat_id TEXT UNIQUE NOT NULL,
  watched_nodes TEXT[] DEFAULT '{}',
  alert_on_offline BOOLEAN DEFAULT TRUE,
  alert_on_warning BOOLEAN DEFAULT FALSE,
  alert_on_credits_drop BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE
);

-- Index for active subscribers
CREATE INDEX IF NOT EXISTS idx_telegram_subscribers_active ON telegram_subscribers(is_active) WHERE is_active = TRUE;

-- ============================================
-- NODE ALERTS (Alert history)
-- ============================================
CREATE TABLE IF NOT EXISTS node_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  pubkey TEXT NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('offline', 'warning', 'credits_drop', 'back_online')),
  message TEXT NOT NULL,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ
);

-- Indexes for alert queries
CREATE INDEX IF NOT EXISTS idx_node_alerts_pubkey ON node_alerts(pubkey);
CREATE INDEX IF NOT EXISTS idx_node_alerts_created_at ON node_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_node_alerts_unresolved ON node_alerts(resolved) WHERE resolved = FALSE;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE network_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE node_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_heatmap ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE node_alerts ENABLE ROW LEVEL SECURITY;

-- Public read access for snapshots (anyone can view historical data)
CREATE POLICY "Public read access for network_snapshots" ON network_snapshots
  FOR SELECT USING (true);

CREATE POLICY "Public read access for node_snapshots" ON node_snapshots
  FOR SELECT USING (true);

CREATE POLICY "Public read access for activity_heatmap" ON activity_heatmap
  FOR SELECT USING (true);

CREATE POLICY "Public read access for node_alerts" ON node_alerts
  FOR SELECT USING (true);

-- Service role can insert/update (for cron jobs)
CREATE POLICY "Service role insert for network_snapshots" ON network_snapshots
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role insert for node_snapshots" ON node_snapshots
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role all for activity_heatmap" ON activity_heatmap
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role all for node_alerts" ON node_alerts
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role all for telegram_subscribers" ON telegram_subscribers
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- CLEANUP FUNCTION (Delete old data)
-- ============================================
CREATE OR REPLACE FUNCTION cleanup_old_snapshots()
RETURNS void AS $$
BEGIN
  -- Keep last 30 days of network snapshots
  DELETE FROM network_snapshots WHERE created_at < NOW() - INTERVAL '30 days';
  
  -- Keep last 7 days of detailed node snapshots
  DELETE FROM node_snapshots WHERE created_at < NOW() - INTERVAL '7 days';
  
  -- Keep last 90 days of alerts
  DELETE FROM node_alerts WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;
