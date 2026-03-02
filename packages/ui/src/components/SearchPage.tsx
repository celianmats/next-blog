/**
 * Search Component with Filters
 * Full-featured search with RTL support
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { useLocale } from 'next-intl';

// ================================
// GraphQL Queries
// ================================
const SEARCH_ARTICLES = gql`
  query SearchArticles($query: String!, $locale: Locale!, $limit: Int, $offset: Int) {
    searchArticles(query: $query, locale: $locale, limit: $limit, offset: $offset) {
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
          category {
            id
            slug
            translations {
              name
              locale
            }
          }
          publishedAt
          featuredImageUrl
        }
      }
      totalCount
      pageInfo {
        hasNextPage
      }
    }
  }
`;

const SEARCH_SUGGESTIONS = gql`
  query SearchSuggestions($query: String!, $locale: Locale!) {
    searchArticles(query: $query, locale: $locale, limit: 5) {
      edges {
        node {
          id
          slug
          content {
            title
          }
        }
      }
    }
  }
`;

// ================================
// Styled Components
// ================================
const SearchContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
`;

const SearchHeader = styled.div`
  margin-bottom: 48px;
`;

const SearchBarWrapper = styled.div`
  position: relative;
  max-width: 700px;
  margin: 0 auto 24px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 18px 60px 18px 24px;
  font-size: 18px;
  border: 2px solid #e0e0e0;
  border-radius: 50px;
  transition: all 0.2s;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #999;
  }
`;

const SearchButton = styled.button`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-50%) scale(1.05);
  }

  &:active {
    transform: translateY(-50%) scale(0.95);
  }
`;

const SuggestionsDropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 1000;
`;

const SuggestionItem = styled.a`
  display: block;
  padding: 12px 24px;
  color: #1a1a1a;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #f8f9fa;
  }

  &:not(:last-child) {
    border-bottom: 1px solid #f0f0f0;
  }
`;

const FiltersBar = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 32px;
`;

const FilterChip = styled.button<{ $active?: boolean }>`
  padding: 10px 20px;
  border: 2px solid ${props => props.$active ? '#667eea' : '#e0e0e0'};
  background: ${props => props.$active ? '#667eea' : 'white'};
  color: ${props => props.$active ? 'white' : '#1a1a1a'};
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #667eea;
    background: ${props => props.$active ? '#5568d3' : '#f8f9ff'};
  }
`;

const SearchMeta = styled.div`
  text-align: center;
  color: #666;
  font-size: 16px;
  margin-bottom: 32px;

  strong {
    color: #1a1a1a;
  }
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 32px;
  margin-top: 32px;
`;

const ResultCard = styled.article`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
`;

const ResultImage = styled.div<{ $image: string }>`
  width: 100%;
  height: 200px;
  background-image: url(${props => props.$image});
  background-size: cover;
  background-position: center;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 100%);
  }
`;

const ResultContent = styled.div`
  padding: 20px;
`;

const ResultCategory = styled.span`
  display: inline-block;
  padding: 4px 12px;
  background: #667eea;
  color: white;
  font-size: 12px;
  font-weight: 700;
  border-radius: 12px;
  text-transform: uppercase;
  margin-bottom: 12px;
`;

const ResultTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 12px 0;
  line-height: 1.4;
  color: #1a1a1a;

  mark {
    background: #fff59d;
    color: inherit;
    padding: 2px 4px;
    border-radius: 2px;
  }
`;

const ResultExcerpt = styled.p`
  font-size: 15px;
  line-height: 1.6;
  color: #666;
  margin: 0 0 16px 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;

  mark {
    background: #fff59d;
    color: inherit;
    font-weight: 600;
  }
`;

const ResultMeta = styled.div`
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
// Search Component
// ================================
export default function SearchPage() {
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [page, setPage] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const RESULTS_PER_PAGE = 12;

  // Main search query
  const { data, loading, error, fetchMore } = useQuery(SEARCH_ARTICLES, {
    variables: {
      query: activeQuery,
      locale: locale.toUpperCase(),
      limit: RESULTS_PER_PAGE,
      offset: page * RESULTS_PER_PAGE,
    },
    skip: !activeQuery,
  });

  // Suggestions query
  const { data: suggestionsData } = useQuery(SEARCH_SUGGESTIONS, {
    variables: {
      query: searchQuery,
      locale: locale.toUpperCase(),
    },
    skip: searchQuery.length < 3,
  });

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveQuery(searchQuery);
      setShowSuggestions(false);
      setPage(0);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setActiveQuery(suggestion);
    setShowSuggestions(false);
  };

  // Load more results
  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  // Highlight search terms in text
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase()
        ? `<mark>${part}</mark>`
        : part
    ).join('');
  };

  const categories = ['All', 'Politics', 'Economy', 'Culture', 'Technology', 'Environment'];

  return (
    <SearchContainer>
      <SearchHeader>
        <h1 style={{ textAlign: 'center', fontSize: '42px', fontWeight: '800', marginBottom: '16px' }}>
          Search Articles
        </h1>
        <p style={{ textAlign: 'center', color: '#666', fontSize: '18px', margin: '0 0 32px 0' }}>
          Find quality journalism that matters
        </p>

        <SearchBarWrapper>
          <form onSubmit={handleSearch}>
            <SearchInput
              ref={searchInputRef}
              type="text"
              placeholder="Search articles, authors, topics..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            <SearchButton type="submit">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </SearchButton>
          </form>

          {showSuggestions && suggestionsData && searchQuery.length >= 3 && (
            <SuggestionsDropdown>
              {suggestionsData.searchArticles.edges.map(({ node }: any) => (
                <SuggestionItem
                  key={node.id}
                  onClick={() => handleSuggestionClick(node.content.title)}
                >
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {node.content.title}
                </SuggestionItem>
              ))}
            </SuggestionsDropdown>
          )}
        </SearchBarWrapper>

        <FiltersBar>
          {categories.map(category => (
            <FilterChip
              key={category}
              $active={selectedCategory === category}
              onClick={() => setSelectedCategory(category === 'All' ? null : category)}
            >
              {category}
            </FilterChip>
          ))}
        </FiltersBar>
      </SearchHeader>

      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '18px', color: '#666' }}>Searching...</div>
        </div>
      )}

      {error && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '18px', color: '#c33' }}>Error: {error.message}</div>
        </div>
      )}

      {data && data.searchArticles.edges.length > 0 && (
        <>
          <SearchMeta>
            Found <strong>{data.searchArticles.totalCount}</strong> results for "{activeQuery}"
          </SearchMeta>

          <ResultsGrid>
            {data.searchArticles.edges.map(({ node: article }: any) => (
              <ResultCard key={article.id}>
                <ResultImage
                  $image={article.featuredImageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=600&fit=crop'}
                />
                <ResultContent>
                  {article.category && (
                    <ResultCategory>
                      {article.category.translations.find((t: any) => t.locale === locale.toUpperCase())?.name || article.category.slug}
                    </ResultCategory>
                  )}
                  <ResultTitle
                    dangerouslySetInnerHTML={{
                      __html: highlightText(article.content.title, activeQuery)
                    }}
                  />
                  <ResultExcerpt
                    dangerouslySetInnerHTML={{
                      __html: highlightText(article.content.excerpt, activeQuery)
                    }}
                  />
                  <ResultMeta>
                    {article.author.avatarUrl && (
                      <AuthorAvatar src={article.author.avatarUrl} alt={article.author.name} />
                    )}
                    <span>{article.author.name}</span>
                    <span>•</span>
                    <span>{new Date(article.publishedAt).toLocaleDateString(locale)}</span>
                  </ResultMeta>
                </ResultContent>
              </ResultCard>
            ))}
          </ResultsGrid>

          {data.searchArticles.pageInfo.hasNextPage && (
            <LoadMoreButton onClick={handleLoadMore} disabled={loading}>
              {loading ? 'Loading...' : 'Load More'}
            </LoadMoreButton>
          )}
        </>
      )}

      {data && data.searchArticles.edges.length === 0 && activeQuery && (
        <EmptyState>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3>No results found</h3>
          <p>Try different keywords or browse our categories</p>
        </EmptyState>
      )}
    </SearchContainer>
  );
}
