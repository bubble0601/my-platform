// @ts-check
require("dotenv").config();
const { envsafe, str, url } = require("envsafe");

const env = envsafe({
  NODE_ENV:
    /** @type {import("envsafe").ValidatorSpec<'development' | 'test' | 'production'>} */
    (
      str({
        devDefault: "development",
        choices: ["development", "test", "production"],
      })
    ),
  API_URL: url({
    default: "http://localhost:8080/graphql",
    allowEmpty: true,
  }),
});

const rewrites =
  env.API_URL === ""
    ? []
    : [
        {
          source: "/graphql",
          destination: env.API_URL,
        },
      ];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,
  async rewrites() {
    return rewrites;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: true,
    typedRoutes: true,
    swcPlugins: [["@swc-jotai/react-refresh", {}]],
  },
};

module.exports = nextConfig;
