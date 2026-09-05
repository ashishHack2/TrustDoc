/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow type errors during build for faster iteration
    ignoreBuildErrors: true,
  },
  images: { unoptimized: true },
  async rewrites() {
    // Proxy /api/* to the FastAPI backend during development
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
