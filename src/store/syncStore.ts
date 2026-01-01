import { create } from 'zustand';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import {
  getPendingSyncItems,
  updateSyncQueueItem,
  markEntitySynced,
  getPendingSyncCount,
} from '../database';
import { apiService } from '../services/apiService';
import type { SyncQueueItem } from '../types';

interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncTime: string | null;
  syncError: string | null;
  checkConnectivity: () => Promise<boolean>;
  startSync: () => Promise<void>;
  updatePendingCount: () => Promise<void>;
  subscribeToNetworkChanges: () => () => void;
}

export const useSyncStore = create<SyncState>((set, get) => ({
  isOnline: true,
  isSyncing: false,
  pendingCount: 0,
  lastSyncTime: null,
  syncError: null,

  checkConnectivity: async () => {
    try {
      const state = await NetInfo.fetch();
      const isOnline = state.isConnected === true && state.isInternetReachable !== false;
      set({ isOnline });
      return isOnline;
    } catch (error) {
      console.error('Failed to check connectivity:', error);
      set({ isOnline: false });
      return false;
    }
  },

  updatePendingCount: async () => {
    try {
      const count = await getPendingSyncCount();
      set({ pendingCount: count });
    } catch (error) {
      console.error('Failed to get pending sync count:', error);
    }
  },

  startSync: async () => {
    const state = get();
    if (state.isSyncing) return;

    const isOnline = await get().checkConnectivity();
    if (!isOnline) {
      set({ syncError: 'No internet connection' });
      return;
    }

    set({ isSyncing: true, syncError: null });

    try {
      const pendingItems = await getPendingSyncItems();
      
      for (const item of pendingItems) {
        try {
          await updateSyncQueueItem(item.id, 'syncing');

          const success = await syncItem(item);

          if (success) {
            await updateSyncQueueItem(item.id, 'synced');
            await markEntitySynced(item.entityType, item.entityId);
          } else {
            await updateSyncQueueItem(item.id, 'failed', 'Sync failed');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          await updateSyncQueueItem(item.id, 'failed', errorMessage);
          console.error(`Failed to sync item ${item.id}:`, error);
        }
      }

      await get().updatePendingCount();
      set({ lastSyncTime: new Date().toISOString(), isSyncing: false });
    } catch (error) {
      console.error('Sync failed:', error);
      set({
        syncError: error instanceof Error ? error.message : 'Sync failed',
        isSyncing: false,
      });
    }
  },

  subscribeToNetworkChanges: () => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const isOnline = state.isConnected === true && state.isInternetReachable !== false;
      const wasOffline = !get().isOnline;

      set({ isOnline });

      if (isOnline && wasOffline) {
        get().startSync();
      }
    });

    return unsubscribe;
  },
}));

async function syncItem(item: SyncQueueItem): Promise<boolean> {
  const payload = JSON.parse(item.payload);

  switch (item.entityType) {
    case 'downtime':
      if (item.action === 'create') {
        return apiService.syncDowntimeEvent(payload);
      } else if (item.action === 'update') {
        return apiService.updateDowntimeEvent(item.entityId, payload);
      }
      break;

    case 'maintenance':
      if (item.action === 'update') {
        return apiService.updateMaintenanceItem(item.entityId, payload);
      }
      break;

    case 'alert':
      if (item.action === 'create') {
        return apiService.syncAlert(payload);
      } else if (item.action === 'update') {
        return apiService.updateAlert(item.entityId, payload);
      }
      break;
  }

  return true;
}
