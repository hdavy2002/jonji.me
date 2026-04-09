import { Hono } from 'hono';
import { createContainer } from '../container';

const wallet = new Hono<{ Bindings: any }>();
wallet.get('/', async (c) => {
  const container = createContainer(c.env);
  const userId = c.req.header('X-User-Id') || '';
  const balance = await container.getWallet.execute(userId);
  return c.json(balance);
});
export default wallet;
