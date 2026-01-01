import { create } from 'zustand';
import * as Crypto from 'expo-crypto';
import type { DowntimeEvent, DowntimeReason } from '../types';
import {
  createDowntimeEvent,
  updateDowntimeEvent,
  getDowntimeEvents,
  getActiveDowntimeForMachine,
} from '../database';
import { useAuthStore } from './authStore';

interface DowntimeState {
  events: DowntimeEvent[];
  activeDowntime: Record<string, DowntimeEvent | null>;
  isLoading: boolean;
  error: string | null;
  reasonTree: DowntimeReason[];
  loadEvents: (machineId?: string) => Promise<void>;
  startDowntime: (machineId: string) => Promise<DowntimeEvent>;
  endDowntime: (
    eventId: string,
    reasonCode: string,
    reasonLabel: string,
    parentReasonCode?: string,
    parentReasonLabel?: string,
    photoPath?: string,
    notes?: string
  ) => Promise<void>;
  getActiveDowntime: (machineId: string) => Promise<DowntimeEvent | null>;
  checkActiveDowntimes: () => Promise<void>;
}

const DOWNTIME_REASON_TREE: DowntimeReason[] = [
  {
    code: 'POWER',
    label: 'Power',
    children: [
      { code: 'GRID', label: 'Grid' },
      { code: 'INTERNAL', label: 'Internal' },
    ],
  },
  {
    code: 'CHANGEOVER',
    label: 'Changeover',
    children: [{ code: 'TOOLING', label: 'Tooling' }],
  },
  {
    code: 'MECHANICAL',
    label: 'Mechanical',
    children: [
      { code: 'BREAKDOWN', label: 'Breakdown' },
      { code: 'WEAR', label: 'Wear & Tear' },
      { code: 'VIBRATION', label: 'Vibration' },
    ],
  },
  {
    code: 'QUALITY',
    label: 'Quality',
    children: [
      { code: 'DEFECT', label: 'Defective Output' },
      { code: 'CALIBRATION', label: 'Calibration Required' },
    ],
  },
  {
    code: 'MATERIAL',
    label: 'Material',
    children: [
      { code: 'SHORTAGE', label: 'Material Shortage' },
      { code: 'JAM', label: 'Material Jam' },
    ],
  },
  {
    code: 'OPERATOR',
    label: 'Operator',
    children: [
      { code: 'BREAK', label: 'Scheduled Break' },
      { code: 'TRAINING', label: 'Training' },
      { code: 'ABSENT', label: 'Operator Absent' },
    ],
  },
];

export const useDowntimeStore = create<DowntimeState>((set, get) => ({
  events: [],
  activeDowntime: {},
  isLoading: false,
  error: null,
  reasonTree: DOWNTIME_REASON_TREE,

  loadEvents: async (machineId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const events = await getDowntimeEvents(machineId);
      set({ events, isLoading: false });
    } catch (error) {
      console.error('Failed to load downtime events:', error);
      set({ error: 'Failed to load downtime events', isLoading: false });
    }
  },

  startDowntime: async (machineId: string) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('User not authenticated');

    const uniqueId = Crypto.randomUUID();
    const now = new Date().toISOString();

    const eventData = {
      uniqueId,
      tenantId: user.tenantId,
      machineId,
      startTime: now,
      endTime: null,
      reasonCode: 'PENDING',
      reasonLabel: 'Pending Selection',
      parentReasonCode: null,
      parentReasonLabel: null,
      photoPath: null,
      notes: null,
      synced: false,
    };

    const id = await createDowntimeEvent(eventData);

    const event: DowntimeEvent = {
      ...eventData,
      id,
      createdAt: now,
      updatedAt: now,
    };

    set((state) => ({
      events: [event, ...state.events],
      activeDowntime: {
        ...state.activeDowntime,
        [machineId]: event,
      },
    }));

    return event;
  },

  endDowntime: async (
    eventId: string,
    reasonCode: string,
    reasonLabel: string,
    parentReasonCode?: string,
    parentReasonLabel?: string,
    photoPath?: string,
    notes?: string
  ) => {
    const now = new Date().toISOString();

    await updateDowntimeEvent(eventId, {
      endTime: now,
      reasonCode,
      reasonLabel,
      parentReasonCode: parentReasonCode ?? null,
      parentReasonLabel: parentReasonLabel ?? null,
      photoPath: photoPath ?? null,
      notes: notes ?? null,
    });

    set((state) => {
      const updatedEvents = state.events.map((e) =>
        e.id === eventId
          ? {
              ...e,
              endTime: now,
              reasonCode,
              reasonLabel,
              parentReasonCode: parentReasonCode ?? null,
              parentReasonLabel: parentReasonLabel ?? null,
              photoPath: photoPath ?? null,
              notes: notes ?? null,
              updatedAt: now,
            }
          : e
      );

      const event = updatedEvents.find((e) => e.id === eventId);
      const newActiveDowntime = { ...state.activeDowntime };

      if (event) {
        newActiveDowntime[event.machineId] = null;
      }

      return {
        events: updatedEvents,
        activeDowntime: newActiveDowntime,
      };
    });
  },

  getActiveDowntime: async (machineId: string) => {
    const cached = get().activeDowntime[machineId];
    if (cached !== undefined) return cached;

    const event = await getActiveDowntimeForMachine(machineId);
    set((state) => ({
      activeDowntime: {
        ...state.activeDowntime,
        [machineId]: event,
      },
    }));
    return event;
  },

  checkActiveDowntimes: async () => {
    const events = await getDowntimeEvents();
    const activeDowntime: Record<string, DowntimeEvent | null> = {};

    for (const event of events) {
      if (!event.endTime) {
        activeDowntime[event.machineId] = event;
      }
    }

    set({ activeDowntime });
  },
}));
