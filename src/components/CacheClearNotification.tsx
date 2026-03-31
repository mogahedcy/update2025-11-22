'use client';

import { useEffect, useState } from 'react';
import { X, RotateCcw } from 'lucide-react';

interface CacheClearNotificationProps {
  locale: string;
}

export default function CacheClearNotification({ locale }: CacheClearNotificationProps) {
  const [showNotification, setShowNotification] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    // Check if user has visited before
    const hasVisitedBefore = localStorage.getItem('aldeyar_visited');
    
    if (hasVisitedBefore) {
      // Show notification for returning visitors
      setTimeout(() => {
        setShowNotification(true);
      }, 1500); // Show after 1.5 seconds
    } else {
      // Mark as visited for first-time visitors
      localStorage.setItem('aldeyar_visited', 'true');
    }
  }, []);

  const handleClearCache = async () => {
    setIsClearing(true);
    
    try {
      // Clear localStorage (except the visited flag for now)
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key !== 'aldeyar_visited') {
          localStorage.removeItem(key);
        }
      });

      // Clear sessionStorage
      sessionStorage.clear();

      // Clear Service Worker caches if available
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }

      // Unregister service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          registrations.map(registration => registration.unregister())
        );
      }

      // Wait a moment then reload
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('Error clearing cache:', error);
      // Still reload even if there's an error
      window.location.reload();
    }
  };

  const handleDismiss = () => {
    setShowNotification(false);
  };

  if (!showNotification) return null;

  const messages = {
    ar: {
      title: 'تحديثات جديدة متاحة!',
      description: 'للحصول على أحدث التحسينات والميزات، نوصي بتنظيف ذاكرة التخزين المؤقت.',
      clearButton: 'تحديث الآن',
      laterButton: 'لاحقاً',
    },
    en: {
      title: 'New Updates Available!',
      description: 'To get the latest improvements and features, we recommend clearing the cache.',
      clearButton: 'Update Now',
      laterButton: 'Later',
    },
  };

  const msg = messages[locale as keyof typeof messages] || messages.ar;

  return (
    <div className="fixed bottom-20 left-4 right-4 lg:left-auto lg:right-6 lg:bottom-6 z-[9999] animate-slide-up">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg shadow-2xl p-4 max-w-md mx-auto lg:mx-0">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 mt-0.5">
            <div className="relative">
              <RotateCcw className="w-6 h-6 animate-spin-slow" />
              <div className="absolute inset-0 bg-white/20 rounded-full blur-sm" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base mb-1">
              {msg.title}
            </h3>
            <p className="text-sm text-white/90 leading-relaxed">
              {msg.description}
            </p>

            {/* Buttons */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleClearCache}
                disabled={isClearing}
                className="flex-1 bg-white text-emerald-600 hover:bg-emerald-50 px-4 py-2 rounded-md font-semibold text-sm transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isClearing ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    <span>{locale === 'ar' ? 'جاري التحديث...' : 'Updating...'}</span>
                  </>
                ) : (
                  msg.clearButton
                )}
              </button>
              <button
                onClick={handleDismiss}
                disabled={isClearing}
                className="px-4 py-2 rounded-md font-semibold text-sm transition-all duration-200 hover:bg-white/10 active:scale-95 disabled:opacity-50"
              >
                {msg.laterButton}
              </button>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={handleDismiss}
            disabled={isClearing}
            className="flex-shrink-0 text-white/70 hover:text-white transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
