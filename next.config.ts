import type { NextConfig } from "next";
import { networkInterfaces } from "node:os";

/**
 * Every address this machine can be reached on, for `allowedDevOrigins`.
 *
 * The dev server prints a "Network" URL using the machine's LAN address, and
 * anyone who opens that URL — a phone testing the mobile layout, a second
 * machine, the host's own IP — arrives from an origin the dev client refuses
 * unless it is listed. The failure is silent and confusing: the page
 * server-renders and looks correct, but React never hydrates, so nothing is
 * interactive and every action throws "Router action dispatched before
 * initialization".
 *
 * Reading the interfaces means the list is right on any network without anyone
 * remembering to update it when DHCP hands out a different address. Loopback is
 * excluded because the literals below already cover it.
 *
 * Dev only — `allowedDevOrigins` has no effect on a production build.
 */
function localNetworkHosts(): string[] {
  const hosts = new Set<string>();
  for (const addresses of Object.values(networkInterfaces())) {
    for (const address of addresses ?? []) {
      if (!address.internal && address.address) hosts.add(address.address);
    }
  }
  return [...hosts];
}

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
  //
  // The LAN addresses are appended from `localNetworkHosts()` above, so opening
  // the dev server's own "Network" URL hydrates exactly like localhost does.
  // Listing only the loopback names left that URL — the one used for testing on
  // a phone — permanently broken.
  allowedDevOrigins: ['127.0.0.1', 'localhost', ...localNetworkHosts()],

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
        // Supabase Storage — where the admin panel's own uploads live.
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
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
