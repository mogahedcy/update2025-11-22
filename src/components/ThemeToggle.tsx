'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from './theme-provider';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
        aria-label="تبديل الثيم"
      >
        <Sun className="w-5 h-5" />
      </button>
    );
  }

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label={isDark ? 'تبديل إلى الوضع الفاتح' : 'تبديل إلى الوضع الداكن'}
      title={isDark ? 'الوضع الفاتح' : 'الوضع الداكن'}
    >
      {isDark ? (
        <Sun className="w-5 h-5 transition-transform duration-300 rotate-0 hover:rotate-90" />
      ) : (
        <Moon className="w-5 h-5 transition-transform duration-300 rotate-0 hover:-rotate-12" />
      )}
    </button>
  );
}
