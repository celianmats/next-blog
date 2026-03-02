/**
 * Root Layout Component
 * Wraps the entire application with all necessary providers
 */

'use client';

import { ReactNode } from 'react';
import { ApolloProvider } from '../lib/apollo-client';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from './Toast';
import { ThemeProvider } from 'styled-components';
import { useLocale } from 'next-intl';
import { getDirection } from '../lib/rtl-utils';

// ================================
// Global Styles
// ================================
const GlobalStyles = `
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    color: #1a1a1a;
    background: #ffffff;
    line-height: 1.6;
  }

  body[dir="rtl"] {
    font-family: 'Cairo', -apple-system, BlinkMacSystemFont, sans-serif;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button {
    font-family: inherit;
  }

  img {
    max-width: 100%;
    height: auto;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  ::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 5px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #555;
  }

  /* Selection color */
  ::selection {
    background: #667eea;
    color: white;
  }

  ::-moz-selection {
    background: #667eea;
    color: white;
  }
`;

// ================================
// Theme Configuration
// ================================
const createTheme = (locale: string) => ({
  direction: getDirection(locale),
  locale,
  colors: {
    primary: '#667eea',
    primaryDark: '#5568d3',
    secondary: '#764ba2',
    accent: '#e63946',
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    info: '#2196f3',
    text: '#1a1a1a',
    textLight: '#666666',
    textLighter: '#999999',
    background: '#ffffff',
    backgroundGray: '#f8f9fa',
    backgroundDark: '#1a1a1a',
    border: '#e0e0e0',
    borderLight: '#f0f0f0',
  },
  fonts: {
    body: locale === 'ar'
      ? "'Cairo', sans-serif"
      : "'GT America', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    heading: locale === 'ar'
      ? "'Cairo', sans-serif"
      : "'GT America', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'Monaco', 'Courier New', monospace",
  },
  fontSizes: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
    '4xl': '40px',
    '5xl': '48px',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
  },
  breakpoints: {
    mobile: '640px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1280px',
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 2px 8px rgba(0, 0, 0, 0.08)',
    lg: '0 4px 16px rgba(0, 0, 0, 0.12)',
    xl: '0 8px 32px rgba(0, 0, 0, 0.15)',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
});

// ================================
// Providers Component
// ================================
export function Providers({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const theme = createTheme(locale);

  return (
    <ApolloProvider>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <ToastProvider>
            <style dangerouslySetInnerHTML={{ __html: GlobalStyles }} />
            {children}
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </ApolloProvider>
  );
}

// ================================
// Complete App Layout
// ================================
import Header from './Header';
import Footer from './Footer';
import MobileNavigation from './MobileNavigation';

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <MobileNavigation />
        <main style={{ flex: 1 }}>
          {children}
        </main>
        <Footer />
      </div>
    </Providers>
  );
}

// ================================
// Usage Example
// ================================
/*
// apps/web/app/[locale]/layout.tsx

import { AppLayout } from '@/components/AppLayout';
import { NextIntlClientProvider } from 'next-intl';

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = (await import(`../../messages/${locale}.json`)).default;

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AppLayout>
            {children}
          </AppLayout>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
*/

