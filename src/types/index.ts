export type UserRole = 'operator' | 'supervisor';

export type MachineStatus = 'RUN' | 'IDLE' | 'OFF';

export type MachineType = 'cutter' | 'roller' | 'packer';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  tenantId: string;
  token: string;
}

export interface Machine {
  id: string;
  name: string;
  type: MachineType;
  status: MachineStatus;
  lastUpdated: string;
}

export interface DowntimeReason {
  code: string;
  label: string;
  children?: DowntimeReason[];
}

export interface DowntimeEvent {
  id: string;
  uniqueId: string;
  tenantId: string;
  machineId: string;
  startTime: string;
  endTime: string | null;
  reasonCode: string;
  reasonLabel: string;
  parentReasonCode: string | null;
  parentReasonLabel: string | null;
  photoPath: string | null;
  notes: string | null;
  synced: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceItem {
  id: string;
  machineId: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'due' | 'overdue' | 'done';
  completedAt: string | null;
  completedBy: string | null;
  notes: string | null;
  synced: boolean;
}

export type AlertStatus = 'created' | 'acknowledged' | 'cleared';

export interface Alert {
  id: string;
  machineId: string;
  machineName: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: AlertStatus;
  createdAt: string;
  acknowledgedBy: string | null;
  acknowledgedAt: string | null;
  clearedBy: string | null;
  clearedAt: string | null;
  synced: boolean;
}

export interface SyncQueueItem {
  id: string;
  entityType: 'downtime' | 'maintenance' | 'alert';
  entityId: string;
  action: 'create' | 'update' | 'delete';
  payload: string;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  retryCount: number;
  createdAt: string;
  lastAttempt: string | null;
  errorMessage: string | null;
}

export interface KPIData {
  totalDowntimeToday: number;
  totalDowntimeMinutes: number;
  alertsTotal: number;
  alertsOpen: number;
  alertsClosed: number;
  machinesDown: number;
  machinesRunning: number;
  maintenanceTotal: number;
  maintenanceCompleted: number;
  maintenanceCompletedPercent: number;
}
