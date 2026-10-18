import {
  changelogSection,
  hasForeignCommits,
  nextVersion,
  setPackageVersion,
} from "../scripts/release-helpers.mts";

const CHANGELOG = `# Changelog

## [1.4.0] _2026-10-19_

### Features

-   Add a thing

## [1.3.0](https://example.com/compare/v1.2.6...v1.3.0) (2022-09-22)

### Features

-   Add an older thing
`;

describe("nextVersion", () => {
  it("strips a leading v", () => {
    expect(nextVersion("v1.4.0\n", "1.3.0")).toBe("1.4.0");
  });

  it("returns null when git-cliff prints nothing", () => {
    expect(nextVersion("", "1.3.0")).toBeNull();
  });

  it("returns null when git-cliff returns the current version", () => {
    expect(nextVersion("v1.3.0", "1.3.0")).toBeNull();
  });
});

describe("setPackageVersion", () => {
  it("replaces only the version field", () => {
    const pkg =
      '{\n  "name": "x",\n  "version": "1.3.0",\n  "dep": "1.3.0"\n}\n';
    expect(setPackageVersion(pkg, "1.4.0")).toBe(
      '{\n  "name": "x",\n  "version": "1.4.0",\n  "dep": "1.3.0"\n}\n',
    );
  });

  it("throws when there is no version field", () => {
    expect(() => setPackageVersion('{ "name": "x" }', "1.4.0")).toThrow();
  });
});

describe("changelogSection", () => {
  it("returns the body up to the next section", () => {
    expect(changelogSection(CHANGELOG, "1.4.0")).toBe(
      "### Features\n\n-   Add a thing",
    );
  });

  it("matches a heading with a link and date", () => {
    expect(changelogSection(CHANGELOG, "1.3.0")).toBe(
      "### Features\n\n-   Add an older thing",
    );
  });

  it("matches a bare heading with a leading v", () => {
    expect(changelogSection("## v2.0.0\n\nBig", "2.0.0")).toBe("Big");
  });

  it("does not match a version that only shares a prefix", () => {
    expect(changelogSection("## [1.4.0-rc.1]\n\nRC", "1.4.0")).toBeNull();
  });

  it("stops at a standard-version patch heading", () => {
    expect(
      changelogSection("## [1.3.0]\n\nNew\n\n### [1.2.6]\n\nOld", "1.3.0"),
    ).toBe("New");
  });

  it("returns null for a missing version", () => {
    expect(changelogSection(CHANGELOG, "9.9.9")).toBeNull();
  });
});

describe("hasForeignCommits", () => {
  const bot = "1+bot[bot]@users.noreply.github.com";

  it("is false when the bot wrote every commit", () => {
    expect(hasForeignCommits([{ authors: [{ email: bot }] }], bot)).toBe(false);
  });

  it("is true when a person wrote a commit", () => {
    expect(
      hasForeignCommits(
        [{ authors: [{ email: bot }] }, { authors: [{ email: "a@b.c" }] }],
        bot,
      ),
    ).toBe(true);
  });
});
