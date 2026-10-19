# Releasing

Releases run through a draft pull request that `.github/workflows/release.yml` keeps open.

## How a release works

1. **Release PR.** Every push to `main` runs `scripts/release.mts prepare`.
   - git-cliff reads the [Conventional Commits](https://www.conventionalcommits.org) since the last `v*` tag and proposes the next version: `fix` → patch, `feat` → minor, `!` or `BREAKING CHANGE` → major.
   - The script writes that version to `package.json` and prepends a section to `CHANGELOG.md`.
   - It force-pushes both files to `release/pact-cypress-adapter`, behind a draft PR titled `chore(release): vX.Y.Z`.
   - `chore(deps)` and `fix(deps)` commits do not trigger a release.
2. **Review.** Mark the PR ready for review. `test.yml` runs, and so does the `Verify release` job.
   - `Verify release` runs the publish steps from `.github/actions/publish` with `--dry-run`, using the same Node and npm versions as the real publish.
   - It fails when the version is already tagged or `CHANGELOG.md` has no section for it.
   - Its job summary shows the release notes.
3. **Tag.** Merging the PR tags the merge commit `vX.Y.Z`, using the version in its `package.json`.
4. **Publish.** The tag builds the package, publishes it to npm through trusted publishing, and creates the GitHub release. The release notes are the version's section of `CHANGELOG.md`.

## Changing a release

The files on the release branch are the release. To change the version or the changelog, push a commit to `release/pact-cypress-adapter`, or edit the files in the GitHub UI.

Once the branch has a commit from anyone but the release bot, `prepare` stops regenerating it and comments on the PR to say so. Later commits on `main` do not reach the PR. To pick them up, close the PR. The next push to `main` opens a fresh one.

When you change the version, rename the `CHANGELOG.md` heading to match. `Verify release` fails until they agree.

## If a step fails

| Failure | State | Recovery |
| --- | --- | --- |
| `Create release tag` | PR merged, no tag | Re-run the job. |
| `Publish to npm`, before npm publish, cause outside the repository | Tag only | Re-run the job. |
| `Publish to npm`, before npm publish, cause in the tagged commit | Tag only | A re-run checks out the same commit, so it fails again. Land the fix on `main`, delete the tag, and tag the fixed commit with the same version. Nothing reached npm, so the version is still free. |
| `Publish to npm`, after npm publish | On npm, no GitHub release | Re-run the job. It skips a version that npm already has. |

A broken release that has reached npm is not re-tagged. Land a fix on `main` and release the next patch.

## Setup

- **GitHub App.** `PACTFLOW_CI_BOT` needs contents and pull-request write access. It reads `vars.PACTFLOW_CI_BOT_APP_ID` and `secrets.PACTFLOW_CI_BOT_PRIVATE_KEY`.
- **Rulesets.** Allow the App to push `release/pact-cypress-adapter` and `v*` tags. Require the `Test completion check` status on `main`.
- **npm trusted publisher.** On npmjs.com, add one for `@pactflow/pact-cypress-adapter`: repository `pactflow/pact-cypress-adapter`, workflow `release.yml`, environment `npm`.
- **`npm` environment.** Create it in the repository settings.
