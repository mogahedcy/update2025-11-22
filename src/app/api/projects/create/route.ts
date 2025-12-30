import { type NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { generateArabicSlug } from '@/lib/arabic-slug';
import { randomUUID } from 'crypto';
import { normalizeCategoryName } from '@/lib/categoryNormalizer';
import { checkAdminAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const admin = await checkAdminAuth();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح - يرجى تسجيل الدخول' },
        { status: 401 }
      );
    }

    const data = await request.json();
    
    // التحقق من صحة البيانات
    const requiredFields = ['title', 'description', 'category', 'location'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { success: false, message: `حقل ${field} مطلوب` },
          { status: 400 }
        );
      }
    }

    // التحقق من صحة الفئة وتحويلها تلقائياً
    const categoryValidation = normalizeCategoryName(data.category);
    if (!categoryValidation.isValid || !categoryValidation.normalizedCategory) {
      return NextResponse.json(
        { 
          success: false, 
          message: `الفئة "${data.category}" غير صالحة. الرجاء اختيار فئة من القائمة المتاحة.` 
        },
        { status: 400 }
      );
    }

    const normalizedCategory = categoryValidation.normalizedCategory;
    
    if (categoryValidation.wasTransformed) {
      console.log(`✅ تم تحويل الفئة: "${data.category}" → "${normalizedCategory}"`);
    }

    // إنشاء slug فريد للمشروع باستخدام الأحرف العربية
    const baseSlug = generateArabicSlug(data.title, normalizedCategory);
    let slug = baseSlug;
    let counter = 1;
    
    while (await prisma.projects.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // إنشاء المشروع
    const project = await prisma.projects.create({
      data: {
        id: randomUUID(),
        title: data.title,
        description: data.description,
        category: normalizedCategory,
        location: data.location,
        completionDate: data.completionDate ? new Date(data.completionDate) : new Date(),
        client: data.client || null,
        featured: data.featured || false,
        projectDuration: data.projectDuration || null,
        projectCost: data.projectCost || null,
        slug: slug,
        metaTitle: data.metaTitle || `${data.title} في ${data.location} | ديار جدة العالمية`,
        metaDescription: data.metaDescription || `${data.description.substring(0, 150)}...`,
        keywords: data.keywords || `${data.category}, ${data.location}, جدة, ديار جدة العالمية`,
        status: 'PUBLISHED',
        publishedAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        media_items: true,
        project_tags: true,
        project_materials: true
      }
    });

    // إضافة الوسائط إذا كانت متوفرة
    if (data.mediaItems && data.mediaItems.length > 0) {
      await prisma.media_items.createMany({
        data: data.mediaItems.map((item: any, index: number) => ({
          id: randomUUID(),
          projectId: project.id,
          type: item.type || 'IMAGE',
          src: item.src,
          title: item.title || project.title,
          description: item.description || project.description,
          order: index,
          alt: item.alt || `${project.title} - صورة ${index + 1}`,
          createdAt: new Date()
        }))
      });
    }

    // إضافة العلامات إذا كانت متوفرة
    if (data.tags && data.tags.length > 0) {
      await prisma.project_tags.createMany({
        data: data.tags.map((tag: string) => ({
          id: randomUUID(),
          projectId: project.id,
          name: tag,
          createdAt: new Date()
        }))
      });
    }

    // إضافة المواد إذا كانت متوفرة
    if (data.materials && data.materials.length > 0) {
      await prisma.project_materials.createMany({
        data: data.materials.map((material: string) => ({
          id: randomUUID(),
          projectId: project.id,
          name: material,
          createdAt: new Date()
        }))
      });
    }

    // جلب المشروع مع جميع البيانات المحدثة
    const fullProject = await prisma.projects.findUnique({
      where: { id: project.id },
      include: {
        media_items: {
          orderBy: { order: 'asc' }
        },
        project_tags: true,
        project_materials: true
      }
    });

    // تحديث الـ cache للصفحات الديناميكية
    try {
      revalidatePath('/portfolio');
      revalidatePath(`/portfolio/${slug}`);
      console.log('✅ تم تحديث cache الصفحات');
    } catch (cacheError) {
      console.error('⚠️ خطأ في تحديث الـ cache:', cacheError);
    }

    // تحديث خريطة الموقع تلقائياً
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000'}/api/sitemap/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (sitemapError) {
      console.error('خطأ في تحديث خريطة الموقع:', sitemapError);
    }

    // إشعار محركات البحث بالتحديث
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000'}/api/webhook/content-updated`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-signature': `sha256=${process.env.WEBHOOK_SECRET || 'default-webhook-secret'}`
        },
        body: JSON.stringify({
          type: 'project',
          action: 'created',
          id: project.id,
          url: `/portfolio/${project.id}`,
          timestamp: new Date().toISOString()
        })
      });
    } catch (notificationError) {
      console.error('خطأ في إشعار محركات البحث:', notificationError);
    }

    // ✅ إرسال البيانات إلى n8n لنشرها في وسائل التواصل الاجتماعي
    if (process.env.N8N_WEBHOOK_URL) {
      try {
        const n8nData = {
          title: project.title,
          description: project.description,
          category: project.category,
          location: project.location,
          projectLink: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.aldeyarksa.tech'}/portfolio/${project.slug}`,
          media: fullProject?.media_items?.map(item => ({
            url: item.src
          })) || []
        };

        fetch(process.env.N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(n8nData)
        }).catch(err => console.error('❌ خطأ في إرسال البيانات إلى n8n:', err));
        
        console.log('🚀 تم إرسال بيانات المشروع إلى n8n للنش الاجتماعي (الرابط الجديد)');
      } catch (n8nError) {
        console.error('⚠️ خطأ في تجهيز بيانات n8n:', n8nError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء المشروع بنجاح',
      project: {
        id: project.id,
        slug: slug,
        title: project.title,
        url: `/portfolio/${slug}`,
        mediaItems: fullProject?.media_items || [],
        tags: fullProject?.project_tags || [],
        materials: fullProject?.project_materials || []
      }
    });

  } catch (error) {
    console.error('خطأ في إنشاء المشروع:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ في إنشاء المشروع' },
      { status: 500 }
    );
  }
}
