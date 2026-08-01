# BOD-32 Operations Guide & Acceptance Checklist

## 1. Safety Locks
- v1 DRAFT-ONLY: All API calls hardcode `isDraft: true`.
- Concurrency & Idempotency: `state/blogger-publication-ledger.json` is committed back to Git after every workflow run.

## 2. Pilot Acceptance Checklist (4 Manual Runs)
- [ ] Run 1: Verified draft created on test blog, draft state confirmed, read-back passed.
- [ ] Run 2: Verified second topic drafted without duplicates.
- [ ] Run 3: Verified no secrets exposed in logs.
- [ ] Run 4: Verified UTM referral links function properly.
