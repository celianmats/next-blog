/**
 * GraphQL Resolvers
 * Implementation of all queries, mutations, and subscriptions
 */

import { GraphQLError } from 'graphql';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const resolvers = {
  Query: {
    // ================================
    // Article Queries
    // ================================
    articles: async (_: any, { locale, status, categoryId, tagId, limit = 10, offset = 0 }: any, { db, user }: any) => {
      try {
        let query = `
          SELECT 
            a.id, a.slug, a.locale, a.status, a.author_id,
            a.category_id, a.featured_image_url, a.reading_time_minutes,
            a.view_count, a.published_at, a.created_at, a.updated_at,
            ac.title, ac.excerpt
          FROM articles a
          JOIN article_content ac ON a.id = ac.article_id
          WHERE 1=1
        `;

        const params = [];
        let paramIndex = 1;

        if (locale) {
          query += ` AND a.locale = $${paramIndex}`;
          params.push(locale.toLowerCase());
          paramIndex++;
        }

        if (status) {
          query += ` AND a.status = $${paramIndex}`;
          params.push(status.toLowerCase());
          paramIndex++;
        } else if (!user || user.role !== 'ADMIN') {
          // Non-admins only see published articles
          query += ` AND a.status = 'published' AND a.published_at <= NOW()`;
        }

        if (categoryId) {
          query += ` AND a.category_id = $${paramIndex}`;
          params.push(categoryId);
          paramIndex++;
        }

        if (tagId) {
          query += ` AND a.id IN (
            SELECT article_id FROM article_tags WHERE tag_id = $${paramIndex}
          )`;
          params.push(tagId);
          paramIndex++;
        }

        query += ` ORDER BY a.published_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        const result = await db.query(query, params);

        // Get total count
        const countQuery = `SELECT COUNT(*) FROM articles a WHERE 1=1 ${query.split('WHERE 1=1')[1].split('ORDER BY')[0]}`;
        const countParams = params.slice(0, -2); // Remove limit and offset
        const countResult = await db.query(countQuery, countParams);
        const totalCount = parseInt(countResult.rows[0].count);

        return {
          edges: result.rows.map((row: any, index: number) => ({
            node: formatArticle(row),
            cursor: Buffer.from(`${offset + index}`).toString('base64'),
          })),
          pageInfo: {
            hasNextPage: offset + limit < totalCount,
            hasPreviousPage: offset > 0,
            startCursor: result.rows.length > 0 ? Buffer.from(`${offset}`).toString('base64') : null,
            endCursor: result.rows.length > 0 ? Buffer.from(`${offset + result.rows.length - 1}`).toString('base64') : null,
            totalCount,
          },
          totalCount,
        };
      } catch (error) {
        throw new GraphQLError('Failed to fetch articles', {
          extensions: { code: 'DATABASE_ERROR', originalError: error },
        });
      }
    },

    article: async (_: any, { slug, locale }: any, { db }: any) => {
      try {
        // First try exact match
        let result = await db.query(
          `SELECT 
            a.id as article_id, a.slug, a.locale, a.status, a.author_id,
            a.category_id, a.featured_image_url, a.published_at, a.created_at, a.updated_at, a.view_count, a.reading_time_minutes,
            ac.title, ac.excerpt, ac.content, ac.content_json
          FROM articles a
          LEFT JOIN article_content ac ON a.id = ac.article_id
          WHERE a.slug = $1 AND a.locale = $2`,
          [slug, locale.toLowerCase()]
        );

        // If not found, try finding by slug regardless of locale
        if (result.rows.length === 0 || !result.rows[0].title) {
          const fallbackResult = await db.query(
            `SELECT 
              a.id as article_id, a.slug, a.locale, a.status, a.author_id,
              a.category_id, a.featured_image_url, a.published_at, a.created_at, a.updated_at, a.view_count, a.reading_time_minutes,
              ac.title, ac.excerpt, ac.content, ac.content_json
            FROM articles a
            LEFT JOIN article_content ac ON a.id = ac.article_id
            WHERE a.slug = $1
            ORDER BY (a.locale = $2) DESC, a.updated_at DESC
            LIMIT 1`,
            [slug, locale.toLowerCase()]
          );

          if (fallbackResult.rows.length > 0) {
            result = fallbackResult;
          }
        }

        if (result.rows.length === 0) {
          return null;
        }

        return formatArticle(result.rows[0]);
      } catch (error) {
        throw new GraphQLError('Failed to fetch article', {
          extensions: { code: 'DATABASE_ERROR' },
        });
      }
    },

    articleById: async (_: any, { id }: any, { db }: any) => {
      try {
        const result = await db.query(
          `SELECT 
            a.*, ac.*,
            a.id as article_id,
            ac.id as content_id
          FROM articles a
          JOIN article_content ac ON a.id = ac.article_id
          WHERE a.id = $1`,
          [id]
        );

        if (result.rows.length === 0) {
          return null;
        }

        return formatArticle(result.rows[0]);
      } catch (error) {
        throw new GraphQLError('Failed to fetch article', {
          extensions: { code: 'DATABASE_ERROR' },
        });
      }
    },

    featuredArticles: async (_: any, { locale, limit = 5 }: any, { db }: any) => {
      const result = await db.query(
        `SELECT a.*, ac.title, ac.excerpt
        FROM articles a
        JOIN article_content ac ON a.id = ac.article_id
        WHERE a.locale = $1 
          AND a.status = 'published'
          AND a.published_at <= NOW()
        ORDER BY a.view_count DESC, a.published_at DESC
        LIMIT $2`,
        [locale.toLowerCase(), limit]
      );

      return result.rows.map(formatArticle);
    },

    searchArticles: async (_: any, { query, locale, limit = 10, offset = 0 }: any, { db, elasticsearch }: any) => {
      try {
        // Use Elasticsearch for better search
        if (elasticsearch) {
          const searchResult = await elasticsearch.search({
            index: 'articles',
            body: {
              query: {
                bool: {
                  must: [
                    {
                      multi_match: {
                        query,
                        fields: ['title^3', 'excerpt^2', 'content'],
                        fuzziness: 'AUTO',
                      },
                    },
                    { term: { locale: locale.toLowerCase() } },
                    { term: { status: 'published' } },
                  ],
                },
              },
              from: offset,
              size: limit,
            },
          });

          const articleIds = searchResult.hits.hits.map((hit: any) => hit._id);

          if (articleIds.length === 0) {
            return {
              edges: [],
              pageInfo: { hasNextPage: false, hasPreviousPage: false },
              totalCount: 0,
            };
          }

          const articles = await db.query(
            `SELECT a.*, ac.title, ac.excerpt
            FROM articles a
            JOIN article_content ac ON a.id = ac.article_id
            WHERE a.id = ANY($1)`,
            [articleIds]
          );

          return {
            edges: articles.rows.map((row: any, index: number) => ({
              node: formatArticle(row),
              cursor: Buffer.from(`${offset + index}`).toString('base64'),
            })),
            pageInfo: {
              hasNextPage: searchResult.hits.total > offset + limit,
              hasPreviousPage: offset > 0,
            },
            totalCount: searchResult.hits.total,
          };
        }

        // Fallback to PostgreSQL full-text search
        const result = await db.query(
          `SELECT a.*, ac.title, ac.excerpt,
            ts_rank(to_tsvector('english', ac.title || ' ' || ac.excerpt || ' ' || ac.content), plainto_tsquery('english', $1)) as rank
          FROM articles a
          JOIN article_content ac ON a.id = ac.article_id
          WHERE a.locale = $2
            AND a.status = 'published'
            AND to_tsvector('english', ac.title || ' ' || ac.excerpt || ' ' || ac.content) @@ plainto_tsquery('english', $1)
          ORDER BY rank DESC
          LIMIT $3 OFFSET $4`,
          [query, locale.toLowerCase(), limit, offset]
        );

        const countResult = await db.query(
          `SELECT COUNT(*)
          FROM articles a
          JOIN article_content ac ON a.id = ac.article_id
          WHERE a.locale = $1
            AND a.status = 'published'
            AND to_tsvector('english', ac.title || ' ' || ac.excerpt || ' ' || ac.content) @@ plainto_tsquery('english', $2)`,
          [locale.toLowerCase(), query]
        );

        return {
          edges: result.rows.map((row: any, index: number) => ({
            node: formatArticle(row),
            cursor: Buffer.from(`${offset + index}`).toString('base64'),
          })),
          pageInfo: {
            hasNextPage: offset + limit < parseInt(countResult.rows[0].count),
            hasPreviousPage: offset > 0,
          },
          totalCount: parseInt(countResult.rows[0].count),
        };
      } catch (error) {
        throw new GraphQLError('Search failed', {
          extensions: { code: 'SEARCH_ERROR' },
        });
      }
    },

    // ================================
    // Category Queries
    // ================================
    categories: async (_: any, { locale }: any, { db }: any) => {
      const result = await db.query(
        `SELECT c.*, ct.name, ct.description, ct.locale
        FROM categories c
        LEFT JOIN category_translations ct ON c.id = ct.category_id AND ct.locale = $1
        WHERE c.is_active = true
        ORDER BY c.sort_order, ct.name`,
        [locale.toLowerCase()]
      );

      return result.rows.map(formatCategory);
    },

    category: async (_: any, { slug, locale }: any, { db }: any) => {
      const result = await db.query(
        `SELECT c.*, ct.name, ct.description, ct.locale
        FROM categories c
        LEFT JOIN category_translations ct ON c.id = ct.category_id AND ct.locale = $2
        WHERE c.slug = $1`,
        [slug, locale.toLowerCase()]
      );

      if (result.rows.length === 0) return null;
      return formatCategory(result.rows[0]);
    },

    // ================================
    // User Queries
    // ================================
    me: async (_: any, __: any, { user, db }: any) => {
      if (!user) return null;

      const result = await db.query(
        'SELECT * FROM users WHERE id = $1',
        [user.id]
      );

      if (result.rows.length === 0) return null;
      return formatUser(result.rows[0]);
    },

    user: async (_: any, { id }: any, { db }: any) => {
      const result = await db.query(
        'SELECT * FROM users WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      return formatUser(result.rows[0]);
    },

    // ================================
    // Comments Queries
    // ================================
    comments: async (_: any, { articleId, limit = 10, offset = 0 }: any, { db }: any) => {
      const result = await db.query(
        'SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
        [articleId, limit, offset]
      );

      const countResult = await db.query(
        'SELECT COUNT(*) FROM comments WHERE article_id = $1',
        [articleId]
      );
      const totalCount = parseInt(countResult.rows[0].count);

      return {
        edges: result.rows.map((row: any, index: number) => ({
          node: formatComment(row),
          cursor: Buffer.from(`${offset + index}`).toString('base64'),
        })),
        pageInfo: {
          hasNextPage: offset + limit < totalCount,
          hasPreviousPage: offset > 0,
          totalCount,
        },
        totalCount,
      };
    },

    // ================================
    // Media Queries
    // ================================
    media: async (_: any, { id }: any, { db }: any) => {
      const result = await db.query('SELECT * FROM media WHERE id = $1', [id]);
      if (result.rows.length === 0) return null;
      return formatMedia(result.rows[0]);
    },

    mediaLibrary: async (_: any, { limit = 20, offset = 0 }: any, { db }: any) => {
      const result = await db.query(
        'SELECT * FROM media ORDER BY created_at DESC LIMIT $1 OFFSET $2',
        [limit, offset]
      );
      return result.rows.map(formatMedia);
    },

    // ================================
    // Locale Utilities
    // ================================
    localeMetadata: async (_: any, { locale }: any) => {
      const metadata: any = {
        EN: { code: 'EN', name: 'English', nativeName: 'English', direction: 'LTR', isRTL: false },
        FR: { code: 'FR', name: 'French', nativeName: 'Français', direction: 'LTR', isRTL: false },
        AR: { code: 'AR', name: 'Arabic', nativeName: 'العربية', direction: 'RTL', isRTL: true },
      };

      return metadata[locale] || metadata.EN;
    },
  },

  Mutation: {
    // ================================
    // Authentication Mutations
    // ================================
    register: async (_: any, { input }: any, { db }: any) => {
      const { email, password, name } = input;

      const existingUser = await db.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        throw new GraphQLError('Email already registered', {
          extensions: { code: 'EMAIL_EXISTS' },
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const result = await db.query(
        `INSERT INTO users (email, password_hash, name, role, is_verified, is_active)
        VALUES ($1, $2, $3, 'subscriber', false, true)
        RETURNING *`,
        [email, passwordHash, name]
      );

      const user = formatUser(result.rows[0]);
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
        expiresIn: '7d',
      });

      return { token, user };
    },

    login: async (_: any, { input }: any, { db }: any) => {
      const { email, password } = input;

      const result = await db.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        throw new GraphQLError('Invalid credentials', {
          extensions: { code: 'INVALID_CREDENTIALS' },
        });
      }

      const user = result.rows[0];

      if (!user.is_active) {
        throw new GraphQLError('Account is disabled', {
          extensions: { code: 'ACCOUNT_DISABLED' },
        });
      }

      const valid = await bcrypt.compare(password, user.password_hash);

      if (!valid) {
        throw new GraphQLError('Invalid credentials', {
          extensions: { code: 'INVALID_CREDENTIALS' },
        });
      }

      await db.query(
        'UPDATE users SET last_login_at = NOW() WHERE id = $1',
        [user.id]
      );

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return { token, user: formatUser(user) };
    },

    // ================================
    // Article Mutations
    // ================================
    createArticle: async (_: any, { input }: any, { db, user }: any) => {
      if (!user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const { article, content } = input;
      const slug = article.slug;
      const locale = article.locale.toLowerCase();

      // Check if article with same slug and locale already exists
      const existingArticle = await db.query(
        'SELECT id FROM articles WHERE slug = $1 AND locale = $2',
        [slug, locale]
      );

      if (existingArticle.rows.length > 0) {
        throw new GraphQLError(`An article with the slug "${slug}" already exists for locale "${locale.toUpperCase()}".`, {
          extensions: { code: 'ALREADY_EXISTS' },
        });
      }

      // Resolve category ID from slug if necessary
      let resolvedCategoryId = article.categoryId || null;
      if (resolvedCategoryId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(resolvedCategoryId)) {
        const categoryResult = await db.query(
          'SELECT id FROM categories WHERE slug = $1',
          [resolvedCategoryId]
        );
        resolvedCategoryId = categoryResult.rows[0]?.id || null;
      }

      try {
        await db.query('BEGIN');

        const status = article.status?.toLowerCase() || 'draft';
        const publishedAt = status === 'published' ? 'NOW()' : 'NULL';

        const articleResult = await db.query(
          `INSERT INTO articles (slug, locale, status, author_id, category_id, featured_image_url, published_at)
          VALUES ($1, $2, $3, $4, $5, $6, ${publishedAt})
          RETURNING *`,
          [
            article.slug,
            article.locale.toLowerCase(),
            status,
            user.id,
            resolvedCategoryId,
            article.featuredImageUrl || null,
          ]
        );

        const articleId = articleResult.rows[0].id;

        await db.query(
          `INSERT INTO article_content (article_id, title, subtitle, excerpt, content, content_json, meta_title, meta_description)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            articleId,
            content.title,
            content.subtitle || null,
            content.excerpt,
            content.content,
            content.contentJson || null,
            content.metaTitle || null,
            content.metaDescription || null,
          ]
        );

        if (article.tagIds && article.tagIds.length > 0) {
          for (const tagId of article.tagIds) {
            await db.query(
              'INSERT INTO article_tags (article_id, tag_id) VALUES ($1, $2)',
              [articleId, tagId]
            );
          }
        }

        await db.query('COMMIT');

        const completeArticle = await db.query(
          `SELECT a.*, ac.* FROM articles a
          JOIN article_content ac ON a.id = ac.article_id
          WHERE a.id = $1`,
          [articleId]
        );

        return formatArticle(completeArticle.rows[0]);
      } catch (error: any) {
        await db.query('ROLLBACK');
        console.error('DATABASE ERROR in createArticle:', error);
        throw new GraphQLError('Failed to create article', {
          extensions: {
            code: 'DATABASE_ERROR',
            originalError: error.message,
            stack: error.stack
          },
        });
      }
    },

    updateArticle: async (_: any, { id, article, content }: any, { db, user }: any) => {
      if (!user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      try {
        await db.query('BEGIN');

        if (article) {
          // Resolve category ID from slug if necessary
          if (article.categoryId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(article.categoryId)) {
            const categoryResult = await db.query(
              'SELECT id FROM categories WHERE slug = $1',
              [article.categoryId]
            );
            article.categoryId = categoryResult.rows[0]?.id || null;
          }

          const articleFields = [];
          const articleValues = [];
          let i = 1;

          if (article.slug) {
            articleFields.push(`slug = $${i++}`);
            articleValues.push(article.slug);
          }
          if (article.status) {
            const status = article.status.toLowerCase();
            articleFields.push(`status = $${i++}`);
            articleValues.push(status);

            if (status === 'published') {
              articleFields.push(`published_at = NOW()`);
            }
          }
          if (article.categoryId !== undefined) {
            articleFields.push(`category_id = $${i++}`);
            articleValues.push(article.categoryId || null);
          }
          if (article.featuredImageUrl !== undefined) {
            articleFields.push(`featured_image_url = $${i++}`);
            articleValues.push(article.featuredImageUrl || null);
          }

          if (articleFields.length > 0) {
            articleValues.push(id);
            // Fix: Add parentheses around the author/admin check to prevent updating any article as an admin
            await db.query(
              `UPDATE articles SET ${articleFields.join(', ')}, updated_at = NOW() WHERE id = $${i} AND (author_id = $${i + 1} OR (SELECT role FROM users WHERE id = $${i + 1}) = 'admin')`,
              [...articleValues, id, user.id]
            );
          }
        }

        if (content) {
          const contentFields = [];
          const contentValues = [];
          let i = 1;

          if (content.title) {
            contentFields.push(`title = $${i++}`);
            contentValues.push(content.title);
          }
          if (content.subtitle !== undefined) {
            contentFields.push(`subtitle = $${i++}`);
            contentValues.push(content.subtitle || null);
          }
          if (content.excerpt) {
            contentFields.push(`excerpt = $${i++}`);
            contentValues.push(content.excerpt);
          }
          if (content.content) {
            contentFields.push(`content = $${i++}`);
            contentValues.push(content.content);
          }
          if (content.contentJson !== undefined) {
            contentFields.push(`content_json = $${i++}`);
            contentValues.push(content.contentJson || null);
          }
          if (content.metaTitle !== undefined) {
            contentFields.push(`meta_title = $${i++}`);
            contentValues.push(content.metaTitle || null);
          }
          if (content.metaDescription !== undefined) {
            contentFields.push(`meta_description = $${i++}`);
            contentValues.push(content.metaDescription || null);
          }

          if (contentFields.length > 0) {
            contentValues.push(id);
            await db.query(
              `UPDATE article_content SET ${contentFields.join(', ')} WHERE article_id = $${i}`,
              contentValues
            );
          }
        }

        await db.query('COMMIT');

        const result = await db.query(
          `SELECT a.*, ac.*, a.id as article_id, ac.id as content_id FROM articles a 
          JOIN article_content ac ON a.id = ac.article_id 
          WHERE a.id = $1`,
          [id]
        );

        return formatArticle(result.rows[0]);
      } catch (error: any) {
        await db.query('ROLLBACK');
        console.error('DATABASE ERROR in updateArticle:', error);
        throw new GraphQLError('Failed to update article', {
          extensions: {
            code: 'DATABASE_ERROR',
            originalError: error.message,
            stack: error.stack
          },
        });
      }
    },

    publishArticle: async (_: any, { id }: any, { db, user }: any) => {
      if (!user || user.role !== 'ADMIN') {
        throw new GraphQLError('Unauthorized', {
          extensions: { code: 'FORBIDDEN' },
        });
      }
      const result = await db.query(
        "UPDATE articles SET status = 'published', published_at = NOW() WHERE id = $1 RETURNING *",
        [id]
      );
      // Note: publishArticle only returns the article table row, Article.content field resolver will fetch details
      return formatArticle(result.rows[0]);
    },
  },

  // ================================
  // Field Resolvers
  // ================================
  Article: {
    author: async (article: any, _: any, { db }: any) => {
      const result = await db.query(
        'SELECT * FROM users WHERE id = $1',
        [article.authorId]
      );
      return formatUser(result.rows[0]);
    },

    category: async (article: any, _: any, { db }: any) => {
      if (!article.categoryId) return null;

      const result = await db.query(
        'SELECT * FROM categories WHERE id = $1',
        [article.categoryId]
      );
      return result.rows.length > 0 ? formatCategory(result.rows[0]) : null;
    },

    tags: async (article: any, _: any, { db }: any) => {
      const result = await db.query(
        `SELECT t.* FROM tags t
        JOIN article_tags at ON t.id = at.tag_id
        WHERE at.article_id = $1`,
        [article.id]
      );
      return result.rows.map(formatTag);
    },

    content: async (article: any, _: any, { db }: any) => {
      // Optimization: if we already have content from a JOIN in the parent query
      if (article.dbContent !== undefined && article.dbContent !== null) {
        return {
          id: article.content_id || `content-${article.id}`,
          articleId: article.id,
          title: article.title || 'Untitled',
          subtitle: article.subtitle,
          excerpt: article.excerpt || '',
          content: article.dbContent || '',
          contentJson: article.dbContentJson,
          metaTitle: article.meta_title,
          metaDescription: article.meta_description,
        };
      }

      const result = await db.query(
        'SELECT * FROM article_content WHERE article_id = $1',
        [article.id]
      );

      if (result.rows.length > 0) {
        const row = result.rows[0];
        return {
          id: row.id,
          articleId: row.article_id,
          title: row.title,
          subtitle: row.subtitle,
          excerpt: row.excerpt,
          content: row.content,
          contentJson: row.content_json,
          metaTitle: row.meta_title,
          metaDescription: row.meta_description,
        };
      }

      // Fallback to avoid "Cannot return null for non-nullable field Article.content"
      return {
        id: 'fallback-content',
        articleId: article.id,
        title: article.title || 'Untitled',
        excerpt: article.excerpt || '',
        content: '',
      };
    },

    isPublished: (article: any) => {
      return article.status === 'published' && new Date(article.published_at) <= new Date();
    },

    url: (article: any) => {
      return `/${article.locale.toLowerCase()}/${article.slug}`;
    },

    comments: async (article: any, { limit = 10, offset = 0 }: any, { db }: any) => {
      const result = await db.query(
        'SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
        [article.id, limit, offset]
      );

      const countResult = await db.query(
        'SELECT COUNT(*) FROM comments WHERE article_id = $1',
        [article.id]
      );
      const totalCount = parseInt(countResult.rows[0].count);

      return {
        edges: result.rows.map((row: any, index: number) => ({
          node: formatComment(row),
          cursor: Buffer.from(`${offset + index}`).toString('base64'),
        })),
        pageInfo: {
          hasNextPage: offset + limit < totalCount,
          hasPreviousPage: offset > 0,
          totalCount,
        },
        totalCount,
      };
    },

    relatedArticles: async (article: any, { limit = 5 }: any, { db }: any) => {
      try {
        const locale = article.locale.toLowerCase();
        let result;

        if (article.category_id) {
          result = await db.query(
            `SELECT a.*, ac.title, ac.excerpt
             FROM articles a
             JOIN article_content ac ON a.id = ac.article_id
             WHERE a.category_id = $1 
               AND a.id != $2 
               AND a.status = 'published'
               AND a.locale = $3
             ORDER BY a.published_at DESC
             LIMIT $4`,
            [article.category_id, article.id, locale, limit]
          );
        }

        if (!result || result.rows.length === 0) {
          // Fallback to latest articles in the same locale
          result = await db.query(
            `SELECT a.*, ac.title, ac.excerpt
             FROM articles a
             JOIN article_content ac ON a.id = ac.article_id
             WHERE a.id != $1 
               AND a.status = 'published'
               AND a.locale = $2
             ORDER BY a.published_at DESC
             LIMIT $3`,
            [article.id, locale, limit]
          );
        }

        return result.rows.map(formatArticle);
      } catch (error) {
        console.error('Error in relatedArticles resolver:', error);
        return [];
      }
    },
  },
};

/**
 * Formatter Functions
 */
function formatArticle(row: any) {
  if (!row) return null;
  return {
    id: row.article_id || row.id,
    slug: row.slug,
    locale: (row.locale || 'en').toUpperCase(),
    status: (row.status || 'draft').toUpperCase(),
    authorId: row.author_id,
    categoryId: row.category_id,
    featuredImageUrl: row.featured_image_url,
    readingTimeMinutes: row.reading_time_minutes || 0,
    viewCount: row.view_count || 0,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    // Pass these for field resolver fallbacks or optimizations
    content_id: row.content_id || row.id,
    title: row.title,
    subtitle: row.subtitle,
    excerpt: row.excerpt,
    dbContent: row.content,
    dbContentJson: row.content_json,
    meta_title: row.meta_title,
    meta_description: row.meta_description,
  };
}


function formatUser(row: any) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    bio: row.bio,
    avatarUrl: row.avatar_url,
    role: (row.role || 'subscriber').toUpperCase(),
    isVerified: row.is_verified,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function formatCategory(row: any) {
  return {
    id: row.id,
    slug: row.slug,
    parentId: row.parent_id,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  };
}

function formatTag(row: any) {
  return {
    id: row.id,
    slug: row.slug,
  };
}

function formatComment(row: any) {
  return {
    id: row.id,
    article_id: row.article_id,
    author_id: row.author_id,
    content: row.content,
    status: (row.status || 'pending').toUpperCase(),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function formatMedia(row: any) {
  return {
    id: row.id,
    url: row.url,
    filename: row.filename,
    mimeType: row.mime_type,
    fileSize: row.file_size,
    altText: row.alt_text,
    caption: row.caption,
    uploadedById: row.uploaded_by_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
