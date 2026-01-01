import * as SQLite from 'expo-sqlite';

export const DATABASE_NAME = 'shopfloor.db';

export const SCHEMA_SQL = `
-- Users table for local authentication cache
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('operator', 'supervisor')),
  tenant_id TEXT NOT NULL,
  token TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Machines table
CREATE TABLE IF NOT EXISTS machines (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('cutter', 'roller', 'packer')),
  status TEXT NOT NULL DEFAULT 'IDLE' CHECK (status IN ('RUN', 'IDLE', 'OFF')),
  last_updated TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Downtime events table
CREATE TABLE IF NOT EXISTS downtime_events (
  id TEXT PRIMARY KEY,
  unique_id TEXT UNIQUE NOT NULL,
  tenant_id TEXT NOT NULL,
  machine_id TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT,
  reason_code TEXT NOT NULL,
  reason_label TEXT NOT NULL,
  parent_reason_code TEXT,
  parent_reason_label TEXT,
  photo_path TEXT,
  notes TEXT,
  synced INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (machine_id) REFERENCES machines(id)
);

-- Maintenance items table
CREATE TABLE IF NOT EXISTS maintenance_items (
  id TEXT PRIMARY KEY,
  machine_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'due' CHECK (status IN ('due', 'overdue', 'done')),
  completed_at TEXT,
  completed_by TEXT,
  notes TEXT,
  synced INTEGER DEFAULT 0,
  FOREIGN KEY (machine_id) REFERENCES machines(id)
);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  machine_id TEXT NOT NULL,
  machine_name TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'acknowledged', 'cleared')),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  acknowledged_by TEXT,
  acknowledged_at TEXT,
  cleared_by TEXT,
  cleared_at TEXT,
  synced INTEGER DEFAULT 0,
  FOREIGN KEY (machine_id) REFERENCES machines(id)
);

-- Sync queue for offline-first operations
CREATE TABLE IF NOT EXISTS sync_queue (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('downtime', 'maintenance', 'alert')),
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  payload TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'syncing', 'synced', 'failed')),
  retry_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  last_attempt TEXT,
  error_message TEXT
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_downtime_machine ON downtime_events(machine_id);
CREATE INDEX IF NOT EXISTS idx_downtime_synced ON downtime_events(synced);
CREATE INDEX IF NOT EXISTS idx_downtime_start_time ON downtime_events(start_time);
CREATE INDEX IF NOT EXISTS idx_maintenance_machine ON maintenance_items(machine_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance_items(status);
CREATE INDEX IF NOT EXISTS idx_alerts_machine ON alerts(machine_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(status);
`;

export const SEED_MACHINES_SQL = `
INSERT OR REPLACE INTO machines (id, name, type, status, last_updated) VALUES
  ('M-101', 'Cutter 1', 'cutter', 'RUN', datetime('now')),
  ('M-102', 'Roller A', 'roller', 'IDLE', datetime('now')),
  ('M-103', 'Packing West', 'packer', 'RUN', datetime('now'));
`;

export const SEED_MAINTENANCE_SQL = `
INSERT OR REPLACE INTO maintenance_items (id, machine_id, title, description, due_date, status) VALUES
  ('MT-001', 'M-101', 'Blade Inspection', 'Check blade sharpness and alignment', date('now', '+1 day'), 'due'),
  ('MT-002', 'M-101', 'Lubrication Check', 'Check and refill cutting oil', date('now', '-1 day'), 'overdue'),
  ('MT-003', 'M-102', 'Belt Tension Check', 'Verify roller belt tension is within spec', date('now', '+3 days'), 'due'),
  ('MT-004', 'M-102', 'Bearing Inspection', 'Listen for unusual sounds, check for play', date('now', '-2 days'), 'overdue'),
  ('MT-005', 'M-103', 'Seal Replacement', 'Replace worn sealing elements', date('now'), 'due'),
  ('MT-006', 'M-103', 'Sensor Calibration', 'Calibrate weight and position sensors', date('now', '+5 days'), 'due');
`;
