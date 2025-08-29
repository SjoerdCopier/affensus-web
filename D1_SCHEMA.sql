-- D1 Database Schema for Network Monitors
-- Run this in your D1 database

CREATE TABLE IF NOT EXISTS network_monitors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    domain TEXT NOT NULL,
    display_name TEXT,
    enabled INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_check_at DATETIME,
    last_status INTEGER,
    last_response_time INTEGER,
    notification_enabled INTEGER DEFAULT 1,
    check_interval_minutes INTEGER DEFAULT 5
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_network_monitors_user_id ON network_monitors(user_id);
CREATE INDEX IF NOT EXISTS idx_network_monitors_domain ON network_monitors(domain);
CREATE INDEX IF NOT EXISTS idx_network_monitors_enabled ON network_monitors(enabled);
