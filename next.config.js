/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        buffer: require.resolve('buffer/'),
      };
    }
    return config;
  },
  async redirects() {
    return [
      {
        source: '/register',
        destination: '/signup',
        permanent: true,
      },
    ];
  },
  // ... other config
};

module.exports = nextConfig;
