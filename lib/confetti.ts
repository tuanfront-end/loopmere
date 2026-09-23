import type JSConfetti from 'js-confetti';

import { prefersReducedMotion } from '@/lib/motion';

/**
 * One instance for the page, made on the first burst. Each `new JSConfetti()`
 * appends a full-screen canvas to `<body>` and nothing ever removes it, so a
 * fresh one per call left another canvas behind every time the checklist was
 * finished. Made lazily because there is no `document` on the server.
 */
let confetti: JSConfetti | null = null;

export const addConfetti = () => {
  // A full-screen burst is exactly what a request for less motion is about.
  if (prefersReducedMotion()) return;

  // Fetched on the first burst: the checklist being finished is not something
  // the first paint needs to be ready for.
  void import('js-confetti').then(({ default: Confetti }) => {
    confetti ??= new Confetti();

    confetti.addConfetti({
      confettiColors: [
        '#6366f1',
        '#8b5cf6',
        '#a855f7',
        '#ec4899',
        '#f43f5e',
        '#fb923c',
        '#eab308',
        '#22c55e',
      ],
    });
  });
};
