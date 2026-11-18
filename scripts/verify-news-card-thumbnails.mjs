import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const html = readFileSync('dist/tin-tuc/index.html', 'utf8');
const cards = html.match(/<article\b[^>]*>[\s\S]*?<\/article>/gi) ?? [];
assert(cards.length > 2, 'Built /tin-tuc page has no editorial cards');

for (const card of cards) {
  const img = card.match(/<img\b[^>]*>/i)?.[0];
  assert(img, 'News article card has no thumbnail');
  assert(img.includes('object-contain'), 'News card must preserve full image: ' + img.slice(0, 120));
  assert(!img.includes('object-cover') && !img.includes('scale-105'),
    'News card must not crop or zoom text-based illustration');
}

for (const { slug, expectedImage } of [
  { slug: 'b4-review-15-a', expectedImage: '/images/blogger/b4-review-15-a-62687e31c087.svg' },
  { slug: 'b4-review-15-b', expectedImage: '/images/blogger/b4-review-15-b-7af4073ef629.svg' },
]) {
  const card = cards.find(item => item.includes('href="/posts/' + slug + '"'));
  assert(card, 'Missing indexed news card for ' + slug);
  const img = card.match(/<img\b[^>]*>/i)?.[0];
  assert(img?.includes('src="' + expectedImage + '"'),
    'News card did not select its own original illustration for ' + slug);
  assert(existsSync('dist' + expectedImage),
    'Selected thumbnail missing from published output: ' + expectedImage);
}
console.log('EDITORIAL_CARD_IMAGE_PASS: distinct owned images exist and news card images never crop');
