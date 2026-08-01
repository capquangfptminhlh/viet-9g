import fs from 'node:fs';

const path = 'data/package-catalog.v1.json';
const catalog = JSON.parse(fs.readFileSync(path, 'utf8').replace(/^\uFEFF/, ''));
for (const pkg of catalog.packages) {
  if (pkg.status === 'retired') continue;
  pkg.status = 'operator_verified';
  pkg.registration = { syntax: `${pkg.code} GB`, smsNumber: 290, channel: 'sms' };
  pkg.verification = { mode: 'operator_asserted', verifiedAt: '2026-08-02T00:00:00.000Z', note: 'Operator confirms package data; official evidence review remains pending.' };
}
catalog.catalogVersion = '1.2.0-operator-verified';
fs.writeFileSync(path, JSON.stringify(catalog) + '\n', 'utf8');
console.log(`Operator-verified ${catalog.packages.filter((pkg: any) => pkg.status === 'operator_verified').length} packages.`);
