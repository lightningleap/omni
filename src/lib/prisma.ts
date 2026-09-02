import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
// @ts-ignore
import { Pool } from 'pg'

const connectionString = `${process.env.DATABASE_URL}`

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pool: Pool | undefined
}

// Cache the pool on globalThis so dev hot-reloads reuse a single pool
// instead of leaking one (and its pgbouncer slot) on every reload.
const isNewPool = !globalForPrisma.pool
const pool =
  globalForPrisma.pool ??
  new Pool({
    connectionString,
    // A single connection choked concurrent server-component queries and
    // surfaced as "timeout exceeded when trying to connect". A small pool
    // stays within Supabase's transaction-pooler limits while allowing
    // parallel queries. Measured: 11 concurrent queries (the homepage's
    // layout + navbar + page fan-out) clear in ~1.6s through 5 slots, so
    // queueing is not the constraint — establishing a connection is.
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000,
    // The database is a long-haul hop (Supabase ap-northeast-2), where a fresh
    // connection costs ~1.5s of TCP + TLS + auth. Keepalives stop idle sockets
    // being silently dropped by NAT/firewall timers.
    keepAlive: true,
    keepAliveInitialDelayMillis: 5000,
  })

// Open one connection at module load so the first request doesn't pay the ~1.5s
// handshake itself. Failure is ignored on purpose: it is only a warm-up, and
// every caller already handles its own connection errors.
//
// NOTE on "timeout exceeded when trying to connect": that error is pg's acquire
// timer (connectionTimeoutMillis) and it is usually NOT a database problem.
// Measured on this project: TCP connect 180ms, auth 1.5s, and all 11 queries of
// a homepage render complete in ~1.1s through these 5 slots. The timer is a
// setTimeout, so anything that starves the Node event loop for >15s — a
// concurrent `next build`, or dev-server compilation on a low-core machine —
// makes it fire before the connection callback can run, and the DB gets blamed
// for a CPU problem. Check machine load before touching pool settings.
if (isNewPool) {
  pool.query('select 1').catch(() => {})
}

const adapter = new PrismaPg(pool)

const basePrisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

export const prisma = basePrisma.$extends({
  query: {
    product: {
      async deleteMany({ args, query }) {
        if (process.env.NODE_ENV === "production" && (!args || !args.where)) {
           throw new Error("DANGER: Unauthorized attempt to wipe the 'Product' table.")
        }
        return query(args)
      }
    },
    order: {
      async deleteMany({ args, query }) {
        if (process.env.NODE_ENV === "production" && (!args || !args.where)) {
           throw new Error("DANGER: Unauthorized attempt to wipe the 'Order' table.")
        }
        return query(args)
      }
    },
    user: {
      async deleteMany({ args, query }) {
        if (process.env.NODE_ENV === "production" && (!args || !args.where)) {
           throw new Error("DANGER: Unauthorized attempt to wipe the 'User' table.")
        }
        return query(args)
      }
    }
  }
}) as unknown as PrismaClient

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = basePrisma
  globalForPrisma.pool = pool
}

/**
 * Prisma error codes for "the server was not reachable", as opposed to a query
 * the database understood and rejected.
 *   P1001 - can't reach database server
 *   P1002 - server reached but timed out
 *   P1017 - server closed the connection
 */
const TRANSIENT_PRISMA_CODES = new Set(['P1001', 'P1002', 'P1017'])
const TRANSIENT_SYSCALL_CODES = new Set([
  'ENOTFOUND',   // DNS lookup failed — the machine briefly lost its resolver
  'EAI_AGAIN',   // DNS temporary failure
  'ECONNRESET',  // socket killed mid-flight (sleep/wake, NAT timeout, wifi handover)
  'ECONNREFUSED',
  'ETIMEDOUT',
  'EPIPE',
])

function isTransientDbError(error: unknown): boolean {
  for (let e: any = error, depth = 0; e && depth < 5; e = e.cause, depth++) {
    if (TRANSIENT_PRISMA_CODES.has(e.code) || TRANSIENT_SYSCALL_CODES.has(e.code)) return true
    if (typeof e.message === 'string' && /Connection terminated|DatabaseNotReachable/i.test(e.message)) {
      return true
    }
  }
  return false
}

/**
 * Retries a query through a *connection* failure, and only that.
 *
 * This database is a long-haul hop (Supabase ap-northeast-2), so a laptop sleep,
 * a wifi handover or a momentary DNS outage kills the pooled sockets and the
 * next render fails. Observed in this project: DNS dropped for a second or two,
 * `bmmaqomftqsrueqolpdc.supabase.co` and the Postgres pooler both went
 * unreachable together, and the navigation rendered with no categories — from a
 * fault that had already cleared by the time the page reached the browser.
 *
 * Query errors (constraint violations, bad input, P2xxx) are rethrown on the
 * first attempt: retrying those just multiplies the damage. The backoff is
 * deliberately short — this runs inside a request, so the page must not hang
 * waiting on a database that is genuinely down.
 */
export async function withDbRetry<T>(
  operation: () => Promise<T>,
  { attempts = 3, baseDelayMs = 200 }: { attempts?: number; baseDelayMs?: number } = {},
): Promise<T> {
  let lastError: unknown
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      if (attempt === attempts || !isTransientDbError(error)) throw error
      const delay = baseDelayMs * 2 ** (attempt - 1) // 200ms, 400ms
      console.warn(
        `[DB] Connection failure (attempt ${attempt}/${attempts}), retrying in ${delay}ms:`,
        (error as Error)?.message?.split('\n')[0],
      )
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
  throw lastError
}
