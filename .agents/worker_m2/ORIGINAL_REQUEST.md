## 2026-07-29T13:22:19Z

You are a Worker subagent for Milestone 2 (Mobile UX & Performance Optimization).
Your working directory for metadata is D:\Du_Lieu_O_C_Chuyen_Sang\Codex\2026-06-12\t-i-mu-n-k-t\work\viettel-data-extracted\.agents\worker_m2 (create directory if needed).
The project root directory is D:\Du_Lieu_O_C_Chuyen_Sang\Codex\2026-06-12\t-i-mu-n-k-t\work\viettel-data-extracted.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Task:
Read Explorer M2 handoff report at D:\Du_Lieu_O_C_Chuyen_Sang\Codex\2026-06-12\t-i-mu-n-k-t\work\viettel-data-extracted\.agents\explorer_m2\handoff.md and analysis report at D:\Du_Lieu_O_C_Chuyen_Sang\Codex\2026-06-12\t-i-mu-n-k-t\work\viettel-data-extracted\.agents\explorer_m2\analysis.md.

Implement all Milestone 2 Mobile UX & Performance requirements:
1. Static image optimization & WebP: Check if any static image assets exist in the codebase. Convert/provide `.webp` versions or update image elements/references to ensure `.webp` format and optimal mobile loading.
2. Mobile CSS/Tailwind & Tap Targets (>= 48px):
   - Modify `src/components/Header.tsx`: Update mobile menu toggle button, Zalo button, Hotline button, and mobile menu links with `min-h-[48px]`, `min-w-[48px]`, `py-3`, `px-4`, `flex items-center justify-center` so that tap target dimensions are at least 48px.
   - Modify `src/components/PackageCard.tsx`: Update "Chi Tiết" and "Đăng Ký" action buttons with `min-h-[48px]`, `py-3`, `px-4`, `flex items-center justify-center`.
   - Modify `src/components/FaqAccordion.tsx`: Confirm/update accordion trigger buttons with `min-h-[48px]`, `py-4`, `px-5`.
   - Also update `src/components/HeroCarousel.tsx` and `src/components/PackageModal.tsx` interactive CTA buttons (SMS, Hotline, Zalo, Copy, Tabs) to guarantee minimum 48px tap targets across mobile interface.
3. Verification:
   - Run `npm run lint` (TypeScript typecheck).
   - Run `npm run build` (`vite build`) and verify it compiles cleanly without any errors and writes output to `dist/`.
   - Write automated verification script in `.agents/worker_m2/verify_m2.js` to inspect rendered component classes or DOM attributes for >= 48px tap targets.
4. Write `changes.md` and `handoff.md` in `.agents/worker_m2` and report back to orchestrator via `send_message`.
