/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  basePath: "/pelican",
  // for debugging, redirect localhost to /metabolism
  ...(process.env.NODE_ENV === "development" && {
    async redirects() {
      return [
        {
          source: "/",
          destination: "/pelican",
          basePath: false,
          permanent: false,
        },
      ];
    },
  }),
};

module.exports = nextConfig;
