import { Router } from 'express';
import { db } from '../db.js';
import { requireEditor } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  const rows = await db.all('SELECT * FROM pages ORDER BY sort_order, title');
  res.json(rows);
});

router.get('/:slug/cocktails', async (req, res) => {
  const page = await db.get('SELECT * FROM pages WHERE slug = ?', [req.params.slug]);
  if (!page) return res.status(404).json({ error: 'Page non trouvée' });

  const cocktails = await db.all(`
    SELECT c.* FROM cocktails c
    JOIN cocktail_pages cp ON c.id = cp.cocktail_id
    WHERE cp.page_id = ?
    ORDER BY c.name
  `, [page.id]);

  res.json({ page, cocktails });
});

router.post('/', requireEditor, async (req, res) => {
  const { slug, title, description, sort_order } = req.body;
  try {
    const result = await db.run(
      'INSERT INTO pages (slug, title, description, sort_order) VALUES (?, ?, ?, ?)',
      [slug, title, description || '', sort_order || 0]
    );
    res.status(201).json({ id: result.lastID });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.put('/:id', requireEditor, async (req, res) => {
  const { slug, title, description, sort_order } = req.body;
  try {
    await db.run(
      'UPDATE pages SET slug = ?, title = ?, description = ?, sort_order = ? WHERE id = ?',
      [slug, title, description || '', sort_order || 0, req.params.id]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete('/:id', requireEditor, async (req, res) => {
  try {
    await db.run('DELETE FROM pages WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
