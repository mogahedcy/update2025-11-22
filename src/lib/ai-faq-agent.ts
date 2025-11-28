import ai, { GROQ_MODEL } from './groq-client';
import { prisma } from './prisma';
import { randomUUID } from 'crypto';

export interface FAQGenerationOptions {
  topic: string;
  keywords: string[];
  category: string;
  count?: number;
  shouldPublish?: boolean;
}

export interface GeneratedFAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
  metaTitle: string;
  metaDescription: string;
  slug: string;
  status: 'DRAFT' | 'PUBLISHED';
  featured: boolean;
}

export interface FAQGenerationResult {
  faqs: GeneratedFAQ[];
  stats: {
    total: number;
    saved: number;
    failed: number;
  };
}

export class AIFAQAgent {
  async generateFAQs(options: FAQGenerationOptions): Promise<GeneratedFAQ[]> {
    const {
      topic,
      keywords,
      category,
      count = 5,
    } = options;

    console.log(`🤖 بدء توليد ${count} أسئلة شائعة عن: ${topic}`);

    const prompt = `أنت خبير في إنشاء محتوى الأسئلة الشائعة (FAQ) المحسّن لمحركات البحث.

**المهمة:**
أنشئ ${count} أسئلة شائعة متنوعة ومفيدة عن الموضوع التالي:

**الموضوع:** ${topic}
**الكلمات المفتاحية:** ${keywords.join(', ')}
**التصنيف:** ${category}

**متطلبات كل سؤال:**
1. السؤال يجب أن يكون طبيعياً كما يسأله العملاء الحقيقيون
2. الإجابة شاملة ومفصلة (200-400 كلمة) مع نقاط واضحة
3. استخدم الكلمات المفتاحية بشكل طبيعي
4. قدم معلومات عملية ومفيدة
5. اذكر أسعار تقريبية أو نطاقات أسعار عند الإمكان
6. اذكر أسماء مدن سعودية (جدة، الرياض، الدمام، مكة، المدينة)
7. كن محترفاً وموثوقاً

**أنواع الأسئلة المطلوبة:**
- سؤال عن الأسعار والتكلفة
- سؤال عن أفضل الأنواع أو المواد
- سؤال عن مدة التركيب أو الضمان
- سؤال عن الصيانة والعناية
- سؤال عن المميزات والفوائد

**الاستجابة بصيغة JSON:**
{
  "faqs": [
    {
      "question": "السؤال هنا؟",
      "answer": "الإجابة الشاملة هنا مع تفاصيل ونقاط...",
      "keywords": ["كلمة1", "كلمة2", "كلمة3"],
      "metaTitle": "عنوان SEO قصير (50-60 حرف)",
      "metaDescription": "وصف SEO (150-160 حرف)",
      "slug": "slug-in-english-or-arabic"
    }
  ]
}`;

    try {
      const response = await ai.chat.completions.create({
        model: GROQ_MODEL,
        messages: [
          {
            role: 'system',
            content: 'أنت خبير في إنشاء محتوى FAQ احترافي ومحسّن للـ SEO. قدم إجابات شاملة ومفيدة للعملاء في السوق السعودي.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        response_format: { type: 'json_object' }
      });

      const responseContent = response.choices[0]?.message?.content || '{"faqs": []}';
      const result = JSON.parse(responseContent);

      if (!result.faqs || !Array.isArray(result.faqs)) {
        console.error('❌ استجابة غير صالحة من AI');
        return [];
      }

      console.log(`✅ تم توليد ${result.faqs.length} سؤال`);

      return result.faqs.map((faq: any) => ({
        id: randomUUID(),
        question: faq.question,
        answer: faq.answer,
        category: category,
        keywords: faq.keywords || keywords,
        metaTitle: faq.metaTitle || faq.question.substring(0, 60),
        metaDescription: faq.metaDescription || faq.answer.substring(0, 160),
        slug: this.generateSlug(faq.slug || faq.question),
        status: 'DRAFT' as const,
        featured: false
      }));
    } catch (error) {
      console.error('❌ خطأ في توليد الأسئلة:', error);
      throw new Error('فشل في توليد الأسئلة الشائعة');
    }
  }

  async saveFAQs(faqs: GeneratedFAQ[], shouldPublish: boolean = false): Promise<FAQGenerationResult> {
    console.log(`📝 جاري حفظ ${faqs.length} سؤال...`);

    const results: FAQGenerationResult = {
      faqs: [],
      stats: {
        total: faqs.length,
        saved: 0,
        failed: 0
      }
    };

    for (const faq of faqs) {
      try {
        const existingFaq = await prisma.faqs.findFirst({
          where: {
            OR: [
              { slug: faq.slug },
              { question: faq.question }
            ]
          }
        });

        if (existingFaq) {
          console.log(`⚠️ سؤال موجود مسبقاً: ${faq.question.substring(0, 50)}...`);
          faq.slug = `${faq.slug}-${Date.now()}`;
        }

        const savedFaq = await prisma.faqs.create({
          data: {
            id: faq.id,
            question: faq.question,
            answer: faq.answer,
            category: faq.category,
            keywords: faq.keywords.join(', '),
            metaTitle: faq.metaTitle,
            metaDescription: faq.metaDescription,
            slug: faq.slug,
            status: shouldPublish ? 'PUBLISHED' : 'DRAFT',
            featured: faq.featured,
            order: 0,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });

        faq.status = shouldPublish ? 'PUBLISHED' : 'DRAFT';
        results.faqs.push(faq);
        results.stats.saved++;
        console.log(`✅ تم حفظ: ${faq.question.substring(0, 50)}...`);
      } catch (error) {
        console.error(`❌ فشل حفظ سؤال: ${faq.question.substring(0, 50)}...`, error);
        results.stats.failed++;
      }
    }

    console.log(`✅ اكتمل الحفظ: ${results.stats.saved}/${results.stats.total}`);
    return results;
  }

  async generateAndSaveFAQs(
    options: FAQGenerationOptions
  ): Promise<FAQGenerationResult> {
    const faqs = await this.generateFAQs(options);
    
    if (faqs.length === 0) {
      return {
        faqs: [],
        stats: { total: 0, saved: 0, failed: 0 }
      };
    }

    return await this.saveFAQs(faqs, options.shouldPublish || false);
  }

  async generateSmartFAQs(
    niche: string,
    count: number = 5,
    shouldPublish: boolean = false
  ): Promise<FAQGenerationResult> {
    console.log(`🧠 التوليد الذكي للأسئلة عن: ${niche}`);

    const analysisPrompt = `أنت خبير SEO متخصص في السوق السعودي.

**المهمة:**
حلل الموضوع التالي واقترح أفضل التصنيفات والكلمات المفتاحية لتوليد أسئلة شائعة:

**الموضوع:** ${niche}

**أرجع JSON:**
{
  "category": "التصنيف الأنسب من: مظلات سيارات، سواتر، خيم ملكية، بيوت شعر ملكي، برجولات، تنسيق حدائق، هناجر، شبوك، قراميد، ساندوتش بانل",
  "keywords": ["5-10 كلمات مفتاحية مهمة"],
  "suggestedTopics": ["3-5 مواضيع محددة للأسئلة"]
}`;

    try {
      const analysisResponse = await ai.chat.completions.create({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: 'أنت خبير SEO محترف.' },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      });

      const analysis = JSON.parse(analysisResponse.choices[0]?.message?.content || '{}');

      const category = analysis.category || 'برجولات';
      const keywords = analysis.keywords || [niche];

      return await this.generateAndSaveFAQs({
        topic: niche,
        keywords,
        category,
        count,
        shouldPublish
      });
    } catch (error) {
      console.error('❌ خطأ في التحليل الذكي:', error);
      
      return await this.generateAndSaveFAQs({
        topic: niche,
        keywords: [niche],
        category: 'برجولات',
        count,
        shouldPublish
      });
    }
  }

  private generateSlug(text: string): string {
    let slug = text
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[،؛؟!@#$%^&*()+=\[\]{};:"\\|<>\/]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 100);

    return slug || `faq-${Date.now()}`;
  }
}

export const aiFAQAgent = new AIFAQAgent();
