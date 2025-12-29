# دليل إمكانية الوصول (Accessibility Guide)
# A11y Implementation Guide for Aldeyar Global Website

## نظرة عامة / Overview

هذا الدليل يوفر إرشادات لتحسين إمكانية الوصول في موقع ديار جدة العالمية وفقاً لمعايير WCAG 2.1 Level AA.

This guide provides guidelines for improving accessibility in the Aldeyar Global website according to WCAG 2.1 Level AA standards.

---

## المكونات الجديدة / New Components

### 1. AccessibleButton Component

مكون زر محسّن لإمكانية الوصول مع دعم كامل لـ ARIA attributes.

```tsx
import { AccessibleButton, AccessibleIconButton } from '@/components/ui/accessible-button';

// Basic button
<AccessibleButton ariaLabel="اتصل بنا">
  اتصل الآن
</AccessibleButton>

// Icon button
<AccessibleIconButton 
  icon={<PhoneIcon />} 
  label="اتصل بنا عبر الهاتف"
/>

// Loading state
<AccessibleButton isLoading loadingText="جاري الإرسال...">
  إرسال
</AccessibleButton>
```

### 2. ErrorBoundary Component

مكون لإدارة الأخطاء بشكل آمن مع واجهة مستخدم بديلة.

```tsx
import ErrorBoundary from '@/components/ErrorBoundary';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### 3. Logger Utility

أداة للتسجيل الآمن في الإنتاج.

```tsx
import { logger, createNamespacedLogger } from '@/lib/logger';

// Basic logging
logger.log('Debug info');
logger.error('Error occurred');

// Namespaced logger
const apiLogger = createNamespacedLogger('api');
apiLogger.error('API request failed');
```

---

## معايير إمكانية الوصول / Accessibility Standards

### 1. ARIA Labels

**❌ قبل / Before:**
```tsx
<button onClick={handleClick}>
  <SearchIcon />
</button>
```

**✅ بعد / After:**
```tsx
<button 
  onClick={handleClick}
  aria-label="البحث في الموقع"
  title="البحث في الموقع"
>
  <SearchIcon aria-hidden="true" />
</button>
```

### 2. Keyboard Navigation

تأكد من أن جميع العناصر التفاعلية قابلة للوصول عبر لوحة المفاتيح:

```tsx
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
  aria-label="وصف العنصر"
>
  المحتوى
</div>
```

### 3. Form Accessibility

**❌ قبل / Before:**
```tsx
<input type="text" placeholder="الاسم" />
```

**✅ بعد / After:**
```tsx
<div>
  <label htmlFor="name" className="block mb-2">
    الاسم <span className="text-red-500" aria-label="مطلوب">*</span>
  </label>
  <input
    id="name"
    type="text"
    placeholder="أدخل اسمك الكامل"
    aria-required="true"
    aria-describedby="name-help"
  />
  <p id="name-help" className="text-sm text-gray-600 mt-1">
    الرجاء إدخال الاسم الثلاثي
  </p>
</div>
```

### 4. Image Accessibility

**❌ قبل / Before:**
```tsx
<img src="/logo.png" />
```

**✅ بعد / After:**
```tsx
<img 
  src="/logo.png" 
  alt="شعار شركة ديار جدة العالمية"
  loading="lazy"
/>
```

### 5. Color Contrast

تأكد من نسبة التباين المناسبة (4.5:1 للنص العادي، 3:1 للنص الكبير):

```css
/* ❌ Low contrast */
.text-gray-400 on .bg-white { }

/* ✅ Good contrast */
.text-gray-900 on .bg-white { }
.text-white on .bg-emerald-600 { }
```

### 6. Focus Indicators

تأكد من وجود مؤشر تركيز واضح:

```tsx
<button className="focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
  زر مع مؤشر تركيز
</button>
```

### 7. Semantic HTML

استخدم HTML دلالي مناسب:

```tsx
// ❌ Before
<div onClick={handleClick}>عنصر قابل للنقر</div>

// ✅ After
<button onClick={handleClick}>عنصر قابل للنقر</button>
```

### 8. Skip Links

أضف رابط تخطي للمحتوى الرئيسي:

```tsx
<a 
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:p-4 focus:bg-white"
>
  الانتقال إلى المحتوى الرئيسي
</a>
```

### 9. Heading Hierarchy

استخدم التسلسل الهرمي الصحيح للعناوين:

```tsx
<h1>العنوان الرئيسي</h1>
  <h2>قسم فرعي</h2>
    <h3>تفاصيل القسم</h3>
```

### 10. Live Regions

للمحتوى الديناميكي:

```tsx
<div 
  role="status" 
  aria-live="polite" 
  aria-atomic="true"
>
  تم إضافة 3 عناصر جديدة
</div>
```

---

## قائمة التحقق / Checklist

### Essential (Required)
- [ ] جميع الصور لديها alt text مناسب
- [ ] جميع النماذج لديها labels مرتبطة
- [ ] جميع الأزرار لديها نص واضح أو aria-label
- [ ] التباين اللوني مناسب (4.5:1)
- [ ] يمكن التنقل بالكامل عبر لوحة المفاتيح
- [ ] مؤشرات التركيز واضحة ومرئية
- [ ] العناوين بترتيب منطقي
- [ ] الروابط لديها نص وصفي

### Recommended
- [ ] دعم قارئات الشاشة
- [ ] رسائل خطأ واضحة ومفهومة
- [ ] تعليمات واضحة للنماذج
- [ ] دعم تكبير النص حتى 200%
- [ ] عدم استخدام الألوان فقط لنقل المعلومات

### Advanced
- [ ] Skip navigation links
- [ ] ARIA landmarks
- [ ] Live regions للمحتوى الديناميكي
- [ ] Keyboard shortcuts documentation
- [ ] High contrast mode support

---

## الأدوات المساعدة / Testing Tools

### Automated Testing
```bash
# Install axe-core for accessibility testing
npm install --save-dev @axe-core/react

# Install jest-axe for testing
npm install --save-dev jest-axe
```

### Manual Testing
1. **Lighthouse** - Built into Chrome DevTools
2. **WAVE** - Browser extension
3. **axe DevTools** - Browser extension
4. **Keyboard Navigation** - Test with Tab, Enter, Space, Arrow keys
5. **Screen Reader** - Test with NVDA (Windows) or VoiceOver (Mac)

---

## الموارد / Resources

### Arabic Resources
- [دليل WCAG بالعربية](https://www.w3.org/Translations/WCAG21-ar/)
- [إرشادات إمكانية الوصول](https://developer.mozilla.org/ar/docs/Web/Accessibility)

### English Resources
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [A11y Project](https://www.a11yproject.com/)
- [WebAIM](https://webaim.org/)

---

## الخطوات التالية / Next Steps

1. مراجعة جميع المكونات الحالية
2. إضافة aria-labels للأزرار والروابط
3. تحسين التباين اللوني
4. إضافة keyboard navigation
5. اختبار مع قارئات الشاشة
6. إضافة unit tests لإمكانية الوصول

---

**تاريخ الإنشاء:** 2025-12-29
**الإصدار:** 1.0
