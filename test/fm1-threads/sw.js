// One worker per GitHub Pages project path. Keep the app shell available offline.
const SCOPE = self.registration.scope;
const CACHE = "pocket-pwa-" + new URL(SCOPE).pathname.replace(/\W/g, "-") + "v1";
const ASSETS = ["./", "index.html", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png"];
const OPTIONAL = ["vendor/fm1_web_mt.wasm"]; // the threaded core: cached when it exists, the page copes without it
// GitHub Pages cannot send headers, so the page gets them here: with them it is cross-origin isolated and may use
// SharedArrayBuffer (core 1 on its own thread). credentialless keeps the firmware hub's pictures loading;
// a browser that does not know it (Safari) just stays unisolated and runs one thread.
const isolate = (r) => {
  if (!r || r.status === 0 || r.type === "opaqueredirect") return r;
  const h = new Headers(r.headers);
  h.set("Cross-Origin-Opener-Policy", "same-origin");
  h.set("Cross-Origin-Embedder-Policy", "credentialless");
  return new Response(r.body, { status: r.status, statusText: r.statusText, headers: h });
};
const PATHS = new Set(ASSETS.map((name) => new URL(name, SCOPE).pathname));
const OPT_PATHS = new Set(OPTIONAL.map((name) => new URL(name, SCOPE).pathname));

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => Promise.all([cache.addAll(ASSETS.map((name) => new URL(name, SCOPE))), ...OPTIONAL.map((name) => cache.add(new URL(name, SCOPE)).catch(() => {}))])).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith("pocket-pwa-") && key !== CACHE && key.includes(new URL(SCOPE).pathname.replace(/\W/g, "-"))).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin || !PATHS.has(url.pathname) && !OPT_PATHS.has(url.pathname)) return;
  const doc = event.request.mode === "navigate";
  // Network first: new deployments appear without waiting for a service-worker version bump.
  event.respondWith(fetch(event.request).then((response) => {
    if (response.ok) {
      const copy = response.clone();
      event.waitUntil(caches.open(CACHE).then((cache) => cache.put(event.request, copy)));
    }
    return doc ? isolate(response) : response;
  }).catch(async () => {
    const hit = (await caches.match(event.request, { ignoreSearch: true })) || (doc ? await caches.match(new URL("./", SCOPE)) : undefined);
    return hit ? (doc ? isolate(hit) : hit) : Response.error();
  }));
});
