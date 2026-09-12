export function registerPwa(): void {
  if (!("serviceWorker" in navigator)) return;
  const swUrl = `${import.meta.env.BASE_URL}sw.js`;
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register(swUrl);
  });
}
