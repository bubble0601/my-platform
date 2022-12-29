// @ts-check
/* eslint-disable @typescript-eslint/no-var-requires */
const { env } = require('./src/utils/env')
const rewrites =
  env.NODE_ENV === 'production'
    ? []
    : [
        {
          source: '/graphql',
          destination: `${env.API_BASE_URL}/graphql`,
        },
      ]

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,
  async rewrites() {
    return rewrites
  },
}

module.exports = nextConfig
