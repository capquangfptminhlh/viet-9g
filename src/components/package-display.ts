import type { VerifiedPackage } from '../data/verified-package';

function parseDailyGigabytes(value?: string): number | undefined {
  if (!value) return undefined;
  const match = value.match(/(\d+(?:[.,]\d+)?)\s*(GB|MB)\b/i);
  if (!match) return undefined;
  const amount = Number.parseFloat(match[1].replace(',', '.'));
  if (!Number.isFinite(amount)) return undefined;
  return match[2].toUpperCase() === 'MB' ? amount / 1024 : amount;
}

export function getVerifiedDataDisplay(pkg: Pick<VerifiedPackage, 'dataAllowance' | 'dataPerDay'>): {
  primary: string;
  dailyDataValue: number | undefined;
} {
  return {
    primary: pkg.dataAllowance ?? pkg.dataPerDay ?? 'Thông tin data đang cập nhật',
    dailyDataValue: parseDailyGigabytes(pkg.dataPerDay),
  };
}
