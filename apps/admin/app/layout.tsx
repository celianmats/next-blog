import { ReactNode } from 'react';
import { Providers, StyledComponentsRegistry } from '@republik/ui';
import { NextIntlClientProvider } from 'next-intl';
import { unstable_setRequestLocale } from 'next-intl/server';
import enMessages from '../../web/messages/en.json';

export default function RootLayout({ children }: { children: ReactNode }) {
    unstable_setRequestLocale('en');
    const locale = 'en';

    return (
        <html lang={locale}>
            <body>
                <NextIntlClientProvider locale={locale} messages={enMessages}>
                    <StyledComponentsRegistry>
                        <Providers>
                            {children}
                        </Providers>
                    </StyledComponentsRegistry>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
