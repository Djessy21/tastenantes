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
      // Ne pas inclure les modules serveur dans le bundle client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        "pg-native": false,
      };
    }
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ["pg"],
  },
};

module.exports = nextConfig;
