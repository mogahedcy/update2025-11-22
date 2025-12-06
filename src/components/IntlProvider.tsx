'use client';

import { NextIntlClientProvider } from 'next-intl';
import { ReactNode } from 'react';
import arMessages from '../../messages/ar.json';

interface IntlProviderProps {
  children: ReactNode;
  locale?: string;
}

export default function IntlProvider({ children, locale = 'ar' }: IntlProviderProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={arMessages} timeZone="Asia/Riyadh">
      {children}
    </NextIntlClientProvider>
  );
}
