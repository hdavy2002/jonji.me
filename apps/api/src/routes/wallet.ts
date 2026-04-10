import { Hono } from 'hono';

const wallet = new Hono<{ Bindings: any }>();

wallet.get('/', async (c) => {
  return c.json({ balance: 0.0, currency: 'GBP' });
});

export default wallet;
