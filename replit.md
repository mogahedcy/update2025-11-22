# Overview

This Next.js web application is for "محترفين الديار العالمية" (Aldeyar Global Professionals), a Saudi Arabian construction company specializing in car shades, fences, royal tents, traditional tents, pergolas, landscaping, hangars, fences, tiles, and sandwich panels. It provides a comprehensive business website with advanced portfolio management, automatic watermarking, AI-powered competitor analysis, and robust content management. The project aims to enhance the company's online presence, streamline content updates, improve SEO, and boost user engagement, positioning it as a leading online platform in the Saudi Arabian construction sector.

# User Preferences

Preferred communication style: Simple, everyday language.
Image storage: Cloudinary preferred over local storage for better performance, automatic optimization, and SEO benefits.

# System Architecture

## Frontend
- **Framework**: Next.js 15.5.0 (App Router, React 18).
- **Styling**: Tailwind CSS, Shadcn/UI, Radix UI, Noto Sans Arabic typography.
- **Animations**: Framer Motion.
- **Image Optimization**: Next.js Image component (WebP/AVIF).
- **UI/UX**: Responsive, mobile-first, WCAG 2.1 AA accessibility compliant design.

## Backend
- **API Routes**: Next.js App Router API routes.
- **Authentication**: JWT-based admin authentication.
- **File Upload**: Multi-format uploads with Cloudinary integration for images (up to 100MB) and videos (up to 200MB).
- **Content Management**: RESTful API for project and content CRUD operations.

## Database
- **ORM**: Prisma ORM.
- **Schema**: Models for Projects, Articles, Admin Users, and analytics.

## Content Management System (CMS)
- **Features**: Advanced project showcase, blog/articles, dynamic sitemap, media management, admin dashboard.
- **Advanced Portfolio Exhibition System**: Supports 10 unified categories with automatic watermarking (+966553719009) via Cloudinary, and media optimization (image compression to 1920px/85 quality, video to 1280px/2000k bitrate).
- **FAQ Management System**: Admin CRUD interface with SEO fields, AI duplicate detection, analytics, dynamic sitemap, rich FAQ schema, and categorization.
- **Category Unification System**: Standardized 10 main categories across all content types with automatic normalization.

## SEO & Performance
- **SEO**: Automated sitemap/robots.txt, structured data, canonical URLs, hreflang, Google Business Profile integration, IndexNow API.
- **AI-Powered SEO Agent**: Utilizes Groq AI (Llama 3.3 70B) for ultra-fast content analysis, keyword intelligence, article writing, project descriptions, meta tag generation, and competitor analysis within the admin dashboard, including SEO diagnostics and auto-fix capabilities.
- **AI Article Agent**: Generates SEO-optimized articles with automated image selection (Google Custom Search API) and AI-generated alt text.
- **Automated Indexing System**: Notifies search engines (IndexNow, Bing Webmaster API) about content changes.
- **Enhanced Portfolio Rich Media SEO**: Implements multi-image OpenGraph, advanced VideoObject schema, rich ImageObject schema with license/copyright, and Review schema integration with AggregateRating for improved social sharing and search indexing. Includes centralized SEO utilities for consistent absolute URLs and MIME types.
- **Performance Optimizations**: CSS (cssnano, critical CSS), JavaScript (ES2022), build (SWC minification), image (responsive, lazy loading, AVIF/WebP), Core Web Vitals, PWA capabilities, resource hints.
- **AI-Assisted Content Creation**: Real-time AI suggestions during project submission using Groq AI for keywords, titles, descriptions, and meta tags.
- **Intelligent Competitor Analysis System**: Automated competitor analysis at project creation using GROQ AI (Llama 3.3 70B) provides market analysis, top competitor keywords, optimized title suggestions, content strategy insights, target audience analysis, and content gap opportunities. Displays results with transparency features in the project creation interface.
- **Dynamic Routing & Caching**: Configured for immediate accessibility of newly created projects by disabling caching for dynamic pages and implementing cache revalidation upon project creation.
- **Security**: Secure admin login, Zod schemas for input validation, rate limiting, and DOMPurify for HTML rendering.

# External Dependencies

## Core Technologies
- **Next.js**: Full-stack React framework.
- **Prisma**: Database ORM.
- **Tailwind CSS**: Utility-first CSS framework.
- **TypeScript**: For type safety.

## UI/UX Libraries
- **Radix UI**: Headless UI components.
- **Framer Motion**: Animation library.
- **Lucide React**: Icon set.
- **Swiper**: Touch-enabled carousel.

## Database & Storage
- **PostgreSQL**: Primary database (Neon-backed).
- **Cloudinary**: Unified cloud storage for all images and videos, providing automatic optimization, CDN delivery, and automatic watermarking.

## Authentication & Security
- **bcryptjs**: Password hashing.
- **jsonwebtoken**: JWT token management.
- **DOMPurify**: HTML sanitization.
- **Zod**: Runtime type validation.

## Analytics & AI
- **Google Analytics 4**: Site analytics and Web Vitals tracking.
- **Groq AI**: Llama 3.3 70B versatile model for ultra-fast SEO analysis, content generation, AI competitor analysis, project descriptions, and meta tag generation.
- **Google Custom Search API**: Image search for automated article image selection.

## Automation System
- **Intelligent Content Automation**: Complete automation system for generating SEO-optimized articles AND FAQs using Groq AI. Includes scheduled generation with configurable frequency (daily/weekly/monthly), smart SEO fixing, dashboard control panel, comprehensive logging, and external cron job support via `/api/cron/scheduled-tasks`.
- **Article Generation**: Manual (`/dashboard/ai-agent`) and automated scheduling with batch generation, auto-publish, and competitor analysis.
- **FAQ Generation**: Manual (`/dashboard/ai-faq`) and automated scheduling with topic-based generation, batch processing, and auto-publish options.

# Deployment Configuration

## Production Database
- **Host**: Neon PostgreSQL (ep-withered-bread-a48nkvax-pooler.us-east-1.aws.neon.tech)
- **Database**: neondb
- **Environment Variables**: Configured in production environment (DATABASE_URL, POSTGRES_URL, and related connection strings).
- **Ready for**: Replit publishing/deployment with automatic database connection.

# Recent Changes

## AI FAQ Automation & Production Setup (November 28, 2025)
- **FAQ Scheduling Integration**: Added FAQ scheduling to automation dashboard with topic/niche configuration, frequency selection (daily/weekly/monthly), and batch count control.
- **Automated FAQ Generation**: Integrated FAQ generation into cron scheduled tasks (`/api/cron/scheduled-tasks`) for automated FAQ creation alongside articles.
- **Production Database**: Set up Neon PostgreSQL production database with all connection credentials in production environment.

## SEO Site-Wide Audit & Fixes (November 28, 2025)
- **Issues Found & Fixed**:
  1. **Duplicate robots.txt conflict**: Removed `public/robots.txt` static file that conflicted with dynamic `src/app/robots.txt/route.ts`. Now using only the dynamic route which provides advanced bot-specific rules.
  2. **OG/Twitter Image Issues**: All pages were using `favicon.svg` as OpenGraph and Twitter images - SVG is not supported by social media platforms. Fixed by replacing with `logo.png` across 10+ pages.
  3. **Canonical URL Consistency**: Updated all pages to use `generateCanonicalUrl()` helper from `seo-utils.ts` for consistent URL generation.
  4. **SEO Utils Improvements**: Updated `getAbsoluteUrl()` fallback from favicon.svg to logo.png.
  5. **Schema.org Logo Fix**: Updated publisher logo in structured data from favicon.svg to logo.png.
- **Files Modified**:
  - `public/robots.txt`: Deleted (using dynamic route instead)
  - `src/app/faq/page.tsx`, `src/app/faq/[slug]/page.tsx`: OG image → logo.png + canonical URL fix
  - `src/app/contact/page.tsx`, `src/app/about/page.tsx`, `src/app/terms/page.tsx`, `src/app/privacy/page.tsx`, `src/app/quote/page.tsx`: OG image → logo.png
  - `src/app/portfolio/[id]/page.tsx`: Fallback image → logo.png
  - `src/app/articles/[id]/page.tsx`: Added canonical URL using `generateCanonicalUrl()`, OG/Twitter URLs using `getAbsoluteUrl()`
  - `src/app/services/mazallat/page.tsx`: Schema logo → logo.png
  - `src/lib/seo-utils.ts`: Updated fallbacks from favicon.svg to logo.png
- **Result**: All pages now have proper OpenGraph images for social media sharing and correct canonical URLs for search engines.