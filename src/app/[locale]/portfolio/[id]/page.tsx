import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import NavbarArabic from '@/components/NavbarArabic';
import Footer from '@/components/Footer';
import BreadcrumbSchema from '@/components/BreadcrumbSchema';
import { prisma } from '@/lib/prisma';
import { 
  generateCreativeWorkSchema,
  generateImageGallerySchema,
  generateProjectSchema,
  generateOpenGraphMetadata,
  generateTwitterMetadata,
  generateRobotsMetadata,
  getAbsoluteUrl,
  getMediaType,
  generateCollectionPageSchema,
  generateIndividualImageSchemas
} from '@/lib/seo-utils';
import ProjectDetailsClient from './ProjectDetailsClient';
import IntlProvider from '@/components/IntlProvider';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ✅ ISR - تحديث الصفحة تلقائياً كل ساعة مع دعم صفحات جديدة
export const dynamicParams = true;
export const revalidate = 3600; // إعادة بناء كل ساعة

interface Props {
  params: Promise<{ id: string; locale: string }>;
}

// دالة لإنشاء thumbnail من فيديو Cloudinary
function generateVideoThumbnail(videoUrl: string): string | null {
  if (!videoUrl || !videoUrl.includes('cloudinary.com')) return null;
  
  // تحويل رابط الفيديو إلى رابط صورة مصغرة
  // مثال: video/upload/v123/folder/video.mp4 → image/upload/so_0,w_1280,h_720,c_fill/v123/folder/video.jpg
  try {
    const urlParts = videoUrl.split('/upload/');
    if (urlParts.length !== 2) return null;
    
    const baseUrl = urlParts[0].replace('/video/', '/image/');
    const resourcePath = urlParts[1].replace(/\.[^.]+$/, '.jpg');
    
    // إضافة تحويلات للحصول على إطار من بداية الفيديو بجودة عالية
    return `${baseUrl}/upload/so_0,w_1280,h_720,c_fill,q_auto,f_jpg/${resourcePath}`;
  } catch {
    return null;
  }
}

// دالة جلب المشروع مباشرة من قاعدة البيانات - بدون تزامن مع API
async function getProject(id: string) {
  try {
    // فك ترميز URL للتعامل مع الأحرف العربية
    const decodedId = decodeURIComponent(id);
    
    // البحث باستخدام المعرف أو الـ slug مع جلب البيانات الأساسية بسرعة
    const project = await prisma.projects.findFirst({
      where: {
        OR: [
          { id: decodedId },
          { slug: decodedId }
        ]
      },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        location: true,
        completionDate: true,
        client: true,
        featured: true,
        projectDuration: true,
        projectCost: true,
        views: true,
        likes: true,
        rating: true,
        status: true,
        slug: true,
        metaTitle: true,
        metaDescription: true,
        keywords: true,
        createdAt: true,
        updatedAt: true,
        media_items: {
          select: {
            id: true,
            type: true,
            src: true,
            thumbnail: true,
            title: true,
            description: true,
            duration: true,
            order: true,
            alt: true
          },
          orderBy: { order: 'asc' }
        },
        project_tags: {
          select: { id: true, name: true }
        },
        project_materials: {
          select: { id: true, name: true }
        },
        _count: {
          select: { comments: true }
        }
      }
    });
    
    // جلب التعليقات بشكل منفصل (lazy loading) لتحسين الأداء
    let comments: any[] = [];
    if (project) {
      comments = await prisma.comments.findMany({
        where: { 
          projectId: project.id,
          rating: { gt: 0 }
        },
        select: { 
          id: true, 
          name: true, 
          message: true, 
          rating: true, 
          createdAt: true 
        },
        take: 10
      });
    }

    if (!project) {
      return null;
    }

    // تنسيق البيانات بنفس طريقة API
    return {
      ...project,
      mediaItems: project.media_items || [],
      tags: project.project_tags || [],
      materials: project.project_materials || [],
      comments: comments || [],
      views: project.views || 0,
      rating: project.rating || 0,
      _count: project._count
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
      title: 'المشروع غير موجود | ديار جدة العالمية',
      description: 'المشروع المطلوب غير متوفر',
      robots: 'noindex, nofollow'
    };
  }

  // استخراج جميع الصور والفيديوهات للمشروع
  const allImages = project.mediaItems?.filter((item: any) => item.type === 'IMAGE') || [];
  const allVideos = project.mediaItems?.filter((item: any) => item.type === 'VIDEO') || [];
  
  // تحسين اختيار الصورة الرئيسية للمشاركة
  // نفضل صورة حقيقية من المشروع على اللوغو، وإذا وجد فيديو نستخدم الصورة المصغرة له
  let shareImage = 'https://www.aldeyarksa.tech/logo.png';
  if (allImages.length > 0) {
    shareImage = getAbsoluteUrl(allImages[0].src);
  } else if (allVideos.length > 0) {
    const thumb = generateVideoThumbnail(allVideos[0].src);
    if (thumb) shareImage = thumb;
  }
  
  // تحسين العنوان ليكون أقل من 60 حرف وبصيغة جذابة لمحركات البحث
  const shortTitle = project.title.length > 45 
    ? project.title.substring(0, 42) + '...' 
    : project.title;
  const seoTitle = `${shortTitle} | ${project.category} في ${project.location}`;
  
  // تحسين الوصف ليكون واضح ومباشر (150-160 حرف) مع كلمات دلالية قوية
  const cleanDescription = project.description.replace(/\s+/g, ' ').trim();
  const seoDescription = cleanDescription.length > 145 
    ? cleanDescription.substring(0, 142).trim() + '...'
    : `${cleanDescription} - تنفيذ ديار جدة العالمية في ${project.location} بأعلى معايير الجودة والضمان 10 سنوات.`;
  
  const pageUrl = `/portfolio/${project.slug || id}`;
  const fullUrl = `https://www.aldeyarksa.tech${pageUrl}`;

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: [
      project.category,
      project.title,
      'مظلات وسواتر جدة',
      'برجولات حدائق مودرن',
      'تركيب سواتر قماش',
      'أفضل شركة مظلات في جدة',
      'ديار جدة العالمية',
      project.location,
      'تصميم مظلات سيارات',
    ].join(', '),
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: fullUrl,
      siteName: 'ديار جدة العالمية',
      locale: 'ar_SA',
      type: 'article',
      publishedTime: project.createdAt,
      modifiedTime: project.updatedAt || project.createdAt,
      authors: ['ديار جدة العالمية'],
      section: project.category,
      tags: project.tags?.map((t: any) => t.name) || [],
      images: allImages.length > 0 
        ? allImages.map((img: any) => ({
            url: getAbsoluteUrl(img.src),
            width: 1200,
            height: 630,
            alt: img.alt || img.title || `${project.title} - ${project.category} في ${project.location}`,
          }))
        : [{
            url: shareImage,
            width: 1200,
            height: 630,
            alt: `${project.title} - ${project.category}`,
          }],
      videos: allVideos.length > 0
        ? allVideos.map((video: any) => ({
            url: getAbsoluteUrl(video.src),
            width: 1280,
            height: 720,
            type: 'video/mp4',
          }))
        : undefined,
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: seoTitle,
      description: seoDescription.substring(0, 200),
      creator: '@deyarjeddah',
      site: '@deyarjeddah',
      // ✅ جميع الصور (Twitter يدعم حتى 4 صور)
      images: allImages.length > 0 
        ? allImages.slice(0, 4).map((img: any, index: number) => ({
            url: getAbsoluteUrl(img.src),
            alt: img.alt || img.title || `${project.title} - صورة ${index + 1}`,
          }))
        : [getAbsoluteUrl(mainImage)],
    },
    alternates: {
      canonical: `https://www.aldeyarksa.tech/portfolio/${project.slug || id}`,
      languages: {
        'ar-SA': fullUrl,
        'en-US': `https://www.aldeyarksa.tech/en/portfolio/${project.slug || id}`,
        'x-default': `https://www.aldeyarksa.tech/portfolio/${project.slug || id}`
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
  const { id, locale } = await params;
  const decodedId = decodeURIComponent(id);
  const project = await getProject(decodedId);

  if (!project) {
    notFound();
  }

  // 301 Redirect من UUID إلى Slug لتحسين SEO وتوحيد الفهرسة
  if (UUID_REGEX.test(decodedId) && project.slug && project.slug !== decodedId) {
    permanentRedirect(`/portfolio/${project.slug}`);
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
  
  // حساب التقييم الفعلي من التعليقات
  const validReviews = projectReviews.filter((c: any) => c.rating >= 1 && c.rating <= 5);
  const averageRating = validReviews.length > 0 
    ? Math.round((validReviews.reduce((sum: number, c: any) => sum + c.rating, 0) / validReviews.length) * 10) / 10
    : 0;

  const structuredData = generateCreativeWorkSchema({
    name: project.title,
    description: project.description,
    url: `/portfolio/${project.slug || id}`,
    category: project.category,
    location: project.location,
    dateCreated: project.createdAt,
    dateModified: project.updatedAt,
    images: images.map((item: any, index: number) => ({
      id: item.id || `img-${index + 1}`,
      url: getAbsoluteUrl(item.src),
      caption: item.title || item.description || `${project.title} - صورة ${index + 1}`,
      alt: item.alt || item.title || `${project.category} في ${project.location} - صورة ${index + 1}`
    })),
    videos: videos.map((item: any, index: number) => {
      const videoThumbnail = generateVideoThumbnail(item.src);
      
      return {
        id: item.id || `vid-${index + 1}`,
        name: item.title || `${project.title} - فيديو ${index + 1}`,
        description: item.description || `فيديو يوضح تفاصيل مشروع ${project.title} في ${project.location}`,
        contentUrl: getAbsoluteUrl(item.src),
        embedUrl: fullUrl,
        thumbnailUrl: videoThumbnail || (item.thumbnail ? getAbsoluteUrl(item.thumbnail) : undefined),
        uploadDate: project.createdAt,
        duration: item.duration
      };
    }),
    aggregateRating: validReviews.length > 0 && averageRating > 0 ? {
      ratingValue: averageRating,
      reviewCount: validReviews.length
    } : undefined,
    reviews: validReviews.length > 0 ? validReviews.map((comment: any) => ({
      author: comment.name?.trim() || 'عميل',
      rating: Math.min(5, Math.max(1, Number(comment.rating))),
      reviewBody: comment.message?.trim() || '',
      datePublished: comment.createdAt ? new Date(comment.createdAt).toISOString() : new Date().toISOString()
    })).filter((r: any) => r.reviewBody.length > 0) : undefined
  });

  const imageGallerySchema = images.length > 1 ? generateImageGallerySchema({
    name: `معرض صور ${project.title}`,
    description: `معرض صور مشروع ${project.title} - ${project.category} في ${project.location} | ديار جدة العالمية`,
    url: `/portfolio/${project.slug || id}`,
    category: project.category,
    location: project.location,
    dateCreated: project.createdAt,
    dateModified: project.updatedAt,
    images: images.map((item: any, index: number) => ({
      url: getAbsoluteUrl(item.src),
      caption: item.title || item.description || `${project.title} - ${project.category} في ${project.location} - صورة ${index + 1} | ديار جدة العالمية`,
      alt: item.alt || `${project.category} في ${project.location} - صورة ${index + 1} | ديار جدة العالمية`,
      width: 1200,
      height: 800
    }))
  }) : null;

  const projectSchema = images.length > 0 ? generateProjectSchema({
    name: project.title,
    description: project.description,
    url: `/portfolio/${project.slug || id}`,
    category: project.category,
    location: project.location,
    dateCreated: project.createdAt,
    dateModified: project.updatedAt,
    images: images.map((item: any, index: number) => ({
      url: getAbsoluteUrl(item.src),
      caption: item.title || `${project.title} - صورة ${index + 1}`,
      alt: item.alt || `${project.category} في ${project.location}`
    })),
    videos: videos.length > 0 ? videos.map((item: any, index: number) => ({
      url: getAbsoluteUrl(item.src),
      name: item.title || `${project.title} - فيديو ${index + 1}`,
      description: item.description || `فيديو مشروع ${project.title}`,
      thumbnailUrl: generateVideoThumbnail(item.src) || undefined
    })) : undefined,
    aggregateRating: validReviews.length > 0 && averageRating > 0 ? {
      ratingValue: averageRating,
      reviewCount: validReviews.length
    } : undefined
  }) : null;

  return (
    <IntlProvider>
      <BreadcrumbSchema items={breadcrumbItems} locale={locale} />
      
      {/* ✅ Creative Work Schema - للمشروع والصور والفيديوهات */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      
      {/* ✅ Project Schema - بيانات المشروع المتقدمة */}
      {projectSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(projectSchema),
          }}
        />
      )}
      
      {/* ✅ Image Gallery Schema - معرض الصور (جميع الصور) */}
      {imageGallerySchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(imageGallerySchema),
          }}
        />
      )}
      
      {/* ✅ CollectionPage Schema - لإظهار الصفحة كمجموعة صور */}
      {images.length > 1 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateCollectionPageSchema({
              name: `معرض ${project.title}`,
              description: `مجموعة صور مشروع ${project.title} - ${project.category} في ${project.location} | ديار جدة العالمية`,
              url: `/portfolio/${project.slug || id}`,
              images: images.map((item: any, index: number) => ({
                url: getAbsoluteUrl(item.src),
                caption: item.title || `${project.title} - صورة ${index + 1}`,
                alt: item.alt || `${project.category} في ${project.location} - صورة ${index + 1}`,
                width: 1200,
                height: 800
              })),
              category: project.category,
              location: project.location,
              dateCreated: project.createdAt,
              dateModified: project.updatedAt
            })),
          }}
        />
      )}
      
      {/* ✅ Individual ImageObject Schemas - كل صورة بشكل مستقل للفهرسة الفردية */}
      {images.length > 0 && generateIndividualImageSchemas({
        projectName: project.title,
        projectDescription: project.description,
        projectUrl: `/portfolio/${project.slug || id}`,
        category: project.category,
        location: project.location,
        dateCreated: project.createdAt,
        images: images.map((item: any, index: number) => ({
          url: getAbsoluteUrl(item.src),
          caption: item.title || `${project.title} - صورة ${index + 1}`,
          alt: item.alt || `${project.category} في ${project.location} - صورة ${index + 1}`,
          width: 1200,
          height: 800
        }))
      }).map((schema, index) => (
        <script
          key={`individual-image-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema),
          }}
        />
      ))}
      
      {/* ✅ LocalBusiness Schema - معلومات الشركة والتقييمات */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            name: 'ديار جدة العالمية',
            description: `${project.category} في ${project.location} - تنفيذ ديار جدة العالمية بجودة عالية وضمان 10 سنوات`,
            image: images.length > 0 ? images.map((img: any) => getAbsoluteUrl(img.src)) : ['https://www.aldeyarksa.tech/logo.png'],
            address: {
              '@type': 'PostalAddress',
              addressLocality: project.location || 'جدة',
              addressRegion: 'منطقة مكة المكرمة',
              addressCountry: 'SA'
            },
            geo: {
              '@type': 'GeoCoordinates',
              latitude: '21.5433',
              longitude: '39.1728'
            },
            telephone: '+966553719009',
            priceRange: '$$',
            ...(validReviews.length > 0 && averageRating > 0 ? {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: averageRating.toString(),
                reviewCount: validReviews.length.toString(),
                bestRating: '5',
                worstRating: '1'
              }
            } : {}),
            ...(validReviews.length > 0 ? {
              review: validReviews.map((comment: any) => ({
                '@type': 'Review',
                author: {
                  '@type': 'Person',
                  name: comment.name?.trim() || 'عميل'
                },
                datePublished: comment.createdAt ? new Date(comment.createdAt).toISOString() : new Date().toISOString(),
                reviewBody: comment.message?.trim() || '',
                reviewRating: {
                  '@type': 'Rating',
                  ratingValue: Math.min(5, Math.max(1, Number(comment.rating))).toString(),
                  bestRating: '5',
                  worstRating: '1'
                }
              }))
            } : {})
          }),
        }}
      />
      
      <NavbarArabic />
      <ProjectDetailsClient project={project} projectId={id} />
      <Footer />
    </IntlProvider>
  );
}
