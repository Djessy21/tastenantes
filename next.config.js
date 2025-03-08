/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "maps.googleapis.com",
      "storage.googleapis.com", // Si vous utilisez Google Cloud Storage
      "s3.amazonaws.com", // Si vous utilisez AWS S3
      "uploadthing.com", // Si vous utilisez UploadThing
      "utfs.io", // Pour UploadThing
      "placehold.co",
      "via.placeholder.com",
    ],
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
        path: false,
        crypto: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
