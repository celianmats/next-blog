/**
 * User Profile Component
 * Display user profile with articles, bio, and settings
 */

'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { useAuth } from '../context/AuthContext';

// ================================
// GraphQL Queries & Mutations
// ================================
const GET_USER_PROFILE = gql`
  query GetUserProfile($id: ID!) {
    user(id: $id) {
      id
      name
      email
      bio
      avatarUrl
      role
      isVerified
      createdAt
      articles(limit: 10) {
        id
        slug
        content {
          title
          excerpt
        }
        viewCount
        publishedAt
        status
      }
    }
  }
`;

const UPDATE_PROFILE = gql`
  mutation UpdateProfile($name: String, $bio: String, $avatarUrl: String) {
    updateProfile(name: $name, bio: $bio, avatarUrl: $avatarUrl) {
      id
      name
      bio
      avatarUrl
    }
  }
`;

// ================================
// Styled Components
// ================================
const ProfileContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;
`;

const ProfileHeader = styled.div`
  background: white;
  border-radius: 16px;
  padding: 48px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 32px;
  display: flex;
  gap: 40px;
  align-items: start;

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 32px 24px;
    gap: 24px;
  }
`;

const AvatarSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const Avatar = styled.img`
  width: 160px;
  height: 160px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #f0f0f0;

  @media (max-width: 768px) {
    width: 120px;
    height: 120px;
  }
`;

const ChangeAvatarButton = styled.button`
  padding: 8px 16px;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e9ecef;
  }
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const ProfileName = styled.h1`
  font-size: 36px;
  font-weight: 800;
  margin: 0 0 8px 0;
  color: #1a1a1a;

  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

const ProfileEmail = styled.div`
  font-size: 16px;
  color: #666;
  margin-bottom: 4px;
`;

const ProfileBadges = styled.div`
  display: flex;
  gap: 8px;
  margin: 12px 0 20px 0;
`;

const Badge = styled.span<{ $color: string }>`
  padding: 6px 12px;
  background: ${props => props.$color};
  color: white;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ProfileBio = styled.p`
  font-size: 16px;
  line-height: 1.6;
  color: #333;
  margin: 16px 0;
`;

const ProfileStats = styled.div`
  display: flex;
  gap: 32px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e0e0e0;

  @media (max-width: 640px) {
    gap: 16px;
    flex-wrap: wrap;
  }
`;

const Stat = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  strong {
    font-size: 24px;
    font-weight: 700;
    color: #1a1a1a;
  }

  span {
    font-size: 13px;
    color: #999;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const TabBar = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 32px;
  background: white;
  padding: 8px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 14px 24px;
  background: ${props => props.$active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#666'};
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$active
    ? 'linear-gradient(135deg, #5568d3 0%, #6a3d8f 100%)'
    : '#f8f9fa'
  };
  }
`;

const ContentSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const ArticlesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const ArticleItem = styled.div`
  padding: 24px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    border-color: #667eea;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
  }
`;

const ArticleTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #1a1a1a;
`;

const ArticleExcerpt = styled.p`
  font-size: 15px;
  line-height: 1.6;
  color: #666;
  margin: 0 0 16px 0;
`;

const ArticleMeta = styled.div`
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #999;
  align-items: center;
`;

const StatusBadge = styled.span<{ $status: string }>`
  padding: 4px 10px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  
  ${props => {
    switch (props.$status.toLowerCase()) {
      case 'published':
        return 'background: #d4edda; color: #155724;';
      case 'draft':
        return 'background: #fff3cd; color: #856404;';
      default:
        return 'background: #e2e3e5; color: #383d41;';
    }
  }}
`;

const SettingsForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 600px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
`;

const Input = styled.input`
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const TextArea = styled.textarea`
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  min-height: 120px;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 8px;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  ${props => props.$variant === 'primary' ? `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    
    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
  ` : `
    background: #f8f9fa;
    color: #1a1a1a;
    border: 1px solid #e0e0e0;
    
    &:hover:not(:disabled) {
      background: #e9ecef;
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Message = styled.div<{ $type: 'success' | 'error' }>`
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  background: ${props => props.$type === 'success' ? '#d4edda' : '#f8d7da'};
  color: ${props => props.$type === 'success' ? '#155724' : '#721c24'};
  border: 1px solid ${props => props.$type === 'success' ? '#c3e6cb' : '#f5c6cb'};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #666;

  h3 {
    font-size: 20px;
    margin: 0 0 8px 0;
    color: #1a1a1a;
  }

  p {
    margin: 0;
  }
`;

// ================================
// Profile Component
// ================================
export default function UserProfile({ userId }: { userId?: string }) {
  const { user: currentUser, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'articles' | 'settings'>('articles');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');

  const profileUserId = userId || currentUser?.id;
  const isOwnProfile = profileUserId === currentUser?.id;

  const { data, loading, error, refetch } = useQuery(GET_USER_PROFILE, {
    variables: { id: profileUserId },
    skip: !profileUserId,
    onCompleted: (data) => {
      if (data.user) {
        setName(data.user.name);
        setBio(data.user.bio || '');
      }
    },
  });

  const [updateProfile, { loading: updating }] = useMutation(UPDATE_PROFILE, {
    onCompleted: (data) => {
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      updateUser(data.updateProfile);
      refetch();
      setTimeout(() => setMessage(null), 3000);
    },
    onError: (error) => {
      setMessage({ type: 'error', text: error.message });
      setTimeout(() => setMessage(null), 3000);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      variables: { name, bio },
    });
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px 20px' }}>Loading...</div>;
  }

  if (error || !data?.user) {
    return <div style={{ textAlign: 'center', padding: '100px 20px' }}>User not found</div>;
  }

  const profile = data.user;
  const totalViews = profile.articles.reduce((sum: any, a: any) => sum + a.viewCount, 0);

  return (
    <ProfileContainer>
      <ProfileHeader>
        <AvatarSection>
          <Avatar
            src={profile.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&size=160`}
            alt={profile.name}
          />
          {isOwnProfile && (
            <ChangeAvatarButton>Change Photo</ChangeAvatarButton>
          )}
        </AvatarSection>

        <ProfileInfo>
          <ProfileName>{profile.name}</ProfileName>
          <ProfileEmail>{profile.email}</ProfileEmail>

          <ProfileBadges>
            <Badge $color="#667eea">{profile.role}</Badge>
            {profile.isVerified && (
              <Badge $color="#28a745">Verified</Badge>
            )}
          </ProfileBadges>

          {profile.bio && (
            <ProfileBio>{profile.bio}</ProfileBio>
          )}

          <ProfileStats>
            <Stat>
              <strong>{profile.articles.length}</strong>
              <span>Articles</span>
            </Stat>
            <Stat>
              <strong>{totalViews.toLocaleString()}</strong>
              <span>Total Views</span>
            </Stat>
            <Stat>
              <strong>{new Date(profile.createdAt).toLocaleDateString('en', { year: 'numeric', month: 'short' })}</strong>
              <span>Member Since</span>
            </Stat>
          </ProfileStats>
        </ProfileInfo>
      </ProfileHeader>

      {isOwnProfile && (
        <TabBar>
          <Tab
            $active={activeTab === 'articles'}
            onClick={() => setActiveTab('articles')}
          >
            My Articles
          </Tab>
          <Tab
            $active={activeTab === 'settings'}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </Tab>
        </TabBar>
      )}

      <ContentSection>
        {activeTab === 'articles' && (
          <>
            {profile.articles.length === 0 ? (
              <EmptyState>
                <h3>No articles yet</h3>
                <p>Start writing to see your articles here</p>
              </EmptyState>
            ) : (
              <ArticlesList>
                {profile.articles.map((article: any) => (
                  <ArticleItem key={article.id}>
                    <ArticleTitle>{article.content.title}</ArticleTitle>
                    <ArticleExcerpt>{article.content.excerpt}</ArticleExcerpt>
                    <ArticleMeta>
                      <StatusBadge $status={article.status}>{article.status}</StatusBadge>
                      <span>•</span>
                      <span>{article.viewCount} views</span>
                      <span>•</span>
                      <span>{new Date(article.publishedAt || article.createdAt).toLocaleDateString()}</span>
                    </ArticleMeta>
                  </ArticleItem>
                ))}
              </ArticlesList>
            )}
          </>
        )}

        {activeTab === 'settings' && isOwnProfile && (
          <SettingsForm onSubmit={handleSubmit}>
            {message && (
              <Message $type={message.type}>{message.text}</Message>
            )}

            <FormGroup>
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="bio">Bio</Label>
              <TextArea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
              />
            </FormGroup>

            <ButtonGroup>
              <Button type="submit" $variant="primary" disabled={updating}>
                {updating ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button type="button" $variant="secondary" onClick={() => {
                setName(profile.name);
                setBio(profile.bio || '');
              }}>
                Cancel
              </Button>
            </ButtonGroup>
          </SettingsForm>
        )}
      </ContentSection>
    </ProfileContainer>
  );
}
