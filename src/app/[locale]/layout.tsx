import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import StructuredDataScript from "@/components/StructuredDataScript";
import { WebVitals } from "../web-vitals";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import LocalBusinessSchema from "@/components/LocalBusinessSchema";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import BottomNavigation from "@/components/BottomNavigation";
import FloatingCallButton from "@/components/FloatingCallButton";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  
  const isArabic = locale === 'ar';
  
  return {
    metadataBase: new URL('https://www.aldeyarksa.tech'),
    title: {
      default: isArabic 
        ? "محترفين الديار العالمية | أفضل مظلات وبرجولات جدة - خبرة 15 عام"
        : "Aldeyar Global Professionals | Best Shades & Pergolas in Jeddah - 15 Years Experience",
      template: isArabic ? "%s | محترفين الديار العالمية" : "%s | Aldeyar Global Professionals"
    },
    description: isArabic
      ? "الشركة الرائدة في جدة لتركيب المظلات والبرجولات والسواتر. خبرة 15 عاماً، ضمان 10 سنوات، تركيب احترافي، أسعار منافسة."
      : "The leading company in Jeddah for installing shades, pergolas, and fences. 15 years of experience, 10-year warranty, professional installation, competitive prices.",
    keywords: isArabic
      ? "مظلات سيارات جدة، برجولات خشبية جدة، سواتر خصوصية جدة، محترفين الديار العالمية"
      : "car shades jeddah, wooden pergolas jeddah, privacy fences jeddah, aldeyar global professionals",
    authors: [{ name: isArabic ? "محترفين الديار العالمية" : "Aldeyar Global Professionals" }],
    robots: "index, follow",
    alternates: {
      canonical: locale === 'ar' ? '/' : '/en',
      languages: {
        "ar": "/",
        "en": "/en",
        "x-default": "/",
      },
    },
    openGraph: {
      title: isArabic 
        ? "محترفين الديار العالمية - خدمات شاملة في جدة"
        : "Aldeyar Global Professionals - Comprehensive Services in Jeddah",
      description: isArabic
        ? "شركة متخصصة في المظلات، البرجولات، السواتر، وتنسيق الحدائق في جدة"
        : "Specialized company in shades, pergolas, fences, and landscaping in Jeddah",
      url: "https://www.aldeyarksa.tech",
      siteName: isArabic ? "محترفين الديار العالمية" : "Aldeyar Global Professionals",
      locale: isArabic ? "ar_SA" : "en_US",
      type: "website",
      images: [
        {
          url: "https://www.aldeyarksa.tech/images/slider1.webp",
          width: 1200,
          height: 630,
          alt: isArabic ? "محترفين الديار العالمية - مظلات وبرجولات جدة" : "Aldeyar Global - Shades and Pergolas Jeddah",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: isArabic ? "محترفين الديار العالمية" : "Aldeyar Global Professionals",
      description: isArabic 
        ? "خدمات شاملة في المظلات والبرجولات والسواتر في جدة"
        : "Comprehensive services in shades, pergolas, and fences in Jeddah",
      images: ["https://www.aldeyarksa.tech/images/slider1.webp"],
    },
    icons: {
      icon: [
        { url: "/favicon.ico", type: "image/x-icon" },
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" }
      ],
      shortcut: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
    manifest: "/manifest.json",
  };
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const faqPageSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "ما هي الخدمات التي تقدمها شركة محترفين الديار؟",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "نقدم 8 خدمات متخصصة شاملة: مظلات سيارات، برجولات حدائق، سواتر خصوصية، ساندوتش بانل، ترميم ملحقات، تنسيق حدائق، بيوت شعر تراثية، وخيام ملكية."
      }
    },
    {
      "@type": "Question",
      "name": "كم تبلغ مدة الضمان على مظلات السيارات؟",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "نقدم ضمان شامل لمدة 10 سنوات على جميع مظلات السيارات، يشمل الهيكل المعدني والقماش والتركيب."
      }
    }
  ]
};

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  const isEnglish = locale === 'en';

  return (
    <NextIntlClientProvider messages={messages}>
      {isEnglish && (
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.lang='en';document.documentElement.dir='ltr';document.body.style.direction='ltr';document.body.style.textAlign='left';`
          }}
        />
      )}
      <StructuredDataScript data={faqPageSchema} />
      <LocalBusinessSchema locale={locale} />
      <GoogleAnalytics />
      <ServiceWorkerRegister />
      <WebVitals />
      {children}
      <WhatsAppWidget />
      <FloatingCallButton />
      <BottomNavigation />
    </NextIntlClientProvider>
  );
}
