import { Hono } from 'hono';

const inbox = new Hono<{ Bindings: any }>();

inbox.get('/', async (c) => {
  return c.json({ threads: [] });
});

export default inbox;
