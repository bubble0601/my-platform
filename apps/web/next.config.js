const withTM = require('next-transpile-modules')(['@internal/api'])

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,
}

module.exports = withTM(nextConfig)
