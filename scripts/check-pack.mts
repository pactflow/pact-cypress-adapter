#!/usr/bin/env node
/**
 * Verify the npm tarball contains the build output.
 *
 *   node scripts/check-pack.mts
 *
 * Run after `npm run build`. Fails when `main`, `types`, or any `.js` or
 * `.d.ts` file under dist/ is missing from `npm pack --dry-run`. Users load
 * `dist/plugin` by path, so every emitted module counts.
 */
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, normalize } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const RE_PUBLISHED = /\.(js|d\.ts)$/;

const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
  main: string;
  types: string;
};
const built = readdirSync(join(ROOT, "dist"), { recursive: true })
  .map(String)
  .filter((path) => RE_PUBLISHED.test(path))
  .map((path) => join("dist", path));
const expected = new Set([pkg.main, pkg.types, ...built].map(normalize));

const [pack] = JSON.parse(
  execFileSync("npm", ["pack", "--dry-run", "--json"], {
    cwd: ROOT,
    encoding: "utf8",
  }),
) as [{ files: { path: string }[] }];
const packed = new Set(pack.files.map((file) => normalize(file.path)));

const missing = [...expected].filter((path) => !packed.has(path));
if (missing.length > 0) {
  console.error(`Missing from the npm tarball:\n  ${missing.join("\n  ")}`);
  process.exit(1);
}
console.log(`npm tarball contains all ${expected.size} build outputs.`);
