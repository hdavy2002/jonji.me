import { Hono } from 'hono';
import { createContainer } from '../container';

const inbox = new Hono<{ Bindings: any }>();
inbox.get('/', async (c) => {
  const container = createContainer(c.env);
  const userId = c.req.header('X-User-Id') || '';
  const threads = await container.getThreads.execute(userId);
  return c.json(threads);
});
export default inbox;
