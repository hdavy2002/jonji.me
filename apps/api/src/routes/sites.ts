import { Hono } from 'hono';
import type { Container } from '../container';

const sites = new Hono<{ Bindings: any; Variables: { container: Container } }>();

sites.post('/', async (c) => {
  const container = c.get('container');
  if (!container.createSite) {
    return c.json({ error: 'Site creation not available' }, 503);
  }
  const body = await c.req.json();
  const site = await container.createSite.execute(body.userId, body.description);
  return c.json(site);
});

export default sites;
