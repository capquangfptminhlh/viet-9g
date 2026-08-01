# Blogger Auto-Publish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish one verified, Blogger-specific post automatically at 07:00 Asia/Ho_Chi_Minh without duplicate posts or silent verification failures.

**Architecture:** The Blogger connector gains an explicit publish operation and post verification accepts the expected remote state. The orchestration reserves an idempotency entry before publication, verifies the returned LIVE post, records the URL/state in the ledger, and writes an Actions Summary. The workflow invokes that path once per day and serializes overlapping runs.

**Tech Stack:** TypeScript, Vitest, Google Blogger v3 API, GitHub Actions, JSON publication ledger.

---

## File structure

- `packages/connectors/blogger/blogger.types.ts` — API request/response and ledger-compatible publication types.
- `packages/connectors/blogger/blogger.client.ts` — maps explicit `isDraft` requests to Google Blogger v3.
- `packages/connectors/blogger/blogger.publisher.ts` — creates draft or LIVE posts intentionally.
- `packages/connectors/blogger/blogger.verify.ts` — verifies identity, content policy, and expected remote state.
- `scripts/auto-blogger.ts` — selects one topic, reserves idempotency, publishes, verifies, and records evidence.
- `tests/blogger/blogger.publisher.test.ts`, `tests/blogger/blogger.verify.test.ts`, `tests/blogger/auto-blogger.test.ts` — regressions.
- `.github/workflows/daily-blogger.yml` — 07:00 VN schedule, concurrency lock, and ledger persistence.
- `docs/OPERATIONS.md` — recovery procedure.

### Task 1: Explicit LIVE publishing

**Files:**
- Modify: `packages/connectors/blogger/blogger.types.ts`
- Modify: `packages/connectors/blogger/blogger.client.ts`
- Modify: `packages/connectors/blogger/blogger.publisher.ts`
- Test: `tests/blogger/blogger.publisher.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
it('sends isDraft false when publishing', async () => {
  const insertPost = vi.fn().mockResolvedValue({ id: 'post-1', status: 'LIVE' });
  const publisher = new BloggerPublisher({ insertPost, getPost: vi.fn(), listPosts: vi.fn() });
  await publisher.publishPost(payload);
  expect(insertPost).toHaveBeenCalledWith(expect.objectContaining({ isDraft: false }));
});

it('keeps createDraft explicitly in draft mode', async () => {
  const insertPost = vi.fn().mockResolvedValue({ id: 'post-1', status: 'DRAFT' });
  const publisher = new BloggerPublisher({ insertPost, getPost: vi.fn(), listPosts: vi.fn() });
  await publisher.createDraft(payload);
  expect(insertPost).toHaveBeenCalledWith(expect.objectContaining({ isDraft: true }));
});
```

- [ ] **Step 2: Confirm failure**

Run: `npx vitest run tests/blogger/blogger.publisher.test.ts`

Expected: FAIL because `publishPost` and a non-draft request type do not exist.

- [ ] **Step 3: Implement the smallest connector change**

```ts
export interface BloggerPostRequest {
  blogId: string;
  isDraft: boolean;
  requestBody: { title: string; content: string; labels?: string[] };
}

async publishPost(payload: DraftPayload): Promise<BloggerPostResponse> {
  return this.client.insertPost({
    blogId: payload.blogId,
    isDraft: false,
    requestBody: { title: payload.title, content: payload.sanitizedHtml, labels: payload.labels },
  });
}
```

In `RealBloggerClient.insertPost`, replace the literal with `isDraft: req.isDraft`.

- [ ] **Step 4: Confirm pass**

Run: `npx vitest run tests/blogger/blogger.publisher.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add packages/connectors/blogger/blogger.types.ts packages/connectors/blogger/blogger.client.ts packages/connectors/blogger/blogger.publisher.ts tests/blogger/blogger.publisher.test.ts
git commit -m "feat(blogger): support explicit live publication"
```

### Task 2: Verify LIVE state after insert

**Files:**
- Modify: `packages/connectors/blogger/blogger.verify.ts`
- Test: `tests/blogger/blogger.verify.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
it('accepts a read-back LIVE post when LIVE is expected', async () => {
  await expect(verifyCreatedPost(liveClient, 'blog-1', 'post-1', payload, 'LIVE')).resolves.toBeUndefined();
});

it('rejects a draft returned after requested publication', async () => {
  await expect(verifyCreatedPost(draftClient, 'blog-1', 'post-1', payload, 'LIVE'))
    .rejects.toThrow('Expected status LIVE');
});
```

- [ ] **Step 2: Confirm failure**

Run: `npx vitest run tests/blogger/blogger.verify.test.ts`

Expected: FAIL because the verifier is draft-specific.

- [ ] **Step 3: Implement status-aware verification**

```ts
export async function verifyCreatedPost(
  client: BloggerClient,
  blogId: string,
  postId: string,
  expected: DraftPayload,
  expectedStatus: 'DRAFT' | 'LIVE',
): Promise<void> {
  const post = await client.getPost(blogId, postId);
  if (post.blog?.id !== blogId) throw new Error(`Verification failed: Expected blogId ${blogId}`);
  if (post.status !== expectedStatus) throw new Error(`Verification failed: Expected status ${expectedStatus}, got ${post.status}`);
  if (post.id !== postId) throw new Error(`Verification failed: Expected postId ${postId}`);
  if (expected.title && post.title !== expected.title) throw new Error('Verification failed: Title does not match');
  if ([...(post.labels || [])].sort().join('\0') !== [...(expected.labels || [])].sort().join('\0')) throw new Error('Verification failed: Labels do not match');
  if (!post.content) throw new Error('Verification failed: Post content is missing');
  enforceBloggerLinks(post.content);
}
```

Keep `verifyCreatedDraft(...)` as a wrapper that calls `verifyCreatedPost(..., 'DRAFT')`.

- [ ] **Step 4: Confirm pass**

Run: `npx vitest run tests/blogger/blogger.verify.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add packages/connectors/blogger/blogger.verify.ts tests/blogger/blogger.verify.test.ts
git commit -m "feat(blogger): verify published post state"
```

### Task 3: Reserve, publish, verify, and summarize exactly one topic

**Files:**
- Modify: `scripts/auto-blogger.ts`
- Modify: `packages/connectors/blogger/blogger.idempotency.ts`
- Test: `tests/blogger/auto-blogger.test.ts`

- [ ] **Step 1: Write failing orchestration tests**

```ts
it('publishes one eligible topic and records LIVE only after read-back verification', async () => {
  const result = await runAutoBlogger({ ...fixture, client: liveClient });
  expect(liveClient.insertPost).toHaveBeenCalledWith(expect.objectContaining({ isDraft: false }));
  expect(readLedger()).toContainEqual(expect.objectContaining({ status: 'LIVE', postId: 'post-1' }));
  expect(result).toMatchObject({ status: 'SUCCESS', publishedUrl: expect.stringContaining('post-1') });
});

it('retains a failed reservation when LIVE verification fails', async () => {
  const result = await runAutoBlogger({ ...fixture, client: draftReadBackClient });
  expect(result).toMatchObject({ status: 'ERROR', exitCode: 1 });
  expect(readLedger()).toContainEqual(expect.objectContaining({ status: 'VERIFY_FAILED', postId: 'post-1' }));
});

it('does not call insertPost for a held, expired, unverified, duplicate, or reserved topic', async () => {
  await runAutoBlogger({ ...ineligibleFixture, client: liveClient });
  expect(liveClient.insertPost).not.toHaveBeenCalled();
});
```

- [ ] **Step 2: Confirm failure**

Run: `npx vitest run tests/blogger/auto-blogger.test.ts`

Expected: FAIL because `runAutoBlogger` cannot receive a client and calls `createDraft`.

- [ ] **Step 3: Implement the publish transaction**

Add `client?: BloggerClient` to the options. Use the injected client in tests or `new RealBloggerClient()` in production. Reserve and persist the ledger before the remote call:

```ts
const attempt: LedgerEntry = { ...baseEntry, status: 'INSERT_STARTED', createdAt: now.toISOString() };
ledger.push(attempt);
writeLedger(ledger);

const response = await publisher.publishPost(payload);
await verifyCreatedPost(client, selectedSite.blogId, response.id, payload, 'LIVE');
Object.assign(attempt, { postId: response.id, status: 'LIVE', publishedAt: now.toISOString() });
writeLedger(ledger);
```

Extend `LedgerEntry` with `publishedAt?: string`; extend `Result` with `publishedUrl?: string`. On any insert/verification exception, retain the same attempt, set `VERIFY_FAILED`, preserve a known post ID, write the ledger, write a secret-free summary, and return exit code 1. Do not attempt a second topic.

- [ ] **Step 4: Write summary for every terminal path**

```ts
appendSummary(env, [
  '### Blogger auto-publish',
  `- Status: ${result.status}`,
  `- Topic: ${selectedTopic?.topicId ?? 'none'}`,
  `- Post: ${postId ?? 'none'}`,
  publishedUrl ? `- Published: ${publishedUrl}` : '- Published: no',
].join('\n'));
```

For an empty queue write `no eligible topic`; for an error write the gate or verification message only.

- [ ] **Step 5: Confirm pass**

Run: `npx vitest run tests/blogger/auto-blogger.test.ts && npx vitest run tests/blogger`

Expected: PASS; one API insert for one LIVE topic, none for every blocked case.

- [ ] **Step 6: Commit**

```powershell
git add scripts/auto-blogger.ts packages/connectors/blogger/blogger.idempotency.ts tests/blogger/auto-blogger.test.ts
git commit -m "feat(blogger): publish verified topic with durable ledger"
```

### Task 4: Schedule the guarded workflow and document recovery

**Files:**
- Modify: `.github/workflows/daily-blogger.yml`
- Modify: `docs/OPERATIONS.md`

- [ ] **Step 1: Enable 07:00 VN schedule and concurrency**

```yaml
name: Blogger Owned Media Publish

on:
  schedule:
    - cron: "0 0 * * *" # 07:00 Asia/Ho_Chi_Minh
  workflow_dispatch:

concurrency:
  group: blogger-auto-publish
  cancel-in-progress: false
```

Rename the job/step from draft creation to publish. Retain `BLOGGER_MAX_POSTS_PER_RUN: "1"`, test-before-publish, environment secrets, and ledger persistence. Push the ledger to the checked-out branch; do not hard-code `main` for manual feature-branch runs.

- [ ] **Step 2: Add recovery procedure to `docs/OPERATIONS.md`**

```markdown
## Blogger auto-publish recovery

1. Open the failed Actions Summary; record topic ID, idempotency key, post ID, and error.
2. Search Blogger by post ID/title before changing state.
3. If a LIVE post exists, update that same ledger row to LIVE with the real post ID and published time; never create another post.
4. If no remote post exists, append an audited recovery entry explaining the cleared reservation, increment the topic content version, then run the workflow manually once.
5. To pause daily publishing, disable only the workflow schedule. Never delete ledger rows or posts.
```

- [ ] **Step 3: Validate final result**

Run: `npx vitest run tests/blogger && npm run validate:catalog && npm run build`

Expected: Blogger tests pass, catalog validates, Astro build and SEO audit complete without errors.

- [ ] **Step 4: Inspect and commit**

```powershell
git diff --check
git add .github/workflows/daily-blogger.yml docs/OPERATIONS.md
git commit -m "ci(blogger): schedule guarded daily publication"
```

## Final acceptance checklist

- [ ] Website schedule remains untouched.
- [ ] Blogger runs at `0 0 * * *` UTC with a concurrency group.
- [ ] One eligible topic at most is published per run.
- [ ] The real API uses `isDraft: false`.
- [ ] Read-back requires LIVE, matching ID/title/labels, and compliant links.
- [ ] Every terminal result has a secret-free Actions Summary and auditable ledger row.
- [ ] Held, duplicate, expired, unverified, malformed, and failed-verification cases cannot publish.
- [ ] `npx vitest run tests/blogger`, `npm run validate:catalog`, and `npm run build` pass.
