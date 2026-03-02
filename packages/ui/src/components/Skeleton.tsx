/**
 * Loading Skeleton Components
 * Placeholder components for content loading states
 */

import styled, { keyframes } from 'styled-components';

// ================================
// Animations
// ================================
const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

// ================================
// Base Skeleton
// ================================
const SkeletonBase = styled.div`
  background: linear-gradient(
    90deg,
    #f0f0f0 0px,
    #f8f8f8 40px,
    #f0f0f0 80px
  );
  background-size: 1000px 100%;
  animation: ${shimmer} 2s infinite linear;
  border-radius: 4px;
`;

// ================================
// Skeleton Primitives
// ================================
export const SkeletonLine = styled(SkeletonBase)<{ 
  width?: string; 
  height?: string;
  margin?: string;
}>`
  width: ${props => props.width || '100%'};
  height: ${props => props.height || '16px'};
  margin: ${props => props.margin || '0 0 12px 0'};
`;

export const SkeletonCircle = styled(SkeletonBase)<{ size?: string }>`
  width: ${props => props.size || '40px'};
  height: ${props => props.size || '40px'};
  border-radius: 50%;
`;

export const SkeletonBox = styled(SkeletonBase)<{ 
  width?: string; 
  height?: string;
  margin?: string;
}>`
  width: ${props => props.width || '100%'};
  height: ${props => props.height || '200px'};
  margin: ${props => props.margin || '0'};
  border-radius: 8px;
`;

// ================================
// Article Card Skeleton
// ================================
const ArticleCardContainer = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ArticleCardImage = styled(SkeletonBox)`
  height: 220px;
  border-radius: 0;
`;

const ArticleCardContent = styled.div`
  padding: 20px;
`;

export function ArticleCardSkeleton() {
  return (
    <ArticleCardContainer>
      <ArticleCardImage />
      <ArticleCardContent>
        <SkeletonLine width="30%" height="14px" />
        <SkeletonLine width="90%" height="20px" margin="12px 0" />
        <SkeletonLine width="95%" height="14px" />
        <SkeletonLine width="85%" height="14px" />
        <SkeletonLine width="40%" height="14px" margin="16px 0 0 0" />
      </ArticleCardContent>
    </ArticleCardContainer>
  );
}

// ================================
// Article Detail Skeleton
// ================================
const ArticleDetailContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 24px;
`;

const ArticleDetailHeader = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

export function ArticleDetailSkeleton() {
  return (
    <ArticleDetailContainer>
      <ArticleDetailHeader>
        <SkeletonLine width="40%" height="14px" margin="0 auto 16px" />
        <SkeletonLine width="80%" height="32px" margin="0 auto 16px" />
        <SkeletonLine width="60%" height="18px" margin="0 auto 24px" />
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <SkeletonCircle size="48px" />
            <div>
              <SkeletonLine width="120px" height="14px" />
              <SkeletonLine width="100px" height="12px" />
            </div>
          </div>
        </div>
      </ArticleDetailHeader>

      <SkeletonBox height="400px" margin="0 0 40px 0" />

      <SkeletonLine width="100%" height="16px" />
      <SkeletonLine width="100%" height="16px" />
      <SkeletonLine width="100%" height="16px" />
      <SkeletonLine width="90%" height="16px" />
      <SkeletonLine width="100%" height="16px" margin="24px 0 12px 0" />
      <SkeletonLine width="100%" height="16px" />
      <SkeletonLine width="95%" height="16px" />
      <SkeletonLine width="100%" height="16px" />
      <SkeletonLine width="85%" height="16px" />
    </ArticleDetailContainer>
  );
}

// ================================
// Comment Skeleton
// ================================
const CommentContainer = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
`;

const CommentHeader = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
`;

export function CommentSkeleton() {
  return (
    <CommentContainer>
      <CommentHeader>
        <SkeletonCircle size="40px" />
        <div style={{ flex: 1 }}>
          <SkeletonLine width="150px" height="14px" />
          <SkeletonLine width="100px" height="12px" />
        </div>
      </CommentHeader>
      <SkeletonLine width="100%" height="14px" />
      <SkeletonLine width="95%" height="14px" />
      <SkeletonLine width="60%" height="14px" />
    </CommentContainer>
  );
}

// ================================
// User Profile Skeleton
// ================================
const ProfileContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 48px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  gap: 40px;

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 32px 24px;
  }
`;

export function UserProfileSkeleton() {
  return (
    <ProfileContainer>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <SkeletonCircle size="160px" />
        <SkeletonLine width="120px" height="14px" />
      </div>
      <div style={{ flex: 1 }}>
        <SkeletonLine width="250px" height="32px" margin="0 0 8px 0" />
        <SkeletonLine width="200px" height="16px" margin="0 0 24px 0" />
        <SkeletonLine width="100%" height="14px" />
        <SkeletonLine width="90%" height="14px" />
        <div style={{ display: 'flex', gap: '32px', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e0e0e0' }}>
          <div>
            <SkeletonLine width="60px" height="24px" />
            <SkeletonLine width="80px" height="12px" />
          </div>
          <div>
            <SkeletonLine width="60px" height="24px" />
            <SkeletonLine width="80px" height="12px" />
          </div>
          <div>
            <SkeletonLine width="60px" height="24px" />
            <SkeletonLine width="80px" height="12px" />
          </div>
        </div>
      </div>
    </ProfileContainer>
  );
}

// ================================
// Search Results Skeleton
// ================================
const SearchResultContainer = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  display: flex;
  gap: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export function SearchResultSkeleton() {
  return (
    <SearchResultContainer>
      <SkeletonBox width="200px" height="150px" />
      <div style={{ flex: 1 }}>
        <SkeletonLine width="30%" height="12px" />
        <SkeletonLine width="90%" height="20px" margin="12px 0" />
        <SkeletonLine width="100%" height="14px" />
        <SkeletonLine width="95%" height="14px" />
        <SkeletonLine width="40%" height="12px" margin="16px 0 0 0" />
      </div>
    </SearchResultContainer>
  );
}

// ================================
// Category Header Skeleton
// ================================
const CategoryHeaderContainer = styled.div`
  text-align: center;
  padding: 60px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  margin-bottom: 60px;
`;

export function CategoryHeaderSkeleton() {
  return (
    <CategoryHeaderContainer>
      <SkeletonLine width="200px" height="48px" margin="0 auto 16px" style={{ background: 'rgba(255,255,255,0.2)' }} />
      <SkeletonLine width="400px" height="18px" margin="0 auto 32px" style={{ background: 'rgba(255,255,255,0.2)' }} />
      <div style={{ display: 'flex', justifyContent: 'center', gap: '48px' }}>
        <div>
          <SkeletonLine width="60px" height="28px" style={{ background: 'rgba(255,255,255,0.2)' }} />
          <SkeletonLine width="80px" height="14px" style={{ background: 'rgba(255,255,255,0.2)' }} />
        </div>
        <div>
          <SkeletonLine width="60px" height="28px" style={{ background: 'rgba(255,255,255,0.2)' }} />
          <SkeletonLine width="80px" height="14px" style={{ background: 'rgba(255,255,255,0.2)' }} />
        </div>
      </div>
    </CategoryHeaderContainer>
  );
}

// ================================
// Analytics Card Skeleton
// ================================
const AnalyticsCardContainer = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

export function AnalyticsCardSkeleton() {
  return (
    <AnalyticsCardContainer>
      <SkeletonLine width="120px" height="12px" />
      <SkeletonLine width="100px" height="36px" margin="8px 0" />
      <SkeletonLine width="150px" height="14px" />
    </AnalyticsCardContainer>
  );
}

// ================================
// Table Skeleton
// ================================
const TableContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
`;

const TableRow = styled.div`
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 16px;
  align-items: center;

  &:first-child {
    background: #f8f9fa;
  }
`;

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <TableContainer>
      <TableRow>
        <SkeletonLine width="100px" height="12px" />
        <SkeletonLine width="80px" height="12px" />
        <SkeletonLine width="80px" height="12px" />
      </TableRow>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i}>
          <SkeletonLine width="90%" height="14px" />
          <SkeletonLine width="70%" height="14px" />
          <SkeletonLine width="60%" height="14px" />
        </TableRow>
      ))}
    </TableContainer>
  );
}

// ================================
// Grid Skeleton
// ================================
const GridContainer = styled.div<{ columns?: number }>`
  display: grid;
  grid-template-columns: ${props => `repeat(${props.columns || 3}, 1fr)`};
  gap: 32px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export function GridSkeleton({ items = 6, columns = 3, component: Component = ArticleCardSkeleton }: { 
  items?: number; 
  columns?: number;
  component?: React.ComponentType;
}) {
  return (
    <GridContainer columns={columns}>
      {Array.from({ length: items }).map((_, i) => (
        <Component key={i} />
      ))}
    </GridContainer>
  );
}

// ================================
// List Skeleton
// ================================
const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export function ListSkeleton({ items = 5, component: Component = CommentSkeleton }: { 
  items?: number;
  component?: React.ComponentType;
}) {
  return (
    <ListContainer>
      {Array.from({ length: items }).map((_, i) => (
        <Component key={i} />
      ))}
    </ListContainer>
  );
}

// ================================
// Page Skeleton
// ================================
export function PageSkeleton() {
  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 24px' }}>
      <SkeletonLine width="300px" height="40px" margin="0 0 32px 0" />
      <GridSkeleton items={6} />
    </div>
  );
}

// ================================
// Export all
// ================================
export default {
  Line: SkeletonLine,
  Circle: SkeletonCircle,
  Box: SkeletonBox,
  ArticleCard: ArticleCardSkeleton,
  ArticleDetail: ArticleDetailSkeleton,
  Comment: CommentSkeleton,
  UserProfile: UserProfileSkeleton,
  SearchResult: SearchResultSkeleton,
  CategoryHeader: CategoryHeaderSkeleton,
  AnalyticsCard: AnalyticsCardSkeleton,
  Table: TableSkeleton,
  Grid: GridSkeleton,
  List: ListSkeleton,
  Page: PageSkeleton,
};
