import { useState, useEffect } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api';

export default function CategoryManager({ auth }) {
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', parent_id: '', type: 'autre' });
  const [message, setMessage] = useState('');

  const load = async () => {
    const data = await getCategories();
    setCategories(data);
  };

  useEffect(() => { load(); }, []);

  const reset = () => {
    setForm({ name: '', parent_id: '', type: 'autre' });
  };

  const flatten = (nodes, depth = 0) => {
    const result = [];
    for (const n of nodes || []) {
      result.push({ ...n, depth });
      result.push(...flatten(n.children, depth + 1));
    }
    return result;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...form,
        parent_id: form.parent_id ? parseInt(form.parent_id) : null
      };
      await createCategory(data, auth);
      setMessage('Catégorie créée.');
      reset();
      load();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const remove = async (id) => {
    if (!confirm('Supprimer cette catégorie ?')) return;
    try {
      await deleteCategory(id, auth);
      load();
      setMessage('Catégorie supprimée.');
    } catch (err) {
      setMessage(err.message);
    }
  };

  const CategoryNode = ({ cat, depth }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [inlineForm, setInlineForm] = useState({ name: '', parent_id: '', type: 'autre' });

    const startEdit = () => {
      setInlineForm({ name: cat.name, parent_id: cat.parent_id || '', type: cat.type });
      setIsEditing(true);
    };

    const handleUpdate = async (e) => {
      e.preventDefault();
      try {
        const data = {
          ...inlineForm,
          parent_id: inlineForm.parent_id ? parseInt(inlineForm.parent_id) : null
        };
        await updateCategory(cat.id, data, auth);
        setMessage('Catégorie mise à jour.');
        setIsEditing(false);
        load();
      } catch (err) {
        setMessage(err.message);
      }
    };

    return (
      <li key={cat.id}>
        <div className="flex justify-between items-center border border-lgo-border rounded-lg p-2 bg-lgo-card/50">
          <div>
            <span className="text-lgo-gold-light font-medium">{cat.name}</span>
            <span className="ml-2 text-xs text-lgo-gold-light/60 uppercase">{cat.type}</span>
          </div>
          <div className="flex gap-2">
            {!isEditing && (
              <button onClick={startEdit} className="text-xs text-lgo-gold-dark underline">Modifier</button>
            )}
            <button onClick={() => remove(cat.id)} className="text-xs text-red-400 underline">Supprimer</button>
          </div>
        </div>

        {isEditing && (
          <form onSubmit={handleUpdate} className="mt-2 bg-lgo-bg border border-lgo-gold-dark/30 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                required
                value={inlineForm.name}
                onChange={e => setInlineForm({ ...inlineForm, name: e.target.value })}
                placeholder="Nom"
                className="w-full bg-lgo-card border border-lgo-border rounded-lg px-3 py-2 text-lgo-gold-light"
              />
              <select
                value={inlineForm.parent_id}
                onChange={e => setInlineForm({ ...inlineForm, parent_id: e.target.value })}
                className="w-full bg-lgo-card border border-lgo-border rounded-lg px-3 py-2 text-lgo-gold-light"
              >
                <option value="">Aucune catégorie parente</option>
                {flatten(categories).filter(c => c.id !== cat.id).map(c => (
                  <option key={c.id} value={c.id}>
                    {'  '.repeat(c.depth)}{c.name}
                  </option>
                ))}
              </select>
              <select
                value={inlineForm.type}
                onChange={e => setInlineForm({ ...inlineForm, type: e.target.value })}
                className="w-full bg-lgo-card border border-lgo-border rounded-lg px-3 py-2 text-lgo-gold-light"
              >
                <option value="alcool_fort">Alcool fort</option>
                <option value="diluant">Diluant</option>
                <option value="fruit">Fruit / Jus</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-3 py-1.5 rounded-lg bg-lgo-gold-dark text-lgo-bg font-semibold text-xs">Mettre à jour</button>
              <button type="button" onClick={() => setIsEditing(false)} className="px-3 py-1.5 rounded-lg border border-lgo-border text-lgo-gold-light text-xs">Annuler</button>
            </div>
          </form>
        )}

        {cat.children?.length > 0 && (
          <ul className={`${depth > 0 ? 'ml-6 border-l border-lgo-border/50 pl-3' : ''} mt-2 space-y-2`}>
            {cat.children.map(child => (
              <CategoryNode key={child.id} cat={child} depth={depth + 1} />
            ))}
          </ul>
        )}
      </li>
    );
  };

  const renderTree = (nodes) => (
    <ul className="space-y-2">
      {nodes.map(cat => (
        <CategoryNode key={cat.id} cat={cat} depth={0} />
      ))}
    </ul>
  );

  return (
    <div className="space-y-6">
      {message && (
        <div className="p-3 rounded bg-lgo-card border border-lgo-border text-lgo-gold-light text-sm">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-lgo-card border border-lgo-border rounded-xl p-4 space-y-4 transition-all">
        <h3 className="font-serif text-lg text-lgo-gold-light">Nouvelle catégorie</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            required
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="Nom"
            className="w-full bg-lgo-bg border border-lgo-border rounded-lg px-3 py-2 text-lgo-gold-light placeholder:text-lgo-gold-light/40"
          />
          <select
            value={form.parent_id}
            onChange={e => setForm({ ...form, parent_id: e.target.value })}
            className="w-full bg-lgo-bg border border-lgo-border rounded-lg px-3 py-2 text-lgo-gold-light"
          >
            <option value="">Aucune catégorie parente</option>
            {flatten(categories).map(cat => (
              <option key={cat.id} value={cat.id}>
                {'  '.repeat(cat.depth)}{cat.name}
              </option>
            ))}
          </select>
          <select
            value={form.type}
            onChange={e => setForm({ ...form, type: e.target.value })}
            className="w-full bg-lgo-bg border border-lgo-border rounded-lg px-3 py-2 text-lgo-gold-light"
          >
            <option value="alcool_fort">Alcool fort</option>
            <option value="diluant">Diluant</option>
            <option value="fruit">Fruit / Jus</option>
            <option value="autre">Autre</option>
          </select>
        </div>

        <div className="flex gap-3">
          <button type="submit" className="px-4 py-2 rounded-lg bg-lgo-gold-dark text-lgo-bg font-semibold text-sm">Créer</button>
        </div>
      </form>

      <div>
        <h4 className="font-serif text-md text-lgo-gold-light mb-3">Arborescence</h4>
        {renderTree(categories)}
      </div>
    </div>
  );
}
