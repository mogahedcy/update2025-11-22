'use client';

import Script from 'next/script';

interface WebSiteSchemaProps {
  locale?: string;
}

export default function WebSiteSchema({ locale = 'ar' }: WebSiteSchemaProps) {
  const isArabic = locale === 'ar';
  
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": isArabic ? "محترفين الديار العالمية" : "Aldeyar Global Professionals",
    "alternateName": isArabic ? "الديار للمظلات" : "Aldeyar Shades",
    "url": "https://www.aldeyarksa.tech",
    "description": isArabic
      ? "موقع شركة محترفين الديار العالمية المتخصصة في تركيب المظلات، البرجولات، السواتر، وتنسيق الحدائق في جدة"
      : "Aldeyar Global Professionals website specializing in shades, pergolas, fences, and landscaping in Jeddah",
    "inLanguage": [isArabic ? "ar-SA" : "en-US", isArabic ? "en-US" : "ar-SA"],
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://www.aldeyarksa.tech/search?q={search_term_string}"
      },
      "query-input": {
        "@type": "PropertyValueSpecification",
        "valueRequired": true,
        "valueName": "search_term_string"
      }
    },
    "publisher": {
      "@type": "Organization",
      "name": isArabic ? "محترفين الديار العالمية" : "Aldeyar Global Professionals",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.aldeyarksa.tech/images/logo.png",
        "width": 1024,
        "height": 1024
      }
    },
    "copyrightHolder": {
      "@type": "Organization",
      "name": isArabic ? "محترفين الديار العالمية" : "Aldeyar Global Professionals"
    },
    "copyrightYear": 2010,
    "author": {
      "@type": "Organization",
      "name": isArabic ? "محترفين الديار العالمية" : "Aldeyar Global Professionals"
    }
  };

  return (
    <Script
      id="website-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      strategy="afterInteractive"
    />
  );
}
