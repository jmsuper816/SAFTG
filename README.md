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

## Badge summary

Current and historical ranking pages show a **Badge Summary** between week navigation and the team
rankings. Awards are grouped by badge, while tied recipients appear together in ranking order.
Badge names, earned week, and recipients are visible immediately; activate a group to reveal the
badge description and each recipient's reason. The disclosure controls work with keyboard or
pointer input and do not require JavaScript. Existing badges remain on individual team cards.

## Football visual theme

The supplied football artwork is bundled with the static site in portrait and landscape variants.
The page selects the variant that matches the viewport orientation and keeps it fixed while content
scrolls. A dark teal overlay and solid content surfaces preserve readability; cyan marks upward
ranking movement, hot pink marks downward movement, and arrows retain the meaning without color.

Use `npm run dev` for live theme work. For a production-equivalent review, run:

```bash
npm run build
npm run preview -- --host 127.0.0.1
```

Review the current, historical, and 404 pages in portrait and landscape orientations. The source
art lives in `src/assets/backgrounds/` and Astro emits fingerprinted, GitHub Pages base-aware URLs.
See `specs/003-color-scheme-design/quickstart.md` for the complete contrast, reflow, orientation,
fallback, and accessibility validation matrix.

## Weekly recap workflow

The short recap beneath each publication date is generated before the static build and cannot be
published until a commissioner approves it. The browser and GitHub Pages build never contact a
news site or an AI provider.

1. Add or update `data/recap-inputs/<season>/week-<NN>.json`. Use only official NFL or team sources,
   summarize them in your own words, and record verified `started` or `bench` lineup evidence when
   connecting real-football news to a fantasy result. A bench performance is a missed opportunity,
   not points that affected the matchup.
2. Optionally add private context to `data/recap-notes/<season>/week-<NN>.txt`. That directory is
   ignored by Git. Put the note's SHA-256 digest in the evidence manifest; raw notes must never be
   committed.
3. Export `OPENAI_API_KEY` locally, then run
   `npm run recap:draft -- --season <year> --week <number>`. `RECAP_MODEL` and
   `RECAP_TIMEOUT_MS` may be overridden using `.env` values.
4. Fact-check and edit the generated JSON in `data/recaps/`. Every factual paragraph must refer to
   known fact/source IDs and `warnings` must be empty.
5. After the commissioner reviews the exact prose, run
   `npm run recap:approve -- --season <year> --week <number> --commissioner "<name>"`.
6. Run `npm run recap:verify -- --all`. Changing ranking facts, evidence, notes, prompt/model
   configuration, references, or prose invalidates approval and requires regeneration or review and
   reapproval.

Tests use an injected fake generator and never need an API key. Ordinary builds are also
network-free, but intentionally fail when an edition is missing a current approved recap.

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
