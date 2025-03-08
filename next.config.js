/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["maps.googleapis.com"],
    unoptimized: true,
  },
  output: "standalone",
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Ne pas inclure les modules Node.js natifs côté client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        pg: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
