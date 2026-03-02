import { AppLayout, StyledComponentsRegistry } from '@republik/ui';
import { NextIntlClientProvider } from 'next-intl';
import { unstable_setRequestLocale } from 'next-intl/server';

const locales = ['en', 'fr', 'ar'];

export default async function LocaleLayout({
    children,
    params: { locale }
}: {
    children: React.ReactNode;
    params: { locale: string };
}) {
    // Enable static rendering
    unstable_setRequestLocale(locale);

    if (!locales.includes(locale)) {
        return (
            <html lang="en">
                <body>
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <h1>404 - Not Found</h1>
                        <p>This page could not be found.</p>
                    </div>
                </body>
            </html>
        );
    }

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
                    <StyledComponentsRegistry>
                        <AppLayout>
                            {children}
                        </AppLayout>
                    </StyledComponentsRegistry>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
