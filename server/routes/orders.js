import { Router } from 'express';
import { db } from '../db.js';
import { requireEditor } from '../middleware/auth.js';
import { sendPushToAll } from '../push.js';

const router = Router();

router.get('/', requireEditor, async (req, res) => {
  const orders = await db.all('SELECT * FROM orders ORDER BY created_at DESC');
  for (const order of orders) {
    if (order.cocktail_id) {
      const cocktail = await db.get('SELECT * FROM cocktails WHERE id = ?', [order.cocktail_id]);
      if (cocktail) {
        cocktail.ingredients = await db.all(`
          SELECT i.id, i.name, ci.quantity, ci.unit
          FROM cocktail_ingredients ci
          JOIN ingredients i ON ci.ingredient_id = i.id
          WHERE ci.cocktail_id = ?
        `, [cocktail.id]);
        order.cocktail = cocktail;
      }
    }
  }
  res.json(orders);
});

router.post('/', async (req, res) => {
  const { first_name, cocktail_id } = req.body || {};
  if (!first_name || !first_name.trim() || !cocktail_id) {
    return res.status(400).json({ error: 'Prénom et cocktail requis.' });
  }
  try {
    const cocktail = await db.get('SELECT * FROM cocktails WHERE id = ?', [cocktail_id]);
    if (!cocktail) return res.status(404).json({ error: 'Cocktail non trouvé.' });

    const result = await db.run(
      'INSERT INTO orders (first_name, cocktail_id, cocktail_name) VALUES (?, ?, ?)',
      [first_name.trim(), cocktail_id, cocktail.name]
    );

    sendPushToAll({
      title: 'Nouvelle commande',
      body: `${first_name.trim()} — ${cocktail.name}`
    }).catch(err => console.error('Push error:', err.message));

    res.status(201).json({ id: result.lastID });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.patch('/:id', requireEditor, async (req, res) => {
  const { status } = req.body || {};
  if (!['pending', 'done'].includes(status)) {
    return res.status(400).json({ error: 'Statut invalide.' });
  }
  try {
    await db.run('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete('/:id', requireEditor, async (req, res) => {
  try {
    await db.run('DELETE FROM orders WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
