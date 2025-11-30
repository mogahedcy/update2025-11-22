import { Metadata } from 'next';

const BASE_URL = 'https://www.aldeyarksa.tech';
const SITE_NAME = 'محترفين الديار العالمية';

// دوال مساعدة للحصول على URL مطلق ونوع الملف
export function getAbsoluteUrl(url: string): string {
  if (!url) return `${BASE_URL}/logo.png`;
  if (url.startsWith('http')) return url;
  return `${BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
}

export function getMediaType(url: string): string {
  if (!url) return 'image/jpeg';
  const ext = url.split('.').pop()?.toLowerCase() || '';
  const imageTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'webp': 'image/webp',
    'gif': 'image/gif'
  };
  const videoTypes: Record<string, string> = {
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'ogg': 'video/ogg',
    'mov': 'video/quicktime'
  };
  return imageTypes[ext] || videoTypes[ext] || 'image/jpeg';
}

interface SEOConfig {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  noindex?: boolean;
}

export function generateCanonicalUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_URL}${cleanPath}`;
}

export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords,
    image = `${BASE_URL}/logo.png`,
    url,
    type = 'website',
    author,
    publishedTime,
    modifiedTime,
    noindex = false
  } = config;

  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const canonicalUrl = url ? generateCanonicalUrl(url) : undefined;

  const metadata: Metadata = {
    title: fullTitle,
    description,
    keywords,
    authors: author ? [{ name: author }] : [{ name: SITE_NAME }],
    robots: noindex ? 'noindex, nofollow' : 'index, follow',
    alternates: canonicalUrl ? {
      canonical: url,
      languages: {
        'ar-SA': url,
        'x-default': url,
      },
    } : undefined,
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: 'ar_SA',
      type,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
    },
  };

  return metadata;
}

export function generateArticleSchema(data: {
  title: string;
  description: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  url: string;
  image?: string;
  keywords?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": data.title,
    "description": data.description,
    "image": data.image || `${BASE_URL}/favicon.svg`,
    "datePublished": data.datePublished,
    "dateModified": data.dateModified || data.datePublished,
    "author": {
      "@type": "Organization",
      "name": data.author,
      "url": BASE_URL
    },
    "publisher": {
      "@type": "Organization",
      "name": SITE_NAME,
      "logo": {
        "@type": "ImageObject",
        "url": `${BASE_URL}/favicon.svg`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": data.url
    },
    ...(data.keywords && { keywords: data.keywords.join(', ') })
  };
}

export function generateServiceSchema(data: {
  name: string;
  description: string;
  areaServed?: string;
  priceRange?: string;
  image?: string;
  url?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": data.name,
    "description": data.description,
    "provider": {
      "@type": "LocalBusiness",
      "name": SITE_NAME,
      "image": data.image || `${BASE_URL}/favicon.svg`,
      "telephone": "+966553719009",
      "email": "ksaaldeyar@gmail.com",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "شارع الأمير سلطان",
        "addressLocality": "جدة",
        "addressRegion": "منطقة مكة المكرمة",
        "postalCode": "21423",
        "addressCountry": "SA"
      }
    },
    "areaServed": {
      "@type": "City",
      "name": data.areaServed || "جدة"
    },
    ...(data.priceRange && {
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": "SAR",
        "price": data.priceRange
      }
    }),
    ...(data.url && { "url": generateCanonicalUrl(data.url) })
  };
}

export function generateProductSchema(data: {
  name: string;
  description: string;
  image?: string[];
  category?: string;
  brand?: string;
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": data.name,
    "description": data.description,
    "image": data.image || [`${BASE_URL}/favicon.svg`],
    "brand": {
      "@type": "Organization",
      "name": data.brand || SITE_NAME
    },
    ...(data.category && { "category": data.category }),
    ...(data.aggregateRating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": data.aggregateRating.ratingValue,
        "reviewCount": data.aggregateRating.reviewCount,
        "bestRating": "5",
        "worstRating": "1"
      }
    })
  };
}

export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

export function generateReviewSchema(reviews: Array<{
  author: string;
  rating: number;
  reviewBody: string;
  datePublished: string;
}>) {
  return reviews.map((review) => ({
    "@context": "https://schema.org",
    "@type": "Review",
    "author": {
      "@type": "Person",
      "name": review.author
    },
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": review.rating,
      "bestRating": "5",
      "worstRating": "1"
    },
    "reviewBody": review.reviewBody,
    "datePublished": review.datePublished
  }));
}

export function generateImageObjectSchema(images: Array<{
  url: string;
  caption?: string;
  width?: number;
  height?: number;
}>) {
  return images.map((img) => ({
    "@type": "ImageObject",
    "url": img.url,
    "caption": img.caption,
    ...(img.width && { "width": img.width }),
    ...(img.height && { "height": img.height })
  }));
}

export function generateVideoObjectSchema(videos: Array<{
  name: string;
  description: string;
  contentUrl: string;
  thumbnailUrl?: string;
  uploadDate?: string;
  duration?: string;
  embedUrl?: string;
}>) {
  const BASE_URL = 'https://www.aldeyarksa.tech';
  
  return videos.map((video) => ({
    "@type": "VideoObject",
    "name": video.name,
    "description": video.description,
    "contentUrl": video.contentUrl,
    "embedUrl": video.embedUrl || video.contentUrl,
    "thumbnailUrl": video.thumbnailUrl || `${BASE_URL}/favicon.svg`,
    "uploadDate": video.uploadDate || new Date().toISOString(),
    "publisher": {
      "@type": "Organization",
      "name": "محترفين الديار العالمية",
      "logo": {
        "@type": "ImageObject",
        "url": `${BASE_URL}/favicon.svg`
      }
    },
    ...(video.duration && { "duration": video.duration }),
    "inLanguage": "ar",
    "regionsAllowed": "SA"
  }));
}

export function generateCreativeWorkSchema(data: {
  name: string;
  description: string;
  url: string;
  category?: string;
  location?: string;
  dateCreated?: string;
  dateModified?: string;
  images?: Array<{ url: string; caption?: string; alt?: string; id?: string }>;
  videos?: Array<{ 
    name: string; 
    description: string; 
    contentUrl: string; 
    embedUrl?: string;
    uploadDate?: string; 
    thumbnailUrl?: string;
    duration?: string;
    id?: string;
  }>;
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
  reviews?: Array<{
    author: string;
    rating: number;
    reviewBody: string;
    datePublished: string;
  }>;
}) {
  const pageUrl = generateCanonicalUrl(data.url);
  
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": pageUrl,
    "name": data.name,
    "description": data.description,
    "url": pageUrl,
    "inLanguage": "ar",
    "creator": {
      "@type": "Organization",
      "name": SITE_NAME,
      "url": BASE_URL,
      "telephone": "+966553719009",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "جدة",
        "addressCountry": "SA"
      }
    },
    "publisher": {
      "@type": "Organization",
      "name": SITE_NAME,
      "logo": {
        "@type": "ImageObject",
        "url": `${BASE_URL}/favicon.svg`
      }
    },
    ...(data.dateCreated && { "dateCreated": data.dateCreated }),
    ...(data.dateModified && { "dateModified": data.dateModified }),
    ...(data.location && {
      "locationCreated": {
        "@type": "Place",
        "name": data.location,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": data.location,
          "addressCountry": "SA"
        }
      }
    }),
    ...(data.category && { "category": data.category }),
    ...(data.images && data.images.length > 0 && {
      "image": data.images.map((img, index) => ({
        "@type": "ImageObject",
        "@id": `${pageUrl}#image-${img.id || index + 1}`,
        "url": img.url,
        "caption": img.caption || data.name,
        "name": img.caption || `${data.name} - صورة ${index + 1}`,
        "description": img.alt || img.caption || data.name,
        "contentUrl": img.url,
        "license": `${BASE_URL}/terms`,
        "acquireLicensePage": `${BASE_URL}/contact`,
        "creditText": "محترفين الديار العالمية - جدة، السعودية",
        "creator": {
          "@type": "Organization",
          "name": SITE_NAME
        },
        "copyrightNotice": "© محترفين الديار العالمية - جميع الحقوق محفوظة"
      }))
    }),
    ...(data.videos && data.videos.length > 0 && {
      "video": data.videos.map((video, index) => ({
        "@type": "VideoObject",
        "@id": `${pageUrl}#video-${video.id || index + 1}`,
        "name": video.name,
        "description": video.description,
        "contentUrl": video.contentUrl,
        "embedUrl": video.embedUrl || pageUrl,
        "thumbnailUrl": video.thumbnailUrl || `${BASE_URL}/favicon.svg`,
        "uploadDate": video.uploadDate || data.dateCreated || new Date().toISOString(),
        "publisher": {
          "@type": "Organization",
          "name": SITE_NAME,
          "logo": {
            "@type": "ImageObject",
            "url": `${BASE_URL}/favicon.svg`
          }
        },
        "inLanguage": "ar",
        "regionsAllowed": "SA",
        ...(video.duration && { "duration": video.duration })
      }))
    }),
    ...(data.aggregateRating && data.aggregateRating.reviewCount > 0 && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": data.aggregateRating.ratingValue,
        "reviewCount": data.aggregateRating.reviewCount,
        "bestRating": "5",
        "worstRating": "1"
      }
    }),
    ...(data.reviews && data.reviews.length > 0 && {
      "review": data.reviews.map((review, index) => ({
        "@type": "Review",
        "@id": `${pageUrl}#review-${index + 1}`,
        "author": {
          "@type": "Person",
          "name": review.author
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": review.rating,
          "bestRating": "5",
          "worstRating": "1"
        },
        "reviewBody": review.reviewBody,
        "datePublished": review.datePublished,
        "inLanguage": "ar",
        "itemReviewed": {
          "@type": "CreativeWork",
          "@id": pageUrl,
          "name": data.name
        }
      }))
    })
  };
}

export function generateAggregateRatingSchema(data: {
  ratingValue: number;
  reviewCount: number;
  bestRating?: number;
  worstRating?: number;
}) {
  return {
    "@type": "AggregateRating",
    "ratingValue": data.ratingValue,
    "reviewCount": data.reviewCount,
    "bestRating": data.bestRating || 5,
    "worstRating": data.worstRating || 1
  };
}

export function generateImageGallerySchema(data: {
  name: string;
  description: string;
  url: string;
  images: Array<{
    url: string;
    caption?: string;
    alt?: string;
    width?: number;
    height?: number;
  }>;
  category?: string;
  location?: string;
  dateCreated?: string;
  dateModified?: string;
}) {
  const pageUrl = generateCanonicalUrl(data.url);
  
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${pageUrl}#gallery`,
    "name": data.name,
    "description": data.description,
    "url": pageUrl,
    "numberOfItems": data.images.length,
    "itemListOrder": "https://schema.org/ItemListOrderAscending",
    "itemListElement": data.images.map((img, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "ImageObject",
        "@id": `${pageUrl}#image-${index + 1}`,
        "url": img.url,
        "contentUrl": img.url,
        "name": img.caption || `${data.name} - صورة ${index + 1}`,
        "description": img.alt || img.caption || data.name,
        "caption": img.caption || `${data.name} - صورة ${index + 1}`,
        ...(img.width && { "width": { "@type": "QuantitativeValue", "value": img.width, "unitCode": "E37" } }),
        ...(img.height && { "height": { "@type": "QuantitativeValue", "value": img.height, "unitCode": "E37" } }),
        "license": `${BASE_URL}/terms`,
        "acquireLicensePage": `${BASE_URL}/contact`,
        "creditText": `محترفين الديار العالمية - ${data.location || 'جدة'}`,
        "copyrightNotice": "© محترفين الديار العالمية",
        "creator": {
          "@type": "Organization",
          "name": SITE_NAME,
          "url": BASE_URL
        },
        "copyrightHolder": {
          "@type": "Organization",
          "name": SITE_NAME
        }
      }
    })),
    ...(data.location && {
      "about": {
        "@type": "Place",
        "name": data.location,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": data.location,
          "addressCountry": "SA"
        }
      }
    }),
    "author": {
      "@type": "Organization",
      "name": SITE_NAME,
      "url": BASE_URL
    }
  };
}

export function generateProjectSchema(data: {
  name: string;
  description: string;
  url: string;
  category: string;
  location: string;
  dateCreated?: string;
  dateModified?: string;
  images: Array<{
    url: string;
    caption?: string;
    alt?: string;
  }>;
  videos?: Array<{
    url: string;
    name?: string;
    description?: string;
    thumbnailUrl?: string;
  }>;
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
}) {
  const pageUrl = generateCanonicalUrl(data.url);
  
  return {
    "@context": "https://schema.org",
    "@type": ["CreativeWork", "VisualArtwork"],
    "@id": pageUrl,
    "name": data.name,
    "headline": data.name,
    "description": data.description,
    "url": pageUrl,
    "inLanguage": "ar",
    "genre": data.category,
    "artform": data.category,
    "artworkSurface": data.category,
    ...(data.dateCreated && { 
      "dateCreated": data.dateCreated,
      "datePublished": data.dateCreated
    }),
    ...(data.dateModified && { "dateModified": data.dateModified }),
    "locationCreated": {
      "@type": "Place",
      "name": data.location,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": data.location,
        "addressRegion": "منطقة مكة المكرمة",
        "addressCountry": "SA"
      }
    },
    "creator": {
      "@type": "Organization",
      "name": SITE_NAME,
      "url": BASE_URL,
      "telephone": "+966553719009"
    },
    "publisher": {
      "@type": "Organization",
      "name": SITE_NAME,
      "logo": {
        "@type": "ImageObject",
        "url": `${BASE_URL}/favicon.svg`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": pageUrl
    },
    "image": data.images.map((img, index) => ({
      "@type": "ImageObject",
      "@id": `${pageUrl}#image-${index + 1}`,
      "url": img.url,
      "contentUrl": img.url,
      "name": img.caption || `${data.name} - صورة ${index + 1}`,
      "description": img.alt || `${data.category} في ${data.location} - صورة ${index + 1}`,
      "caption": img.caption || `مشروع ${data.name} - ${data.category}`,
      "representativeOfPage": index === 0,
      "license": `${BASE_URL}/terms`,
      "creditText": "محترفين الديار العالمية"
    })),
    ...(data.videos && data.videos.length > 0 && {
      "video": data.videos.map((video, index) => ({
        "@type": "VideoObject",
        "@id": `${pageUrl}#video-${index + 1}`,
        "name": video.name || `${data.name} - فيديو ${index + 1}`,
        "description": video.description || `فيديو مشروع ${data.name}`,
        "contentUrl": video.url,
        "thumbnailUrl": video.thumbnailUrl || `${BASE_URL}/favicon.svg`,
        "uploadDate": data.dateCreated || new Date().toISOString()
      }))
    }),
    ...(data.aggregateRating && data.aggregateRating.reviewCount > 0 && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": data.aggregateRating.ratingValue,
        "reviewCount": data.aggregateRating.reviewCount,
        "bestRating": 5,
        "worstRating": 1
      }
    }),
    "isAccessibleForFree": true,
    "copyrightHolder": {
      "@type": "Organization",
      "name": SITE_NAME
    }
  };
}

export function generateOpenGraphMetadata(data: {
  title: string;
  description: string;
  url: string;
  type?: 'website' | 'article';
  image?: string;
  imageAlt?: string;
  publishedTime?: string;
  modifiedTime?: string;
}) {
  return {
    title: data.title,
    description: data.description,
    url: generateCanonicalUrl(data.url),
    siteName: SITE_NAME,
    locale: 'ar_SA',
    type: data.type || 'website',
    images: [
      {
        url: data.image || `${BASE_URL}/favicon.svg`,
        width: 1200,
        height: 630,
        alt: data.imageAlt || data.title,
      },
    ],
    ...(data.publishedTime && { publishedTime: data.publishedTime }),
    ...(data.modifiedTime && { modifiedTime: data.modifiedTime }),
  };
}

export function generateTwitterMetadata(data: {
  title: string;
  description: string;
  image?: string;
}) {
  return {
    card: 'summary_large_image' as const,
    title: data.title,
    description: data.description,
    images: [data.image || `${BASE_URL}/favicon.svg`],
  };
}

export function generateRobotsMetadata(options?: {
  index?: boolean;
  follow?: boolean;
  maxImagePreview?: 'none' | 'standard' | 'large';
  maxSnippet?: number;
  maxVideoPreview?: number;
}) {
  const {
    index = true,
    follow = true,
    maxImagePreview = 'large',
    maxSnippet = -1,
    maxVideoPreview = -1
  } = options || {};

  return {
    index,
    follow,
    googleBot: {
      index,
      follow,
      'max-image-preview': maxImagePreview,
      'max-snippet': maxSnippet,
      'max-video-preview': maxVideoPreview,
    },
  };
}

export function generateLocalBusinessSchema(data?: {
  name?: string;
  description?: string;
  image?: string;
  priceRange?: string;
  openingHours?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${BASE_URL}/#localbusiness`,
    "name": data?.name || SITE_NAME,
    "description": data?.description || "شركة رائدة في جدة متخصصة في تصميم وتركيب المظلات، البرجولات، السواتر، تنسيق الحدائق وبيوت الشعر. نقدم خدمات عالية الجودة مع ضمان شامل وأسعار منافسة.",
    "image": data?.image || `${BASE_URL}/favicon.svg`,
    "url": BASE_URL,
    "telephone": "+966553719009",
    "email": "ksaaldeyar@gmail.com",
    "priceRange": data?.priceRange || "$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "شارع الأمير سلطان",
      "addressLocality": "جدة",
      "addressRegion": "منطقة مكة المكرمة",
      "postalCode": "21423",
      "addressCountry": "SA"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 21.4858,
      "longitude": 39.1925
    },
    "openingHoursSpecification": data?.openingHours || [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday"
        ],
        "opens": "00:00",
        "closes": "23:59"
      }
    ],
    "areaServed": {
      "@type": "City",
      "name": "جدة",
      "containedInPlace": {
        "@type": "AdministrativeArea",
        "name": "منطقة مكة المكرمة"
      }
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "خدمات محترفين الديار العالمية",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "مظلات السيارات",
            "description": "تصميم وتركيب مظلات سيارات عالية الجودة - مظلات لكسان، حديد، قماش PVC"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "البرجولات",
            "description": "برجولات خشبية وحديدية وألومنيوم للحدائق والمساحات الخارجية"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "السواتر",
            "description": "سواتر حديد، قماش، خشبية للخصوصية والحماية من الشمس"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "ساندوتش بانل",
            "description": "تركيب ساندوتش بانل عازل للحرارة والصوت - غرف، ملاحق، مستودعات"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "تنسيق الحدائق",
            "description": "تصميم وتنسيق حدائق منزلية احترافية بأحدث الأساليب"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "بيوت الشعر",
            "description": "تفصيل وتركيب بيوت شعر تراثية فاخرة للمجالس والجلسات"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "الخيام الملكية",
            "description": "تصنيع وتركيب خيام ملكية فخمة للمناسبات والجلسات الخارجية"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "ترميم وصيانة",
            "description": "ترميم وصيانة المظلات، البرجولات، الملحقات والمباني"
          }
        }
      ]
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "127",
      "bestRating": "5",
      "worstRating": "1"
    },
    "sameAs": [
      "https://www.facebook.com/aldeyarksa",
      "https://www.instagram.com/aldeyarksa",
      "https://twitter.com/aldeyarksa"
    ]
  };
}

export function generateOrganizationSchema(data?: {
  name?: string;
  description?: string;
  logo?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${BASE_URL}/#organization`,
    "name": data?.name || SITE_NAME,
    "description": data?.description || "محترفين الديار العالمية - شركة رائدة في مجال تركيب المظلات والبرجولات والسواتر في جدة. نقدم خدمات متميزة بأعلى معايير الجودة.",
    "url": BASE_URL,
    "logo": {
      "@type": "ImageObject",
      "url": data?.logo || `${BASE_URL}/favicon.svg`,
      "width": "512",
      "height": "512"
    },
    "image": data?.logo || `${BASE_URL}/favicon.svg`,
    "telephone": "+966553719009",
    "email": "ksaaldeyar@gmail.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "شارع الأمير سلطان",
      "addressLocality": "جدة",
      "addressRegion": "منطقة مكة المكرمة",
      "postalCode": "21423",
      "addressCountry": "SA"
    },
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "+966553719009",
        "contactType": "customer service",
        "email": "ksaaldeyar@gmail.com",
        "areaServed": "SA",
        "availableLanguage": ["Arabic", "English"]
      },
      {
        "@type": "ContactPoint",
        "telephone": "+966553719009",
        "contactType": "sales",
        "email": "ksaaldeyar@gmail.com",
        "areaServed": "SA",
        "availableLanguage": "Arabic"
      }
    ],
    "founder": {
      "@type": "Person",
      "name": "محترفين الديار العالمية"
    },
    "foundingDate": "2010",
    "areaServed": {
      "@type": "City",
      "name": "جدة"
    },
    "sameAs": [
      "https://www.facebook.com/aldeyarksa",
      "https://www.instagram.com/aldeyarksa",
      "https://twitter.com/aldeyarksa"
    ]
  };
}
