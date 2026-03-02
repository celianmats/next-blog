'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import ArticleEditor from './ArticleEditor';

// ================================
// GraphQL Queries & Mutations
// ================================
const GET_ARTICLES = gql`
  query GetArticles($locale: Locale!, $limit: Int, $offset: Int) {
    articles(locale: $locale, limit: $limit, offset: $offset) {
      edges {
        node {
          id
          slug
          status
          content {
            title
            excerpt
          }
          author {
            name
          }
          viewCount
          publishedAt
          createdAt
        }
      }
      pageInfo {
        hasNextPage
        totalCount
      }
      totalCount
    }
  }
`;

const CREATE_ARTICLE = gql`
  mutation CreateArticle($input: CreateArticleInput!) {
    createArticle(input: $input) {
      id
      slug
      status
    }
  }
`;

const PUBLISH_ARTICLE = gql`
  mutation PublishArticle($id: ID!) {
    publishArticle(id: $id) {
      id
      status
      publishedAt
    }
  }
`;

// ================================
// Styled Components
// ================================
const Dashboard = styled.div`
  display: flex;
  min-height: 100vh;
  background: #f8f9fa;
`;

const Sidebar = styled.aside`
  width: 260px;
  background: #1a1a1a;
  color: white;
  padding: 24px 0;
  position: fixed;
  height: 100vh;
  overflow-y: auto;
`;

const SidebarHeader = styled.div`
  padding: 0 24px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Logo = styled.h1`
  font-size: 24px;
  font-weight: 800;
  margin: 0;
`;

const Nav = styled.nav`
  padding: 24px 0;
`;

const NavItem = styled.a<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  padding: 12px 24px;
  color: ${props => props.$active ? '#fff' : 'rgba(255, 255, 255, 0.7)'};
  background: ${props => props.$active ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 3px solid ${props => props.$active ? '#e63946' : 'transparent'};

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }

  svg {
    margin-right: ${props => props.theme?.direction === 'rtl' ? '0' : '12px'};
    margin-left: ${props => props.theme?.direction === 'rtl' ? '12px' : '0'};
    width: 20px;
    height: 20px;
  }
`;

const SidebarLanguageWrapper = styled.div`
  padding: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Main = styled.main`
  flex: 1;
  margin-left: 260px;
  padding: 32px;
`;

const Header = styled.header`
  background: white;
  padding: 24px 32px;
  border-radius: 12px;
  margin-bottom: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PageTitle = styled.h2`
  font-size: 28px;
  font-weight: 700;
  margin: 0;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => {
    switch (props.$variant) {
      case 'primary':
        return `
          background: #e63946;
          color: white;
          &:hover { background: #d62839; }
        `;
      case 'secondary':
        return `
          background: #f8f9fa;
          color: #1a1a1a;
          border: 1px solid #e0e0e0;
          &:hover { background: #e9ecef; }
        `;
      case 'danger':
        return `
          background: #dc3545;
          color: white;
          &:hover { background: #c82333; }
        `;
      default:
        return `
          background: #6c757d;
          color: white;
          &:hover { background: #5a6268; }
        `;
    }
  }}
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Thead = styled.thead`
  background: #f8f9fa;
`;

const Th = styled.th`
  padding: 12px 16px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e0e0e0;
`;

const Td = styled.td`
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  font-size: 14px;
`;

const StatusBadge = styled.span<{ $status: string }>`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  
  ${props => {
    switch (props.$status.toLowerCase()) {
      case 'published':
        return 'background: #d4edda; color: #155724;';
      case 'draft':
        return 'background: #fff3cd; color: #856404;';
      case 'archived':
        return 'background: #f8d7da; color: #721c24;';
      default:
        return 'background: #e2e3e5; color: #383d41;';
    }
  }}
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const IconButton = styled.button`
  padding: 8px;
  background: transparent;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #f8f9fa;
    border-color: #6c757d;
  }
`;

const LanguageSelector = styled.select<{ $inverted?: boolean }>`
  padding: 8px 16px;
  border: 1px solid ${props => props.$inverted ? 'rgba(255, 255, 255, 0.2)' : '#e0e0e0'};
  border-radius: 6px;
  font-size: 14px;
  background: ${props => props.$inverted ? '#333' : 'white'};
  color: ${props => props.$inverted ? 'white' : '#1a1a1a'};
  cursor: pointer;
  width: 100%;

  &:focus {
    outline: none;
    border-color: #e63946;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;

  h3 {
    font-size: 20px;
    margin-bottom: 8px;
  }

  p {
    margin-bottom: 24px;
  }
`;

// ================================
// Translations
// ================================
const translations: Record<string, any> = {
  EN: {
    dashboard: 'Dashboard',
    articles: 'Articles',
    categories: 'Categories',
    users: 'Users',
    media: 'Media',
    settings: 'Settings',
    editorLanguage: 'Editor Language',
    backToArticles: 'Back to Articles',
    newArticle: 'New Article',
    editArticle: 'Edit Article',
    cancel: 'Cancel',
    management: 'Management',
    loadingArticles: 'Loading articles...',
    errorLoadingArticles: 'Error loading articles',
    noArticlesYet: 'No articles yet',
    createFirstArticle: 'Create your first article to get started',
    createArticle: 'Create Article',
    table: {
      title: 'Title',
      author: 'Author',
      status: 'Status',
      views: 'Views',
      published: 'Published',
      actions: 'Actions'
    },
    comingSoon: 'Management Coming Soon',
    underDevelopment: 'This module is currently under development.',
    publishConfirm: 'Are you sure you want to publish this article?',
    publishSuccess: 'Article published successfully!',
    publishError: 'Failed to publish article'
  },
  FR: {
    dashboard: 'Tableau de bord',
    articles: 'Articles',
    categories: 'Catégories',
    users: 'Utilisateurs',
    media: 'Média',
    settings: 'Paramètres',
    editorLanguage: 'Langue de l\'éditeur',
    backToArticles: 'Retour aux articles',
    newArticle: 'Nouvel Article',
    editArticle: 'Modifier l\'Article',
    cancel: 'Annuler',
    management: 'Gestion des',
    loadingArticles: 'Chargement des articles...',
    errorLoadingArticles: 'Erreur lors du chargement des articles',
    noArticlesYet: 'Pas encore d\'articles',
    createFirstArticle: 'Créez votre premier article pour commencer',
    createArticle: 'Créer un Article',
    table: {
      title: 'Titre',
      author: 'Auteur',
      status: 'Statut',
      views: 'Vues',
      published: 'Publié',
      actions: 'Actions'
    },
    comingSoon: 'Gestion bientôt disponible',
    underDevelopment: 'Ce module est actuellement en cours de développement.',
    publishConfirm: 'Êtes-vous sûr de vouloir publier cet article ?',
    publishSuccess: 'Article publié avec succès !',
    publishError: 'Échec de la publication de l\'article'
  },
  AR: {
    dashboard: 'لوحة القيادة',
    articles: 'المقالات',
    categories: 'التصنيفات',
    users: 'المستخدمين',
    media: 'الوسائط',
    settings: 'الإعدادات',
    editorLanguage: 'لغة المحرر',
    backToArticles: 'العودة للمقالات',
    newArticle: 'مقالة جديدة',
    editArticle: 'تعديل المقالة',
    cancel: 'إلغاء',
    management: 'إدارة',
    loadingarticles: 'جاري تحميل المقالات...',
    errorloadingarticles: 'خطأ في تحميل المقالات',
    noArticlesYet: 'لا توجد مقالات بعد',
    createFirstArticle: 'أنشئ مقالتك الأولى للبدء',
    createArticle: 'إنشاء مقالة',
    table: {
      title: 'العنوان',
      author: 'الكاتب',
      status: 'الحالة',
      views: 'المشاهدات',
      published: 'نشرت في',
      actions: 'الإجراءات'
    },
    comingSoon: 'قريباً',
    underDevelopment: 'هذه الوحدة قيد التطوير حالياً.',
    publishConfirm: 'هل أنت متأكد أنك تريد نشر هذه المقالة؟',
    publishSuccess: 'تم نشر المقالة بنجاح!',
    publishError: 'فشل في نشر المقالة'
  }
};

// ================================
// Admin Dashboard Component
// ================================
export default function AdminDashboard() {
  const [selectedLocale, setSelectedLocale] = useState('EN');
  const t = translations[selectedLocale] || translations.EN;
  const [currentPage, setCurrentPage] = useState('articles');
  const [isEditing, setIsEditing] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | undefined>(undefined);

  const { data, loading, error, refetch } = useQuery(GET_ARTICLES, {
    variables: {
      locale: selectedLocale,
      limit: 20,
      offset: 0,
    },
  });

  const [publishArticle] = useMutation(PUBLISH_ARTICLE, {
    onCompleted: () => {
      refetch();
    },
  });

  const handlePublish = async (articleId: string) => {
    if (confirm(t.publishConfirm)) {
      try {
        await publishArticle({ variables: { id: articleId } });
        alert(t.publishSuccess);
      } catch (err) {
        alert(t.publishError);
      }
    }
  };

  const handleCreateNew = () => {
    setEditingArticleId(undefined);
    setIsEditing(true);
  };

  const handleEdit = (id: string) => {
    setEditingArticleId(id);
    setIsEditing(true);
  };

  const handleCloseEditor = () => {
    setIsEditing(false);
    setEditingArticleId(undefined);
    refetch();
  };

  if (isEditing) {
    return (
      <Dashboard>
        <Sidebar>
          <SidebarHeader>
            <Logo>Republik Admin</Logo>
          </SidebarHeader>
          <Nav>
            <NavItem onClick={handleCloseEditor}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t.backToArticles}
            </NavItem>
          </Nav>
        </Sidebar>
        <Main>
          <ArticleEditor
            articleId={editingArticleId}
            locale={selectedLocale}
          />
        </Main>
      </Dashboard>
    );
  }

  return (
    <Dashboard>
      <Sidebar>
        <SidebarHeader>
          <Logo>Republik Admin</Logo>
        </SidebarHeader>
        <SidebarLanguageWrapper>
          <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 700 }}>
            {t.editorLanguage}
          </div>
          <LanguageSelector
            $inverted
            value={selectedLocale}
            onChange={(e) => setSelectedLocale(e.target.value)}
          >
            <option value="EN">English</option>
            <option value="FR">Français</option>
            <option value="AR">العربية</option>
          </LanguageSelector>
        </SidebarLanguageWrapper>
        <Nav>
          <NavItem $active={!isEditing && currentPage === 'dashboard'} onClick={() => { setIsEditing(false); setCurrentPage('dashboard'); }}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {t.dashboard}
          </NavItem>
          <NavItem $active={isEditing || currentPage === 'articles'} onClick={() => { setCurrentPage('articles'); }}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {t.articles}
          </NavItem>
          <NavItem $active={!isEditing && currentPage === 'categories'} onClick={() => { setIsEditing(false); setCurrentPage('categories'); }}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            {t.categories}
          </NavItem>
          <NavItem $active={!isEditing && currentPage === 'users'} onClick={() => { setIsEditing(false); setCurrentPage('users'); }}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            {t.users}
          </NavItem>
          <NavItem $active={!isEditing && currentPage === 'media'} onClick={() => { setIsEditing(false); setCurrentPage('media'); }}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {t.media}
          </NavItem>
          <NavItem $active={!isEditing && currentPage === 'settings'} onClick={() => { setIsEditing(false); setCurrentPage('settings'); }}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {t.settings}
          </NavItem>
        </Nav>
      </Sidebar>

      <Main>
        {isEditing ? (
          <>
            <Header>
              <PageTitle>{editingArticleId ? t.editArticle : t.newArticle}</PageTitle>
              <Button $variant="secondary" onClick={handleCloseEditor}>{t.cancel}</Button>
            </Header>
            <ArticleEditor
              articleId={editingArticleId}
              locale={selectedLocale}
            />
          </>
        ) : (
          <>
            <Header>
              <PageTitle>{selectedLocale === 'AR' ? t.management + ' ' + t[currentPage] : t[currentPage] + ' ' + t.management}</PageTitle>
              {currentPage === 'articles' && (
                <Button $variant="primary" onClick={handleCreateNew}>+ {t.newArticle}</Button>
              )}
            </Header>

            {currentPage === 'articles' ? (
              <Card>
                {loading ? (
                  <EmptyState>
                    <h3>{t.loadingArticles}</h3>
                  </EmptyState>
                ) : error ? (
                  <EmptyState>
                    <h3>{t.errorLoadingArticles}</h3>
                    <p>{error.message}</p>
                  </EmptyState>
                ) : !data?.articles?.edges?.length ? (
                  <EmptyState>
                    <h3>{t.noArticlesYet}</h3>
                    <p>{t.createFirstArticle}</p>
                    <Button $variant="primary" onClick={handleCreateNew}>+ {t.createArticle}</Button>
                  </EmptyState>
                ) : (
                  <Table>
                    <Thead>
                      <tr>
                        <Th>{t.table.title}</Th>
                        <Th>{t.table.author}</Th>
                        <Th>{t.table.status}</Th>
                        <Th>{t.table.views}</Th>
                        <Th>{t.table.published}</Th>
                        <Th>{t.table.actions}</Th>
                      </tr>
                    </Thead>
                    <tbody>
                      {data.articles.edges.map(({ node: article }: any) => (
                        <tr key={article.id}>
                          <Td>
                            <strong>{article.content.title}</strong>
                            <div style={{ fontSize: '13px', color: '#6c757d', marginTop: '4px' }}>
                              /{article.slug}
                            </div>
                          </Td>
                          <Td>{article.author.name}</Td>
                          <Td>
                            <StatusBadge $status={article.status}>
                              {article.status}
                            </StatusBadge>
                          </Td>
                          <Td>{article.viewCount.toLocaleString()}</Td>
                          <Td>
                            {article.publishedAt
                              ? new Date(article.publishedAt).toLocaleDateString()
                              : '-'
                            }
                          </Td>
                          <Td>
                            <ActionButtons>
                              <IconButton title="Edit" onClick={() => handleEdit(article.id)}>
                                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </IconButton>
                              {article.status === 'DRAFT' && (
                                <IconButton
                                  title="Publish"
                                  onClick={() => handlePublish(article.id)}
                                >
                                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </IconButton>
                              )}
                              <IconButton title="Delete">
                                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </IconButton>
                            </ActionButtons>
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card>
            ) : (
              <Card>
                <EmptyState>
                  <h3>{selectedLocale === 'AR' ? t.management + ' ' + t[currentPage] + ' ' + t.comingSoon : t[currentPage] + ' ' + t.management + ' ' + t.comingSoon}</h3>
                  <p>{t.underDevelopment}</p>
                </EmptyState>
              </Card>
            )}
          </>
        )}
      </Main>
    </Dashboard>
  );
}
