import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Liveness + readiness probe for the reverse proxy and the container
// healthcheck. Returns 503 when the database is unreachable so the proxy stops
// routing to a container that can only serve error pages.
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: 'ok', db: 'ok' });
  } catch {
    return NextResponse.json({ status: 'degraded', db: 'unreachable' }, { status: 503 });
  }
}
