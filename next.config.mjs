/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/media-planning',
        destination: '/for-brands',
        permanent: true,
      },
      {
        source: '/media-buying',
        destination: '/for-brands',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

