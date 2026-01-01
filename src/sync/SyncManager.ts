import { useSyncStore } from '../store/syncStore';
import NetInfo from '@react-native-community/netinfo';

const SYNC_INTERVAL = 60000;
let syncIntervalId: NodeJS.Timeout | null = null;
let networkUnsubscribe: (() => void) | null = null;

export function initializeSyncManager(): void {
  console.log('[SyncManager] Initializing...');

  networkUnsubscribe = useSyncStore.getState().subscribeToNetworkChanges();

  useSyncStore.getState().checkConnectivity();
  useSyncStore.getState().updatePendingCount();

  syncIntervalId = setInterval(() => {
    const state = useSyncStore.getState();
    if (state.isOnline && state.pendingCount > 0) {
      state.startSync();
    }
  }, SYNC_INTERVAL);

  useSyncStore.getState().startSync();

  console.log('[SyncManager] Initialized');
}

export function shutdownSyncManager(): void {
  console.log('[SyncManager] Shutting down...');

  if (syncIntervalId) {
    clearInterval(syncIntervalId);
    syncIntervalId = null;
  }

  if (networkUnsubscribe) {
    networkUnsubscribe();
    networkUnsubscribe = null;
  }

  console.log('[SyncManager] Shutdown complete');
}

export async function forceSyncNow(): Promise<void> {
  const state = useSyncStore.getState();

  if (!state.isOnline) {
    throw new Error('Cannot sync while offline');
  }

  await state.startSync();
}

export function getSyncStatus(): {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncTime: string | null;
} {
  const state = useSyncStore.getState();
  return {
    isOnline: state.isOnline,
    isSyncing: state.isSyncing,
    pendingCount: state.pendingCount,
    lastSyncTime: state.lastSyncTime,
  };
}
