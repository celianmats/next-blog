'use client';

import { useTranslations, useLocale } from 'next-intl';
import styled, { ThemeProvider } from 'styled-components';
import { useState } from 'react';

// Theme configuration with RTL support
const createTheme = (locale: string) => ({
  direction: locale === 'ar' ? 'rtl' : 'ltr',
  colors: {
    primary: '#1a1a1a',
    secondary: '#e63946',
    background: '#ffffff',
    text: '#1a1a1a',
    textLight: '#666666',
    border: '#e0e0e0',
  },
  fonts: {
    body: locale === 'ar' ? "'Cairo', sans-serif" : "'GT America', -apple-system, sans-serif",
    heading: locale === 'ar' ? "'Cairo', sans-serif" : "'GT America', -apple-system, sans-serif",
  },
});

// Styled Components with RTL awareness
const PageContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.colors.background};
  direction: ${props => props.theme.direction};
`;

const Header = styled.header`
  border-bottom: 1px solid ${props => props.theme.colors.border};
  padding: 20px 0;
  position: sticky;
  top: 0;
  background: ${props => props.theme.colors.background};
  z-index: 100;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
`;

const Nav = styled.nav`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.h1`
  font-size: 28px;
  font-weight: 800;
  margin: 0;
  font-family: ${props => props.theme.fonts.heading};
  letter-spacing: -0.5px;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 32px;
  align-items: center;

  @media (max-width: 768px) {
    gap: 16px;
  }
`;

const NavLink = styled.a`
  color: ${props => props.theme.colors.text};
  text-decoration: none;
  font-weight: 500;
  font-size: 15px;
  transition: color 0.2s;
  cursor: pointer;

  &:hover {
    color: ${props => props.theme.colors.secondary};
  }
`;

const LanguageSwitcher = styled.div`
  display: flex;
  gap: 8px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  padding: 4px;
`;

const LanguageButton = styled.button<{ $active: boolean }>`
  padding: 6px 12px;
  background: ${props => props.$active ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.$active ? props.theme.colors.background : props.theme.colors.text};
  border: none;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: ${props => props.theme.fonts.body};

  &:hover {
    background: ${props => props.$active ? props.theme.colors.primary : '#f5f5f5'};
  }
`;

const Main = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 24px;
`;

const Hero = styled.section`
  margin-bottom: 80px;
  text-align: ${props => props.theme.direction === 'rtl' ? 'right' : 'left'};
`;

const HeroTitle = styled.h2`
  font-size: 56px;
  font-weight: 800;
  line-height: 1.1;
  margin: 0 0 24px 0;
  font-family: ${props => props.theme.fonts.heading};
  letter-spacing: -1px;

  @media (max-width: 768px) {
    font-size: 36px;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 20px;
  line-height: 1.6;
  color: ${props => props.theme.colors.textLight};
  max-width: 600px;
  margin: 0;
`;

const ArticlesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 32px;
  margin-top: 60px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ArticleCard = styled.article`
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
  }
`;

const ArticleImage = styled.div<{ $image: string }>`
  width: 100%;
  height: 220px;
  background-image: url(${props => props.$image});
  background-size: cover;
  background-position: center;
`;

const ArticleContent = styled.div`
  padding: 24px;
  text-align: ${props => props.theme.direction === 'rtl' ? 'right' : 'left'};
`;

const ArticleCategory = styled.span`
  display: inline-block;
  padding: 4px 12px;
  background: ${props => props.theme.colors.secondary};
  color: white;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  border-radius: 4px;
  margin-bottom: 12px;
  letter-spacing: 0.5px;
`;

const ArticleTitle = styled.h3`
  font-size: 22px;
  font-weight: 700;
  line-height: 1.3;
  margin: 0 0 12px 0;
  font-family: ${props => props.theme.fonts.heading};
`;

const ArticleExcerpt = styled.p`
  font-size: 15px;
  line-height: 1.6;
  color: ${props => props.theme.colors.textLight};
  margin: 0 0 16px 0;
`;

const ArticleMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: ${props => props.theme.colors.textLight};
  padding-top: 16px;
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const ReadMoreButton = styled.button`
  margin-top: 12px;
  padding: 10px 20px;
  background: transparent;
  color: ${props => props.theme.colors.primary};
  border: 1px solid ${props => props.theme.colors.primary};
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: ${props => props.theme.fonts.body};

  &:hover {
    background: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.background};
  }
`;

// Sample data (in production, this would come from your API)
const getSampleArticles = (locale: string) => {
  const articles: Record<string, any> = {
    en: [
      {
        id: 1,
        title: "The Future of Digital Journalism",
        excerpt: "Exploring how independent media can thrive in the digital age through reader support and quality content.",
        category: "Media",
        image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=600&fit=crop",
        author: "Sarah Johnson",
        date: "2024-01-25",
      },
      {
        id: 2,
        title: "Climate Action: Local Solutions",
        excerpt: "Communities around the world are taking innovative approaches to combat climate change at the grassroots level.",
        category: "Environment",
        image: "https://plus.unsplash.com/premium_photo-1663951252608-ab1fdec72fbe?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZW52aXJvbmVlbWVudHxlbnwwfHwwfHx8MA%3D%3D",
        author: "Michael Chen",
        date: "2024-01-24",
      },
      {
        id: 3,
        title: "Democracy in the Digital Era",
        excerpt: "How technology is reshaping civic participation and what it means for democratic institutions.",
        category: "Politics",
        image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=600&fit=crop",
        author: "Emma Williams",
        date: "2024-01-23",
      },
    ],
    fr: [
      {
        id: 1,
        title: "L'avenir du journalisme numérique",
        excerpt: "Explorer comment les médias indépendants peuvent prospérer à l'ère numérique grâce au soutien des lecteurs.",
        category: "Médias",
        image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=600&fit=crop",
        author: "Sarah Johnson",
        date: "2024-01-25",
      },
      {
        id: 2,
        title: "Action climatique : solutions locales",
        excerpt: "Les communautés du monde entier adoptent des approches innovantes pour lutter contre le changement climatique.",
        category: "Environnement",
        image: "https://plus.unsplash.com/premium_photo-1663951252608-ab1fdec72fbe?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZW52aXJvbmVlbWVudHxlbnwwfHwwfHx8MA%3D%3D",
        author: "Michael Chen",
        date: "2024-01-24",
      },
      {
        id: 3,
        title: "Démocratie à l'ère numérique",
        excerpt: "Comment la technologie transforme la participation civique et ce que cela signifie pour les institutions démocratiques.",
        category: "Politique",
        image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=600&fit=crop",
        author: "Emma Williams",
        date: "2024-01-23",
      },
    ],
    ar: [
      {
        id: 1,
        title: "مستقبل الصحافة الرقمية",
        excerpt: "استكشاف كيف يمكن للإعلام المستقل أن يزدهر في العصر الرقمي من خلال دعم القراء والمحتوى عالي الجودة.",
        category: "إعلام",
        image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=600&fit=crop",
        author: "سارة جونسون",
        date: "2024-01-25",
      },
      {
        id: 2,
        title: "العمل المناخي: حلول محلية",
        excerpt: "المجتمعات حول العالم تتبنى نهجًا مبتكرة لمكافحة تغير المناخ على المستوى الشعبي.",
        category: "بيئة",
        image: "https://plus.unsplash.com/premium_photo-1663951252608-ab1fdec72fbe?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZW52aXJvbmVlbWVudHxlbnwwfHwwfHx8MA%3D%3D",
        author: "مايكل تشين",
        date: "2024-01-24",
      },
      {
        id: 3,
        title: "الديمقراطية في العصر الرقمي",
        excerpt: "كيف تعيد التكنولوجيا تشكيل المشاركة المدنية وماذا يعني ذلك للمؤسسات الديمقراطية.",
        category: "سياسة",
        image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=600&fit=crop",
        author: "إيما ويليامز",
        date: "2024-01-23",
      },
    ],
  };

  return articles[locale] || articles.en;
};



import { useQuery, gql } from '@apollo/client';

const GET_ARTICLES = gql`
  query GetArticles($limit: Int, $offset: Int) {
    articles(limit: $limit, offset: $offset) {
      edges {
        node {
          id
          slug
          status
          locale
          content {
            title
            excerpt
          }
          featuredImageUrl
          author {
            name
          }
          publishedAt
        }
      }
    }
  }
`;

export default function HomePage() {
  const locale = useLocale();
  const t = useTranslations();

  const { data, loading, error } = useQuery(GET_ARTICLES, {
    variables: {
      limit: 12,
      offset: 0
    }
  });

  const articles = data?.articles?.edges?.map((edge: any) => edge.node) || [];

  if (loading) return <Main><Hero><HeroTitle>Loading...</HeroTitle></Hero></Main>;
  if (error) return <Main><Hero><HeroTitle>Error loading articles</HeroTitle><HeroSubtitle>{error.message}</HeroSubtitle></Hero></Main>;

  return (
    <Main>
      <Hero>
        <HeroTitle>{t('hero.title')}</HeroTitle>
        <HeroSubtitle>{t('hero.subtitle')}</HeroSubtitle>
      </Hero>

      <ArticlesGrid>
        {articles.length === 0 ? (
          <p>No articles found for this locale.</p>
        ) : articles.map((article: any) => (
          <ArticleCard key={article.id} onClick={() => window.location.href = `/${locale}/${article.slug}`}>
            <ArticleImage $image={article.featuredImageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=600&fit=crop'} />
            <ArticleContent>
              <ArticleCategory>{article.category?.slug || 'General'}</ArticleCategory>
              <ArticleTitle>{article.content.title}</ArticleTitle>
              <ArticleExcerpt>{article.content.excerpt}</ArticleExcerpt>
              <ArticleMeta>
                <span>{article.author.name}</span>
                <span>•</span>
                <span>
                  {t('common.publishedOn')} {new Date(article.publishedAt).toLocaleDateString(locale)}
                </span>
              </ArticleMeta>
              <ReadMoreButton>{t('common.readMore')}</ReadMoreButton>
            </ArticleContent>
          </ArticleCard>
        ))}
      </ArticlesGrid>
    </Main>
  );
}
