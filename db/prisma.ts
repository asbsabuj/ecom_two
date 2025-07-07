import { Pool, neonConfig } from "@neondatabase/serverless"
import { PrismaNeon } from "@prisma/adapter-neon"
import { PrismaClient } from "@/lib/generated/prisma"
import ws from "ws"
import { env } from "@/lib/env/server"

// // Sets up WebSocket connections, which enables Neon to use WebSocket communication.
// neonConfig.webSocketConstructor = ws
// const connectionString = `${process.env.DATABASE_URL}`

// // Creates a new connection pool using the provided connection string, allowing multiple concurrent connections.
// const pool = new Pool({ connectionString })

// // Instantiates the Prisma adapter using the Neon connection pool to handle the connection between Prisma and Neon.
// const adapter = new PrismaNeon({ connectionString })

// // Extends the PrismaClient with a custom result transformer to convert the price and rating fields to strings.
// export const prisma = new PrismaClient({ adapter }).$extends({
//   result: {
//     product: {
//       price: {
//         compute(product) {
//           return product.price.toString()
//         },
//       },
//       rating: {
//         compute(product) {
//           return product.rating.toString()
//         },
//       },
//     },
//   },
// })

// import { PrismaPg } from '@prisma/adapter-pg'
// import { PrismaClient } from './generated/prisma/client'
//

export type GetDbParams = {
  connectionString: string
}

export function getDb({ connectionString }: GetDbParams) {
  const adapter = new PrismaNeon({ connectionString })
  const prisma = new PrismaClient({ adapter }).$extends({
    result: {
      product: {
        price: {
          compute(product) {
            return product.price.toString()
          },
        },
        rating: {
          compute(product) {
            return product.rating.toString()
          },
        },
      },
    },
  })

  return prisma
}

const prisma = getDb({ connectionString: env.DIRECT_URL })
export default prisma
