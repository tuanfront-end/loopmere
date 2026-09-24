// The house-style gates behind `npm run check`. They are Python scripts in the
// Soft Neutral skill, which lives in a repository of its own and is linked
// into each machine rather than committed here: a committed link records an
// absolute path, and on every other machine `python3` could not open the first
// gate.
//
//   node scripts/gates.mjs          the gates that are green today; stops at
//                                   the first red one
//   node scripts/gates.mjs --more   the five `check:all` adds; runs them all
//
// The skill is looked for where Claude Code looks for it — the project's
// `.claude/skills/`, then `~/.claude/skills/`. Found in neither, the gates are
// skipped and the run says so: on a clone without the skill, `npm run check`
// is the build and nothing more. A link that is there but leads nowhere is
// red: that is a machine meant to run the gates, and it cannot.
import { spawnSync } from "node:child_process";
import { existsSync, lstatSync, readlinkSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const GATES = [
  ["_dials.py"],
  ["_repo.py", "--selftest"],
  ["palette-check.py", "--selftest"],
  ["type-check.py", "--selftest"],
  ["responsive-check.py", "--selftest"],
  ["page-check.py", "--selftest"],
  ["ref-ledger.py", "--selftest"],
  ["seo-check.py", "--selftest"],
  ["controls-check.py", "--selftest"],
  ["hover-check.py", "--selftest"],
  ["mark-visibility.py", "--selftest"],
  ["find-near-duplicates.py", "--selftest"],
  ["type-check.py", "--errors", "app", "components"],
  ["palette-check.py"],
  ["responsive-check.py"],
  ["controls-check.py"],
  ["hover-check.py"],
  ["vn-comment-check.py"],
];

// What `check:all` adds. Some are red on purpose; CONTEXT.md § Gate reads each.
const MORE = [
  ["image-check.py"],
  ["page-check.py"],
  ["ref-ledger.py", "--all"],
  ["mark-visibility.py"],
  ["seo-check.py"],
];

const PLACES = [
  {
    dir: join(".claude", "skills", "soft-neutral"),
    shown: ".claude/skills/soft-neutral",
  },
  {
    dir: join(homedir(), ".claude", "skills", "soft-neutral"),
    shown: "~/.claude/skills/soft-neutral",
  },
];

/** The first place the skill is installed, or `null` when it is in none. */
function findSkill() {
  for (const { dir, shown } of PLACES) {
    if (!lstatSync(dir, { throwIfNoEntry: false })) continue;

    if (!existsSync(dir)) {
      throw new Error(
        `${shown} links to ${readlinkSync(dir)}, which is not there. Relink it: CONTEXT.md § Gate.`,
      );
    }

    return dir;
  }

  return null;
}

/** One gate with its output passed straight through; its exit status. */
function run(skill, [script, ...args]) {
  const { status, error } = spawnSync(
    "python3",
    [join(skill, "scripts", script), ...args],
    { stdio: "inherit" },
  );

  if (error) {
    throw new Error(`python3 could not run ${script}: ${error.message}`);
  }

  return status ?? 1;
}

const more = process.argv.includes("--more");
const gates = more ? MORE : GATES;

try {
  const skill = findSkill();

  if (!skill) {
    const which = more ? `the ${gates.length} extra` : `all ${gates.length}`;

    console.log(
      [
        `gates: the Soft Neutral skill is not installed, so ${which} checks were skipped.`,
        `  Looked in ${PLACES.map(({ shown }) => shown).join(" and ")}.`,
        "  A green run here says nothing about the house style. README § Run it.",
      ].join("\n"),
    );

    process.exit(0);
  }

  if (more) {
    // Every one runs whatever the one before it said, and the status is the
    // last one's — what the `;` chain this replaced in package.json did.
    let status = 0;

    for (const gate of gates) status = run(skill, gate);

    process.exit(status);
  }

  for (const gate of gates) {
    const status = run(skill, gate);

    if (status) process.exit(status);
  }
} catch (error) {
  console.error(`gates: ${error.message}`);
  process.exit(1);
}
