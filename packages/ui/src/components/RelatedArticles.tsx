/**
 * Related Articles Widget
 * Show related content based on category, tags, or custom logic
 */

'use client';

import styled from 'styled-components';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { useLocale } from 'next-intl';
import Skeleton from './Skeleton';

// ================================
// GraphQL Query
// ================================
const GET_RELATED_ARTICLES = gql`
  query GetRelatedArticles($articleId: ID!, $locale: Locale!, $limit: Int!) {
    article(id: $articleId, locale: $locale) {
      id
      relatedArticles(limit: $limit) {
        id
        slug
        content {
          title
          excerpt
        }
        author {
          name
          avatarUrl
        }
        category {
          slug
          translations {
            name
            locale
          }
        }
        featuredImageUrl
        readingTimeMinutes
        publishedAt
      }
    }
  }
`;

// ================================
// Styled Components
// ================================
const WidgetContainer = styled.aside`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const WidgetTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 20px 0;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    width: 24px;
    height: 24px;
    color: #667eea;
  }
`;

const ArticlesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ArticleCard = styled.a`
  display: flex;
  gap: 12px;
  text-decoration: none;
  color: inherit;
  padding: 12px;
  border-radius: 8px;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    background: #f8f9fa;
    transform: translateX(4px);
  }

  @media (max-width: 768px) {
    padding: 8px;
  }
`;

const ArticleImage = styled.div<{ $image: string }>`
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  background-image: url(${props => props.$image});
  background-size: cover;
  background-position: center;
  border-radius: 6px;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 100%);
  }

  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
  }
`;

const ArticleContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ArticleCategory = styled.span`
  display: inline-block;
  padding: 2px 8px;
  background: #667eea;
  color: white;
  font-size: 10px;
  font-weight: 700;
  border-radius: 8px;
  text-transform: uppercase;
  margin-bottom: 6px;
`;

const ArticleTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 6px 0;
  line-height: 1.4;
  color: #1a1a1a;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ArticleMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #999;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #999;

  svg {
    width: 60px;
    height: 60px;
    margin: 0 auto 12px;
    opacity: 0.3;
  }

  p {
    margin: 0;
    font-size: 14px;
  }
`;

const ViewAllButton = styled.a`
  display: block;
  text-align: center;
  padding: 12px;
  margin-top: 16px;
  background: #f8f9fa;
  color: #667eea;
  font-weight: 600;
  font-size: 14px;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.2s;

  &:hover {
    background: #667eea;
    color: white;
  }
`;

// ================================
// Icon
// ================================
const RelatedIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const EmptyIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

// ================================
// Related Articles Component
// ================================
interface RelatedArticlesProps {
  articleId: string;
  limit?: number;
  showCategory?: boolean;
  title?: string;
  viewAllLink?: string;
}

export default function RelatedArticles({
  articleId,
  limit = 5,
  showCategory = true,
  title,
  viewAllLink,
}: RelatedArticlesProps) {
  const locale = useLocale();

  const { data, loading, error } = useQuery(GET_RELATED_ARTICLES, {
    variables: {
      articleId,
      locale: locale.toUpperCase(),
      limit,
    },
  });

  const translations = {
    en: {
      title: 'Related Articles',
      viewAll: 'View All Articles',
      readingTime: 'min read',
      noRelated: 'No related articles found',
    },
    fr: {
      title: 'Articles Connexes',
      viewAll: 'Voir Tous les Articles',
      readingTime: 'min de lecture',
      noRelated: 'Aucun article connexe trouvé',
    },
    ar: {
      title: 'مقالات ذات صلة',
      viewAll: 'عرض جميع المقالات',
      readingTime: 'دقائق قراءة',
      noRelated: 'لم يتم العثور على مقالات ذات صلة',
    },
  };

  const t = translations[locale as keyof typeof translations] || translations.en;

  if (loading) {
    return (
      <WidgetContainer>
        <WidgetTitle>
          <RelatedIcon />
          {title || t.title}
        </WidgetTitle>
        <ArticlesList>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px' }}>
              <Skeleton.Box width="80px" height="80px" />
              <div style={{ flex: 1 }}>
                <Skeleton.Line width="60%" height="12px" />
                <Skeleton.Line width="90%" height="14px" margin="6px 0" />
                <Skeleton.Line width="40%" height="12px" />
              </div>
            </div>
          ))}
        </ArticlesList>
      </WidgetContainer>
    );
  }

  if (error) {
    console.error('Error loading related articles:', error);
    return null;
  }

  const relatedArticles = data?.article?.relatedArticles || [];

  if (relatedArticles.length === 0) {
    return (
      <WidgetContainer>
        <WidgetTitle>
          <RelatedIcon />
          {title || t.title}
        </WidgetTitle>
        <EmptyState>
          <EmptyIcon />
          <p>{t.noRelated}</p>
        </EmptyState>
      </WidgetContainer>
    );
  }

  return (
    <WidgetContainer>
      <WidgetTitle>
        <RelatedIcon />
        {title || t.title}
      </WidgetTitle>

      <ArticlesList>
        {relatedArticles.map((article: any) => {
          const categoryName = article.category?.translations.find(
            (t: any) => t.locale === locale.toUpperCase()
          )?.name || article.category?.slug;

          return (
            <ArticleCard
              key={article.id}
              href={`/${locale}/${article.slug}`}
            >
              <ArticleImage
                $image={
                  article.featuredImageUrl ||
                  'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=400&fit=crop'
                }
              />
              <ArticleContent>
                {showCategory && categoryName && (
                  <ArticleCategory>{categoryName}</ArticleCategory>
                )}
                <ArticleTitle>{article.content.title}</ArticleTitle>
                <ArticleMeta>
                  <span>{article.author.name}</span>
                  <span>•</span>
                  <span>{article.readingTimeMinutes} {t.readingTime}</span>
                </ArticleMeta>
              </ArticleContent>
            </ArticleCard>
          );
        })}
      </ArticlesList>

      {viewAllLink && (
        <ViewAllButton href={viewAllLink}>
          {t.viewAll}
        </ViewAllButton>
      )}
    </WidgetContainer>
  );
}

// ================================
// Trending Articles Widget
// ================================
const GET_TRENDING_ARTICLES = gql`
  query GetTrendingArticles($locale: Locale!, $limit: Int!) {
    articles(locale: $locale, limit: $limit, orderBy: "view_count_desc") {
      edges {
        node {
          id
          slug
          content {
            title
          }
          featuredImageUrl
          viewCount
          readingTimeMinutes
        }
      }
    }
  }
`;

export function TrendingArticles({ limit = 5 }: { limit?: number }) {
  const locale = useLocale();

  const { data, loading } = useQuery(GET_TRENDING_ARTICLES, {
    variables: {
      locale: locale.toUpperCase(),
      limit,
    },
  });

  const translations = {
    en: { title: 'Trending Now', views: 'views' },
    fr: { title: 'Tendances', views: 'vues' },
    ar: { title: 'الأكثر رواجاً', views: 'مشاهدات' },
  };

  const t = translations[locale as keyof typeof translations] || translations.en;

  if (loading) return null;

  const articles = data?.articles?.edges || [];

  return (
    <WidgetContainer>
      <WidgetTitle>
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        {t.title}
      </WidgetTitle>

      <ArticlesList>
        {articles.map(({ node: article }: any, index: number) => (
          <ArticleCard key={article.id} href={`/${locale}/${article.slug}`}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              flexShrink: 0,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: '14px',
            }}>
              {index + 1}
            </div>
            <ArticleContent>
              <ArticleTitle>{article.content.title}</ArticleTitle>
              <ArticleMeta>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ display: 'inline' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>{article.viewCount.toLocaleString()} {t.views}</span>
              </ArticleMeta>
            </ArticleContent>
          </ArticleCard>
        ))}
      </ArticlesList>
    </WidgetContainer>
  );
}

// ================================
// Example Usage
// ================================
/*
// In article page
import RelatedArticles, { TrendingArticles } from '@/components/RelatedArticles';

<div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '32px' }}>
  <article>
    {/* Article content *\/}
  </article>
  
  <aside>
    <RelatedArticles 
      articleId={article.id} 
      limit={5}
      viewAllLink={`/${locale}/category/${article.category.slug}`}
    />
    
    <div style={{ marginTop: '24px' }}>
      <TrendingArticles limit={5} />
    </div>
  </aside>
</div>
*/
