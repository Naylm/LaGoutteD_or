import { useState, useEffect } from 'react';
import { getCocktails, getPages } from '../../api';

export default function RecipeBook() {
  const [cocktails, setCocktails] = useState([]);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [cData, pData] = await Promise.all([
        getCocktails('?available=false'),
        getPages()
      ]);
      setCocktails(cData);
      setPages(pData);
      setLoading(false);
    }
    load();
  }, []);

  const cocktailsByPage = (slug) => {
    return cocktails.filter(c => c.pages.some(p => p.slug === slug));
  };

  if (loading) {
    return <div className="text-lgo-gold-light/70 text-sm">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <h3 className="font-serif text-xl text-lgo-gold-light">Livre de recettes</h3>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 rounded-lg bg-lgo-gold-dark text-lgo-bg font-semibold text-sm"
        >
          Imprimer / PDF
        </button>
      </div>

      <div className="recipe-book print:block">
        {pages.map((page, pageIndex) => (
          <section key={page.slug} className="print:break-before-page mb-12">
            <h2 className="font-serif text-3xl text-lgo-gold-light mb-2 print:text-black">{page.title}</h2>
            {page.description && (
              <p className="text-lgo-gold-light/60 text-sm mb-8 italic print:text-gray-700">{page.description}</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
              {cocktailsByPage(page.slug).map((c, idx) => (
                <article
                  key={c.id}
                  className={`break-inside-avoid ${idx % 2 === 1 ? 'md:border-l md:border-lgo-border md:pl-8' : ''}`}
                >
                  {c.image_url && (
                    <img
                      src={c.image_url}
                      alt={c.name}
                      className="w-full h-40 object-cover rounded-lg mb-4 print:hidden"
                    />
                  )}

                  <h3 className="font-serif text-xl text-lgo-gold-light mb-2 print:text-black border-b border-lgo-gold-dark/30 pb-1 print:border-black">
                    {c.name}
                  </h3>

                  {c.description && (
                    <p className="text-lgo-gold-light/70 text-sm mb-3 italic print:text-gray-800">{c.description}</p>
                  )}

                  <h4 className="text-sm font-semibold text-lgo-gold-dark mb-1 uppercase tracking-wide print:text-black">
                    Ingrédients
                  </h4>
                  <ul className="list-disc list-inside text-sm text-lgo-gold-light/90 mb-4 print:text-black">
                    {c.ingredients.map(ing => (
                      <li key={ing.id}>
                        {ing.name}
                        {(ing.quantity > 0 || ing.unit) && (
                          <span className="text-lgo-gold-light/60 print:text-gray-700">
                            {' '}– {ing.quantity > 0 ? ing.quantity : ''} {ing.unit}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>

                  {c.instructions && (
                    <>
                      <h4 className="text-sm font-semibold text-lgo-gold-dark mb-1 uppercase tracking-wide print:text-black">
                        Préparation
                      </h4>
                      <p className="text-sm text-lgo-gold-light/90 whitespace-pre-line print:text-black">
                        {c.instructions}
                      </p>
                    </>
                  )}
                </article>
              ))}
            </div>

            {cocktailsByPage(page.slug).length === 0 && (
              <p className="text-lgo-gold-light/50 text-sm italic print:text-gray-500">Aucun cocktail dans cette page.</p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
