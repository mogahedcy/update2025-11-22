'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Phone, MessageCircle, ArrowLeft, Star, MapPin, Clock, Shield, Award } from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { generateHeroAltText } from '@/lib/image-alt-text';

const slides = {
  ar: [
    {
      url: '/images/slider1.webp',
      alt: generateHeroAltText('مظلات وبرجولات حدائق فاخرة - تركيب برجولات خشبية ومظلات سيارات'),
    },
    {
      url: '/images/slider2.webp',
      alt: generateHeroAltText('تركيب مظلات سيارات لكسان وحديد عالية الجودة'),
    },
    {
      url: '/images/slider3.webp',
      alt: generateHeroAltText('سواتر حديد وقماش - تنسيق حدائق وساندوتش بانل'),
    },
  ],
  en: [
    {
      url: '/images/slider1.webp',
      alt: 'Luxury garden shades and pergolas - Installing wooden pergolas and car shades in Jeddah | Aldeyar Global Professionals',
    },
    {
      url: '/images/slider2.webp',
      alt: 'Installing high-quality Lexan and iron car shades in Jeddah | Aldeyar Professionals',
    },
    {
      url: '/images/slider3.webp',
      alt: 'Iron and fabric fences - Landscaping and sandwich panel in Jeddah | Aldeyar Global',
    },
  ],
};

export default function HeroSection() {
  const locale = useLocale();
  const t = useTranslations('hero');
  const tFeatures = useTranslations('features');
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const currentSlides = slides[locale as keyof typeof slides] || slides.ar;
  const slideCount = currentSlides.length;
  const isRTL = locale === 'ar';

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideCount);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying, slideCount]);

  const serviceLinks = locale === 'ar' ? [
    { href: '/services/mazallat', label: 'مظلات سيارات جدة' },
    { href: '/services/pergolas', label: 'برجولات حدائق جدة' },
    { href: '/services/sawater', label: 'سواتر خصوصية جدة' },
    { href: '/services/sandwich-panel', label: 'ساندوتش بانل جدة' },
    { href: '/services/landscaping', label: 'تنسيق حدائق جدة' },
    { href: '/services/byoot-shaar', label: 'بيوت شعر تراثية' },
  ] : [
    { href: '/en/services/mazallat', label: 'Car Shades Jeddah' },
    { href: '/en/services/pergolas', label: 'Garden Pergolas Jeddah' },
    { href: '/en/services/sawater', label: 'Privacy Fences Jeddah' },
    { href: '/en/services/sandwich-panel', label: 'Sandwich Panel Jeddah' },
    { href: '/en/services/landscaping', label: 'Landscaping Jeddah' },
    { href: '/en/services/byoot-shaar', label: 'Traditional Houses' },
  ];

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black" 
      aria-label={isRTL ? "قسم البطل الرئيسي" : "Hero Section"}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="absolute inset-0 z-0" role="img" aria-label={currentSlides[currentSlide].alt}>
        {currentSlides.map((slide, index) => (
          <div
            key={`slide-${slide.url}-${index}`}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={slide.url}
              alt={slide.alt}
              fill
              style={{ objectFit: 'cover' }}
              quality={index === 0 ? 75 : 65}
              priority={index === 0}
              fetchPriority={index === 0 ? 'high' : 'low'}
              loading={index === 0 ? 'eager' : 'lazy'}
              sizes="100vw"
              aria-hidden="true"
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMyMzI3MmEiLz48L3N2Zz4="
              decoding="async"
            />
          </div>
        ))}
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/65 to-black/75 z-10" />

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex items-center gap-3">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 shadow-lg focus-visible-ring"
          aria-label={isPlaying ? (isRTL ? 'إيقاف السلايدر' : 'Pause slider') : (isRTL ? 'تشغيل السلايدر' : 'Play slider')}
          aria-pressed={isPlaying}
          type="button"
        >
          {isPlaying ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        <div className="flex gap-2" role="tablist" aria-label={isRTL ? "اختيار الصورة" : "Select image"}>
          {currentSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              type="button"
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 focus-visible-ring ${
                index === currentSlide
                  ? 'bg-white w-8'
                  : 'bg-white/40 hover:bg-white/60'
              }`}
              aria-label={isRTL ? `الصورة ${index + 1}` : `Image ${index + 1}`}
              aria-selected={index === currentSlide}
              aria-current={index === currentSlide ? 'true' : 'false'}
              role="tab"
              tabIndex={index === currentSlide ? 0 : -1}
            />
          ))}
        </div>
      </div>

      <div className="relative z-20 text-center text-white px-4 max-w-7xl mx-auto">
        <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8 animate-fade-in px-4">
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white px-4 py-2.5 sm:px-4 sm:py-2.5 md:px-5 rounded-full text-sm sm:text-sm font-bold shadow-xl flex items-center gap-2 sm:gap-2 transform hover:scale-105 transition-transform">
            <Star className="w-4 h-4 sm:w-4 sm:h-4 fill-current flex-shrink-0" />
            <span className="whitespace-nowrap">{tFeatures('experience')}</span>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white px-4 py-2.5 sm:px-4 sm:py-2.5 md:px-5 rounded-full text-sm sm:text-sm font-bold shadow-xl flex items-center gap-2 sm:gap-2 transform hover:scale-105 transition-transform">
            <Shield className="w-4 h-4 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="whitespace-nowrap">{tFeatures('warranty')}</span>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white px-4 py-2.5 sm:px-4 sm:py-2.5 md:px-5 rounded-full text-sm sm:text-sm font-bold shadow-xl flex items-center gap-2 sm:gap-2 transform hover:scale-105 transition-transform">
            <Award className="w-4 h-4 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="whitespace-nowrap">{t('projects')}</span>
          </div>
        </div>

        <h1 className="hero-title text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-4 sm:mb-6 leading-tight animate-slide-up px-4">
          <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent block drop-shadow-lg">
            {t('companyName')}
          </span>
          <span className="hero-subtitle block text-base sm:text-xl md:text-3xl lg:text-4xl xl:text-5xl mt-2 sm:mt-3 bg-gradient-to-r from-accent via-amber-400 to-accent bg-clip-text text-transparent font-extrabold drop-shadow-lg">
            {t('tagline')}
          </span>
        </h1>

        <p className="text-base sm:text-lg md:text-xl lg:text-xl mb-8 sm:mb-10 text-gray-100 leading-relaxed max-w-4xl mx-auto font-medium px-4 drop-shadow-md">
          {t('description')}
        </p>

        <div className={`flex flex-col sm:flex-row gap-4 sm:gap-5 md:gap-6 justify-center items-stretch sm:items-center mb-8 sm:mb-12 md:mb-16 px-4 max-w-2xl mx-auto ${isRTL ? 'space-x-reverse' : ''}`}>
          <Button 
            asChild 
            size="lg" 
            className="w-full sm:w-auto text-lg sm:text-xl font-bold shadow-2xl bg-gradient-to-r from-accent to-amber-500 hover:from-accent/90 hover:to-amber-500/90 transform hover:scale-105 transition-all duration-300 active:scale-95 py-6 sm:py-7 px-8 sm:px-10 rounded-xl focus-visible-ring"
            aria-label={isRTL ? "تواصل معنا عبر واتساب للحصول على استشارة مجانية" : "Contact us on WhatsApp for a free consultation"}
          >
            <Link href="https://wa.me/+966553719009" className={`flex items-center justify-center gap-3 sm:gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0" />
              <span>{t('freeConsultation')}</span>
            </Link>
          </Button>

          <Button 
            asChild 
            variant="outline" 
            size="lg" 
            className="w-full sm:w-auto text-lg sm:text-xl shadow-xl bg-white/20 backdrop-blur-md border-2 border-white/50 hover:bg-white/30 text-white font-bold transform hover:scale-105 transition-all duration-300 active:scale-95 py-6 sm:py-7 px-8 sm:px-10 rounded-xl focus-visible-ring"
            aria-label={isRTL ? "اتصل بنا على رقم الهاتف" : "Call us on phone"}
          >
            <Link href="tel:+966553719009" className={`flex items-center justify-center gap-3 sm:gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Phone className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0" />
              <span className="text-base sm:text-lg">966553719009+</span>
            </Link>
          </Button>
        </div>

        <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5 md:gap-3 text-sm sm:text-sm max-w-4xl mx-auto px-4">
          {serviceLinks.slice(0, 4).map((link, index) => (
            <Link 
              key={index}
              href={link.href} 
              className="px-4 py-2.5 sm:px-4 sm:py-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 active:bg-white/35 transition-all duration-300 text-white font-medium whitespace-nowrap min-h-[44px] flex items-center justify-center"
            >
              {link.label}
            </Link>
          ))}
          {serviceLinks.slice(4).map((link, index) => (
            <Link 
              key={index + 4}
              href={link.href} 
              className="px-4 py-2.5 sm:px-4 sm:py-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 active:bg-white/35 transition-all duration-300 text-white font-medium whitespace-nowrap min-h-[44px] items-center justify-center hidden sm:flex"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
