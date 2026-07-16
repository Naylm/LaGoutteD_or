import { db } from './db.js';

export async function seedDatabase() {
  const row = await db.get('SELECT COUNT(*) as c FROM pages');
  if (row.c > 0) return;

  const pages = [
    ['gourmands', 'Cocktails gourmands', 'Des cocktails riches et gourmands.', 1],
    ['fruites', 'Cocktails fruités', 'Frais, fruités et acidulés.', 2],
    ['rafraichissants', 'Cocktails rafraîchissants', 'Parfaits pour se désaltérer.', 3],
    ['forts', 'Cocktails forts', 'Pour les amateurs de sensations fortes.', 4],
    ['classiques', 'Cocktails classiques', 'Les incontournables intemporels.', 5]
  ];

  const catAlcoolFort = (await db.run(
    'INSERT INTO categories (name, parent_id, type) VALUES (?, ?, ?)',
    ['Alcools forts', null, 'alcool_fort']
  )).lastID;
  const catDiluant = (await db.run(
    'INSERT INTO categories (name, parent_id, type) VALUES (?, ?, ?)',
    ['Diluants', null, 'diluant']
  )).lastID;
  const catFruit = (await db.run(
    'INSERT INTO categories (name, parent_id, type) VALUES (?, ?, ?)',
    ['Fruits / Jus', null, 'fruit']
  )).lastID;
  const catAutre = (await db.run(
    'INSERT INTO categories (name, parent_id, type) VALUES (?, ?, ?)',
    ['Autres', null, 'autre']
  )).lastID;

  const ingredients = [
    ['Rhum blanc', catAlcoolFort, 1],
    ['Vodka', catAlcoolFort, 1],
    ['Gin', catAlcoolFort, 1],
    ['Tequila', catAlcoolFort, 1],
    ['Whisky', catAlcoolFort, 1],
    ['Triple sec', catAlcoolFort, 1],
    ['Eau gazeuse', catDiluant, 1],
    ['Tonic', catDiluant, 1],
    ['Coca', catDiluant, 1],
    ['Jus de citron', catFruit, 1],
    ['Jus d\'orange', catFruit, 1],
    ['Jus de cranberry', catFruit, 1],
    ['Sirop de sucre', catAutre, 1],
    ['Menthe', catAutre, 1],
    ['Grenadine', catAutre, 1]
  ];

  for (const p of pages) {
    await db.run('INSERT INTO pages (slug, title, description, sort_order) VALUES (?, ?, ?, ?)', p);
  }

  for (const i of ingredients) {
    await db.run('INSERT INTO ingredients (name, category_id, is_available) VALUES (?, ?, ?)', i);
  }

  const cocktails = [
    {
      name: 'Mojito',
      description: 'Cocktail cubain rafraîchissant à base de rhum et de menthe.',
      instructions: 'Piler la menthe avec le sucre, ajouter le rhum, le citron et compléter avec de l\'eau gazeuse.',
      pages: ['rafraichissants', 'classiques'],
      ingredients: [['Rhum blanc', 5, 'cl'], ['Jus de citron', 3, 'cl'], ['Sirop de sucre', 2, 'cl'], ['Menthe', 6, 'feuilles'], ['Eau gazeuse', 10, 'cl']]
    },
    {
      name: 'Tequila Sunrise',
      description: 'Un cocktail coloré et fruité à base de tequila.',
      instructions: 'Verser la tequila et le jus d\'orange sur de la glace, ajouter la grenadine.',
      pages: ['fruites', 'gourmands'],
      ingredients: [['Tequila', 5, 'cl'], ["Jus d'orange", 10, 'cl'], ['Grenadine', 1, 'cl']]
    },
    {
      name: 'Gin Tonic',
      description: 'Classique britannique, simple et efficace.',
      instructions: 'Verser le gin sur de la glace, compléter avec du tonic.',
      pages: ['classiques', 'rafraichissants'],
      ingredients: [['Gin', 5, 'cl'], ['Tonic', 15, 'cl']]
    },
    {
      name: 'Whisky Coca',
      description: 'Cocktail fort et gourmand.',
      instructions: 'Verser le whisky sur de la glace, compléter avec du Coca.',
      pages: ['forts', 'gourmands'],
      ingredients: [['Whisky', 5, 'cl'], ['Coca', 15, 'cl']]
    },
    {
      name: 'Cosmopolitan',
      description: 'Cocktail fruité et élégant.',
      instructions: 'Shaker la vodka, le triple sec, le jus de citron et le cranberry.',
      pages: ['fruites', 'classiques'],
      ingredients: [['Vodka', 4, 'cl'], ['Triple sec', 2, 'cl'], ['Jus de citron', 2, 'cl'], ['Jus de cranberry', 4, 'cl']]
    }
  ];

  for (const c of cocktails) {
    const cocktailId = (await db.run(
      'INSERT INTO cocktails (name, description, instructions) VALUES (?, ?, ?)',
      [c.name, c.description, c.instructions]
    )).lastID;

    for (const [name, qty, unit] of c.ingredients) {
      const ing = await db.get('SELECT id FROM ingredients WHERE name = ?', [name]);
      if (ing) {
        await db.run(
          'INSERT INTO cocktail_ingredients (cocktail_id, ingredient_id, quantity, unit) VALUES (?, ?, ?, ?)',
          [cocktailId, ing.id, qty, unit]
        );
      }
    }

    for (const slug of c.pages) {
      const page = await db.get('SELECT id FROM pages WHERE slug = ?', [slug]);
      if (page) {
        await db.run('INSERT INTO cocktail_pages (cocktail_id, page_id) VALUES (?, ?)', [cocktailId, page.id]);
      }
    }
  }
}
