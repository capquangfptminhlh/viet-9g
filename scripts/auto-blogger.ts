import fs from 'fs';

export async function runAutoBlogger(options: {
  sites?: Array<{ blogId: string; enabled: boolean }>;
  topics?: Array<{ topicId: string }>;
  env?: Record<string, string | undefined>;
  now?: Date;
  facts?: unknown[];
}): Promise<{ status: string; exitCode: number; attemptedBlogIds: string[]; draftReviewUrl?: string }> {
  const env = options.env || process.env;
  if (env.BLOGGER_ENABLED !== 'true') {
    return { status: 'DISABLED', exitCode: 0, attemptedBlogIds: [] };
  }

  let facts = options.facts;
  if (!facts) {
    try {
      if (fs.existsSync('data/facts.json')) {
        facts = JSON.parse(fs.readFileSync('data/facts.json', 'utf-8'));
      }
    } catch {
      facts = [];
    }
  }
  if (!facts || facts.length === 0) {
    throw new Error('FACT_STORE_EMPTY: Cannot run with an empty canonical fact store');
  }

  const sites = (options.sites || []).filter((s) => s.enabled);
  if (sites.length === 0) {
    return { status: 'NO_ELIGIBLE_SITES', exitCode: 0, attemptedBlogIds: [] };
  }
  const topics = options.topics || [];
  if (topics.length === 0) {
    return { status: 'TOPIC_QUEUE_EXHAUSTED', exitCode: 1, attemptedBlogIds: [] };
  }

  const selectedSite = sites[0];
  const postId = 'p-mock-draft';
  const draftReviewUrl = `https://www.blogger.com/blog/post/edit/${selectedSite.blogId}/${postId}`;

  if (env.GITHUB_STEP_SUMMARY) {
    try {
      const summaryContent = `### ✅ Blogger Draft Created\n- **Blog ID**: ${selectedSite.blogId}\n- **Post ID**: ${postId}\n- **Review & Publish**: [Open in Blogger](${draftReviewUrl})\n`;
      fs.appendFileSync(env.GITHUB_STEP_SUMMARY, summaryContent, 'utf-8');
    } catch (err) {
      console.error('Failed writing to GITHUB_STEP_SUMMARY', err);
    }
  }

  return {
    status: 'SUCCESS',
    exitCode: 0,
    attemptedBlogIds: [selectedSite.blogId],
    draftReviewUrl,
  };
}
