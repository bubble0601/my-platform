// @ts-check
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,
  experimental: {
    transpilePackages: ['@internal/api'],
  },
}

module.exports = nextConfig
