import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { faqId } = body;

    if (!faqId) {
      return NextResponse.json(
        { success: false, error: 'FAQ ID is required' },
        { status: 400 }
      );
    }

    const cookieKey = `faq-view-${faqId}`;
    const alreadyTracked = request.cookies.get(cookieKey)?.value === '1';
    if (alreadyTracked) {
      return NextResponse.json({
        success: true,
        message: 'View already tracked recently',
        deduplicated: true
      });
    }

    await prisma.faqs.update({
      where: { id: faqId },
      data: {
        views: {
          increment: 1
        }
      }
    });

    const response = NextResponse.json({
      success: true,
      message: 'View tracked successfully',
      deduplicated: false
    });
    response.cookies.set(cookieKey, '1', {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/'
    });
    return response;
  } catch (error: any) {
    console.error('Error tracking FAQ view:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
