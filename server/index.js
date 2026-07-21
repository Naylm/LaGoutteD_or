import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import express from 'express';
import cors from 'cors';
import fs from 'fs';

import './db.js';
import { seedDatabase } from './seed.js';

import cocktailsRouter from './routes/cocktails.js';
import ingredientsRouter from './routes/ingredients.js';
import categoriesRouter from './routes/categories.js';
import pagesRouter from './routes/pages.js';
import uploadsRouter from './routes/uploads.js';
import ordersRouter from './routes/orders.js';
import pushRouter from './routes/push.js';
import { validateLogin } from './middleware/auth.js';

const app = express();
const PORT = process.env.PORT || 3001;
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

app.use('/api/cocktails', cocktailsRouter);
app.use('/api/ingredients', ingredientsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/pages', pagesRouter);
app.use('/api/uploads', uploadsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/push', pushRouter);

app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  if (validateLogin(username, password)) {
    const auth = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');
    res.json({ ok: true, auth });
  } else {
    res.status(401).json({ error: 'Identifiants incorrects.' });
  }
});

const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));

app.get('*', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

async function start() {
  await seedDatabase();
  app.listen(PORT, () => {
    console.log(`Serveur La Goutte d'Or sur http://localhost:${PORT}`);
  });
}

start();
