
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Save, 
  Upload, 
  Plus, 
  X, 
  Eye, 
  Calendar,
  MapPin,
  User,
  Clock,
  DollarSign,
  Tag,
  Package,
  Sparkles,
  Loader2,
  CheckCircle2,
  Lightbulb,
  TrendingUp
} from 'lucide-react';
import { PROJECT_CATEGORIES } from '@/constants/projectCategories';

interface MediaItem {
  type: 'IMAGE' | 'VIDEO';
  src: string;
  title?: string;
  description?: string;
  alt?: string;
}

const categories = PROJECT_CATEGORIES;

export default function ProjectAddClient() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    completionDate: '',
    client: '',
    featured: false,
    projectDuration: '',
    projectCost: '',
    metaTitle: '',
    metaDescription: '',
    keywords: ''
  });

  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [materials, setMaterials] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [newMaterial, setNewMaterial] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // تحديث الـ meta data تلقائياً
    if (field === 'title' || field === 'location') {
      const newTitle = field === 'title' ? value : formData.title;
      const newLocation = field === 'location' ? value : formData.location;
      
      if (newTitle && newLocation) {
        setFormData(prev => ({
          ...prev,
          metaTitle: `${newTitle} في ${newLocation} | محترفين الديار العالمية`,
          keywords: `${formData.category}, ${newLocation}, جدة, محترفين الديار, ${newTitle}`
        }));
      }
    }

    if (field === 'description') {
      setFormData(prev => ({
        ...prev,
        metaDescription: value.substring(0, 150) + (value.length > 150 ? '...' : '')
      }));
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setLoading(true);
    setUploadProgress(0);

    const errors: string[] = [];
    const warnings: string[] = [];
    let successCount = 0;

    const uploadPromises = Array.from(files).map(async (file, index) => {
      // التحقق من نوع الملف أولاً
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      
      if (!isImage && !isVideo) {
        errors.push(`${file.name}: نوع الملف غير مدعوم. الصيغ المدعومة: الصور (JPG, PNG, WebP) والفيديو (MP4, MOV, WebM)`);
        return null;
      }

      // التحقق من حجم الملف مع حدود مختلفة للصور والفيديو
      const maxImageSize = 100 * 1024 * 1024; // 100MB للصور
      const maxVideoSize = 200 * 1024 * 1024; // 200MB للفيديو
      const maxSize = isVideo ? maxVideoSize : maxImageSize;
      
      if (file.size > maxSize) {
        const sizeMB = (file.size / 1024 / 1024).toFixed(1);
        const maxSizeMB = (maxSize / 1024 / 1024).toFixed(0);
        errors.push(`${file.name}: حجم الملف (${sizeMB}MB) يتجاوز الحد الأقصى (${maxSizeMB}MB للـ${isVideo ? 'فيديو' : 'صور'})`);
        return null;
      }

      // تحذير للملفات الكبيرة
      if (isVideo && file.size > 50 * 1024 * 1024) {
        warnings.push(`${file.name}: الملف كبير (${(file.size / 1024 / 1024).toFixed(1)}MB)، قد يستغرق الرفع عدة دقائق`);
      }

      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData
        });

        const result = await response.json();

        if (!response.ok) {
          const errorMsg = result.error || result.details || 'فشل في رفع الملف';
          errors.push(`${file.name}: ${errorMsg}`);
          return null;
        }
        
        setUploadProgress((index + 1) / files.length * 100);
        successCount++;

        // توليد alt text = اسم المشروع فقط (بسيط ومباشر)
        const optimizedAlt = formData.title || file.name.split('.')[0];

        return {
          type: isVideo ? 'VIDEO' as const : 'IMAGE' as const,
          src: result.url || result.files?.[0]?.url || result.files?.[0]?.src,
          title: formData.title || file.name.split('.')[0],
          description: formData.description ? formData.description.substring(0, 200) : undefined,
          alt: optimizedAlt
        };
      } catch (error) {
        console.error('خطأ في رفع الملف:', error);
        const errorMsg = error instanceof Error ? error.message : 'خطأ في الاتصال بالخادم';
        errors.push(`${file.name}: ${errorMsg}`);
        return null;
      }
    });

    const uploadedMedia = await Promise.all(uploadPromises);
    const validMedia = uploadedMedia.filter(Boolean) as MediaItem[];
    
    setMediaItems(prev => [...prev, ...validMedia]);
    setLoading(false);
    setUploadProgress(0);

    // عرض رسائل النتائج مع معلومات مفيدة
    let message = '';
    
    if (successCount > 0) {
      message += `✅ تم رفع ${successCount} من ${files.length} ملف بنجاح!\n\n`;
    }
    
    if (warnings.length > 0 && successCount > 0) {
      message += `💡 ملاحظات:\n${warnings.join('\n')}\n\n`;
    }
    
    if (errors.length > 0) {
      message += `⚠️ فشل رفع ${errors.length} ملف:\n${errors.join('\n')}\n\n`;
      message += `📌 نصائح:\n`;
      message += `• تأكد من نوع الملف (الصيغ المدعومة: JPG, PNG, WebP, MP4, MOV, WebM)\n`;
      message += `• تحقق من حجم الملف (حد أقصى: 100MB للصور، 200MB للفيديو)\n`;
      message += `• تأكد من اتصال الإنترنت لديك\n`;
      message += `• للفيديوهات الكبيرة: انتظر بضع دقائق إضافية`;
    }
    
    if (message) {
      alert(message);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  const addMaterial = () => {
    if (newMaterial.trim() && !materials.includes(newMaterial.trim())) {
      setMaterials(prev => [...prev, newMaterial.trim()]);
      setNewMaterial('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  };

  const removeMaterial = (material: string) => {
    setMaterials(prev => prev.filter(m => m !== material));
  };

  const removeMediaItem = (index: number) => {
    setMediaItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.category || !formData.location) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/projects/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          mediaItems,
          tags,
          materials
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'فشل في إنشاء المشروع');
      }

      const result = await response.json();
      
      alert('تم إنشاء المشروع بنجاح! سيتم توجيهك لعرض المشروع.');
      router.push(`/portfolio/${result.project.slug}`);

    } catch (error) {
      console.error('خطأ في إنشاء المشروع:', error);
      alert('حدث خطأ في إنشاء المشروع');
    } finally {
      setLoading(false);
    }
  };

  const getAISuggestions = async () => {
    if (!formData.title) {
      alert('يرجى إدخال عنوان المشروع أولاً');
      return;
    }

    setLoadingAI(true);
    setShowAISuggestions(true);
    
    try {
      const response = await fetch('/api/ai-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          location: formData.location,
          type: 'project'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'فشل في الحصول على الاقتراحات من الخادم');
      }

      const data = await response.json();
      
      if (data.suggestions) {
        setAiSuggestions(data.suggestions);
        console.log('🤖 اقتراحات AI:', data.suggestions);
      } else {
        throw new Error('لم يتم إرجاع اقتراحات من الخادم');
      }
    } catch (error) {
      console.error('خطأ في الحصول على اقتراحات AI:', error);
      const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
      alert(`⚠️ حدث خطأ في الحصول على اقتراحات AI:\n${errorMessage}\n\nيرجى المحاولة مرة أخرى أو التحقق من اتصال الإنترنت.`);
      
      if (!aiSuggestions) {
        setShowAISuggestions(false);
      }
    } finally {
      setLoadingAI(false);
    }
  };

  const applyAISuggestion = (type: 'title' | 'description' | 'keywords' | 'metaTitle' | 'metaDescription', value: string) => {
    if (type === 'title') {
      handleInputChange('title', value);
    } else if (type === 'description') {
      handleInputChange('description', value);
    } else if (type === 'keywords') {
      handleInputChange('keywords', value);
    } else if (type === 'metaTitle') {
      handleInputChange('metaTitle', value);
    } else if (type === 'metaDescription') {
      handleInputChange('metaDescription', value);
    }
  };

  const addKeywordFromAI = (keyword: string) => {
    if (!tags.includes(keyword)) {
      setTags(prev => [...prev, keyword]);
    }
  };

  const previewProject = () => {
    const preview = {
      ...formData,
      mediaItems: mediaItems.slice(0, 3),
      tags: tags.slice(0, 5),
      materials: materials.slice(0, 5)
    };
    
    console.log('معاينة المشروع:', preview);
    alert('تم عرض معاينة المشروع في console المتصفح');
  };

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">إضافة مشروع جديد</h1>
          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={previewProject}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              معاينة
            </Button>
            <Button 
              type="button"
              variant="outline" 
              onClick={() => router.back()}
            >
              إلغاء
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* المعلومات الأساسية */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Package className="h-5 w-5" />
              المعلومات الأساسية
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  عنوان المشروع *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="مثال: مظلة سيارات فاخرة - فيلا الياسمين"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  التصنيف *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">اختر التصنيف</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  الموقع *
                </label>
                <Input
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="مثال: جدة - حي الروضة"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  تاريخ الإنجاز
                </label>
                <Input
                  type="date"
                  value={formData.completionDate}
                  onChange={(e) => handleInputChange('completionDate', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  العميل
                </label>
                <Input
                  value={formData.client}
                  onChange={(e) => handleInputChange('client', e.target.value)}
                  placeholder="مثال: عائلة الأحمد"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  مدة المشروع
                </label>
                <Input
                  value={formData.projectDuration}
                  onChange={(e) => handleInputChange('projectDuration', e.target.value)}
                  placeholder="مثال: 5 أيام"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  تكلفة المشروع
                </label>
                <Input
                  value={formData.projectCost}
                  onChange={(e) => handleInputChange('projectCost', e.target.value)}
                  placeholder="مثال: 25000 ريال"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => handleInputChange('featured', e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <label htmlFor="featured" className="text-sm font-medium">
                  مشروع مميز
                </label>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">
                وصف المشروع *
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="وصف تفصيلي للمشروع والخدمات المقدمة..."
                rows={5}
                required
              />
            </div>

            {/* قسم AI مع معلومات توضيحية */}
            <div className="mt-6 space-y-4">
              {/* معلومات توضيحية عن ميزات AI */}
              <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-purple-50 border-2 border-purple-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold text-purple-900">تحليل ذكي بتقنية GROQ AI</h3>
                  <Badge variant="outline" className="text-xs border-purple-400 text-purple-700 bg-purple-50">
                    ⚡ تحليل GROQ AI
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-start gap-2 bg-white/60 p-2 rounded">
                    <span className="text-purple-600">⚡</span>
                    <div>
                      <p className="font-medium text-gray-900">سرعة فائقة</p>
                      <p className="text-gray-600">10x أسرع من النماذج الأخرى</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2 bg-white/60 p-2 rounded">
                    <span className="text-green-600">💰</span>
                    <div>
                      <p className="font-medium text-gray-900">بدون تكاليف إضافية</p>
                      <p className="text-gray-600">لا يحتاج لـ API keys خارجية</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2 bg-white/60 p-2 rounded">
                    <span className="text-blue-600">🇸🇦</span>
                    <div>
                      <p className="font-medium text-gray-900">متخصص في السوق السعودي</p>
                      <p className="text-gray-600">تحليل دقيق لمجال البناء والمظلات</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2 bg-white/60 p-2 rounded">
                    <span className="text-orange-600">🔄</span>
                    <div>
                      <p className="font-medium text-gray-900">تلقائي تماماً</p>
                      <p className="text-gray-600">يعمل مباشرة عند كتابة العنوان</p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-800">
                  <p className="flex items-start gap-1">
                    <span>ℹ️</span>
                    <span>
                      <strong>طريقة العمل:</strong> يستخدم النظام التحليل الذكي بواسطة GROQ AI بناءً على معرفته العميقة بالسوق السعودي والمنافسين، 
                      دون الحاجة لبحث SERP المباشر، مما يوفر تحليلاً سريعاً ودقيقاً ومتخصصاً.
                    </span>
                  </p>
                </div>
              </div>

              {/* زر AI */}
              <div className="flex justify-center">
                <Button
                  type="button"
                  onClick={getAISuggestions}
                  disabled={loadingAI || !formData.title}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3"
                >
                  {loadingAI ? (
                    <>
                      <Loader2 className="h-5 w-5 ml-2 animate-spin" />
                      جاري التحليل الذكي...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 ml-2" />
                      احصل على تحليل ذكي بالـ AI
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>

          {/* اقتراحات AI */}
          {showAISuggestions && aiSuggestions && (
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2 text-purple-900">
                  <Sparkles className="h-6 w-6" />
                  اقتراحات الذكاء الاصطناعي
                </h2>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAISuggestions(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* تحليل المنافسين */}
                {aiSuggestions.competitorAnalysis && (
                  <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-green-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        <h3 className="font-semibold text-gray-900">تحليل المنافسين المتصدرين 🔥</h3>
                      </div>
                      <Badge variant="outline" className="text-xs border-purple-400 text-purple-700 bg-purple-50">
                        ⚡ تحليل GROQ AI
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      {aiSuggestions.competitorAnalysis.topKeywords && aiSuggestions.competitorAnalysis.topKeywords.length > 0 && (
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-xs font-medium text-green-800 mb-2">🎯 كلمات المنافسين الأكثر استخداماً:</p>
                          <div className="flex flex-wrap gap-1">
                            {aiSuggestions.competitorAnalysis.topKeywords.slice(0, 8).map((keyword: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs border-green-300 text-green-700">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {aiSuggestions.competitorAnalysis.contentStrategy && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-xs font-medium text-blue-800 mb-1">📊 استراتيجية المحتوى:</p>
                          <p className="text-xs text-gray-700">{aiSuggestions.competitorAnalysis.contentStrategy}</p>
                        </div>
                      )}
                      {aiSuggestions.competitorAnalysis.targetAudience && (
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <p className="text-xs font-medium text-purple-800 mb-1">👥 الجمهور المستهدف:</p>
                          <p className="text-xs text-gray-700">{aiSuggestions.competitorAnalysis.targetAudience}</p>
                        </div>
                      )}
                      {aiSuggestions.competitorAnalysis.contentGaps && aiSuggestions.competitorAnalysis.contentGaps.length > 0 && (
                        <div className="p-3 bg-yellow-50 rounded-lg">
                          <p className="text-xs font-medium text-yellow-800 mb-2">💡 فرص التميز (الثغرات في محتوى المنافسين):</p>
                          <ul className="space-y-1">
                            {aiSuggestions.competitorAnalysis.contentGaps.slice(0, 3).map((gap: string, index: number) => (
                              <li key={index} className="text-xs text-gray-700 flex items-start gap-1">
                                <span className="text-yellow-600">•</span>
                                <span>{gap}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* الكلمات المفتاحية */}
                {aiSuggestions.keywords && aiSuggestions.keywords.length > 0 && (
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <Tag className="h-5 w-5 text-purple-600" />
                      <h3 className="font-semibold text-gray-900">الكلمات المفتاحية المقترحة</h3>
                      {aiSuggestions.competitorAnalysis && (
                        <Badge variant="outline" className="text-xs border-green-500 text-green-700">
                          مُحسّنة من المنافسين
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {aiSuggestions.keywords.map((keyword: string, index: number) => (
                        <Badge
                          key={index}
                          className="bg-purple-100 text-purple-700 hover:bg-purple-200 cursor-pointer transition-colors"
                          onClick={() => addKeywordFromAI(keyword)}
                        >
                          <Plus className="h-3 w-3 ml-1" />
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 mt-2">💡 اضغط على أي كلمة لإضافتها للوسوم</p>
                  </div>
                )}

                {/* اقتراحات العناوين */}
                {aiSuggestions.titleSuggestions && aiSuggestions.titleSuggestions.length > 0 && (
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-gray-900">اقتراحات للعناوين</h3>
                    </div>
                    <div className="space-y-2">
                      {aiSuggestions.titleSuggestions.map((title: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                          <div className="flex-1">
                            <p className="text-sm text-gray-800">{title}</p>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => applyAISuggestion('title', title)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* اقتراح الوصف */}
                {aiSuggestions.contentSuggestions && (
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <Package className="h-5 w-5 text-green-600" />
                      <h3 className="font-semibold text-gray-900">اقتراح للوصف</h3>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div 
                        className="text-sm text-gray-700 mb-3"
                        dangerouslySetInnerHTML={{ __html: aiSuggestions.contentSuggestions }}
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          const plainText = aiSuggestions.contentSuggestions.replace(/<[^>]*>/g, '');
                          applyAISuggestion('description', plainText);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle2 className="h-4 w-4 ml-2" />
                        استخدام هذا الوصف
                      </Button>
                    </div>
                  </div>
                )}

                {/* Meta Tags */}
                {aiSuggestions.metaTags && (
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <Tag className="h-5 w-5 text-orange-600" />
                      <h3 className="font-semibold text-gray-900">Meta Tags المقترحة</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="p-3 bg-orange-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Meta Title:</p>
                        <p className="text-sm text-gray-800 mb-2">{aiSuggestions.metaTags.title}</p>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => applyAISuggestion('metaTitle', aiSuggestions.metaTags.title)}
                        >
                          <CheckCircle2 className="h-3 w-3 ml-1" />
                          تطبيق
                        </Button>
                      </div>
                      <div className="p-3 bg-orange-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Meta Description:</p>
                        <p className="text-sm text-gray-800 mb-2">{aiSuggestions.metaTags.description}</p>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => applyAISuggestion('metaDescription', aiSuggestions.metaTags.description)}
                        >
                          <CheckCircle2 className="h-3 w-3 ml-1" />
                          تطبيق
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* اقتراحات التحسين */}
                {aiSuggestions.descriptionSuggestions && aiSuggestions.descriptionSuggestions.length > 0 && (
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="h-5 w-5 text-yellow-600" />
                      <h3 className="font-semibold text-gray-900">اقتراحات لتحسين الوصف</h3>
                    </div>
                    <ul className="space-y-2">
                      {aiSuggestions.descriptionSuggestions.map((suggestion: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                          <CheckCircle2 className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* الوسائط */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Upload className="h-5 w-5" />
              الصور والفيديوهات
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  رفع الصور والفيديوهات
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,video/mp4,video/mov,video/avi,video/webm"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                    id="file-upload"
                  />
                  <label 
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="h-12 w-12 text-gray-400" />
                    <div className="text-sm text-gray-600">
                      <span className="font-medium text-blue-600">انقر للرفع</span> أو اسحب الملفات هنا
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      الصور: JPG, PNG, WEBP, GIF (حتى 100MB)
                    </p>
                    <p className="text-xs text-gray-500">
                      الفيديوهات: MP4, MOV, AVI, WEBM (حتى 100MB)
                    </p>
                  </label>
                </div>
                {loading && (
                  <div className="mt-4">
                    <Progress value={uploadProgress} className="w-full" />
                    <p className="text-sm text-gray-600 mt-2 text-center">
                      جاري الرفع... {Math.round(uploadProgress)}%
                    </p>
                  </div>
                )}
              </div>

              {mediaItems.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-3">
                    تم رفع {mediaItems.length} ملف ({mediaItems.filter(m => m.type === 'IMAGE').length} صورة، {mediaItems.filter(m => m.type === 'VIDEO').length} فيديو)
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {mediaItems.map((item, index) => (
                      <div key={index} className="relative group">
                        {item.type === 'IMAGE' ? (
                          <img
                            src={item.src}
                            alt={item.alt}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="relative w-full h-24 bg-gray-900 rounded-lg overflow-hidden">
                            <video
                              src={item.src}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                              <div className="bg-white rounded-full p-2">
                                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                                </svg>
                              </div>
                            </div>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeMediaItem(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* العلامات والمواد */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Tag className="h-5 w-5" />
                العلامات
              </h2>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="إضافة علامة"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">المواد المستخدمة</h2>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newMaterial}
                    onChange={(e) => setNewMaterial(e.target.value)}
                    placeholder="إضافة مادة"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMaterial())}
                  />
                  <Button type="button" onClick={addMaterial} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {materials.map(material => (
                    <Badge key={material} variant="outline" className="flex items-center gap-1">
                      {material}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeMaterial(material)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* SEO */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">إعدادات SEO</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">عنوان SEO</label>
                <Input
                  value={formData.metaTitle}
                  onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                  placeholder="سيتم إنشاؤه تلقائياً"
                />
                <p className="text-xs text-gray-500 mt-1">
                  الطول الحالي: {formData.metaTitle.length}/60 حرف
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">وصف SEO</label>
                <Textarea
                  value={formData.metaDescription}
                  onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                  placeholder="سيتم إنشاؤه تلقائياً"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">
                  الطول الحالي: {formData.metaDescription.length}/160 حرف
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">الكلمات المفتاحية</label>
                <Input
                  value={formData.keywords}
                  onChange={(e) => handleInputChange('keywords', e.target.value)}
                  placeholder="سيتم إنشاؤها تلقائياً"
                />
              </div>
            </div>
          </Card>

          {/* أزرار الحفظ */}
          <div className="flex justify-end gap-3 pt-6">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              إلغاء
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {loading ? 'جاري الحفظ...' : 'حفظ المشروع'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
