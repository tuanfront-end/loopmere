"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";

import { SHARE_PARAM } from "@/constants/share";

/**
 * A shared link carries a whole mix in its query — every sound and its level —
 * and the footer promises that whatever a listener builds is sent nowhere. So
 * that parameter comes off before a page view leaves. Anything else on the URL,
 * a campaign tag included, goes through as it arrived.
 *
 * Declared once, outside the component, because Analytics re-registers the
 * hook whenever the function it is handed changes identity.
 */
function withoutSharedMix(event: BeforeSendEvent): BeforeSendEvent {
  const url = new URL(event.url);

  url.searchParams.delete(SHARE_PARAM);

  return { ...event, url: url.toString() };
}

/**
 * Anonymous page views for Vercel Web Analytics. A client component of its own
 * because `beforeSend` is a function, and the root layout is a server component
 * that cannot hand one across.
 */
export function WebAnalytics() {
  return <Analytics beforeSend={withoutSharedMix} />;
}
