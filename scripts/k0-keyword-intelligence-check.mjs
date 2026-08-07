import { validateK0DecisionFile } from '../packages/content-engine/k0-gate.ts';

const decisionPath = process.argv[2] || 'state/k0-decision.json';

const result = validateK0DecisionFile(decisionPath);
if (!result.ok) {
  console.error(`K0_HOLD: ${result.reasons.join('; ')}`);
  process.exit(1);
}

console.log('K0_PASS: keyword-intelligence decision approved');
