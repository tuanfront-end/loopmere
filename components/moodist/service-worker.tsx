"use client";

import { useEffect } from "react";
import { toast } from "sonner";

/**
 * Registers the worker and, when a new one is waiting, offers the reload
 * rather than taking it. A page that reloads itself under someone who is
 * halfway through writing a note has lost them the note.
 */
export function ServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let cancelled = false;

    const offerUpdate = (worker: ServiceWorker) =>
      toast("A newer version is ready.", {
        action: {
          label: "Reload",
          onClick: () => {
            navigator.serviceWorker.addEventListener(
              "controllerchange",
              () => window.location.reload(),
              { once: true },
            );
            worker.postMessage({ type: "SKIP_WAITING" });
          },
        },
        duration: Infinity,
      });

    // The listener outlives the effect unless the cleanup takes it off: a
    // remount after `register` resolved — Fast Refresh does it — added a second
    // one, and every update was announced twice.
    let stop = () => {};

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        if (cancelled) return;

        // Already waiting when this tab opened.
        if (registration.waiting && navigator.serviceWorker.controller) {
          offerUpdate(registration.waiting);
        }

        const onUpdateFound = () => {
          const installing = registration.installing;

          if (!installing) return;

          installing.addEventListener("statechange", () => {
            // A worker that installs with no controller is the first one;
            // there is nothing to update from, so nothing to announce.
            if (
              installing.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              offerUpdate(installing);
            }
          });
        };

        registration.addEventListener("updatefound", onUpdateFound);
        stop = () =>
          registration.removeEventListener("updatefound", onUpdateFound);
      })
      .catch(() => {
        // No worker means no offline mode; the app is unaffected.
      });

    return () => {
      cancelled = true;
      stop();
    };
  }, []);

  return null;
}
