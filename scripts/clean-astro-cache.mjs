import { rmSync } from 'node:fs';
import { resolve } from 'node:path';

const astroDir = resolve('.astro');
rmSync(astroDir, { recursive: true, force: true });
console.log(`[build] Cleared Astro generated cache: ${astroDir}`);
