#!/usr/bin/env node
// Browser-measured mobile release regression. Uses the exact built Astro preview.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const playwrightLocation = process.env.PLAYWRIGHT_MODULE_PATH;
assert(playwrightLocation, 'HOLD: global browser test module path not set');
const { chromium } = require(playwrightLocation);

const origin = process.env.SITE_PREVIEW_ORIGIN || 'http://127.0.0.1:4321';
const browser = await chromium.launch({ headless: true });
const records = [];

async function verify(path, ctas, imageRequired, expectedImage = null) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  try {
    const response = await page.goto(origin + path, { waitUntil: 'domcontentloaded', timeout: 60000 });
    assert(response?.ok(), 'HOLD: page did not respond HTTP 2xx: ' + path + ' (HTTP ' + response?.status() + ')');
    await page.locator('h1').first().waitFor({ state: 'visible', timeout: 20000 });
    const observed = await page.evaluate(({ctaSpecs, requireImage}) => {
      const a = Array.from(document.querySelectorAll('a'));
      const actions = ctaSpecs.map(spec => {
        const match = a.find(el => el.textContent?.includes(spec.label) && (spec.href ? el.getAttribute('href') === spec.href : new URL(el.href).pathname === spec.pathname));
        if (!match) return { label: spec.label, found: false };
        match.scrollIntoView({ block: 'center' });
        const box = match.getBoundingClientRect();
        return { label: spec.label, found: true, width: box.width, height: box.height,
                 visible: box.width > 0 && box.height > 0 && getComputedStyle(match).visibility !== 'hidden' };
      });
      const article = document.querySelector('article');
      const hero = article?.previousElementSibling?.querySelector('img') || document.querySelector('img[src*="5gip200-info"]');
      return {
        viewportWidth: innerWidth, viewportHeight: innerHeight,
        documentWidth: document.documentElement.scrollWidth,
        h1: document.querySelector('h1')?.textContent?.trim(),
        hero: requireImage ? { found: Boolean(hero), complete: Boolean(hero?.complete), naturalWidth: hero?.naturalWidth || 0, src: hero?.getAttribute('src'), objectFit: hero ? getComputedStyle(hero).objectFit : null } : null,
        ctas: actions,
      };
    }, { ctaSpecs: ctas, requireImage: imageRequired });
    assert.equal(observed.viewportWidth, 390, 'HOLD: actual browser viewport differs from 390px');
    assert.equal(observed.viewportHeight, 844, 'HOLD: actual browser viewport differs from 844px');
    assert(observed.documentWidth <= 390, 'HOLD: horizontal overflow of ' + (observed.documentWidth - 390) + 'px on ' + path);
    assert(observed.h1?.length > 5, 'HOLD: missing rendered H1');
    for (const action of observed.ctas) {
      assert(action.found && action.visible, 'HOLD: missing or invisible CTA ' + action.label);
      assert(action.height >= 48, 'HOLD: CTA ' + action.label + ' measured only ' + action.height + 'px');
    }
    if (imageRequired) {
      assert(observed.hero?.found && observed.hero?.complete && observed.hero?.naturalWidth > 0,
        'HOLD: editorial hero image did not actually render');
    }
    if (expectedImage) {
      assert.equal(observed.hero?.src, expectedImage, 'HOLD: wrong original illustration in article hero');
      assert.equal(observed.hero?.objectFit, 'contain', 'HOLD: original article image is being cropped');
    }
    records.push({ path, status: 'PASS', ...observed });
    return page;
  } catch (error) {
    records.push({ path, status: 'HOLD', error: String(error) });
    throw error;
  } finally {
    await page.close();
  }
}

try {
  await verify('/posts/5gip200-viettel-iphone', [
    { label: 'Xem danh mục gói', pathname: '/goi-cuoc' },
    { label: 'Xem tất cả hướng dẫn Viettel', pathname: '/tin-tuc' },
    { label: 'Gọi tổng đài Viettel', href: 'tel:18008098' },
  ], true);
  await verify('/posts/iphone-viettel-khong-thay-cuoc-goi-wifi-calling', [
    { label: 'Xem danh mục gói', pathname: '/goi-cuoc' },
    { label: 'Xem tất cả hướng dẫn Viettel', pathname: '/tin-tuc' },
    { label: 'Gọi tổng đài Viettel', href: 'tel:18008098' },
  ], true);
  await verify('/tin-tuc', [
    { label: 'Đọc chi tiết', pathname: '/posts/5gip200-viettel-iphone' },
    { label: 'Về trang tra cứu gói cước', pathname: '/' },
  ], false);
  const base = process.env.PR_BASE_SHA;
  const head = process.env.PR_HEAD_SHA;
  if (base && head) {
    const changed = execFileSync('git', [
      'diff', '--name-only', '--diff-filter=AM', base, head, '--', 'src/content/posts',
    ], { encoding: 'utf8' }).split(/\r?\n/u).filter(file => file.endsWith('.md'));
    assert(changed.length <= 1, 'HOLD: only one editorial article per PR');
    if (changed.length === 1) {
      const slug = changed[0].split('/').at(-1).replace(/\.md$/u, '');
      await verify('/posts/' + slug, [
        { label: 'Xem danh mục gói', pathname: '/goi-cuoc' },
        { label: 'Xem tất cả hướng dẫn Viettel', pathname: '/tin-tuc' },
      ], true, '/images/editorial/' + slug + '.svg');
    }
  }
} finally {
  await browser.close();
  mkdirSync('.website-os/out', { recursive: true });
  writeFileSync('.website-os/out/mobile-390x844.json', JSON.stringify({
    observed_at: new Date().toISOString(), origin, viewport: { width: 390, height: 844 }, records,
  }, null, 2) + '\n');
}
console.log('MOBILE_BROWSER_QA_PASS', JSON.stringify(records));
