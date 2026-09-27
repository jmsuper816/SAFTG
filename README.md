# Tuesday Power Rankings

A playful, fully static fantasy-football site with commissioner-authored weekly rankings, public
ESPN score context, deterministic badges, and immutable weekly history. Astro builds the site for
GitHub Pages; no browser request contacts ESPN and no application server is required.

## Local setup

1. Install Node.js 24 LTS.
2. Run `npm ci`.
3. Load the `.env.example` values into your shell using the instructions below.
4. Run `npm run dev` for local viewing or `npm run build` for production output.

### Load configuration into your shell

Copy the example file to a local `.env` file, then replace the example values with your league and
GitHub Pages details:

```bash
cp .env.example .env
```

For example, set `ESPN_LEAGUE_ID` to the numeric ID from your public ESPN league URL and replace
`your-account` in `SITE_ORIGIN` with your GitHub username. If the repository has a different name,
update `SITE_BASE` as well.

Load every value from `.env` into your current Bash or Zsh session:

```bash
set -a
source .env
set +a
```

These values remain available until you close that terminal. Run the three commands again in each
new terminal session before using the generation or development commands. You can confirm a value
was loaded without displaying anything sensitive:

```bash
test -n "$ESPN_LEAGUE_ID" && echo "ESPN league configuration loaded"
```

The local `.env` file is excluded by `.gitignore`. Use a publicly viewable ESPN league only; never
add ESPN cookies, `espn_s2`, SWID, or account credentials.

## Draft-day baseline

`data/rankings/<season>/draft-day.json` stores the preseason power rankings using stable ESPN team
IDs. Every weekly edition measures each team's rise or fall against this baseline, matching ESPN's
“Draft Day vs. Current Rankings” view. The draft baseline is not presented as a completed fantasy
week and does not affect records, scores, or badges.

## Weekly commissioner workflow

1. Create `data/rankings/<season>/week-<NN>.json` from the commissioner-ranking contract in
   `specs/001-fantasy-power-rankings/contracts/`.
2. Run `npm run ranking:validate -- --season <year> --week <number>`.
3. After ESPN results finalize, run `npm run edition:generate -- --season <year> --week <number>`.
4. Review and commit the ranking submission and generated edition together on a feature branch.
5. Open a pull request. Merge with squash only after every quality gate passes.

If the ranking or ESPN data is missing, malformed, or incomplete, generation exits non-zero and
writes no edition. The last valid deployed edition stays live.

## Corrections, recovery, and rollback

- ESPN stat corrections require regenerating the affected edition on a branch and reviewing the
  JSON diff before squash merge. Historical content never changes silently.
- Use the Pages workflow's manual dispatch after correcting an external or transient failure.
- Roll back by redeploying or reverting to a known-good commit; the deployment job uses the exact
  artifact validated by its build job.

## GitHub Pages settings

Select **GitHub Actions** as the Pages source and protect the `github-pages` environment so only the
default branch can deploy. The workflow derives the project-site base path from Pages, grants only
`contents: read` during build and `pages: write`/`id-token: write` during deploy, and pins every
third-party action to an immutable full commit SHA.

See `specs/001-fantasy-power-rankings/quickstart.md` for end-to-end validation.
