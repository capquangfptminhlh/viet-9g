import { getCurrentFacts } from './package-catalog-runtime';
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
  dataAllowance: string;
  dataPerDay: string;
  benefits: string[];
  eligibility: string[];
  registration?: {
    syntax: string;
    smsNumber: 290 | '290';
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

function verifiedRegistration(pkg: PackageRecord, facts: readonly CatalogFact[]): VerifiedPackage['registration'] {
  if (!pkg.registration?.factId || !pkg.factIds.includes(pkg.registration.factId)) return undefined;
  const fact = facts.find((item) => item.id === pkg.registration!.factId);
  const syntax = nonEmptyText(fact);
  if (fact?.key !== 'registrationSyntax' || syntax !== pkg.registration.syntax.trim()) return undefined;

  return {
    syntax: pkg.registration.syntax,
    smsNumber: pkg.registration.smsNumber,
    channel: pkg.registration.channel,
  };
}

function toVerifiedPackage(pkg: PackageRecord, catalog: PackageCatalog, now: Date): VerifiedPackage | null {
  if (!['active', 'eligibility_required'].includes(pkg.status)) return null;

  const facts = getCurrentFacts(pkg, catalog, now);
  const priceFact = exactlyOneFact(facts, 'priceVnd');
  const durationFact = exactlyOneFact(facts, 'durationDays');
  const dataAllowanceFact = exactlyOneFact(facts, 'dataAllowance');
  const priceVnd = positiveNumber(priceFact);
  const durationDays = positiveNumber(durationFact);
  const dataAllowance = nonEmptyText(dataAllowanceFact);
  const benefits = factTexts(facts, 'benefit');
  const eligibility = factTexts(facts, 'eligibility');

  if (!priceVnd || !durationDays || !dataAllowance || benefits.length === 0 || eligibility.length === 0 || !priceFact) return null;

  const dataPerDay = nonEmptyText(exactlyOneFact(facts, 'dataPerDay'));
  const registration = verifiedRegistration(pkg, facts);
  if (!dataPerDay) return null;

  return {
    id: pkg.id,
    code: pkg.code,
    name: pkg.display.name,
    category: pkg.category,
    priceVnd,
    durationDays,
    dataAllowance,
    dataPerDay,
    benefits,
    eligibility,
    ...(registration ? { registration } : {}),
    updatedAt: priceFact.retrievedAt,
    priceValidUntil: priceFact.expiresAt,
    sourceUrl: priceFact.sourceUrl,
    price: priceVnd,
    duration: `${durationDays} ngày`,
    dataLimit: dataAllowance,
    description: 'Current offer facts verified from source.',
    rules: eligibility,
    registrationEligible: Boolean(registration),
    status: pkg.status,
  };
}

/** Returns only packages whose every customer-facing offer field is current, sourced fact data. */
export function getVerifiedPackages(catalog: PackageCatalog, now = new Date()): VerifiedPackage[] {
  return catalog.packages.flatMap((pkg) => {
    const verified = toVerifiedPackage(pkg, catalog, now);
    return verified ? [verified] : [];
  });
}
