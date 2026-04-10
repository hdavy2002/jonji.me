import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import type { Env } from '../env'

export const searchRoutes = new Hono<{ Bindings: Env }>()

searchRoutes.get('/', zValidator('query', z.object({
  q: z.string().min(1).max(500),
})), async (c) => {
  const { q } = c.req.valid('query')
  try {
    const container = c.get('container') as any
    const results = await container.searchStores.execute(q)
    return c.json({ results, query: q, total: results.length })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})