import { createClient, type Client } from '@libsql/client'

// Load dotenv only in Node.js environment
if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
  try {
    await import('dotenv/config')
  } catch (e) {
    // dotenv not available in Workers environment, which is fine
  }
}

// Cache for database clients
let cachedDb: Client | null = null

// Helper function to get database client
export function getDb(env?: { TURSO_DATABASE_URL?: string; TURSO_AUTH_TOKEN?: string }): Client {
  // In Cloudflare Workers environment, use env from context
  if (env?.TURSO_DATABASE_URL && env?.TURSO_AUTH_TOKEN) {
    return createClient({
      url: env.TURSO_DATABASE_URL,
      authToken: env.TURSO_AUTH_TOKEN,
    })
  }

  // In Node.js environment, use process.env (cached)
  if (!cachedDb) {
    cachedDb = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!,
    })
  }
  return cachedDb
}

// Default export for Node.js environment - lazy initialization
let defaultClient: Client | null = null
export const db = new Proxy({} as Client, {
  get(target, prop) {
    if (!defaultClient) {
      defaultClient = getDb()
    }
    const value = (defaultClient as any)[prop]
    // Bind methods to the actual client instance to preserve 'this' context
    if (typeof value === 'function') {
      return value.bind(defaultClient)
    }
    return value
  }
})
