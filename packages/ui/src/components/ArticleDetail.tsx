/**
 * Article Detail Page
 * Full article view with comments, sharing, and related articles
 */

'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { useLocale } from 'next-intl';
import { useAuth } from '../context/AuthContext';

// ================================
// GraphQL Queries & Mutations
// ================================
const GET_ARTICLE = gql`
  query GetArticle($slug: String!, $locale: Locale!) {
    article(slug: $slug, locale: $locale) {
      id
      slug
      locale
      content {
        title
        subtitle
        excerpt
        content
      }
      author {
        id
        name
        bio
        avatarUrl
      }
      category {
        slug
        translations {
          name
          locale
        }
      }
      tags {
        slug
        translations {
          name
          locale
        }
      }
      featuredImageUrl
      readingTimeMinutes
      viewCount
      publishedAt
      relatedArticles(limit: 3) {
        id
        slug
        content {
          title
          excerpt
        }
        featuredImageUrl
      }
    }
  }
`;

const CREATE_COMMENT = gql`
  mutation CreateComment($input: CommentInput!) {
    createComment(input: $input) {
      id
      content
      user {
        name
        avatarUrl
      }
      createdAt
    }
  }
`;

const INCREMENT_VIEWS = gql`
  mutation IncrementArticleViews($id: ID!) {
    incrementArticleViews(id: $id) {
      success
    }
  }
`;

// ================================
// Styled Components
// ================================
const ArticleContainer = styled.article`
  max-width: 1400px;
  margin: 0 auto;
`;

const ArticleHeader = styled.header`
  max-width: 800px;
  margin: 0 auto;
  padding: 80px 24px 40px;
  text-align: center;
`;

const CategoryBadge = styled.a`
  display: inline-block;
  padding: 6px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-radius: 20px;
  text-decoration: none;
  margin-bottom: 24px;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`;

const ArticleTitle = styled.h1`
  font-size: 48px;
  font-weight: 800;
  line-height: 1.2;
  margin: 0 0 16px 0;
  color: #1a1a1a;

  @media (max-width: 768px) {
    font-size: 32px;
  }
`;

const ArticleSubtitle = styled.p`
  font-size: 22px;
  line-height: 1.5;
  color: #666;
  margin: 0 0 32px 0;
  font-weight: 400;
`;

const ArticleMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 24px 0;
  border-top: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;
`;

const AuthorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const AuthorAvatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
`;

const AuthorDetails = styled.div`
  text-align: left;
`;

const AuthorName = styled.div`
  font-weight: 600;
  color: #1a1a1a;
  font-size: 15px;
`;

const PublishDate = styled.div`
  font-size: 14px;
  color: #999;
`;

const ReadingTime = styled.div`
  font-size: 14px;
  color: #999;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const FeaturedImage = styled.img`
  width: 100%;
  max-width: 1200px;
  height: auto;
  margin: 40px auto;
  display: block;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
`;

const ArticleContent = styled.div`
  max-width: 720px;
  margin: 60px auto;
  padding: 0 24px;
  font-size: 19px;
  line-height: 1.8;
  color: #1a1a1a;

  p {
    margin: 0 0 24px 0;
  }

  h2 {
    font-size: 32px;
    font-weight: 700;
    margin: 48px 0 20px 0;
    line-height: 1.3;
  }

  h3 {
    font-size: 24px;
    font-weight: 600;
    margin: 32px 0 16px 0;
    line-height: 1.4;
  }

  a {
    color: #667eea;
    text-decoration: underline;
    
    &:hover {
      color: #764ba2;
    }
  }

  blockquote {
    margin: 32px 0;
    padding: 24px 32px;
    border-left: 4px solid #667eea;
    background: #f8f9ff;
    font-style: italic;
    font-size: 21px;
    
    p:last-child {
      margin-bottom: 0;
    }
  }

  ul, ol {
    margin: 24px 0;
    padding-left: 32px;
    
    li {
      margin-bottom: 12px;
    }
  }

  img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 32px 0;
  }

  code {
    background: #f5f5f5;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'Monaco', monospace;
    font-size: 16px;
  }

  pre {
    background: #1a1a1a;
    color: #f0f0f0;
    padding: 24px;
    border-radius: 8px;
    overflow-x: auto;
    margin: 32px 0;
    
    code {
      background: none;
      padding: 0;
      color: inherit;
    }
  }
`;

const TagsSection = styled.div`
  max-width: 720px;
  margin: 48px auto;
  padding: 0 24px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const Tag = styled.a`
  padding: 8px 16px;
  background: #f8f9fa;
  color: #667eea;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;

  &:hover {
    background: #667eea;
    color: white;
  }
`;

const ShareSection = styled.div`
  max-width: 720px;
  margin: 48px auto;
  padding: 32px 24px;
  border-top: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;
  text-align: center;
`;

const ShareTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 20px 0;
  color: #1a1a1a;
`;

const ShareButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const ShareButton = styled.button<{ $color: string }>`
  padding: 12px 24px;
  background: ${props => props.$color};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${props => props.$color}66;
  }
`;

const CommentsSection = styled.div`
  max-width: 720px;
  margin: 60px auto;
  padding: 0 24px;
`;

const CommentsTitle = styled.h2`
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 32px 0;
`;

const CommentForm = styled.form`
  margin-bottom: 48px;
  background: #f8f9fa;
  padding: 24px;
  border-radius: 12px;
`;

const CommentTextarea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  font-family: inherit;
  resize: vertical;
  margin-bottom: 16px;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const CommentButton = styled.button`
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
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

const Comment = styled.div`
  padding: 24px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  margin-bottom: 16px;
`;

const CommentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const CommentAuthorAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
`;

const CommentAuthorName = styled.div`
  font-weight: 600;
  color: #1a1a1a;
`;

const CommentDate = styled.div`
  font-size: 13px;
  color: #999;
`;

const CommentContent = styled.p`
  margin: 0;
  font-size: 15px;
  line-height: 1.6;
  color: #333;
`;

const RelatedArticles = styled.div`
  max-width: 1200px;
  margin: 80px auto;
  padding: 60px 24px;
  background: #f8f9fa;
`;

const RelatedTitle = styled.h2`
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 32px 0;
  text-align: center;
`;

const RelatedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 32px;
`;

const RelatedCard = styled.a`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
`;

const RelatedImage = styled.img`
  width: 100%;
  height: 180px;
  object-fit: cover;
`;

const RelatedContent = styled.div`
  padding: 20px;
`;

const RelatedCardTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 8px 0;
  line-height: 1.4;
`;

const RelatedExcerpt = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

// ================================
// Article Detail Component
// ================================
export default function ArticleDetail({ slug }: { slug: string }) {
  const locale = useLocale();
  const { user, isAuthenticated } = useAuth();
  const [commentText, setCommentText] = useState('');

  const { data, loading, error } = useQuery(GET_ARTICLE, {
    variables: {
      slug,
      locale: locale.toUpperCase(),
    },
  });

  const [createComment, { loading: commentLoading }] = useMutation(CREATE_COMMENT, {
    refetchQueries: ['GetArticle'],
  });

  const [incrementViews] = useMutation(INCREMENT_VIEWS);

  // Increment views on mount
  useState(() => {
    if (data?.article?.id) {
      incrementViews({ variables: { id: data.article.id } });
    }
  });

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !data?.article) return;

    try {
      await createComment({
        variables: {
          input: {
            articleId: data.article.id,
            content: commentText,
          },
        },
      });
      setCommentText('');
    } catch (err) {
      console.error('Comment error:', err);
    }
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = data?.article?.content.title || '';

    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data?.article) return <div>Article not found</div>;

  const { article } = data;

  return (
    <ArticleContainer>
      <ArticleHeader>
        {article.category && (
          <CategoryBadge href={`/${locale}/category/${article.category.slug}`}>
            {article.category.translations.find((t: any) => t.locale === locale.toUpperCase())?.name || article.category.slug}
          </CategoryBadge>
        )}

        <ArticleTitle>{article.content.title}</ArticleTitle>

        {article.content.subtitle && (
          <ArticleSubtitle>{article.content.subtitle}</ArticleSubtitle>
        )}

        <ArticleMeta>
          <AuthorInfo>
            <AuthorAvatar
              src={article.author.avatarUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(article.author.name)}
              alt={article.author.name}
            />
            <AuthorDetails>
              <AuthorName>{article.author.name}</AuthorName>
              <PublishDate>
                {new Date(article.publishedAt).toLocaleDateString(locale, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </PublishDate>
            </AuthorDetails>
          </AuthorInfo>

          <ReadingTime>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {article.readingTimeMinutes} min read
          </ReadingTime>
        </ArticleMeta>
      </ArticleHeader>

      {article.featuredImageUrl && (
        <FeaturedImage src={article.featuredImageUrl} alt={article.content.title} />
      )}

      <ArticleContent dangerouslySetInnerHTML={{ __html: article.content.content }} />

      {article.tags.length > 0 && (
        <TagsSection>
          {article.tags.map((tag: any) => (
            <Tag key={tag.slug} href={`/${locale}/tag/${tag.slug}`}>
              #{tag.translations.find((t: any) => t.locale === locale.toUpperCase())?.name || tag.slug}
            </Tag>
          ))}
        </TagsSection>
      )}

      <ShareSection>
        <ShareTitle>Share this article</ShareTitle>
        <ShareButtons>
          <ShareButton $color="#1DA1F2" onClick={() => handleShare('twitter')}>
            Twitter
          </ShareButton>
          <ShareButton $color="#1877F2" onClick={() => handleShare('facebook')}>
            Facebook
          </ShareButton>
          <ShareButton $color="#0A66C2" onClick={() => handleShare('linkedin')}>
            LinkedIn
          </ShareButton>
          <ShareButton $color="#25D366" onClick={() => handleShare('whatsapp')}>
            WhatsApp
          </ShareButton>
        </ShareButtons>
      </ShareSection>

      <CommentsSection>
        <CommentsTitle>Comments</CommentsTitle>

        {isAuthenticated ? (
          <CommentForm onSubmit={handleCommentSubmit}>
            <CommentTextarea
              placeholder="Share your thoughts..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              required
            />
            <CommentButton type="submit" disabled={commentLoading}>
              {commentLoading ? 'Posting...' : 'Post Comment'}
            </CommentButton>
          </CommentForm>
        ) : (
          <div style={{ padding: '24px', background: '#f8f9fa', borderRadius: '12px', textAlign: 'center' }}>
            <p>Please <a href="/login" style={{ color: '#667eea', textDecoration: 'underline' }}>sign in</a> to comment</p>
          </div>
        )}
      </CommentsSection>

      {article.relatedArticles.length > 0 && (
        <RelatedArticles>
          <RelatedTitle>Related Articles</RelatedTitle>
          <RelatedGrid>
            {article.relatedArticles.map((related: any) => (
              <RelatedCard key={related.id} href={`/${locale}/${related.slug}`}>
                <RelatedImage
                  src={related.featuredImageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=600&fit=crop'}
                  alt={related.content.title}
                />
                <RelatedContent>
                  <RelatedCardTitle>{related.content.title}</RelatedCardTitle>
                  <RelatedExcerpt>{related.content.excerpt}</RelatedExcerpt>
                </RelatedContent>
              </RelatedCard>
            ))}
          </RelatedGrid>
        </RelatedArticles>
      )}
    </ArticleContainer>
  );
}
