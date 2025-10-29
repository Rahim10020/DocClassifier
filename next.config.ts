import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '200mb',
    },
  },

  // Augmenter les limites pour les uploads de fichiers
  api: {
    bodyParser: {
      sizeLimit: '200mb',
    },
    responseLimit: '200mb',
  },

  // Headers pour permettre les uploads volumineux
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },

  // Optimisation des images (si nécessaire plus tard)
  images: {
    remotePatterns: [],
  },

  // Webpack config pour les gros fichiers
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

export default nextConfig;