/**
 * SEO Component
 * Manages meta tags, Open Graph, Twitter Cards, and structured data
 */

import Head from 'next/head';

// ================================
// Types
// ================================
interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  author?: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'article' | 'profile';
  ogImage?: string;
  ogImageAlt?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  twitterHandle?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  locale?: string;
  alternateLocales?: Array<{ locale: string; url: string }>;
  noindex?: boolean;
  nofollow?: boolean;
  structuredData?: object;
}

interface ArticleSEOProps {
  title: string;
  description: string;
  author: {
    name: string;
    url?: string;
  };
  publishedTime: string;
  modifiedTime?: string;
  image: string;
  imageAlt?: string;
  category: string;
  tags?: string[];
  url: string;
  locale?: string;
}

// ================================
// SEO Component
// ================================
export function SEO({
  title = 'Republik - Independent Journalism',
  description = 'Independent journalism for a democratic society. Quality reporting you can trust.',
  keywords = ['journalism', 'news', 'independent media', 'democracy'],
  author,
  canonicalUrl,
  ogType = 'website',
  ogImage = '/images/og-default.jpg',
  ogImageAlt = 'Republik',
  twitterCard = 'summary_large_image',
  twitterHandle = '@republik',
  publishedTime,
  modifiedTime,
  section,
  tags = [],
  locale = 'en',
  alternateLocales = [],
  noindex = false,
  nofollow = false,
  structuredData,
}: SEOProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://republik.com';
  const fullUrl = canonicalUrl || siteUrl;
  const fullImageUrl = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`;

  // Construct robots meta
  const robots = [];
  if (noindex) robots.push('noindex');
  if (nofollow) robots.push('nofollow');
  const robotsContent = robots.length > 0 ? robots.join(', ') : 'index, follow';

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      {author && <meta name="author" content={author} />}
      <meta name="robots" content={robotsContent} />
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />

      {/* Language Alternates */}
      {alternateLocales.map(({ locale: altLocale, url }) => (
        <link key={altLocale} rel="alternate" hrefLang={altLocale} href={url} />
      ))}

      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:alt" content={ogImageAlt} />
      <meta property="og:locale" content={locale} />
      <meta property="og:site_name" content="Republik" />

      {/* Article Specific */}
      {ogType === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {ogType === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {ogType === 'article' && section && (
        <meta property="article:section" content={section} />
      )}
      {ogType === 'article' && tags.map(tag => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:image:alt" content={ogImageAlt} />

      {/* Structured Data (JSON-LD) */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}

      {/* Favicon and App Icons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />
      <meta name="theme-color" content="#667eea" />
    </Head>
  );
}

// ================================
// Article SEO Component
// ================================
export function ArticleSEO({
  title,
  description,
  author,
  publishedTime,
  modifiedTime,
  image,
  imageAlt,
  category,
  tags = [],
  url,
  locale = 'en',
}: ArticleSEOProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://republik.com';
  const fullUrl = url.startsWith('http') ? url : `${siteUrl}${url}`;
  const fullImageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;

  // Structured data for Article
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: title,
    description: description,
    image: fullImageUrl,
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime,
    author: {
      '@type': 'Person',
      name: author.name,
      url: author.url,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Republik',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': fullUrl,
    },
    articleSection: category,
    keywords: tags.join(', '),
  };

  return (
    <SEO
      title={`${title} | Republik`}
      description={description}
      author={author.name}
      canonicalUrl={fullUrl}
      ogType="article"
      ogImage={fullImageUrl}
      ogImageAlt={imageAlt || title}
      publishedTime={publishedTime}
      modifiedTime={modifiedTime}
      section={category}
      tags={tags}
      locale={locale}
      structuredData={structuredData}
    />
  );
}

// ================================
// Website Structured Data
// ================================
export function WebsiteStructuredData() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://republik.com';

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Republik',
    url: siteUrl,
    description: 'Independent journalism for a democratic society',
    publisher: {
      '@type': 'Organization',
      name: 'Republik',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
      },
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

// ================================
// Organization Structured Data
// ================================
export function OrganizationStructuredData() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://republik.com';

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Republik',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description: 'Independent journalism for a democratic society',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'contact@republik.com',
    },
    sameAs: [
      'https://twitter.com/republik',
      'https://facebook.com/republik',
      'https://instagram.com/republik',
      'https://linkedin.com/company/republik',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

// ================================
// Breadcrumb Structured Data
// ================================
interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbStructuredData({ items }: { items: BreadcrumbItem[] }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://republik.com';

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${siteUrl}${item.url}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

// ================================
// Helper Functions
// ================================

/**
 * Generate meta tags for social sharing
 */
export function generateSocialMetaTags(
  title: string,
  description: string,
  image: string,
  url: string
) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://republik.com';
  const fullUrl = url.startsWith('http') ? url : `${siteUrl}${url}`;
  const fullImageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;

  return {
    title,
    openGraph: {
      title,
      description,
      url: fullUrl,
      images: [{ url: fullImageUrl }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [fullImageUrl],
    },
  };
}

/**
 * Generate canonical URL
 */
export function generateCanonicalUrl(path: string): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://republik.com';
  return `${siteUrl}${path}`;
}

/**
 * Generate alternate language links
 */
export function generateAlternateLanguages(
  path: string,
  locales: string[]
): Array<{ locale: string; url: string }> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://republik.com';
  
  return locales.map(locale => ({
    locale,
    url: `${siteUrl}/${locale}${path}`,
  }));
}

// ================================
// Example Usage
// ================================
/*
// In your page component:
import { SEO, ArticleSEO, BreadcrumbStructuredData } from '@/components/SEO';

// Basic page SEO
export default function HomePage() {
  return (
    <>
      <SEO
        title="Home | Republik"
        description="Independent journalism for a democratic society"
        keywords={['journalism', 'news', 'democracy']}
        canonicalUrl="https://republik.com"
      />
      <YourPage />
    </>
  );
}

// Article page SEO
export default function ArticlePage({ article }) {
  return (
    <>
      <ArticleSEO
        title={article.title}
        description={article.excerpt}
        author={{ name: article.author.name }}
        publishedTime={article.publishedAt}
        image={article.featuredImage}
        category={article.category}
        tags={article.tags}
        url={`/articles/${article.slug}`}
      />
      <BreadcrumbStructuredData
        items={[
          { name: 'Home', url: '/' },
          { name: 'Articles', url: '/articles' },
          { name: article.title, url: `/articles/${article.slug}` },
        ]}
      />
      <YourArticle />
    </>
  );
}
*/

export default SEO;
