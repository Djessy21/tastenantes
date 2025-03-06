/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["maps.googleapis.com"],
    unoptimized: true,
  },
  output: "standalone",
  reactStrictMode: true,
};

module.exports = nextConfig;
