import { getCurrentFacts, getRenderablePackages } from './package-catalog-runtime';
import type { CatalogFact, PackageCatalog, PackageRecord } from './package-catalog-runtime';
import type { TelecomPackage } from '../types';

export interface VerifiedPackage extends Pick<TelecomPackage,
  'price' | 'duration' | 'dataLimit' | 'dataPerDay' | 'description' | 'rules' | 'registrationEligible' | 'status'> {
  id: string;
  code: string;
  name: string;
  category: PackageRecord['category'];
  priceVnd: number;
  durationDays: number;
  dataAllowance?: string;
  benefits: string[];
  eligibility: string[];
  registration?: {
    syntax: string;
    smsNumber: 290;
    channel: 'sms';
  };
  updatedAt: string;
  priceValidUntil: string;
  sourceUrl: string;
}

function exactlyOneFact(facts: readonly CatalogFact[], key: string): CatalogFact | undefined {
  const matches = facts.filter((fact) => fact.key === key);
  return matches.length === 1 ? matches[0] : undefined;
}

function positiveNumber(fact: CatalogFact | undefined): number | undefined {
  return typeof fact?.value === 'number' && Number.isFinite(fact.value) && fact.value > 0
    ? fact.value
    : undefined;
}

function nonEmptyText(fact: CatalogFact | undefined): string | undefined {
  return typeof fact?.value === 'string' && fact.value.trim().length > 0
    ? fact.value.trim()
    : undefined;
}

function factTexts(facts: readonly CatalogFact[], key: string): string[] {
  return facts
    .filter((fact) => fact.key === key)
    .flatMap((fact) => nonEmptyText(fact) ?? []);
}

function toVerifiedPackage(pkg: PackageRecord, catalog: PackageCatalog, now: Date): VerifiedPackage | null {
  const facts = getCurrentFacts(pkg, catalog, now);
  const priceFact = exactlyOneFact(facts, 'priceVnd');
  const durationFact = exactlyOneFact(facts, 'durationDays');
  const priceVnd = positiveNumber(priceFact);
  const durationDays = positiveNumber(durationFact);
  const dataAllowance = nonEmptyText(exactlyOneFact(facts, 'dataAllowance'));
  const dataPerDay = nonEmptyText(exactlyOneFact(facts, 'dataPerDay'));
  const benefits = factTexts(facts, 'benefit');
  const eligibility = factTexts(facts, 'eligibility');

  // Core commercial facts are required to render a card. Optional benefit/eligibility copy is
  // included only while separately current; stale optional facts must not make a still-current
  // official package summary disappear from the catalog.
  if (!priceFact || !priceVnd || !durationDays || (!dataAllowance && !dataPerDay)) return null;

  // getRenderablePackages is Task 1's single authority for status, current facts, and exact normalized registration evidence.
  const registration = pkg.registration
    ? { syntax: pkg.registration.syntax, smsNumber: 290 as const, channel: 'sms' as const }
    : undefined;
  const dataLimit = dataAllowance ?? dataPerDay!;

  return {
    id: pkg.id,
    code: pkg.code,
    name: pkg.display.name,
    category: pkg.category,
    priceVnd,
    durationDays,
    ...(dataAllowance ? { dataAllowance } : {}),
    ...(dataPerDay ? { dataPerDay } : {}),
    benefits,
    eligibility,
    ...(registration ? { registration } : {}),
    updatedAt: priceFact.retrievedAt,
    priceValidUntil: priceFact.expiresAt,
    sourceUrl: priceFact.sourceUrl,
    price: priceVnd,
    duration: `${durationDays} ngày`,
    dataLimit,
    description: [pkg.display.name, `${priceVnd} VND`, `${durationDays} days`, dataLimit].join(' · '),
    rules: eligibility,
    registrationEligible: Boolean(registration),
    status: pkg.status,
  };
}

/** Returns only packages accepted by Task 1's current, complete public-offer gate. */
export function getVerifiedPackages(catalog: PackageCatalog, now = new Date()): VerifiedPackage[] {
  return getRenderablePackages(catalog, now).flatMap((pkg) => {
    const verified = toVerifiedPackage(pkg, catalog, now);
    return verified ? [verified] : [];
  });
}
