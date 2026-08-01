# Blogger auto-publish — approved design

## Decision

The main website retains its existing daily publishing workflow at 07:00 Asia/Ho_Chi_Minh. Blogger will publish one distinct owned-media article per day at the same time, without creating a review draft first.

This is a separate distribution channel. A Blogger article must be generated from the same verified fact store as the website, but it must use its own channel-specific structure and wording. It must not copy the corresponding primary-site article.

## Scope

- Enable the `daily-blogger.yml` scheduled workflow for 07:00 Asia/Ho_Chi_Minh (00:00 UTC).
- Change the real Blogger API insertion from draft mode to publish mode only after all gates pass.
- Retain the existing main-site schedule and its content workflow without changing its timetable.
- Keep the public-site registration CTA and agent code `GB` unchanged.

## Publication gates

One topic can be published only when every gate below passes:

1. The topic is `active` and has not been HOLDed.
2. All referenced facts exist, have not expired, and use an allowed official Viettel source.
3. The topic's target URL is valid and context-specific.
4. The generated Blogger HTML passes sanitization, link-policy enforcement, intent-specific structural checks, and duplicate detection.
5. The publication ledger has no record for the content-version idempotency key.

Package records marked `operator_verified` may retain their CTA on the main site, but they are not eligible as Blogger source material. Blogger publication requires officially sourced, fresh facts.

## Publish transaction

1. Select exactly one eligible topic.
2. Reserve the idempotency key in the ledger before the remote API call.
3. Generate the Blogger-specific article and execute all gates.
4. Insert the post through the Blogger API with `isDraft: false`.
5. Read the created post back from Blogger and verify its ID, title, labels, links, and published state.
6. Finalize the ledger only after verification succeeds, recording post ID, publication time, topic ID, catalog version, and content version.
7. Add a GitHub Actions Summary with the published URL or a precise HOLD/failure reason.

If any gate or API call fails, no second post is attempted. The topic reservation remains auditable and blocks blind retries that could create a duplicate. Recovery must be an explicit, logged operator action; historical ledger rows must never be deleted.

## Scheduling and rate limit

- Main site: existing schedule, 07:00 Asia/Ho_Chi_Minh.
- Blogger: 07:00 Asia/Ho_Chi_Minh (`0 0 * * *` UTC).
- Blogger volume: exactly one post per run and one post per day for this blog.
- Workflow concurrency: one Blogger publish run at a time; overlapping scheduled or manual runs are prevented.

## Operational evidence

Every run must leave evidence in both the GitHub Actions Summary and the ledger:

- selected topic and content-version key;
- gate results;
- Blogger post ID and published URL on success;
- clear reason and non-zero exit on failure or an empty eligible queue.

## Non-goals

- No bulk publishing or catch-up publishing.
- No automatic removal or mutation of past ledger records.
- No automatic publishing from unverified package data.
- No change to the primary website's existing schedule or CTA behavior.

## Rollback

To pause Blogger publication, disable the `schedule` trigger while retaining `workflow_dispatch` for diagnostics. Existing posts and ledger data are not removed. Restoring draft-only mode requires an explicit code/config change and an audit entry.
