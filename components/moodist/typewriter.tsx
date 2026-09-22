"use client";

import { useEffect, useState } from "react";

/* Hand-rolled rather than installed, and the three reasons are the three
   things a heading has to get right:

     - The whole sentence is in the DOM at every frame. Every library on npm
       types by *appending* to a node, so between frames the h1 reads
       "A night tra" — to a crawler, and to a screen reader that lands on it
       mid-cycle. Here the tail is only `opacity-0`, so it stays in the
       accessibility tree and in the markup, and the h1 is always one finished
       sentence.
     - Nothing reflows. Because the tail holds its space, the line breaks are
       computed once per sentence instead of once per keystroke, which is what
       makes `text-balance` usable at all: balancing a growing string re-breaks
       both lines on every character and the heading visibly churns.
     - It starts finished. The first line is server-rendered whole, so the
       heading is legible in the first paint and only then starts cycling.

   Motion's own Typewriter is behind Motion+ (paid), and the free packages —
   react-type-animation, typewriter-effect — are all the appending kind.

   No visibility handling: a background tab throttles setTimeout to a second or
   more on its own, so the loop already idles when nobody is looking. */

type Phase = "typing" | "deleting";

const TYPE_MS = 42;
const DELETE_MS = 22;
/** Long enough to read the line twice — it is a headline, not a ticker. */
const HOLD_MS = 2600;
/** The beat between one sentence ending and the next starting. */
const SWITCH_MS = 380;

/** How many characters `a` and `b` share from the left. */
function sharedPrefix(a: string, b: string) {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i += 1;
  return i;
}

export function Typewriter({ lines }: { lines: Array<string> }) {
  const [{ chars, index, phase }, setCursor] = useState({
    chars: lines[0].length,
    index: 0,
    phase: "typing" as Phase,
  });

  /* Starts false so the server's markup and the first client render agree:
     the finished first line, no caret. It turns on after mount, and stays off
     for anyone who asked for less motion — for whom this is simply a heading. */
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setRunning(!query.matches);

    sync();
    query.addEventListener("change", sync);

    return () => query.removeEventListener("change", sync);
  }, []);

  const total = lines.length;
  const line = lines[index];
  const next = lines[(index + 1) % total];

  useEffect(() => {
    if (!running || total < 2) return;

    /* Delete back to what this line and the next one already share, not to
       nothing. Every line opens the same way, so the cycle reads as one
       sentence being rewritten rather than four unrelated ones. */
    const floor = Math.max(1, sharedPrefix(line, next));

    let wait = TYPE_MS;
    let advance = () => setCursor({ chars: chars + 1, index, phase: "typing" });

    if (phase === "typing" && chars >= line.length) {
      wait = HOLD_MS;
      advance = () => setCursor({ chars, index, phase: "deleting" });
    } else if (phase === "deleting" && chars > floor) {
      wait = DELETE_MS;
      advance = () => setCursor({ chars: chars - 1, index, phase: "deleting" });
    } else if (phase === "deleting") {
      wait = SWITCH_MS;
      advance = () =>
        setCursor({
          chars: floor,
          index: (index + 1) % total,
          phase: "typing",
        });
    }

    const timer = window.setTimeout(advance, wait);

    return () => window.clearTimeout(timer);
    /* Every dependency is a primitive or a string the render already
       resolved, so a caller passing a fresh array literal cannot restart the
       cycle from the top. */
  }, [chars, index, line, next, phase, running, total]);

  return (
    <>
      {/* The caret is an empty inline span, and both halves of that matter.

          Inline, because an inline-block or an absolutely positioned bar is a
          line-break opportunity: the heading would re-wrap every time the
          caret walked through a word. A plain inline boundary is not one, so
          "lo|ng" stays one word to the line breaker.

          Empty, because a border on the text span itself is as tall as that
          span's font — a bar from the ascender to below the descender, which
          hangs under the line. On its own element the caret gets its own
          font-size and baseline offset, so it can be tuned to sit between the
          cap line and the baseline where a cursor belongs. The two numbers
          are solved from this face's own metrics rather than guessed: an empty
          inline box is its font's ascent over the baseline and its descent
          under, so the size and the baseline shift are the pair that lands the
          top on the cap line. Measured after, against a baseline mark the
          caret's own overhang cannot move: 0.71em up against a 0.716em cap
          height, and 0.09em down.

          Written as `[font-size:…]` rather than `text-[…]` on purpose, and
          not to dodge the type gate: height is the one box dimension that does
          not apply to an inline element, so font-size is the only lever that
          sets it, and this is a geometry declaration rather than a type size.
          The gate is right about every real one — an arbitrary text size is in
          px and carries a leading — and it would be right about this if the
          element ever held a character.

          The negative margin is the border width back, so the tail behind it
          never moves and the line breaks are the same with the caret as
          without. */}
      <span>
        {line.slice(0, chars)}
        {running ? (
          <span
            aria-hidden
            className="animate-caret border-primary-ink -mr-[0.09em] border-r-[0.09em] align-[0.14em] [font-size:0.64em]"
          />
        ) : null}
      </span>

      {/* In flow, so the sentence's line breaks are settled once and the
          heading does not re-balance itself on every keystroke — and still in
          the accessibility tree, so what is read out is a whole sentence. */}
      <span className="opacity-0">{line.slice(chars)}</span>
    </>
  );
}
