# دليل أفضل ممارسات التطوير
# Development Best Practices Guide

## نظرة عامة / Overview

هذا الدليل يحدد أفضل ممارسات التطوير لموقع ديار جدة العالمية لضمان جودة الكود، الأمان، والأداء.

This guide defines development best practices for Aldeyar Global website to ensure code quality, security, and performance.

---

## 1. TypeScript Best Practices

### استخدام الأنواع الصريحة / Use Explicit Types

**❌ تجنب / Avoid:**
```typescript
function fetchData(id: any) {
  return api.get(id);
}
```

**✅ مفضل / Preferred:**
```typescript
interface Project {
  id: string;
  title: string;
  description: string;
}

async function fetchData(id: string): Promise<Project> {
  return api.get<Project>(id);
}
```

### تجنب 'any' / Avoid 'any'

**❌ تجنب / Avoid:**
```typescript
const handleData = (data: any) => {
  console.log(data.name);
};
```

**✅ مفضل / Preferred:**
```typescript
interface UserData {
  name: string;
  email: string;
}

const handleData = (data: UserData | unknown) => {
  if (isUserData(data)) {
    console.log(data.name);
  }
};

function isUserData(data: unknown): data is UserData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'name' in data &&
    'email' in data
  );
}
```

---

## 2. React Best Practices

### استخدام TypeScript مع المكونات / Use TypeScript with Components

```typescript
import { type FC, type ReactNode } from 'react';

interface CardProps {
  title: string;
  description?: string;
  children?: ReactNode;
  onAction?: () => void;
}

export const Card: FC<CardProps> = ({ 
  title, 
  description, 
  children,
  onAction 
}) => {
  return (
    <div className="card">
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {children}
      {onAction && (
        <button onClick={onAction} aria-label={`إجراء على ${title}`}>
          اضغط هنا
        </button>
      )}
    </div>
  );
};
```

### استخدام React Hooks بشكل صحيح / Proper React Hooks Usage

```typescript
import { useState, useEffect, useCallback } from 'react';

export const DataComponent = () => {
  const [data, setData] = useState<Data[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await api.getData();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <DataList data={data} />;
};
```

---

## 3. معالجة الأخطاء / Error Handling

### API Error Handling

```typescript
import { logger } from '@/lib/logger';

export async function callAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(endpoint, options);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    logger.error('API call failed:', error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('An unexpected error occurred');
  }
}
```

### Form Error Handling

```typescript
import { useState } from 'react';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string().min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
});

export const ContactForm = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData);
    
    try {
      const validData = formSchema.parse(data);
      await submitForm(validData);
      setErrors({});
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields with error display */}
    </form>
  );
};
```

---

## 4. الأمان / Security

### تنظيف المدخلات / Input Sanitization

```typescript
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });
}

// Usage
const SafeContent = ({ html }: { html: string }) => {
  return (
    <div 
      dangerouslySetInnerHTML={{ 
        __html: sanitizeHTML(html) 
      }} 
    />
  );
};
```

### حماية API Routes / Protect API Routes

```typescript
import { verifyJWT } from '@/lib/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function protectedRoute(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }
    
    const payload = await verifyJWT(token);
    
    if (!payload) {
      return NextResponse.json(
        { error: 'توكن غير صالح' },
        { status: 401 }
      );
    }
    
    // Add user to request
    (req as any).user = payload;
    
    return handler(req);
  } catch (error) {
    logger.error('Authentication error:', error);
    return NextResponse.json(
      { error: 'خطأ في المصادقة' },
      { status: 500 }
    );
  }
}
```

---

## 5. الأداء / Performance

### Code Splitting

```typescript
import dynamic from 'next/dynamic';

// Lazy load heavy components
const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <div>جاري التحميل...</div>,
  ssr: false,
});

// Usage
export const Dashboard = () => {
  return (
    <div>
      <h1>لوحة التحكم</h1>
      <HeavyChart />
    </div>
  );
};
```

### Image Optimization

```typescript
import Image from 'next/image';

export const OptimizedImage = () => {
  return (
    <Image
      src="/images/hero.jpg"
      alt="صورة البطل"
      width={1200}
      height={630}
      priority // For above-the-fold images
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..."
    />
  );
};
```

### Memoization

```typescript
import { memo, useMemo, useCallback } from 'react';

interface ItemProps {
  id: string;
  name: string;
  onClick: (id: string) => void;
}

export const Item = memo<ItemProps>(({ id, name, onClick }) => {
  const handleClick = useCallback(() => {
    onClick(id);
  }, [id, onClick]);

  return (
    <div onClick={handleClick}>
      {name}
    </div>
  );
});

Item.displayName = 'Item';
```

---

## 6. التسجيل / Logging

### استخدام Logger Utility

```typescript
import { logger, createNamespacedLogger } from '@/lib/logger';

// Basic logging
logger.log('User logged in');
logger.error('Failed to save data');

// Namespaced logger
const apiLogger = createNamespacedLogger('api');
apiLogger.info('API request started');
apiLogger.error('API request failed', error);

// Component logger
const componentLogger = createNamespacedLogger('ContactForm');
componentLogger.debug('Form submitted', formData);
```

---

## 7. الاختبارات / Testing

### Unit Tests Example

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>اضغط هنا</Button>);
    expect(screen.getByText('اضغط هنا')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>اضغط هنا</Button>);
    
    fireEvent.click(screen.getByText('اضغط هنا'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when loading', () => {
    render(<Button isLoading>اضغط هنا</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

---

## 8. التوثيق / Documentation

### JSDoc Comments

```typescript
/**
 * Fetches project data from the API
 * 
 * @param id - The unique identifier of the project
 * @param options - Optional fetch options
 * @returns Promise resolving to project data
 * @throws {Error} If the project is not found or API fails
 * 
 * @example
 * ```typescript
 * const project = await fetchProject('123');
 * console.log(project.title);
 * ```
 */
export async function fetchProject(
  id: string,
  options?: FetchOptions
): Promise<Project> {
  // Implementation
}
```

---

## 9. Git Commit Messages

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: ميزة جديدة
- `fix`: إصلاح خطأ
- `docs`: توثيق فقط
- `style`: تنسيق الكود
- `refactor`: إعادة هيكلة الكود
- `perf`: تحسين الأداء
- `test`: إضافة اختبارات
- `chore`: مهام صيانة

### Examples
```
feat(auth): add JWT authentication

- Implement login endpoint
- Add token verification
- Create auth middleware

Closes #123
```

---

## 10. Code Review Checklist

### قبل الـ Pull Request / Before PR
- [ ] الكود يعمل بدون أخطاء
- [ ] تم إضافة/تحديث الاختبارات
- [ ] تم تحديث التوثيق
- [ ] تم اتباع معايير الكود
- [ ] لا توجد console.log في الإنتاج
- [ ] تم التحقق من إمكانية الوصول
- [ ] تم اختبار الأداء

---

**تاريخ الإنشاء:** 2025-12-29
**الإصدار:** 1.0
