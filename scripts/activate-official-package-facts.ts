import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { CatalogFact, PackageCatalog } from '../src/data/package-catalog.schema';
import { buildPackageCatalog, serializePackageCatalog } from './migrate-package-catalog';

const SOURCE_URL = 'https://098.viettel.vn/tin-tuc/chi-tiet/cap-nhat-2025-cach-dang-ky-goi-cuoc-tra-truoc-viettel-gia-re-moi-nhat/17031500';
const SOURCE_EFFECTIVE_AT = '2025-04-03';
const RETRIEVED_AT = '2026-08-09T00:00:00.000Z';
const EXPIRES_AT = '2026-08-23T00:00:00.000Z';

type OfferSpec = {
  priceVnd: number;
  dataPerDay: string;
  dataAllowance: string;
  benefit: string;
};

const OFFERS: Record<string, OfferSpec> = {
  '5g135': { priceVnd: 135000, dataPerDay: '4 GB/ngày', dataAllowance: '120 GB/tháng', benefit: 'Kèm TV360 Basic và 20 GB lưu trữ MyBox theo bảng gói trả trước Viettel.' },
  '5g150': { priceVnd: 150000, dataPerDay: '6 GB/ngày', dataAllowance: '180 GB/tháng', benefit: 'Kèm TV360 Basic và 30 GB lưu trữ MyBox theo bảng gói trả trước Viettel.' },
  '5g160b': { priceVnd: 160000, dataPerDay: '4 GB/ngày', dataAllowance: '120 GB/tháng', benefit: 'Gồm 100 phút ngoại mạng, ưu đãi gọi nội mạng theo điều kiện và TV360 Basic theo bảng Viettel.' },
  '5g180b': { priceVnd: 180000, dataPerDay: '6 GB/ngày', dataAllowance: '180 GB/tháng', benefit: 'Gồm 100 phút ngoại mạng, ưu đãi gọi nội mạng theo điều kiện và TV360 Basic theo bảng Viettel.' },
  'sd70': { priceVnd: 70000, dataPerDay: '1 GB/ngày', dataAllowance: '30 GB/tháng', benefit: 'Data tốc độ cao theo chu kỳ 30 ngày.' },
  'sd90': { priceVnd: 90000, dataPerDay: '1,5 GB/ngày', dataAllowance: '45 GB/tháng', benefit: 'Data tốc độ cao theo chu kỳ 30 ngày.' },
  'sd120': { priceVnd: 120000, dataPerDay: '2 GB/ngày', dataAllowance: '60 GB/tháng', benefit: 'Data tốc độ cao theo chu kỳ 30 ngày.' },
  'sd135': { priceVnd: 135000, dataPerDay: '5 GB/ngày', dataAllowance: '150 GB/tháng', benefit: 'Data tốc độ cao theo chu kỳ 30 ngày.' },
  'sd150': { priceVnd: 150000, dataPerDay: '3 GB/ngày', dataAllowance: '90 GB/tháng', benefit: 'Data tốc độ cao theo chu kỳ 30 ngày.' },
  'v90b': { priceVnd: 90000, dataPerDay: '1 GB/ngày', dataAllowance: '30 GB/tháng', benefit: 'Kèm 30 phút ngoại mạng và ưu đãi gọi nội mạng theo điều kiện trong bảng Viettel.' },
  'v120b': { priceVnd: 120000, dataPerDay: '1,5 GB/ngày', dataAllowance: '45 GB/tháng', benefit: 'Kèm 50 phút ngoại mạng và ưu đãi gọi nội mạng theo điều kiện trong bảng Viettel.' },
  'v160b': { priceVnd: 160000, dataPerDay: '4 GB/ngày', dataAllowance: '120 GB/tháng', benefit: 'Kèm 100 phút ngoại mạng và ưu đãi gọi nội mạng theo điều kiện trong bảng Viettel.' },
  'mxh100': { priceVnd: 100000, dataPerDay: '1 GB/ngày', dataAllowance: '30 GB/tháng', benefit: 'Có ưu đãi truy cập Facebook, TikTok, YouTube và nhắn tin Messenger theo bảng Viettel.' },
  'mxh120': { priceVnd: 120000, dataPerDay: '1 GB/ngày', dataAllowance: '30 GB/tháng', benefit: 'Có ưu đãi gọi và các dịch vụ mạng xã hội theo điều kiện sử dụng của Viettel.' },
  'mxh150': { priceVnd: 150000, dataPerDay: '1,5 GB/ngày', dataAllowance: '45 GB/tháng', benefit: 'Có ưu đãi gọi và các dịch vụ mạng xã hội theo điều kiện sử dụng của Viettel.' },
};

function fact(id: string, key: CatalogFact['key'], value: CatalogFact['value'], claim: string): CatalogFact {
  return { id, key, value, claim, sourceUrl: SOURCE_URL, retrievedAt: RETRIEVED_AT, effectiveAt: SOURCE_EFFECTIVE_AT, expiresAt: EXPIRES_AT };
}

function offerFacts(id: string, spec: OfferSpec): CatalogFact[] {
  return [
    fact(`${id}-price`, 'priceVnd', spec.priceVnd, `Giá ${spec.priceVnd.toLocaleString('vi-VN')}đ/30 ngày.`),
    fact(`${id}-duration`, 'durationDays', 30, 'Chu kỳ 30 ngày.'),
    fact(`${id}-data-per-day`, 'dataPerDay', spec.dataPerDay, `Ưu đãi ${spec.dataPerDay}.`),
    fact(`${id}-data-total`, 'dataAllowance', spec.dataAllowance, `Tổng ${spec.dataAllowance}.`),
    fact(`${id}-benefit`, 'benefit', spec.benefit, spec.benefit),
    fact(`${id}-eligibility`, 'eligibility', 'Áp dụng cho thuê bao trả trước đủ điều kiện; kiểm tra trong My Viettel hoặc *098# trước khi đăng ký.', 'Khả năng đăng ký phụ thuộc điều kiện thuê bao và hệ thống Viettel tại thời điểm thực hiện.'),
  ];
}

export function activateOfficialPackageFacts(catalog: PackageCatalog): PackageCatalog {
  const activated = {
    ...catalog,
    catalogVersion: '1.4.0-official-facts-structured',
    generatedAt: RETRIEVED_AT,
    packages: catalog.packages.map((pkg) => {
      const spec = OFFERS[pkg.id];
      if (!spec) return pkg;
      const facts = offerFacts(pkg.id, spec);
      return {
        ...pkg,
        status: 'eligibility_required' as const,
        factIds: facts.map(({ id }) => id),
        facts,
      };
    }),
  };
  return buildPackageCatalog(activated) as PackageCatalog;
}

function main() {
  const root = process.cwd();
  const catalogPath = path.join(root, 'data/package-catalog.v1.json');
  const current = JSON.parse(fs.readFileSync(catalogPath, 'utf8').replace(/^\uFEFF/, '')) as PackageCatalog;
  fs.writeFileSync(catalogPath, serializePackageCatalog(activateOfficialPackageFacts(current)), 'utf8');
  console.log(`Activated ${Object.keys(OFFERS).length} source-backed package records without a partner SMS CTA.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
