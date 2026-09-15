import { registerSW } from "virtual:pwa-register";

export function registerPwa(): void {
  if (!("serviceWorker" in navigator)) return;
  if (!import.meta.env.PROD) return;
  registerSW({ immediate: true });
}
