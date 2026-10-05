"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

/**
 * What the centre column shows when something in it throws while rendering.
 * There was no boundary at all, so one bad value — a hand-edited share link
 * was enough — swapped the whole app for Next's bare "This page couldn't
 * load". Here the rails, the toolbar and the dock stay up around it, since
 * they belong to the layout and this boundary sits under it.
 *
 * `main` again, with the skip link's target, because the page that held both
 * is the thing that is gone.
 */
export default function ErrorBoundary({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main
      className="mx-auto flex w-full max-w-[1200px] grow flex-col px-6 py-24 sm:px-8"
      id="content"
    >
      <div className="bg-accent rounded-lg px-6 py-10 sm:py-12">
        <h1 className="text-3xl tracking-tight text-balance">
          Something on this page broke.
        </h1>
        <p className="text-muted-foreground mt-3 max-w-[52ch] text-balance">
          Your mix, presets and notes are kept in this browser, so trying again
          loses none of them.
        </p>
        <Button className="mt-6" onClick={() => retry()}>
          Try again
        </Button>
      </div>
    </main>
  );
}
