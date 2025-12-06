import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import NavbarArabic from '@/components/NavbarArabic';
import Footer from '@/components/Footer';
import ArticleDetailsClient from './ArticleDetailsClient';
import ArticleSchema from '@/components/ArticleSchema';
import BreadcrumbSchema from '@/components/BreadcrumbSchema';
import { generateCanonicalUrl, getAbsoluteUrl } from '@/lib/seo-utils';
import IntlProvider from '@/components/IntlProvider';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

async function getArticle(id: string) {
  try {
    // فك ترميز URL للتعامل مع الأحرف العربية
    const decodedId = decodeURIComponent(id);
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL 
      ? (process.env.NEXT_PUBLIC_BASE_URL.startsWith('http') 
          ? process.env.NEXT_PUBLIC_BASE_URL 
          : `https://${process.env.NEXT_PUBLIC_BASE_URL}`)
      : (process.env.VERCEL_URL 
          ? `https://${process.env.VERCEL_URL}` 
          : 'http://localhost:5000');
    const response = await fetch(`${baseUrl}/api/articles/${encodeURIComponent(decodedId)}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const article = await response.json();
    return article;
  } catch (err) {
    const error = err as { message?: string; status?: number };
    console.error('خطأ في جلب المقالة:', error);

    if (error?.message?.includes('404') || error?.status === 404) {
      notFound();
    }

    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  try {
    const { id } = await params;
    const article = await getArticle(id);

    if (!article) {
      return {
        title: 'المقالة غير موجودة | محترفين الديار العالمية',
        description: 'المقالة المطلوبة غير متوفرة'
      };
    }

    const mainImage = article.mediaItems?.find((item: any) => item.type === 'IMAGE');
    const seoTitle = `${article.title} | محترفين الديار العالمية`;
    const seoDescription = article.excerpt || article.content.substring(0, 160);

    return {
      title: seoTitle,
      description: seoDescription,
      keywords: [
        article.category,
        'محترفين الديار',
        'جدة',
        'السعودية',
        ...(article.tags || []).map((t: any) => t.name)
      ].join(', '),
      openGraph: {
        title: seoTitle,
        description: seoDescription,
        url: generateCanonicalUrl(`/articles/${article.slug || article.id}`),
        siteName: 'محترفين الديار العالمية',
        images: mainImage ? [
          {
            url: getAbsoluteUrl(mainImage.src),
            width: 1200,
            height: 630,
            alt: article.title
          }
        ] : [],
        locale: 'ar_SA',
        type: 'article',
        publishedTime: article.publishedAt,
        authors: [article.author]
      },
      twitter: {
        card: 'summary_large_image',
        title: seoTitle,
        description: seoDescription,
        images: mainImage ? [getAbsoluteUrl(mainImage.src)] : []
      },
      alternates: {
        canonical: generateCanonicalUrl(`/articles/${article.slug || article.id}`)
      }
    };
  } catch (error) {
    console.error('خطأ في generateMetadata:', error);
    return {
      title: 'محترفين الديار العالمية',
      description: 'مقالات متخصصة في المظلات والبرجولات'
    };
  }
}

export default async function ArticlePage({ params }: Props) {
  const { id } = await params;
  const article = await getArticle(id);

  if (!article) {
    notFound();
  }

  const mainImage = article.mediaItems?.find((item: any) => item.type === 'IMAGE');
  const allImages = article.mediaItems
    ?.filter((item: any) => item.type === 'IMAGE')
    .map((item: any) => item.src) || [];
  
  const articleUrl = generateCanonicalUrl(`/articles/${article.slug || article.id}`);
  const articleKeywords = [
    article.category,
    'محترفين الديار',
    'جدة',
    'السعودية',
    ...(article.tags || []).map((t: any) => t.name)
  ];

  const plainTextContent = article.content
    ?.replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim() || '';
  
  const wordCount = plainTextContent.split(/\s+/).length;

  const breadcrumbItems = [
    { label: 'المدونة', href: '/articles' },
    { label: article.category, href: `/articles?category=${encodeURIComponent(article.category)}` },
    { label: article.title, href: `/articles/${article.slug || article.id}` }
  ];

  const validComments = (article.comments || []).filter(
    (c: any) => c.rating && c.rating >= 1 && c.rating <= 5 && c.name && c.message
  );
  
  const averageRating = validComments.length > 0 
    ? Math.round((validComments.reduce((sum: number, c: any) => sum + c.rating, 0) / validComments.length) * 10) / 10
    : 0;

  const reviewsSchema = validComments.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "Article",
    "name": article.title,
    "aggregateRating": averageRating > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": averageRating,
      "reviewCount": validComments.length,
      "bestRating": 5,
      "worstRating": 1
    } : undefined,
    "review": validComments.map((comment: any) => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": comment.name?.trim() || 'قارئ'
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": Math.min(5, Math.max(1, Number(comment.rating))),
        "bestRating": 5,
        "worstRating": 1
      },
      "reviewBody": comment.message?.trim() || '',
      "datePublished": comment.createdAt ? new Date(comment.createdAt).toISOString() : new Date().toISOString()
    })).filter((r: any) => r.reviewBody.length > 0)
  } : null;

  return (
    <IntlProvider>
      <BreadcrumbSchema items={breadcrumbItems} />
      <ArticleSchema
        headline={article.title}
        description={article.excerpt || article.content?.substring(0, 160) || ''}
        author={{
          name: article.author || 'محترفين الديار العالمية',
          url: 'https://www.aldeyarksa.tech'
        }}
        datePublished={article.publishedAt}
        dateModified={article.updatedAt || article.publishedAt}
        image={allImages.length > 0 ? allImages : (mainImage?.src ? [mainImage.src] : undefined)}
        url={articleUrl}
        articleBody={plainTextContent}
        keywords={articleKeywords}
        articleSection={article.category}
        wordCount={wordCount}
      />
      {reviewsSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewsSchema) }}
        />
      )}
      <NavbarArabic />
      <ArticleDetailsClient article={article} />
      <Footer />
    </IntlProvider>
  );
}
