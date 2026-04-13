import { Injectable } from '@angular/core';

const TIMEOUT_MS = 5 * 60 * 1000;
const STORAGE_KEY = 'ionora_last_active';

@Injectable({ providedIn: 'root' })
export class ActivityService {
  private intervalId: any = null;
  private started = false;

  start(): void {
    if (this.started) return;
    this.started = true;
    this.touch();

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach(e => document.addEventListener(e, () => this.touch(), { passive: true }));

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') this.checkIdle();
    });

    this.intervalId = setInterval(() => this.checkIdle(), 15000);
  }

  stop(): void {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = null;
    this.started = false;
    localStorage.removeItem(STORAGE_KEY);
  }

  private touch(): void {
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  }

  private checkIdle(): void {
    const last = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
    if (!last) return;
    if (Date.now() - last >= TIMEOUT_MS) {
      this.stop();
      localStorage.clear();
      window.location.href = '/login';
    }
  }
}
