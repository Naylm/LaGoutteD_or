import { Router } from 'express';
import { db } from '../db.js';
import { requireEditor } from '../middleware/auth.js';

const router = Router();

function buildTree(rows, parentId = null) {
  return rows
    .filter(r => r.parent_id === parentId)
    .map(r => ({
      ...r,
      children: buildTree(rows, r.id)
    }));
}

router.get('/', async (req, res) => {
  const rows = await db.all('SELECT * FROM categories ORDER BY type, name');
  res.json(buildTree(rows));
});

router.get('/flat', async (req, res) => {
  const rows = await db.all('SELECT * FROM categories ORDER BY name');
  res.json(rows);
});

router.post('/', requireEditor, async (req, res) => {
  const { name, parent_id, type } = req.body;
  try {
    const result = await db.run(
      'INSERT INTO categories (name, parent_id, type) VALUES (?, ?, ?)',
      [name, parent_id || null, type || 'autre']
    );
    res.status(201).json({ id: result.lastID });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.put('/:id', requireEditor, async (req, res) => {
  const { name, parent_id, type } = req.body;
  try {
    await db.run(
      'UPDATE categories SET name = ?, parent_id = ?, type = ? WHERE id = ?',
      [name, parent_id || null, type || 'autre', req.params.id]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete('/:id', requireEditor, async (req, res) => {
  try {
    await db.run('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
