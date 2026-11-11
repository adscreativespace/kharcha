/* Kharcha service worker: offline app shell + background due-date alerts */
const VERSION = "kharcha-v18";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/badge-96.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION && k !== "kharcha-data" && k !== "kharcha-fonts").map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  if (url.host === "fonts.googleapis.com" || url.host === "fonts.gstatic.com") {
    e.respondWith(caches.open("kharcha-fonts").then(async c => {
      const hit = await c.match(e.request);
      const net = fetch(e.request).then(r => { if (r.ok || r.type === "opaque") c.put(e.request, r.clone()); return r; }).catch(() => hit);
      return hit || net;
    }));
    return;
  }
  if (url.origin !== location.origin) return;
  // network first for the page so updates arrive; cache fallback offline
  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request, { cache: "no-store" }).then(r => { caches.open(VERSION).then(c => c.put("./index.html", r.clone())); return r; })
      .catch(() => caches.match("./index.html")));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request)));
});

async function checkDue() {
  const c = await caches.open("kharcha-data");
  const res = await c.match("./due.json"); if (!res) return;
  const list = await res.json();
  const seenRes = await c.match("./notified.json");
  const seen = seenRes ? await seenRes.json() : {};
  const today = new Date(); today.setHours(0, 0, 0, 0);
  for (const x of list) {
    const [y, m, d] = x.date.split("-").map(Number);
    const days = Math.round((new Date(y, m - 1, d) - today) / 864e5);
    if (days > 1 || seen[x.key]) continue;
    seen[x.key] = Date.now();
    const when = days < 0 ? "overdue" : days === 0 ? "due today" : "due tomorrow";
    await self.registration.showNotification(x.title + " " + when, { body: x.body, tag: x.key, icon: "icons/icon-192.png", badge: "icons/badge-96.png" });
  }
  await c.put("./notified.json", new Response(JSON.stringify(seen), { headers: { "content-type": "application/json" } }));
}
self.addEventListener("periodicsync", e => { if (e.tag === "kharcha-due") e.waitUntil(checkDue()); });
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: "window" }).then(ws => ws.length ? ws[0].focus() : self.clients.openWindow("./")));
});
