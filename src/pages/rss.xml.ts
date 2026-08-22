import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

export const prerender = true;

const SITE = 'https://www.tracuugoicuoc.com';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function titleFromSlug(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toLocaleUpperCase('vi-VN') + part.slice(1))
    .join(' ');
}

export const GET: APIRoute = async () => {
  const posts = await getCollection('posts');
  const items = posts
    .slice()
    .sort((a, b) => (b.data.date?.getTime() ?? 0) - (a.data.date?.getTime() ?? 0))
    .map((post) => {
      const url = new URL(`/posts/${post.slug}`, SITE).href;
      const title = post.data.title ?? titleFromSlug(post.slug);
      const description = post.data.description ?? `Bài hướng dẫn ${title} trên TraCuuGoiCuoc.com.`;
      const pubDate = post.data.date ? `<pubDate>${post.data.date.toUTCString()}</pubDate>` : '';

      return [
        '<item>',
        `<title>${escapeXml(title)}</title>`,
        `<link>${escapeXml(url)}</link>`,
        `<guid isPermaLink="true">${escapeXml(url)}</guid>`,
        pubDate,
        `<description>${escapeXml(description)}</description>`,
        '</item>',
      ].filter(Boolean).join('\n');
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>Tra Cứu Gói Cước Viettel</title>
<link>${SITE}</link>
<description>Thông tin gói cước và hướng dẫn Viettel có canonical hiện hành trên TraCuuGoiCuoc.com.</description>
<language>vi-VN</language>
<atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml" />
${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600',
    },
  });
};
