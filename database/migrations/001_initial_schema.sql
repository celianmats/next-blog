-- Initial database schema for Republik multi-language platform
-- Migration: 001_initial_schema.sql

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search
CREATE EXTENSION IF NOT EXISTS "unaccent"; -- For accent-insensitive search

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'editor', 'author', 'subscriber');
CREATE TYPE article_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE locale_code AS ENUM ('en', 'fr', 'ar');

-- ============================================
-- Users Table
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'subscriber',
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = TRUE;

-- ============================================
-- Categories Table (Multi-language)
-- ============================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(100) NOT NULL,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(slug)
);

CREATE TABLE category_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  locale locale_code NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(category_id, locale)
);

-- Create indexes for categories
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_category_translations_locale ON category_translations(locale);

-- ============================================
-- Articles Table (Multi-language)
-- ============================================
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(255) NOT NULL,
  locale locale_code NOT NULL,
  status article_status DEFAULT 'draft',
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  featured_image_url TEXT,
  reading_time_minutes INTEGER,
  view_count INTEGER DEFAULT 0,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(slug, locale)
);

CREATE TABLE article_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  subtitle VARCHAR(500),
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  content_json JSONB, -- For structured content
  meta_title VARCHAR(70),
  meta_description VARCHAR(160),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(article_id)
);

-- Create indexes for articles
CREATE INDEX idx_articles_locale ON articles(locale);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_published ON articles(published_at DESC) WHERE status = 'published';
CREATE INDEX idx_articles_slug_locale ON articles(slug, locale);
CREATE INDEX idx_articles_author ON articles(author_id);
CREATE INDEX idx_articles_category ON articles(category_id);
CREATE INDEX idx_article_content_search ON article_content USING gin(to_tsvector('english', title || ' ' || excerpt || ' ' || content));

-- ============================================
-- Tags Table (Multi-language)
-- ============================================
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(slug)
);

CREATE TABLE tag_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  locale locale_code NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tag_id, locale)
);

-- Article-Tag relationship
CREATE TABLE article_tags (
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (article_id, tag_id)
);

-- Create indexes for tags
CREATE INDEX idx_tags_slug ON tags(slug);
CREATE INDEX idx_article_tags_article ON article_tags(article_id);
CREATE INDEX idx_article_tags_tag ON article_tags(tag_id);

-- ============================================
-- Comments Table
-- ============================================
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for comments
CREATE INDEX idx_comments_article ON comments(article_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);

-- ============================================
-- Media Library Table
-- ============================================
CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size INTEGER NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  caption TEXT,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for media
CREATE INDEX idx_media_mime_type ON media(mime_type);
CREATE INDEX idx_media_uploaded_by ON media(uploaded_by);

-- ============================================
-- Newsletter Subscriptions Table
-- ============================================
CREATE TABLE newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  locale locale_code DEFAULT 'en',
  is_subscribed BOOLEAN DEFAULT TRUE,
  verification_token VARCHAR(255),
  verified_at TIMESTAMP,
  unsubscribed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for newsletter
CREATE INDEX idx_newsletter_email ON newsletter_subscriptions(email);
CREATE INDEX idx_newsletter_active ON newsletter_subscriptions(is_subscribed) WHERE is_subscribed = TRUE;

-- ============================================
-- Translations/i18n Table
-- ============================================
CREATE TABLE translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(255) NOT NULL,
  locale locale_code NOT NULL,
  value TEXT NOT NULL,
  context VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(key, locale)
);

-- Create indexes for translations
CREATE INDEX idx_translations_key_locale ON translations(key, locale);

-- ============================================
-- Audit Log Table
-- ============================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for audit logs
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- ============================================
-- Functions and Triggers
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update_updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_article_content_updated_at BEFORE UPDATE ON article_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_updated_at BEFORE UPDATE ON media
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment article view count
CREATE OR REPLACE FUNCTION increment_article_views(article_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE articles SET view_count = view_count + 1 WHERE id = article_uuid;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Seed Data (Optional)
-- ============================================

-- Insert default admin user (password: admin123 - CHANGE IN PRODUCTION!)
INSERT INTO users (email, password_hash, name, role, is_verified, is_active)
VALUES (
  'admin@republik.local',
  '$2a$10$YourHashedPasswordHere', -- Use bcrypt to hash in production
  'Admin User',
  'admin',
  TRUE,
  TRUE
);

-- Insert default categories
INSERT INTO categories (slug, sort_order) VALUES
  ('politics', 1),
  ('economy', 2),
  ('culture', 3),
  ('technology', 4),
  ('environment', 5);

-- Insert category translations
DO $$
DECLARE
  politics_id UUID;
  economy_id UUID;
  culture_id UUID;
  tech_id UUID;
  env_id UUID;
BEGIN
  SELECT id INTO politics_id FROM categories WHERE slug = 'politics';
  SELECT id INTO economy_id FROM categories WHERE slug = 'economy';
  SELECT id INTO culture_id FROM categories WHERE slug = 'culture';
  SELECT id INTO tech_id FROM categories WHERE slug = 'technology';
  SELECT id INTO env_id FROM categories WHERE slug = 'environment';

  -- English translations
  INSERT INTO category_translations (category_id, locale, name, description) VALUES
    (politics_id, 'en', 'Politics', 'Political news and analysis'),
    (economy_id, 'en', 'Economy', 'Economic trends and insights'),
    (culture_id, 'en', 'Culture', 'Arts, culture, and society'),
    (tech_id, 'en', 'Technology', 'Tech news and innovation'),
    (env_id, 'en', 'Environment', 'Climate and environmental issues');

  -- French translations
  INSERT INTO category_translations (category_id, locale, name, description) VALUES
    (politics_id, 'fr', 'Politique', 'Actualités et analyses politiques'),
    (economy_id, 'fr', 'Économie', 'Tendances et perspectives économiques'),
    (culture_id, 'fr', 'Culture', 'Arts, culture et société'),
    (tech_id, 'fr', 'Technologie', 'Actualités technologiques et innovation'),
    (env_id, 'fr', 'Environnement', 'Questions climatiques et environnementales');

  -- Arabic translations
  INSERT INTO category_translations (category_id, locale, name, description) VALUES
    (politics_id, 'ar', 'سياسة', 'أخبار وتحليلات سياسية'),
    (economy_id, 'ar', 'اقتصاد', 'اتجاهات ورؤى اقتصادية'),
    (culture_id, 'ar', 'ثقافة', 'الفنون والثقافة والمجتمع'),
    (tech_id, 'ar', 'تكنولوجيا', 'أخبار التكنولوجيا والابتكار'),
    (env_id, 'ar', 'بيئة', 'القضايا المناخية والبيئية');
END $$;

-- Create views for easier querying
CREATE VIEW published_articles AS
SELECT 
  a.id,
  a.slug,
  a.locale,
  a.author_id,
  a.category_id,
  a.featured_image_url,
  a.reading_time_minutes,
  a.view_count,
  a.published_at,
  ac.title,
  ac.subtitle,
  ac.excerpt,
  ac.content,
  u.name as author_name,
  u.avatar_url as author_avatar
FROM articles a
JOIN article_content ac ON a.id = ac.article_id
JOIN users u ON a.author_id = u.id
WHERE a.status = 'published'
  AND a.published_at IS NOT NULL
  AND a.published_at <= NOW();

-- Grant permissions (adjust as needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

COMMENT ON DATABASE republik IS 'Multi-language news platform database with RTL support';
