// The sound icons, which git never sees. thiings.co's free licence covers
// personal use and forbids making the files "available for download as
// standalone assets", which a public repository is. So they live in a private
// Vercel Blob store, and a build fetches them into `public/thiings/`:
//
//   npm run thiings:push   once, from a machine that has the files
//   npm run thiings:pull   runs first in `npm run build`
//
// On Vercel a build authenticates on its own once the store is connected to
// the project (OIDC plus `BLOB_STORE_ID`). Anywhere else it reads
// `BLOB_READ_WRITE_TOKEN` from `.env.local`.
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";

import { get, put } from "@vercel/blob";

const DIR = "public/thiings";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

/** Every file the app asks for, read off the map it asks with. */
const names = [
  ...(await readFile("data/sound-thiings.ts", "utf8")).matchAll(
    /"\/thiings\/([\w-]+\.png)"/g,
  ),
].map(([, name]) => name);

const connected = Boolean(
  process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN,
);

/** `task` over `items`, `limit` at a time: Hobby allows 15 writes a second. */
async function each(items, limit, task) {
  const queue = [...items];

  await Promise.all(
    Array.from({ length: limit }, async () => {
      while (queue.length) await task(queue.shift());
    }),
  );
}

/** `get()` is a bare fetch, so a rate-limited read would fail the build. */
async function read(pathname, tries = 3) {
  try {
    return await get(pathname, { access: "private" });
  } catch (error) {
    if (tries === 1) throw error;

    await new Promise((resolve) => setTimeout(resolve, 1000));

    return read(pathname, tries - 1);
  }
}

async function push() {
  const absent = names.filter((name) => !existsSync(`${DIR}/${name}`));

  if (absent.length) {
    throw new Error(`${DIR}/ is missing ${absent.join(", ")}.`);
  }

  if (!connected) {
    throw new Error(
      "No store to push to. Copy BLOB_READ_WRITE_TOKEN from the store's page into .env.local.",
    );
  }

  await each(names, 4, async (name) =>
    put(`thiings/${name}`, await readFile(`${DIR}/${name}`), {
      access: "private",
      allowOverwrite: true,
      contentType: "image/png",
    }),
  );

  console.log(`thiings: pushed ${names.length} icons.`);
}

async function pull() {
  const missing = names.filter((name) => !existsSync(`${DIR}/${name}`));

  if (!missing.length) {
    console.log(`thiings: all ${names.length} icons are in ${DIR}/.`);

    return;
  }

  // A fork, or a clone with no token: the app runs without them, each icon an
  // empty box. Failing here would make the icons a condition of building.
  if (!connected) {
    console.warn(
      `thiings: ${missing.length} of ${names.length} icons missing and no Blob store connected, so none are fetched. README § Sound icons.`,
    );

    return;
  }

  await mkdir(DIR, { recursive: true });

  const unstored = [];

  await each(missing, 6, async (name) => {
    const result = await read(`thiings/${name}`);

    if (!result) {
      unstored.push(name);

      return;
    }

    await writeFile(
      `${DIR}/${name}`,
      Buffer.from(await new Response(result.stream).arrayBuffer()),
    );
  });

  // With a store connected, a hole is a store that is behind the map. Failing
  // keeps the last good deployment live instead of shipping empty boxes.
  if (unstored.length) {
    throw new Error(
      `Not in the store: ${unstored.join(", ")}. Run npm run thiings:push.`,
    );
  }

  console.log(`thiings: fetched ${missing.length} icons.`);
}

const commands = { pull, push };
const command = commands[process.argv[2]];

if (!command) {
  console.error("Usage: node scripts/thiings.mjs <pull|push>");
  process.exit(1);
}

try {
  await command();
} catch (error) {
  console.error(`thiings: ${error.message}`);
  process.exit(1);
}
