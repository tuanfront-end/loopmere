/**
 * The Horizon mark: a ring, and a level rising in it to one period of a wave.
 * It reads three ways at once — a level, a sound wave, a hill under a sky —
 * which is the product in one glyph: loops you stack and set the level of,
 * most of them weather, water and grass.
 *
 * The port's own, and the name is drawn in it: Loopmere is a loop — the ring —
 * and a mere, the still water rising in it. It replaced the original's
 * rosette, which is the original project's mark; the favicon, the app icons
 * and the media artwork are rendered from these same two paths in
 * `app/icon.svg` by `npm run icons`.
 *
 * The level's ends and its lower arc run through the middle of the ring's
 * stroke rather than along its inner edge, so the two shapes overlap: butted,
 * they left a hairline of antialiasing where they met.
 *
 * Inline rather than an `<img>`, so it takes `currentColor` and follows its
 * parent's ink the way an icon does.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        clipRule="evenodd"
        d="M1 12A11 11 0 1 0 23 12A11 11 0 1 0 1 12ZM3 12A9 9 0 1 0 21 12A9 9 0 1 0 3 12Z"
        fillRule="evenodd"
      />
      <path d="M2.018 12.6C5.345 10.2 8.673 10.2 12 12.6C15.327 15 18.655 15 21.982 12.6A10 10 0 0 1 2.018 12.6Z" />
    </svg>
  );
}
