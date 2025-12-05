import type { Metadata } from 'next';
import { Noto_Sans_Arabic, Inter } from "next/font/google";
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import "../globals.css";
import ClientBody from "../ClientBody";
import StructuredDataScript from "@/components/StructuredDataScript";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import BottomNavigation from "@/components/BottomNavigation";
import FloatingCallButton from "@/components/FloatingCallButton";
import { WebVitals } from "../web-vitals";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import LocalBusinessSchema from "@/components/LocalBusinessSchema";
import { ThemeProvider } from "@/components/theme-provider";

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  display: 'swap',
  preload: true,
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: 'swap',
  preload: true,
});

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
        { url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
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
  const isRTL = locale === 'ar';
  const fontClass = isRTL ? notoSansArabic.variable : `${notoSansArabic.variable} ${inter.variable}`;

  return (
    <html lang={locale} dir={isRTL ? 'rtl' : 'ltr'} data-scroll-behavior="smooth" className={fontClass}>
      <head>
        <meta name="theme-color" content="#059669" />
        <meta name="google-site-verification" content="Ne3Na-oIDWC4Bg9C4hlb9fNtyvJED1iLI5A9fHnVTnc" />
        
        <style dangerouslySetInnerHTML={{__html: `
          :root{--background:40 25% 98%;--foreground:39 39% 21%;--primary:39 39% 21%;--accent:134 61% 41%;--border:40 35% 85%;--card:40 25% 98%;--card-foreground:39 39% 21%;--radius:0.5rem;}
          *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;border:0 solid hsl(var(--border));}
          html{height:100%;scroll-behavior:smooth;-webkit-text-size-adjust:100%;}
          body{height:100%;background:hsl(var(--background));color:hsl(var(--foreground));line-height:1.7;overflow-x:hidden;}
          img,video,svg{max-width:100%;height:auto;display:block;-webkit-user-select:none;user-select:none;}
          button,input,textarea,select{font:inherit;color:inherit;}
          a{color:inherit;text-decoration:none;}
          .hero-section{min-height:600px;}
        `}} />
        
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        
        <link
          rel="preload"
          as="image"
          href="/images/slider1.webp"
          type="image/webp"
          fetchPriority="high"
        />
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_BASE_URL || 'https://www.aldeyarksa.tech'} />
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_BASE_URL || 'https://www.aldeyarksa.tech'} />
        
        <link rel="prefetch" href="/portfolio" />
        <link rel="prefetch" href="/contact" />
        
        <StructuredDataScript data={faqPageSchema} />
        <LocalBusinessSchema locale={locale} />
      </head>
      <body className={`antialiased ${isRTL ? 'font-arabic' : 'font-sans'} pb-16 lg:pb-0`} suppressHydrationWarning={true}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider defaultTheme="light" storageKey="aldeyar-theme">
            <GoogleAnalytics />
            <ServiceWorkerRegister />
            <WebVitals />
            <ClientBody>{children}</ClientBody>
            <WhatsAppWidget />
            <FloatingCallButton />
            <BottomNavigation />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
