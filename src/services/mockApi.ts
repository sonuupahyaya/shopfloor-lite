import type { DowntimeEvent, MaintenanceItem, Alert } from '../types';

const SIMULATED_NETWORK_DELAY = 500;
const SIMULATED_FAILURE_RATE = 0; // Set to 0.05 to re-enable simulated failures

function simulateNetworkDelay(): Promise<void> {
  const delay = SIMULATED_NETWORK_DELAY + Math.random() * 500;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

function shouldSimulateFailure(): boolean {
  return Math.random() < SIMULATED_FAILURE_RATE;
}

class MockApiService {
  private baseUrl = 'https://api.shopfloor.local';

  async syncDowntimeEvent(event: Partial<DowntimeEvent>): Promise<boolean> {
    await simulateNetworkDelay();

    if (shouldSimulateFailure()) {
      throw new Error('Network error: Failed to sync downtime event');
    }

    console.log('[MockAPI] Synced downtime event:', event.uniqueId);
    return true;
  }

  async updateDowntimeEvent(
    eventId: string,
    updates: Partial<DowntimeEvent>
  ): Promise<boolean> {
    await simulateNetworkDelay();

    if (shouldSimulateFailure()) {
      throw new Error('Network error: Failed to update downtime event');
    }

    console.log('[MockAPI] Updated downtime event:', eventId, updates);
    return true;
  }

  async updateMaintenanceItem(
    itemId: string,
    updates: Partial<MaintenanceItem>
  ): Promise<boolean> {
    await simulateNetworkDelay();

    if (shouldSimulateFailure()) {
      throw new Error('Network error: Failed to update maintenance item');
    }

    console.log('[MockAPI] Updated maintenance item:', itemId, updates);
    return true;
  }

  async syncAlert(alert: Partial<Alert>): Promise<boolean> {
    await simulateNetworkDelay();

    if (shouldSimulateFailure()) {
      throw new Error('Network error: Failed to sync alert');
    }

    console.log('[MockAPI] Synced alert:', alert.id);
    return true;
  }

  async updateAlert(alertId: string, updates: Partial<Alert>): Promise<boolean> {
    await simulateNetworkDelay();

    if (shouldSimulateFailure()) {
      throw new Error('Network error: Failed to update alert');
    }

    console.log('[MockAPI] Updated alert:', alertId, updates);
    return true;
  }

  async fetchMachines(): Promise<{ id: string; name: string; type: string }[]> {
    await simulateNetworkDelay();

    return [
      { id: 'M-101', name: 'Cutter 1', type: 'cutter' },
      { id: 'M-102', name: 'Roller A', type: 'roller' },
      { id: 'M-103', name: 'Packing West', type: 'packer' },
    ];
  }

  async healthCheck(): Promise<boolean> {
    try {
      await simulateNetworkDelay();
      return !shouldSimulateFailure();
    } catch {
      return false;
    }
  }
}

export const mockApiService = new MockApiService();
