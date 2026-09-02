import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker only. `standalone` emits a self-contained server bundle with a
  // pruned node_modules, which is what the runner stage copies. Gated on the
  // build flag so Vercel keeps using its own native output, untouched.
  ...(process.env.DOCKER_BUILD ? { output: 'standalone' as const } : {}),

  /* config options here */

  // ── Dev-only: which hostnames may load the dev client ────────────────────
  // The dev server treats a host it wasn't started on as a foreign origin and
  // refuses the client/HMR handshake. The page still server-renders and looks
  // fine, but React never hydrates — nothing is interactive, and every hot
  // update then throws "Router action dispatched before initialization",
  // because the App Router client it wants to dispatch to was never created.
  //
  // Measured on this project: over `localhost:3000` 1310 elements hydrate;
  // over `127.0.0.1:3000`, 4 — same server, same moment, no console error to
  // explain it. Listing the other ways this machine is reached makes them all
  // behave like `localhost`. No effect on a production build.
  allowedDevOrigins: ['127.0.0.1', 'localhost'],

  images: {
    formats: ['image/avif', 'image/webp'],
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        // 1. ADDED PRINTIFY VIP ACCESS
        protocol: 'https',
        hostname: 'images-api.printify.com',
        port: '',
        pathname: '/**',
      },
      {
        // Printify catalog / blueprint images (Design Studio picker + product mockups)
        protocol: 'https',
        hostname: 'images.printify.com',
        port: '',
        pathname: '/**',
      },
      {
        // Printify's current mockup CDN — where the API now returns product
        // images from. The older printify.com hosts still serve historic
        // mockups (and are kept above), but newly generated ones land here.
        protocol: 'https',
        hostname: 'd123s6f1z9g2wk.cloudfront.net',
        port: '',
        pathname: '/**',
      },
      {
        // Printify S3 mockup buckets (synced store product images)
        protocol: 'https',
        hostname: '**.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        // 2. ADDED PLACEHOLDER ACCESS FOR GATEKEEPER
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.squarespace-cdn.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'drive.google.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'wallpaperaccess.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.bibico.co.uk',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.fbcdn.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.pinimg.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
  experimental: {
    // optimizePackageImports: ['framer-motion', 'lucide-react'],
    // Design Studio sends flattened PNG designs (base64) to the server action.
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
};

export default nextConfig;
