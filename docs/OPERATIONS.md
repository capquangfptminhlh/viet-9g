# Blogger publication recovery

When a Blogger publication run needs recovery:

1. Open the Actions Summary and capture the topic, key, post, and error.
2. Search Blogger before changing any state.
3. If a LIVE post exists, update the same ledger row; do not create another post.
4. If no remote post exists, append an auditable recovery reason, increment `contentVersion`, then perform one manual rerun.
5. Disabling the schedule pauses publication; never delete the ledger or posts.
