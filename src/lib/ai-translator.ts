import ai, { GROQ_MODEL } from './groq-client';

interface TranslationInput {
  title: string;
  description: string;
  category?: string;
  location?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  tags?: string[];
  materials?: string[];
}

interface TranslationOutput {
  title: string;
  description: string;
  category?: string;
  location?: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  tags?: string[];
  materials?: string[];
  seoOptimized: {
    richSnippet: {
      headline: string;
      summary: string;
    };
    imageAltTexts: string[];
    videoDescriptions: string[];
  };
}

/**
 * ترجمة محتوى المشروع من العربية إلى الإنجليزية مع تحسين SEO
 * Translate project content from Arabic to English with SEO optimization
 */
export async function translateProjectToEnglish(
  input: TranslationInput,
  imageCount: number = 0,
  videoCount: number = 0
): Promise<TranslationOutput> {
  try {
    const prompt = `You are a professional web developer with 20 years of experience in SEO, metadata optimization, and bilingual content creation.

Translate the following Arabic project content to professional English, optimizing for SEO, keywords, rich snippets, and metadata.

**Arabic Content:**
- Title: ${input.title}
- Description: ${input.description}
${input.category ? `- Category: ${input.category}` : ''}
${input.location ? `- Location: ${input.location}` : ''}
${input.tags && input.tags.length > 0 ? `- Tags: ${input.tags.join(', ')}` : ''}
${input.materials && input.materials.length > 0 ? `- Materials: ${input.materials.join(', ')}` : ''}

**Requirements:**
1. Translate to professional, natural English
2. Create SEO-optimized meta title (max 60 chars)
3. Create compelling meta description (150-160 chars)
4. Generate 10-15 relevant SEO keywords (English)
5. Create rich snippet optimized headline and summary
6. Generate ${imageCount} professional image alt texts (if images exist)
7. Generate ${videoCount} professional video descriptions (if videos exist)
8. Maintain professional tone for construction/architecture industry
9. Include location context (Jeddah, Saudi Arabia)
10. Optimize for Google Search, rich snippets, and featured snippets

**Output as JSON only (no markdown, no explanation):**
{
  "title": "translated title",
  "description": "translated description",
  "category": "translated category",
  "location": "translated location",
  "metaTitle": "SEO optimized meta title (max 60 chars)",
  "metaDescription": "SEO optimized meta description (150-160 chars)",
  "keywords": ["keyword1", "keyword2", ...],
  "tags": ["tag1", "tag2", ...],
  "materials": ["material1", "material2", ...],
  "seoOptimized": {
    "richSnippet": {
      "headline": "compelling headline for rich snippets",
      "summary": "engaging summary for featured snippets"
    },
    "imageAltTexts": ["alt text 1", "alt text 2", ...],
    "videoDescriptions": ["video description 1", ...]
  }
}`;

    const completion = await ai.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        {
          role: "system",
          content: "You are a professional SEO and translation expert. Always respond with valid JSON only, no markdown formatting, no code blocks."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3, // Lower temperature for consistent, professional translation
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    const responseText = completion.choices[0]?.message?.content || '{}';
    
    // Parse the JSON response
    let translation: TranslationOutput;
    try {
      translation = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ خطأ في تحليل استجابة الترجمة:', parseError);
      // Fallback to basic translation
      translation = createFallbackTranslation(input);
    }

    // Validate and ensure all required fields exist
    if (!translation.title || !translation.description) {
      console.warn('⚠️ الترجمة غير مكتملة، استخدام الترجمة الاحتياطية');
      translation = {
        ...createFallbackTranslation(input),
        ...translation
      };
    }

    console.log('✅ تمت الترجمة بنجاح:', translation.title);
    return translation;

  } catch (error) {
    console.error('❌ خطأ في ترجمة المشروع:', error);
    // Return fallback translation
    return createFallbackTranslation(input);
  }
}

/**
 * إنشاء ترجمة احتياطية بسيطة في حالة فشل AI
 */
function createFallbackTranslation(input: TranslationInput): TranslationOutput {
  const titleEn = `Project: ${input.title}`;
  const categoryEn = input.category || 'Construction Project';
  const locationEn = input.location?.includes('جدة') ? 'Jeddah' : (input.location || 'Saudi Arabia');

  return {
    title: titleEn,
    description: `${categoryEn} project in ${locationEn}. ${input.description.substring(0, 100)}...`,
    category: categoryEn,
    location: locationEn,
    metaTitle: `${titleEn.substring(0, 40)} | Aldeyar Global`,
    metaDescription: `Professional ${categoryEn.toLowerCase()} in ${locationEn}. High-quality construction services by Aldeyar Global Professionals.`,
    keywords: [
      categoryEn.toLowerCase(),
      locationEn.toLowerCase(),
      'jeddah',
      'saudi arabia',
      'construction',
      'professional services',
      'aldeyar global'
    ],
    tags: input.tags || [],
    materials: input.materials || [],
    seoOptimized: {
      richSnippet: {
        headline: `Professional ${categoryEn} in ${locationEn}`,
        summary: `High-quality ${categoryEn.toLowerCase()} project completed in ${locationEn} by Aldeyar Global Professionals.`
      },
      imageAltTexts: [`${categoryEn} in ${locationEn} - Image`],
      videoDescriptions: [`${categoryEn} project video in ${locationEn}`]
    }
  };
}

/**
 * ترجمة مجموعة من النصوص القصيرة (للعناوين، الوسوم، إلخ)
 */
export async function translateBatch(texts: string[]): Promise<string[]> {
  try {
    const prompt = `Translate the following Arabic texts to professional English. Return as JSON array.

Arabic texts: ${JSON.stringify(texts)}

Return only a JSON array of translated strings, no markdown, no explanation.`;

    const completion = await ai.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        {
          role: "system",
          content: "You are a professional translator. Always respond with valid JSON array only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 500,
      response_format: { type: "json_object" }
    });

    const responseText = completion.choices[0]?.message?.content || '{"translations": []}';
    const parsed = JSON.parse(responseText);
    
    return parsed.translations || parsed.result || texts;
  } catch (error) {
    console.error('❌ خطأ في الترجمة الجماعية:', error);
    return texts; // Return original on error
  }
}
