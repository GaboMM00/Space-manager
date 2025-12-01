-- ============================================
-- SPACE MANAGER - ANALYTICS DATABASE SCHEMA
-- Version: 2.0.0 (CORRECTED)
-- Date: 2025-11-30
-- Compatible with: SQLite 3.35+, better-sqlite3 ^9.6.0
-- ============================================

-- ============================================
-- PRAGMA SETTINGS
-- ============================================
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = -64000;  -- 64MB cache
PRAGMA temp_store = MEMORY;

-- ============================================
-- TABLES
-- ============================================

-- --------------------------------------------
-- Table: execution_logs
-- Purpose: Records every execution of a space
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS execution_logs (
  -- Identifiers
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  space_id TEXT NOT NULL,
  space_name TEXT NOT NULL,

  -- Timestamps (Unix time in milliseconds)
  started_at INTEGER NOT NULL,
  completed_at INTEGER,
  duration_ms INTEGER CHECK (duration_ms >= 0),

  -- Execution status
  success INTEGER NOT NULL CHECK (success IN (0, 1)),
  error_message TEXT,

  -- Resource summary
  resources_total INTEGER DEFAULT 0 CHECK (resources_total >= 0),
  resources_success INTEGER DEFAULT 0 CHECK (resources_success >= 0),
  resources_failed INTEGER DEFAULT 0 CHECK (resources_failed >= 0),

  -- Metadata
  created_at INTEGER NOT NULL DEFAULT ((strftime('%s', 'now') * 1000)),

  -- Additional constraints
  CHECK (resources_success + resources_failed <= resources_total)
);

-- Indexes for execution_logs
CREATE INDEX IF NOT EXISTS idx_execution_logs_space_id
  ON execution_logs(space_id);

CREATE INDEX IF NOT EXISTS idx_execution_logs_started_at
  ON execution_logs(started_at DESC);

CREATE INDEX IF NOT EXISTS idx_execution_logs_success
  ON execution_logs(success);

CREATE INDEX IF NOT EXISTS idx_execution_logs_composite
  ON execution_logs(space_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_execution_logs_date_range
  ON execution_logs(started_at DESC, completed_at DESC);

-- --------------------------------------------
-- Table: daily_metrics
-- Purpose: Aggregated metrics per day
-- (Automatically updated by triggers)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS daily_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  space_id TEXT NOT NULL,
  date INTEGER NOT NULL,  -- Format: YYYYMMDD (e.g., 20251130)

  -- Counters
  execution_count INTEGER DEFAULT 0 CHECK (execution_count >= 0),
  success_count INTEGER DEFAULT 0 CHECK (success_count >= 0),
  failure_count INTEGER DEFAULT 0 CHECK (failure_count >= 0),

  -- Duration metrics (in milliseconds)
  avg_duration_ms INTEGER DEFAULT 0 CHECK (avg_duration_ms >= 0),
  total_duration_ms INTEGER DEFAULT 0 CHECK (total_duration_ms >= 0),
  min_duration_ms INTEGER CHECK (min_duration_ms >= 0),
  max_duration_ms INTEGER CHECK (max_duration_ms >= 0),

  -- Metadata
  updated_at INTEGER NOT NULL DEFAULT ((strftime('%s', 'now') * 1000)),

  -- Constraints
  UNIQUE(space_id, date),
  CHECK (success_count + failure_count = execution_count)
);

-- Indexes for daily_metrics
CREATE INDEX IF NOT EXISTS idx_daily_metrics_space_id
  ON daily_metrics(space_id);

CREATE INDEX IF NOT EXISTS idx_daily_metrics_date
  ON daily_metrics(date DESC);

CREATE INDEX IF NOT EXISTS idx_daily_metrics_composite
  ON daily_metrics(space_id, date DESC);

-- --------------------------------------------
-- Table: resource_stats
-- Purpose: Statistics per individual resource
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS resource_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  space_id TEXT NOT NULL,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('application', 'url', 'file', 'script')),
  resource_path TEXT NOT NULL,

  -- Counters
  execution_count INTEGER DEFAULT 0 CHECK (execution_count >= 0),
  success_count INTEGER DEFAULT 0 CHECK (success_count >= 0),
  failure_count INTEGER DEFAULT 0 CHECK (failure_count >= 0),

  -- Time metrics
  last_executed_at INTEGER,
  avg_execution_time_ms INTEGER CHECK (avg_execution_time_ms >= 0),
  total_execution_time_ms INTEGER DEFAULT 0 CHECK (total_execution_time_ms >= 0),

  -- Metadata
  created_at INTEGER NOT NULL DEFAULT ((strftime('%s', 'now') * 1000)),
  updated_at INTEGER NOT NULL DEFAULT ((strftime('%s', 'now') * 1000)),

  -- Constraints
  UNIQUE(space_id, resource_type, resource_path),
  CHECK (success_count + failure_count = execution_count)
);

-- Indexes for resource_stats
CREATE INDEX IF NOT EXISTS idx_resource_stats_space_id
  ON resource_stats(space_id);

CREATE INDEX IF NOT EXISTS idx_resource_stats_type
  ON resource_stats(resource_type);

CREATE INDEX IF NOT EXISTS idx_resource_stats_last_executed
  ON resource_stats(last_executed_at DESC);

CREATE INDEX IF NOT EXISTS idx_resource_stats_composite
  ON resource_stats(space_id, resource_type);

-- --------------------------------------------
-- Table: error_logs
-- Purpose: Detailed error tracking
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS error_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  space_id TEXT NOT NULL,
  execution_log_id INTEGER,

  -- Error information
  error_type TEXT NOT NULL CHECK (error_type IN ('resource_error', 'system_error', 'validation_error', 'timeout_error', 'permission_error')),
  error_code TEXT,
  error_message TEXT NOT NULL,
  stack_trace TEXT,

  -- Error context
  resource_type TEXT CHECK (resource_type IN ('application', 'url', 'file', 'script', NULL)),
  resource_path TEXT,
  context TEXT,  -- JSON string with additional information

  -- Metadata
  occurred_at INTEGER NOT NULL DEFAULT ((strftime('%s', 'now') * 1000)),

  -- Foreign Key
  FOREIGN KEY (execution_log_id) REFERENCES execution_logs(id) ON DELETE CASCADE
);

-- Indexes for error_logs
CREATE INDEX IF NOT EXISTS idx_error_logs_space_id
  ON error_logs(space_id);

CREATE INDEX IF NOT EXISTS idx_error_logs_execution_log_id
  ON error_logs(execution_log_id);

CREATE INDEX IF NOT EXISTS idx_error_logs_type
  ON error_logs(error_type);

CREATE INDEX IF NOT EXISTS idx_error_logs_occurred_at
  ON error_logs(occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_error_logs_composite
  ON error_logs(space_id, occurred_at DESC);

-- --------------------------------------------
-- Table: system_metrics (Optional)
-- Purpose: System metrics during executions
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS system_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  execution_log_id INTEGER NOT NULL,

  -- System metrics
  cpu_usage REAL CHECK (cpu_usage >= 0 AND cpu_usage <= 100),
  memory_usage_mb INTEGER CHECK (memory_usage_mb >= 0),
  disk_read_mb INTEGER CHECK (disk_read_mb >= 0),
  disk_write_mb INTEGER CHECK (disk_write_mb >= 0),
  network_sent_kb INTEGER CHECK (network_sent_kb >= 0),
  network_received_kb INTEGER CHECK (network_received_kb >= 0),

  -- Timestamp
  recorded_at INTEGER NOT NULL DEFAULT ((strftime('%s', 'now') * 1000)),

  -- Foreign Key
  FOREIGN KEY (execution_log_id) REFERENCES execution_logs(id) ON DELETE CASCADE
);

-- Indexes for system_metrics
CREATE INDEX IF NOT EXISTS idx_system_metrics_execution_log_id
  ON system_metrics(execution_log_id);

CREATE INDEX IF NOT EXISTS idx_system_metrics_recorded_at
  ON system_metrics(recorded_at DESC);

-- --------------------------------------------
-- Table: schema_versions
-- Purpose: Version control for migrations
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS schema_versions (
  version INTEGER PRIMARY KEY,
  description TEXT NOT NULL,
  applied_at INTEGER NOT NULL DEFAULT ((strftime('%s', 'now') * 1000))
);

-- Insert initial version
INSERT OR IGNORE INTO schema_versions (version, description)
VALUES (1, 'Initial schema with corrected design - v2.0.0');

-- ============================================
-- TRIGGERS
-- ============================================

-- --------------------------------------------
-- Trigger: Update daily_metrics on new execution
-- --------------------------------------------
CREATE TRIGGER IF NOT EXISTS trg_update_daily_metrics_on_insert
AFTER INSERT ON execution_logs
WHEN NEW.completed_at IS NOT NULL
BEGIN
  INSERT INTO daily_metrics (
    space_id, date, execution_count, success_count, failure_count,
    total_duration_ms, avg_duration_ms, min_duration_ms, max_duration_ms, updated_at
  )
  VALUES (
    NEW.space_id,
    CAST(strftime('%Y%m%d', NEW.started_at / 1000, 'unixepoch') AS INTEGER),
    1,
    NEW.success,
    CASE WHEN NEW.success = 0 THEN 1 ELSE 0 END,
    COALESCE(NEW.duration_ms, 0),
    COALESCE(NEW.duration_ms, 0),
    NEW.duration_ms,
    NEW.duration_ms,
    (strftime('%s', 'now') * 1000)
  )
  ON CONFLICT(space_id, date) DO UPDATE SET
    execution_count = execution_count + 1,
    success_count = success_count + NEW.success,
    failure_count = failure_count + (CASE WHEN NEW.success = 0 THEN 1 ELSE 0 END),
    total_duration_ms = total_duration_ms + COALESCE(NEW.duration_ms, 0),
    avg_duration_ms = CAST((total_duration_ms + COALESCE(NEW.duration_ms, 0)) AS REAL) / (execution_count + 1),
    min_duration_ms = MIN(COALESCE(min_duration_ms, NEW.duration_ms), NEW.duration_ms),
    max_duration_ms = MAX(COALESCE(max_duration_ms, NEW.duration_ms), NEW.duration_ms),
    updated_at = (strftime('%s', 'now') * 1000);
END;

-- --------------------------------------------
-- Trigger: Update daily_metrics when execution completes
-- --------------------------------------------
CREATE TRIGGER IF NOT EXISTS trg_update_daily_metrics_on_complete
AFTER UPDATE OF completed_at ON execution_logs
WHEN NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL
BEGIN
  INSERT INTO daily_metrics (
    space_id, date, execution_count, success_count, failure_count,
    total_duration_ms, avg_duration_ms, min_duration_ms, max_duration_ms, updated_at
  )
  VALUES (
    NEW.space_id,
    CAST(strftime('%Y%m%d', NEW.started_at / 1000, 'unixepoch') AS INTEGER),
    1,
    NEW.success,
    CASE WHEN NEW.success = 0 THEN 1 ELSE 0 END,
    COALESCE(NEW.duration_ms, 0),
    COALESCE(NEW.duration_ms, 0),
    NEW.duration_ms,
    NEW.duration_ms,
    (strftime('%s', 'now') * 1000)
  )
  ON CONFLICT(space_id, date) DO UPDATE SET
    execution_count = execution_count + 1,
    success_count = success_count + NEW.success,
    failure_count = failure_count + (CASE WHEN NEW.success = 0 THEN 1 ELSE 0 END),
    total_duration_ms = total_duration_ms + COALESCE(NEW.duration_ms, 0),
    avg_duration_ms = CAST((total_duration_ms + COALESCE(NEW.duration_ms, 0)) AS REAL) / (execution_count + 1),
    min_duration_ms = MIN(COALESCE(min_duration_ms, NEW.duration_ms), NEW.duration_ms),
    max_duration_ms = MAX(COALESCE(max_duration_ms, NEW.duration_ms), NEW.duration_ms),
    updated_at = (strftime('%s', 'now') * 1000);
END;

-- --------------------------------------------
-- Trigger: Update updated_at in resource_stats
-- --------------------------------------------
CREATE TRIGGER IF NOT EXISTS trg_update_resource_stats_timestamp
AFTER UPDATE ON resource_stats
FOR EACH ROW
BEGIN
  UPDATE resource_stats
  SET updated_at = (strftime('%s', 'now') * 1000)
  WHERE id = NEW.id;
END;

-- ============================================
-- VIEWS
-- ============================================

-- --------------------------------------------
-- View: Space usage summary
-- --------------------------------------------
CREATE VIEW IF NOT EXISTS v_space_usage_summary AS
SELECT
  space_id,
  space_name,
  COUNT(*) as total_executions,
  SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful_executions,
  SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) as failed_executions,
  ROUND(CAST(SUM(success) AS REAL) / COUNT(*) * 100, 2) as success_rate_percent,
  ROUND(AVG(duration_ms), 2) as avg_duration_ms,
  MAX(started_at) as last_executed_at,
  MIN(started_at) as first_executed_at
FROM execution_logs
GROUP BY space_id, space_name
ORDER BY total_executions DESC;

-- --------------------------------------------
-- View: Recent trends (last 30 days)
-- --------------------------------------------
CREATE VIEW IF NOT EXISTS v_recent_trends AS
SELECT
  date,
  SUM(execution_count) as total_executions,
  SUM(success_count) as total_success,
  SUM(failure_count) as total_failures,
  ROUND(AVG(avg_duration_ms), 2) as avg_duration,
  COUNT(DISTINCT space_id) as active_spaces,
  ROUND(CAST(SUM(success_count) AS REAL) / SUM(execution_count) * 100, 2) as success_rate_percent
FROM daily_metrics
WHERE date >= CAST(strftime('%Y%m%d', 'now', '-30 days') AS INTEGER)
GROUP BY date
ORDER BY date DESC;

-- --------------------------------------------
-- View: Top errors (last 7 days)
-- --------------------------------------------
CREATE VIEW IF NOT EXISTS v_top_errors AS
SELECT
  error_type,
  error_message,
  COUNT(*) as occurrence_count,
  MAX(occurred_at) as last_occurred_at,
  MIN(occurred_at) as first_occurred_at,
  COUNT(DISTINCT space_id) as affected_spaces
FROM error_logs
WHERE occurred_at >= (strftime('%s', 'now', '-7 days') * 1000)
GROUP BY error_type, error_message
ORDER BY occurrence_count DESC
LIMIT 20;

-- --------------------------------------------
-- View: Resource performance by type
-- --------------------------------------------
CREATE VIEW IF NOT EXISTS v_resource_performance AS
SELECT
  resource_type,
  COUNT(*) as total_resources,
  SUM(execution_count) as total_executions,
  SUM(success_count) as total_success,
  SUM(failure_count) as total_failures,
  ROUND(CAST(SUM(success_count) AS REAL) / NULLIF(SUM(execution_count), 0) * 100, 2) as success_rate_percent,
  ROUND(AVG(avg_execution_time_ms), 2) as avg_time_ms
FROM resource_stats
GROUP BY resource_type
ORDER BY total_executions DESC;

-- ============================================
-- UTILITY QUERIES
-- ============================================

-- Query: Get today's date in YYYYMMDD format
-- SELECT CAST(strftime('%Y%m%d', 'now') AS INTEGER) as today;

-- Query: Convert timestamp to readable format
-- SELECT datetime(timestamp_ms / 1000, 'unixepoch', 'localtime') as readable_time;

-- Query: Get current timestamp in milliseconds
-- SELECT (strftime('%s', 'now') * 1000) as current_timestamp_ms;

-- ============================================
-- END OF SCHEMA
-- ============================================
