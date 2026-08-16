import fs from 'node:fs';
import path from 'node:path';

type RedirectRule = {
  source: string;
  destination: string;
  permanent?: boolean;
};

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function normalizePath(value: string): string {
  if (!value.startsWith('/') || value === '/') return value;
  const hashIndex = value.indexOf('#');
  const queryIndex = value.indexOf('?');
  const cutAt = [hashIndex, queryIndex].filter((index) => index >= 0).sort((a, b) => a - b)[0] ?? value.length;
  const pathname = safeDecode(value.slice(0, cutAt));
  const suffix = value.slice(cutAt);
  return `${pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname}${suffix}`;
}

function loadRedirects(): RedirectRule[] {
  const file = path.resolve('vercel.json');
  if (!fs.existsSync(file)) return [];
  const config = JSON.parse(fs.readFileSync(file, 'utf8')) as { redirects?: RedirectRule[] };
  return Array.isArray(config.redirects) ? config.redirects : [];
}

export function resolveCanonicalTargetPath(value: string, redirects: RedirectRule[] = loadRedirects()): string {
  let current = normalizePath(value);
  const visited = new Set<string>();

  for (let depth = 0; depth < 8; depth += 1) {
    if (!current.startsWith('/') || visited.has(current)) break;
    visited.add(current);
    const rule = redirects.find((item) => normalizePath(item.source) === current);
    if (!rule || !rule.destination.startsWith('/')) break;
    current = normalizePath(rule.destination);
  }

  return current;
}

export { normalizePath };
