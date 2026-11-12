/* Motiveva service worker: local reminders only. No push, no caching. */
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      const appWindow = windows.find((client) => {
        try {
          return new URL(client.url).pathname.startsWith("/app");
        } catch {
          return false;
        }
      });

      if (appWindow) return appWindow.focus();

      if (windows.length > 0) {
        await windows[0].navigate("/app");
        return windows[0].focus();
      }

      return self.clients.openWindow("/app");
    })(),
  );
});
