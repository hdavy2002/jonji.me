import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  experimental: {
    reactCompiler: false,
  },
}

export default nextConfig
