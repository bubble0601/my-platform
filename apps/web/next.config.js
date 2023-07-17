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
    devDefault: "http://localhost:8080",
  }),
});

const rewrites =
  env.NODE_ENV === "production"
    ? []
    : [
        {
          source: "/graphql",
          destination: `${env.API_URL}/graphql`,
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
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
