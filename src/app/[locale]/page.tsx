import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { getTranslations } from 'next-intl/server';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import ServicesSection from '@/components/ServicesSection';
import WhyChooseUsSection from '@/components/WhyChooseUsSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import FAQSection from '@/components/FAQSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import Footer from '@/components/Footer';
import HomePageBreadcrumb from '@/components/HomePageBreadcrumb';
import ReviewSchema from '@/components/ReviewSchema';
import SearchActionSchema from '@/components/SearchActionSchema';
import HowToSchema from '@/components/HowToSchema';
import ProductSchema from '@/components/ProductSchema';
import OrganizationSchema from '@/components/OrganizationSchema';
import WebSiteSchema from '@/components/WebSiteSchema';

const PortfolioSection = dynamic(() => import('@/components/PortfolioSection'), {
  loading: () => <div className="min-h-[400px] animate-pulse bg-gray-100" />,
  ssr: true
});

const StickyWhatsApp = dynamic(() => import('@/components/StickyWhatsApp'));

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === 'ar';

  return {
    title: isArabic 
      ? 'مظلات وسواتر جدة | محترفين الديار - ضمان 10 سنوات'
      : 'Shades and Fences Jeddah | Aldeyar Professionals - 10 Year Warranty',
    description: isArabic
      ? 'شركة محترفين الديار العالمية - تركيب مظلات سيارات، برجولات، سواتر، ساندوتش بانل، تنسيق حدائق، بيوت شعر بجدة. خبرة 15 عام، ضمان 10 سنوات.'
      : 'Aldeyar Global Professionals - Installing car shades, pergolas, fences, sandwich panels, landscaping, traditional houses in Jeddah. 15 years experience, 10 year warranty.',
    alternates: {
      canonical: locale === 'ar' ? '/' : '/en',
      languages: {
        'ar': '/',
        'en': '/en',
        'x-default': '/',
      },
    },
    openGraph: {
      title: isArabic 
        ? 'مظلات وسواتر جدة | محترفين الديار - ضمان 10 سنوات'
        : 'Shades and Fences Jeddah | Aldeyar Professionals',
      description: isArabic
        ? 'محترفين الديار العالمية - تركيب مظلات سيارات، برجولات، سواتر في جدة. خبرة 15 عام، ضمان 10 سنوات'
        : 'Aldeyar Global Professionals - Installing car shades, pergolas, fences in Jeddah. 15 years experience',
      url: `https://www.aldeyarksa.tech${locale === 'en' ? '/en' : ''}`,
      siteName: isArabic ? 'محترفين الديار العالمية' : 'Aldeyar Global Professionals',
      locale: isArabic ? 'ar_SA' : 'en_US',
      type: 'website',
      images: [
        {
          url: 'https://www.aldeyarksa.tech/images/hero-bg.webp',
          width: 1200,
          height: 630,
          alt: isArabic ? 'محترفين الديار العالمية' : 'Aldeyar Global Professionals',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: isArabic 
        ? 'مظلات وسواتر جدة | محترفين الديار'
        : 'Shades and Fences Jeddah | Aldeyar',
      description: isArabic
        ? 'تركيب مظلات سيارات، برجولات، سواتر في جدة'
        : 'Installing car shades, pergolas, fences in Jeddah',
      images: ['https://www.aldeyarksa.tech/images/hero-bg.webp'],
    },
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isArabic = locale === 'ar';
  
  return (
    <>
      <OrganizationSchema locale={locale} />
      <WebSiteSchema locale={locale} />
      <HomePageBreadcrumb locale={locale} />
      <ReviewSchema 
        serviceName={isArabic ? "مظلات وبرجولات وسواتر جدة - محترفين الديار العالمية" : "Shades, Pergolas and Fences Jeddah - Aldeyar Global"}
        itemType="LocalBusiness"
        serviceUrl="https://www.aldeyarksa.tech"
        aggregateRating={{ ratingValue: 4.9, reviewCount: 287 }}
      />
      <SearchActionSchema />
      <HowToSchema 
        name={isArabic ? "كيفية تركيب مظلات السيارات" : "How to Install Car Shades"}
        description={isArabic ? "دليل شامل لتركيب مظلات السيارات بطريقة احترافية" : "Complete guide to professionally installing car shades"}
        totalTime="P1D"
        steps={isArabic ? [
          {
            name: "الاستشارة والمعاينة",
            text: "نقوم بزيارة الموقع وأخذ القياسات الدقيقة وتحديد نوع المظلة المناسب"
          },
          {
            name: "التصميم والتخطيط",
            text: "نقدم تصميم ثلاثي الأبعاد للمظلة ونختار الخامات الأفضل جودة"
          },
          {
            name: "تجهيز الموقع",
            text: "نجهز القواعد الخرسانية والأعمدة الحديدية بمقاسات مدروسة"
          },
          {
            name: "التركيب والتشطيب",
            text: "نركب الهيكل المعدني ونشد القماش بطريقة احترافية"
          }
        ] : [
          {
            name: "Consultation and Inspection",
            text: "We visit the site, take accurate measurements, and determine the appropriate shade type"
          },
          {
            name: "Design and Planning",
            text: "We provide 3D design for the shade and select the best quality materials"
          },
          {
            name: "Site Preparation",
            text: "We prepare concrete foundations and iron columns with calculated dimensions"
          },
          {
            name: "Installation and Finishing",
            text: "We install the metal frame and professionally stretch the fabric"
          }
        ]}
      />
      <ProductSchema 
        name={isArabic ? "مظلات سيارات PVC - جودة عالمية" : "PVC Car Shades - Global Quality"}
        description={isArabic 
          ? "مظلات سيارات من خامات PVC عالمية، مقاومة للحرارة والأمطار، بضمان 10 سنوات"
          : "Car shades made of global PVC materials, heat and rain resistant, with 10 year warranty"}
        image="https://www.aldeyarksa.tech/images/services/car-shades.webp"
        price="2500.00"
        currency="SAR"
        rating={{ ratingValue: 4.9, reviewCount: 287 }}
        sku="CAR-SHADE-PVC-001"
        brand={isArabic ? "محترفين الديار العالمية" : "Aldeyar Global Professionals"}
      />
      <Navbar />
      <HeroSection />
      <ServicesSection />
      <WhyChooseUsSection />
      <HowItWorksSection />
      <PortfolioSection />
      <TestimonialsSection />
      <FAQSection />
      <StickyWhatsApp />
      <Footer />
    </>
  );
}
