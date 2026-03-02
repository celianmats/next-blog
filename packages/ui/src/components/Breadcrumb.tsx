/**
 * Breadcrumb Navigation Component
 * SEO-friendly breadcrumbs with schema markup and RTL support
 */

'use client';

import styled from 'styled-components';
import { useLocale } from 'next-intl';
import { BreadcrumbStructuredData } from './SEO';

// ================================
// Types
// ================================
export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: 'slash' | 'chevron' | 'dot';
  showHome?: boolean;
  maxItems?: number;
}

// ================================
// Styled Components
// ================================
const BreadcrumbNav = styled.nav`
  padding: 16px 0;
  font-size: 14px;
`;

const BreadcrumbList = styled.ol`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  list-style: none;
  padding: 0;
  margin: 0;
`;

const BreadcrumbItem = styled.li`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const BreadcrumbLink = styled.a<{ $active?: boolean }>`
  color: ${props => props.$active ? '#1a1a1a' : '#666'};
  text-decoration: none;
  font-weight: ${props => props.$active ? 600 : 400};
  transition: color 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: ${props => props.$active ? 'default' : 'pointer'};

  &:hover:not([aria-current]) {
    color: #667eea;
    text-decoration: underline;
  }

  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
`;

const Separator = styled.span`
  color: #ccc;
  user-select: none;
  display: flex;
  align-items: center;

  svg {
    width: 16px;
    height: 16px;
  }
`;

const CollapsedButton = styled.button`
  background: transparent;
  border: none;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: color 0.2s;

  &:hover {
    color: #667eea;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

// ================================
// Icons
// ================================
const HomeIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const MoreIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
  </svg>
);

// ================================
// Breadcrumb Component
// ================================
export default function Breadcrumb({
  items,
  separator = 'chevron',
  showHome = true,
  maxItems = 0,
}: BreadcrumbProps) {
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const translations = {
    en: { home: 'Home' },
    fr: { home: 'Accueil' },
    ar: { home: 'الرئيسية' },
  };

  const t = translations[locale as keyof typeof translations] || translations.en;

  // Add home item if needed
  const allItems = showHome
    ? [{ label: t.home, href: `/${locale}`, icon: <HomeIcon /> }, ...items]
    : items;

  // Collapse items if needed
  const displayItems = maxItems > 0 && allItems.length > maxItems
    ? [
        allItems[0],
        { label: '...', href: undefined },
        ...allItems.slice(-(maxItems - 2)),
      ]
    : allItems;

  // Get separator icon
  const getSeparator = () => {
    switch (separator) {
      case 'slash':
        return '/';
      case 'dot':
        return '•';
      case 'chevron':
      default:
        return isRTL ? <ChevronLeftIcon /> : <ChevronRightIcon />;
    }
  };

  // Prepare structured data items
  const structuredDataItems = allItems
    .filter(item => item.href)
    .map(item => ({
      name: item.label,
      url: item.href!,
    }));

  return (
    <>
      <BreadcrumbNav aria-label="Breadcrumb">
        <BreadcrumbList>
          {displayItems.map((item, index) => {
            const isLast = index === displayItems.length - 1;
            const isCollapsed = item.label === '...';

            return (
              <BreadcrumbItem key={index}>
                {isCollapsed ? (
                  <CollapsedButton type="button" aria-label="Show all breadcrumbs">
                    <MoreIcon />
                  </CollapsedButton>
                ) : item.href ? (
                  <BreadcrumbLink
                    href={item.href}
                    $active={isLast}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbLink as="span" $active>
                    {item.icon}
                    <span>{item.label}</span>
                  </BreadcrumbLink>
                )}

                {!isLast && (
                  <Separator aria-hidden="true">
                    {getSeparator()}
                  </Separator>
                )}
              </BreadcrumbItem>
            );
          })}
        </BreadcrumbList>
      </breadcrumbNav>

      {/* Structured data for SEO */}
      <BreadcrumbStructuredData items={structuredDataItems} />
    </>
  );
}

// ================================
// Breadcrumb Utilities
// ================================

/**
 * Generate breadcrumbs from pathname
 */
export function generateBreadcrumbs(
  pathname: string,
  locale: string
): BreadcrumbItem[] {
  const segments = pathname
    .split('/')
    .filter(segment => segment && segment !== locale);

  const breadcrumbs: BreadcrumbItem[] = [];
  let currentPath = `/${locale}`;

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Capitalize and format segment
    const label = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    breadcrumbs.push({
      label,
      href: index < segments.length - 1 ? currentPath : undefined,
    });
  });

  return breadcrumbs;
}

/**
 * Create article breadcrumbs
 */
export function createArticleBreadcrumbs(
  article: {
    title: string;
    slug: string;
    category?: {
      name: string;
      slug: string;
    };
  },
  locale: string
): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [
    {
      label: 'Articles',
      href: `/${locale}/articles`,
    },
  ];

  if (article.category) {
    breadcrumbs.push({
      label: article.category.name,
      href: `/${locale}/category/${article.category.slug}`,
    });
  }

  breadcrumbs.push({
    label: article.title,
    href: undefined, // Current page, no link
  });

  return breadcrumbs;
}

/**
 * Create category breadcrumbs
 */
export function createCategoryBreadcrumbs(
  categoryName: string,
  locale: string
): BreadcrumbItem[] {
  return [
    {
      label: 'Categories',
      href: `/${locale}/categories`,
    },
    {
      label: categoryName,
      href: undefined,
    },
  ];
}

/**
 * Create search breadcrumbs
 */
export function createSearchBreadcrumbs(
  query: string,
  locale: string
): BreadcrumbItem[] {
  return [
    {
      label: 'Search',
      href: `/${locale}/search`,
    },
    {
      label: `Results for "${query}"`,
      href: undefined,
    },
  ];
}

// ================================
// Example Usage
// ================================
/*
// Basic usage
import Breadcrumb from '@/components/Breadcrumb';

<Breadcrumb
  items={[
    { label: 'Articles', href: '/en/articles' },
    { label: 'Politics', href: '/en/category/politics' },
    { label: 'Current Article Title' },
  ]}
/>

// Article page
import Breadcrumb, { createArticleBreadcrumbs } from '@/components/Breadcrumb';

function ArticlePage({ article }) {
  const breadcrumbs = createArticleBreadcrumbs(article, 'en');
  
  return (
    <>
      <Breadcrumb items={breadcrumbs} />
      <Article />
    </>
  );
}

// With different separator
<Breadcrumb
  items={breadcrumbs}
  separator="slash"
/>

// Collapsed (show first and last 2 items)
<Breadcrumb
  items={longBreadcrumbs}
  maxItems={4}
/>

// Without home
<Breadcrumb
  items={breadcrumbs}
  showHome={false}
/>

// Auto-generate from pathname
import { generateBreadcrumbs } from '@/components/Breadcrumb';

const pathname = '/en/category/politics/subcategory';
const breadcrumbs = generateBreadcrumbs(pathname, 'en');
// Returns: [
//   { label: 'Category', href: '/en/category' },
//   { label: 'Politics', href: '/en/category/politics' },
//   { label: 'Subcategory' }
// ]
*/
