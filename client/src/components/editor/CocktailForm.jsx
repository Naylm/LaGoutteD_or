import { useState, useEffect, useMemo, useCallback } from 'react';
import { getCocktails, getIngredients, getPages, createCocktail, updateCocktail, deleteCocktail } from '../../api';
import ImageDropZone from './ImageDropZone';
import EditModal from './EditModal';

const SORTS = [
  { id: 'name', label: 'Nom' },
  { id: 'category', label: 'Catégorie' },
  { id: 'available', label: 'Dispo' }
];

function IngredientSelector({ ingredients, selected, onToggle, onChange }) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');

  const filtered = useMemo(() => {
    let list = ingredients.filter(ing =>
      ing.name.toLowerCase().includes(search.trim().toLowerCase())
    );
    list.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'category') return (a.category_name || '').localeCompare(b.category_name || '') || a.name.localeCompare(b.name);
      if (sortBy === 'available') return (b.is_available || 0) - (a.is_available || 0) || a.name.localeCompare(b.name);
      return 0;
    });
    return list;
  }, [ingredients, search, sortBy]);

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un ingrédient..."
          className="flex-1 bg-lgo-card border border-lgo-border rounded-lg px-3 py-2 text-sm text-lgo-gold-light placeholder:text-lgo-gold-light/40"
        />
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="bg-lgo-card border border-lgo-border rounded-lg px-3 py-2 text-sm text-lgo-gold-light"
        >
          {SORTS.map(s => (
            <option key={s.id} value={s.id}>Trier par {s.label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 min-w-0">
        {filtered.map(ing => {
          const sel = selected.find(i => i.ingredient_id === ing.id);
          return (
            <div
              key={ing.id}
              className={`border rounded-lg p-2 min-w-0 overflow-hidden transition-colors ${
                sel ? 'border-lgo-gold-dark bg-lgo-bg/50' : 'border-lgo-border/50'
              }`}
            >
              <label className="flex items-center gap-2 text-sm text-lgo-gold-light cursor-pointer min-w-0">
                <input
                  type="checkbox"
                  checked={!!sel}
                  onChange={e => {
                    if (e.target.checked) {
                      onToggle(ing.id, true);
                    } else {
                      onToggle(ing.id, false);
                    }
                  }}
                  className="accent-lgo-gold-dark shrink-0"
                />
                <span className="flex-1 min-w-0 truncate">{ing.name}</span>
                <span className="text-[10px] text-lgo-gold-light/50 uppercase shrink-0">{ing.category_name}</span>
                <span className={`text-[10px] shrink-0 ${ing.is_available ? 'text-green-400' : 'text-red-400'}`}>
                  {ing.is_available ? 'dispo' : 'indispo'}
                </span>
              </label>
              {sel && (
                <div className="flex gap-2 mt-2 min-w-0">
                  <input
                    type="number"
                    step="0.1"
                    value={sel.quantity}
                    onChange={e => onChange(ing.id, 'quantity', parseFloat(e.target.value))}
                    placeholder="Qté"
                    className="w-16 min-w-0 shrink-0 bg-lgo-bg border border-lgo-border rounded px-2 py-1 text-xs text-lgo-gold-light"
                  />
                  <input
                    value={sel.unit}
                    onChange={e => onChange(ing.id, 'unit', e.target.value)}
                    placeholder="Unité"
                    className="w-20 min-w-0 shrink-0 bg-lgo-bg border border-lgo-border rounded px-2 py-1 text-xs text-lgo-gold-light"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-lgo-gold-light/50 text-center py-4">Aucun ingrédient trouvé.</p>
      )}
    </div>
  );
}

export default function CocktailForm({ auth }) {
  const [cocktails, setCocktails] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [pages, setPages] = useState([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    instructions: '',
    image_url: '',
    ingredients: [],
    page_id: ''
  });
  const [message, setMessage] = useState('');

  const load = async () => {
    const scrollY = window.scrollY;
    const [cData, iData, pData] = await Promise.all([
      getCocktails('?available=false'),
      getIngredients(),
      getPages()
    ]);
    setCocktails(cData);
    setIngredients(iData);
    setPages(pData);
    requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo({ top: scrollY, behavior: 'instant' })));
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm({ name: '', description: '', instructions: '', image_url: '', ingredients: [], page_id: '' });
  };

  const handleIngredientChange = (ingredientId, field, value) => {
    setForm(prev => {
      const existing = prev.ingredients.find(i => i.ingredient_id === ingredientId);
      if (existing) {
        return {
          ...prev,
          ingredients: prev.ingredients.map(i =>
            i.ingredient_id === ingredientId ? { ...i, [field]: value } : i
          )
        };
      }
      return {
        ...prev,
        ingredients: [...prev.ingredients, { ingredient_id: ingredientId, quantity: 0, unit: '' }]
      };
    });
  };

  const setPage = (pageId) => {
    setForm(prev => ({ ...prev, page_id: pageId }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...form,
      page_ids: form.page_id ? [parseInt(form.page_id)] : []
    };
    try {
      await createCocktail(data, auth);
      await load();
      setMessage('Cocktail créé.');
      resetForm();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const remove = useCallback(async (id) => {
    if (!confirm('Supprimer ce cocktail ?')) return;
    try {
      await deleteCocktail(id, auth);
      load();
      setMessage('Cocktail supprimé.');
    } catch (err) {
      setMessage(err.message);
    }
  }, [auth]);

  return (
    <div className="space-y-6">
      {message && (
        <div className="p-3 rounded bg-lgo-card border border-lgo-border text-lgo-gold-light text-sm">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-lgo-card border border-lgo-border rounded-xl p-4 space-y-4 transition-all">
        <h3 className="font-serif text-lg text-lgo-gold-light">Nouveau cocktail</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            required
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="Nom"
            className="w-full bg-lgo-bg border border-lgo-border rounded-lg px-3 py-2 text-lgo-gold-light placeholder:text-lgo-gold-light/40"
          />
          <input
            value={form.image_url}
            onChange={e => setForm({ ...form, image_url: e.target.value })}
            placeholder="URL ou chemin de l'image"
            className="w-full bg-lgo-bg border border-lgo-border rounded-lg px-3 py-2 text-lgo-gold-light placeholder:text-lgo-gold-light/40"
          />
        </div>

        <ImageDropZone
          imageUrl={form.image_url}
          onImageUrl={(url) => setForm(prev => ({ ...prev, image_url: url }))}
          auth={auth}
          label="Glissez une image ici pour le cocktail"
        />

        <div>
          <h4 className="text-sm text-lgo-gold-dark mb-2">Ingrédients</h4>
          <IngredientSelector
            ingredients={ingredients}
            selected={form.ingredients}
            onToggle={(id, checked) => {
              if (checked) handleIngredientChange(id, 'quantity', 0);
              else setForm(prev => ({ ...prev, ingredients: prev.ingredients.filter(i => i.ingredient_id !== id) }));
            }}
            onChange={handleIngredientChange}
          />
        </div>

        <textarea
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          placeholder="Description courte"
          rows={2}
          className="w-full bg-lgo-bg border border-lgo-border rounded-lg px-3 py-2 text-lgo-gold-light placeholder:text-lgo-gold-light/40"
        />

        <textarea
          value={form.instructions}
          onChange={e => setForm({ ...form, instructions: e.target.value })}
          placeholder="Instructions de préparation"
          rows={3}
          className="w-full bg-lgo-bg border border-lgo-border rounded-lg px-3 py-2 text-lgo-gold-light placeholder:text-lgo-gold-light/40"
        />

        <div>
          <label className="block text-sm text-lgo-gold-dark mb-2">Page</label>
          <div className="flex flex-col gap-2">
            {pages.map(page => (
              <button
                key={page.id}
                type="button"
                onClick={() => setPage(String(page.id))}
                className={`text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
                  form.page_id === String(page.id)
                    ? 'bg-lgo-gold-dark text-lgo-bg border-lgo-gold-dark'
                    : 'bg-lgo-bg border-lgo-border text-lgo-gold-light hover:border-lgo-gold-dark/50'
                }`}
              >
                {page.title}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" className="px-4 py-2 rounded-lg bg-lgo-gold-dark text-lgo-bg font-semibold text-sm">Créer</button>
        </div>
      </form>

      <div className="space-y-2">
        <h4 className="font-serif text-md text-lgo-gold-light">Cocktails existants</h4>
        {cocktails.map(c => (
          <CocktailRow
            key={c.id}
            cocktail={c}
            ingredients={ingredients}
            pages={pages}
            auth={auth}
            onUpdated={load}
            onDeleted={remove}
            setMessage={setMessage}
          />
        ))}
      </div>
    </div>
  );
}

function CocktailRow({ cocktail, ingredients, pages, auth, onUpdated, onDeleted, setMessage }) {
  const [isEditing, setIsEditing] = useState(false);
  const [inlineForm, setInlineForm] = useState({
    name: '',
    description: '',
    instructions: '',
    image_url: '',
    ingredients: [],
    page_id: ''
  });

  const startEdit = () => {
    setInlineForm({
      name: cocktail.name,
      description: cocktail.description || '',
      instructions: cocktail.instructions || '',
      image_url: cocktail.image_url || '',
      ingredients: cocktail.ingredients.map(i => ({
        ingredient_id: i.id,
        quantity: i.quantity,
        unit: i.unit
      })),
      page_id: cocktail.pages[0]?.id || ''
    });
    setIsEditing(true);
  };

  const handleInlineIngredientChange = (ingredientId, field, value) => {
    setInlineForm(prev => {
      const existing = prev.ingredients.find(i => i.ingredient_id === ingredientId);
      if (existing) {
        return {
          ...prev,
          ingredients: prev.ingredients.map(i =>
            i.ingredient_id === ingredientId ? { ...i, [field]: value } : i
          )
        };
      }
      return {
        ...prev,
        ingredients: [...prev.ingredients, { ingredient_id: ingredientId, quantity: 0, unit: '' }]
      };
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const data = {
      ...inlineForm,
      page_ids: inlineForm.page_id ? [parseInt(inlineForm.page_id)] : []
    };
    try {
      await updateCocktail(cocktail.id, data, auth);
      await onUpdated();
      setMessage('Cocktail mis à jour.');
      setIsEditing(false);
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="border border-lgo-border rounded-lg p-3 bg-lgo-card/50 space-y-3">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-lgo-gold-light font-medium">{cocktail.name}</span>
          <span className={`ml-2 text-xs ${cocktail.is_available ? 'text-green-400' : 'text-red-400'}`}>
            {cocktail.is_available ? 'réalisable' : 'incomplet'}
          </span>
        </div>
        <div className="flex gap-2">
          {!isEditing && (
            <button onClick={startEdit} className="text-xs text-lgo-gold-dark underline">Modifier</button>
          )}
          <button onClick={() => onDeleted(cocktail.id)} className="text-xs text-red-400 underline">Supprimer</button>
        </div>
      </div>

      {isEditing && (
        <EditModal title={`Modifier « ${cocktail.name} »`} onClose={() => setIsEditing(false)}>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                required
                value={inlineForm.name}
                onChange={e => setInlineForm({ ...inlineForm, name: e.target.value })}
                placeholder="Nom"
                className="w-full bg-lgo-bg border border-lgo-border rounded-lg px-3 py-2 text-lgo-gold-light"
              />
              <input
                value={inlineForm.image_url}
                onChange={e => setInlineForm({ ...inlineForm, image_url: e.target.value })}
                placeholder="URL ou chemin de l'image"
                className="w-full bg-lgo-bg border border-lgo-border rounded-lg px-3 py-2 text-lgo-gold-light"
              />
            </div>

            <ImageDropZone
              imageUrl={inlineForm.image_url}
              onImageUrl={(url) => setInlineForm(prev => ({ ...prev, image_url: url }))}
              auth={auth}
              label="Glissez une nouvelle image ici pour la remplacer"
            />

            <textarea
              value={inlineForm.description}
              onChange={e => setInlineForm({ ...inlineForm, description: e.target.value })}
              placeholder="Description courte"
              rows={2}
              className="w-full bg-lgo-bg border border-lgo-border rounded-lg px-3 py-2 text-lgo-gold-light"
            />

            <textarea
              value={inlineForm.instructions}
              onChange={e => setInlineForm({ ...inlineForm, instructions: e.target.value })}
              placeholder="Instructions de préparation"
              rows={3}
              className="w-full bg-lgo-bg border border-lgo-border rounded-lg px-3 py-2 text-lgo-gold-light"
            />

            <div>
              <h4 className="text-sm text-lgo-gold-dark mb-2">Ingrédients</h4>
              <IngredientSelector
                ingredients={ingredients}
                selected={inlineForm.ingredients}
                onToggle={(id, checked) => {
                  if (checked) handleInlineIngredientChange(id, 'quantity', 0);
                  else setInlineForm(prev => ({ ...prev, ingredients: prev.ingredients.filter(i => i.ingredient_id !== id) }));
                }}
                onChange={handleInlineIngredientChange}
              />
            </div>

            <div>
              <label className="block text-sm text-lgo-gold-dark mb-2">Page</label>
              <div className="flex flex-col gap-2">
                {pages.map(page => (
                  <button
                    key={page.id}
                    type="button"
                    onClick={() => setInlineForm(prev => ({ ...prev, page_id: String(page.id) }))}
                    className={`text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
                      inlineForm.page_id === String(page.id)
                        ? 'bg-lgo-gold-dark text-lgo-bg border-lgo-gold-dark'
                        : 'bg-lgo-bg border-lgo-border text-lgo-gold-light hover:border-lgo-gold-dark/50'
                    }`}
                  >
                    {page.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-lgo-border/50">
              <button type="submit" className="px-4 py-2 rounded-lg bg-lgo-gold-dark text-lgo-bg font-semibold text-sm">Mettre à jour</button>
              <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-lg border border-lgo-border text-lgo-gold-light text-sm">Annuler</button>
            </div>
          </form>
        </EditModal>
      )}
    </div>
  );
}
