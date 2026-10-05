"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

import "./globals.css";

/**
 * The last boundary, for a throw in the layout itself — the rails, the
 * toolbar, the dock — which `error.tsx` sits under and cannot catch. It
 * replaces the whole document, so it brings its own `html`, `body` and
 * stylesheet. The theme script does not run here: a page drawn after a crash
 * is drawn in the light scheme.
 */
export default function GlobalError({
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
    <html lang="en">
      <body className="flex min-h-dvh items-center justify-center p-6">
        <title>Something broke — Loopmere</title>
        <main className="bg-accent w-full max-w-xl rounded-lg px-6 py-10 sm:py-12">
          <h1 className="text-3xl tracking-tight text-balance">
            Something on this page broke.
          </h1>
          <p className="text-muted-foreground mt-3 text-balance">
            Your mix, presets and notes are kept in this browser, so trying
            again loses none of them.
          </p>
          <Button className="mt-6" onClick={() => retry()}>
            Try again
          </Button>
        </main>
      </body>
    </html>
  );
}
