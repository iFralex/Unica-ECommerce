/** @type { import('next').NextConfig } */
const nextConfig = {
  env: {
    API_KEY: "682ecee3c9d1adc99c64a498878b85ca758ec1f755a4a474cb9fbc911b6eae4a0887e130072b2efc1d86da46740c00dd469541c7e1af43acfc5adf4fae56614e4a9bde89b8b5195197e355d356cea7ea30c29d6809d3e50bb94c9999f2d9331a297ec147bf83aca2ca0c856be675c8d234dd9ba77cae5cf9aa2b28868be59a85",
    API_URL: "http://localhost:1337/api/",
    DOMAIN_URL: "http://localhost:1337",
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '**googleusercontent.com',
        pathname: '**',
      },
    ],
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
