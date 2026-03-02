# Production Deployment Guide

Complete guide for deploying your Republik-style multi-language platform to production.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Database Setup](#database-setup)
3. [Deployment Options](#deployment-options)
4. [Security Hardening](#security-hardening)
5. [Performance Optimization](#performance-optimization)
6. [Monitoring & Logging](#monitoring--logging)

---

## Pre-Deployment Checklist

### Security
- [ ] Change all default passwords and secrets
- [ ] Generate secure JWT_SECRET and COOKIE_SECRET
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure proper CORS settings
- [ ] Set up rate limiting
- [ ] Enable security headers
- [ ] Review and update CSP (Content Security Policy)
- [ ] Set COOKIE_SECURE=true
- [ ] Disable debug mode and introspection in GraphQL

### Environment
- [ ] Set NODE_ENV=production
- [ ] Configure production database
- [ ] Set up Redis for production
- [ ] Configure Elasticsearch cluster
- [ ] Set up CDN for static assets
- [ ] Configure email service (SendGrid/Mailgun)
- [ ] Set up file storage (S3/Cloudinary)

### Code
- [ ] Run all tests
- [ ] Fix all linting errors
- [ ] Remove console.logs
- [ ] Optimize images
- [ ] Enable compression
- [ ] Configure caching strategies

---

## Database Setup

### PostgreSQL Production Setup

#### 1. Create Production Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE republik_production;

# Create dedicated user
CREATE USER republik_app WITH ENCRYPTED PASSWORD 'your-secure-password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE republik_production TO republik_app;
```

#### 2. Run Migrations

```bash
# Export connection string
export DATABASE_URL="postgresql://republik_app:password@host:5432/republik_production"

# Run migrations
cd apps/api
node scripts/migrate.js
```

#### 3. Database Optimization

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Create indexes for performance
CREATE INDEX CONCURRENTLY idx_articles_published_locale 
  ON articles(locale, published_at DESC) 
  WHERE status = 'published';

CREATE INDEX CONCURRENTLY idx_article_content_search 
  ON article_content 
  USING gin(to_tsvector('english', title || ' ' || excerpt || ' ' || content));

-- Analyze tables
ANALYZE articles;
ANALYZE article_content;
ANALYZE users;
```

#### 4. Database Backups

```bash
# Daily backup script
#!/bin/bash
BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/republik_$DATE.sql.gz"

pg_dump -U republik_app republik_production | gzip > $BACKUP_FILE

# Keep only last 30 days
find $BACKUP_DIR -name "republik_*.sql.gz" -mtime +30 -delete

# Upload to S3 (optional)
aws s3 cp $BACKUP_FILE s3://your-backup-bucket/postgres/
```

---

## Deployment Options

### Option 1: Vercel (Frontend) + Heroku (Backend)

#### Deploy Frontend to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd apps/web
vercel --prod

# Configure environment variables in Vercel dashboard
```

**vercel.json:**
```json
{
  "buildCommand": "yarn build",
  "devCommand": "yarn dev",
  "installCommand": "yarn install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_API_URL": "@api_url",
    "NEXT_PUBLIC_DEFAULT_LOCALE": "en"
  }
}
```

#### Deploy Backend to Heroku

```bash
# Install Heroku CLI
brew install heroku/brew/heroku

# Login
heroku login

# Create app
heroku create republik-api

# Add PostgreSQL
heroku addons:create heroku-postgresql:standard-0

# Add Redis
heroku addons:create heroku-redis:premium-0

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=$(openssl rand -hex 32)

# Deploy
git push heroku main

# Run migrations
heroku run node scripts/migrate.js
```

**Procfile:**
```
web: node apps/api/dist/index.js
worker: node apps/api/dist/workers/newsletter.js
```

### Option 2: AWS (Full Stack)

#### Infrastructure as Code (Terraform)

```hcl
# main.tf
provider "aws" {
  region = "us-east-1"
}

# VPC
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  
  tags = {
    Name = "republik-vpc"
  }
}

# RDS PostgreSQL
resource "aws_db_instance" "postgres" {
  identifier           = "republik-db"
  engine              = "postgres"
  engine_version      = "14.7"
  instance_class      = "db.t3.medium"
  allocated_storage   = 100
  storage_encrypted   = true
  
  db_name  = "republik"
  username = "republik"
  password = var.db_password
  
  vpc_security_group_ids = [aws_security_group.db.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  
  backup_retention_period = 30
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  tags = {
    Name = "republik-postgres"
  }
}

# ElastiCache Redis
resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "republik-redis"
  engine              = "redis"
  node_type           = "cache.t3.medium"
  num_cache_nodes     = 1
  parameter_group_name = "default.redis7"
  port                = 6379
  
  security_group_ids = [aws_security_group.redis.id]
  subnet_group_name  = aws_elasticache_subnet_group.main.name
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "republik-cluster"
}

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "republik-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets           = aws_subnet.public[*].id
}
```

#### Deploy with Docker

```dockerfile
# apps/api/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json yarn.lock ./
COPY apps/api ./apps/api
COPY packages ./packages

RUN yarn install --frozen-lockfile
RUN yarn workspace api build

FROM node:20-alpine

WORKDIR /app
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production
EXPOSE 5010

CMD ["node", "dist/index.js"]
```

```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account.dkr.ecr.us-east-1.amazonaws.com

docker build -t republik-api -f apps/api/Dockerfile .
docker tag republik-api:latest your-account.dkr.ecr.us-east-1.amazonaws.com/republik-api:latest
docker push your-account.dkr.ecr.us-east-1.amazonaws.com/republik-api:latest
```

### Option 3: Digital Ocean (Simple & Cost-Effective)

```bash
# Install doctl
brew install doctl

# Authenticate
doctl auth init

# Create managed PostgreSQL
doctl databases create republik-db \
  --engine pg \
  --version 14 \
  --region nyc1 \
  --size db-s-2vcpu-4gb

# Create app
doctl apps create --spec app.yaml
```

**app.yaml:**
```yaml
name: republik-platform
region: nyc

services:
- name: api
  github:
    repo: your-username/republik-platform
    branch: main
    deploy_on_push: true
  build_command: yarn workspace api build
  run_command: node apps/api/dist/index.js
  environment_slug: node-js
  instance_count: 2
  instance_size_slug: professional-xs
  http_port: 5010
  envs:
  - key: NODE_ENV
    value: production
  - key: DATABASE_URL
    value: ${republik-db.DATABASE_URL}

- name: web
  github:
    repo: your-username/republik-platform
    branch: main
  build_command: yarn workspace web build
  run_command: yarn workspace web start
  environment_slug: node-js
  instance_count: 2
  instance_size_slug: professional-xs
  http_port: 3000
  routes:
  - path: /
  envs:
  - key: NEXT_PUBLIC_API_URL
    value: ${api.PUBLIC_URL}/graphql

databases:
- name: republik-db
  engine: PG
  version: "14"
  size: db-s-2vcpu-4gb
  num_nodes: 1
```

---

## Security Hardening

### 1. Helmet.js (Security Headers)

```typescript
// apps/api/src/middleware/security.ts
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

export const securityMiddleware = [
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }),
  
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP',
  }),
];
```

### 2. Input Validation

```typescript
// apps/api/src/utils/validation.ts
import validator from 'validator';

export const validateEmail = (email: string): boolean => {
  return validator.isEmail(email);
};

export const sanitizeHtml = (html: string): string => {
  // Use DOMPurify or similar
  return sanitize(html, {
    allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'h2', 'h3'],
    allowedAttributes: {
      'a': ['href'],
    },
  });
};
```

### 3. SQL Injection Prevention

```typescript
// Always use parameterized queries
const result = await db.query(
  'SELECT * FROM users WHERE email = $1',
  [email] // Never interpolate user input directly
);

// Never do this:
// const result = await db.query(`SELECT * FROM users WHERE email = '${email}'`);
```

---

## Performance Optimization

### 1. CDN Configuration (CloudFlare)

```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['images.republik.com'],
    loader: 'cloudflare',
    path: 'https://images.republik.com/cdn-cgi/image/',
  },
};
```

### 2. Redis Caching

```typescript
// apps/api/src/cache/articles.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export const cacheArticle = async (slug: string, locale: string, data: any) => {
  const key = `article:${locale}:${slug}`;
  await redis.setex(key, 3600, JSON.stringify(data)); // Cache for 1 hour
};

export const getCachedArticle = async (slug: string, locale: string) => {
  const key = `article:${locale}:${slug}`;
  const cached = await redis.get(key);
  return cached ? JSON.parse(cached) : null;
};
```

### 3. Database Connection Pooling

```typescript
// apps/api/src/db/pool.ts
import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum pool size
  min: 5,  // Minimum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### 4. Image Optimization

```bash
# Install sharp for image processing
yarn add sharp

# Optimize on upload
import sharp from 'sharp';

const optimizeImage = async (buffer: Buffer) => {
  return await sharp(buffer)
    .resize(1200, 630, { fit: 'cover' })
    .webp({ quality: 80 })
    .toBuffer();
};
```

---

## Monitoring & Logging

### 1. Application Performance Monitoring (DataDog)

```typescript
// apps/api/src/monitoring/datadog.ts
import tracer from 'dd-trace';

tracer.init({
  service: 'republik-api',
  env: process.env.NODE_ENV,
  logInjection: true,
});

export default tracer;
```

### 2. Error Tracking (Sentry)

```typescript
// apps/api/src/monitoring/sentry.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});

export const captureError = (error: Error, context?: any) => {
  Sentry.captureException(error, { extra: context });
};
```

### 3. Structured Logging (Winston)

```typescript
// apps/api/src/utils/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}
```

### 4. Health Checks

```typescript
// apps/api/src/routes/health.ts
export const healthCheck = async (req, res) => {
  try {
    // Check database
    await db.query('SELECT 1');
    
    // Check Redis
    await redis.ping();
    
    // Check Elasticsearch
    await elasticsearch.ping();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
    });
  }
};
```

---

## Post-Deployment

### 1. DNS Configuration

```
# A Records
@ IN A your-server-ip
www IN A your-server-ip

# CNAME for API subdomain
api IN CNAME your-api-domain

# MX Records for email
@ IN MX 10 mail.your-domain.com
```

### 2. SSL Certificate (Let's Encrypt)

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d republik.com -d www.republik.com -d api.republik.com

# Auto-renewal
sudo certbot renew --dry-run
```

### 3. Monitoring Dashboard

Set up alerts for:
- High error rates
- Slow response times
- Database connection issues
- High memory usage
- SSL certificate expiration
- Backup failures

---

## Maintenance

### Regular Tasks

**Daily:**
- Monitor error logs
- Check system health
- Review security alerts

**Weekly:**
- Database backups verification
- Performance metrics review
- Security patches update

**Monthly:**
- Dependency updates
- Security audit
- Cost optimization review
- Load testing

---

## Rollback Strategy

```bash
# Keep last 3 versions
# Quick rollback on Heroku
heroku releases:rollback v123

# On AWS ECS
aws ecs update-service \
  --cluster republik-cluster \
  --service api-service \
  --task-definition api-task:123

# Database rollback
psql -U republik_app republik_production < backup_20240129.sql
```

---

## Support & Resources

- Production Checklist: https://nextjs.org/docs/deployment
- Security Best Practices: https://owasp.org/
- PostgreSQL Tuning: https://pgtune.leopard.in.ua/
- GraphQL Best Practices: https://graphql.org/learn/best-practices/

---

**Remember**: Always test deployments in staging environment first!
