/** @type {import('next').NextConfig} */

// get the git hash
const cp = require("child_process");
const gitSha = cp.execSync("git rev-parse --short HEAD", {
  cwd: __dirname,
  encoding: "utf8",
});

module.exports = {
  env: {
    GIT_SHA: gitSha,
  },
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
