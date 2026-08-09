import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export type EditorialAudit = {
  slug: string;
  title: string;
  wordCount: number;
  headings: string[];
  imageCount: number;
  outboundLinks: string[];
  packageCodes: string[];
  hasRegistrationCta: boolean;
};

function markdownText(markdown: string): string {
  return markdown
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/[|*_~>#]/g, ' ');
}

function wordCount(markdown: string): number {
  return (markdownText(markdown).match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) ?? []).length;
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right, 'en'));
}

export function auditEditorialContent(postsDirectory: string): EditorialAudit[] {
  return fs.readdirSync(postsDirectory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => {
      const slug = path.basename(entry.name, '.md');
      const markdown = fs.readFileSync(path.join(postsDirectory, entry.name), 'utf8');
      const headings = [...markdown.matchAll(/^\s{0,3}#{1,6}\s+(.+?)\s*#*\s*$/gm)]
        .map((match) => match[1].trim());
      const outboundLinks = uniqueSorted([...markdown.matchAll(/(?<!!)\[[^\]]*\]\(([^)]+)\)/g)]
        .map((match) => match[1].trim())
        .filter((url) => /^https?:\/\//i.test(url)));
      const packageCodes = uniqueSorted(markdown.match(/\b[A-Z]{1,5}\d{1,4}[A-Z]?\b/g) ?? []);

      return {
        slug,
        title: headings[0] ?? slug,
        wordCount: wordCount(markdown),
        headings,
        imageCount: [...markdown.matchAll(/!\[[^\]]*\]\([^)]+\)/g)].length,
        outboundLinks,
        packageCodes,
        hasRegistrationCta: /(?:đăng\s*ký|soạn\s+tin|cú\s+pháp)[\s\S]{0,120}(?:gửi\s*)?(?:đến\s*)?(?:đầu\s*số\s*)?290|(?:gửi\s*)?(?:đến\s*)?(?:đầu\s*số\s*)?290[\s\S]{0,120}(?:đăng\s*ký|soạn\s+tin|cú\s+pháp)/iu.test(markdown),
      };
    })
    .sort((left, right) => left.slug.localeCompare(right.slug, 'en'));
}

export function writeEditorialInventory(postsDirectory: string, outputFile: string): EditorialAudit[] {
  const audit = auditEditorialContent(postsDirectory);
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, `${JSON.stringify(audit, null, 2)}\n`, 'utf8');
  return audit;
}

const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === currentFile) {
  const root = path.resolve(path.dirname(currentFile), '..');
  const audit = writeEditorialInventory(
    path.join(root, 'src', 'content', 'posts'),
    path.join(root, 'docs', 'reviews', 'editorial-content-inventory.json'),
  );
  console.log(`Audited ${audit.length} local Markdown posts.`);
}
