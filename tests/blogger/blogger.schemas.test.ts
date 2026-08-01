import { describe, expect, it } from 'vitest';
import { parseBloggerSites } from '../../packages/connectors/blogger/blogger.schemas';

describe('Blogger site configuration', () => {
  it('rejects more than three configured sites', () => {
    expect(() => parseBloggerSites({ sites: Array.from({ length: 4 }, (_, i) => ({
      blogId: String(i), name: `Site ${i}`, enabled: false, cadenceDays: 7,
      contentCharter: 'Independent informational content', allowedDestination: 'tracuugoicuoc.com'
    })) })).toThrow(/maximum of 3/i);
  });
});
