/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pdfkit', 'better-sqlite3'],
  },
}

module.exports = nextConfig
