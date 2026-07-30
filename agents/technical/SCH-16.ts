/**
 * SCH-16: Structured Data Generator & Validator (JSON-LD matching visible content)
 * Master Spec v3.2 - Section 7, 10, 11 (Hard Blocker: JSON-LD schema matching visible content)
 * Worker: W4 (media+package) - Deterministic
 */

export interface AuthorInput {
  id?: string;
  name: string;
  role?: string;
  url?: string;
  sameAs?: string[];
}

export interface OrganizationInput {
  name: string;
  url: string;
  logo?: string;
  sameAs?: string[];
}

export interface BreadcrumbItem {
  name: string;
  url: string;
  position: number;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ProductOfferInput {
  name: string;
  description?: string;
  price: number | string;
  priceCurrency?: string;
  validityPeriod?: string;
  url?: string;
  availability?: string;
  category?: string;
}

export interface ContentPageInput {
  url: string;
  headline: string;
  description: string;
  content: string; // Visible HTML or Markdown content
  datePublished: string;
  dateModified: string;
  inLanguage?: string;
  image?: string | string[];
  author?: AuthorInput;
  publisher?: OrganizationInput;
  breadcrumbs?: BreadcrumbItem[];
  faqs?: FAQItem[];
  productOffer?: ProductOfferInput;
  schemaTypes?: string[]; // e.g. ['Article', 'BreadcrumbList', 'FAQPage', 'Product']
}

export interface SchemaValidationIssue {
  field: string;
  schemaValue?: string | number;
  visibleValue?: string | number;
  message: string;
  severity: 'ERROR' | 'WARNING';
}

export interface SchemaResult {
  jsonLdGraph: Record<string, unknown>;
  jsonLdScript: string;
  isValid: boolean;
  validationIssues: SchemaValidationIssue[];
}

export class StructuredDataAgent {
  private defaultPublisher: OrganizationInput = {
    name: 'Viettel Telecom - Tra Cứu Gói Cước',
    url: 'https://tracuugoicuoc.com',
    logo: 'https://tracuugoicuoc.com/assets/logo.png',
  };

  /**
   * Generates JSON-LD schema graph and validates visible content consistency.
   */
  public generateSchema(input: ContentPageInput): SchemaResult {
    const graphNodes: Record<string, unknown>[] = [];
    const publisher = input.publisher ?? this.defaultPublisher;

    // 1. Organization Schema
    const orgNode: Record<string, unknown> = {
      '@type': 'Organization',
      '@id': `${publisher.url}#organization`,
      name: publisher.name,
      url: publisher.url,
    };
    if (publisher.logo) {
      orgNode.logo = {
        '@type': 'ImageObject',
        url: publisher.logo,
      };
    }
    if (publisher.sameAs && publisher.sameAs.length > 0) {
      orgNode.sameAs = publisher.sameAs;
    }
    graphNodes.push(orgNode);

    // 2. Author / Person Schema
    let authorRef: Record<string, unknown> = {
      '@type': 'Organization',
      '@id': `${publisher.url}#organization`,
    };

    if (input.author) {
      const authorId = input.author.url ?? `${publisher.url}#/schema/person/${encodeURIComponent(input.author.name)}`;
      const personNode: Record<string, unknown> = {
        '@type': 'Person',
        '@id': authorId,
        name: input.author.name,
      };
      if (input.author.role) {
        personNode.jobTitle = input.author.role;
      }
      if (input.author.sameAs && input.author.sameAs.length > 0) {
        personNode.sameAs = input.author.sameAs;
      }
      if (input.author.url) {
        personNode.url = input.author.url;
      }
      graphNodes.push(personNode);
      authorRef = { '@id': authorId };
    }

    // 3. Article / TechArticle Schema
    const articleNode: Record<string, unknown> = {
      '@type': 'Article',
      '@id': `${input.url}#article`,
      isPartOf: { '@type': 'WebPage', '@id': input.url },
      headline: input.headline,
      description: input.description,
      inLanguage: input.inLanguage ?? 'vi',
      mainEntityOfPage: { '@type': 'WebPage', '@id': input.url },
      datePublished: input.datePublished,
      dateModified: input.dateModified,
      author: authorRef,
      publisher: { '@id': `${publisher.url}#organization` },
    };

    if (input.image) {
      articleNode.image = Array.isArray(input.image) ? input.image : [input.image];
    }
    graphNodes.push(articleNode);

    // 4. BreadcrumbList Schema
    if (input.breadcrumbs && input.breadcrumbs.length > 0) {
      const breadcrumbNode: Record<string, unknown> = {
        '@type': 'BreadcrumbList',
        '@id': `${input.url}#breadcrumb`,
        itemListElement: input.breadcrumbs.map((b) => ({
          '@type': 'ListItem',
          position: b.position,
          name: b.name,
          item: b.url,
        })),
      };
      graphNodes.push(breadcrumbNode);
    }

    // 5. FAQPage Schema
    if (input.faqs && input.faqs.length > 0) {
      const faqNode: Record<string, unknown> = {
        '@type': 'FAQPage',
        '@id': `${input.url}#faq`,
        mainEntity: input.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      };
      graphNodes.push(faqNode);
    }

    // 6. Product / Offer Schema (Telecom Packages)
    if (input.productOffer) {
      const offer = input.productOffer;
      const productNode: Record<string, unknown> = {
        '@type': 'Product',
        '@id': `${input.url}#product`,
        name: offer.name,
        description: offer.description ?? input.description,
        offers: {
          '@type': 'Offer',
          url: offer.url ?? input.url,
          priceCurrency: offer.priceCurrency ?? 'VND',
          price: offer.price,
          availability: offer.availability ?? 'https://schema.org/InStock',
          seller: { '@id': `${publisher.url}#organization` },
        },
      };
      if (offer.category) {
        productNode.category = offer.category;
      }
      graphNodes.push(productNode);
    }

    const jsonLdGraph: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@graph': graphNodes,
    };

    // Validate Schema vs Visible Content
    const validationIssues = this.validateSchemaAgainstVisibleContent(jsonLdGraph, input.content, input);
    const hasErrors = validationIssues.some((issue) => issue.severity === 'ERROR');

    const jsonLdScript = this.renderScriptTag(jsonLdGraph);

    return {
      jsonLdGraph,
      jsonLdScript,
      isValid: !hasErrors,
      validationIssues,
    };
  }

  /**
   * Validates that structured data fields match text rendered in visible content.
   * Master Spec v3.2 Section 11.1 Hard Blocker: "Schema JSON-LD không khớp visible content"
   */
  public validateSchemaAgainstVisibleContent(
    graphObj: Record<string, unknown>,
    visibleContent: string,
    _inputMeta?: ContentPageInput
  ): SchemaValidationIssue[] {
    const issues: SchemaValidationIssue[] = [];
    const normalizedVisible = this.normalizeText(visibleContent);

    const graph = (graphObj['@graph'] as Record<string, unknown>[]) || [];

    for (const node of graph) {
      const nodeType = node['@type'] as string;

      // Validate Article / Headline
      if (nodeType === 'Article' || nodeType === 'TechArticle' || nodeType === 'BlogPosting') {
        const headline = node['headline'] as string;
        if (headline && !this.textContains(normalizedVisible, headline)) {
          issues.push({
            field: 'headline',
            schemaValue: headline,
            message: 'Headline in JSON-LD is not found in visible content.',
            severity: 'WARNING',
          });
        }
      }

      // Validate FAQ questions & answers
      if (nodeType === 'FAQPage') {
        const mainEntity = (node['mainEntity'] as Array<Record<string, unknown>>) || [];
        for (let i = 0; i < mainEntity.length; i++) {
          const qObj = mainEntity[i];
          const questionText = qObj['name'] as string;
          const answerObj = qObj['acceptedAnswer'] as Record<string, unknown>;
          const answerText = answerObj ? (answerObj['text'] as string) : '';

          if (questionText && !this.textContains(normalizedVisible, questionText)) {
            issues.push({
              field: `faqs[${i}].question`,
              schemaValue: questionText,
              message: `FAQ question "${questionText}" in JSON-LD does not match visible content.`,
              severity: 'ERROR',
            });
          }

          if (answerText && !this.textContains(normalizedVisible, answerText)) {
            issues.push({
              field: `faqs[${i}].answer`,
              schemaValue: answerText,
              message: `FAQ answer for "${questionText}" in JSON-LD does not match visible content.`,
              severity: 'ERROR',
            });
          }
        }
      }

      // Validate Product / Offer price
      if (nodeType === 'Product') {
        const productName = node['name'] as string;
        const offer = node['offers'] as Record<string, unknown>;
        if (offer) {
          const price = String(offer['price']);
          if (price && !this.numericPriceInContent(normalizedVisible, price)) {
            issues.push({
              field: 'productOffer.price',
              schemaValue: price,
              message: `Product price "${price}" in JSON-LD offer is not present in visible page content.`,
              severity: 'ERROR',
            });
          }
        }

        if (productName && !this.textContains(normalizedVisible, productName)) {
          issues.push({
            field: 'productOffer.name',
            schemaValue: productName,
            message: `Product name "${productName}" in JSON-LD is not found in visible page content.`,
            severity: 'WARNING',
          });
        }
      }

      // Validate Author Name
      if (nodeType === 'Person') {
        const authorName = node['name'] as string;
        if (authorName && !this.textContains(normalizedVisible, authorName)) {
          issues.push({
            field: 'author.name',
            schemaValue: authorName,
            message: `Author name "${authorName}" in JSON-LD Person schema is not found in visible content.`,
            severity: 'WARNING',
          });
        }
      }
    }

    return issues;
  }

  public renderScriptTag(jsonLdGraph: Record<string, unknown>): string {
    const jsonString = JSON.stringify(jsonLdGraph, null, 2);
    return `<script type="application/ld+json">\n${jsonString}\n</script>`;
  }

  private normalizeText(text: string): string {
    if (!text) return '';
    return text
      .replace(/<[^>]*>/g, ' ') // Strip HTML tags
      .replace(/\s+/g, ' ') // Collapse whitespaces
      .toLowerCase()
      .trim();
  }

  private textContains(normalizedTarget: string, searchStr: string): boolean {
    if (!searchStr) return true;
    const normSearch = this.normalizeText(searchStr);
    if (!normSearch) return true;

    // Check direct substring
    if (normalizedTarget.includes(normSearch)) {
      return true;
    }

    // Check fuzzy 80% word match for longer sentences
    const searchWords = normSearch.split(' ').filter((w) => w.length > 2);
    if (searchWords.length === 0) return true;

    let matchedWords = 0;
    for (const word of searchWords) {
      if (normalizedTarget.includes(word)) {
        matchedWords++;
      }
    }
    return matchedWords / searchWords.length >= 0.8;
  }

  private numericPriceInContent(normalizedTarget: string, priceStr: string): boolean {
    const cleanPrice = priceStr.replace(/[^0-9]/g, '');
    if (!cleanPrice) return true;

    // Direct string check (e.g., "120000" or "120.000" or "120k" or "120,000")
    if (normalizedTarget.includes(cleanPrice)) return true;

    // Formatted price string checks for VND (e.g. 120000 -> 120.000 or 120k or 120đ)
    const priceNum = parseInt(cleanPrice, 10);
    if (isNaN(priceNum)) return false;

    const formattedDot = priceNum.toLocaleString('vi-VN'); // 120.000
    if (normalizedTarget.includes(formattedDot)) return true;

    if (priceNum >= 1000 && priceNum % 1000 === 0) {
      const priceK = `${priceNum / 1000}k`; // 120k
      if (normalizedTarget.includes(priceK)) return true;
    }

    return false;
  }
}

export function generateStructuredData(input: ContentPageInput): SchemaResult {
  const agent = new StructuredDataAgent();
  return agent.generateSchema(input);
}

export function validateSchemaAgainstVisibleContent(
  schema: Record<string, unknown>,
  visibleContent: string,
  inputMeta?: ContentPageInput
): SchemaValidationIssue[] {
  const agent = new StructuredDataAgent();
  return agent.validateSchemaAgainstVisibleContent(schema, visibleContent, inputMeta);
}
