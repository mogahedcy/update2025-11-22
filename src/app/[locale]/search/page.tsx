'use client';

import { Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SearchResults from '@/components/SearchResults';
import AdvancedFilters from '@/components/AdvancedFilters';
import SavedSearches from '@/components/SavedSearches';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search as SearchIcon, X, Filter, ChevronDown } from 'lucide-react';

interface ApiResult {
  id: string;
  title: string;
  description: string;
  category?: string;
  location?: string;
  image: string;
  slug: string;
  type: 'project' | 'article';
  url: string;
}

interface ArticleShape {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  authorAvatar: string;
  date: string;
  readTime: string;
  image: string;
  tags: string[];
  featured: boolean;
  views: number;
  likes: number;
  rating: number;
  commentsCount: number;
  keywords: string[];
  href?: string;
  source?: 'article' | 'project';
}

interface FiltersState {
  category: string;
  location: string;
  featured: boolean | null;
  minRating: number;
  dateRange: string;
  hasVideo: boolean | null;
  priceRange: string;
}

const SORT_VALUES = ['relevance', 'date', 'name', 'views', 'rating'] as const;
type SortOption = typeof SORT_VALUES[number];
const SEARCH_TYPE_VALUES = ['all', 'projects', 'articles', 'faqs'] as const;
type SearchType = typeof SEARCH_TYPE_VALUES[number];

function isSortOption(value: string): value is SortOption {
  return (SORT_VALUES as readonly string[]).includes(value);
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [results, setResults] = useState<ArticleShape[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [type, setType] = useState<SearchType>(
    (searchParams?.get('type') as any) || 'all'
  );
  const [searchText, setSearchText] = useState(searchParams?.get('q') || '');
  const [facets, setFacets] = useState({ types: { articles: 0, projects: 0, faqs: 0 } });
  const [filters, setFilters] = useState<FiltersState>({
    category: searchParams?.get('category') || '',
    location: searchParams?.get('location') || '',
    featured: null,
    minRating: 0,
    dateRange: '',
    hasVideo: null,
    priceRange: ''
  });

  const query = useMemo(() => searchParams?.get('q') || '', [searchParams]);
  const limit = 12;

  useEffect(() => {
    // مزامنة النوع مع URL
    setType(((searchParams?.get('type') as any) || 'all'));
  }, [searchParams]);

  useEffect(() => {
    if (query) {
      setPage(1);
      performSearch(query, filters, 1, true);
    } else {
      setResults([]);
      setHasMore(false);
    }
  }, [query, type, sortBy, filters.category, filters.location, filters.minRating, filters.featured, filters.dateRange, filters.hasVideo, filters.priceRange]);

  const updateUrl = (params: Record<string, string | undefined>) => {
    const sp = new URLSearchParams(searchParams?.toString() || '');
    Object.entries(params).forEach(([k, v]) => {
      if (!v) sp.delete(k);
      else sp.set(k, v);
    });
    router.replace(`${pathname}?${sp.toString()}`);
  };

  const performSearch = async (
    searchQuery: string,
    currentFilters: FiltersState,
    pageNum: number,
    replaceResults = false
  ) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({ q: searchQuery, page: String(pageNum), limit: String(limit), sortBy, type });
      if (currentFilters.category) queryParams.set('category', currentFilters.category);
      if (currentFilters.location) queryParams.set('location', currentFilters.location);
      if (currentFilters.minRating > 0) queryParams.set('minRating', String(currentFilters.minRating));
      if (currentFilters.dateRange) {
        const now = new Date();
        let dateFrom = '';
        switch(currentFilters.dateRange) {
          case 'week':
          case 'last-7-days':
            dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
            break;
          case 'month':
          case 'last-30-days':
            dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
            break;
          case 'last-3-months':
            dateFrom = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
            break;
          case 'last-6-months':
            dateFrom = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString();
            break;
          case 'last-year':
          case 'year':
            dateFrom = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
            break;
          case '2024':
          case '2023':
          case '2022':
          case '2021':
            dateFrom = new Date(`${currentFilters.dateRange}-01-01T00:00:00.000Z`).toISOString();
            queryParams.set('dateTo', new Date(`${currentFilters.dateRange}-12-31T23:59:59.999Z`).toISOString());
            break;
        }
        if (dateFrom) queryParams.set('dateFrom', dateFrom);
      }
      if (currentFilters.featured !== null) queryParams.set('featured', String(currentFilters.featured));

      const response = await fetch(`/api/search?${queryParams.toString()}`, { cache: 'no-store' });
      const data = await response.json();

      if (data.facets) {
        setFacets(data.facets);
      }

      const mapped: ArticleShape[] = (data.results as any[] | undefined)?.map((r, idx) => ({
        id: Number.parseInt(r.id) || idx + 1 + (pageNum - 1) * limit,
        slug: r.slug,
        title: r.title,
        excerpt: r.description,
        category: r.category || 'عام',
        author: r.type === 'project' ? 'مشروع من معرض الأعمال' : r.type === 'faq' ? 'سؤال شائع' : 'ديار جدة العالمية',
        authorAvatar: 'https://ui-avatars.com/api/?name=محترفين+الديار&background=0f172a&color=fff',
        date: new Date().toLocaleDateString('ar-SA'),
        readTime: '3 دقائق',
        image: r.image,
        tags: [],
        featured: r.featured || false,
        views: r.views || 0,
        likes: 0,
        rating: r.rating || 0,
        commentsCount: 0,
        keywords: [],
        href: r.url,
        source: r.type === 'faq' ? 'article' : r.type
      })) || [];

      setResults(replaceResults ? mapped : [...results, ...mapped]);
      setHasMore(Boolean(data.hasMore));
    } catch (error) {
      console.error('خطأ في البحث:', error);
      if (replaceResults) setResults([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateUrl({ q: searchText || undefined, type });
  };

  const handleTypeKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, currentType: SearchType) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const currentIndex = SEARCH_TYPE_VALUES.indexOf(currentType);
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const nextIndex = (currentIndex + direction + SEARCH_TYPE_VALUES.length) % SEARCH_TYPE_VALUES.length;
    const nextType = SEARCH_TYPE_VALUES[nextIndex];
    setType(nextType);
    updateUrl({ type: nextType });
  };

  const handleFiltersChange = (partial: Partial<FiltersState>) => {
    const next = { ...filters, ...partial };
    setFilters(next);
    updateUrl({ category: next.category || undefined, location: next.location || undefined });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <form onSubmit={onSubmit} className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex-1 relative">
              <SearchIcon className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="ابحث عن مشروع أو مقال..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pr-9"
              />
              {searchText && (
                <button type="button" onClick={() => { setSearchText(''); updateUrl({ q: undefined }); }} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full md:w-auto">
              <Button type="submit">بحث</Button>
              <div className="flex items-center gap-2 flex-nowrap sm:flex-wrap overflow-x-auto pb-1 max-w-full" role="radiogroup" aria-label="تصفية نوع النتائج">
                <Button role="radio" aria-label="الكل" tabIndex={type === 'all' ? 0 : -1} aria-checked={type === 'all' ? 'true' : 'false'} variant={type === 'all' ? 'default' : 'outline'} type="button" onClick={() => { setType('all'); updateUrl({ type: 'all' }); }} onKeyDown={(event) => handleTypeKeyDown(event, 'all')}>
                  الكل
                  {facets.types.articles + facets.types.projects + facets.types.faqs > 0 && (
                    <Badge variant="secondary" className="mr-1 bg-white/20">{facets.types.articles + facets.types.projects + facets.types.faqs}</Badge>
                  )}
                </Button>
                <Button role="radio" aria-label="معرض الأعمال" tabIndex={type === 'projects' ? 0 : -1} aria-checked={type === 'projects' ? 'true' : 'false'} variant={type === 'projects' ? 'default' : 'outline'} type="button" onClick={() => { setType('projects'); updateUrl({ type: 'projects' }); }} onKeyDown={(event) => handleTypeKeyDown(event, 'projects')}>
                  معرض الأعمال
                  {facets.types.projects > 0 && <Badge variant="secondary" className="mr-1 bg-white/20">{facets.types.projects}</Badge>}
                </Button>
                <Button role="radio" aria-label="المقالات" tabIndex={type === 'articles' ? 0 : -1} aria-checked={type === 'articles' ? 'true' : 'false'} variant={type === 'articles' ? 'default' : 'outline'} type="button" onClick={() => { setType('articles'); updateUrl({ type: 'articles' }); }} onKeyDown={(event) => handleTypeKeyDown(event, 'articles')}>
                  المقالات
                  {facets.types.articles > 0 && <Badge variant="secondary" className="mr-1 bg-white/20">{facets.types.articles}</Badge>}
                </Button>
                <Button role="radio" aria-label="الأسئلة الشائعة" tabIndex={type === 'faqs' ? 0 : -1} aria-checked={type === 'faqs' ? 'true' : 'false'} variant={type === 'faqs' ? 'default' : 'outline'} type="button" onClick={() => { setType('faqs'); updateUrl({ type: 'faqs' }); }} onKeyDown={(event) => handleTypeKeyDown(event, 'faqs')}>
                  الأسئلة الشائعة
                  {facets.types.faqs > 0 && <Badge variant="secondary" className="mr-1 bg-white/20">{facets.types.faqs}</Badge>}
                </Button>
              </div>
              <div className="relative min-w-40 w-full sm:w-auto">
                <Filter className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                <select
                  aria-label="ترتيب النتائج"
                  value={sortBy}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (isSortOption(value)) {
                      setSortBy(value);
                    }
                  }}
                  className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-10 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="relevance">الأكثر صلة</option>
                  <option value="date">الأحدث</option>
                  <option value="name">الاسم</option>
                  <option value="views">الأكثر مشاهدة</option>
                  <option value="rating">الأعلى تقييماً</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </form>
        </div>

        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 break-normal [overflow-wrap:anywhere]">نتائج البحث{query && ` عن "${query}"`}</h1>
          <p className="text-gray-600">{results.length} نتيجة</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <AdvancedFilters 
              filters={filters} 
              onFiltersChange={handleFiltersChange}
              categories={[
                { id: 'مظلات سيارات', name: 'مظلات سيارات', icon: '🚗' },
                { id: 'سواتر', name: 'سواتر', icon: '🧱' },
                { id: 'خيم ملكية', name: 'خيم ملكية', icon: '🏕️' },
                { id: 'بيوت شعر ملكي', name: 'بيوت شعر ملكي', icon: '⛺' },
                { id: 'برجولات', name: 'برجولات', icon: '🏛️' },
                { id: 'تنسيق حدائق', name: 'تنسيق حدائق', icon: '🌿' },
                { id: 'هناجر', name: 'هناجر', icon: '🏢' },
                { id: 'شبوك', name: 'شبوك', icon: '🔲' },
                { id: 'قراميد', name: 'قراميد', icon: '🏛️' },
                { id: 'ساندوتش بانل', name: 'ساندوتش بانل', icon: '📦' }
              ]}
            />
            <SavedSearches />
          </div>

          <div className="lg:col-span-3">
            <SearchResults articles={results} isLoading={loading} searchQuery={query} />
            {hasMore && !loading && (
              <div className="text-center mt-8">
                <Button onClick={() => { const next = page + 1; setPage(next); performSearch(query, filters, next, false); }} variant="outline">تحميل المزيد</Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل نتائج البحث...</p>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
