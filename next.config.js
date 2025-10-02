let withNextIntl = (config) => config;

try {
  withNextIntl = require('next-intl/plugin')('./src/i18n/request.ts');
} catch (error) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      'next-intl plugin could not be loaded. Falling back to default config.',
      error
    );
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [{protocol: 'https', hostname: 'images.unsplash.com'}]
  }
};

module.exports = withNextIntl(nextConfig);
