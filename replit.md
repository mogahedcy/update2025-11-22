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
- **Intelligent Competitor Analysis System** (November 2025): Automated competitor analysis at project creation using GROQ AI (Llama 3.3 70B) with complete transparency:
  - **Smart Market Analysis**: Deep analysis based on GROQ AI's knowledge of the Saudi Arabian market and competitors in construction, shade, and landscaping sectors.
  - **Top Competitor Keywords**: Extracts 10-15 most effective keywords used by top-ranking competitors.
  - **Optimized Title Suggestions**: AI-generated titles that mimic successful competitor strategies.
  - **Content Strategy Insights**: Analysis of how competitors present their content (educational, marketing, testimonials, etc.).
  - **Target Audience Analysis**: Identifies the specific audience segments competitors are targeting.
  - **Content Gap Opportunities**: Highlights areas where competitors are weak, providing opportunities to stand out.
  - **Transparency & Clarity Features** (Added November 22, 2025):
    - **Clear UI Badge**: "⚡ تحليل GROQ AI" badge prominently displayed in all AI-generated content sections
    - **Method Transparency**: Added `aiBasedAnalysis` and `analysisMethod` fields to all responses, clearly indicating the analysis uses GROQ AI intelligence (not direct SERP search)
    - **Feature Highlights in UI**: Informative panel showing four key benefits:
      - ⚡ Ultra-fast speed: 10x faster than other models
      - 💰 No additional costs: No external API keys required
      - 🇸🇦 Saudi market specialist: Accurate analysis for construction and shade sectors
      - 🔄 Fully automatic: Works immediately when entering project title
    - **How It Works Section**: Clear explanation that the system uses GROQ AI intelligent analysis based on deep market knowledge, without direct SERP search, for fast, accurate, specialized results
  - **UI Integration**: Results displayed in project creation interface at `/dashboard/projects/add` with comprehensive informational panel and clear methodology explanation
  - **Method**: Uses GROQ AI intelligent analysis (not live SERP search) to avoid additional API costs while providing fast, accurate, market-specific insights
  - **Implementation Files**:
    - `src/lib/competitor-analyzer.ts`: Core analyzer with transparent `aiBasedAnalysis` and `analysisMethod` flags
    - `src/app/api/ai-suggestions/route.ts`: API endpoint that passes through analysis metadata
    - `src/app/dashboard/projects/add/ProjectAddClient.tsx`: Enhanced UI with feature highlights and transparency information

## SEO Optimization for Project Pages (November 27, 2025)
- **Issue**: Project pages had multiple SEO problems:
  1. Canonical URL mismatch (UUID vs Slug URLs)
  2. Title too long (168 characters instead of 50-60)
  3. Description cut off in the middle with "..."
  4. Duplicate images/videos in search indexing (no unique identifiers)
  5. Video thumbnails showing wrong images from project instead of video frame
  6. Review/AggregateRating schema errors in Google Search Console
- **Solution Applied**:
  - Added 301 permanent redirect from UUID URLs to Slug URLs using `permanentRedirect()` in project page
  - Shortened Title to max 55 characters with company branding
  - Fixed Description to be clean and complete (140-160 chars) without mid-sentence cuts
  - Added unique `@id` for each ImageObject, VideoObject, and Review in structured data
  - Implemented Cloudinary video thumbnail generation from actual video frame (so_0 transformation)
  - Fixed AggregateRating to only appear when valid reviews exist (1-5 rating scale)
  - Added `itemReviewed` reference in each Review schema pointing to the CreativeWork
  - Properly fetched `_count` for comments from database
- **Files Modified**:
  - `src/app/portfolio/[id]/page.tsx`: Added UUID-to-Slug redirect, video thumbnail generation, fixed review schema
  - `src/lib/seo-utils.ts`: Added @id for all schema entities, improved validation
- **Result**: 
  - All project pages now have unified canonical URLs (Slug-based)
  - Titles are SEO-optimized and display fully in search results
  - Descriptions are clear and complete
  - Each image/video/review has unique @id preventing duplicate indexing
  - Video thumbnails now show actual video frames
  - Review snippets comply with Google requirements

## Dynamic Routing & Caching Fix (November 22, 2025)
- **Issue**: Newly created projects showed 404 error when accessed immediately after creation
- **Root Cause**: Next.js 15 App Router caching behavior combined with `cache()` wrapper causing stale data
- **Solution Applied**:
  - Removed `cache()` wrapper from `getProject()` function in `/portfolio/[id]/page.tsx`
  - Added `export const revalidate = 0` to completely disable caching for dynamic project pages
  - Added `next: { revalidate: 0 }` to fetch options for fresh data on every request
  - Configured `dynamicParams: true` to allow new dynamic routes without rebuild
  - Added `revalidatePath()` calls in project creation API to clear Next.js cache immediately
  - Enhanced logging to track project fetching for debugging
- **Files Modified**:
  - `src/app/portfolio/[id]/page.tsx`: Dynamic routing configuration and cache removal
  - `src/app/api/projects/create/route.ts`: Added cache revalidation after project creation
- **Result**: Projects are now immediately accessible after creation without 404 errors

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

## Automation System (November 23, 2025)
- **Intelligent Content Automation**: Complete automation system for generating SEO-optimized articles and fixing content automatically using Groq AI.
- **Features**:
  - **Scheduled Article Generation**: Automatic daily/weekly/monthly article generation based on specific niches.
  - **Smart SEO Fixing**: Automated detection and fixing of SEO issues across all content.
  - **Dashboard Control**: Full control panel at `/dashboard/automation` for managing automation schedules.
  - **Comprehensive Logging**: Detailed logs of all automation tasks with success/failure tracking.
  - **Cron Integration**: External cron job support via secure API endpoint (`/api/cron/scheduled-tasks`).
- **Components**:
  - `automation_schedules` table: Stores automation configuration.
  - `automation_logs` table: Tracks execution history.
  - `/api/automation/schedule`: Schedule management API.
  - `/api/automation/logs`: Logs retrieval API.
  - `/api/cron/scheduled-tasks`: Secure cron execution endpoint (requires `CRON_SECRET`).
- **Workflow**:
  1. Admin configures schedule in Dashboard (niche, frequency, count, auto-publish).
  2. External cron job triggers endpoint at scheduled time.
  3. System generates articles using Groq AI with competitor analysis, images from Unsplash, and SEO optimization.
  4. Articles are auto-published (if enabled) and logged.
- **Documentation**:
  - `docs/AUTOMATION-GROQ-GUIDE.md`: Comprehensive technical guide.
  - `docs/AUTOMATION-QUICK-START-AR.md`: Quick start guide in Arabic.
- **Setup Required**:
  - Configure external cron job (cron-job.org or similar) - No authentication required.
  - Activate automation in Dashboard.
  - **Note**: System relies entirely on Groq AI - no additional API keys or secrets needed.