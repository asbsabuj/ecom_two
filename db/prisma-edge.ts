import { withAccelerate } from "@prisma/extension-accelerate"
import { PrismaClient } from "@/lib/generated/prisma"
import { env } from "@/lib/env/server"

export type GetDbParams = {
  connectionString: string
}

export function getDb({ connectionString }: GetDbParams) {
  const prisma = new PrismaClient({
    datasourceUrl: connectionString,
  }).$extends(withAccelerate())

  return prisma
}

const prisma = getDb({ connectionString: env.DATABASE_URL })
export default prisma
