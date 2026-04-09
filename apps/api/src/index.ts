import { Hono } from 'hono';
import { createContainer } from './container';
import sites from './routes/sites';
import auth from './routes/auth';
import inbox from './routes/inbox';
import wallet from './routes/wallet';

const app = new Hono<{ Bindings: any }>();

app.route('/sites', sites);
app.route('/auth', auth);
app.route('/inbox', inbox);
app.route('/wallet', wallet);

app.get('/search', async (c) => {
  const container = createContainer(c.env);
  const q = c.req.query('q') || '';
  const results = await container.searchStores.execute(q);
  return c.json(results);
});

export default app;
