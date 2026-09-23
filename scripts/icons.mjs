// Renders every raster icon from `app/icon.svg`, so the mark changes in one
// file: edit that, then `npm run icons`. `sharp` arrives with `next`, which
// uses it for image optimisation.
import { readFile, writeFile } from "node:fs/promises";

import sharp from "sharp";

const tile = await readFile("app/icon.svg", "utf8");

// iOS rounds the corners of a home-screen icon itself, so the apple icon is
// the tile with its own corners squared off; a rounded one would show the
// page through them.
const square = tile.replace(/ rx="[^"]*"/, "");

/** The SVG's 32-unit box drawn at `size` pixels, not drawn small and scaled. */
const png = (svg, size) =>
  sharp(Buffer.from(svg), { density: (72 * size) / 32 })
    .resize(size, size)
    .png()
    .toBuffer();

/**
 * A favicon.ico holding PNGs rather than bitmaps, which every browser that
 * still asks for one reads: a six-byte header, a sixteen-byte entry per size,
 * then the images back to back.
 */
function ico(images) {
  const head = Buffer.alloc(6 + 16 * images.length);

  head.writeUInt16LE(1, 2);
  head.writeUInt16LE(images.length, 4);

  let offset = head.length;

  images.forEach(({ data, size }, index) => {
    const entry = 6 + 16 * index;

    head.writeUInt8(size, entry);
    head.writeUInt8(size, entry + 1);
    head.writeUInt16LE(1, entry + 4);
    head.writeUInt16LE(32, entry + 6);
    head.writeUInt32LE(data.length, entry + 8);
    head.writeUInt32LE(offset, entry + 12);

    offset += data.length;
  });

  return Buffer.concat([head, ...images.map(({ data }) => data)]);
}

for (const size of [72, 128, 144, 152, 192, 256, 512]) {
  await writeFile(`public/assets/pwa/${size}.png`, await png(tile, size));
}

await writeFile("app/apple-icon.png", await png(square, 180));

const favicon = await Promise.all(
  [16, 32, 48].map(async (size) => ({ data: await png(tile, size), size })),
);

await writeFile("app/favicon.ico", ico(favicon));
