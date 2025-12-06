'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Car,
  TreePine,
  Shield,
  Flower,
  Home,
  Wrench,
  Tent,
  Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocale, useTranslations } from 'next-intl';

const serviceIcons = {
  carShades: Car,
  sandwichPanel: Home,
  renovation: Wrench,
  pergolas: TreePine,
  fences: Shield,
  traditionalHouses: Home,
  landscaping: Flower,
  royalTents: Tent,
};

const serviceColors: Record<string, { bgColor: string; iconColor: string; badge?: string; badgeColor?: string }> = {
  carShades: { bgColor: 'bg-blue-50', iconColor: 'text-blue-600', badge: 'mostRequested', badgeColor: 'bg-red-500' },
  sandwichPanel: { bgColor: 'bg-orange-50', iconColor: 'text-orange-600' },
  renovation: { bgColor: 'bg-teal-50', iconColor: 'text-teal-600' },
  pergolas: { bgColor: 'bg-green-50', iconColor: 'text-green-600', badge: 'featured', badgeColor: 'bg-amber-500' },
  fences: { bgColor: 'bg-purple-50', iconColor: 'text-purple-600' },
  traditionalHouses: { bgColor: 'bg-amber-50', iconColor: 'text-amber-600' },
  landscaping: { bgColor: 'bg-emerald-50', iconColor: 'text-emerald-600' },
  royalTents: { bgColor: 'bg-rose-50', iconColor: 'text-rose-600' },
};

const serviceRoutes = {
  carShades: 'mazallat',
  sandwichPanel: 'sandwich-panel',
  renovation: 'renovation',
  pergolas: 'pergolas',
  fences: 'sawater',
  traditionalHouses: 'byoot-shaar',
  landscaping: 'landscaping',
  royalTents: 'khayyam',
};

export default function ServicesSection() {
  const locale = useLocale();
  const t = useTranslations('servicesSection');
  const isRTL = locale === 'ar';
  const localePath = locale === 'ar' ? '' : '/en';

  const services = Object.keys(serviceIcons).map((key) => {
    const serviceKey = key as keyof typeof serviceIcons;
    const colors = serviceColors[serviceKey];
    const route = serviceRoutes[serviceKey];
    
    return {
      id: route,
      key: serviceKey,
      title: t(`servicesData.${serviceKey}.title`),
      description: t(`servicesData.${serviceKey}.description`),
      icon: serviceIcons[serviceKey],
      features: [
        t(`servicesData.${serviceKey}.features.0`),
        t(`servicesData.${serviceKey}.features.1`),
      ],
      href: `${localePath}/services/${route}`,
      price: t.has(`servicesData.${serviceKey}.price`) ? t(`servicesData.${serviceKey}.price`) : undefined,
      ...colors,
    };
  });

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": isRTL ? "خدمات محترفين الديار العالمية" : "Aldeyar Global Professionals Services",
    "provider": {
      "@type": "Organization",
      "name": isRTL ? "محترفين الديار العالمية" : "Aldeyar Global Professionals",
      "url": "https://www.aldeyarksa.tech"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": isRTL ? "خدمات محترفين الديار العالمية" : "Aldeyar Global Professionals Services",
      "itemListElement": services
        .filter(service => service.price)
        .map(service => {
          const numericPrice = service.price ? service.price.replace(/[^\d]/g, '') : '';
          if (!numericPrice) return null;
          
          return {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": service.title,
              "description": service.description,
              "serviceType": service.title,
              "url": `https://www.aldeyarksa.tech${service.href}`
            },
            "price": numericPrice,
            "priceCurrency": "SAR",
            "priceSpecification": {
              "@type": "UnitPriceSpecification",
              "priceCurrency": "SAR",
              "price": numericPrice,
              "unitText": isRTL ? "ريال سعودي" : "Saudi Riyal"
            },
            "description": service.price
          };
        })
        .filter(Boolean)
    }
  };

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section id="services" className="py-20 bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            {t('title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 mb-16">
          {services.map((service) => {
            const IconComponent = service.icon;
            return (
              <div key={service.id} className="group relative hover:shadow-2xl transition-all duration-500 bg-white rounded-xl md:rounded-2xl overflow-hidden border-2 border-transparent hover:border-accent hover:-translate-y-1 md:hover:-translate-y-2 active:scale-98">
                {service.badge && (
                  <div className={`absolute top-2 ${isRTL ? 'right-2' : 'left-2'} md:top-3 ${isRTL ? 'md:right-3' : 'md:left-3'} ${service.badgeColor} text-white px-2 py-1 md:px-3 md:py-1 rounded-full text-xs font-bold shadow-lg z-10`}>
                    {t(service.badge)}
                  </div>
                )}

                <div className={`${service.bgColor} p-5 md:p-8 text-center relative`}>
                  <div className={`inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 ${service.iconColor} bg-white rounded-xl md:rounded-2xl mb-3 md:mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                    <IconComponent className="w-8 h-8 md:w-10 md:h-10" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-primary leading-tight">
                    {service.title}
                  </h3>
                </div>

                <div className="p-4 sm:p-6 md:p-8">
                  <p className="text-muted-foreground mb-4 md:mb-6 leading-relaxed text-sm md:text-base font-medium">
                    {service.description}
                  </p>

                  <ul className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                    {service.features.map((feature, index) => (
                      <li key={`${service.id}-feature-${index}`} className="flex items-center text-xs md:text-sm text-muted-foreground">
                        <div className={`w-2 h-2 md:w-2.5 md:h-2.5 bg-gradient-to-r from-accent to-amber-500 rounded-full ${isRTL ? 'ml-2 md:ml-3' : 'mr-2 md:mr-3'} flex-shrink-0 group-hover:scale-125 transition-transform`} />
                        <span className="font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {service.price && (
                    <div className="bg-gradient-to-r from-accent/10 to-amber-500/10 rounded-lg md:rounded-xl p-3 md:p-4 mb-4 md:mb-6 text-center">
                      <p className="text-base md:text-lg font-bold bg-gradient-to-r from-accent to-amber-600 bg-clip-text text-transparent">
                        {service.price}
                      </p>
                    </div>
                  )}

                  <Button asChild variant="outline" size="default" className="w-full group-hover:bg-gradient-to-r group-hover:from-accent group-hover:to-amber-500 group-hover:text-white group-hover:border-transparent transition-all duration-500 font-bold shadow-md group-hover:shadow-xl">
                    <Link href={service.href} className={`flex items-center justify-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                      <span>{t('moreInfo')}</span>
                      <ArrowIcon className={`w-4 h-4 ${isRTL ? 'group-hover:translate-x-2' : 'group-hover:-translate-x-2'} transition-transform duration-300`} />
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center bg-gradient-to-r from-accent/10 to-primary/10 rounded-xl md:rounded-2xl p-5 sm:p-6 md:p-8">
          <h3 className="text-xl sm:text-2xl font-bold text-primary mb-3 md:mb-4 leading-tight">
            {t('ctaTitle')}
          </h3>
          <p className="text-muted-foreground mb-5 md:mb-6 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
            {t('ctaSubtitle')}
          </p>
          <div className={`flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-2xl mx-auto ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="https://wa.me/+966553719009" className={`flex items-center justify-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                <span>{t('contactNow')}</span>
                <ArrowIcon className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href={`${localePath}/portfolio`} className={`flex items-center justify-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                <span>{t('viewPortfolio')}</span>
                <ArrowIcon className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
