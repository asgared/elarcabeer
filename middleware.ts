import createMiddleware from 'next-intl/middleware';
import {locales, defaultLocale} from './src/i18n/locales';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',   // URLs como /es-MX/... y /en-US/...
  localeDetection: true
});

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};