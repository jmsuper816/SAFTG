<!--
Sync Impact Report
- Version change: 1.0.0 -> 1.1.0
- Modified principles:
  - Added VI. Feature Branches and Squash Merges
- Added sections: none
- Removed sections: none
- Follow-up TODOs: none
-->

# SAFTG Constitution

## Core Principles

### I. Static Output Is the Product

Every production build MUST produce a self-contained set of static HTML, CSS, JavaScript, and
asset files. The deployed site MUST NOT require an application server, server-side runtime,
database, or request-time rendering. Features that cannot operate within GitHub Pages' static
hosting model MUST be redesigned, precomputed during the build, or explicitly rejected. This
keeps the deployed system compatible with its intended hosting platform.

### II. External Data Is Acquired at Build Time

Data needed to render published content MUST be fetched from external APIs during the build and
materialized into static output. API clients MUST define timeouts, validate responses, and handle
rate limits and transient failures with bounded retries. A build MUST NOT silently publish missing,
malformed, or stale data; any intentional fallback or cached-data policy MUST be documented and
tested. Browser-side API calls are permitted only when a feature inherently requires live data and
the endpoint supports safe, unauthenticated public access.

### III. Secrets Never Reach Published Artifacts

API credentials and other secrets MUST be supplied through protected build-environment secrets and
MUST NOT be committed, logged, embedded in generated files, or exposed to browser code. Build tools
MUST treat all generated output as public. Any API requiring a secret at request time MUST be called
only during the trusted build process; if that is insufficient, the feature is incompatible with
this architecture and requires a constitutional amendment or a different platform.

### IV. Builds Are Reproducible and Fail Clearly

Dependencies MUST be pinned through a committed lockfile, and the documented build command MUST
produce equivalent output from the same source and API inputs. Builds MUST fail with actionable
errors when required inputs are unavailable or invalid. Generated timestamps, ordering, and other
nondeterministic values MUST be controlled unless they are intentional published content. Local and
CI builds MUST use the same build path so deployment failures can be reproduced before merge.

### V. GitHub Pages Compatibility Is Mandatory

All URLs and assets MUST work under the repository's configured GitHub Pages base path and over
HTTPS. Navigation MUST remain functional on direct page loads without server-side rewrite rules;
client-side routing, if used, MUST include a tested Pages-compatible fallback. File-name casing MUST
match references exactly. The published artifact MUST contain no unsupported server configuration,
and deployment MUST use GitHub Pages through an auditable GitHub Actions workflow or an explicitly
documented Pages source branch.

### VI. Feature Branches and Squash Merges

Every new feature MUST be developed on a dedicated feature branch created from the current main
branch before implementation begins. Unrelated features MUST NOT share a branch. Work MUST be
committed at logical checkpoints—such as after a coherent behavior, test, or refactor is
complete—using small, focused commits with descriptive messages; completed feature work MUST NOT be
held as one large end-of-feature commit. Temporary work-in-progress commits MAY be used on the
feature branch. A completed feature MUST enter main through a pull request using squash merge, so
main receives one cohesive commit whose message summarizes the delivered feature. Direct feature
commits and merge commits to main are prohibited. This preserves reviewable development history
while keeping the permanent main-branch history concise and reversible.

## Architecture and Security Constraints

- The static-site generator and language MAY vary, but they MUST support non-interactive CI builds
  on GitHub-hosted runners and emit a clearly identified publish directory.
- Build-time API access MUST use least-privilege credentials, minimal scopes, and documented secret
  names. Pull requests from untrusted forks MUST NOT receive protected credentials.
- External API data MUST be transformed through an explicit schema or validation boundary before it
  reaches templates. Untrusted content MUST be escaped or sanitized for its output context.
- Published artifacts MUST exclude source secrets, environment files, build caches, and unnecessary
  internal metadata. A secret scan of source and generated output MUST pass before deployment.
- Accessibility, semantic HTML, and responsive behavior are release requirements. The site MUST
  provide meaningful content without relying solely on client-side JavaScript where practical.

## Delivery and Quality Gates

Every change MUST pass formatting or lint checks, automated tests relevant to its behavior, and a
production-equivalent static build before merge. Changes to API ingestion MUST include tests for a
valid response, invalid data, and failure behavior using fixtures or mocks rather than consuming
live API quotas in routine tests. Changes affecting paths or navigation MUST be verified with the
configured GitHub Pages base path and checked for broken internal links and missing assets.

Deployment MUST occur only from reviewed, version-controlled configuration. The workflow MUST use
least-privilege permissions, pin third-party actions to immutable commit SHAs, and prevent concurrent
deployments from publishing out of order. The deploy job MUST publish exactly the validated build
artifact; it MUST NOT rebuild with different inputs after quality gates pass. Rollback MUST be
possible by redeploying a known-good commit.

Reviewers MUST record any intentional exception to these rules in the relevant specification or
pull request, including its scope, risk, owner, and removal condition. Exceptions MUST be temporary;
permanent deviations require a constitution amendment.

## Governance

This constitution is the highest project-level engineering authority. Specifications, plans,
tasks, implementation, and review decisions MUST comply with it. When another project document
conflicts with this constitution, this constitution governs.

Amendments MUST be proposed as a reviewed change to this file. Each proposal MUST explain the
motivation, compatibility impact, migration work, and version bump. Approval requires explicit
maintainer acceptance, and any required migration plan MUST be approved before the amendment takes
effect. The Sync Impact Report is review material and SHOULD be removed before commit once reviewers
confirm the amendment's effects.

Constitution versions follow semantic versioning: MAJOR for incompatible governance changes or
principle removal or redefinition; MINOR for a new principle or materially expanded obligation; and
PATCH for clarifications that do not alter obligations. The Last Amended date MUST match the date on
which the current version was adopted; the Ratified date MUST remain the original adoption date.

Every feature specification and implementation plan MUST include a constitution check. Every pull
request review MUST verify applicable build, security, static-hosting, and deployment gates. At
least once per release, or quarterly when releases are less frequent, maintainers MUST audit the
deployed site and workflow for continued compliance. Unjustified violations block merge or release.

**Version**: 1.1.0 | **Ratified**: 2026-09-26 | **Last Amended**: 2026-09-26
