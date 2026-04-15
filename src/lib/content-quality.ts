import { createHash } from 'crypto';
import { sanitizeInput } from './security';

const MAX_TITLE_LENGTH = 180;
const MAX_DESCRIPTION_LENGTH = 5000;
const MAX_TAGS = 20;

export const CONTENT_STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export function normalizeText(value: unknown, maxLength = 1000): string {
  if (typeof value !== 'string') return '';
  return sanitizeInput(value).slice(0, maxLength);
}

export function normalizeLongText(value: unknown, maxLength = MAX_DESCRIPTION_LENGTH): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, maxLength);
}

export function normalizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];
  const cleaned = tags
    .map((tag) => {
      if (typeof tag === 'string') return normalizeText(tag, 60);
      if (tag && typeof tag === 'object' && 'name' in tag) {
        return normalizeText((tag as { name?: unknown }).name, 60);
      }
      return '';
    })
    .filter(Boolean);

  return [...new Set(cleaned)].slice(0, MAX_TAGS);
}

export function normalizeStatus(value: unknown, fallback: ContentStatus = 'DRAFT'): ContentStatus {
  if (typeof value !== 'string') return fallback;
  const upper = value.toUpperCase();
  return (CONTENT_STATUSES as readonly string[]).includes(upper) ? (upper as ContentStatus) : fallback;
}

export function createDeterministicSlug(input: string, fallbackPrefix: string): string {
  // نطاقات العربية: Arabic (0600–06FF) + Arabic Supplement (0750–077F) + Arabic Extended-A (08A0–08FF)
  const base = input
    .normalize('NFKD')
    .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

  if (base) return base.slice(0, 120);
  const hash = createHash('sha256').update(`${fallbackPrefix}-${input}`).digest('hex').slice(0, 16);
  return `${fallbackPrefix}-${hash}`;
}

export function buildSeoFields(input: {
  title?: string;
  description?: string;
  excerpt?: string;
  keywords?: string | string[] | null;
  fallbackKeywords?: string[];
}) {
  const title = normalizeText(input.title, 70);
  const excerptSource = input.excerpt || input.description || '';
  const metaDescription = normalizeLongText(excerptSource, 160);
  const normalizedKeywords = Array.isArray(input.keywords)
    ? normalizeTags(input.keywords)
    : typeof input.keywords === 'string'
      ? normalizeTags(input.keywords.split(','))
      : [];
  const keywordList = normalizedKeywords.length ? normalizedKeywords : (input.fallbackKeywords || []);

  return {
    metaTitle: title || undefined,
    metaDescription: metaDescription || undefined,
    keywords: keywordList.join(', ') || undefined
  };
}

export function contentSignature(input: string): string {
  return createHash('sha256')
    .update(
      input
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim()
    )
    .digest('hex');
}

export function computeReadyScore(input: {
  title?: string;
  body?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[] | string;
}) {
  const title = (input.title || '').trim();
  const body = (input.body || '').trim();
  const metaTitle = (input.metaTitle || '').trim();
  const metaDescription = (input.metaDescription || '').trim();
  const keywords = Array.isArray(input.keywords)
    ? input.keywords.filter(Boolean)
    : typeof input.keywords === 'string'
      ? input.keywords.split(',').map((k) => k.trim()).filter(Boolean)
      : [];

  const checks = [
    { ok: title.length >= 8 && title.length <= MAX_TITLE_LENGTH, weight: 25 },
    { ok: body.length >= 120, weight: 35 },
    { ok: metaTitle.length >= 20 && metaTitle.length <= 70, weight: 15 },
    { ok: metaDescription.length >= 70 && metaDescription.length <= 160, weight: 15 },
    { ok: keywords.length >= 2, weight: 10 }
  ];

  const score = checks.reduce((sum, c) => sum + (c.ok ? c.weight : 0), 0);

  return {
    score,
    ready: score >= 70
  };
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  const realIp = headers.get('x-real-ip');
  return forwarded?.split(',')[0]?.trim() || realIp?.trim() || 'unknown';
}
