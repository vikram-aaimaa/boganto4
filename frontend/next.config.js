/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', '8000-izw05v1ot9zpyychvegij-6532622b.e2b.dev'],
    unoptimized: process.env.NODE_ENV === 'development',
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000') + '/uploads/:path*'
      }
    ]
  },
  env: {
    BACKEND_URL: process.env.NODE_ENV === 'production' 
      ? 'https://your-backend-domain.com' 
      : 'http://localhost:8000',
  },
}

module.exports = nextConfig