/**
 * Analytics Dashboard Component
 * Real-time metrics and charts for admin
 */

'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';

// ================================
// GraphQL Queries
// ================================
const GET_ANALYTICS = gql`
  query GetAnalytics($startDate: DateTime!, $endDate: DateTime!) {
    analytics(startDate: $startDate, endDate: $endDate) {
      totalViews
      totalArticles
      totalUsers
      totalComments
      viewsGrowth
      usersGrowth
      topArticles {
        id
        slug
        content {
          title
        }
        viewCount
        publishedAt
      }
      viewsByDay {
        date
        views
      }
      articlesByCategory {
        category {
          slug
          translations {
            name
            locale
          }
        }
        count
      }
    }
  }
`;

// ================================
// Styled Components
// ================================
const DashboardContainer = styled.div`
  padding: 32px;
  background: #f8f9fa;
  min-height: 100vh;
`;

const DashboardHeader = styled.div`
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 800;
  margin: 0 0 8px 0;
  color: #1a1a1a;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #666;
  margin: 0;
`;

const DateSelector = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
  flex-wrap: wrap;
`;

const DateButton = styled.button<{ $active: boolean }>`
  padding: 10px 20px;
  background: ${props => props.$active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white'};
  color: ${props => props.$active ? 'white' : '#666'};
  border: 1px solid ${props => props.$active ? 'transparent' : '#e0e0e0'};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const MetricCard = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }
`;

const MetricLabel = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
`;

const MetricValue = styled.div`
  font-size: 36px;
  font-weight: 800;
  color: #1a1a1a;
  margin-bottom: 8px;
`;

const MetricChange = styled.div<{ $positive: boolean }>`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.$positive ? '#28a745' : '#dc3545'};
  display: flex;
  align-items: center;
  gap: 4px;

  svg {
    width: 16px;
    height: 16px;
  }
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 24px;
  margin-bottom: 32px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: white;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const ChartTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 24px 0;
  color: #1a1a1a;
`;

const BarChart = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Bar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const BarLabel = styled.div`
  width: 120px;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  text-align: right;
`;

const BarTrack = styled.div`
  flex: 1;
  height: 32px;
  background: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
`;

const BarFill = styled.div<{ $width: number; $color: string }>`
  height: 100%;
  width: ${props => props.$width}%;
  background: ${props => props.$color};
  border-radius: 8px;
  transition: width 0.5s ease;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 12px;
  color: white;
  font-weight: 600;
  font-size: 13px;
`;

const LineChart = styled.div`
  height: 300px;
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 20px 0;
`;

const LineBar = styled.div<{ $height: number }>`
  flex: 1;
  height: ${props => props.$height}%;
  background: linear-gradient(to top, #667eea, #764ba2);
  border-radius: 4px 4px 0 0;
  transition: height 0.3s ease;
  position: relative;
  cursor: pointer;

  &:hover {
    background: linear-gradient(to top, #5568d3, #6a3d8f);
    
    &::after {
      opacity: 1;
    }
  }

  &::after {
    content: attr(data-value);
    position: absolute;
    top: -30px;
    left: 50%;
    transform: translateX(-50%);
    background: #1a1a1a;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.2s;
    pointer-events: none;
  }
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Thead = styled.thead`
  background: #f8f9fa;
`;

const Th = styled.th`
  padding: 16px;
  text-align: left;
  font-size: 13px;
  font-weight: 700;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e0e0e0;
`;

const Td = styled.td`
  padding: 16px;
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
`;

const ArticleLink = styled.a`
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ViewCount = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #1a1a1a;

  svg {
    width: 16px;
    height: 16px;
    color: #999;
  }
`;

const LoadingSkeleton = styled.div`
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 8px;
  height: 200px;

  @keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

// ================================
// Analytics Dashboard Component
// ================================
export default function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState('7days');

  const getDateRange = () => {
    const end = new Date();
    const start = new Date();

    switch (dateRange) {
      case '7days':
        start.setDate(end.getDate() - 7);
        break;
      case '30days':
        start.setDate(end.getDate() - 30);
        break;
      case '90days':
        start.setDate(end.getDate() - 90);
        break;
      default:
        start.setDate(end.getDate() - 7);
    }

    return { startDate: start.toISOString(), endDate: end.toISOString() };
  };

  const { data, loading, error } = useQuery(GET_ANALYTICS, {
    variables: getDateRange(),
  });

  if (error) {
    return <div>Error loading analytics: {error.message}</div>;
  }

  const analytics = data?.analytics || {
    totalViews: 0,
    totalArticles: 0,
    totalUsers: 0,
    totalComments: 0,
    viewsGrowth: 0,
    usersGrowth: 0,
    topArticles: [],
    viewsByDay: [],
    articlesByCategory: [],
  };

  const maxViews = Math.max(...analytics.viewsByDay.map((d: any) => d.views), 1);
  const maxCategoryCount = Math.max(...analytics.articlesByCategory.map((c: any) => c.count), 1);

  const categoryColors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b'];

  return (
    <DashboardContainer>
      <DashboardHeader>
        <Title>Analytics Dashboard</Title>
        <Subtitle>Track your platform's performance and engagement</Subtitle>

        <DateSelector>
          <DateButton
            $active={dateRange === '7days'}
            onClick={() => setDateRange('7days')}
          >
            Last 7 Days
          </DateButton>
          <DateButton
            $active={dateRange === '30days'}
            onClick={() => setDateRange('30days')}
          >
            Last 30 Days
          </DateButton>
          <DateButton
            $active={dateRange === '90days'}
            onClick={() => setDateRange('90days')}
          >
            Last 90 Days
          </DateButton>
        </DateSelector>
      </DashboardHeader>

      {loading ? (
        <LoadingSkeleton />
      ) : (
        <>
          <MetricsGrid>
            <MetricCard>
              <MetricLabel>Total Views</MetricLabel>
              <MetricValue>{analytics.totalViews.toLocaleString()}</MetricValue>
              <MetricChange $positive={analytics.viewsGrowth >= 0}>
                {analytics.viewsGrowth >= 0 ? (
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                ) : (
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                )}
                {Math.abs(analytics.viewsGrowth)}% from last period
              </MetricChange>
            </MetricCard>

            <MetricCard>
              <MetricLabel>Total Articles</MetricLabel>
              <MetricValue>{analytics.totalArticles}</MetricValue>
              <MetricChange $positive={true}>
                Published content
              </MetricChange>
            </MetricCard>

            <MetricCard>
              <MetricLabel>Total Users</MetricLabel>
              <MetricValue>{analytics.totalUsers.toLocaleString()}</MetricValue>
              <MetricChange $positive={analytics.usersGrowth >= 0}>
                {analytics.usersGrowth >= 0 ? (
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                ) : (
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                )}
                {Math.abs(analytics.usersGrowth)}% growth
              </MetricChange>
            </MetricCard>

            <MetricCard>
              <MetricLabel>Total Comments</MetricLabel>
              <MetricValue>{analytics.totalComments.toLocaleString()}</MetricValue>
              <MetricChange $positive={true}>
                User engagement
              </MetricChange>
            </MetricCard>
          </MetricsGrid>

          <ChartsGrid>
            <ChartCard>
              <ChartTitle>Views Over Time</ChartTitle>
              <LineChart>
                {analytics.viewsByDay.map((day: any, index: number) => (
                  <LineBar
                    key={index}
                    $height={(day.views / maxViews) * 100}
                    data-value={day.views}
                  />
                ))}
              </LineChart>
            </ChartCard>

            <ChartCard>
              <ChartTitle>Articles by Category</ChartTitle>
              <BarChart>
                {analytics.articlesByCategory.map((item: any, index: number) => (
                  <Bar key={item.category.slug}>
                    <BarLabel>
                      {item.category.translations[0]?.name || item.category.slug}
                    </BarLabel>
                    <BarTrack>
                      <BarFill
                        $width={(item.count / maxCategoryCount) * 100}
                        $color={categoryColors[index % categoryColors.length]}
                      >
                        {item.count}
                      </BarFill>
                    </BarTrack>
                  </Bar>
                ))}
              </BarChart>
            </ChartCard>
          </ChartsGrid>

          <TableContainer>
            <ChartTitle style={{ padding: '24px 24px 0' }}>Top Performing Articles</ChartTitle>
            <Table>
              <Thead>
                <tr>
                  <Th>Article</Th>
                  <Th>Views</Th>
                  <Th>Published</Th>
                </tr>
              </Thead>
              <tbody>
                {analytics.topArticles.map((article: any) => (
                  <tr key={article.id}>
                    <Td>
                      <ArticleLink href={`/articles/${article.slug}`}>
                        {article.content.title}
                      </ArticleLink>
                    </Td>
                    <Td>
                      <ViewCount>
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {article.viewCount.toLocaleString()}
                      </ViewCount>
                    </Td>
                    <Td>
                      {new Date(article.publishedAt).toLocaleDateString()}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableContainer>
        </>
      )}
    </DashboardContainer>
  );
}
