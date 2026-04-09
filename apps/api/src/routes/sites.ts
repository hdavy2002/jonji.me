import { Hono } from 'hono';
import { createContainer } from '../container';

const sites = new Hono<{ Bindings: any }>();
sites.post('/', async (c) => {
  const container = createContainer(c.env);
  const body = await c.req.json();
  const site = await container.createSite.execute(body.userId, body.description);
  return c.json(site);
});
export default sites;
