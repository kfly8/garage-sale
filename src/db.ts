import { createClient } from '@libsql/client'

// Load dotenv only in Node.js environment
if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
  try {
    await import('dotenv/config')
  } catch (e) {
    // dotenv not available in Workers environment, which is fine
  }
}

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
})
