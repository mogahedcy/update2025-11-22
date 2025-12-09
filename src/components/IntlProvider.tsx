'use client';

import { NextIntlClientProvider } from 'next-intl';
import { ReactNode } from 'react';
import arMessages from '../../messages/ar.json';
import enMessages from '../../messages/en.json';

interface IntlProviderProps {
  children: ReactNode;
  locale?: string;
}

export default function IntlProvider({ children, locale = 'ar' }: IntlProviderProps) {
  // Select the appropriate messages based on locale
  const messages = locale === 'en' ? enMessages : arMessages;
  
  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="Asia/Riyadh">
      {children}
    </NextIntlClientProvider>
  );
}
