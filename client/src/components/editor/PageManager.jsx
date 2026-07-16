import { useState, useEffect } from 'react';
import { getPages, createPage, updatePage, deletePage } from '../../api';

export default function PageManager({ auth }) {
  const [pages, setPages] = useState([]);
  const [form, setForm] = useState({ slug: '', title: '', description: '', sort_order: 0 });
  const [message, setMessage] = useState('');

  const load = async () => {
    const data = await getPages();
    setPages(data);
  };

  useEffect(() => { load(); }, []);

  const reset = () => {
    setForm({ slug: '', title: '', description: '', sort_order: 0 });
  };

  const slugify = (str) => {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...form,
        slug: form.slug || slugify(form.title),
        sort_order: parseInt(form.sort_order) || 0
      };
      await createPage(data, auth);
      setMessage('Page créée.');
      reset();
      load();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const remove = async (id) => {
    if (!confirm('Supprimer cette page ? Les cocktails associés ne seront plus visibles dessus.')) return;
    try {
      await deletePage(id, auth);
      load();
      setMessage('Page supprimée.');
    } catch (err) {
      setMessage(err.message);
    }
  };

  const PageRow = ({ page }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [inlineForm, setInlineForm] = useState({ slug: '', title: '', description: '', sort_order: 0 });

    const startEdit = () => {
      setInlineForm({
        slug: page.slug,
        title: page.title,
        description: page.description || '',
        sort_order: page.sort_order || 0
      });
      setIsEditing(true);
    };

    const handleUpdate = async (e) => {
      e.preventDefault();
      try {
        const data = {
          ...inlineForm,
          slug: inlineForm.slug || slugify(inlineForm.title),
          sort_order: parseInt(inlineForm.sort_order) || 0
        };
        await updatePage(page.id, data, auth);
        setMessage('Page mise à jour.');
        setIsEditing(false);
        load();
      } catch (err) {
        setMessage(err.message);
      }
    };

    return (
      <div className="border border-lgo-border rounded-lg p-3 bg-lgo-card/50 space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-lgo-gold-light font-medium">{page.title}</span>
            <span className="ml-2 text-xs text-lgo-gold-light/50">/{page.slug}</span>
            <span className="ml-2 text-xs text-lgo-gold-light/40">ordre {page.sort_order}</span>
          </div>
          <div className="flex gap-2">
            {!isEditing && (
              <button onClick={startEdit} className="text-xs text-lgo-gold-dark underline">Modifier</button>
            )}
            <button onClick={() => remove(page.id)} className="text-xs text-red-400 underline">Supprimer</button>
          </div>
        </div>

        {isEditing && (
          <form onSubmit={handleUpdate} className="bg-lgo-bg border border-lgo-gold-dark/30 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                required
                value={inlineForm.title}
                onChange={e => setInlineForm({ ...inlineForm, title: e.target.value })}
                placeholder="Titre"
                className="w-full bg-lgo-card border border-lgo-border rounded-lg px-3 py-2 text-lgo-gold-light"
              />
              <input
                value={inlineForm.slug}
                onChange={e => setInlineForm({ ...inlineForm, slug: e.target.value })}
                placeholder="Slug"
                className="w-full bg-lgo-card border border-lgo-border rounded-lg px-3 py-2 text-lgo-gold-light"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                value={inlineForm.description}
                onChange={e => setInlineForm({ ...inlineForm, description: e.target.value })}
                placeholder="Description courte"
                className="w-full bg-lgo-card border border-lgo-border rounded-lg px-3 py-2 text-lgo-gold-light"
              />
              <input
                type="number"
                value={inlineForm.sort_order}
                onChange={e => setInlineForm({ ...inlineForm, sort_order: e.target.value })}
                placeholder="Ordre d'affichage"
                className="w-full bg-lgo-card border border-lgo-border rounded-lg px-3 py-2 text-lgo-gold-light"
              />
            </div>
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

      <form onSubmit={handleSubmit} className="bg-lgo-card border border-lgo-border rounded-xl p-4 space-y-4">
        <h3 className="font-serif text-lg text-lgo-gold-light">Nouvelle page</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            required
            value={form.title}
            onChange={e => {
              const title = e.target.value;
              setForm(prev => ({
                ...prev,
                title,
                slug: slugify(title)
              }));
            }}
            placeholder="Titre"
            className="w-full bg-lgo-bg border border-lgo-border rounded-lg px-3 py-2 text-lgo-gold-light placeholder:text-lgo-gold-light/40"
          />
          <input
            value={form.slug}
            onChange={e => setForm({ ...form, slug: e.target.value })}
            placeholder="Slug (généré automatiquement)"
            className="w-full bg-lgo-bg border border-lgo-border rounded-lg px-3 py-2 text-lgo-gold-light placeholder:text-lgo-gold-light/40"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Description courte"
            className="w-full bg-lgo-bg border border-lgo-border rounded-lg px-3 py-2 text-lgo-gold-light placeholder:text-lgo-gold-light/40"
          />
          <input
            type="number"
            value={form.sort_order}
            onChange={e => setForm({ ...form, sort_order: e.target.value })}
            placeholder="Ordre d'affichage"
            className="w-full bg-lgo-bg border border-lgo-border rounded-lg px-3 py-2 text-lgo-gold-light placeholder:text-lgo-gold-light/40"
          />
        </div>

        <div className="flex gap-3">
          <button type="submit" className="px-4 py-2 rounded-lg bg-lgo-gold-dark text-lgo-bg font-semibold text-sm">Créer</button>
        </div>
      </form>

      <div className="space-y-2">
        <h4 className="font-serif text-md text-lgo-gold-light">Pages existantes</h4>
        {pages.map(page => (
          <PageRow key={page.id} page={page} />
        ))}
      </div>
    </div>
  );
}
