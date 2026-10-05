/**
 * Cache-first for the audio and the build's hashed files, network-first for
 * the page and everything else.
 *
 * The loops are the whole point of installing this, and they never change once
 * fetched — a 3MB mp3 that is already on disk should never be asked for again.
 * The page is the opposite: it changes on every deploy, so the network wins
 * and the cache is only there for a tab opened offline.
 *
 * The page is kept under its path alone, once. Every same-origin GET used to
 * land in one cache that nothing ever emptied — each deploy's chunks on top
 * of the last, every image variant, and a copy of the page per shared link,
 * since the mix rides in the query.
 */
const SHELL = "moodist-shell-v2";
const ASSETS = "moodist-assets-v1";
const AUDIO = "moodist-audio-v1";

/**
 * Enough for one deploy's chunks, fonts and sound icons with room to spare;
 * past it the oldest go first, which are the ones earlier deploys left.
 */
const ASSET_LIMIT = 300;

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
            .filter((key) => key !== SHELL && key !== ASSETS && key !== AUDIO)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

/** The oldest entries out until the cache is back under its limit. */
async function trim(cache) {
  const keys = await cache.keys();
  const over = keys.length - ASSET_LIMIT;

  if (over > 0) {
    await Promise.all(keys.slice(0, over).map((key) => cache.delete(key)));
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  // Vercel's analytics and speed scripts: nothing offline needs them.
  if (url.pathname.startsWith("/_vercel/")) return;

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

  // Named for their contents, so a file under one of these names never
  // changes and the network has nothing newer to say.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.open(ASSETS).then(async (cache) => {
        const hit = await cache.match(request);

        if (hit) return hit;

        const response = await fetch(request);

        if (response.ok) {
          event.waitUntil(
            cache.put(request, response.clone()).then(() => trim(cache)),
          );
        }

        return response;
      }),
    );

    return;
  }

  // The page, under its path: `/?share=…` is the same page as `/`.
  const navigation = request.mode === "navigate";
  const key = navigation ? url.origin + url.pathname : request;
  const store = navigation ? SHELL : ASSETS;

  event.respondWith(
    (async () => {
      try {
        const response = await fetch(request);

        if (response.ok) {
          const cache = await caches.open(store);

          event.waitUntil(
            cache
              .put(key, response.clone())
              .then(() => (navigation ? undefined : trim(cache))),
          );
        }

        return response;
      } catch {
        const hit = await caches.match(key);

        if (hit) return hit;

        // An offline navigation falls back to the page itself.
        if (navigation) {
          const shell = await caches.match(url.origin + "/");

          if (shell) return shell;
        }

        throw new Error("offline and not cached");
      }
    })(),
  );
});
