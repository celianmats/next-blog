/**
 * Category Page Component
 * Display articles by category with filtering and sorting
 */

'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { useLocale } from 'next-intl';

// ================================
// GraphQL Queries
// ================================
const GET_CATEGORY = gql`
  query GetCategory($slug: String!, $locale: Locale!) {
    category(slug: $slug, locale: $locale) {
      id
      slug
      translations {
        locale
        name
        description
      }
    }
  }
`;

const GET_CATEGORY_ARTICLES = gql`
  query GetCategoryArticles($locale: Locale!, $categoryId: ID!, $limit: Int, $offset: Int, $orderBy: String) {
    articles(locale: $locale, categoryId: $categoryId, limit: $limit, offset: $offset, orderBy: $orderBy) {
      edges {
        node {
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
          featuredImageUrl
          readingTimeMinutes
          viewCount
          publishedAt
          tags {
            slug
            translations {
              name
              locale
            }
          }
        }
      }
      totalCount
      pageInfo {
        hasNextPage
      }
    }
  }
`;

// ================================
// Styled Components
// ================================
const PageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 24px;
`;

const CategoryHeader = styled.header`
  text-align: center;
  margin-bottom: 60px;
  padding: 60px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  color: white;
`;

const CategoryTitle = styled.h1`
  font-size: 56px;
  font-weight: 800;
  margin: 0 0 16px 0;
  text-transform: capitalize;

  @media (max-width: 768px) {
    font-size: 36px;
  }
`;

const CategoryDescription = styled.p`
  font-size: 20px;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
  opacity: 0.95;
`;

const CategoryStats = styled.div`
  display: flex;
  justify-content: center;
  gap: 48px;
  margin-top: 32px;
  font-size: 15px;
  opacity: 0.9;

  @media (max-width: 640px) {
    gap: 24px;
    flex-wrap: wrap;
  }
`;

const Stat = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;

  strong {
    font-size: 28px;
    font-weight: 700;
  }
`;

const ControlBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  flex-wrap: wrap;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const ResultCount = styled.div`
  font-size: 16px;
  color: #666;

  strong {
    color: #1a1a1a;
    font-weight: 600;
  }
`;

const Controls = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;

  @media (max-width: 640px) {
    flex-direction: column;
    width: 100%;
  }
`;

const Select = styled.select`
  padding: 10px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  background: white;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #667eea;
  }

  @media (max-width: 640px) {
    width: 100%;
  }
`;

const ViewToggle = styled.div`
  display: flex;
  gap: 4px;
  background: #f8f9fa;
  padding: 4px;
  border-radius: 8px;
`;

const ViewButton = styled.button<{ $active: boolean }>`
  padding: 8px 12px;
  background: ${props => props.$active ? 'white' : 'transparent'};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: ${props => props.$active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'};

  svg {
    width: 20px;
    height: 20px;
    color: ${props => props.$active ? '#667eea' : '#999'};
  }

  &:hover {
    background: white;
  }
`;

const ArticlesGrid = styled.div<{ $view: 'grid' | 'list' }>`
  display: grid;
  gap: 32px;
  grid-template-columns: ${props =>
    props.$view === 'grid'
      ? 'repeat(auto-fill, minmax(320px, 1fr))'
      : '1fr'
  };
`;

const ArticleCard = styled.article<{ $view: 'grid' | 'list' }>`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
  cursor: pointer;
  display: ${props => props.$view === 'list' ? 'flex' : 'block'};
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
`;

const ArticleImage = styled.div<{ $image: string; $view: 'grid' | 'list' }>`
  width: ${props => props.$view === 'list' ? '280px' : '100%'};
  height: ${props => props.$view === 'list' ? '200px' : '220px'};
  background-image: url(${props => props.$image});
  background-size: cover;
  background-position: center;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: ${props => props.$view === 'list' ? '140px' : '100%'};
    height: ${props => props.$view === 'list' ? '140px' : '180px'};
  }
`;

const ArticleContent = styled.div<{ $view: 'grid' | 'list' }>`
  padding: ${props => props.$view === 'list' ? '24px 32px' : '20px'};
  flex: 1;
`;

const ArticleTitle = styled.h2`
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 12px 0;
  line-height: 1.4;
  color: #1a1a1a;
`;

const ArticleExcerpt = styled.p`
  font-size: 15px;
  line-height: 1.6;
  color: #666;
  margin: 0 0 16px 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ArticleMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: #999;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
`;

const AuthorAvatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
`;

const Tags = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
`;

const Tag = styled.span`
  padding: 4px 12px;
  background: #f8f9fa;
  color: #667eea;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
`;

const LoadMoreButton = styled.button`
  display: block;
  margin: 48px auto 0;
  padding: 14px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: #666;

  svg {
    width: 120px;
    height: 120px;
    margin: 0 auto 24px;
    opacity: 0.3;
  }

  h3 {
    font-size: 24px;
    margin: 0 0 12px 0;
    color: #1a1a1a;
  }

  p {
    font-size: 16px;
    margin: 0;
  }
`;

// ================================
// Category Page Component
// ================================
export default function CategoryPage({ slug }: { slug: string }) {
  const locale = useLocale();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('recent');
  const [page, setPage] = useState(0);

  const ITEMS_PER_PAGE = 12;

  // Get category info
  const { data: categoryData } = useQuery(GET_CATEGORY, {
    variables: {
      slug,
      locale: locale.toUpperCase(),
    },
  });

  // Get articles
  const { data: articlesData, loading, error, fetchMore } = useQuery(GET_CATEGORY_ARTICLES, {
    variables: {
      locale: locale.toUpperCase(),
      categoryId: categoryData?.category?.id,
      limit: ITEMS_PER_PAGE,
      offset: page * ITEMS_PER_PAGE,
      orderBy: sortBy === 'recent' ? 'published_at_desc' : sortBy === 'popular' ? 'view_count_desc' : 'published_at_desc',
    },
    skip: !categoryData?.category?.id,
  });

  const category = categoryData?.category;
  const translation = category?.translations?.find((t: any) => t.locale === locale.toUpperCase());
  const articles = articlesData?.articles?.edges || [];
  const totalCount = articlesData?.articles?.totalCount || 0;
  const hasNextPage = articlesData?.articles?.pageInfo?.hasNextPage;

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setPage(0);
  };

  if (loading && !articles.length) {
    return <div style={{ textAlign: 'center', padding: '100px 20px' }}>Loading...</div>;
  }

  if (error) {
    return <div style={{ textAlign: 'center', padding: '100px 20px' }}>Error: {error.message}</div>;
  }

  if (!category) {
    return <div style={{ textAlign: 'center', padding: '100px 20px' }}>Category not found</div>;
  }

  return (
    <PageContainer>
      <CategoryHeader>
        <CategoryTitle>{translation?.name || slug}</CategoryTitle>
        {translation?.description && (
          <CategoryDescription>{translation.description}</CategoryDescription>
        )}
        <CategoryStats>
          <Stat>
            <strong>{totalCount}</strong>
            <span>Articles</span>
          </Stat>
          <Stat>
            <strong>{Math.ceil(totalCount / 30)}</strong>
            <span>This Month</span>
          </Stat>
        </CategoryStats>
      </CategoryHeader>

      <ControlBar>
        <ResultCount>
          Showing <strong>{articles.length}</strong> of <strong>{totalCount}</strong> articles
        </ResultCount>

        <Controls>
          <Select value={sortBy} onChange={(e) => handleSortChange(e.target.value)}>
            <option value="recent">Most Recent</option>
            <option value="popular">Most Popular</option>
            <option value="oldest">Oldest First</option>
          </Select>

          <ViewToggle>
            <ViewButton $active={view === 'grid'} onClick={() => setView('grid')}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </ViewButton>
            <ViewButton $active={view === 'list'} onClick={() => setView('list')}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </ViewButton>
          </ViewToggle>
        </Controls>
      </ControlBar>

      {articles.length === 0 ? (
        <EmptyState>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3>No articles yet</h3>
          <p>Check back soon for new content in this category</p>
        </EmptyState>
      ) : (
        <>
          <ArticlesGrid $view={view}>
            {articles.map(({ node: article }: any) => (
              <ArticleCard key={article.id} $view={view}>
                <ArticleImage
                  $image={article.featuredImageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=600&fit=crop'}
                  $view={view}
                />
                <ArticleContent $view={view}>
                  <ArticleTitle>{article.content.title}</ArticleTitle>
                  <ArticleExcerpt>{article.content.excerpt}</ArticleExcerpt>

                  {article.tags.length > 0 && (
                    <Tags>
                      {article.tags.slice(0, 3).map((tag: any) => (
                        <Tag key={tag.slug}>
                          {tag.translations.find((t: any) => t.locale === locale.toUpperCase())?.name || tag.slug}
                        </Tag>
                      ))}
                    </Tags>
                  )}

                  <ArticleMeta>
                    {article.author.avatarUrl && (
                      <AuthorAvatar src={article.author.avatarUrl} alt={article.author.name} />
                    )}
                    <span>{article.author.name}</span>
                    <span>•</span>
                    <span>{new Date(article.publishedAt).toLocaleDateString(locale)}</span>
                    <span>•</span>
                    <span>{article.readingTimeMinutes} min read</span>
                  </ArticleMeta>
                </ArticleContent>
              </ArticleCard>
            ))}
          </ArticlesGrid>

          {hasNextPage && (
            <LoadMoreButton onClick={handleLoadMore} disabled={loading}>
              {loading ? 'Loading...' : 'Load More Articles'}
            </LoadMoreButton>
          )}
        </>
      )}
    </PageContainer>
  );
}
