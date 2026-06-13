/* =========================================================================
 * BOURRAGE DE CRÂNE : MODE RÉVOLUTION — sw.js (Service Worker)
 * Met en cache tous les fichiers du jeu pour un fonctionnement hors-ligne
 * et une installation en application (PWA). Stratégie : cache d'abord,
 * réseau en repli, et mise à jour du cache en arrière-plan.
 * ========================================================================= */
"use strict";

const CACHE = "bdc-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./characters.js",
  "./levels.js",
  "./leaderboard.js",
  "./progress.js",
  "./music.js",
  "./game.js",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(e.request).then(resp => {
        if (resp && resp.status === 200 && resp.type === "basic") {
          const copy = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return resp;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
