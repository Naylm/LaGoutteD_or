import { Router } from 'express';
import { db } from '../db.js';
import { requireEditor } from '../middleware/auth.js';

const router = Router();

async function getCocktailIngredients(cocktailId) {
  return db.all(`
    SELECT i.id, i.name, i.is_available, ci.quantity, ci.unit, c.name as category_name
    FROM cocktail_ingredients ci
    JOIN ingredients i ON ci.ingredient_id = i.id
    JOIN categories c ON i.category_id = c.id
    WHERE ci.cocktail_id = ?
  `, [cocktailId]);
}

async function getCocktailPages(cocktailId) {
  return db.all(`
    SELECT p.* FROM pages p
    JOIN cocktail_pages cp ON p.id = cp.page_id
    WHERE cp.cocktail_id = ?
  `, [cocktailId]);
}

router.get('/', async (req, res) => {
  const onlyAvailable = req.query.available !== 'false';
  let cocktails = await db.all('SELECT * FROM cocktails ORDER BY name');

  for (const c of cocktails) {
    c.ingredients = await getCocktailIngredients(c.id);
    c.pages = await getCocktailPages(c.id);
    c.is_available = c.ingredients.every(i => i.is_available === 1);
  }

  if (onlyAvailable) {
    cocktails = cocktails.filter(c => c.is_available);
  }

  const categoryFilter = req.query.category_id;
  if (categoryFilter) {
    cocktails = cocktails.filter(c =>
      c.ingredients.some(i => i.id == categoryFilter || i.category_name === categoryFilter)
    );
  }

  res.json(cocktails);
});

router.get('/:id', async (req, res) => {
  const cocktail = await db.get('SELECT * FROM cocktails WHERE id = ?', [req.params.id]);
  if (!cocktail) return res.status(404).json({ error: 'Cocktail non trouvé' });
  cocktail.ingredients = await getCocktailIngredients(cocktail.id);
  cocktail.pages = await getCocktailPages(cocktail.id);
  cocktail.is_available = cocktail.ingredients.every(i => i.is_available === 1);
  res.json(cocktail);
});

router.post('/', requireEditor, async (req, res) => {
  const { name, description, instructions, image_url, ingredients, page_ids } = req.body;

  try {
    const result = await db.run(
      'INSERT INTO cocktails (name, description, instructions, image_url) VALUES (?, ?, ?, ?)',
      [name, description || '', instructions || '', image_url || '']
    );
    const cocktailId = result.lastID;

    for (const ing of ingredients || []) {
      await db.run(
        'INSERT INTO cocktail_ingredients (cocktail_id, ingredient_id, quantity, unit) VALUES (?, ?, ?, ?)',
        [cocktailId, ing.ingredient_id, ing.quantity || 0, ing.unit || '']
      );
    }
    for (const pid of page_ids || []) {
      await db.run('INSERT INTO cocktail_pages (cocktail_id, page_id) VALUES (?, ?)', [cocktailId, pid]);
    }
    res.status(201).json({ id: cocktailId });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.put('/:id', requireEditor, async (req, res) => {
  const { name, description, instructions, image_url, ingredients, page_ids } = req.body;

  try {
    await db.run(
      'UPDATE cocktails SET name = ?, description = ?, instructions = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, description || '', instructions || '', image_url || '', req.params.id]
    );
    await db.run('DELETE FROM cocktail_ingredients WHERE cocktail_id = ?', [req.params.id]);
    await db.run('DELETE FROM cocktail_pages WHERE cocktail_id = ?', [req.params.id]);

    for (const ing of ingredients || []) {
      await db.run(
        'INSERT INTO cocktail_ingredients (cocktail_id, ingredient_id, quantity, unit) VALUES (?, ?, ?, ?)',
        [req.params.id, ing.ingredient_id, ing.quantity || 0, ing.unit || '']
      );
    }
    for (const pid of page_ids || []) {
      await db.run('INSERT INTO cocktail_pages (cocktail_id, page_id) VALUES (?, ?)', [req.params.id, pid]);
    }

    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.put('/:id/pages', requireEditor, async (req, res) => {
  const { page_ids } = req.body;
  try {
    await db.run('DELETE FROM cocktail_pages WHERE cocktail_id = ?', [req.params.id]);
    for (const pid of page_ids || []) {
      await db.run('INSERT INTO cocktail_pages (cocktail_id, page_id) VALUES (?, ?)', [req.params.id, pid]);
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete('/:id', requireEditor, async (req, res) => {
  try {
    await db.run('DELETE FROM cocktails WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
