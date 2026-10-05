const VIDEO_ID = /^[\w-]{11}$/;

const HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'www.youtube-nocookie.com',
  'youtube-nocookie.com',
]);

/** The path segment the id follows, as in `/live/<id>` or `/shorts/<id>`. */
const ID_PATHS = new Set(['embed', 'live', 'shorts', 'v']);

export type ParsedLink =
  | { id: string }
  | { error: 'not-youtube' | 'playlist' };

/**
 * The video id in whatever a listener pastes: a watch link, a share link from
 * youtu.be, a live or Shorts link, an embed, or the bare id. A link with no
 * protocol is read as https, since that is how the address bar copies it on
 * some phones.
 */
export function parseYouTubeLink(input: string): ParsedLink {
  const text = input.trim();

  if (VIDEO_ID.test(text)) return { id: text };

  let url: URL;

  try {
    url = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`);
  } catch {
    return { error: 'not-youtube' };
  }

  const host = url.hostname.toLowerCase();
  const [first, second] = url.pathname.split('/').filter(Boolean);
  let id: string | null = null;

  if (host === 'youtu.be') id = first ?? null;
  else if (HOSTS.has(host)) {
    if (first === 'watch') id = url.searchParams.get('v');
    else if (first && ID_PATHS.has(first)) id = second ?? null;
  } else return { error: 'not-youtube' };

  if (id && VIDEO_ID.test(id)) return { id };

  // A playlist plays as a run of videos, and the station list holds one
  // player per entry; until it can hold a list, say so rather than guess.
  if (url.searchParams.has('list')) return { error: 'playlist' };

  return { error: 'not-youtube' };
}

export type VideoDetails = { channel: string; title: string };

export type LookupResult =
  | { details: VideoDetails; ok: true }
  | { ok: false; reason: 'no-embed' | 'not-found' | 'offline' };

/**
 * The title and channel of a video, from YouTube's oEmbed endpoint, which
 * answers cross-origin and needs no key. Its status also says whether the
 * video exists and whether its owner lets it play on other sites. It cannot
 * tell an ended live stream from a running one: both answer 200.
 */
export async function lookUpVideo(id: string): Promise<LookupResult> {
  const watch = `https://www.youtube.com/watch?v=${id}`;

  let response: Response;

  try {
    response = await fetch(
      `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(watch)}`,
    );
  } catch {
    return { ok: false, reason: 'offline' };
  }

  if (response.status === 401 || response.status === 403)
    return { ok: false, reason: 'no-embed' };
  if (!response.ok) return { ok: false, reason: 'not-found' };

  try {
    const data = (await response.json()) as {
      author_name?: string;
      title?: string;
    };

    return {
      details: {
        channel: data.author_name ?? 'YouTube',
        title: data.title ?? 'Untitled video',
      },
      ok: true,
    };
  } catch {
    return { ok: false, reason: 'not-found' };
  }
}
