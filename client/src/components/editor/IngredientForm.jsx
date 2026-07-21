import { useState, useEffect, useMemo } from 'react';
import { getIngredients, getCategories, createIngredient, updateIngredient, deleteIngredient } from '../../api';

export default function IngredientForm({ auth }) {
  const [ingredients, setIngredients] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', category_id: '', is_available: true });
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const filteredIngredients = useMemo(() => {
    let list = [...ingredients];
    const term = searchTerm.trim().toLowerCase();
    if (term) {
      list = list.filter(ing => ing.name.toLowerCase().includes(term));
    }
    if (filterCategory) {
      list = list.filter(ing => String(ing.category_id) === filterCategory || ing.category_name === filterCategory);
    }
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [ingredients, searchTerm, filterCategory]);

  const matches = useMemo(() => {
    const term = form.name.trim().toLowerCase();
    if (!term || term.length < 2) return [];
    return ingredients.filter(ing =>
      ing.name.toLowerCase().includes(term) ||
      term.includes(ing.name.toLowerCase())
    );
  }, [form.name, ingredients]);

  const load = async () => {
    const [iData, cData] = await Promise.all([getIngredients(), getCategories()]);
    setIngredients(iData);
    const flatten = [];
    const walk = (nodes, depth = 0) => {
      for (const n of nodes || []) {
        flatten.push({ ...n, depth });
        walk(n.children, depth + 1);
      }
    };
    walk(cData);
    setCategories(flatten);
  };

  useEffect(() => { load(); }, []);

  const reset = () => {
    setForm({ name: '', category_id: '', is_available: true });
  };

  const isDuplicate = useMemo(() => {
    const term = form.name.trim().toLowerCase();
    return ingredients.some(ing => ing.name.toLowerCase() === term);
  }, [form.name, ingredients]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isDuplicate) {
      setMessage(`Un ingrédient nommé "${form.name}" existe déjà.`);
      return;
    }
    try {
      const data = { ...form, category_id: parseInt(form.category_id) };
      await createIngredient(data, auth);
      setMessage('Ingrédient créé.');
      reset();
      load();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const toggleAvailability = async (ing) => {
    try {
      await updateIngredient(ing.id, {
        name: ing.name,
        category_id: ing.category_id,
        is_available: !ing.is_available
      }, auth);
      load();
      setMessage(`"${ing.name}" ${!ing.is_available ? 'disponible' : 'indisponible'}.`);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const remove = async (id) => {
    if (!confirm('Supprimer cet ingrédient ? Les cocktails qui l\'utilisent deviendront non réalisables.')) return;
    try {
      await deleteIngredient(id, auth);
      load();
      setMessage('Ingrédient supprimé.');
    } catch (err) {
      setMessage(err.message);
    }
  };

  const IngredientRow = ({ ing }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [inlineForm, setInlineForm] = useState({ name: '', category_id: '', is_available: true });

    const startEdit = () => {
      setInlineForm({ name: ing.name, category_id: ing.category_id, is_available: !!ing.is_available });
      setIsEditing(true);
    };

    const handleUpdate = async (e) => {
      e.preventDefault();
      try {
        const data = { ...inlineForm, category_id: parseInt(inlineForm.category_id) };
        await updateIngredient(ing.id, data, auth);
        setMessage('Ingrédient mis à jour.');
        setIsEditing(false);
        load();
      } catch (err) {
        setMessage(err.message);
      }
    };

    return (
      <div className="border border-lgo-border rounded-lg p-3 bg-lgo-card/50 space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer" title={ing.is_available ? 'Disponible' : 'Indisponible'}>
              <input
                type="checkbox"
                checked={!!ing.is_available}
                onChange={() => toggleAvailability(ing)}
                className="w-4 h-4 accent-lgo-gold-dark"
              />
              <span className="text-lgo-gold-light font-medium">{ing.name}</span>
            </label>
            <span className="text-xs text-lgo-gold-light/60">{ing.category_name}</span>
            <span className={`text-xs ${ing.is_available ? 'text-green-400' : 'text-red-400'}`}>
              {ing.is_available ? 'dispo' : 'indispo'}
            </span>
          </div>
          <div className="flex gap-2">
            {!isEditing && (
              <button onClick={startEdit} className="text-xs text-lgo-gold-dark underline">Modifier</button>
            )}
            <button onClick={() => remove(ing.id)} className="text-xs text-red-400 underline">Supprimer</button>
          </div>
        </div>

        {isEditing && (
          <form onSubmit={handleUpdate} className="bg-lgo-bg border border-lgo-gold-dark/30 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                required
                value={inlineForm.name}
                onChange={e => setInlineForm({ ...inlineForm, name: e.target.value })}
                placeholder="Nom"
                className="w-full bg-lgo-card border border-lgo-border rounded-lg px-3 py-2 text-lgo-gold-light"
              />
              <select
                required
                value={inlineForm.category_id}
                onChange={e => setInlineForm({ ...inlineForm, category_id: e.target.value })}
                className="w-full bg-lgo-card border border-lgo-border rounded-lg px-3 py-2 text-lgo-gold-light"
              >
                <option value="">Choisir une catégorie</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {'  '.repeat(cat.depth)}{cat.name}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-lgo-gold-light">
              <input
                type="checkbox"
                checked={inlineForm.is_available}
                onChange={e => setInlineForm({ ...inlineForm, is_available: e.target.checked })}
                className="accent-lgo-gold-dark"
              />
              Disponible
            </label>
            <div className="flex gap-2">
              <button type="submit" className="px-3 py-1.5 rounded-lg bg-lgo-gold-dark text-lgo-bg font-semibold text-xs">Mettre à jour</button>
              <button type="button" onClick={() => setIsEditing(false)} className="px-3 py-1.5 rounded-lg border border-lgo-border text-lgo-gold-light text-xs">Annuler</button>
            </div>
          </form>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className="p-3 rounded bg-lgo-card border border-lgo-border text-lgo-gold-light text-sm">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-lgo-card border border-lgo-border rounded-xl p-4 space-y-4 transition-all">
        <h3 className="font-serif text-lg text-lgo-gold-light">Nouvel ingrédient</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <input
              required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Nom"
              className={`w-full bg-lgo-bg border rounded-lg px-3 py-2 text-lgo-gold-light placeholder:text-lgo-gold-light/40 ${isDuplicate ? 'border-red-500' : 'border-lgo-border'}`}
            />
            {matches.length > 0 && (
              <div className="absolute z-10 left-0 right-0 top-full mt-1 bg-lgo-card border border-lgo-border rounded-lg shadow-lg p-2 max-h-40 overflow-y-auto">
                <p className="text-[10px] uppercase text-lgo-gold-light/50 mb-1">Correspondances</p>
                {matches.map(ing => (
                  <div
                    key={ing.id}
                    className={`text-sm px-2 py-1 rounded ${ing.name.toLowerCase() === form.name.trim().toLowerCase() ? 'text-red-400 font-medium' : 'text-lgo-gold-light/80'}`}
                  >
                    {ing.name} <span className="text-[10px] text-lgo-gold-light/50">({ing.category_name})</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <select
            required
            value={form.category_id}
            onChange={e => setForm({ ...form, category_id: e.target.value })}
            className="w-full bg-lgo-bg border border-lgo-border rounded-lg px-3 py-2 text-lgo-gold-light"
          >
            <option value="">Choisir une catégorie</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {'  '.repeat(cat.depth)}{cat.name}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm text-lgo-gold-light">
          <input
            type="checkbox"
            checked={form.is_available}
            onChange={e => setForm({ ...form, is_available: e.target.checked })}
            className="accent-lgo-gold-dark"
          />
          Disponible
        </label>

        <div className="flex gap-3">
          <button type="submit" className="px-4 py-2 rounded-lg bg-lgo-gold-dark text-lgo-bg font-semibold text-sm">Créer</button>
        </div>
      </form>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h4 className="font-serif text-md text-lgo-gold-light">Ingrédients</h4>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Rechercher un ingrédient..."
              className="flex-1 bg-lgo-bg border border-lgo-border rounded-lg px-3 py-2 text-sm text-lgo-gold-light placeholder:text-lgo-gold-light/40"
            />
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="flex-1 sm:flex-none bg-lgo-bg border border-lgo-border rounded-lg px-3 py-2 text-sm text-lgo-gold-light"
            >
              <option value="">Toutes les catégories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {'  '.repeat(cat.depth)}{cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        {filteredIngredients.map(ing => (
          <IngredientRow key={ing.id} ing={ing} />
        ))}
        {filteredIngredients.length === 0 && (
          <p className="text-sm text-lgo-gold-light/50 text-center py-4">Aucun ingrédient trouvé.</p>
        )}
      </div>
    </div>
  );
}
