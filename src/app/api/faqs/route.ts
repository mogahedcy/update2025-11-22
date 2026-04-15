import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { normalizeCategoryName } from '@/lib/categoryNormalizer';
import {
  buildSeoFields,
  createDeterministicSlug,
  normalizeLongText,
  normalizeStatus,
  normalizeTags,
  normalizeText
} from '@/lib/content-quality';

async function checkAuth() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin-token')?.value;
    
    if (!token) {
      return null;
    }
    
    const decoded = verifyToken(token) as any;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const limit = Number.parseInt(searchParams.get('limit') || '50');

    const where: any = {};
    
    if (status && status !== 'all') {
      where.status = status;
    }
    
    if (category && category !== 'all') {
      const categoryValidation = normalizeCategoryName(category);
      if (categoryValidation.isValid && categoryValidation.normalizedCategory) {
        where.category = categoryValidation.normalizedCategory;
        if (categoryValidation.wasTransformed) {
          console.log(`✅ FAQs GET - تم تحويل الفئة: "${category}" → "${categoryValidation.normalizedCategory}"`);
        }
      } else {
        where.category = category;
      }
    }

    const faqs = await prisma.faqs.findMany({
      where,
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ],
      take: limit
    });

    return NextResponse.json({
      success: true,
      faqs,
      total: faqs.length
    });
  } catch (error: any) {
    console.error('Error fetching FAQs:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await checkAuth();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      question, 
      answer, 
      category, 
      order, 
      featured, 
      status,
      slug,
      metaTitle,
      metaDescription,
      keywords,
      relatedQuestions
    } = body;

    const normalizedQuestion = normalizeText(question, 220);
    const normalizedAnswer = normalizeLongText(answer, 8000);
    const normalizedStatus = normalizeStatus(status, 'DRAFT');
    const normalizedKeywords = normalizeTags(
      typeof keywords === 'string' ? keywords.split(',') : keywords
    );

    if (!normalizedQuestion || !normalizedAnswer || !category) {
      return NextResponse.json(
        { success: false, error: 'الحقول الأساسية مطلوبة (السؤال، الإجابة، التصنيف).' },
        { status: 400 }
      );
    }

    const categoryValidation = normalizeCategoryName(category);
    if (!categoryValidation.isValid || !categoryValidation.normalizedCategory) {
      return NextResponse.json(
        { 
          success: false, 
          error: `الفئة "${category}" غير صالحة. الرجاء اختيار فئة من القائمة المتاحة.` 
        },
        { status: 400 }
      );
    }

    const normalizedCategory = categoryValidation.normalizedCategory;
    
    if (categoryValidation.wasTransformed) {
      console.log(`✅ تم تحويل الفئة: "${category}" → "${normalizedCategory}"`);
    }

    const finalSlug = createDeterministicSlug(slug || normalizedQuestion, 'faq');
    const existingFaq = await prisma.faqs.findFirst({
      where: {
        OR: [{ question: normalizedQuestion }, { slug: finalSlug }]
      },
      select: { id: true }
    });
    if (existingFaq) {
      return NextResponse.json(
        { success: false, error: 'يوجد سؤال مشابه بالفعل، يرجى تعديل الصياغة.' },
        { status: 409 }
      );
    }

    const seo = buildSeoFields({
      title: metaTitle || normalizedQuestion,
      description: normalizedAnswer,
      keywords: normalizedKeywords,
      fallbackKeywords: [normalizedCategory, 'الأسئلة الشائعة', 'ديار جدة العالمية']
    });

    const faq = await prisma.faqs.create({
      data: {
        question: normalizedQuestion,
        answer: normalizedAnswer,
        category: normalizedCategory,
        order: order || 0,
        featured: featured || false,
        status: normalizedStatus,
        slug: finalSlug,
        metaTitle: seo.metaTitle || metaTitle || normalizedQuestion,
        metaDescription: seo.metaDescription || metaDescription || normalizedAnswer.substring(0, 160),
        keywords: seo.keywords || null,
        relatedQuestions: relatedQuestions || null
      }
    });

    return NextResponse.json({
      success: true,
      faq
    });
  } catch (error: any) {
    console.error('Error creating FAQ:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
