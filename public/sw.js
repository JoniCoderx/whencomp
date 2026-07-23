// When Comp — offline-first service worker (no external deps).
// IMPORTANT: never cache Next.js build assets (/_next/*) or RSC payloads.
// They are content-hashed and deleted on every deploy, so caching them
// cache-first makes old clients load dead chunks after a new build and throw a
// client-side exception. The cache version is bumped on each such change so the
// activate handler purges any stale caches from older service workers.
const CACHE = "whencomp-v3";
// Keep the precache tiny and stable — only assets that never change per build.
const SHELL = ["/manifest.json", "/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // Only handle same-origin GETs.
  if (url.origin !== self.location.origin) return;

  // ALWAYS go to network (never cache) for API, Next build assets and RSC
  // payloads. This is the key fix — prevents serving stale chunks after a deploy.
  const isRsc = url.searchParams.has("_rsc") || request.headers.get("RSC") === "1";
  if (url.pathname.startsWith("/api") || url.pathname.startsWith("/_next/") || isRsc) {
    return; // passthrough to the network
  }

  // Page navigations: network-first, no caching of the HTML document (so we can
  // never serve an HTML shell that points at chunks from an old build).
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match(request).then((r) => r || caches.match("/")))
    );
    return;
  }

  // Other same-origin static files (icons, sounds, images): cache-first, and
  // refresh the copy in the background.
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request)
          .then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
            return res;
          })
          .catch(() => cached)
    )
  );
});
