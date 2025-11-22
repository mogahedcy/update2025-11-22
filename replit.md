# Overview

This Next.js web application is for "محترفين الديار العالمية" (Aldeyar Global Professionals), a Saudi Arabian construction company specializing in 10 main categories: car shades, fences, royal tents, traditional tents, pergolas, landscaping, hangars, fences, tiles, and sandwich panels. It functions as a comprehensive business website with advanced portfolio management, automatic watermarking, AI-powered competitor analysis, and robust content management. The primary goals are to enhance the company's online presence, streamline content updates, improve search engine visibility, and boost user engagement, aiming to be a leading online platform in the Saudi Arabian construction sector.

# User Preferences

Preferred communication style: Simple, everyday language.
Image storage: Cloudinary preferred over local storage for better performance, automatic optimization, and SEO benefits.

# System Architecture

## Frontend
- **Framework**: Next.js 15.5.0 (App Router, React 18).
- **Styling**: Tailwind CSS, Shadcn/UI, Radix UI.
- **Typography**: Noto Sans Arabic with fluid typography.
- **Animations**: Framer Motion.
- **Image Management**: Next.js Image optimization (WebP/AVIF).
- **UI/UX**: Responsive, mobile-first design, WCAG 2.1 AA accessibility compliant.

## Backend
- **API Routes**: Next.js App Router API routes.
- **Authentication**: JWT-based admin authentication.
- **File Upload**: Multi-format file upload with Cloudinary integration for images (up to 100MB) and videos (up to 200MB).
- **Content Management**: RESTful API for project and content CRUD operations.

## Database
- **ORM**: Prisma ORM.
- **Schema**: Models for Projects, Articles, Admin Users, and analytics.

## Content Management System (CMS)
- **Features**: Advanced project showcase, blog/articles, dynamic sitemap, media management, admin dashboard.
- **Advanced Portfolio Exhibition System**: Supports 10 unified categories with automatic watermarking (+966553719009) on all media via Cloudinary transformations, automatic media optimization (image compression to 1920px/85 quality, video to 1280px/2000k bitrate), and AI-powered competitor analysis at `/dashboard/projects/analyze` using Groq AI (Llama 3.3 70B). Tracks media processing metrics.
- **FAQ Management System**: Admin CRUD interface at `/dashboard/faqs` with enhanced SEO fields, AI-powered duplicate detection, analytics, dynamic sitemap (`/sitemap-faqs.xml`), rich FAQ schema, and categorization by service.
- **Category Unification System**: Standardized 10 main categories across all content types with automatic normalization of legacy category names via `src/lib/categoryNormalizer.ts` and a database migration script.

## SEO & Performance
- **SEO**: Automated sitemap/robots.txt, structured data, canonical URLs, hreflang, Google Business Profile integration, IndexNow API.
- **AI-Powered SEO Agent**: Groq AI (Llama 3.3 70B) for ultra-fast content analysis, keyword intelligence, article writing, project descriptions, meta tag generation, and competitor analysis within the admin dashboard. Includes SEO diagnostics and auto-fix capabilities.
- **AI Article Agent**: Generates SEO-optimized articles with automated image selection (Google Custom Search API) and AI-generated alt text.
- **Smart Content Generation System**: Infrastructure for web search-based competitor analysis to generate intelligent content.
- **Automated Indexing System**: Notifies search engines (IndexNow, Bing Webmaster API) about content changes.
- **Enhanced Portfolio Rich Media SEO** (November 2025):
  - **Multi-Image OpenGraph**: All project images included in OpenGraph/Twitter metadata (not just first image) with absolute URLs and proper MIME types for better social sharing and indexing.
  - **Advanced VideoObject Schema**: Complete video structured data with `embedUrl` (page URL), `contentUrl` (direct video file), `thumbnailUrl`, `publisher`, `inLanguage`, and `regionsAllowed` for Google/Bing video indexing.
  - **Rich ImageObject Schema**: Enhanced with `license`, `copyright`, `creator`, `creditText` fields for better image attribution and copyright protection.
  - **Review Schema Integration**: Individual review schemas extracted from project comments with `author`, `rating`, `reviewBody`, `datePublished`, plus `AggregateRating` for rich snippet eligibility.
  - **Centralized SEO Utilities**: `getAbsoluteUrl()` and `getMediaType()` helpers in `seo-utils.ts` ensure consistent absolute URLs and MIME types across all metadata and structured data.
- **Performance Optimizations**: CSS (cssnano, critical CSS inlining), JavaScript (modern-only browserslist, ES2022), build (SWC minification), image (responsive `sizes`, lazy loading, AVIF/WebP), Core Web Vitals (LCP, FID, CLS), mobile responsiveness fixes, PWA capabilities, and resource hints.
- **AI-Assisted Content Creation**: Real-time AI suggestions during project submission using Groq AI (Llama 3.3 70B) for keywords, titles, descriptions, and meta tags with ultra-low latency.
- **Intelligent Competitor Analysis System** (November 2025): Automated competitor analysis at project creation using GROQ AI (Llama 3.3 70B) that provides:
  - **Smart Market Analysis**: Deep analysis based on GROQ AI's knowledge of the Saudi Arabian market and competitors in construction, shade, and landscaping sectors.
  - **Top Competitor Keywords**: Extracts 10-15 most effective keywords used by top-ranking competitors.
  - **Optimized Title Suggestions**: AI-generated titles that mimic successful competitor strategies.
  - **Content Strategy Insights**: Analysis of how competitors present their content (educational, marketing, testimonials, etc.).
  - **Target Audience Analysis**: Identifies the specific audience segments competitors are targeting.
  - **Content Gap Opportunities**: Highlights areas where competitors are weak, providing opportunities to stand out.
  - **UI Integration**: Results displayed in project creation interface with clear "⚡ GROQ AI Analysis" badge.
  - **Method**: Uses GROQ AI intelligent analysis (not live SERP search) to avoid additional API costs while providing fast, accurate, market-specific insights.
  - **Implementation**: `src/lib/competitor-analyzer.ts` with transparent `aiBasedAnalysis` and `analysisMethod` flags in responses.

## Security
- **Authentication**: Secure admin login.
- **Input Validation**: Zod schemas.
- **Rate Limiting**: Express rate limiting.
- **Content Security**: DOMPurify for HTML rendering.

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
- **PostgreSQL**: Primary database (Neon-backed, external production database) with new fields for AI analysis and media processing info.
- **Cloudinary**: Unified cloud storage for all images and videos, providing automatic optimization, CDN delivery, and automatic watermarking (integrated with +966553719009).

## Authentication & Security
- **bcryptjs**: Password hashing.
- **jsonwebtoken**: JWT token management.
- **DOMPurify**: HTML sanitization.
- **Zod**: Runtime type validation.

## Analytics & AI
- **Google Analytics 4**: Site analytics and Web Vitals tracking.
- **Groq AI**: Llama 3.3 70B Versatile model for ultra-fast SEO analysis, content generation, AI competitor analysis, project descriptions, and meta tag generation. Provides 10x faster response times compared to previous AI models.
- **Google Custom Search API**: Image search for automated article image selection.