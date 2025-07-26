// next.config.js
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['image.tmdb.org'],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/lib': './app/lib',
      '@/models': './app/models',
      '@/components': './app/components',
    }
    return config
  }
}

export default nextConfig