#!/usr/bin/env node
/**
 * Release management for @pactflow/pact-cypress-adapter.
 *
 *   node scripts/release.mts prepare [--dry-run]
 *   node scripts/release.mts check
 *   node scripts/release.mts tag     [--dry-run]
 *   node scripts/release.mts notes   <version>
 *
 * `prepare` asks git-cliff for the next version, writes it to package.json and
 * CHANGELOG.md, and force-pushes the release branch behind a draft PR. Once a
 * person pushes to that PR, `prepare` leaves it alone.
 *
 * `check` fails when the version in package.json is already tagged or has no
 * CHANGELOG.md section.
 *
 * `tag` tags HEAD with the version in package.json.
 *
 * `notes` prints the CHANGELOG.md section for a version.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import {
  changelogSection,
  hasForeignCommits,
  nextVersion,
  prBody,
  prTitle,
  setPackageVersion,
  stripV,
  tagName,
} from "./release-helpers.mts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PKG_PATH = join(ROOT, "package.json");
const CHANGELOG_PATH = join(ROOT, "CHANGELOG.md");
const RELEASE_BRANCH = "release/pact-cypress-adapter";
const PAUSED_MARKER = "<!-- release-pr:paused -->";

// MARK: Shell wrappers

function run(cmd: string, args: string[]): string {
  return execFileSync(cmd, args, { encoding: "utf8", cwd: ROOT });
}

function git(args: string[]): string {
  return run("git", args);
}

function gh(args: string[]): string {
  return run("gh", args);
}

function readPackageVersion(): string {
  const pkg = JSON.parse(readFileSync(PKG_PATH, "utf8")) as { version: string };
  return pkg.version;
}

function tagExists(name: string): boolean {
  git(["fetch", "--tags", "--quiet", "origin"]);
  return git(["tag", "--list", name]).trim() !== "";
}

// MARK: Release PR

function computeNextVersion(): string | null {
  try {
    return nextVersion(
      git(["cliff", "--bumped-version"]),
      readPackageVersion(),
    );
  } catch {
    return null;
  }
}

function findOpenReleasePr(): number | null {
  const out = gh([
    "pr",
    "list",
    "--head",
    RELEASE_BRANCH,
    "--state",
    "open",
    "--json",
    "number",
    "--jq",
    ".[0].number // empty",
  ]).trim();
  if (out === "") {
    return null;
  }
  return Number(out);
}

function isEditedByPeople(pr: number): boolean {
  const { commits } = JSON.parse(
    gh(["pr", "view", String(pr), "--json", "commits"]),
  ) as { commits: { authors: { email: string }[] }[] };
  return hasForeignCommits(commits, git(["config", "user.email"]).trim());
}

/** Leave a one-time comment on a release PR the bot no longer regenerates. */
function notePaused(pr: number): void {
  const comments = gh([
    "pr",
    "view",
    String(pr),
    "--json",
    "comments",
    "--jq",
    ".comments[].body",
  ]);
  if (comments.includes(PAUSED_MARKER)) {
    return;
  }
  gh([
    "pr",
    "comment",
    String(pr),
    "--body",
    `${PAUSED_MARKER}\nThis release PR has commits from people, so the release bot no longer regenerates it from \`main\`. Close it to get a fresh one.`,
  ]);
}

function pushReleaseBranch(
  title: string,
  body: string,
  existing: number | null,
): void {
  git(["checkout", "-B", RELEASE_BRANCH]);
  git(["add", "package.json", "CHANGELOG.md"]);
  git(["commit", "--message", title]);
  git(["push", "--force", "origin", RELEASE_BRANCH]);
  if (existing === null) {
    gh([
      "pr",
      "create",
      "--draft",
      "--base",
      "main",
      "--head",
      RELEASE_BRANCH,
      "--title",
      title,
      "--body",
      body,
    ]);
  } else {
    gh(["pr", "edit", String(existing), "--title", title, "--body", body]);
  }
}

// MARK: Commands

function prepare(dryRun: boolean): void {
  let existing: number | null = null;
  if (!dryRun) {
    existing = findOpenReleasePr();
  }
  if (existing !== null && isEditedByPeople(existing)) {
    console.log(`Release PR #${existing} has manual edits. Leaving it alone.`);
    notePaused(existing);
    return;
  }

  // Between a release PR's merge and its tag, git-cliff still measures from
  // the previous tag and would propose a release that is already merged.
  const current = tagName(readPackageVersion());
  if (!tagExists(current)) {
    console.log(`${current} is merged but not tagged yet. Nothing to do.`);
    return;
  }

  const version = computeNextVersion();
  if (version === null) {
    console.log("No version bump needed. Nothing to do.");
    return;
  }
  console.log(`Proposed next version: ${version}`);

  const tag = tagName(version);
  const changelog = git([
    "cliff",
    "--tag",
    tag,
    "--unreleased",
    "--strip",
    "header",
  ]);
  writeFileSync(
    PKG_PATH,
    setPackageVersion(readFileSync(PKG_PATH, "utf8"), version),
  );
  git(["cliff", "--tag", tag, "--unreleased", "--prepend", "CHANGELOG.md"]);

  if (dryRun) {
    console.log(`\n${changelog}`);
    console.log("[dry-run] Files written. Revert them with `git checkout .`.");
    return;
  }
  pushReleaseBranch(prTitle(version), prBody(changelog), existing);
  console.log(`Release PR for ${tag} is up to date.`);
}

function check(): void {
  const version = readPackageVersion();
  const tag = tagName(version);
  const problems: string[] = [];
  if (tagExists(tag)) {
    problems.push(
      `${tag} is already tagged. Bump the version in package.json.`,
    );
  }
  if (!changelogSection(readFileSync(CHANGELOG_PATH, "utf8"), version)) {
    problems.push(`CHANGELOG.md has no section for ${version}.`);
  }
  if (problems.length > 0) {
    for (const problem of problems) {
      console.error(problem);
    }
    process.exit(1);
  }
  console.log(`Ready to release ${tag}.`);
}

function createTag(dryRun: boolean): void {
  const name = tagName(readPackageVersion());
  if (tagExists(name)) {
    console.log(`Tag ${name} already exists. Nothing to do.`);
    return;
  }
  if (dryRun) {
    console.log(`[dry-run] Would create and push tag ${name}.`);
    return;
  }
  git(["tag", "--annotate", name, "--message", name]);
  git(["push", "origin", `refs/tags/${name}`]);
  console.log(`Tag ${name} pushed.`);
}

function notes(version: string | undefined): void {
  if (version === undefined) {
    throw new Error("Usage: release.mts notes <version>");
  }
  const section = changelogSection(
    readFileSync(CHANGELOG_PATH, "utf8"),
    stripV(version),
  );
  console.log(section || `No changelog entry found for ${version}.`);
}

function main(): void {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: { "dry-run": { type: "boolean", default: false } },
  });
  const [command, arg] = positionals;
  const dryRun = values["dry-run"] === true;

  switch (command) {
    case "prepare":
      prepare(dryRun);
      break;
    case "check":
      check();
      break;
    case "tag":
      createTag(dryRun);
      break;
    case "notes":
      notes(arg);
      break;
    default:
      console.error(
        `Unknown command: ${command} (expected prepare|check|tag|notes)`,
      );
      process.exit(1);
  }
}

main();
