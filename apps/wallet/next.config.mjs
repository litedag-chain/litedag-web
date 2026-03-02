/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  transpilePackages: ["@litedag/ui", "@noble/curves", "@noble/hashes"],
}

export default nextConfig
