'use client';

import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useMutation, useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { getDirection, getTextAlign } from '../lib/rtl-utils';

// ================================
// GraphQL Mutations
// ================================
const CREATE_ARTICLE = gql`
  mutation CreateArticle($input: CreateArticleInput!) {
    createArticle(input: $input) {
      id
      slug
      status
    }
  }
`;

const UPDATE_ARTICLE = gql`
  mutation UpdateArticle(
    $id: ID!
    $article: UpdateArticleInput
    $content: UpdateArticleContentInput
  ) {
    updateArticle(id: $id, article: $article, content: $content) {
      id
      slug
    }
  }
`;

const GET_ARTICLE = gql`
  query GetArticle($slug: String!, $locale: Locale!) {
    article(slug: $slug, locale: $locale) {
      id
      slug
      status
      categoryId
      featuredImageUrl
      content {
        title
        subtitle
        excerpt
        content
      }
    }
  }
`;

const GET_ARTICLE_BY_ID = gql`
  query GetArticleById($id: ID!) {
    articleById(id: $id) {
      id
      slug
      status
      categoryId
      featuredImageUrl
      locale
      content {
        title
        subtitle
        excerpt
        content
      }
    }
  }
`;

// ================================
// Styled Components
// ================================
const EditorContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px;
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 32px;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const MainEditor = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const EditorHeader = styled.div`
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const EditorTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  margin: 0;
`;

const SaveButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'success' }>`
  padding: 10px 20px;
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
          &:disabled { background: #ccc; cursor: not-allowed; }
        `;
      case 'success':
        return `
          background: #28a745;
          color: white;
          &:hover { background: #218838; }
          &:disabled { background: #ccc; cursor: not-allowed; }
        `;
      default:
        return `
          background: #f8f9fa;
          color: #1a1a1a;
          border: 1px solid #e0e0e0;
          &:hover { background: #e9ecef; }
        `;
    }
  }}
`;

const EditorContent = styled.div`
  padding: 32px;
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #1a1a1a;
`;

const Input = styled.input<{ $locale?: string }>`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  transition: border-color 0.2s;
  direction: ${props => props.$locale ? getDirection(props.$locale.toLowerCase()) : 'ltr'};
  text-align: ${props => props.$locale ? getTextAlign(props.$locale.toLowerCase()) : 'left'};

  &:focus {
    outline: none;
    border-color: #e63946;
  }

  &::placeholder {
    color: #999;
  }
`;

const TitleInput = styled(Input)`
  font-size: 32px;
  font-weight: 700;
  border: none;
  padding: 0;
  margin-bottom: 16px;

  &:focus {
    outline: none;
  }
`;

const SubtitleInput = styled(Input)`
  font-size: 20px;
  font-weight: 400;
  color: #666;
  border: none;
  padding: 0;
  margin-bottom: 24px;

  &:focus {
    outline: none;
  }
`;

const TextArea = styled.textarea<{ $locale?: string }>`
  width: 100%;
  min-height: 120px;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;
  direction: ${props => props.$locale ? getDirection(props.$locale.toLowerCase()) : 'ltr'};
  text-align: ${props => props.$locale ? getTextAlign(props.$locale.toLowerCase()) : 'left'};

  &:focus {
    outline: none;
    border-color: #e63946;
  }
`;

const ContentEditor = styled.div<{ $locale?: string }>`
  min-height: 500px;
  padding: 24px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  line-height: 1.8;
  direction: ${props => props.$locale ? getDirection(props.$locale.toLowerCase()) : 'ltr'};
  text-align: ${props => props.$locale ? getTextAlign(props.$locale.toLowerCase()) : 'left'};
  
  &:focus {
    outline: none;
    border-color: #e63946;
  }

  &[contenteditable="true"]:empty:before {
    content: attr(data-placeholder);
    color: #999;
  }
`;

const Toolbar = styled.div`
  display: flex;
  gap: 8px;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  background: #f8f9fa;
  flex-wrap: wrap;
`;

const ToolbarButton = styled.button<{ $active?: boolean }>`
  padding: 8px 12px;
  background: ${props => props.$active ? '#e63946' : 'white'};
  color: ${props => props.$active ? 'white' : '#1a1a1a'};
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$active ? '#d62839' : '#f8f9fa'};
  }
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const SidebarCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const SidebarTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 16px 0;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  background: white;

  &:focus {
    outline: none;
    border-color: #e63946;
  }
`;

const ImageUpload = styled.div`
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #e63946;
    background: #f8f9fa;
  }

  input {
    display: none;
  }
`;

const PreviewImage = styled.img`
  width: 100%;
  border-radius: 8px;
  margin-bottom: 12px;
`;

const HelpText = styled.p`
  font-size: 13px;
  color: #6c757d;
  margin: 8px 0 0 0;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  font-weight: 600;
  color: #1a1a1a;
  border-radius: 12px;
`;

// ================================
// Translations
// ================================
const translations: Record<string, any> = {
  EN: {
    editArticle: 'Edit Article',
    newArticle: 'New Article',
    saveDraft: 'Save Draft',
    publish: 'Publish',
    updatePublish: 'Update & Publish',
    titlePlaceholder: 'Article Title...',
    subtitlePlaceholder: 'Article Subtitle (optional)...',
    excerptLabel: 'Excerpt *',
    excerptPlaceholder: 'Brief summary of the article...',
    excerptHelp: 'This will appear in article previews and search results',
    contentLabel: 'Content *',
    contentPlaceholder: 'Start writing your story...',
    settingsTitle: 'Settings',
    languageLabel: 'Language',
    slugLabel: 'URL Slug',
    slugPlaceholder: 'article-url-slug',
    categoryLabel: 'Category',
    selectCategory: 'Select category...',
    featuredImageTitle: 'Featured Image',
    removeImage: 'Remove Image',
    uploadClick: 'Click to upload image',
    recommendedSize: 'Recommended: 1200x630px',
    seoTitle: 'SEO',
    metaTitleLabel: 'Meta Title',
    metaTitlePlaceholder: 'SEO title (60 chars max)',
    metaDescLabel: 'Meta Description',
    metaDescPlaceholder: 'SEO description (160 chars max)',
    requiredFieldsError: 'Please fill in all required fields',
    saveSuccess: 'Article saved successfully!',
    saveError: 'Failed to save article',
    categories: {
      politics: 'Politics',
      economy: 'Economy',
      culture: 'Culture',
      technology: 'Technology',
      environment: 'Environment'
    },
    toolbar: {
      bold: 'Bold',
      italic: 'Italic',
      underline: 'Underline',
      h2: 'Heading 2',
      h3: 'Heading 3',
      bulletList: 'Bullet List',
      numberedList: 'Numbered List',
      link: 'Link',
      listBullet: '• List',
      listOrdered: '1. List'
    }
  },
  FR: {
    editArticle: 'Modifier l\'Article',
    newArticle: 'Nouvel Article',
    saveDraft: 'Enregistrer le brouillon',
    publish: 'Publier',
    updatePublish: 'Mettre à jour & Publier',
    titlePlaceholder: 'Titre de l\'article...',
    subtitlePlaceholder: 'Sous-titre de l\'article (optionnel)...',
    excerptLabel: 'Extrait *',
    excerptPlaceholder: 'Bref résumé de l\'article...',
    excerptHelp: 'Ceci apparaîtra dans les aperçus d\'articles et les résultats de recherche',
    contentLabel: 'Contenu *',
    contentPlaceholder: 'Commencez à écrire votre histoire...',
    settingsTitle: 'Paramètres',
    languageLabel: 'Langue',
    slugLabel: 'Slug URL',
    slugPlaceholder: 'slug-url-article',
    categoryLabel: 'Catégorie',
    selectCategory: 'Choisir une catégorie...',
    featuredImageTitle: 'Image à la une',
    removeImage: 'Supprimer l\'image',
    uploadClick: 'Cliquez pour télécharger une image',
    recommendedSize: 'Recommandé : 1200x630px',
    seoTitle: 'SEO',
    metaTitleLabel: 'Méta-titre',
    metaTitlePlaceholder: 'Titre SEO (60 car. max)',
    metaDescLabel: 'Méta-description',
    metaDescPlaceholder: 'Description SEO (160 car. max)',
    requiredFieldsError: 'Veuillez remplir tous les champs obligatoires',
    saveSuccess: 'Article enregistré avec succès !',
    saveError: 'Échec de l\'enregistrement de l\'article',
    categories: {
      politics: 'Politique',
      economy: 'Économie',
      culture: 'Culture',
      technology: 'Technologie',
      environment: 'Environnement'
    },
    toolbar: {
      bold: 'Gras',
      italic: 'Italique',
      underline: 'Souligné',
      h2: 'Titre 2',
      h3: 'Titre 3',
      bulletList: 'Liste à puces',
      numberedList: 'Liste numérotée',
      link: 'Lien',
      listBullet: '• Liste',
      listOrdered: '1. Liste'
    }
  },
  AR: {
    editArticle: 'تعديل المقالة',
    newArticle: 'مقالة جديدة',
    saveDraft: 'حفظ كمسودة',
    publish: 'نشر',
    updatePublish: 'تحديث ونشر',
    titlePlaceholder: 'عنوان المقال...',
    subtitlePlaceholder: 'عنوان فرعي (اختياري)...',
    excerptLabel: 'ملخص *',
    excerptPlaceholder: 'ملخص قصير عن المقال...',
    excerptHelp: 'سيظهر هذا في معاينة المقالات ونتائج البحث',
    contentLabel: 'المحتوى *',
    contentPlaceholder: 'ابدأ بكاتبة قصتك...',
    settingsTitle: 'الإعدادات',
    languageLabel: 'اللغة',
    slugLabel: 'الرابط الدائم',
    slugPlaceholder: 'رابط-المقال',
    categoryLabel: 'التصنيف',
    selectCategory: 'اختر تصنيفاً...',
    featuredImageTitle: 'الصورة البارزة',
    removeImage: 'إزالة الصورة',
    uploadClick: 'انقر لتحميل صورة',
    recommendedSize: 'المقاس الموصى به: 1200x630 بكسل',
    seoTitle: 'SEO',
    metaTitleLabel: 'عنوان السيو',
    metaTitlePlaceholder: 'عنوان السيو (60 حرف بحد أقصى)',
    metaDescLabel: 'وصف السيو',
    metaDescPlaceholder: 'وصف السيو (160 حرف بحد أقصى)',
    requiredFieldsError: 'يرجى ملء جميع الحقول المطلوبة',
    saveSuccess: 'تم حفظ المقالة بنجاح!',
    saveError: 'فشل في حفظ المقالة',
    categories: {
      politics: 'السياسة',
      economy: 'الاقتصاد',
      culture: 'الثقافة',
      technology: 'التكنولوجيا',
      environment: 'البيئة'
    },
    toolbar: {
      bold: 'عريض',
      italic: 'مائل',
      underline: 'تحته خط',
      h2: 'عنوان 2',
      h3: 'عنوان 3',
      bulletList: 'قائمة نقطية',
      numberedList: 'قائمة مرقمة',
      link: 'رابط',
      listBullet: '• قائمة',
      listOrdered: '1. قائمة'
    }
  }
};

// ================================
// Article Editor Component
// ================================
export default function ArticleEditor({ articleId, locale = 'EN' }: { articleId?: string, locale?: string }) {
  const t = translations[locale] || translations.EN;
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);
  const [isInitialContentSet, setIsInitialContentSet] = useState(false);
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState('DRAFT');
  const [featuredImage, setFeaturedImage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [createArticle] = useMutation(CREATE_ARTICLE);
  const [updateArticle] = useMutation(UPDATE_ARTICLE);

  const { data: articleData, loading: articleLoading, error: articleError } = useQuery(GET_ARTICLE_BY_ID, {
    variables: { id: articleId },
    skip: !articleId,
    fetchPolicy: 'network-only' // Ensure we get fresh data
  });

  useEffect(() => {
    if (articleData?.articleById) {
      const art = articleData.articleById;
      setTitle(art.content.title || '');
      setSubtitle(art.content.subtitle || '');
      setExcerpt(art.content.excerpt || '');
      setContent(art.content.content || '');
      setSlug(art.slug || '');
      setCategoryId(art.categoryId || '');
      setStatus(art.status || 'DRAFT');
      setFeaturedImage(art.featuredImageUrl || '');

      if (editorRef.current && !isInitialContentSet) {
        editorRef.current.innerHTML = art.content.content || '';
        setIsInitialContentSet(true);
      }
    }
  }, [articleData, isInitialContentSet]);

  // Ensure content is initialized for new articles
  useEffect(() => {
    if (!articleId && editorRef.current && !isInitialContentSet) {
      editorRef.current.innerHTML = '';
      setIsInitialContentSet(true);
    }
  }, [articleId, isInitialContentSet]);

  // Reset initial content set flag if article ID changes (e.g. from null to something)
  useEffect(() => {
    setIsInitialContentSet(false);
  }, [articleId]);

  // Auto-generate slug from title
  useEffect(() => {
    if (title && !articleId && !slug) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generatedSlug);
    }
  }, [title, articleId, slug]);

  const handleSave = async (saveStatus: 'DRAFT' | 'PUBLISHED') => {
    if (!title || !excerpt || !content) {
      alert(t.requiredFieldsError);
      return;
    }

    setIsSaving(true);

    try {
      const input = {
        article: {
          slug,
          locale,
          categoryId: categoryId || null,
          featuredImageUrl: featuredImage || null,
          status: saveStatus,
        },
        content: {
          title,
          subtitle: subtitle || null,
          excerpt,
          content,
        },
      };

      if (articleId) {
        await updateArticle({
          variables: {
            id: articleId,
            ...input,
          },
        });
        alert('Article updated successfully!');
      } else {
        const result = await createArticle({
          variables: { input },
        });

        if (result.data?.createArticle) {
          alert(t.saveSuccess);
          // Redirect to edit mode
          window.location.href = `/admin/articles/${result.data.createArticle.id}/edit`;
        } else {
          // Error case already logged by errorLink or caught by catch block
          // but we might want to alert specifically if needed
        }
      }
    } catch (error: any) {
      console.error('Save error:', error);
      alert(`${t.saveError}: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In production, upload to S3/Cloudinary
      const reader = new FileReader();
      reader.onload = (e) => {
        setFeaturedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <EditorContainer style={{ position: 'relative' }}>
      {articleLoading && <LoadingOverlay>Loading Article...</LoadingOverlay>}
      <MainEditor>
        <EditorHeader>
          <EditorTitle>{articleId ? t.editArticle : t.newArticle}</EditorTitle>
          <SaveButtons>
            <Button
              $variant="secondary"
              onClick={() => handleSave('DRAFT')}
              disabled={isSaving}
            >
              {t.saveDraft}
            </Button>
            <Button
              $variant="success"
              onClick={() => handleSave('PUBLISHED')}
              disabled={isSaving}
            >
              {articleId ? t.updatePublish : t.publish}
            </Button>
          </SaveButtons>
        </EditorHeader>

        <EditorContent>
          <TitleInput
            placeholder={t.titlePlaceholder}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            $locale={locale}
          />
          <SubtitleInput
            placeholder={t.subtitlePlaceholder}
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            $locale={locale}
          />

          <FormGroup>
            <Label>{t.excerptLabel}</Label>
            <TextArea
              placeholder={t.excerptPlaceholder}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              $locale={locale}
            />
            <HelpText>{t.excerptHelp}</HelpText>
          </FormGroup>

          <FormGroup>
            <Label>{t.contentLabel}</Label>
            <Toolbar>
              <ToolbarButton title={t.toolbar.bold} onClick={() => applyFormat('bold')}>
                <strong>B</strong>
              </ToolbarButton>
              <ToolbarButton title={t.toolbar.italic} onClick={() => applyFormat('italic')}>
                <em>I</em>
              </ToolbarButton>
              <ToolbarButton title={t.toolbar.underline} onClick={() => applyFormat('underline')}>
                <u>U</u>
              </ToolbarButton>
              <ToolbarButton title={t.toolbar.h2} onClick={() => applyFormat('formatBlock', 'h2')}>
                H2
              </ToolbarButton>
              <ToolbarButton title={t.toolbar.h3} onClick={() => applyFormat('formatBlock', 'h3')}>
                H3
              </ToolbarButton>
              <ToolbarButton title={t.toolbar.bulletList} onClick={() => applyFormat('insertUnorderedList')}>
                {t.toolbar.listBullet}
              </ToolbarButton>
              <ToolbarButton title={t.toolbar.numberedList} onClick={() => applyFormat('insertOrderedList')}>
                {t.toolbar.listOrdered}
              </ToolbarButton>
              <ToolbarButton title={t.toolbar.link} onClick={() => {
                const url = prompt('Enter URL:');
                if (url) applyFormat('createLink', url);
              }}>
                {t.toolbar.link}
              </ToolbarButton>
            </Toolbar>
            <ContentEditor
              id="article-content-editor"
              ref={editorRef}
              contentEditable
              data-placeholder={t.contentPlaceholder}
              onInput={(e) => setContent(e.currentTarget.innerHTML)}
              $locale={locale}
              onBlur={() => setContent(editorRef.current?.innerHTML || '')}
            />
          </FormGroup>
        </EditorContent>
      </MainEditor>

      <Sidebar>
        <SidebarCard>
          <SidebarTitle>{t.settingsTitle}</SidebarTitle>

          <FormGroup>
            <Label>{t.languageLabel}</Label>
            <Select value={locale} disabled>
              <option value="EN">English</option>
              <option value="FR">Français</option>
              <option value="AR">العربية</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>{t.slugLabel}</Label>
            <Input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder={t.slugPlaceholder}
            />
            <HelpText>/{locale.toLowerCase()}/{slug}</HelpText>
          </FormGroup>

          <FormGroup>
            <Label>{t.categoryLabel}</Label>
            <Select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">{t.selectCategory}</option>
              <option value="politics">{t.categories.politics}</option>
              <option value="economy">{t.categories.economy}</option>
              <option value="culture">{t.categories.culture}</option>
              <option value="technology">{t.categories.technology}</option>
              <option value="environment">{t.categories.environment}</option>
            </Select>
          </FormGroup>
        </SidebarCard>

        <SidebarCard>
          <SidebarTitle>{t.featuredImageTitle}</SidebarTitle>

          {featuredImage ? (
            <>
              <PreviewImage src={featuredImage} alt="Featured" />
              <Button onClick={() => setFeaturedImage('')}>
                {t.removeImage}
              </Button>
            </>
          ) : (
            <ImageUpload onClick={() => document.getElementById('image-upload')?.click()}>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
              <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="#999" style={{ margin: '0 auto 12px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p style={{ margin: 0, color: '#6c757d' }}>
                {t.uploadClick}
              </p>
              <HelpText>{t.recommendedSize}</HelpText>
            </ImageUpload>
          )}
        </SidebarCard>

        <SidebarCard>
          <SidebarTitle>{t.seoTitle}</SidebarTitle>

          <FormGroup>
            <Label>{t.metaTitleLabel}</Label>
            <Input
              type="text"
              placeholder={t.metaTitlePlaceholder}
              maxLength={60}
            />
          </FormGroup>

          <FormGroup>
            <Label>{t.metaDescLabel}</Label>
            <TextArea
              placeholder={t.metaDescPlaceholder}
              rows={3}
              maxLength={160}
            />
          </FormGroup>
        </SidebarCard>
      </Sidebar>
    </EditorContainer>
  );
}
