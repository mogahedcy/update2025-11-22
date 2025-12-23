import type { Metadata } from 'next';
import NavbarArabic from '@/components/NavbarArabic';
import Footer from '@/components/Footer';
import ReviewsPageClient from './ReviewsPageClient';
import IntlProvider from '@/components/IntlProvider';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'تقييمات ومراجعات العملاء - ديار جدة العالمية',
  description: 'اطلع على تقييمات ومراجعات عملائنا الكرام حول مشاريعنا في تنسيق الحدائق والمظلات والبرجولات',
  keywords: 'تقييمات العملاء, مراجعات المشاريع, آراء العملاء, ديار جدة العالمية',
  openGraph: {
    title: 'تقييمات ومراجعات العملاء - ديار جدة العالمية',
    description: 'اطلع على تقييمات ومراجعات عملائنا الكرام حول مشاريعنا',
    images: ['/images/reviews-hero.jpg'],
    type: 'website',
  },
};

export default function ReviewsPage() {
  return (
    <IntlProvider>
      <div className="min-h-screen flex flex-col">
        <NavbarArabic />
        <main className="flex-1">
          <ReviewsPageClient />
        </main>
        <Footer />
      </div>
    </IntlProvider>
  );
}
