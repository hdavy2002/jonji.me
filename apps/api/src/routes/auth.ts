import { Hono } from 'hono';
import type { Container } from '../container';

const auth = new Hono<{ Bindings: any }>();

auth.post('/otp/send', async (c) => {
  const container = c.get('container') as Container;
  const { email } = await c.req.json();
  if (!email) return c.json({ error: 'email is required' }, 400);
  try {
    await container.sendOTP.execute(email);
    return c.json({ ok: true, message: 'Code sent to your email' });
  } catch (err: any) {
    if (err.message.includes('Too many requests')) {
      return c.json({ error: err.message }, 429);
    }
    return c.json({ error: err.message }, 400);
  }
});

auth.post('/otp/verify', async (c) => {
  const container = c.get('container') as Container;
  const { email, code } = await c.req.json();
  if (!email || !code) return c.json({ error: 'email and code are required' }, 400);
  try {
    const result = await container.verifyOTP.execute(email, code);
    return c.json(result);
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
});

auth.post('/register', async (c) => {
  const container = c.get('container') as Container;
  const { email, username, code } = await c.req.json();
  if (!email || !username || !code) {
    return c.json({ error: 'email, username, and code are required' }, 400);
  }
  try {
    const result = await container.registerUser.execute(email, username, code);
    return c.json(result);
  } catch (err: any) {
    if (err.message.includes('already taken')) {
      return c.json({ error: err.message }, 409);
    }
    return c.json({ error: err.message }, 400);
  }
});

export default auth;
