import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.aldeyarksa.tech';

  const staticPages = [
    { 
      url: '', 
      priority: '1.0', 
      changefreq: 'daily',
      keywords: 'مظلات جدة، سواتر، برجولات، تنسيق حدائق، محترفين الديار العالمية'
    },
    { 
      url: '/services/mazallat', 
      priority: '0.9', 
      changefreq: 'daily',
      keywords: 'مظلات سيارات جدة، تركيب مظلات، مظلات حديد، مظلات قماش، أسعار مظلات السيارات، شركة مظلات جدة'
    },
    { 
      url: '/services/pergolas', 
      priority: '0.9', 
      changefreq: 'daily',
      keywords: 'برجولات جدة، تصميم برجولات، برجولات خشبية، برجولات حديد، برجولات حدائق، تركيب برجولات جدة'
    },
    { 
      url: '/services/sawater', 
      priority: '0.9', 
      changefreq: 'daily',
      keywords: 'سواتر جدة، سواتر خصوصية، سواتر حديد، سواتر قماش، تركيب سواتر جدة، أسعار السواتر'
    },
    { 
      url: '/services/sandwich-panel', 
      priority: '0.9', 
      changefreq: 'weekly',
      keywords: 'ساندوتش بانل جدة، عزل حراري، ألواح ساندوتش بانل'
    },
    { 
      url: '/services/renovation', 
      priority: '0.9', 
      changefreq: 'weekly',
      keywords: 'ترميم ملحقات جدة، تجديد ملحقات، شركة ترميم'
    },
    { 
      url: '/services/landscaping', 
      priority: '0.9', 
      changefreq: 'weekly',
      keywords: 'تنسيق حدائق جدة، تصميم حدائق، شركة تنسيق حدائق'
    },
    { 
      url: '/services/byoot-shaar', 
      priority: '0.9', 
      changefreq: 'weekly',
      keywords: 'بيوت شعر جدة، خيام تراثية، بيوت شعر تراثية'
    },
    { 
      url: '/services/khayyam', 
      priority: '0.9', 
      changefreq: 'weekly',
      keywords: 'خيام جدة، خيام ملكية، خيام فاخرة، تأجير خيام'
    },
    { 
      url: '/portfolio', 
      priority: '0.8', 
      changefreq: 'daily',
      keywords: 'أعمال مظلات جدة، مشاريع سواتر، معرض أعمال الديار'
    },
    { 
      url: '/portfolio/reviews', 
      priority: '0.8', 
      changefreq: 'weekly',
      keywords: 'تقييمات العملاء، آراء العملاء، تجارب العملاء جدة'
    },
    { 
      url: '/about', 
      priority: '0.8', 
      changefreq: 'monthly',
      keywords: 'محترفين الديار العالمية، شركة مظلات جدة، عن الشركة'
    },
    { 
      url: '/articles', 
      priority: '0.7', 
      changefreq: 'daily',
      keywords: 'مقالات مظلات، نصائح تركيب، دليل شامل'
    },
    { 
      url: '/contact', 
      priority: '0.8', 
      changefreq: 'monthly',
      keywords: 'اتصل بنا، رقم تليفون، عنوان الشركة جدة'
    },
    { 
      url: '/quote', 
      priority: '0.9', 
      changefreq: 'monthly',
      keywords: 'طلب عرض سعر، احسب التكلفة، أسعار مظلات جدة'
    },
    { 
      url: '/search', 
      priority: '0.7', 
      changefreq: 'monthly',
      keywords: 'بحث في الموقع، البحث عن خدمات'
    },
    { 
      url: '/faq', 
      priority: '0.75', 
      changefreq: 'monthly',
      keywords: 'أسئلة شائعة، الأسئلة المتكررة، استفسارات'
    }
  ];

  let dbArticles: any[] = [];
  
  try {
    dbArticles = await prisma.articles.findMany({
      where: { status: 'PUBLISHED' },
      select: {
        id: true,
        slug: true,
        title: true,
        updatedAt: true,
        keywords: true
      },
      orderBy: { publishedAt: 'desc' }
    });
  } catch (error) {
    console.error('Error fetching articles for sitemap:', error);
  }

  const staticSitemap = staticPages
    .map((page) => `<url><loc>${baseUrl}${page.url}</loc><lastmod>${new Date().toISOString()}</lastmod><changefreq>${page.changefreq}</changefreq><priority>${page.priority}</priority><image:image><image:loc>${baseUrl}/images/logo.png</image:loc><image:caption><![CDATA[${page.keywords}]]></image:caption><image:title><![CDATA[محترفين الديار العالمية - ${page.keywords}]]></image:title></image:image></url>`)
    .join('\n  ');

  const articlesSitemap = dbArticles.length > 0 
    ? dbArticles.map((article) => {
        const articleSlug = article.slug || article.id;
        const encodedSlug = encodeURIComponent(articleSlug);
        const lastModified = article.updatedAt ? new Date(article.updatedAt).toISOString() : new Date().toISOString();
        const keywords = article.keywords || article.title;
        
        return `<url><loc>${baseUrl}/articles/${encodedSlug}</loc><lastmod>${lastModified}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority><news:news><news:publication><news:name>محترفين الديار العالمية</news:name><news:language>ar</news:language></news:publication><news:publication_date>${lastModified}</news:publication_date><news:title><![CDATA[${article.title}]]></news:title><news:keywords><![CDATA[${keywords}]]></news:keywords></news:news></url>`;
      }).join('\n  ')
    : '';

  const sitemapReferences = `<url><loc>${baseUrl}/sitemap-projects.xml</loc><lastmod>${new Date().toISOString()}</lastmod><changefreq>daily</changefreq><priority>0.95</priority></url>
  <url><loc>${baseUrl}/sitemap-articles.xml</loc><lastmod>${new Date().toISOString()}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>
  <url><loc>${baseUrl}/sitemap-images.xml</loc><lastmod>${new Date().toISOString()}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`;

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  ${staticSitemap}
  ${articlesSitemap}
  ${sitemapReferences}
</urlset>`;

  return new Response(sitemap, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=1800, s-maxage=1800, stale-while-revalidate=43200',
      'CDN-Cache-Control': 'max-age=1800',
      'Vercel-CDN-Cache-Control': 'max-age=1800',
      'X-Robots-Tag': 'index, follow, all',
    },
  });
}
