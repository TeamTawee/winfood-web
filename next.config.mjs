/** @type {import('next').NextConfig} */
const nextConfig = {
  // เหลือแค่นี้พอครับ
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', 
      },
      {
        protocol: 'http',
        hostname: '**', 
      },
    ],
  },
};

export default nextConfig;