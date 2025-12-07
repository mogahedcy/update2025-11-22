import type { Metadata } from 'next';
import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import PortfolioPageClient from './PortfolioPageClient';

export const dynamic = 'force-dynamic';
import StructuredDataScript from '@/components/StructuredDataScript';
import VideoObjectSchema from '@/components/VideoObjectSchema';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppWidget from '@/components/WhatsAppWidget';
import FloatingCallButton from '@/components/FloatingCallButton';
import BottomNavigation from '@/components/BottomNavigation';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === 'ar';
  
  return {
    title: isArabic ? 'معرض أعمالنا | محترفين الديار العالمية' : 'Our Portfolio | Aldeyar Global Professionals',
    description: isArabic 
      ? 'تصفح معرض أعمالنا المتميز في جدة. أكثر من 5000 مشروع ناجح في المظلات، البرجولات، السواتر، ساندوتش بانل، تنسيق الحدائق، والترميم. اكتشف جودة العمل والإبداع في التصميم.'
      : 'Browse our distinguished portfolio in Jeddah. Over 5000 successful projects in shades, pergolas, fences, sandwich panels, landscaping, and renovations. Discover quality work and creative design.',
    keywords: isArabic
      ? 'معرض أعمال, مشاريع مظلات جدة, برجولات جدة, سواتر جدة, ساندوتش بانل, تنسيق حدائق, ترميم, محترفين الديار العالمية, مشاريع سابقة, تصاميم مظلات, تصاميم برجولات, أعمالنا السابقة, معرض صور, معرض فيديو, مشاريع منفذة, مظلات سيارات جدة, برجولات خشبية جدة, سواتر حديد جدة, أفضل مشاريع المظلات, تركيبات مظلات احترافية, أعمال البرجولات, تنفيذ مظلات, مشاريع مميزة, قبل وبعد, شهادات العملاء, تقييمات المشاريع, مشاريع الفلل, مشاريع الحدائق, أعمال حدائق منزلية, مظلات خارجية, برجولات فاخرة, معرض أعمال شامل, أمثلة المشاريع, نماذج أعمال, صور تنفيذ مظلات, فيديو تركيب برجولات, مشاريع ناجحة, أعمال عالية الجودة, تصاميم إبداعية, خبرة 15 عام, مشاريع جدة, مشاريع السعودية, أعمال متميزة, portfolio jeddah, شركة مظلات موثوقة'
      : 'portfolio, jeddah shades projects, jeddah pergolas, jeddah fences, sandwich panel, landscaping, renovation, aldeyar global professionals, previous projects, shade designs, pergola designs, our previous work, photo gallery, video gallery, completed projects, car shades jeddah, wooden pergolas jeddah, metal fences jeddah, best shade projects, professional shade installations, pergola work, shade implementation, featured projects, before and after, customer testimonials, project ratings, villa projects, garden projects, home garden works, outdoor shades, luxury pergolas, comprehensive portfolio, project examples, work samples, shade installation photos, pergola installation video, successful projects, high quality work, creative designs, 15 years experience, jeddah projects, saudi projects, distinguished work, portfolio jeddah, reliable shade company',
    authors: [{ name: isArabic ? 'محترفين الديار العالمية' : 'Aldeyar Global Professionals' }],
    creator: isArabic ? 'محترفين الديار العالمية' : 'Aldeyar Global Professionals',
    publisher: isArabic ? 'محترفين الديار العالمية' : 'Aldeyar Global Professionals',
    robots: 'index, follow',
    openGraph: {
      title: isArabic ? 'معرض أعمال محترفين الديار العالمية - مشاريع مميزة في جدة' : 'Aldeyar Global Portfolio - Featured Projects in Jeddah',
      description: isArabic ? 'اكتشف أعمالنا المتميزة في المظلات والبرجولات والسواتر وجميع خدماتنا في جدة' : 'Discover our distinguished work in shades, pergolas, fences and all our services in Jeddah',
      url: `https://www.aldeyarksa.tech/${locale}/portfolio`,
      siteName: isArabic ? 'محترفين الديار العالمية' : 'Aldeyar Global Professionals',
      images: [
        {
          url: 'https://www.aldeyarksa.tech/uploads/mazallat-1.webp',
          width: 1200,
          height: 630,
          alt: isArabic ? 'معرض أعمال محترفين الديار العالمية' : 'Aldeyar Global Professionals Portfolio'
        }
      ],
      locale: isArabic ? 'ar_SA' : 'en_US',
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: isArabic ? 'معرض أعمال محترفين الديار العالمية' : 'Aldeyar Global Professionals Portfolio',
      description: isArabic ? 'اكتشف مشاريعنا المتميزة في جدة' : 'Discover our featured projects in Jeddah',
      images: ['https://www.aldeyarksa.tech/uploads/mazallat-1.webp']
    },
    alternates: {
      canonical: `/${locale}/portfolio`,
      languages: {
        'ar': '/ar/portfolio',
        'en': '/en/portfolio',
        'x-default': '/ar/portfolio'
      }
    }
  };
}

// البيانات المنظمة للصفحة
const portfolioStructuredData = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "معرض أعمال محترفين الديار العالمية",
  "description": "مجموعة شاملة من مشاريعنا المتميزة في جدة",
  "url": "https://www.aldeyarksa.tech/portfolio",
  "mainEntity": {
    "@type": "ItemList",
    "name": "مشاريع محترفين الديار العالمية",
    "description": "قائمة بأهم مشاريعنا في المظلات والبرجولات والسواتر",
    "numberOfItems": "5000+",
    "itemListElement": [
      {
        "@type": "Service",
        "name": "مظلات السيارات",
        "description": "تصميم وتركيب مظلات سيارات عالية الجودة"
      },
      {
        "@type": "Service", 
        "name": "البرجولات الخشبية",
        "description": "برجولات خشبية فاخرة للحدائق والمساحات الخارجية"
      },
      {
        "@type": "Service",
        "name": "السواتر المعدنية",
        "description": "سواتر معدنية للخصوصية والحماية"
      }
    ]
  },
  "provider": {
    "@type": "Organization",
    "name": "محترفين الديار العالمية",
    "url": "https://www.aldeyarksa.tech",
    "logo": "https://www.aldeyarksa.tech/logo.png"
  }
};

export default async function PortfolioPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  
  return (
    <>
      <StructuredDataScript data={portfolioStructuredData} />
      <VideoObjectSchema 
        name={locale === 'ar' ? "جولة في معرض أعمال محترفين الديار - مشاريع المظلات والبرجولات" : "Tour of Aldeyar Global Portfolio - Shades and Pergolas Projects"}
        description={locale === 'ar' ? "شاهد أفضل مشاريعنا المنجزة في جدة من مظلات سيارات وبرجولات وسواتر بجودة عالية" : "Watch our best completed projects in Jeddah from car shades, pergolas and fences in high quality"}
        thumbnailUrl="https://www.aldeyarksa.tech/uploads/mazallat-1.webp"
        uploadDate={new Date().toISOString()}
        duration="PT3M"
      />
      <Navbar />
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">{locale === 'ar' ? 'جاري تحميل معرض الأعمال...' : 'Loading portfolio...'}</p>
          </div>
        </div>
      }>
        <PortfolioPageClient />
      </Suspense>
      <Footer />
      <WhatsAppWidget />
      <FloatingCallButton />
      <BottomNavigation />
    </>
  );
}