import { create } from 'zustand';
import * as Crypto from 'expo-crypto';
import type { Alert, AlertStatus } from '../types';
import { getAlerts, createAlert as dbCreateAlert, updateAlert as dbUpdateAlert } from '../database';
import { useAuthStore } from './authStore';
import { useMachineStore } from './machineStore';

const TENANT_ID = 'tenant_demo';

interface AlertState {
  alerts: Alert[];
  isLoading: boolean;
  error: string | null;
  loadAlerts: (status?: AlertStatus) => Promise<void>;
  acknowledgeAlert: (alertId: string) => Promise<void>;
  clearAlert: (alertId: string) => Promise<void>;
  generateSimulatedAlert: () => Promise<void>;
  getOpenAlerts: () => Alert[];
  getAlertsByMachine: (machineId: string) => Alert[];
}

const ALERT_MESSAGES = [
  'High temperature detected',
  'Vibration exceeds threshold',
  'Oil pressure low',
  'Belt tension abnormal',
  'Speed variance detected',
  'Power consumption spike',
  'Sensor malfunction detected',
  'Unusual noise pattern',
  'Maintenance overdue alert',
  'Calibration required',
  'Motor current high',
  'Coolant level low',
];

const SEVERITIES: Alert['severity'][] = ['low', 'medium', 'high', 'critical'];

export const useAlertStore = create<AlertState>((set, get) => ({
  alerts: [],
  isLoading: false,
  error: null,

  loadAlerts: async (status?: AlertStatus) => {
    set({ isLoading: true, error: null });
    try {
      const alerts = await getAlerts(status);
      set({ alerts, isLoading: false });
    } catch (error) {
      console.error('Failed to load alerts:', error);
      set({ error: 'Failed to load alerts', isLoading: false });
    }
  },

  acknowledgeAlert: async (alertId: string) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('User not authenticated');

    const now = new Date().toISOString();

    await dbUpdateAlert(alertId, {
      status: 'acknowledged',
      acknowledgedBy: user.email,
      acknowledgedAt: now,
      synced: false,
    });

    set((state) => ({
      alerts: state.alerts.map((alert) =>
        alert.id === alertId
          ? {
              ...alert,
              status: 'acknowledged' as const,
              acknowledgedBy: user.email,
              acknowledgedAt: now,
              synced: false,
            }
          : alert
      ),
    }));
  },

  clearAlert: async (alertId: string) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('User not authenticated');

    const now = new Date().toISOString();

    await dbUpdateAlert(alertId, {
      status: 'cleared',
      clearedBy: user.email,
      clearedAt: now,
      synced: false,
    });

    set((state) => ({
      alerts: state.alerts.map((alert) =>
        alert.id === alertId
          ? {
              ...alert,
              status: 'cleared' as const,
              clearedBy: user.email,
              clearedAt: now,
              synced: false,
            }
          : alert
      ),
    }));
  },

  generateSimulatedAlert: async () => {
    const machines = useMachineStore.getState().machines;
    if (machines.length === 0) return;

    const machine = machines[Math.floor(Math.random() * machines.length)];
    const message = ALERT_MESSAGES[Math.floor(Math.random() * ALERT_MESSAGES.length)];
    const severity = SEVERITIES[Math.floor(Math.random() * SEVERITIES.length)];
    const now = new Date().toISOString();

    const alert: Omit<Alert, 'synced'> = {
      id: Crypto.randomUUID(),
      tenantId: TENANT_ID,
      machineId: machine.id,
      machineName: machine.name,
      message,
      severity,
      status: 'created',
      createdAt: now,
      acknowledgedBy: null,
      acknowledgedAt: null,
      clearedBy: null,
      clearedAt: null,
    };

    await dbCreateAlert(alert);

    set((state) => ({
      alerts: [{ ...alert, synced: false }, ...state.alerts],
    }));
  },

  getOpenAlerts: () => {
    return get().alerts.filter((a) => a.status !== 'cleared');
  },

  getAlertsByMachine: (machineId: string) => {
    return get().alerts.filter((a) => a.machineId === machineId);
  },
}));
