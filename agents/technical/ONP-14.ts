/**
 * ONP-14: On-Page SEO Packaging Agent
 * Master Spec v3.2 - Section 7 & 10 (FR-010, Worker W4 media+package)
 * 
 * Trách nhiệm: Xử lý Title, Meta Description, Slug, Canonical URL, Open Graph (OG) tags, 
 * Breadcrumbs và kiểm tra On-page SEO compliance.
 */

export interface ProjectSeoConfig {
  domain: string;
  canonicalHost: string;
  siteName: string;
  language: string;
  market: string;
  trailingSlashPolicy: 'never' | 'always';
}

export interface OnPageInput {
  title: string;
  metaDescription?: string;
  content?: string;
  slug?: string;
  primaryKeyword?: string;
  category?: { name: string; slug: string };
  coverImageUrl?: string;
  publishedAt?: string;
  modifiedAt?: string;
  authorName?: string;
}

export interface BreadcrumbItem {
  position: number;
  name: string;
  item: string;
}

export interface OpenGraphMetadata {
  title: string;
  description: string;
  url: string;
  type: 'article' | 'website';
  siteName: string;
  locale: string;
  image?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
}

export interface TwitterMetadata {
  card: 'summary_large_image' | 'summary';
  title: string;
  description: string;
  image?: string;
}

export interface OnPageOutput {
  title: string;
  rawTitle: string;
  metaDescription: string;
  slug: string;
  canonicalUrl: string;
  breadcrumbs: BreadcrumbItem[];
  openGraph: OpenGraphMetadata;
  twitter: TwitterMetadata;
  validation: OnPageValidationResult;
}

export interface OnPageValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  metrics: {
    titleLength: number;
    metaDescriptionLength: number;
    hasKeywordInTitle: boolean;
    hasKeywordInSlug: boolean;
    isSlugUrlSafe: boolean;
    isCanonicalValid: boolean;
  };
}

export const DEFAULT_SEO_CONFIG: ProjectSeoConfig = {
  domain: 'https://tracuugoicuoc.com',
  canonicalHost: 'tracuugoicuoc.com',
  siteName: 'Viettel Telecom - Tra Cứu Gói Cước',
  language: 'vi',
  market: 'VN',
  trailingSlashPolicy: 'never',
};

export class OnPageSeoAgent {
  private config: ProjectSeoConfig;

  constructor(config?: Partial<ProjectSeoConfig>) {
    this.config = { ...DEFAULT_SEO_CONFIG, ...config };
  }

  /**
   * Chuyển đổi chuỗi tiếng Việt có dấu thành slug không dấu chuẩn SEO
   */
  public generateSlug(text: string): string {
    if (!text) return '';

    let str = text.toLowerCase().trim();

    // Thay thế ký tự tiếng Việt có dấu bằng chữ không dấu tương ứng
    str = str.replace(/á|à|ả|ã|ạ|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/g, 'a');
    str = str.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/g, 'e');
    str = str.replace(/í|ì|ỉ|ĩ|ị/g, 'i');
    str = str.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/g, 'o');
    str = str.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/g, 'u');
    str = str.replace(/ý|ỳ|ỷ|ỹ|ỵ/g, 'y');
    str = str.replace(/đ/g, 'd');

    // Unicode normalize để loại bỏ ký tự tổ hợp còn sót
    str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Xóa ký tự đặc biệt không phải chữ cái, số, khoảng trắng hoặc dấu gạch ngang
    str = str.replace(/[^a-z0-9\s-]/g, '');

    // Thay khoảng trắng và chuỗi gạch ngang bằng 1 dấu gạch ngang duy nhất
    str = str.replace(/[\s-]+/g, '-');

    // Loại bỏ dấu gạch ngang ở đầu và cuối chuỗi
    str = str.replace(/^-+|-+$/g, '');

    return str;
  }

  /**
   * Xử lý và chuẩn hóa Title tag chuẩn SEO (khuyến nghị 50-60 ký tự)
   */
  public formatTitle(rawTitle: string, includeBrandSuffix = true): string {
    if (!rawTitle) return this.config.siteName;

    // Loại bỏ HTML tags và khoảng trắng thừa
    let clean = rawTitle.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

    const siteSuffix = `| ${this.config.siteName}`;
    const domainSuffix = `| ${this.config.canonicalHost}`;

    // Tránh lặp lại tên thương hiệu nếu title đã chứa sẵn
    if (clean.endsWith(siteSuffix) || clean.endsWith(domainSuffix) || clean.includes(this.config.canonicalHost)) {
      return clean;
    }

    if (includeBrandSuffix) {
      const fullTitle = `${clean} ${siteSuffix}`;
      if (fullTitle.length <= 65) {
        return fullTitle;
      }

      const shortTitle = `${clean} ${domainSuffix}`;
      if (shortTitle.length <= 65) {
        return shortTitle;
      }
    }

    return clean;
  }

  /**
   * Xử lý và chuẩn hóa Meta Description (khuyến nghị 120-160 ký tự)
   */
  public formatMetaDescription(text?: string, fallbackContent?: string): string {
    let source = text || fallbackContent || '';
    if (!source) return '';

    // Loại bỏ HTML, Markdown formatting và khoảng trắng thừa
    let clean = source
      .replace(/<[^>]*>/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Giữ lại text trong link markdown
      .replace(/[\#\*\_`~]/g, '')              // Loại bỏ các ký tự markdown
      .replace(/\s+/g, ' ')
      .trim();

    if (clean.length > 160) {
      clean = clean.substring(0, 157);
      const lastSpace = clean.lastIndexOf(' ');
      if (lastSpace > 120) {
        clean = clean.substring(0, lastSpace);
      }
      clean = `${clean}...`;
    }

    return clean;
  }

  /**
   * Sinh Canonical URL chuẩn theo trailing slash policy của dự án
   */
  public generateCanonicalUrl(slugOrPath: string): string {
    const cleanPath = slugOrPath
      .replace(/^https?:\/\/[^\/]+/, '') // Loại bỏ domain nếu truyền vào full URL
      .replace(/^\/+|\/+$/g, '')         // Loại bỏ / đầu và cuối
      .replace(/\?.*$/, '');              // Loại bỏ query string (utm, gclid,...)

    const hostUrl = this.config.domain.replace(/\/+$/, '');
    
    if (!cleanPath) {
      return this.config.trailingSlashPolicy === 'always' ? `${hostUrl}/` : hostUrl;
    }

    const path = this.config.trailingSlashPolicy === 'always' ? `${cleanPath}/` : cleanPath;
    return `${hostUrl}/${path}`;
  }

  /**
   * Tạo danh sách BreadcrumbItem theo chuẩn Schema.org
   */
  public generateBreadcrumbs(
    title: string,
    slug: string,
    category?: { name: string; slug: string }
  ): BreadcrumbItem[] {
    const items: BreadcrumbItem[] = [
      {
        position: 1,
        name: 'Trang chủ',
        item: this.generateCanonicalUrl(''),
      },
    ];

    let currentPos = 2;

    if (category) {
      items.push({
        position: currentPos++,
        name: category.name,
        item: this.generateCanonicalUrl(category.slug),
      });
    }

    items.push({
      position: currentPos,
      name: title,
      item: this.generateCanonicalUrl(slug),
    });

    return items;
  }

  /**
   * Tạo thẻ Open Graph và Twitter Card metadata
   */
  public generateSocialMetadata(input: {
    title: string;
    description: string;
    canonicalUrl: string;
    coverImageUrl?: string;
    publishedAt?: string;
    modifiedAt?: string;
    authorName?: string;
  }): { openGraph: OpenGraphMetadata; twitter: TwitterMetadata } {
    const openGraph: OpenGraphMetadata = {
      title: input.title,
      description: input.description,
      url: input.canonicalUrl,
      type: 'article',
      siteName: this.config.siteName,
      locale: this.config.language === 'vi' ? 'vi_VN' : 'en_US',
      image: input.coverImageUrl,
      publishedTime: input.publishedAt,
      modifiedTime: input.modifiedAt,
      author: input.authorName,
    };

    const twitter: TwitterMetadata = {
      card: 'summary_large_image',
      title: input.title,
      description: input.description,
      image: input.coverImageUrl,
    };

    return { openGraph, twitter };
  }

  /**
   * Kiểm tra các tiêu chuẩn On-page SEO (Validation & Audit)
   */
  public validateOnPage(
    output: Omit<OnPageOutput, 'validation'>,
    primaryKeyword?: string
  ): OnPageValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const titleLength = output.title.length;
    const metaDescriptionLength = output.metaDescription.length;

    // Validate Title
    if (!output.title) {
      errors.push('MISSING_TITLE');
    } else if (titleLength < 30) {
      warnings.push('TITLE_TOO_SHORT');
    } else if (titleLength > 70) {
      warnings.push('TITLE_TOO_LONG');
    }

    // Validate Meta Description
    if (!output.metaDescription) {
      errors.push('MISSING_META_DESCRIPTION');
    } else if (metaDescriptionLength < 70) {
      warnings.push('META_DESCRIPTION_TOO_SHORT');
    } else if (metaDescriptionLength > 165) {
      warnings.push('META_DESCRIPTION_TOO_LONG');
    }

    // Validate Slug
    const isSlugUrlSafe = /^[a-z0-9]+(-[a-z0-9]+)*$/.test(output.slug);
    if (!output.slug) {
      errors.push('MISSING_SLUG');
    } else if (!isSlugUrlSafe) {
      errors.push('INVALID_SLUG_FORMAT');
    }

    // Validate Canonical URL
    let isCanonicalValid = false;
    try {
      const parsedUrl = new URL(output.canonicalUrl);
      isCanonicalValid =
        parsedUrl.hostname === this.config.canonicalHost ||
        parsedUrl.origin === this.config.domain;
      if (!isCanonicalValid) {
        errors.push('CANONICAL_DOMAIN_MISMATCH');
      }
    } catch {
      errors.push('INVALID_CANONICAL_URL');
    }

    // Keyword checks
    let hasKeywordInTitle = false;
    let hasKeywordInSlug = false;

    if (primaryKeyword) {
      const kwLower = primaryKeyword.toLowerCase().trim();
      const kwSlug = this.generateSlug(primaryKeyword);

      hasKeywordInTitle = output.title.toLowerCase().includes(kwLower);
      hasKeywordInSlug = output.slug.includes(kwSlug);

      if (!hasKeywordInTitle) {
        warnings.push('PRIMARY_KEYWORD_NOT_IN_TITLE');
      }
      if (!hasKeywordInSlug) {
        warnings.push('PRIMARY_KEYWORD_NOT_IN_SLUG');
      }
    } else {
      hasKeywordInTitle = true;
      hasKeywordInSlug = true;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      metrics: {
        titleLength,
        metaDescriptionLength,
        hasKeywordInTitle,
        hasKeywordInSlug,
        isSlugUrlSafe,
        isCanonicalValid,
      },
    };
  }

  /**
   * Quy trình đóng gói On-page SEO hoàn chỉnh cho một nội dung
   */
  public process(input: OnPageInput): OnPageOutput {
    const rawTitle = input.title.trim();
    const formattedTitle = this.formatTitle(rawTitle);
    const metaDescription = this.formatMetaDescription(input.metaDescription, input.content);

    const slug = input.slug ? this.generateSlug(input.slug) : this.generateSlug(rawTitle);
    const canonicalUrl = this.generateCanonicalUrl(slug);

    const breadcrumbs = this.generateBreadcrumbs(rawTitle, slug, input.category);

    const { openGraph, twitter } = this.generateSocialMetadata({
      title: formattedTitle,
      description: metaDescription,
      canonicalUrl,
      coverImageUrl: input.coverImageUrl,
      publishedAt: input.publishedAt,
      modifiedAt: input.modifiedAt,
      authorName: input.authorName,
    });

    const partialOutput = {
      title: formattedTitle,
      rawTitle,
      metaDescription,
      slug,
      canonicalUrl,
      breadcrumbs,
      openGraph,
      twitter,
    };

    const validation = this.validateOnPage(partialOutput, input.primaryKeyword);

    return {
      ...partialOutput,
      validation,
    };
  }
}

/**
 * Hàm helper thi công On-page SEO trực tiếp (Worker W4 step)
 */
export function packageOnPage(
  input: OnPageInput,
  config?: Partial<ProjectSeoConfig>
): OnPageOutput {
  const agent = new OnPageSeoAgent(config);
  return agent.process(input);
}
