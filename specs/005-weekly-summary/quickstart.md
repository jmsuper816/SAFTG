# Validation Quickstart: Quippy Weekly Summary

## Prerequisites

- Node.js 24+
- Dependencies installed with `npm install`
- Existing local environment from the repository README
- `OPENAI_API_KEY` available only when intentionally generating a real draft
- Private commissioner notes stored in the documented ignored local notes path

## Backfill and editorial workflow

For each existing edition (Weeks 1 and 2 initially):

1. Create and validate the committed evidence manifest with official NFL/team URLs, timestamps, original
   paraphrases, verified lineup evidence, and private-note digests.
2. Generate a draft:

   ```bash
   npm run recap:draft -- --season 2026 --week 1
   ```

3. Review/edit the paragraphs and evidence references. Confirm started-player impact is not confused
   with benched-player missed opportunity and personal callouts match approved context.
4. Approve the exact reviewed draft:

   ```bash
   npm run recap:approve -- --season 2026 --week 1 --commissioner "Jessica"
   ```

5. Repeat for Week 2, then verify all editions:

   ```bash
   npm run recap:verify -- --all
   ```

Expected: verification identifies every edition as approved/current and makes no network request.

## Approval invalidation checks

Using a test fixture or disposable copy, change each of the following one at a time: rank/score/badge
fact, lineup evidence, official source timestamp/summary, note digest, prompt/model version, evidence
reference, and paragraph text. Run all-edition verification after each change.

Expected: every relevant change produces an edition-specific stale-approval failure. Restore and
reapprove the artifact before continuing. Changing only generation/approval timestamps must not alter
the digest.

## Failure checks

With local fixtures and fake clients, verify that draft generation exits nonzero and preserves the last
approved artifact for an unsupported host, out-of-window source, malformed evidence, note-digest
mismatch, provider refusal/incomplete response, timeout, authentication error, or unknown returned ID.
Ordinary automated tests must not require a live key or make remote requests.

## Automated gates

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run recap:verify -- --all
npm run build
npm run check:links
npm run scan:secrets -- dist
npm run test:e2e
```

Expected: all commands succeed, each edition has one approved recap, the build remains static, Pages
links resolve, and neither secrets nor recap audit/private data appear in `dist/`.

## Production preview

```bash
npm run build
npm run preview -- --host 127.0.0.1
```

Review `/`, `/weeks/1/`, `/weeks/2/`, and `/404.html` against
[recap-ui.md](contracts/recap-ui.md). Confirm distinct edition copy, divider and paragraph order beneath
the date, unchanged rankings/badges/navigation/artwork/back-to-top behavior, and no browser-side API
requests.

## Responsive and content review

- At 320 CSS pixels and 200% text size, confirm the divider and every paragraph reflow with no horizontal
  document scrolling.
- Review source order, heading semantics, contrast, and axe results on current and historical pages.
- Have at least five league members review the recaps: at least four must identify the main storyline
  and a football-to-fantasy connection, at least four must rate the copy fun and league-specific, and no
  reviewer may flag a personal callout as hostile or unsupported.
- Inspect generated HTML and network activity to confirm that only approved paragraphs are public and no
  browser request reaches ESPN, NFL/team sites, or OpenAI.
