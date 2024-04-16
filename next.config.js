// const runtimeCaching = require("next-pwa/cache")
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  // runtimeCaching,
  disable: process.env.NODE_ENV === 'development',
})

/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config')

const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ['res.cloudinary.com', 'localhost'],
  },
  i18n,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
      }
    }

    return config
  },
}

module.exports = withPWA(nextConfig)
