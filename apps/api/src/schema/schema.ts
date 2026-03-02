/**
 * GraphQL Schema Definition
 * Comprehensive type definitions for the multi-language platform
 */

export const typeDefs = `#graphql
  # ================================
  # Scalar Types
  # ================================
  scalar DateTime
  scalar JSON

  # ================================
  # Enums
  # ================================
  enum Locale {
    EN
    FR
    AR
  }

  enum UserRole {
    ADMIN
    EDITOR
    AUTHOR
    SUBSCRIBER
  }

  enum ArticleStatus {
    DRAFT
    PUBLISHED
    ARCHIVED
  }

  enum Direction {
    LTR
    RTL
  }

  # ================================
  # Core Types
  # ================================
  type User {
    id: ID!
    email: String!
    name: String!
    bio: String
    avatarUrl: String
    role: UserRole!
    isVerified: Boolean!
    isActive: Boolean!
    articles(locale: Locale, limit: Int, offset: Int): [Article!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Category {
    id: ID!
    slug: String!
    translations: [CategoryTranslation!]!
    articles(locale: Locale, limit: Int): [Article!]!
    parentId: ID
    parent: Category
    children: [Category!]
    sortOrder: Int!
    isActive: Boolean!
  }

  type CategoryTranslation {
    id: ID!
    categoryId: ID!
    locale: Locale!
    name: String!
    description: String
  }

  type Tag {
    id: ID!
    slug: String!
    translations: [TagTranslation!]!
    articles(locale: Locale, limit: Int): [Article!]!
  }

  type TagTranslation {
    id: ID!
    tagId: ID!
    locale: Locale!
    name: String!
  }

  type Article {
    id: ID!
    slug: String!
    locale: Locale!
    status: ArticleStatus!
    authorId: ID!
    author: User!
    categoryId: ID
    category: Category
    tags: [Tag!]!
    content: ArticleContent!
    featuredImageUrl: String
    readingTimeMinutes: Int
    viewCount: Int!
    publishedAt: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
    
    # Computed fields
    isPublished: Boolean!
    url: String!
    relatedArticles(limit: Int): [Article!]!
    comments(limit: Int, offset: Int): CommentConnection!
  }

  type ArticleContent {
    id: ID!
    articleId: ID!
    title: String!
    subtitle: String
    excerpt: String!
    content: String!
    contentJson: JSON
    metaTitle: String
    metaDescription: String
  }

  type Comment {
    id: ID!
    articleId: ID!
    article: Article!
    user: User!
    parentId: ID
    parent: Comment
    replies: [Comment!]!
    content: String!
    isApproved: Boolean!
    isDeleted: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Media {
    id: ID!
    filename: String!
    originalFilename: String!
    mimeType: String!
    fileSize: Int!
    url: String!
    thumbnailUrl: String
    width: Int
    height: Int
    altText: String
    caption: String
    uploadedBy: User
    createdAt: DateTime!
  }

  type NewsletterSubscription {
    id: ID!
    email: String!
    locale: Locale!
    isSubscribed: Boolean!
    verifiedAt: DateTime
    createdAt: DateTime!
  }

  # ================================
  # Pagination Types
  # ================================
  type ArticleConnection {
    edges: [ArticleEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type ArticleEdge {
    node: Article!
    cursor: String!
  }

  type CommentConnection {
    edges: [CommentEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type CommentEdge {
    node: Comment!
    cursor: String!
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
    totalCount: Int!
  }

  # ================================
  # Input Types
  # ================================
  input ArticleInput {
    slug: String!
    locale: Locale!
    categoryId: ID
    tagIds: [ID!]
    featuredImageUrl: String
    status: ArticleStatus
  }

  input ArticleContentInput {
    title: String!
    subtitle: String
    excerpt: String!
    content: String!
    contentJson: JSON
    metaTitle: String
    metaDescription: String
  }

  input CreateArticleInput {
    article: ArticleInput!
    content: ArticleContentInput!
  }

  input UpdateArticleInput {
    slug: String
    categoryId: ID
    tagIds: [ID!]
    featuredImageUrl: String
    status: ArticleStatus
  }

  input UpdateArticleContentInput {
    title: String
    subtitle: String
    excerpt: String
    content: String
    contentJson: JSON
    metaTitle: String
    metaDescription: String
  }

  input CategoryInput {
    slug: String!
    parentId: ID
    sortOrder: Int
    translations: [CategoryTranslationInput!]!
  }

  input CategoryTranslationInput {
    locale: Locale!
    name: String!
    description: String
  }

  input TagInput {
    slug: String!
    translations: [TagTranslationInput!]!
  }

  input TagTranslationInput {
    locale: Locale!
    name: String!
  }

  input CommentInput {
    articleId: ID!
    parentId: ID
    content: String!
  }

  input RegisterInput {
    email: String!
    password: String!
    name: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input NewsletterSubscribeInput {
    email: String!
    locale: Locale!
  }

  # ================================
  # Response Types
  # ================================
  type AuthPayload {
    token: String!
    user: User!
  }

  type Success {
    success: Boolean!
    message: String
  }

  # ================================
  # Query Type
  # ================================
  type Query {
    # Articles
    articles(
      locale: Locale
      status: ArticleStatus
      categoryId: ID
      tagId: ID
      limit: Int
      offset: Int
      orderBy: String
    ): ArticleConnection!
    
    article(slug: String!, locale: Locale!): Article
    articleById(id: ID!): Article
    
    featuredArticles(locale: Locale!, limit: Int): [Article!]!
    
    searchArticles(
      query: String!
      locale: Locale!
      limit: Int
      offset: Int
    ): ArticleConnection!

    # Categories
    categories(locale: Locale!): [Category!]!
    category(slug: String!, locale: Locale!): Category

    # Tags
    tags(locale: Locale!, limit: Int): [Tag!]!
    tag(slug: String!, locale: Locale!): Tag

    # Users
    me: User
    user(id: ID!): User

    # Comments
    comments(articleId: ID!, limit: Int, offset: Int): CommentConnection!

    # Media
    media(id: ID!): Media
    mediaLibrary(limit: Int, offset: Int): [Media!]!

    # Locale utilities
    localeMetadata(locale: Locale!): LocaleMetadata!
  }

  # ================================
  # Mutation Type
  # ================================
  type Mutation {
    # Authentication
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    logout: Success!
    refreshToken: AuthPayload!

    # Articles
    createArticle(input: CreateArticleInput!): Article!
    updateArticle(id: ID!, article: UpdateArticleInput, content: UpdateArticleContentInput): Article!
    deleteArticle(id: ID!): Success!
    publishArticle(id: ID!): Article!
    archiveArticle(id: ID!): Article!
    incrementArticleViews(id: ID!): Success!

    # Categories
    createCategory(input: CategoryInput!): Category!
    updateCategory(id: ID!, input: CategoryInput!): Category!
    deleteCategory(id: ID!): Success!

    # Tags
    createTag(input: TagInput!): Tag!
    updateTag(id: ID!, input: TagInput!): Tag!
    deleteTag(id: ID!): Success!

    # Comments
    createComment(input: CommentInput!): Comment!
    updateComment(id: ID!, content: String!): Comment!
    deleteComment(id: ID!): Success!
    approveComment(id: ID!): Comment!

    # Media
    uploadMedia(file: Upload!): Media!
    updateMedia(id: ID!, altText: String, caption: String): Media!
    deleteMedia(id: ID!): Success!

    # Newsletter
    subscribeNewsletter(input: NewsletterSubscribeInput!): NewsletterSubscription!
    unsubscribeNewsletter(email: String!): Success!
    verifyNewsletterSubscription(token: String!): Success!
  }

  # ================================
  # Subscription Type
  # ================================
  type Subscription {
    articlePublished(locale: Locale): Article!
    commentAdded(articleId: ID!): Comment!
  }

  # ================================
  # Additional Types
  # ================================
  type LocaleMetadata {
    code: Locale!
    name: String!
    nativeName: String!
    direction: Direction!
    isRTL: Boolean!
  }

  scalar Upload
`;
