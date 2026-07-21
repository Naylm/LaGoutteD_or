import { useEffect, useRef, useState, useCallback } from 'react';
import Header from '../components/Header';
import GuinnessGauge from '../components/GuinnessGauge';
import CocktailGrid from '../components/CocktailGrid';
import { getPages, getCocktails, getCategories } from '../api';

export default function Home() {
  const [pages, setPages] = useState([]);
  const [cocktails, setCocktails] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [activeSlug, setActiveSlug] = useState('');
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const sectionRefs = useRef({});
  const mainRef = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        const [pagesData, cocktailsData, categoriesData] = await Promise.all([
          getPages(),
          getCocktails(),
          getCategories()
        ]);
        setPages(pagesData);
        setCocktails(cocktailsData);
        setCategories(categoriesData);
        if (pagesData.length > 0 && !activeSlug) setActiveSlug(pagesData[0].slug);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const rafRef = useRef(null);

  const handleScroll = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(pct);

      let current = pages[0]?.slug || '';
      for (const page of pages) {
        const el = sectionRefs.current[page.slug];
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= window.innerHeight / 2) {
            current = page.slug;
          }
        }
      }
      setActiveSlug(current);
    });
  }, [pages]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [handleScroll]);

  const scrollToSection = (slug) => {
    const el = sectionRefs.current[slug];
    if (el) {
      const headerOffset = 110;
      const top = el.getBoundingClientRect().top + window.scrollY - headerOffset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const cocktailsByPage = (slug) => {
    const page = pages.find(p => p.slug === slug);
    if (!page) return [];
    let list = cocktails.filter(c => c.pages.some(p => p.slug === slug));
    if (selectedCategory) {
      list = list.filter(c =>
        c.ingredients.some(i => i.category_name === selectedCategory || String(i.category_id) === selectedCategory)
      );
    }
    return list.sort((a, b) => a.name.localeCompare(b.name));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lgo-bg">
        <div className="text-lgo-gold-light animate-pulse font-serif text-xl">La Goutte d'Or</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lgo-bg" ref={mainRef}>
      <Header
        pages={pages}
        activeSlug={activeSlug}
        onTabClick={scrollToSection}
      />

      <main className="pt-32 pb-32 px-4 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <h2 className="font-serif text-xl text-lgo-gold-light">Cocktails</h2>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label htmlFor="category-filter" className="text-sm text-lgo-gold-light/70 whitespace-nowrap">Filtrer par catégorie :</label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="flex-1 sm:flex-none bg-lgo-card border border-lgo-border rounded-lg px-3 py-2 text-sm text-lgo-gold-light"
            >
              <option value="">Toutes</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {pages.map(page => (
          <section
            key={page.slug}
            ref={el => sectionRefs.current[page.slug] = el}
            id={page.slug}
            className="py-8 scroll-mt-32"
          >
            <div className="flex items-center gap-3 mb-4">
              <h2 className="font-serif text-2xl font-bold text-lgo-gold-light">
                {page.title}
              </h2>
              <div className="flex-1 h-px bg-lgo-border/50" />
            </div>
            <p className="text-lgo-gold-light/60 text-sm mb-6">{page.description}</p>
            <CocktailGrid cocktails={cocktailsByPage(page.slug)} />
          </section>
        ))}
      </main>

      <GuinnessGauge progressPercent={progress} />
    </div>
  );
}
