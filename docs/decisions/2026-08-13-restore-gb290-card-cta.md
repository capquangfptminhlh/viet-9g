# Decision — Restore GB/290 package-card CTA

Date: 2026-08-13
Status: USER_APPROVED_OVERRIDE

The repository owner explicitly requested restoration of the package-card registration action using the repository's locked central registration channel: package code + `GB` sent to `290`.

Scope is intentionally narrow:
- verified package cards only;
- CTA uses `buildSmsUri(pkg.code)` from `src/config/agent-code.ts`;
- no change to package facts, price, allowance, eligibility or canonical URLs;
- the details modal keeps its existing evidence gate for package-specific registration metadata.

This records the user-approved deviation from the prior card behavior that sent packages without per-package registration metadata to the external Viettel site.
