import { useAlertStore } from '../store/alertStore';

let intervalId: NodeJS.Timeout | null = null;

const ALERT_GENERATION_INTERVAL = 30000;

export function startAlertGenerator(): void {
  if (intervalId) {
    console.log('[AlertGenerator] Already running');
    return;
  }

  console.log('[AlertGenerator] Started - generating alerts every 30 seconds');

  intervalId = setInterval(() => {
    const generateAlert = useAlertStore.getState().generateSimulatedAlert;
    generateAlert().catch((error) => {
      console.error('[AlertGenerator] Failed to generate alert:', error);
    });
  }, ALERT_GENERATION_INTERVAL);
}

export function stopAlertGenerator(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('[AlertGenerator] Stopped');
  }
}

export function isAlertGeneratorRunning(): boolean {
  return intervalId !== null;
}
