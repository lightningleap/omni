import { defineConfig } from '@prisma/config'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env') })

export default defineConfig({
  datasource: {
    /**
     * For 'db push' and migrations, Prisma needs the direct connection.
     * We use DIRECT_URL here so the CLI can bypass the pooler routing issues.
     */
    url: process.env.DIRECT_URL,
    /**
     * Only the CLI reads this, and only for `migrate diff --from-migrations`
     * and `migrate dev`, which need a throwaway database to replay the
     * migration history into. Never point it at production — Prisma resets
     * whatever database this names.
     *
     *   docker run -d --name unrwly-shadow -e POSTGRES_PASSWORD=shadow \
     *     -e POSTGRES_DB=shadow -p 5433:5432 postgres:17-alpine
     *   SHADOW_DATABASE_URL=postgresql://postgres:shadow@localhost:5433/shadow
     */
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  },
})
