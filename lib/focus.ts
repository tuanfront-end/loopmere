import { flushSync } from 'react-dom';

/**
 * For a control that takes its own row off the page — the X on a mix row, the
 * heart on a card in Favourites. The node focus was on goes with the row,
 * focus falls to `<body>`, and a keyboard reader is sent back to the top of
 * the page for pressing one button. Instead it lands on the same control in
 * the row that closes the gap, else in the row before, else on `fallback` once
 * no row is left.
 *
 * `peers` is that control on every row, the pressed one among them, read
 * before anything moves. The removal is flushed rather than left to the next
 * render because the neighbour may only be on the page after it: the
 * thirteenth favourite is `display: none` behind Show more until one ahead of
 * it leaves.
 */
export function removeKeepingFocus(
  control: HTMLElement,
  peers: ArrayLike<HTMLElement>,
  remove: () => void,
  fallback: () => HTMLElement | null,
) {
  const rows = Array.from(peers);
  const index = rows.indexOf(control);
  const next = rows[index + 1] ?? rows[index - 1];

  flushSync(remove);

  (next ?? fallback())?.focus();
}
