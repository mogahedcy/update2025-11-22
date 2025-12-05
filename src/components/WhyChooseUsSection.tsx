'use client';

import { Shield, Clock, Award, Users, Wrench, MapPin, CheckCircle } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

const featureIcons = {
  experience: Award,
  warranty: Shield,
  customers: Users,
  punctuality: Clock,
  comprehensive: Wrench,
  coverage: MapPin,
};

const featureColors = {
  experience: { color: 'text-blue-600', bgColor: 'bg-blue-50' },
  warranty: { color: 'text-green-600', bgColor: 'bg-green-50' },
  customers: { color: 'text-purple-600', bgColor: 'bg-purple-50' },
  punctuality: { color: 'text-orange-600', bgColor: 'bg-orange-50' },
  comprehensive: { color: 'text-red-600', bgColor: 'bg-red-50' },
  coverage: { color: 'text-teal-600', bgColor: 'bg-teal-50' },
};

const statsKeys = ['projects', 'experience', 'services', 'support'];
const featureKeys = ['experience', 'warranty', 'customers', 'punctuality', 'comprehensive', 'coverage'];
const trustBadgeKeys = ['expertSupervision', 'qualityMaterials', 'experiencedLabor', 'globalStandards', 'technicalTeam'];

export default function WhyChooseUsSection() {
  const locale = useLocale();
  const t = useTranslations('whyChooseUs');
  const isRTL = locale === 'ar';

  const features = featureKeys.map((key) => {
    const featureKey = key as keyof typeof featureIcons;
    return {
      key: featureKey,
      icon: featureIcons[featureKey],
      title: t(`features.${featureKey}.title`),
      description: t(`features.${featureKey}.description`),
      highlight: t(`features.${featureKey}.highlight`),
      ...featureColors[featureKey],
    };
  });

  const stats = statsKeys.map((key) => ({
    number: t(`stats.${key}.number`),
    label: t(`stats.${key}.label`),
    description: t(`stats.${key}.description`),
  }));

  const trustBadges = trustBadgeKeys.map((key) => t(`trustBadges.${key}`));

  return (
    <section className="py-20 bg-white" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">
            {t('title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center bg-gradient-to-br from-accent/5 to-primary/5 rounded-2xl p-6">
              <div className="text-4xl md:text-5xl font-bold text-accent mb-2">
                {stat.number}
              </div>
              <div className="text-lg font-semibold text-primary mb-1">
                {stat.label}
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.description}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <div key={feature.key} className="group hover:shadow-xl transition-all duration-300 bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className={`${feature.bgColor} p-6 text-center relative`}>
                  <div className={`inline-flex items-center justify-center w-16 h-16 ${feature.color} bg-white rounded-full mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <IconComponent className="w-8 h-8" />
                  </div>
                  <div className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'} ${feature.color} font-bold text-sm px-3 py-1 bg-white rounded-full shadow-md`}>
                    {feature.highlight}
                  </div>
                  <h3 className="text-xl font-bold text-primary">
                    {feature.title}
                  </h3>
                </div>

                <div className="p-6">
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-3xl p-8 text-center">
          <h3 className="text-2xl font-bold text-primary mb-6">
            {t('trustTitle')}
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
            {trustBadges.map((badge) => (
              <div key={badge} className={`flex items-center ${isRTL ? 'space-x-2 space-x-reverse' : 'space-x-2'}`}>
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium">{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
