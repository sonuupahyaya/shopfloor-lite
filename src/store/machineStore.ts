import { create } from 'zustand';
import type { Machine, MachineStatus } from '../types';
import { getMachines, updateMachineStatus as dbUpdateMachineStatus } from '../database';

interface MachineState {
  machines: Machine[];
  selectedMachine: Machine | null;
  isLoading: boolean;
  error: string | null;
  loadMachines: () => Promise<void>;
  selectMachine: (machine: Machine | null) => void;
  updateMachineStatus: (machineId: string, status: MachineStatus) => Promise<void>;
  getMachineById: (id: string) => Machine | undefined;
}

export const useMachineStore = create<MachineState>((set, get) => ({
  machines: [],
  selectedMachine: null,
  isLoading: false,
  error: null,

  loadMachines: async () => {
    set({ isLoading: true, error: null });
    try {
      const machines = await getMachines();
      set({ machines, isLoading: false });
    } catch (error) {
      console.error('Failed to load machines:', error);
      set({ error: 'Failed to load machines', isLoading: false });
    }
  },

  selectMachine: (machine: Machine | null) => {
    set({ selectedMachine: machine });
  },

  updateMachineStatus: async (machineId: string, status: MachineStatus) => {
    try {
      await dbUpdateMachineStatus(machineId, status);
      const machines = get().machines.map((m) =>
        m.id === machineId ? { ...m, status, lastUpdated: new Date().toISOString() } : m
      );
      set({ machines });

      const selectedMachine = get().selectedMachine;
      if (selectedMachine?.id === machineId) {
        set({ selectedMachine: { ...selectedMachine, status } });
      }
    } catch (error) {
      console.error('Failed to update machine status:', error);
      throw error;
    }
  },

  getMachineById: (id: string) => {
    return get().machines.find((m) => m.id === id);
  },
}));
