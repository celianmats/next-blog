const withNextIntl = require('next-intl/plugin')('./src/i18n/request.ts');

module.exports = withNextIntl({
    reactStrictMode: true,
    compiler: {
        styledComponents: true,
    },
    transpilePackages: ['@republik/ui'],
    images: {
        domains: ['images.unsplash.com', 'ui-avatars.com'],
    },
});
