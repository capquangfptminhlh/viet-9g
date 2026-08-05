import { z } from 'zod';

const isoDate = z.string().refine((value) => {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && /^\d{4}-\d{2}-\d{2}(?:T|$)/.test(value);
}, 'must be an ISO date or datetime');

const isoDateTime = z.string().refine((value) => {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && /^\d{4}-\d{2}-\d{2}T/.test(value);
}, 'must be an ISO datetime');

export const CatalogFactSchema = z.object({
  id: z.string().min(1),
  key: z.enum([
    'priceVnd',
    'durationDays',
    'dataAllowance',
    'dataPerDay',
    'benefit',
    'eligibility',
    'checkingInstruction',
    'renewalInstruction',
    'cancellationInstruction',
    'registrationSyntax',
  ]),
  value: z.union([z.string(), z.number().positive(), z.boolean()]),
  unit: z.string().optional(),
  claim: z.string().min(1),
  sourceUrl: z.url(),
  retrievedAt: isoDateTime,
  effectiveAt: isoDate,
  expiresAt: isoDateTime,
});
export const FactSchema = CatalogFactSchema;

export const PackageDisplaySchema = z.looseObject({
  name: z.string().min(1),
  description: z.string(),
  benefits: z.array(z.string()).optional(),
  eligibility: z.array(z.string()).optional(),
});

export const PackageRegistrationSchema = z.object({
  syntax: z.string().min(1),
  smsNumber: z.union([z.literal(290), z.literal('290')]),
  channel: z.literal('sms'),
  factId: z.string().min(1).optional(),
}).superRefine((registration, ctx) => {
  if (!/\bGB\b/.test(registration.syntax)) {
    ctx.addIssue({ code: 'custom', path: ['syntax'], message: 'registration syntax must include GB' });
  }
});

export const PackageSchema = z.looseObject({
  id: z.string().regex(/^[a-z0-9-]+$/),
  code: z.string().min(1),
  status: z.enum(['active', 'eligibility_required', 'hold', 'retired', 'unverified', 'operator_verified']),
  category: z.enum(['hot', 'data', 'social', 'combo', 'long_term']),
  factIds: z.array(z.string().min(1)),
  display: PackageDisplaySchema,
  registration: PackageRegistrationSchema.optional(),
  facts: z.array(CatalogFactSchema).default([]),
});

export const PackageCatalogSchema = z.object({
  schemaVersion: z.literal('1.0.0'),
  catalogVersion: z.string().min(1),
  generatedAt: isoDateTime,
  sourceSnapshot: z.record(z.string(), z.unknown()).optional(),
  facts: z.array(CatalogFactSchema).default([]),
  packages: z.array(PackageSchema),
});

export type CatalogFact = z.infer<typeof CatalogFactSchema>;
export type PackageRecord = z.infer<typeof PackageSchema>;
export type PackageCatalog = z.infer<typeof PackageCatalogSchema>;
