import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { parsePackageCatalog } from '../../src/data/package-catalog-runtime';
import { getVerifiedPackages } from '../../src/data/verified-package';
import { activateOfficialPackageFacts } from '../../scripts/activate-official-package-facts';
import { buildPackageCatalog, serializePackageCatalog } from '../../scripts/migrate-package-catalog';

const catalogPath = path.resolve(import.meta.dirname, '../../data/package-catalog.v1.json');

describe('official package fact activation', () => {
  it('publishes the 15 evidence-backed offers without an unsupported partner SMS CTA', () => {
    const catalog = parsePackageCatalog(JSON.parse(fs.readFileSync(catalogPath, 'utf8')));
    const offers = getVerifiedPackages(catalog, new Date('2026-08-09T00:00:00.000Z'));

    expect(offers).toHaveLength(15);
    expect(offers.every((offer) => offer.priceVnd > 0 && offer.durationDays > 0)).toBe(true);
    expect(offers.every((offer) => offer.registration === undefined)).toBe(true);
  });

  it('produces a catalog that stays stable under the project migration check', () => {
    const input = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
    const activated = activateOfficialPackageFacts(input);

    expect(serializePackageCatalog(buildPackageCatalog(activated))).toBe(serializePackageCatalog(activated));
  });
});
