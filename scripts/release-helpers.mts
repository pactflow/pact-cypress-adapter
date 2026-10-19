/** Pure helpers for scripts/release.mts. */

const RE_LEADING_V = /^v/;
const RE_VERSION_FIELD = /^(\s*"version"\s*:\s*")[^"]*(")/m;
const RE_REGEX_SPECIAL = /[.*+?^${}()|[\]\\]/g;
const RE_SECTION_HEADING = /^## /;

export function stripV(version: string): string {
  return version.replace(RE_LEADING_V, "");
}

/**
 * Next version to release, or null when there is nothing to do: no bump, or
 * git-cliff returned the already-released version (e.g. only deps commits).
 */
export function nextVersion(
  cliffStdout: string,
  currentVersion: string,
): string | null {
  const version = stripV(cliffStdout.trim());
  if (version === "" || version === currentVersion) {
    return null;
  }
  return version;
}

export function tagName(version: string): string {
  return `v${version}`;
}

export function prTitle(version: string): string {
  return `chore(release): v${version}`;
}

/** Replace the `"version"` field, preserving surrounding formatting. */
export function setPackageVersion(pkgJson: string, version: string): string {
  if (!RE_VERSION_FIELD.test(pkgJson)) {
    throw new Error("Could not find version field in package.json");
  }
  return pkgJson.replace(RE_VERSION_FIELD, `$1${version}$2`);
}

/**
 * The body of the `## ` section whose heading names `version`, or null when
 * there is no such section. The heading may write the version bare, with a
 * leading `v`, or in brackets.
 */
export function changelogSection(
  changelog: string,
  version: string,
): string | null {
  const escaped = version.replace(RE_REGEX_SPECIAL, "\\$&");
  const heading = new RegExp(`^## \\[?v?${escaped}(?![\\w.+-])`);
  const lines = changelog.split("\n");
  const start = lines.findIndex((line) => heading.test(line));
  if (start === -1) {
    return null;
  }
  let rest = lines.slice(start + 1);
  const end = rest.findIndex((line) => RE_SECTION_HEADING.test(line));
  if (end !== -1) {
    rest = rest.slice(0, end);
  }
  return rest.join("\n").trim();
}

/** Whether any commit has an author other than `botEmail`. */
export function hasForeignCommits(
  commits: { authors: { email: string }[] }[],
  botEmail: string,
): boolean {
  return commits.some((commit) =>
    commit.authors.some((author) => author.email !== botEmail),
  );
}

export function prBody(changelog: string): string {
  return `${changelog.trim()}

---

Merging this PR tags the merge commit with the version in \`package.json\`. The tag publishes to npm and creates the GitHub release, whose notes come from \`CHANGELOG.md\`.

Edit \`package.json\` or \`CHANGELOG.md\` on this branch to change the release. After a push from anyone but the release bot, the bot stops regenerating this PR. Close the PR to get a fresh one.
`;
}
