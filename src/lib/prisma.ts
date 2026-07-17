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
const pool =
  globalForPrisma.pool ??
  new Pool({
    connectionString,
    // A single connection choked concurrent server-component queries and
    // surfaced as "timeout exceeded when trying to connect". A small pool
    // stays within Supabase's transaction-pooler limits while allowing
    // parallel queries.
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000,
  })

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
