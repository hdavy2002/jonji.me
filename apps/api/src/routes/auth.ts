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

// Debug — test OtpService HMAC-SHA256
auth.post('/debug/otp-test', async (c) => {
  try {
    const { OtpService } = await import('@jonji/infrastructure');
    const svc = new OtpService(c.env.LUCIA_SECRET || 'test-secret');
    const code = svc.generateCode();
    const hash = await svc.hashCode(code);
    const verified = await svc.verifyCode(code, hash);
    return c.json({ ok: true, code, hash, verified });
  } catch (e: any) {
    return c.json({ error: e.message, name: e.name, stack: e.stack?.slice(0, 400) }, 500);
  }
});

// Debug — test Redis operations
auth.post('/debug/redis-test', async (c) => {
  try {
    const { Redis } = await import('@upstash/redis');
    const redis = new Redis({
      url: c.env.UPSTASH_REDIS_REST_URL,
      token: c.env.UPSTASH_REDIS_REST_TOKEN,
    });
    // Test set and get
    await redis.set('debug:test', 'hello', { ex: 60 });
    const val = await redis.get('debug:test');
    await redis.del('debug:test');
    return c.json({ ok: true, val });
  } catch (e: any) {
    return c.json({ error: e.message, name: e.name, stack: e.stack?.slice(0, 400) }, 500);
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
  const { email, username } = await c.req.json();
  if (!email || !username) {
    return c.json({ error: 'email and username are required' }, 400);
  }
  try {
    const result = await container.registerUser.execute(email, username);
    return c.json(result);
  } catch (err: any) {
    if (err.message.includes('already taken')) {
      return c.json({ error: err.message }, 409);
    }
    return c.json({ error: err.message }, 400);
  }
});

export default auth;
