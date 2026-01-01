import { create } from 'zustand';
import type { MaintenanceItem } from '../types';
import { getMaintenanceItems, updateMaintenanceItem as dbUpdateMaintenanceItem } from '../database';
import { useAuthStore } from './authStore';

interface MaintenanceState {
  items: MaintenanceItem[];
  isLoading: boolean;
  error: string | null;
  loadItems: (machineId?: string) => Promise<void>;
  markAsDone: (itemId: string, notes?: string) => Promise<void>;
  addNote: (itemId: string, notes: string) => Promise<void>;
  getItemsByMachine: (machineId: string) => MaintenanceItem[];
}

export const useMaintenanceStore = create<MaintenanceState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  loadItems: async (machineId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const items = await getMaintenanceItems(machineId);
      
      const now = new Date();
      const updatedItems = items.map((item) => {
        if (item.status === 'done') return item;
        
        const dueDate = new Date(item.dueDate);
        const isOverdue = dueDate < now;
        
        return {
          ...item,
          status: isOverdue ? 'overdue' as const : 'due' as const,
        };
      });
      
      set({ items: updatedItems, isLoading: false });
    } catch (error) {
      console.error('Failed to load maintenance items:', error);
      set({ error: 'Failed to load maintenance items', isLoading: false });
    }
  },

  markAsDone: async (itemId: string, notes?: string) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('User not authenticated');

    const now = new Date().toISOString();

    await dbUpdateMaintenanceItem(itemId, {
      status: 'done',
      completedAt: now,
      completedBy: user.email,
      notes: notes ?? null,
      synced: false,
    });

    set((state) => ({
      items: state.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              status: 'done' as const,
              completedAt: now,
              completedBy: user.email,
              notes: notes ?? item.notes,
              synced: false,
            }
          : item
      ),
    }));
  },

  addNote: async (itemId: string, notes: string) => {
    await dbUpdateMaintenanceItem(itemId, { notes, synced: false });

    set((state) => ({
      items: state.items.map((item) =>
        item.id === itemId ? { ...item, notes, synced: false } : item
      ),
    }));
  },

  getItemsByMachine: (machineId: string) => {
    return get().items.filter((item) => item.machineId === machineId);
  },
}));
