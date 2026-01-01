import * as SQLite from 'expo-sqlite';
import { DATABASE_NAME, SCHEMA_SQL, SEED_MACHINES_SQL, SEED_MAINTENANCE_SQL } from './schema';
import type {
  Machine,
  DowntimeEvent,
  MaintenanceItem,
  Alert,
  SyncQueueItem,
  User,
} from '../types';

let db: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<void> | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    if (!initPromise) {
      initPromise = initializeDatabase();
    }
    await initPromise;
  }
  return db;
}

async function initializeDatabase(): Promise<void> {
  if (!db) return;

  const statements = SCHEMA_SQL.split(';').filter((s) => s.trim());
  for (const statement of statements) {
    if (statement.trim()) {
      await db.execAsync(statement + ';');
    }
  }

  // Run migrations for existing databases
  await runMigrations();

  const machines = await db.getAllAsync<{ id: string }>('SELECT id FROM machines LIMIT 1');
  if (machines.length === 0) {
    await db.execAsync(SEED_MACHINES_SQL);
    await db.execAsync(SEED_MAINTENANCE_SQL);
  }
}

async function runMigrations(): Promise<void> {
  if (!db) return;

  // Check if tenant_id column exists in alerts table
  const alertColumns = await db.getAllAsync<{ name: string }>(
    `PRAGMA table_info(alerts)`
  );
  const hasTenantId = alertColumns.some((col) => col.name === 'tenant_id');

  if (!hasTenantId) {
    console.log('[Database] Running migration: adding tenant_id to alerts');
    await db.execAsync(`ALTER TABLE alerts ADD COLUMN tenant_id TEXT DEFAULT 'tenant_demo'`);
  }
}

export async function getMachines(): Promise<Machine[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<{
    id: string;
    name: string;
    type: string;
    status: string;
    last_updated: string;
  }>('SELECT * FROM machines ORDER BY name');

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    type: row.type as Machine['type'],
    status: row.status as Machine['status'],
    lastUpdated: row.last_updated,
  }));
}

export async function updateMachineStatus(
  machineId: string,
  status: Machine['status']
): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    'UPDATE machines SET status = ?, last_updated = datetime("now") WHERE id = ?',
    [status, machineId]
  );
}

export async function createDowntimeEvent(event: Omit<DowntimeEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const database = await getDatabase();
  const id = event.uniqueId;

  await database.runAsync(
    `INSERT INTO downtime_events (
      id, unique_id, tenant_id, machine_id, start_time, end_time,
      reason_code, reason_label, parent_reason_code, parent_reason_label,
      photo_path, notes, synced
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      event.uniqueId,
      event.tenantId,
      event.machineId,
      event.startTime,
      event.endTime,
      event.reasonCode,
      event.reasonLabel,
      event.parentReasonCode,
      event.parentReasonLabel,
      event.photoPath,
      event.notes,
      event.synced ? 1 : 0,
    ]
  );

  await addToSyncQueue('downtime', id, 'create', event);
  return id;
}

export async function updateDowntimeEvent(
  id: string,
  updates: Partial<DowntimeEvent>
): Promise<void> {
  const database = await getDatabase();
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (updates.endTime !== undefined) {
    fields.push('end_time = ?');
    values.push(updates.endTime);
  }
  if (updates.reasonCode !== undefined) {
    fields.push('reason_code = ?');
    values.push(updates.reasonCode);
  }
  if (updates.reasonLabel !== undefined) {
    fields.push('reason_label = ?');
    values.push(updates.reasonLabel);
  }
  if (updates.parentReasonCode !== undefined) {
    fields.push('parent_reason_code = ?');
    values.push(updates.parentReasonCode);
  }
  if (updates.parentReasonLabel !== undefined) {
    fields.push('parent_reason_label = ?');
    values.push(updates.parentReasonLabel);
  }
  if (updates.photoPath !== undefined) {
    fields.push('photo_path = ?');
    values.push(updates.photoPath);
  }
  if (updates.notes !== undefined) {
    fields.push('notes = ?');
    values.push(updates.notes);
  }
  if (updates.synced !== undefined) {
    fields.push('synced = ?');
    values.push(updates.synced ? 1 : 0);
  }

  fields.push('updated_at = datetime("now")');
  values.push(id);

  await database.runAsync(
    `UPDATE downtime_events SET ${fields.join(', ')} WHERE id = ?`,
    values
  );

  await addToSyncQueue('downtime', id, 'update', updates);
}

export async function getDowntimeEvents(machineId?: string): Promise<DowntimeEvent[]> {
  const database = await getDatabase();
  let query = 'SELECT * FROM downtime_events';
  const params: string[] = [];

  if (machineId) {
    query += ' WHERE machine_id = ?';
    params.push(machineId);
  }

  query += ' ORDER BY start_time DESC';

  const rows = await database.getAllAsync<{
    id: string;
    unique_id: string;
    tenant_id: string;
    machine_id: string;
    start_time: string;
    end_time: string | null;
    reason_code: string;
    reason_label: string;
    parent_reason_code: string | null;
    parent_reason_label: string | null;
    photo_path: string | null;
    notes: string | null;
    synced: number;
    created_at: string;
    updated_at: string;
  }>(query, params);

  return rows.map((row) => ({
    id: row.id,
    uniqueId: row.unique_id,
    tenantId: row.tenant_id,
    machineId: row.machine_id,
    startTime: row.start_time,
    endTime: row.end_time,
    reasonCode: row.reason_code,
    reasonLabel: row.reason_label,
    parentReasonCode: row.parent_reason_code,
    parentReasonLabel: row.parent_reason_label,
    photoPath: row.photo_path,
    notes: row.notes,
    synced: row.synced === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function getActiveDowntimeForMachine(machineId: string): Promise<DowntimeEvent | null> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<{
    id: string;
    unique_id: string;
    tenant_id: string;
    machine_id: string;
    start_time: string;
    end_time: string | null;
    reason_code: string;
    reason_label: string;
    parent_reason_code: string | null;
    parent_reason_label: string | null;
    photo_path: string | null;
    notes: string | null;
    synced: number;
    created_at: string;
    updated_at: string;
  }>(
    'SELECT * FROM downtime_events WHERE machine_id = ? AND end_time IS NULL ORDER BY start_time DESC LIMIT 1',
    [machineId]
  );

  if (rows.length === 0) return null;

  const row = rows[0];
  return {
    id: row.id,
    uniqueId: row.unique_id,
    tenantId: row.tenant_id,
    machineId: row.machine_id,
    startTime: row.start_time,
    endTime: row.end_time,
    reasonCode: row.reason_code,
    reasonLabel: row.reason_label,
    parentReasonCode: row.parent_reason_code,
    parentReasonLabel: row.parent_reason_label,
    photoPath: row.photo_path,
    notes: row.notes,
    synced: row.synced === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getMaintenanceItems(machineId?: string): Promise<MaintenanceItem[]> {
  const database = await getDatabase();
  let query = 'SELECT * FROM maintenance_items';
  const params: string[] = [];

  if (machineId) {
    query += ' WHERE machine_id = ?';
    params.push(machineId);
  }

  query += ' ORDER BY due_date ASC';

  const rows = await database.getAllAsync<{
    id: string;
    machine_id: string;
    title: string;
    description: string;
    due_date: string;
    status: string;
    completed_at: string | null;
    completed_by: string | null;
    notes: string | null;
    synced: number;
  }>(query, params);

  return rows.map((row) => ({
    id: row.id,
    machineId: row.machine_id,
    title: row.title,
    description: row.description,
    dueDate: row.due_date,
    status: row.status as MaintenanceItem['status'],
    completedAt: row.completed_at,
    completedBy: row.completed_by,
    notes: row.notes,
    synced: row.synced === 1,
  }));
}

export async function updateMaintenanceItem(
  id: string,
  updates: Partial<MaintenanceItem>
): Promise<void> {
  const database = await getDatabase();
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (updates.status !== undefined) {
    fields.push('status = ?');
    values.push(updates.status);
  }
  if (updates.completedAt !== undefined) {
    fields.push('completed_at = ?');
    values.push(updates.completedAt);
  }
  if (updates.completedBy !== undefined) {
    fields.push('completed_by = ?');
    values.push(updates.completedBy);
  }
  if (updates.notes !== undefined) {
    fields.push('notes = ?');
    values.push(updates.notes);
  }
  if (updates.synced !== undefined) {
    fields.push('synced = ?');
    values.push(updates.synced ? 1 : 0);
  }

  values.push(id);

  await database.runAsync(
    `UPDATE maintenance_items SET ${fields.join(', ')} WHERE id = ?`,
    values
  );

  await addToSyncQueue('maintenance', id, 'update', updates);
}

export async function getAlerts(status?: Alert['status']): Promise<Alert[]> {
  const database = await getDatabase();
  let query = 'SELECT * FROM alerts';
  const params: string[] = [];

  if (status) {
    query += ' WHERE status = ?';
    params.push(status);
  }

  query += ' ORDER BY created_at DESC';

  const rows = await database.getAllAsync<{
    id: string;
    tenant_id: string;
    machine_id: string;
    machine_name: string;
    message: string;
    severity: string;
    status: string;
    created_at: string;
    acknowledged_by: string | null;
    acknowledged_at: string | null;
    cleared_by: string | null;
    cleared_at: string | null;
    synced: number;
  }>(query, params);

  return rows.map((row) => ({
    id: row.id,
    tenantId: row.tenant_id,
    machineId: row.machine_id,
    machineName: row.machine_name,
    message: row.message,
    severity: row.severity as Alert['severity'],
    status: row.status as Alert['status'],
    createdAt: row.created_at,
    acknowledgedBy: row.acknowledged_by,
    acknowledgedAt: row.acknowledged_at,
    clearedBy: row.cleared_by,
    clearedAt: row.cleared_at,
    synced: row.synced === 1,
  }));
}

export async function createAlert(alert: Omit<Alert, 'synced'>): Promise<string> {
  const database = await getDatabase();

  await database.runAsync(
    `INSERT INTO alerts (
      id, tenant_id, machine_id, machine_name, message, severity, status,
      created_at, acknowledged_by, acknowledged_at, cleared_by, cleared_at, synced
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
    [
      alert.id,
      alert.tenantId,
      alert.machineId,
      alert.machineName,
      alert.message,
      alert.severity,
      alert.status,
      alert.createdAt,
      alert.acknowledgedBy,
      alert.acknowledgedAt,
      alert.clearedBy,
      alert.clearedAt,
    ]
  );

  await addToSyncQueue('alert', alert.id, 'create', alert);
  return alert.id;
}

export async function updateAlert(
  id: string,
  updates: Partial<Alert>
): Promise<void> {
  const database = await getDatabase();
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (updates.status !== undefined) {
    fields.push('status = ?');
    values.push(updates.status);
  }
  if (updates.acknowledgedBy !== undefined) {
    fields.push('acknowledged_by = ?');
    values.push(updates.acknowledgedBy);
  }
  if (updates.acknowledgedAt !== undefined) {
    fields.push('acknowledged_at = ?');
    values.push(updates.acknowledgedAt);
  }
  if (updates.clearedBy !== undefined) {
    fields.push('cleared_by = ?');
    values.push(updates.clearedBy);
  }
  if (updates.clearedAt !== undefined) {
    fields.push('cleared_at = ?');
    values.push(updates.clearedAt);
  }
  if (updates.synced !== undefined) {
    fields.push('synced = ?');
    values.push(updates.synced ? 1 : 0);
  }

  values.push(id);

  await database.runAsync(
    `UPDATE alerts SET ${fields.join(', ')} WHERE id = ?`,
    values
  );

  await addToSyncQueue('alert', id, 'update', updates);
}

export async function addToSyncQueue(
  entityType: SyncQueueItem['entityType'],
  entityId: string,
  action: SyncQueueItem['action'],
  payload: unknown
): Promise<void> {
  const database = await getDatabase();
  const id = `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  await database.runAsync(
    `INSERT INTO sync_queue (id, entity_type, entity_id, action, payload, status, retry_count)
     VALUES (?, ?, ?, ?, ?, 'pending', 0)`,
    [id, entityType, entityId, action, JSON.stringify(payload)]
  );
}

export async function getPendingSyncItems(): Promise<SyncQueueItem[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<{
    id: string;
    entity_type: string;
    entity_id: string;
    action: string;
    payload: string;
    status: string;
    retry_count: number;
    created_at: string;
    last_attempt: string | null;
    error_message: string | null;
  }>(
    `SELECT * FROM sync_queue WHERE status IN ('pending', 'failed') AND retry_count < 3 ORDER BY created_at ASC`
  );

  return rows.map((row) => ({
    id: row.id,
    entityType: row.entity_type as SyncQueueItem['entityType'],
    entityId: row.entity_id,
    action: row.action as SyncQueueItem['action'],
    payload: row.payload,
    status: row.status as SyncQueueItem['status'],
    retryCount: row.retry_count,
    createdAt: row.created_at,
    lastAttempt: row.last_attempt,
    errorMessage: row.error_message,
  }));
}

export async function updateSyncQueueItem(
  id: string,
  status: SyncQueueItem['status'],
  errorMessage?: string
): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `UPDATE sync_queue SET 
      status = ?, 
      last_attempt = datetime('now'),
      retry_count = retry_count + 1,
      error_message = ?
     WHERE id = ?`,
    [status, errorMessage ?? null, id]
  );
}

export async function markEntitySynced(
  entityType: SyncQueueItem['entityType'],
  entityId: string
): Promise<void> {
  const database = await getDatabase();
  let table: string;

  switch (entityType) {
    case 'downtime':
      table = 'downtime_events';
      break;
    case 'maintenance':
      table = 'maintenance_items';
      break;
    case 'alert':
      table = 'alerts';
      break;
  }

  await database.runAsync(`UPDATE ${table} SET synced = 1 WHERE id = ?`, [entityId]);
}

export async function getPendingSyncCount(): Promise<number> {
  const database = await getDatabase();
  const result = await database.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM sync_queue WHERE status IN ('pending', 'syncing')`
  );
  return result?.count ?? 0;
}

export async function getTodayDowntimeStats(): Promise<{ count: number; totalMinutes: number }> {
  const database = await getDatabase();
  const today = new Date().toISOString().split('T')[0];

  const result = await database.getFirstAsync<{ count: number; total_minutes: number }>(
    `SELECT 
      COUNT(*) as count,
      COALESCE(SUM(
        CASE 
          WHEN end_time IS NOT NULL THEN 
            (julianday(end_time) - julianday(start_time)) * 24 * 60
          ELSE 
            (julianday('now') - julianday(start_time)) * 24 * 60
        END
      ), 0) as total_minutes
     FROM downtime_events 
     WHERE date(start_time) = ?`,
    [today]
  );

  return {
    count: result?.count ?? 0,
    totalMinutes: Math.round(result?.total_minutes ?? 0),
  };
}

export async function getAlertStats(): Promise<{ total: number; open: number; closed: number }> {
  const database = await getDatabase();
  const result = await database.getFirstAsync<{ total: number; open: number; closed: number }>(
    `SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status IN ('created', 'acknowledged') THEN 1 ELSE 0 END) as open,
      SUM(CASE WHEN status = 'cleared' THEN 1 ELSE 0 END) as closed
     FROM alerts`
  );

  return {
    total: result?.total ?? 0,
    open: result?.open ?? 0,
    closed: result?.closed ?? 0,
  };
}

export async function getMachineStats(): Promise<{ running: number; down: number }> {
  const database = await getDatabase();
  const result = await database.getFirstAsync<{ running: number; down: number }>(
    `SELECT 
      SUM(CASE WHEN status = 'RUN' THEN 1 ELSE 0 END) as running,
      SUM(CASE WHEN status IN ('IDLE', 'OFF') THEN 1 ELSE 0 END) as down
     FROM machines`
  );

  return {
    running: result?.running ?? 0,
    down: result?.down ?? 0,
  };
}

export async function getMaintenanceStats(): Promise<{ total: number; completed: number }> {
  const database = await getDatabase();
  const result = await database.getFirstAsync<{ total: number; completed: number }>(
    `SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as completed
     FROM maintenance_items`
  );

  return {
    total: result?.total ?? 0,
    completed: result?.completed ?? 0,
  };
}

export async function saveUser(user: User): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT OR REPLACE INTO users (id, email, role, tenant_id, token) VALUES (?, ?, ?, ?, ?)`,
    [user.id, user.email, user.role, user.tenantId, user.token]
  );
}

export async function getUser(): Promise<User | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<{
    id: string;
    email: string;
    role: string;
    tenant_id: string;
    token: string;
  }>('SELECT * FROM users LIMIT 1');

  if (!row) return null;

  return {
    id: row.id,
    email: row.email,
    role: row.role as User['role'],
    tenantId: row.tenant_id,
    token: row.token,
  };
}

export async function clearUser(): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM users');
}
