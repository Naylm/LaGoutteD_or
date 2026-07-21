import { Router } from 'express';
import { db } from '../db.js';
import { requireEditor } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  const rows = await db.all(`
    SELECT i.*, c.name as category_name, c.type as category_type
    FROM ingredients i
    JOIN categories c ON i.category_id = c.id
    ORDER BY c.type, i.name
  `);
  res.json(rows);
});

router.post('/', requireEditor, async (req, res) => {
  const { name, category_id, is_available } = req.body;
  try {
    const existing = await db.get(
      'SELECT id FROM ingredients WHERE LOWER(name) = LOWER(?)',
      [name]
    );
    if (existing) {
      return res.status(400).json({ error: `Un ingrédient nommé "${name}" existe déjà.` });
    }
    const result = await db.run(
      'INSERT INTO ingredients (name, category_id, is_available) VALUES (?, ?, ?)',
      [name, category_id, is_available ? 1 : 0]
    );
    res.status(201).json({ id: result.lastID });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.put('/:id', requireEditor, async (req, res) => {
  const { name, category_id, is_available } = req.body;
  try {
    const existing = await db.get(
      'SELECT id FROM ingredients WHERE LOWER(name) = LOWER(?) AND id != ?',
      [name, req.params.id]
    );
    if (existing) {
      return res.status(400).json({ error: `Un ingrédient nommé "${name}" existe déjà.` });
    }
    await db.run(
      'UPDATE ingredients SET name = ?, category_id = ?, is_available = ? WHERE id = ?',
      [name, category_id, is_available ? 1 : 0, req.params.id]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete('/:id', requireEditor, async (req, res) => {
  try {
    await db.run('DELETE FROM ingredients WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
