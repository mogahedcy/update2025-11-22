import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { randomUUID } from 'crypto';
import { normalizeCategoryName } from '@/lib/categoryNormalizer';
import { checkAdminAuth } from '@/lib/auth';
import { revalidatePath, revalidateTag } from 'next/cache';
import {
  buildSeoFields,
  computeReadyScore,
  createDeterministicSlug,
  getClientIp,
  normalizeLongText,
  normalizeStatus,
  normalizeTags,
  normalizeText
} from '@/lib/content-quality';

// GET - جلب المشاريع مع إحصائيات التفاعل
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const limit = searchParams.get('limit');
    const page = searchParams.get('page');
    const sort = searchParams.get('sort') || 'newest';
    const search = searchParams.get('search');
    const status = searchParams.get('status') || 'PUBLISHED';

    const skip = page ? (Number.parseInt(page) - 1) * (limit ? Number.parseInt(limit) : 12) : 0;
    const take = limit ? Number.parseInt(limit) : 12;

    const where: Record<string, unknown> = {
      status: status
    };

    if (category && category !== 'all') {
      const categoryValidation = normalizeCategoryName(category);
      if (categoryValidation.isValid && categoryValidation.normalizedCategory) {
        where.category = {
          contains: categoryValidation.normalizedCategory
        };
        if (categoryValidation.wasTransformed) {
          console.log(`✅ Projects GET - تم تحويل الفئة: "${category}" → "${categoryValidation.normalizedCategory}"`);
        }
      } else {
        where.category = {
          contains: category
        };
      }
    }

    if (featured === 'true') {
      where.featured = true;
    }

    if (search) {
      const searchLower = search.toLowerCase();
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { location: { contains: search } },
        {
          tags: {
            some: {
              name: { contains: search }
            }
          }
        }
      ];
    }

    // تحديد ترتيب المشاريع
    let orderBy: Array<Record<string, string>> = [];
    switch (sort) {
      case 'newest':
        orderBy = [{ publishedAt: 'desc' }, { createdAt: 'desc' }];
        break;
      case 'oldest':
        orderBy = [{ publishedAt: 'asc' }, { createdAt: 'asc' }];
        break;
      case 'featured':
        orderBy = [{ featured: 'desc' }, { publishedAt: 'desc' }];
        break;
      case 'popular':
        orderBy = [
          { views: 'desc' },
          // ترتيب ثانوي حسب عدد الإعجابات الفعلية
          { project_likes: { _count: 'desc' } } as any
        ];
        break;
      case 'most-liked':
        orderBy = [
          { project_likes: { _count: 'desc' } } as any,
          { views: 'desc' }
        ];
        break;
      case 'highest-rated':
        orderBy = [{ rating: 'desc' }, { views: 'desc' }];
        break;
      case 'alphabetical':
        orderBy = [{ title: 'asc' }];
        break;
      default:
        orderBy = [{ featured: 'desc' }, { publishedAt: 'desc' }];
    }

    const db: any = prisma as any;
    const Project = db.projects || db.project;

    if (!Project || !process.env.DATABASE_URL) {
      return NextResponse.json({
        success: true,
        projects: [],
        total: 0,
        stats: { total: 0, featured: 0, categories: [] },
        pagination: {
          total: 0,
          page: page ? Number.parseInt(page) : 1,
          limit: take,
          totalPages: 0,
          hasMore: false
        }
      });
    }

    const projects = await Project.findMany({
      where,
      include: {
        media_items: {
          orderBy: { order: 'asc' },
          take: 5
        },
        project_tags: {
          take: 10
        },
        _count: {
          select: {
            comments: {
              where: { status: 'APPROVED' }
            },
            project_likes: true,
            project_views: true,
            media_items: true
          }
        }
      },
      orderBy,
      skip,
      take
    });

    // تحسين البيانات المُرجعة
    const formattedProjects = projects.map((project: any) => ({
      ...project,
      mediaItems: project.media_items || [],
      tags: project.project_tags || [],
      views: project._count?.project_views || 0,
      likes: project._count?.project_likes || 0,
      commentsCount: project._count?.comments || 0,
      mediaCount: project._count?.media_items || 0,
      excerpt: (project.description || '').substring(0, 150) + '...',
      readTime: Math.ceil((project.description || '').length / 200),
      slug: project.slug || generateSlug(project.title, project.id)
    }));

    const totalCount = await Project.count({ where });

    // إحصائيات إضافية
    const stats = {
      total: totalCount,
      featured: await Project.count({ where: { ...where, featured: true } }),
      categories: await Project.groupBy({
        by: ['category'],
        where,
        _count: { category: true }
      })
    };

    return NextResponse.json({
      success: true,
      projects: formattedProjects,
      total: totalCount,
      stats,
      pagination: {
        total: totalCount,
        page: page ? Number.parseInt(page) : 1,
        limit: take,
        totalPages: Math.ceil(totalCount / take),
        hasMore: skip + take < totalCount
      }
    });

  } catch (error: unknown) {
    console.error('❌ خطأ في جلب المشاريع:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب المشاريع' },
      { status: 500 }
    );
  }
}

// POST - إضافة مشروع جديد
export async function POST(request: NextRequest) {
  try {
    const admin = await checkAdminAuth();
    if (!admin) {
      return NextResponse.json(
        { error: 'غير مصرح - يرجى تسجيل الدخول' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const headersList = await headers();
    const ip = getClientIp(headersList);

    const {
      title,
      description,
      category,
      location,
      completionDate,
      client,
      featured,
      projectDuration,
      projectCost,
      mediaItems,
      tags,
      materials,
      metaTitle,
      metaDescription,
      keywords,
      status = 'PUBLISHED'
    } = data;

    const normalizedTitle = normalizeText(title, 180);
    const normalizedDescription = normalizeLongText(description, 12000);
    const normalizedLocation = normalizeText(location, 180);
    const normalizedClient = normalizeText(client, 120) || null;
    const normalizedStatus = normalizeStatus(status, 'DRAFT');
    const normalizedTagNames = normalizeTags(tags);
    const normalizedMaterialNames = normalizeTags(materials);

    // التحقق من صحة البيانات
    if (!normalizedTitle || !normalizedDescription || !category || !normalizedLocation) {
      return NextResponse.json(
        { error: 'البيانات الأساسية مطلوبة (العنوان، الوصف، التصنيف، الموقع).' },
        { status: 400 }
      );
    }

    const categoryValidation = normalizeCategoryName(category);
    if (!categoryValidation.isValid || !categoryValidation.normalizedCategory) {
      return NextResponse.json(
        { error: `الفئة "${category}" غير صالحة. الرجاء اختيار فئة صحيحة.` },
        { status: 400 }
      );
    }
    const normalizedCategory = categoryValidation.normalizedCategory;

    // التحقق من الوسائط المرفوعة
    if (mediaItems && Array.isArray(mediaItems)) {
      // حد أقصى لعدد الملفات
      if (mediaItems.length > 20) {
        return NextResponse.json(
          { error: 'عدد الملفات المرفوعة يتجاوز الحد المسموح (20 ملف كحد أقصى)' },
          { status: 400 }
        );
      }

      // التحقق من حجم ونوع كل ملف
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
      const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];

      for (const item of mediaItems) {
        // التحقق من حجم الملف
        if (item.fileSize && item.fileSize > MAX_FILE_SIZE) {
          return NextResponse.json(
            { error: `حجم الملف "${item.title || 'غير معروف'}" يتجاوز 10MB` },
            { status: 400 }
          );
        }

        // التحقق من نوع الملف
        if (item.mimeType) {
          const isValidImage = item.type === 'IMAGE' && ALLOWED_IMAGE_TYPES.includes(item.mimeType);
          const isValidVideo = item.type === 'VIDEO' && ALLOWED_VIDEO_TYPES.includes(item.mimeType);
          
          if (!isValidImage && !isValidVideo) {
            return NextResponse.json(
              { error: `نوع الملف "${item.mimeType}" غير مدعوم. الأنواع المدعومة: JPEG, PNG, WebP, GIF, MP4, WebM` },
              { status: 400 }
            );
          }
        }
      }
    }

    // إنشاء slug فريد
    const slug = createDeterministicSlug(normalizedTitle, 'project');
    const existingByTitle = await prisma.projects.findFirst({
      where: { title: normalizedTitle },
      select: { id: true }
    });
    if (existingByTitle) {
      return NextResponse.json(
        { error: 'يوجد مشروع بعنوان مشابه بالفعل، يرجى تعديل العنوان.' },
        { status: 409 }
      );
    }

    let finalSlug = slug;
    let slugAvailable = false;
    for (let attempt = 0; attempt < 5; attempt++) {
      const existingSlug = await prisma.projects.findUnique({
        where: { slug: finalSlug },
        select: { id: true }
      });
      if (!existingSlug) {
        slugAvailable = true;
        break;
      }
      finalSlug = `${slug}-${randomUUID().replace(/-/g, '').slice(0, 12)}`;
    }
    if (!slugAvailable) {
      return NextResponse.json(
        { error: 'تعذر إنشاء رابط فريد للمشروع، يرجى المحاولة مرة أخرى.' },
        { status: 500 }
      );
    }

    const seo = buildSeoFields({
      title: metaTitle || normalizedTitle,
      description: normalizedDescription,
      keywords,
      fallbackKeywords: [normalizedCategory, normalizedLocation, 'ديار جدة العالمية']
    });
    const readyScore = computeReadyScore({
      title: normalizedTitle,
      body: normalizedDescription,
      metaTitle: seo.metaTitle,
      metaDescription: seo.metaDescription,
      keywords: seo.keywords
    });

    // حساب عدد الصور والفيديوهات
    const imageCount = mediaItems?.filter((item: any) => item.type === 'IMAGE').length || 0;
    const videoCount = mediaItems?.filter((item: any) => item.type === 'VIDEO').length || 0;

    // 🌍 ترجمة تلقائية إلى الإنجليزية باستخدام Groq AI (اختياري)
    let englishMetadata: any = null;
    if (process.env.GROQ_API_KEY) {
      try {
        console.log('🔄 بدء الترجمة التلقائية إلى الإنجليزية...');
        const { translateProjectToEnglish } = await import('@/lib/ai-translator');
        
        englishMetadata = await translateProjectToEnglish(
          {
            title: normalizedTitle,
            description: normalizedDescription,
            category: normalizedCategory,
            location: normalizedLocation,
            metaTitle,
            metaDescription,
            keywords: keywords?.split(',').map((k: string) => k.trim()),
            tags: normalizedTagNames,
            materials: normalizedMaterialNames
          },
          imageCount,
          videoCount
        );
        
        console.log('✅ تمت الترجمة بنجاح:', englishMetadata.title);
        
        // حفظ الترجمة الإنجليزية في حقل منفصل (JSON)
        // يمكن استخدامها لاحقاً لعرض المحتوى بالإنجليزية
      } catch (translationError) {
        console.warn('⚠️ فشلت الترجمة التلقائية، سيتم المتابعة بدون ترجمة:', translationError);
      }
    }

    const project = await prisma.projects.create({
      data: {
        id: randomUUID(),
        title: normalizedTitle,
        description: normalizedDescription,
        category: normalizedCategory,
        location: normalizedLocation,
        completionDate: completionDate ? new Date(completionDate) : new Date(),
        client: normalizedClient,
        featured: featured || false,
        projectDuration: projectDuration || '',
        projectCost: projectCost || '',
        slug: finalSlug,
        metaTitle: seo.metaTitle || metaTitle || normalizedTitle,
        metaDescription: seo.metaDescription || metaDescription || normalizedDescription.substring(0, 160),
        keywords: seo.keywords || `${normalizedCategory}, ${normalizedLocation}, ديار جدة العالمية`,
        status: normalizedStatus,
        publishedAt: normalizedStatus === 'PUBLISHED' ? new Date() : null,
        updatedAt: new Date(),
        // حفظ البيانات المترجمة في حقل JSON (إذا كانت متوفرة)
        ...(englishMetadata && {
          suggestedKeywords: JSON.stringify({
            en: englishMetadata.keywords,
            enMetadata: {
              title: englishMetadata.title,
              description: englishMetadata.description,
              metaTitle: englishMetadata.metaTitle,
              metaDescription: englishMetadata.metaDescription,
              richSnippet: englishMetadata.seoOptimized.richSnippet
            }
          })
        }),
        media_items: {
          create: mediaItems?.map((item: any, index: number) => {
            // تحسين وصف الصور والفيديوهات باستخدام الترجمة
            let enhancedAlt = item.alt || normalizedTitle;
            let enhancedDescription = item.description || '';
            
            if (englishMetadata) {
              if (item.type === 'IMAGE' && englishMetadata.seoOptimized.imageAltTexts[index]) {
                enhancedAlt = `${enhancedAlt} | ${englishMetadata.seoOptimized.imageAltTexts[index]}`;
              } else if (item.type === 'VIDEO') {
                const videoIndex = index - imageCount;
                if (englishMetadata.seoOptimized.videoDescriptions[videoIndex]) {
                  enhancedDescription = englishMetadata.seoOptimized.videoDescriptions[videoIndex] || enhancedDescription;
                }
              }
            }
            
            // إصلاح مشكلة الفيديوهات: تأكد من عدم استخدام src كـ thumbnail للفيديو
            let thumbnailUrl = item.thumbnail;
            if (item.type === 'VIDEO' && !thumbnailUrl) {
              // لا تستخدم src كـ thumbnail للفيديو - دعه null ليتم توليده تلقائياً
              thumbnailUrl = null;
            } else if (item.type === 'IMAGE' && !thumbnailUrl) {
              thumbnailUrl = item.src || item.url;
            }
            
            return {
              id: randomUUID(),
              type: item.type,
              src: item.src || item.url,
              thumbnail: thumbnailUrl,
              title: item.title || `ملف ${index + 1}`,
              description: enhancedDescription || item.description || '',
              duration: item.duration || null,
              fileSize: item.fileSize || null,
              mimeType: item.mimeType || null,
              alt: enhancedAlt,
              caption: item.caption || '',
              order: index
            };
          }) || []
        },
        ...(normalizedTagNames.length > 0 && {
          project_tags: {
            create: normalizedTagNames.map((name: string) => ({ name }))
          }
        }),
        ...(normalizedMaterialNames.length > 0 && {
          project_materials: {
            create: normalizedMaterialNames.map((name: string) => ({ name }))
          }
        })
      },
      include: {
        media_items: true,
        project_tags: true,
        project_materials: true,
        _count: {
          select: {
            comments: true,
            project_likes: true,
            project_views: true
          }
        }
      }
    });

    // إ��شاء أول مشاهدة (من الإدارة)
    await prisma.project_views.create({
      data: {
        id: randomUUID(),
        projectId: project.id,
        ip,
        userAgent: headersList.get('user-agent') || 'unknown',
        source: 'admin'
      }
    });

    // تحديث عداد المشاهدات
    await prisma.projects.update({
      where: { id: project.id },
      data: { views: 1 }
    });

    // إشعار محركات البحث بالمحتوى الجديد
    if (project.status === 'PUBLISHED') {
      try {
        const origin = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000';
        const projectUrl = `/portfolio/${project.slug || project.id}`;
        
        // استخدام API الأرشفة الموحدة الجديدة
        await fetch(`${origin}/api/indexing/auto`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: projectUrl })
        });
        
        console.log('🔔 تم إشعار محركات البحث بالمشروع الجديد');
      } catch (error) {
        console.warn('⚠️ فشل في إشعار محركات البحث:', error);
      }
    }

    // إعادة التحقق من صفحات المعرض لعرض المشروع الجديد فوراً
    try {
      revalidatePath('/portfolio');
      revalidatePath('/en/portfolio');
      revalidatePath(`/portfolio/${project.slug || project.id}`);
      revalidatePath(`/en/portfolio/${project.slug || project.id}`);
      revalidateTag('projects');
      console.log('✅ تم تحديث ذاكرة التخزين المؤقت للمعرض');
    } catch (error) {
      console.warn('⚠️ فشل في تحديث ذاكرة التخزين المؤقت:', error);
    }

    const formatted = {
      ...project,
      mediaItems: project.media_items,
      views: 1,
      likes: 0,
      commentsCount: 0,
      quality: readyScore,
      tags: normalizedTagNames,
      materials: normalizedMaterialNames
    };
    return NextResponse.json({ success: true, project: formatted, message: 'تم إضافة المشروع بنجاح' });

  } catch (error: unknown) {
    console.error('❌ خطأ في إضافة المشروع:', error);
    return NextResponse.json(
      { 
        error: 'حدث خطأ في إضافة المشروع',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}

// Helper functions
function generateSlug(title: string, id?: string): string {
  const slug = title
    .replace(/[^\u0600-\u06FF\w\s-]/g, '') // إزالة الرموز ما عدا العربية والإنجليزية
    .replace(/\s+/g, '-') // استبدال المسافات بشرطات
    .toLowerCase()
    .trim();

  return id ? `${slug}-${id}` : slug;
}

// ملاحظة: تم استبدال هذه الدالة بنظام الأرشفة الموحد في `/api/indexing/auto`
