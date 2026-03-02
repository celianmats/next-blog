/**
 * Pagination Component
 * Reusable pagination with multiple styles and RTL support
 */

'use client';

import { useMemo } from 'react';
import styled from 'styled-components';
import { useLocale } from 'next-intl';

// ================================
// Types
// ================================
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  maxVisible?: number;
  variant?: 'default' | 'simple' | 'compact';
  size?: 'sm' | 'md' | 'lg';
}

// ================================
// Styled Components
// ================================
const PaginationContainer = styled.nav`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin: 48px 0;
  user-select: none;
`;

const PageButton = styled.button<{ 
  $active?: boolean; 
  $disabled?: boolean;
  $size?: 'sm' | 'md' | 'lg';
}>`
  min-width: ${props => {
    switch (props.$size) {
      case 'sm': return '32px';
      case 'lg': return '48px';
      default: return '40px';
    }
  }};
  height: ${props => {
    switch (props.$size) {
      case 'sm': return '32px';
      case 'lg': return '48px';
      default: return '40px';
    }
  }};
  padding: 0 ${props => props.$size === 'sm' ? '8px' : '12px'};
  border: 2px solid ${props => props.$active ? '#667eea' : '#e0e0e0'};
  background: ${props => props.$active ? '#667eea' : 'white'};
  color: ${props => props.$active ? 'white' : '#1a1a1a'};
  border-radius: 8px;
  font-size: ${props => props.$size === 'sm' ? '14px' : '15px'};
  font-weight: 600;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${props => props.$disabled ? 0.4 : 1};

  &:hover:not(:disabled) {
    ${props => !props.$active && `
      background: #f8f9fa;
      border-color: #667eea;
      transform: translateY(-2px);
    `}
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const Ellipsis = styled.span`
  padding: 0 8px;
  color: #999;
  font-size: 20px;
  font-weight: 700;
`;

const PageInfo = styled.div<{ $size?: 'sm' | 'md' | 'lg' }>`
  font-size: ${props => props.$size === 'sm' ? '13px' : '14px'};
  color: #666;
  margin: 0 16px;
  white-space: nowrap;

  strong {
    color: #1a1a1a;
    font-weight: 600;
  }
`;

// ================================
// Icon Components
// ================================
const ChevronLeftIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const ChevronsLeftIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
  </svg>
);

const ChevronsRightIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
  </svg>
);

// ================================
// Pagination Component
// ================================
export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  maxVisible = 7,
  variant = 'default',
  size = 'md',
}: PaginationProps) {
  const locale = useLocale();
  const isRTL = locale === 'ar';

  // Generate page numbers to display
  const pageNumbers = useMemo(() => {
    const pages: (number | 'ellipsis')[] = [];
    
    if (totalPages <= maxVisible) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Calculate which pages to show
      const leftSiblingIndex = Math.max(currentPage - 1, 1);
      const rightSiblingIndex = Math.min(currentPage + 1, totalPages);

      const showLeftEllipsis = leftSiblingIndex > 2;
      const showRightEllipsis = rightSiblingIndex < totalPages - 1;

      // Always show first page
      pages.push(1);

      if (showLeftEllipsis) {
        pages.push('ellipsis');
      } else if (leftSiblingIndex === 2) {
        pages.push(2);
      }

      // Show pages around current
      for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }

      if (showRightEllipsis) {
        pages.push('ellipsis');
      } else if (rightSiblingIndex === totalPages - 1) {
        pages.push(totalPages - 1);
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  }, [currentPage, totalPages, maxVisible]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Simple variant - just prev/next
  if (variant === 'simple') {
    return (
      <PaginationContainer>
        <PageButton
          $size={size}
          $disabled={currentPage === 1}
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
          aria-label="Previous page"
        >
          {isRTL ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          <span style={{ marginLeft: '8px' }}>Previous</span>
        </PageButton>

        <PageInfo $size={size}>
          Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
        </PageInfo>

        <PageButton
          $size={size}
          $disabled={currentPage === totalPages}
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
          aria-label="Next page"
        >
          <span style={{ marginRight: '8px' }}>Next</span>
          {isRTL ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </PageButton>
      </PaginationContainer>
    );
  }

  // Compact variant - minimal buttons
  if (variant === 'compact') {
    return (
      <PaginationContainer>
        <PageButton
          $size={size}
          $disabled={currentPage === 1}
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
          aria-label="Previous page"
        >
          {isRTL ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </PageButton>

        <PageInfo $size={size}>
          <strong>{currentPage}</strong> / {totalPages}
        </PageInfo>

        <PageButton
          $size={size}
          $disabled={currentPage === totalPages}
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
          aria-label="Next page"
        >
          {isRTL ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </PageButton>
      </PaginationContainer>
    );
  }

  // Default variant - full pagination
  return (
    <PaginationContainer role="navigation" aria-label="Pagination">
      {/* First page button */}
      {showFirstLast && (
        <PageButton
          $size={size}
          $disabled={currentPage === 1}
          disabled={currentPage === 1}
          onClick={() => handlePageChange(1)}
          aria-label="First page"
        >
          {isRTL ? <ChevronsRightIcon /> : <ChevronsLeftIcon />}
        </PageButton>
      )}

      {/* Previous button */}
      <PageButton
        $size={size}
        $disabled={currentPage === 1}
        disabled={currentPage === 1}
        onClick={() => handlePageChange(currentPage - 1)}
        aria-label="Previous page"
      >
        {isRTL ? <ChevronRightIcon /> : <ChevronLeftIcon />}
      </PageButton>

      {/* Page numbers */}
      {pageNumbers.map((page, index) => {
        if (page === 'ellipsis') {
          return <Ellipsis key={`ellipsis-${index}`}>...</Ellipsis>;
        }

        return (
          <PageButton
            key={page}
            $size={size}
            $active={page === currentPage}
            onClick={() => handlePageChange(page)}
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </PageButton>
        );
      })}

      {/* Next button */}
      <PageButton
        $size={size}
        $disabled={currentPage === totalPages}
        disabled={currentPage === totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
        aria-label="Next page"
      >
        {isRTL ? <ChevronLeftIcon /> : <ChevronRightIcon />}
      </PageButton>

      {/* Last page button */}
      {showFirstLast && (
        <PageButton
          $size={size}
          $disabled={currentPage === totalPages}
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(totalPages)}
          aria-label="Last page"
        >
          {isRTL ? <ChevronsLeftIcon /> : <ChevronsRightIcon />}
        </PageButton>
      )}
    </PaginationContainer>
  );
}

// ================================
// Hook for pagination state
// ================================
export function usePagination(totalItems: number, itemsPerPage: number = 10) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);
  const firstPage = () => goToPage(1);
  const lastPage = () => goToPage(totalPages);

  return {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
}

// ================================
// Example Usage
// ================================
/*
// Basic usage
import Pagination from '@/components/Pagination';

function ArticleList() {
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  return (
    <>
      <ArticleGrid>
        {articles.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE).map(...)}
      </ArticleGrid>
      
      <Pagination
        currentPage={page}
        totalPages={Math.ceil(articles.length / ITEMS_PER_PAGE)}
        onPageChange={setPage}
      />
    </>
  );
}

// With hook
import Pagination, { usePagination } from '@/components/Pagination';

function ArticleList({ articles }) {
  const pagination = usePagination(articles.length, 12);

  return (
    <>
      <ArticleGrid>
        {articles
          .slice(pagination.startIndex, pagination.endIndex)
          .map(article => <ArticleCard key={article.id} article={article} />)
        }
      </ArticleGrid>
      
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={pagination.goToPage}
        variant="default"
        size="md"
      />
    </>
  );
}

// Simple variant
<Pagination
  currentPage={page}
  totalPages={totalPages}
  onPageChange={setPage}
  variant="simple"
/>

// Compact variant
<Pagination
  currentPage={page}
  totalPages={totalPages}
  onPageChange={setPage}
  variant="compact"
  size="sm"
/>
*/
