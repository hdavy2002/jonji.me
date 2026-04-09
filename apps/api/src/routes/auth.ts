import { Hono } from 'hono';
import { createContainer } from '../container';

const auth = new Hono<{ Bindings: any }>();
auth.post('/register', async (c) => {
  const container = createContainer(c.env);
  const { email, username } = await c.req.json();
  const user = await container.registerUser.execute(email, username);
  return c.json(user);
});
export default auth;
