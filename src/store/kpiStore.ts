import { create } from 'zustand';
import type { KPIData } from '../types';
import {
  getTodayDowntimeStats,
  getAlertStats,
  getMachineStats,
  getMaintenanceStats,
} from '../database';

interface KPIState {
  data: KPIData | null;
  isLoading: boolean;
  error: string | null;
  loadKPIs: () => Promise<void>;
}

export const useKPIStore = create<KPIState>((set) => ({
  data: null,
  isLoading: false,
  error: null,

  loadKPIs: async () => {
    set({ isLoading: true, error: null });
    try {
      const [downtimeStats, alertStats, machineStats, maintenanceStats] = await Promise.all([
        getTodayDowntimeStats(),
        getAlertStats(),
        getMachineStats(),
        getMaintenanceStats(),
      ]);

      const data: KPIData = {
        totalDowntimeToday: downtimeStats.count,
        totalDowntimeMinutes: downtimeStats.totalMinutes,
        alertsTotal: alertStats.total,
        alertsOpen: alertStats.open,
        alertsClosed: alertStats.closed,
        machinesDown: machineStats.down,
        machinesRunning: machineStats.running,
        maintenanceTotal: maintenanceStats.total,
        maintenanceCompleted: maintenanceStats.completed,
        maintenanceCompletedPercent:
          maintenanceStats.total > 0
            ? Math.round((maintenanceStats.completed / maintenanceStats.total) * 100)
            : 0,
      };

      set({ data, isLoading: false });
    } catch (error) {
      console.error('Failed to load KPIs:', error);
      set({ error: 'Failed to load KPI data', isLoading: false });
    }
  },
}));
