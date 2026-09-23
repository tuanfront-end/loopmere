/**
 * Cache-first for the audio, network-first for everything else.
 *
 * The loops are the whole point of installing this, and they never change once
 * fetched — a 3MB mp3 that is already on disk should never be asked for again.
 * The shell is the opposite: it changes on every deploy, so the network wins
 * and the cache is only there for a tab opened offline.
 */
const SHELL = "moodist-shell-v1";
const AUDIO = "moodist-audio-v1";

self.addEventListener("install", () => {
  // Wait rather than take over: the page decides when to swap, because a
  // worker that activates under a half-written note has cost somebody the note.
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== SHELL && key !== AUDIO)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/sounds/")) {
    event.respondWith(
      caches.open(AUDIO).then(async (cache) => {
        const hit = await cache.match(request);

        if (hit) return hit;

        const response = await fetch(request);

        // Range requests come back 206 and cannot be cached whole.
        if (response.ok && response.status === 200) {
          cache.put(request, response.clone());
        }

        return response;
      }),
    );

    return;
  }

  event.respondWith(
    (async () => {
      try {
        const response = await fetch(request);
        const cache = await caches.open(SHELL);

        if (response.ok) cache.put(request, response.clone());

        return response;
      } catch {
        const hit = await caches.match(request);

        if (hit) return hit;

        // An offline navigation falls back to the page itself.
        if (request.mode === "navigate") {
          const shell = await caches.match("/");

          if (shell) return shell;
        }

        throw new Error("offline and not cached");
      }
    })(),
  );
});
