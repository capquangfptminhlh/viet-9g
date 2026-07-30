/**
 * IMG-13: Image Generator & SVG Overlay Agent
 * Master Spec v3.2 - Section 13 (Media & Visual Verification Gate)
 * 
 * Class/Hàm chuyên trách sinh ảnh truyền thông, banner gói cước 4G/5G Viettel
 * và render SVG text overlay cho số liệu (dung lượng, thoại) và giá trị cước phí.
 */

import sharp from 'sharp';

export interface PackageMediaSpec {
  packageCode: string;
  priceText: string;
  dataQuotaText: string;
  validityText: string;
  freeCallsText?: string;
  badgeText?: string;
  ctaText?: string;
  description?: string;
}

export interface SVGOverlayOptions {
  width?: number;
  height?: number;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  fontFamily?: string;
  watermarkText?: string;
  logoText?: string;
}

export interface GeneratedImageResult {
  svgContent: string;
  buffer?: Buffer;
  format: 'svg' | 'webp' | 'png';
  dimensions: { width: number; height: number };
  altText: string;
  metadata: {
    packageCode: string;
    price: string;
    dataQuota: string;
    generatedAt: string;
  };
}

/**
 * Utility function to escape XML entities in text overlays
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export class ImageGenerator {
  private defaultOptions: Required<SVGOverlayOptions>;

  constructor(options: SVGOverlayOptions = {}) {
    this.defaultOptions = {
      width: options.width ?? 1200,
      height: options.height ?? 630,
      primaryColor: options.primaryColor ?? '#EE0033', // Viettel Brand Red
      secondaryColor: options.secondaryColor ?? '#1E293B', // Dark Slate
      accentColor: options.accentColor ?? '#FFC72C', // Yellow Gold Accent
      backgroundColor: options.backgroundColor ?? '#F8FAFC',
      fontFamily: options.fontFamily ?? "'Be Vietnam Pro', system-ui, -apple-system, sans-serif",
      watermarkText: options.watermarkText ?? 'tracuugoicuoc.com',
      logoText: options.logoText ?? 'VIETTEL TELECOM',
    };
  }

  /**
   * Render SVG text overlay với thông số số liệu / giá của gói cước
   */
  public renderSVGOverlay(spec: PackageMediaSpec, options: SVGOverlayOptions = {}): string {
    const opts = { ...this.defaultOptions, ...options };
    const { width, height, primaryColor, secondaryColor, accentColor, backgroundColor, fontFamily, watermarkText, logoText } = opts;

    const pkgCode = escapeXml(spec.packageCode.toUpperCase());
    const price = escapeXml(spec.priceText);
    const dataQuota = escapeXml(spec.dataQuotaText);
    const validity = escapeXml(spec.validityText);
    const freeCalls = spec.freeCallsText ? escapeXml(spec.freeCallsText) : null;
    const badge = spec.badgeText ? escapeXml(spec.badgeText.toUpperCase()) : 'GÓI HOT 2026';
    const cta = spec.ctaText ? escapeXml(spec.ctaText) : `Cú pháp: ${pkgCode} gửi 9123`;
    const escapedLogo = escapeXml(logoText);
    const escapedWatermark = escapeXml(watermarkText);

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="${backgroundColor}"/>
    </linearGradient>
    <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${primaryColor}"/>
      <stop offset="100%" stop-color="#C40028"/>
    </linearGradient>
    <linearGradient id="badgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${accentColor}"/>
      <stop offset="100%" stop-color="#FFA800"/>
    </linearGradient>
    <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#0F172A" flood-opacity="0.08"/>
    </filter>
  </defs>

  <!-- Nền chính -->
  <rect width="${width}" height="${height}" fill="url(#bgGradient)"/>
  
  <!-- Họa tiết góc trang trí -->
  <circle cx="${width + 100}" cy="-100" r="400" fill="${primaryColor}" opacity="0.05"/>
  <circle cx="-50" cy="${height + 50}" r="250" fill="${accentColor}" opacity="0.1"/>

  <!-- Top Header / Brand Bar -->
  <rect x="0" y="0" width="${width}" height="10" fill="url(#primaryGradient)"/>
  
  <!-- Container Card -->
  <g filter="url(#cardShadow)">
    <rect x="60" y="50" width="${width - 120}" height="${height - 100}" rx="24" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
  </g>

  <!-- Header Section: Logo & Badge -->
  <text x="100" y="115" font-family="${fontFamily}" font-size="20" font-weight="800" fill="${primaryColor}" letter-spacing="2">
    ${escapedLogo}
  </text>
  
  <g transform="translate(${width - 280}, 85)">
    <rect width="180" height="36" rx="18" fill="url(#badgeGradient)"/>
    <text x="90" y="23" font-family="${fontFamily}" font-size="14" font-weight="700" fill="#0F172A" text-anchor="middle">
      ${badge}
    </text>
  </g>

  <!-- Tên gói cước (Main Title) -->
  <text x="100" y="210" font-family="${fontFamily}" font-size="64" font-weight="900" fill="${secondaryColor}" letter-spacing="-1">
    GÓI CƯỚC ${pkgCode}
  </text>

  <!-- Khối Giá cước (Price Tag Block) -->
  <g transform="translate(100, 240)">
    <rect width="320" height="110" rx="16" fill="#FFF5F5" stroke="#FFE0E0" stroke-width="1.5"/>
    <text x="24" y="40" font-family="${fontFamily}" font-size="14" font-weight="600" fill="#718096">
      CƯỚC PHÍ ĐĂNG KÝ
    </text>
    <text x="24" y="85" font-family="${fontFamily}" font-size="38" font-weight="800" fill="${primaryColor}">
      ${price}
    </text>
  </g>

  <!-- Khối Dung lượng Data (Data Quota Block) -->
  <g transform="translate(440, 240)">
    <rect width="360" height="110" rx="16" fill="#F0F9FF" stroke="#BAE6FD" stroke-width="1.5"/>
    <text x="24" y="40" font-family="${fontFamily}" font-size="14" font-weight="600" fill="#0369A1">
      DUNG LƯỢNG HIGH-SPEED
    </text>
    <text x="24" y="85" font-family="${fontFamily}" font-size="38" font-weight="800" fill="#0284C7">
      ${dataQuota}
    </text>
  </g>

  <!-- Khối Thời hạn (Validity Block) -->
  <g transform="translate(820, 240)">
    <rect width="280" height="110" rx="16" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.5"/>
    <text x="24" y="40" font-family="${fontFamily}" font-size="14" font-weight="600" fill="#64748B">
      THỜI HẠN SỬ DỤNG
    </text>
    <text x="24" y="85" font-family="${fontFamily}" font-size="32" font-weight="800" fill="${secondaryColor}">
      ${validity}
    </text>
  </g>

  <!-- Ưu đãi thoại (nếu có) -->
  ${
    freeCalls
      ? `<g transform="translate(100, 375)">
    <text x="0" y="24" font-family="${fontFamily}" font-size="18" font-weight="600" fill="#16A34A">
      ✔ ${freeCalls}
    </text>
  </g>`
      : ''
  }

  <!-- Banner Hướng dẫn Đăng ký (CTA Banner) -->
  <g transform="translate(100, 430)">
    <rect width="${width - 200}" height="80" rx="16" fill="url(#primaryGradient)"/>
    <text x="40" y="48" font-family="${fontFamily}" font-size="22" font-weight="800" fill="#FFFFFF">
      ${cta}
    </text>
  </g>

  <!-- Watermark & Footer Info -->
  <text x="${width - 100}" y="${height - 35}" font-family="${fontFamily}" font-size="14" font-weight="600" fill="#94A3B8" text-anchor="end">
    Nguồn thông tin: ${escapedWatermark}
  </text>
</svg>`;
  }

  /**
   * Sinh ảnh package banner hoàn chỉnh dạng SVG result & alt text chuẩn SEO/AEO
   */
  public generatePackageBanner(spec: PackageMediaSpec, options: SVGOverlayOptions = {}): GeneratedImageResult {
    const opts = { ...this.defaultOptions, ...options };
    const svgContent = this.renderSVGOverlay(spec, opts);
    
    const altText = `Hình ảnh chi tiết gói cước 4G 5G Viettel ${spec.packageCode}: giá ${spec.priceText}, dung lượng ${spec.dataQuotaText}, thời hạn ${spec.validityText}.`;

    return {
      svgContent,
      format: 'svg',
      dimensions: {
        width: opts.width,
        height: opts.height,
      },
      altText,
      metadata: {
        packageCode: spec.packageCode,
        price: spec.priceText,
        dataQuota: spec.dataQuotaText,
        generatedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Chuyển đổi mã SVG thành WebP Buffer thông qua Sharp
   */
  public async generateWebPFromSVG(svgContent: string, width?: number, height?: number): Promise<Buffer> {
    const inputBuffer = Buffer.from(svgContent);
    let pipeline = sharp(inputBuffer);
    
    if (width || height) {
      pipeline = pipeline.resize(width, height);
    }

    return await pipeline.webp({ quality: 85 }).toBuffer();
  }

  /**
   * Sinh ảnh WebP hoàn chỉnh từ PackageMediaSpec
   */
  public async generatePackageImageWebP(
    spec: PackageMediaSpec,
    options: SVGOverlayOptions = {}
  ): Promise<GeneratedImageResult> {
    const result = this.generatePackageBanner(spec, options);
    const webpBuffer = await this.generateWebPFromSVG(result.svgContent, result.dimensions.width, result.dimensions.height);

    return {
      ...result,
      buffer: webpBuffer,
      format: 'webp',
    };
  }

  /**
   * Hàm hỗ trợ sinh hàng loạt (Batch generation)
   */
  public async batchGenerateMedia(
    specs: PackageMediaSpec[],
    options: SVGOverlayOptions = {}
  ): Promise<GeneratedImageResult[]> {
    return Promise.all(specs.map((spec) => this.generatePackageImageWebP(spec, options)));
  }
}

/**
 * Standalone Helper Functions
 */
export function generateSVGTextOverlay(spec: PackageMediaSpec, options?: SVGOverlayOptions): string {
  const generator = new ImageGenerator(options);
  return generator.renderSVGOverlay(spec, options);
}

export async function generatePackageImage(
  spec: PackageMediaSpec,
  options?: SVGOverlayOptions
): Promise<GeneratedImageResult> {
  const generator = new ImageGenerator(options);
  return generator.generatePackageImageWebP(spec, options);
}

export default ImageGenerator;
