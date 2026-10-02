import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Midnight runtime packages ship WASM; enable async WebAssembly for the client bundle.
  webpack: (config, { isServer }) => {
    config.experiments = { ...config.experiments, asyncWebAssembly: true, layers: true, topLevelAwait: true };
    // Async WASM modules need async functions; every browser we target supports them.
    config.output.environment = { ...config.output.environment, asyncFunction: true };
    config.output.webassemblyModuleFilename = isServer ? '../static/wasm/[modulehash].wasm' : 'static/wasm/[modulehash].wasm';
    if (!isServer) {
      config.resolve.alias = { ...config.resolve.alias, 'isomorphic-ws$': path.join(here, 'src/infrastructure/shims/isomorphic-ws.mjs') };
      config.resolve.fallback = { ...config.resolve.fallback, fs: false, path: false, crypto: false, os: false };
    }
    return config;
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
        ]
      }
    ];
  }
};

export default nextConfig;
