import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { randomUUID } from 'crypto';
import { normalizeArticleCategoryName } from '@/lib/categoryNormalizer';
import { checkAdminAuth } from '@/lib/auth';
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

// GET - جلب المقالات مع إحصائيات التفاعل
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
      const categoryValidation = normalizeArticleCategoryName(category);
      if (categoryValidation.isValid && categoryValidation.normalizedCategory) {
        where.category = {
          contains: categoryValidation.normalizedCategory
        };
        if (categoryValidation.wasTransformed) {
          console.log(`✅ Articles GET - تم تحويل الفئة: "${category}" → "${categoryValidation.normalizedCategory}"`);
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
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
        { excerpt: { contains: search } },
        {
          article_tags: {
            some: {
              name: { contains: search }
            }
          }
        }
      ];
    }

    // تحديد ترتيب المقالات
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
          { article_likes: { _count: 'desc' } } as any
        ];
        break;
      case 'most-liked':
        orderBy = [
          { article_likes: { _count: 'desc' } } as any,
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

    const articles = await prisma.articles.findMany({
      where,
      include: {
        article_media_items: {
          orderBy: { order: 'asc' },
          take: 5
        },
        article_tags: {
          take: 10
        },
        _count: {
          select: {
            article_comments: {
              where: { status: 'APPROVED' }
            },
            article_likes: true,
            article_views: true,
            article_media_items: true
          }
        }
      },
      orderBy,
      skip,
      take
    });

    // تحسين البيانات المُرجعة
    const formattedArticles = articles.map((article: any) => ({
      ...article,
      mediaItems: article.article_media_items || [],
      tags: article.article_tags || [],
      views: article._count?.article_views || 0,
      likes: article._count?.article_likes || 0,
      commentsCount: article._count?.article_comments || 0,
      mediaCount: article._count?.article_media_items || 0,
      excerpt: article.excerpt || (article.content || '').substring(0, 200) + '...',
      readTime: Math.ceil((article.content || '').length / 1000),
      slug: article.slug || generateSlug(article.title, article.id)
    }));

    const totalCount = await prisma.articles.count({ where });

    // إحصائيات إضافية
    const stats = {
      total: totalCount,
      featured: await prisma.articles.count({ where: { ...where, featured: true } }),
      categories: await prisma.articles.groupBy({
        by: ['category'],
        where,
        _count: { category: true }
      })
    };

    return NextResponse.json({
      success: true,
      articles: formattedArticles,
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
    console.error('❌ خطأ في جلب المقالات:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب المقالات' },
      { status: 500 }
    );
  }
}

// POST - إضافة مقالة جديدة
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
      content,
      excerpt,
      author,
      category,
      featured,
      mediaItems,
      tags,
      metaTitle,
      metaDescription,
      keywords,
      status = 'PUBLISHED'
    } = data;

    const normalizedTitle = normalizeText(title, 180);
    const normalizedContent = normalizeLongText(content, 15000);
    const normalizedExcerpt = normalizeLongText(excerpt, 300);
    const normalizedAuthor = normalizeText(author, 100) || 'ديار جدة العالمية';
    const normalizedStatus = normalizeStatus(status, 'DRAFT');
    const normalizedTagNames = normalizeTags(tags);

    // التحقق من صحة البيانات
    if (!normalizedTitle || !normalizedContent || !category) {
      return NextResponse.json(
        { error: 'البيانات الأساسية مطلوبة (العنوان، المحتوى، التصنيف).' },
        { status: 400 }
      );
    }

    // التحقق من صحة الفئة وتحويلها تلقائياً
    const categoryValidation = normalizeArticleCategoryName(category);
    if (!categoryValidation.isValid || !categoryValidation.normalizedCategory) {
      return NextResponse.json(
        { error: `الفئة "${category}" غير صالحة. الرجاء اختيار فئة من القائمة المتاحة.` },
        { status: 400 }
      );
    }

    const normalizedCategory = categoryValidation.normalizedCategory;
    
    if (categoryValidation.wasTransformed) {
      console.log(`✅ تم تحويل الفئة: "${category}" → "${normalizedCategory}"`);
    }

    // إنشاء slug فريد
    const slugBase = createDeterministicSlug(normalizedTitle, 'article');
    const existingByTitle = await prisma.articles.findFirst({
      where: { title: normalizedTitle },
      select: { id: true }
    });
    if (existingByTitle) {
      return NextResponse.json(
        { error: 'يوجد مقال بعنوان مشابه بالفعل، يرجى تعديل العنوان.' },
        { status: 409 }
      );
    }

    let finalSlug = slugBase;
    let slugAvailable = false;
    for (let attempt = 0; attempt < 5; attempt++) {
      const slugExists = await prisma.articles.findUnique({
        where: { slug: finalSlug },
        select: { id: true }
      });
      if (!slugExists) {
        slugAvailable = true;
        break;
      }
      finalSlug = `${slugBase}-${randomUUID().replace(/-/g, '').slice(0, 12)}`;
    }
    if (!slugAvailable) {
      return NextResponse.json(
        { error: 'تعذر إنشاء رابط فريد للمقالة، يرجى المحاولة مرة أخرى.' },
        { status: 500 }
      );
    }

    const seo = buildSeoFields({
      title: metaTitle || normalizedTitle,
      description: normalizedContent,
      excerpt: normalizedExcerpt || normalizedContent,
      keywords,
      fallbackKeywords: [category, 'ديار جدة العالمية', 'مقالات']
    });
    const readyScore = computeReadyScore({
      title: normalizedTitle,
      body: normalizedContent,
      metaTitle: seo.metaTitle,
      metaDescription: seo.metaDescription,
      keywords: seo.keywords
    });

    const article = await prisma.articles.create({
      data: {
        id: randomUUID(),
        title: normalizedTitle,
        content: normalizedContent,
        excerpt: normalizedExcerpt || normalizedContent.substring(0, 200),
        author: normalizedAuthor,
        category: normalizedCategory,
        featured: featured || false,
        slug: finalSlug,
        metaTitle: seo.metaTitle || metaTitle || normalizedTitle,
        metaDescription: seo.metaDescription || metaDescription || (normalizedExcerpt || normalizedContent).substring(0, 160),
        keywords: seo.keywords || `${normalizedCategory}, ديار جدة العالمية, مقالات`,
        status: normalizedStatus,
        publishedAt: normalizedStatus === 'PUBLISHED' ? new Date() : null,
        updatedAt: new Date(),
        article_media_items: {
          create: mediaItems?.map((item: any, index: number) => ({
            id: randomUUID(),
            type: item.type,
            src: item.src || item.url,
            thumbnail: item.thumbnail || item.src || item.url,
            title: item.title || `ملف ${index + 1}`,
            description: item.description || '',
            duration: item.duration || null,
            fileSize: item.fileSize || null,
            mimeType: item.mimeType || null,
            alt: item.alt || title,
            caption: item.caption || '',
            order: index
          })) || []
        },
        article_tags: {
          create: normalizedTagNames.map((tag: string) => ({
            name: tag
          }))
        }
      },
      include: {
        article_media_items: true,
        article_tags: true,
        _count: {
          select: {
            article_comments: true,
            article_likes: true,
            article_views: true
          }
        }
      }
    });

    // إنشاء أول مشاهدة (من الإدارة)
    await prisma.article_views.create({
      data: {
        id: randomUUID(),
        articleId: article.id,
        ip,
        userAgent: headersList.get('user-agent') || 'unknown',
        source: 'admin'
      }
    });

    // تحديث عداد المشاهدات
    await prisma.articles.update({
      where: { id: article.id },
      data: { views: 1 }
    });

    // إشعار Google بالمحتوى الجديد
    try {
      if (article.slug) {
        await notifyGoogleNewContent(article.slug);
      }
    } catch (error) {
      console.warn('فشل في إشعار Google:', error);
    }

    const formatted = {
      ...article,
      mediaItems: article.article_media_items,
      tags: article.article_tags,
      views: 1,
      likes: 0,
      commentsCount: 0,
      quality: readyScore
    };
    return NextResponse.json({ success: true, article: formatted, message: 'تم إضافة المقالة بنجاح' });

  } catch (error: unknown) {
    console.error('❌ خطأ في إضافة المقالة:', error);
    return NextResponse.json(
      { 
        error: 'حدث خطأ في إضافة المقالة',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}

// Helper functions
function generateSlug(title: string, id?: string): string {
  const slug = title
    .replace(/[^\u0600-\u06FF\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .trim();

  return id ? `${slug}-${id}` : slug;
}

async function notifyGoogleNewContent(slug: string): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.deyarsu.com';
  const url = `${baseUrl}/articles/${slug}`;

  try {
    await fetch('https://www.google.com/ping?sitemap=' + encodeURIComponent(`${baseUrl}/sitemap.xml`));

    try {
      await fetch(`${baseUrl}/api/indexnow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: [url] })
      });
    } catch (e) {
      console.warn('IndexNow submit failed:', e);
    }

    console.log('✅ تمت إشعارات الفهرسة:', url);
  } catch (error) {
    console.warn('⚠️ فشل في إشعار محركات البحث:', error);
  }
}
