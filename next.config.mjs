/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // The receipt route reads the branded fonts and PNG assets with node:fs
  // while producing a PDF. Include those files in its Vercel server bundle.
  outputFileTracingIncludes: {
    '/api/receipts/\\[receiptNumber\\]': ['./public/assets/**/*'],
  },
  // Keep react-pdf in the Node.js server bundle; it relies on Node runtime
  // APIs when rendering a PDF buffer.
  serverExternalPackages: ['@react-pdf/renderer'],
}

export default nextConfig
