// UTC day windows avoid locale/DST drift in Search Console comparisons.
export function reportWindows(asOf = new Date(), settledLagDays = 2) {
  const midnight = new Date(Date.UTC(asOf.getUTCFullYear(), asOf.getUTCMonth(), asOf.getUTCDate()));
  const shifted = (days) => {
    const value = new Date(midnight);
    value.setUTCDate(value.getUTCDate() - days);
    return value.toISOString().slice(0, 10);
  };
  return {
    current: { startDate: shifted(settledLagDays + 27), endDate: shifted(settledLagDays) },
    previous: { startDate: shifted(settledLagDays + 55), endDate: shifted(settledLagDays + 28) },
  };
}

export function normalizeTotals(row) {
  if (!row || ![row.clicks, row.impressions, row.ctr, row.position].every(Number.isFinite)) {
    return null;
  }
  return {
    clicks: row.clicks,
    impressions: row.impressions,
    ctrPercent: +(row.ctr * 100).toFixed(2),
    averagePosition: +row.position.toFixed(2),
  };
}

export function deltaPercent(current, previous) {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous === 0) return null;
  return +(((current - previous) / previous) * 100).toFixed(2);
}
