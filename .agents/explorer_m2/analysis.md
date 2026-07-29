# Detailed Analysis Report — Milestone 2 (Mobile UX & Performance Optimization)

## 1. Static Images & WebP Conversion Strategy

### Scan Results
- **Directory Scope**: Checked `public/`, `src/assets/`, `assets/`, `scripts/`, `src/`, root directory.
- **Static Image Files Found**: **0 files**.
  - No `.png`, `.jpg`, `.jpeg`, `.webp`, `.gif`, or `.svg` asset files exist in the repository filesystem.
  - Icons across the app (`Header`, `PackageCard`, `FaqAccordion`, `Footer`, `HeroCarousel`, `SimLookup`, `PackageModal`) are rendered via vector SVG components from `lucide-react` or inline JSX `<svg>`.
  - External network image URLs detected:
    1. `PackageModal.tsx` (line 171): QR Code dynamic API endpoint (`https://api.qrserver.com/v1/create-qr-code/...`).
    2. `index.html` (line 15): Meta OpenGraph tag reference (`https://tracuugoicuoc.com/og-image.jpg`).

### Recommended WebP Conversion Approach & Tooling
If future static raster image assets are added (e.g. promotional banners, hero graphics, meta images):
- **Build-time Automated Optimization (Recommended)**:
  - Install `vite-plugin-image-optimizer` or `sharp` in `package.json`.
  - Configure `vite.config.ts` to automatically convert `.png`/`.jpg` images to compressed `.webp` format during `npm run build`.
- **CLI / Standalone Tooling**:
  - `sharp` (Node.js script): `sharp('input.png').toFormat('webp', { quality: 80 }).toFile('output.webp')`
  - `cwebp` (libwebp CLI): `cwebp -q 80 input.jpg -o output.webp`
  - `imagemagick` CLI: `magick convert input.png -quality 80 output.webp`

---

## 2. Component Structure Analysis (`Header`, `PackageCard`, `FaqAccordion`)

### `Header.tsx` (`src/components/Header.tsx` - 217 lines)
- **Role**: Main sticky header navigation with top announcement bar, brand logo, search bar, quick Zalo/Hotline buttons, desktop category menu, and mobile collapsible drawer.
- **Root Element**: `<header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">`
- **Sub-blocks**:
  1. Top Bar: `<div className="bg-[#D71920] text-white text-[11px] sm:text-xs">` (Height: 32px / `h-8`).
  2. Main Bar: `<div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">`.
  3. Search Bar: Desktop input `py-1.5 text-xs rounded-full bg-gray-50`.
  4. Quick Support: Zalo button (`px-3 py-1 bg-red-50 text-[#D71920] text-xs font-semibold rounded-full border border-red-100`) and Hotline link (`tel:...`).
  5. Navigation Bar (Desktop): `<nav className="hidden md:block bg-[#D71920]">` with `h-10` list items.
  6. Mobile Menu Drawer: Collapsible `<div>` containing search input, category list buttons (`w-full text-left px-5 py-3`), and full-width Zalo/Hotline CTA buttons (`w-full py-2`).

### `PackageCard.tsx` (`src/components/PackageCard.tsx` - 181 lines)
- **Role**: Individual package card component rendering price, data quota, voice benefits, social media badges, and action buttons.
- **Root Element**: `<article className="bg-white rounded-lg border border-gray-200 hover:border-[#D71920] shadow-2xs hover:shadow-xs transition-all duration-350 flex flex-col justify-between overflow-hidden relative group">`
- **Sub-blocks**:
  1. Top Badge: "Hot Nhất" gradient banner if `pkg.popular` is true.
  2. Card Header: Category badge (`getCategoryBadge()`) and duration (`pkg.duration`).
  3. Pricing & Name: Package name (`h3 text-[#D71920] font-mono text-xl sm:text-2xl`) and formatted price (`pkg.price.toLocaleString('vi-VN')` + daily cost estimation).
  4. Quota Box: `py-2.5 px-3 bg-slate-50 rounded-lg space-y-1.5 border border-gray-150` displaying Total Data, High-Speed Data, and Call allowances.
  5. Social Application Badges: YouTube, TikTok, Facebook, Messenger pill badges.
  6. Action Footer: `<div className="p-3 bg-slate-50 border-t border-gray-150 flex items-center gap-2 shrink-0">` with two flex-1 buttons ("Chi Tiết" and "Đăng Ký").

### `FaqAccordion.tsx` (`src/components/FaqAccordion.tsx` - 76 lines)
- **Role**: Interactive FAQ section with collapsible question cards.
- **Root Element**: `<section id="faq" className="max-w-7xl mx-auto px-4 py-12">`
- **Sub-blocks**:
  1. Header: Icon, title "Giải Đáp Thắc Mắc Thường Gặp", and subtitle description.
  2. Accordion Container: Renders `FAQS` list. Each card uses `<button type="button" onClick={() => toggleAccordion(index)} className="w-full text-left px-5 py-4 sm:py-5 flex items-start justify-between gap-4 font-bold text-gray-850 text-sm sm:text-base cursor-pointer focus:outline-none focus:bg-gray-50 transition-colors">`.
  3. Expanded Answer: `<div className="px-5 pb-5 sm:pb-6 pl-13 text-xs sm:text-sm text-gray-650 leading-relaxed border-t border-gray-100 pt-3 animate-fade-in whitespace-pre-line">`.

---

## 3. Interactive Button Touch Target Audit & Fix Proposal (Requirement >= 48px)

### Audit Findings
| Component | Element | Current Class / Style | Current Height/Size | Target Standard | Fix Required |
|---|---|---|---|---|---|
| `Header.tsx` | Mobile Menu Toggle Button | `p-2 rounded-lg` with `w-5 h-5` icon | ~36px x 36px | >= 48px x 48px | Change to `p-3 min-w-[48px] min-h-[48px] flex items-center justify-center` |
| `Header.tsx` | Top Bar Hotline Link | `h-8 flex items-center` (`text-[11px]`) | 32px height | >= 48px height | Change top bar height or add `min-h-[48px] flex items-center` for touch target |
| `Header.tsx` | Mobile Menu Zalo Button | `w-full py-2 bg-blue-600` | ~36px height | >= 48px height | Change to `w-full py-3.5 min-h-[48px] flex items-center justify-center` |
| `Header.tsx` | Mobile Menu Hotline Button | `w-full py-2 bg-[#D71920]` | ~36px height | >= 48px height | Change to `w-full py-3.5 min-h-[48px] flex items-center justify-center` |
| `Header.tsx` | Mobile Nav Category Items | `w-full text-left px-5 py-3` | ~44px height | >= 48px height | Change to `w-full text-left px-5 py-3.5 min-h-[48px] flex items-center justify-between` |
| `PackageCard.tsx` | "Chi Tiết" Button | `flex-1 py-1.5 bg-white` | ~32px height | >= 48px height | Change to `flex-1 py-3 min-h-[48px] flex items-center justify-center` |
| `PackageCard.tsx` | "Đăng Ký" Button | `flex-1 py-1.5 bg-[#D71920]` | ~32px height | >= 48px height | Change to `flex-1 py-3 min-h-[48px] flex items-center justify-center` |
| `HeroCarousel.tsx` | "Đăng Ký Ngay" Button | `px-5 py-2 bg-yellow-400` | ~36px height | >= 48px height | Change to `px-5 py-3 min-h-[48px] flex items-center justify-center` |
| `HeroCarousel.tsx` | "Hỏi Đại Lý" Zalo Button | `px-4 py-2 bg-white/10` | ~36px height | >= 48px height | Change to `px-4 py-3 min-h-[48px] flex items-center justify-center` |
| `HeroCarousel.tsx` | Arrow Nav Buttons | `p-1.5 rounded-full` | ~30px x 30px | >= 48px x 48px | Change to `p-3 min-w-[48px] min-h-[48px] flex items-center justify-center` |
| `PackageModal.tsx` | Tab Selector Buttons | `py-2.5 px-2.5` | ~38px height | >= 48px height | Change to `py-3.5 px-2.5 min-h-[48px] flex items-center justify-center` |
| `PackageModal.tsx` | "Sao Chép Cú Pháp" Button | `w-full py-2 px-3` | ~36px height | >= 48px height | Change to `w-full py-3 px-3 min-h-[48px] flex items-center justify-center` |
| `PackageModal.tsx` | "Gửi SMS Đăng Ký Ngay" Link | `w-full py-2 px-3 bg-[#D71920]` | ~36px height | >= 48px height | Change to `w-full py-3 px-3 min-h-[48px] flex items-center justify-center` |
| `Footer.tsx` | Policy Modal Links | Inline text buttons | ~20px height | >= 48px height | Add `py-3 px-2 min-h-[48px] inline-flex items-center` |

---

## 4. Build System & Vite Configuration Analysis

### `package.json` Examination
- **Scripts**:
  - `dev`: `vite --port=3000 --host=0.0.0.0`
  - `build`: `vite build`
  - `preview`: `vite preview`
  - `clean`: `rm -rf dist server.js`
  - `lint`: `tsc --noEmit`
- **Dependencies**: React 19, `@tailwindcss/vite` v4.1.14, `@vitejs/plugin-react` v5.0.4, `lucide-react` v0.546.0, `motion` v12.23.24, `express`, `dotenv`.

### `vite.config.ts` Examination
- Configured with `base: './'`.
- Uses `@tailwindcss/vite` plugin and `@vitejs/plugin-react` plugin.
- Resolves `@` alias to project root (`path.resolve(__dirname, '.')`).
- HMR controlled via `process.env.DISABLE_HMR`.

### `npm run build` Operation & Output
- Command executes `vite build`.
- Vite reads `index.html` entry point, invokes TypeScript compiler and Rollup bundler, processes Tailwind CSS v4 directives, and generates optimized assets.
- Target Output Directory: `dist/`
  - Output files: `dist/index.html`, `dist/assets/index-[hash].js`, `dist/assets/index-[hash].css`.
