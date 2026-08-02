# Topic Factory — approved design

## Decision

Topic Factory creates replenishment topics only from official, unexpired Viettel facts. It never uses `operator_verified` package data as Blogger editorial evidence; that status remains limited to website CTA display.

## Blog 1 policy

- Scope: guides for using 4G/5G Viettel only.
- Queue target: 30 eligible topics.
- Replenishment threshold: fewer than 14 eligible queued topics.
- Publishing remains separate: Blogger publish workflow selects at most one topic at 07:00 Asia/Ho_Chi_Minh.

## Topic eligibility

A generated topic becomes `QUEUE` only if it has all of:

1. a unique question/title and intent for Blog 1;
2. one or more official, unexpired Viettel facts;
3. a context-specific existing website `targetUrlPath`;
4. topic-specific facts matching its claim;
5. no collision with queue or ledger by normalized title, semantic intent key, target path, or generated-content fingerprint.

Any candidate failing a gate is written as `HOLD` with a machine-readable reason; it is never published.

## Generation rules

- Derive questions from facts and the supported website routes; do not invent package prices, syntax, benefits, promotions, dates, or URLs.
- Use a fixed intent taxonomy: setup, usage, troubleshooting, compatibility, how-to, and informational reference.
- Ban commercial/transactional phrasing in Blog 1, duplicate titles, broad keyword variants, and generic filler topics.
- Do not reuse an image brief, outline, title, or primary question used by the website or another Blogger.
- Each candidate must include `topicId`, `targetBlogId`, `intent`, `title`, `targetUrlPath`, `sourceFactIds`, `contentVersion`, `status`, and `generationAudit`.

## Automation

- A scheduled Topic Factory workflow checks the queue once per week and may also run manually.
- It creates only the exact shortfall to reach 30; it never overwrites or deletes existing topics or ledger records.
- The workflow validates candidates before committing `config/topics.json`; queue writes are idempotent and auditable.
- Publisher runs independently; an empty factory result is a successful no-op, while an empty publisher queue is an auditable HOLD.

## Initial rollout

1. Add a controlled source registry of Blog 1 route/fact pairs.
2. Generate 30 candidates locally and run strict tests.
3. Commit the approved queue, then run one manual publish and verify LIVE read-back.
4. Enable weekly replenishment only after the manual run succeeds.
