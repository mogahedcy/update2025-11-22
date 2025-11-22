import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BreadcrumbSchema from '@/components/BreadcrumbSchema';
import { prisma } from '@/lib/prisma';
import { 
  generateCreativeWorkSchema,
  generateOpenGraphMetadata,
  generateTwitterMetadata,
  generateRobotsMetadata,
  getAbsoluteUrl,
  getMediaType
} from '@/lib/seo-utils';
import ProjectDetailsClient from './ProjectDetailsClient';

export const dynamicParams = true;
export const revalidate = 3600; // Revalidate every hour

interface Props {
  params: Promise<{ id: string }>;
}

// دالة جلب المشروع مباشرة من قاعدة البيانات
async function getProject(id: string) {
  try {
    // البحث باستخدام المعرف أو الـ slug
    const project = await prisma.projects.findFirst({
      where: {
        OR: [
          { id: id },
          { slug: id }
        ]
      },
      include: {
        media_items: { orderBy: { order: 'asc' } },
        project_tags: true,
        project_materials: true,
        _count: { select: { comments: true, project_likes: true } }
      }
    });

    if (!project) {
      return null;
    }

    // تنسيق البيانات بنفس طريقة API
    return {
      ...project,
      mediaItems: project.media_items,
      tags: project.project_tags || [],
      materials: project.project_materials || [],
      views: project.views || 0,
      likes: project._count?.project_likes || 0,
      rating: project.rating || 0
    };
  } catch (err) {
    console.error('❌ خطأ في جلب المشروع:', err);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  
  const project = await getProject(id);

  if (!project) {
    return {
      title: 'المشروع غير موجود | محترفين الديار العالمية',
      description: 'المشروع المطلوب غير متوفر',
      robots: 'noindex, nofollow'
    };
  }

  // استخراج جميع الصور والفيديوهات للمشروع
  const allImages = project.mediaItems?.filter((item: any) => item.type === 'IMAGE') || [];
  const allVideos = project.mediaItems?.filter((item: any) => item.type === 'VIDEO') || [];
  const mainImage = allImages[0]?.src || 'https://www.aldeyarksa.tech/favicon.svg';
  
  const seoTitle = `${project.title} في ${project.location} | محترفين الديار العالمية جدة`;
  const seoDescription = `${project.description.substring(0, 150)}... مشروع ${project.category} في ${project.location} من محترفين الديار العالمية - أفضل شركة مظلات وسواتر في جدة`;
  const pageUrl = `/portfolio/${project.slug || id}`;
  const fullUrl = `https://www.aldeyarksa.tech${pageUrl}`;

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: [
      project.category,
      'جدة',
      'السعودية',
      'مظلات',
      'سواتر',
      'برجولات',
      'تنسيق حدائق',
      'محترفين الديار',
      project.location,
      project.title
    ].join(', '),
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: fullUrl,
      siteName: 'محترفين الديار العالمية',
      locale: 'ar_SA',
      type: 'article',
      publishedTime: project.createdAt,
      modifiedTime: project.updatedAt || project.createdAt,
      authors: ['محترفين الديار العالمية'],
      images: allImages.length > 0 
        ? allImages.map((img: any, index: number) => ({
            url: getAbsoluteUrl(img.src),
            width: 1200,
            height: 630,
            alt: img.alt || img.title || `${project.title} - صورة ${index + 1}`,
            type: getMediaType(img.src),
          }))
        : [{
            url: getAbsoluteUrl(mainImage),
            width: 1200,
            height: 630,
            alt: `${project.title} - محترفين الديار العالمية جدة`,
            type: 'image/jpeg',
          }],
      videos: allVideos.length > 0
        ? allVideos.map((video: any) => ({
            url: getAbsoluteUrl(video.src),
            width: 1280,
            height: 720,
            type: getMediaType(video.src),
          }))
        : undefined,
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: seoTitle,
      description: seoDescription.substring(0, 200),
      images: allImages.length > 0 
        ? allImages.slice(0, 4).map((img: any) => getAbsoluteUrl(img.src))
        : [getAbsoluteUrl(mainImage)],
    },
    alternates: {
      canonical: fullUrl,
      languages: {
        'ar-SA': fullUrl,
        'x-default': fullUrl
      }
    },
    robots: generateRobotsMetadata()
  };
}

export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
  };
}

export default async function ProjectDetailsPage({ params }: Props) {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) {
    notFound();
  }

  // إعداد structured data
  const images = project.mediaItems?.filter((item: any) => item.type === 'IMAGE') || [];
  const videos = project.mediaItems?.filter((item: any) => item.type === 'VIDEO') || [];
  const fullUrl = getAbsoluteUrl(`/portfolio/${project.slug || id}`);

  const breadcrumbItems = [
    { label: 'المشاريع', href: '/portfolio' },
    { label: project.title, href: `/portfolio/${project.slug || id}`, current: true }
  ];

  // جلب التعليقات للمشروع لإضافتها كـ Reviews في الـ schema
  // استخدام الخصائص الصحيحة: name, rating, message, createdAt
  const projectReviews = project.comments?.filter((comment: any) => 
    comment.rating && comment.rating > 0 && comment.name && comment.message
  ) || [];
  
  const structuredData = generateCreativeWorkSchema({
    name: project.title,
    description: project.description,
    url: `/portfolio/${project.slug || id}`,
    category: project.category,
    location: project.location,
    dateCreated: project.createdAt,
    dateModified: project.updatedAt,
    images: images.map((item: any, index: number) => ({
      url: getAbsoluteUrl(item.src),
      caption: item.title || item.description || `${project.title} - صورة ${index + 1}`,
      alt: item.alt || item.title || `${project.category} في ${project.location} - صورة ${index + 1}`
    })),
    videos: videos.map((item: any) => ({
      name: item.title || `${project.title} - فيديو`,
      description: item.description || `فيديو يوضح تفاصيل مشروع ${project.title} في ${project.location}`,
      contentUrl: getAbsoluteUrl(item.src),
      embedUrl: fullUrl,
      thumbnailUrl: item.thumbnail ? getAbsoluteUrl(item.thumbnail) : (images[0]?.src ? getAbsoluteUrl(images[0].src) : undefined),
      uploadDate: project.createdAt,
      duration: item.duration
    })),
    aggregateRating: project._count?.comments > 0 && project.rating > 0 ? {
      ratingValue: project.rating,
      reviewCount: project._count.comments
    } : undefined,
    reviews: projectReviews.length > 0 ? projectReviews.map((comment: any) => ({
      author: comment.name || 'عميل محترفين الديار',
      rating: comment.rating,
      reviewBody: comment.message,
      datePublished: comment.createdAt || new Date().toISOString()
    })) : undefined
  });

  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <Navbar />
      <ProjectDetailsClient project={project} projectId={id} />
      <Footer />
    </>
  );
}
