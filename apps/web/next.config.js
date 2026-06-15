const createNextIntlPlugin = require("next-intl/plugin");

const withNextIntl = createNextIntlPlugin("./src/lib/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@kaemform/shared"],
  reactStrictMode: true,
};

module.exports = withNextIntl(nextConfig);
