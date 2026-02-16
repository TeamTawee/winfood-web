/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // อนุญาตทุกเว็บไซต์ในโลกที่เป็น https
      },
      {
        protocol: 'http',
        hostname: '**', // อนุญาตทุกเว็บไซต์ที่เป็น http
      },
    ],
  },
};

export default nextConfig;