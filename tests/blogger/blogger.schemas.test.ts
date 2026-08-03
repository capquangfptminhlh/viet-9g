import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseBloggerSites } from '../../packages/connectors/blogger/blogger.schemas';

describe('Blogger site configuration', () => {
  it('rejects more than five configured sites', () => {
    expect(() => parseBloggerSites({ sites: Array.from({ length: 6 }, (_, i) => ({
      blogId: String(i), name: `Site ${i}`, url: `https://site-${i}.example.com`, enabled: false, cadenceDays: 7,
      description: 'Site description', contentCharter: 'Independent informational content', allowedDestination: 'tracuugoicuoc.com'
    })) })).toThrow(/maximum of 5/i);
  });

  it('accepts the five configured Blogger sites with descriptions', () => {
    const config = JSON.parse(fs.readFileSync('config/blogger-sites.json', 'utf8').replace(/^\uFEFF/, ''));
    const parsed = parseBloggerSites(config);
    expect(parsed.sites).toHaveLength(5);
    expect(parsed.sites.every((site) => site.description.length >= 40)).toBe(true);
  });
});
