# AGENTS.md — PROJECT BOOTSTRAP

This repository is governed by the central Website OS repository:

- Source repo: `capquangfptminhlh/seo-web`
- Source ref: `main`
- Manifest: `governance/website-os.manifest.yml`
- Central entrypoint: `AGENTS.md`

## Mandatory startup

Before planning, coding, designing, writing/scaling content, running SEO, changing production configuration, reviewing, or modifying this project:

1. Load `capquangfptminhlh/seo-web` at the declared source ref.
2. Read `governance/website-os.manifest.yml`.
3. Resolve and record the central source commit SHA.
4. Follow the manifest `mandatory_read_order` completely.
5. Read all relevant central QA/evidence/normative files referenced by that stack.
6. Only then read and apply this project's local rules below.

If the central repo, manifest, or any mandatory normative file cannot be resolved, return:

`HOLD — WEBSITE OS BOOTSTRAP MISSING OR STALE`

Do not proceed from memory or an old summary.

## Rule precedence

Local project rules may extend or strengthen central Website OS rules, but MUST NOT silently weaken central hard gates. Any permitted deviation requires a Decision Record with provenance.

## Bootstrap evidence

Before substantive work, record:
- source repo;
- source ref;
- resolved source commit SHA;
- manifest version;
- `observed_at`;
- mandatory read completion;
- Bootstrap PASS/HOLD.

## Project-specific reading order

After central Bootstrap PASS, read these local files before substantive project changes:

1. `anti-mock-rules.md` — mandatory evidence/verification and anti-fabrication rules.
2. `.agents/ORIGINAL_REQUEST.md` — original project objectives and acceptance context.
3. Relevant project QA/tests/state files for the task being changed.

## Project-specific hard rules

- Do not fabricate Viettel package facts, prices, benefits, eligibility, registration conditions, coverage, or quantitative claims. Use identified source-of-truth evidence; otherwise mark `UNKNOWN`, `UNVERIFIED`, or `HOLD`.
- Production is hosted on Vercel. Do not change DNS/domain routing unless the user explicitly requests it.
- Do not claim production deployment until the Vercel production deployment for the exact `main` commit is `READY` and the production path has been checked.
- Preserve the approved registration CTA contract: `MÃ_GÓI GB` sent to `290`. Do not change the affiliate code, destination, or bypass this flow without explicit user instruction and regression evidence.
- Do not disable tests, K0, build, policy checks, or fail-closed behavior merely to obtain a green build.
- Follow `anti-mock-rules.md` reporting states: VERIFIED / PARTIALLY VERIFIED / UNVERIFIED / BLOCKED; do not report "xong" while a required production check is still pending.
