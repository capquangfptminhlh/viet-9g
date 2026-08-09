import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ALLOWED_DISPOSITIONS = new Set(['keep', 'improve', 'canonicalize', 'noindex', '301']);
const REQUIRED_HEADERS = ['source', 'target', 'disposition', 'intentMatch', 'ownerApproved', 'notes'];

type Row = Record<string, string>;

function parseCsv(contents: string): Row[] {
  const rows: string[][] = [];
  let field = '';
  let row: string[] = [];
  let quoted = false;
  for (let index = 0; index < contents.length; index += 1) {
    const character = contents[index];
    if (character === '"') {
      if (quoted && contents[index + 1] === '"') { field += '"'; index += 1; }
      else quoted = !quoted;
    } else if (character === ',' && !quoted) { row.push(field); field = ''; }
    else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && contents[index + 1] === '\n') index += 1;
      row.push(field); field = '';
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
    } else field += character;
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  if (rows.length === 0) throw new Error('URL disposition CSV is empty.');
  const [headers, ...data] = rows;
  if (headers.join(',') !== REQUIRED_HEADERS.join(',')) throw new Error(`Expected headers: ${REQUIRED_HEADERS.join(',')}`);
  return data.map((values, rowIndex) => {
    if (values.length !== headers.length) throw new Error(`Row ${rowIndex + 2} has ${values.length} columns; expected ${headers.length}.`);
    return Object.fromEntries(headers.map((header, index) => [header, values[index].trim()]));
  });
}

export function validateUrlDisposition(file: string): void {
  const rows = parseCsv(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
  for (const [index, row] of rows.entries()) {
    const label = `Row ${index + 2}`;
    if (!row.source) throw new Error(`${label}: source is required.`);
    if (!ALLOWED_DISPOSITIONS.has(row.disposition)) throw new Error(`${label}: disposition must be one of ${[...ALLOWED_DISPOSITIONS].join(', ')}.`);
    if (row.disposition === '301') {
      if (!row.target) throw new Error(`${label}: 301 requires target.`);
      if (row.intentMatch !== 'true') throw new Error(`${label}: 301 requires intentMatch=true.`);
      if (row.ownerApproved !== 'true') throw new Error(`${label}: 301 requires ownerApproved=true.`);
    }
  }
}

const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === currentFile) {
  const root = path.resolve(path.dirname(currentFile), '..');
  const file = process.argv[2] ? path.resolve(process.argv[2]) : path.join(root, 'docs', 'reviews', 'url-disposition.csv');
  validateUrlDisposition(file);
  console.log(`Validated URL disposition: ${file}`);
}
