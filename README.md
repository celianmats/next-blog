# Republik Multi-Language Platform - Quick Start

🚀 **Build a news platform like Republik.ch with full RTL support for English, French, and Arabic**

## What You've Got

This starter kit includes everything you need to build a professional multi-language news platform:

### 📦 Files Included

1. **SETUP_GUIDE.md** - Complete step-by-step setup instructions
2. **HomePage.tsx** - Ready-to-use React component with RTL support
3. **docker-compose.yml** - Database and services configuration
4. **rtl-utils.ts** - Comprehensive RTL utility functions
5. **package.json** - Project dependencies and scripts
6. **turbo.json** - Monorepo configuration
7. **001_initial_schema.sql** - Database schema with multi-language support

## 🎯 Quick Start (5 Minutes)

### Prerequisites
```bash
node --version  # v20+
yarn --version  # v1.22+
docker --version
```

### 1. Create Project Structure
```bash
mkdir republik-multisite && cd republik-multisite

# Create directory structure
mkdir -p apps/{web,api,admin} packages/{ui,i18n,rtl,config}

# Copy the files you downloaded to appropriate locations:
# - docker-compose.yml → root directory
# - package.json → root directory
# - turbo.json → root directory
# - HomePage.tsx → apps/web/app/[locale]/page.tsx
# - rtl-utils.ts → packages/rtl/index.ts
# - 001_initial_schema.sql → apps/api/migrations/
```

### 2. Start Infrastructure
```bash
# Start PostgreSQL, Redis, Elasticsearch
docker-compose up -d

# Wait for services to be healthy (check with)
docker-compose ps
```

### 3. Initialize Database
```bash
# Connect to PostgreSQL
docker exec -it republik-postgres psql -U postgres -d republik

# Run the migration
\i /docker-entrypoint-initdb.d/001_initial_schema.sql
```

### 4. Setup Next.js Frontend
```bash
cd apps/web
npx create-next-app@latest . --typescript --tailwind --app

# Install additional dependencies
yarn add next-intl styled-components
yarn add -D @types/styled-components

# Copy HomePage.tsx to app/[locale]/page.tsx
```

### 5. Configure Environment
```bash
# Create .env.local in apps/web
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:5010/graphql
NEXT_PUBLIC_DEFAULT_LOCALE=en
NEXT_PUBLIC_LOCALES=en,fr,ar
EOF
```

### 6. Run Development Server
```bash
yarn dev
```

Visit:
- **English**: http://localhost:3000/en
- **French**: http://localhost:3000/fr  
- **Arabic**: http://localhost:3000/ar (RTL layout!)

## 🎨 Key Features

### ✅ What's Already Built

- **Multi-language routing** (English, French, Arabic)
- **RTL/LTR automatic detection and layout switching**
- **Responsive design with modern styling**
- **Database schema for articles, users, categories, tags**
- **Full-text search support**
- **Docker environment with PostgreSQL, Redis, Elasticsearch**
- **Monorepo setup with Turborepo**

### 🔧 RTL Utilities

The `rtl-utils.ts` package provides:

```typescript
import { isRTL, getDirection, getFontFamily, useRTL } from '@/packages/rtl';

// Check if locale is RTL
isRTL('ar') // true

// Get text direction
getDirection('ar') // 'rtl'

// Get appropriate font
getFontFamily('ar') // 'Cairo, sans-serif'

// React hook for RTL utilities
const rtl = useRTL(locale);
```

### 📝 Component Example

```tsx
import styled from 'styled-components';

const Container = styled.div`
  direction: ${props => props.theme.direction};
  text-align: ${props => props.theme.direction === 'rtl' ? 'right' : 'left'};
  font-family: ${props => props.theme.fonts.body};
`;
```

## 🗄️ Database Structure

The schema includes:

- **Multi-language tables**: Articles, categories, tags with translations
- **User management**: Authentication, roles, profiles
- **Content management**: Rich content, metadata, SEO
- **Media library**: Image uploads and management
- **Comments system**: Threaded comments
- **Newsletter**: Subscription management
- **Audit logging**: Track all changes

## 🌐 Supported Languages

| Language | Code | Direction | Font          |
|----------|------|-----------|---------------|
| English  | en   | LTR       | GT America    |
| French   | fr   | LTR       | GT America    |
| Arabic   | ar   | RTL       | Cairo         |

Easy to add more! Just update:
1. `locale_code` enum in database
2. Translation files
3. `RTL_LOCALES` constant if RTL

## 📚 Next Steps

### Immediate Tasks (Day 1-2)
1. ✅ Set up the basic structure (you're here!)
2. 🔲 Create GraphQL API endpoints
3. 🔲 Build admin dashboard for content management
4. 🔲 Add user authentication (NextAuth.js or Passport)

### Short Term (Week 1-2)
5. 🔲 Implement article editor (Tiptap or Slate)
6. 🔲 Add image upload to S3/Cloudinary
7. 🔲 Create search functionality with Elasticsearch
8. 🔲 Build newsletter system

### Medium Term (Month 1-2)
9. 🔲 Add payment system for subscriptions (Stripe)
10. 🔲 Implement comment moderation
11. 🔲 Create analytics dashboard
12. 🔲 Add email notifications

## 🛠️ Development Commands

```bash
# Start all services
yarn dev

# Start specific service
yarn dev:web    # Frontend
yarn dev:api    # API server

# Database
yarn docker:up      # Start containers
yarn docker:down    # Stop containers
yarn docker:logs    # View logs
yarn db:migrate     # Run migrations
yarn db:seed        # Seed test data

# Build for production
yarn build
```

## 📖 Documentation References

- **Republik GitHub**: https://github.com/republik/plattform
- **Next.js i18n**: https://nextjs.org/docs/app/building-your-application/routing/internationalization
- **Styled Components**: https://styled-components.com/
- **PostgreSQL**: https://www.postgresql.org/docs/

## 🎯 Architecture Overview

```
┌─────────────────┐
│   Next.js App   │ (Port 3000)
│   Multi-locale  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  GraphQL API    │ (Port 5010)
│   Apollo Server │
└────────┬────────┘
         │
    ┌────┴────┬──────────┬───────────┐
    ↓         ↓          ↓           ↓
┌────────┐ ┌──────┐ ┌──────────┐ ┌──────┐
│Postgres│ │Redis │ │Elastic-  │ │Assets│
│  :5432 │ │:6379 │ │search    │ │Server│
└────────┘ └──────┘ │:9200     │ └──────┘
                    └──────────┘
```

## 🔒 Security Checklist

Before going to production:

- [ ] Change default database passwords
- [ ] Set up proper environment variables
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable security headers
- [ ] Add input validation
- [ ] Implement CSRF protection
- [ ] Set up monitoring and logging

## 💡 Tips for Success

1. **Start Small**: Get one language working perfectly before adding more
2. **Test RTL Early**: Arabic layout issues are easier to fix early
3. **Use Logical Properties**: Prefer `margin-inline-start` over `margin-left`
4. **Font Loading**: Use proper Arabic fonts (Cairo, Tajawal, IBM Plex Arabic)
5. **Content Strategy**: Plan your translation workflow early
6. **Performance**: Lazy load translations, use proper caching

## 🐛 Troubleshooting

### Docker Issues
```bash
# Clean everything and restart
docker-compose down -v
rm -rf docker-data
docker-compose up -d
```

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# View logs
docker-compose logs postgres
```

### RTL Not Working
- Check `dir="rtl"` in HTML element
- Verify theme direction is set correctly
- Use browser DevTools to inspect computed styles

## 📞 Need Help?

- Check SETUP_GUIDE.md for detailed instructions
- Review the Republik GitHub repo: https://github.com/republik/plattform
- Refer to rtl-utils.ts for RTL helper functions

## 🚀 Ready to Build!

You now have a solid foundation for a professional multi-language news platform. The infrastructure is set up, the utilities are ready, and you have working examples.

**Start coding and build something amazing! 🎉**

---

Built with inspiration from Republik.ch | Multi-language | RTL Support | Open Source
