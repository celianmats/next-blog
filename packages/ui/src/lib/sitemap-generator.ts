/**
 * Sitemap Generator
 * Generate XML sitemaps for search engines
 */

import { gql } from '@apollo/client';
import { apolloClient } from './apollo-client';

// ================================
// Types
// ================================
interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

// ================================
// GraphQL Queries
// ================================
const GET_ALL_ARTICLES = gql`
  query GetAllArticles($locale: Locale!) {
    articles(locale: $locale, status: PUBLISHED, limit: 10000) {
      edges {
        node {
          slug
          updatedAt
          publishedAt
        }
      }
    }
  }
`;

const GET_ALL_CATEGORIES = gql`
  query GetAllCategories {
    categories(locale: EN) {
      id
      slug
      updatedAt
    }
  }
`;

const GET_ALL_TAGS = gql`
  query GetAllTags {
    tags(locale: EN, limit: 1000) {
      id
      slug
    }
  }
`;

// ================================
// Sitemap Generator Class
// ================================
export class SitemapGenerator {
  private baseUrl: string;
  private locales: string[];

  constructor(baseUrl: string = 'https://republik.example.com', locales: string[] = ['en', 'fr', 'ar']) {
    this.baseUrl = baseUrl;
    this.locales = locales;
  }

  /**
   * Generate complete sitemap index
   */
  async generateSitemapIndex(): Promise<string> {
    const sitemaps: string[] = [
      'sitemap-pages.xml',
      ...this.locales.map(locale => `sitemap-articles-${locale}.xml`),
      'sitemap-categories.xml',
      'sitemap-tags.xml',
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(sitemap => `  <sitemap>
    <loc>${this.baseUrl}/${sitemap}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;

    return xml;
  }

  /**
   * Generate static pages sitemap
   */
  async generatePagesSitemap(): Promise<string> {
    const pages: SitemapUrl[] = [];

    // Add static pages for each locale
    this.locales.forEach(locale => {
      pages.push({
        loc: `${this.baseUrl}/${locale}`,
        changefreq: 'daily',
        priority: 1.0,
      });

      pages.push({
        loc: `${this.baseUrl}/${locale}/about`,
        changefreq: 'monthly',
        priority: 0.5,
      });

      pages.push({
        loc: `${this.baseUrl}/${locale}/contact`,
        changefreq: 'monthly',
        priority: 0.5,
      });

      pages.push({
        loc: `${this.baseUrl}/${locale}/privacy`,
        changefreq: 'monthly',
        priority: 0.3,
      });

      pages.push({
        loc: `${this.baseUrl}/${locale}/terms`,
        changefreq: 'monthly',
        priority: 0.3,
      });
    });

    return this.generateXml(pages);
  }

  /**
   * Generate articles sitemap for a locale
   */
  async generateArticlesSitemap(locale: string): Promise<string> {
    try {
      const { data } = await apolloClient.query({
        query: GET_ALL_ARTICLES,
        variables: { locale: locale.toUpperCase() },
      });

      const articles: SitemapUrl[] = data.articles.edges.map(({ node }: any) => ({
        loc: `${this.baseUrl}/${locale}/${node.slug}`,
        lastmod: new Date(node.updatedAt || node.publishedAt).toISOString(),
        changefreq: 'weekly' as const,
        priority: 0.8,
      }));

      return this.generateXml(articles);
    } catch (error) {
      console.error(`Error generating articles sitemap for ${locale}:`, error);
      return this.generateXml([]);
    }
  }

  /**
   * Generate categories sitemap
   */
  async generateCategoriesSitemap(): Promise<string> {
    try {
      const { data } = await apolloClient.query({
        query: GET_ALL_CATEGORIES,
      });

      const categories: SitemapUrl[] = [];

      data.categories.forEach((category: any) => {
        this.locales.forEach(locale => {
          categories.push({
            loc: `${this.baseUrl}/${locale}/category/${category.slug}`,
            lastmod: category.updatedAt ? new Date(category.updatedAt).toISOString() : undefined,
            changefreq: 'daily',
            priority: 0.7,
          });
        });
      });

      return this.generateXml(categories);
    } catch (error) {
      console.error('Error generating categories sitemap:', error);
      return this.generateXml([]);
    }
  }

  /**
   * Generate tags sitemap
   */
  async generateTagsSitemap(): Promise<string> {
    try {
      const { data } = await apolloClient.query({
        query: GET_ALL_TAGS,
      });

      const tags: SitemapUrl[] = [];

      data.tags.forEach((tag: any) => {
        this.locales.forEach(locale => {
          tags.push({
            loc: `${this.baseUrl}/${locale}/tag/${tag.slug}`,
            changefreq: 'weekly',
            priority: 0.6,
          });
        });
      });

      return this.generateXml(tags);
    } catch (error) {
      console.error('Error generating tags sitemap:', error);
      return this.generateXml([]);
    }
  }

  /**
   * Generate XML from URLs
   */
  private generateXml(urls: SitemapUrl[]): string {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.map(url => this.generateUrlEntry(url)).join('\n')}
</urlset>`;

    return xml;
  }

  /**
   * Generate single URL entry
   */
  private generateUrlEntry(url: SitemapUrl): string {
    let entry = `  <url>
    <loc>${this.escapeXml(url.loc)}</loc>`;

    if (url.lastmod) {
      entry += `\n    <lastmod>${url.lastmod}</lastmod>`;
    }

    if (url.changefreq) {
      entry += `\n    <changefreq>${url.changefreq}</changefreq>`;
    }

    if (url.priority !== undefined) {
      entry += `\n    <priority>${url.priority.toFixed(1)}</priority>`;
    }

    // Add alternate language links
    this.locales.forEach(locale => {
      const localeUrl = url.loc.replace(/\/(en|fr|ar)\//, `/${locale}/`);
      entry += `\n    <xhtml:link rel="alternate" hreflang="${locale}" href="${localeUrl}" />`;
    });

    entry += '\n  </url>';

    return entry;
  }

  /**
   * Escape XML special characters
   */
  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}

// ================================
// Robots.txt Generator
// ================================
export class RobotsTxtGenerator {
  private baseUrl: string;

  constructor(baseUrl: string = 'https://republik.example.com') {
    this.baseUrl = baseUrl;
  }

  /**
   * Generate robots.txt content
   */
  generate(): string {
    return `# Republik - Robots.txt
# ${new Date().toISOString()}

User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /*/admin/
Disallow: /login
Disallow: /register
Disallow: /reset-password
Disallow: /verify-email

# Sitemaps
Sitemap: ${this.baseUrl}/sitemap.xml
Sitemap: ${this.baseUrl}/sitemap-articles-en.xml
Sitemap: ${this.baseUrl}/sitemap-articles-fr.xml
Sitemap: ${this.baseUrl}/sitemap-articles-ar.xml

# Crawl-delay (be nice to the server)
Crawl-delay: 1

# Allow major search engines
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /

# Block bad bots
User-agent: AhrefsBot
Disallow: /

User-agent: SemrushBot
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: DotBot
Disallow: /
`;
  }
}

// ================================
// API Routes for Next.js
// ================================

/**
 * Generate sitemap index
 * Usage: /api/sitemap.xml or /sitemap.xml
 */
export async function GET_SitemapIndex() {
  const generator = new SitemapGenerator(
    process.env.NEXT_PUBLIC_SITE_URL,
    ['en', 'fr', 'ar']
  );

  const xml = await generator.generateSitemapIndex();

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}

/**
 * Generate pages sitemap
 */
export async function GET_SitemapPages() {
  const generator = new SitemapGenerator(
    process.env.NEXT_PUBLIC_SITE_URL,
    ['en', 'fr', 'ar']
  );

  const xml = await generator.generatePagesSitemap();

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}

/**
 * Generate articles sitemap by locale
 */
export async function GET_SitemapArticles(locale: string) {
  const generator = new SitemapGenerator(
    process.env.NEXT_PUBLIC_SITE_URL,
    ['en', 'fr', 'ar']
  );

  const xml = await generator.generateArticlesSitemap(locale);

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}

/**
 * Generate categories sitemap
 */
export async function GET_SitemapCategories() {
  const generator = new SitemapGenerator(
    process.env.NEXT_PUBLIC_SITE_URL,
    ['en', 'fr', 'ar']
  );

  const xml = await generator.generateCategoriesSitemap();

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}

/**
 * Generate robots.txt
 */
export async function GET_RobotsTxt() {
  const generator = new RobotsTxtGenerator(
    process.env.NEXT_PUBLIC_SITE_URL
  );

  const content = generator.generate();

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}

// ================================
// Export everything
// ================================
export default {
  SitemapGenerator,
  RobotsTxtGenerator,
  GET_SitemapIndex,
  GET_SitemapPages,
  GET_SitemapArticles,
  GET_SitemapCategories,
  GET_RobotsTxt,
};

// ================================
// Example Usage in Next.js
// ================================
/*
// app/sitemap.xml/route.ts
import { GET_SitemapIndex } from '@/lib/sitemap';
export const GET = GET_SitemapIndex;

// app/sitemap-pages.xml/route.ts
import { GET_SitemapPages } from '@/lib/sitemap';
export const GET = GET_SitemapPages;

// app/sitemap-articles-[locale].xml/route.ts
import { GET_SitemapArticles } from '@/lib/sitemap';
export async function GET(request: Request, { params }: { params: { locale: string } }) {
  return GET_SitemapArticles(params.locale);
}

// app/robots.txt/route.ts
import { GET_RobotsTxt } from '@/lib/sitemap';
export const GET = GET_RobotsTxt;
*/
