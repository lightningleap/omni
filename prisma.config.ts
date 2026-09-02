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
  },
})
