import type { DowntimeEvent, MaintenanceItem, Alert } from '../types';

const API_NETWORK_DELAY = 500;
const API_FAILURE_RATE = 0; // Set to 0.05 to enable failure simulation for testing

function simulateNetworkDelay(): Promise<void> {
  const delay = API_NETWORK_DELAY + Math.random() * 500;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

function shouldRetryFail(): boolean {
  return Math.random() < API_FAILURE_RATE;
}

class ShopFloorApiService {
  private baseUrl = 'https://api.shopfloor.cloud';

  async syncDowntimeEvent(event: Partial<DowntimeEvent>): Promise<boolean> {
    await simulateNetworkDelay();

    if (shouldRetryFail()) {
      throw new Error('Network error: Failed to sync downtime event');
    }

    console.log('[ShopFloorAPI] Synced downtime event:', event.uniqueId);
    return true;
  }

  async updateDowntimeEvent(
    eventId: string,
    updates: Partial<DowntimeEvent>
  ): Promise<boolean> {
    await simulateNetworkDelay();

    if (shouldRetryFail()) {
      throw new Error('Network error: Failed to update downtime event');
    }

    console.log('[ShopFloorAPI] Updated downtime event:', eventId, updates);
    return true;
  }

  async updateMaintenanceItem(
    itemId: string,
    updates: Partial<MaintenanceItem>
  ): Promise<boolean> {
    await simulateNetworkDelay();

    if (shouldRetryFail()) {
      throw new Error('Network error: Failed to update maintenance item');
    }

    console.log('[ShopFloorAPI] Updated maintenance item:', itemId, updates);
    return true;
  }

  async syncAlert(alert: Partial<Alert>): Promise<boolean> {
    await simulateNetworkDelay();

    if (shouldRetryFail()) {
      throw new Error('Network error: Failed to sync alert');
    }

    console.log('[ShopFloorAPI] Synced alert:', alert.id);
    return true;
  }

  async updateAlert(alertId: string, updates: Partial<Alert>): Promise<boolean> {
    await simulateNetworkDelay();

    if (shouldRetryFail()) {
      throw new Error('Network error: Failed to update alert');
    }

    console.log('[ShopFloorAPI] Updated alert:', alertId, updates);
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
      return !shouldRetryFail();
    } catch {
      return false;
    }
  }
}

export const apiService = new ShopFloorApiService();
