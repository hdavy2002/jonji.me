import { Hono } from 'hono';
import { ResendEmailService } from '@jonji/infrastructure';
import type { Container } from '../container';

const auth = new Hono<{ Bindings: any; Variables: { container: Container } }>();

// Debug — uses same ResendEmailService directly
auth.post('/debug/resend-test', async (c) => {
  try {
    const svc = new ResendEmailService(c.env.RESEND_API_KEY, c.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev');
    await svc.sendOTP('hdavy2002@gmail.com', '999999');
    return c.json({ ok: true });
  } catch (e: any) {
    return c.json({ error: e.message, stack: e.stack?.slice(0, 400) }, 500);
  }
});

auth.post('/otp/send', async (c) => {
  const container = c.get('container');
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
  const container = c.get('container');
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
  const container = c.get('container');
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
