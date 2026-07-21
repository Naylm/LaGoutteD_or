import { useState } from 'react';

export default function CocktailCard({ cocktail }) {
  const [flipped, setFlipped] = useState(false);

  const sortedIngredients = [...(cocktail.ingredients || [])].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <div
      className="cocktail-card-container h-64 cursor-pointer"
      onClick={() => setFlipped(f => !f)}
      role="button"
      aria-pressed={flipped}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setFlipped(f => !f);
        }
      }}
    >
      <div className={`cocktail-card-inner ${flipped ? 'is-flipped' : ''}`}>
        {/* Face avant */}
        <div className="cocktail-card-face cocktail-card-front">
          <div className="w-full">
            <h3 className="font-serif text-base font-bold text-lgo-gold-light leading-tight">
              {cocktail.name}
            </h3>
            <p className="text-lgo-gold-light/70 text-[10px] mt-1 line-clamp-2">
              {cocktail.description}
            </p>
          </div>
          <div className="mt-auto text-center">
            <span className="text-[10px] text-lgo-gold-light/50 uppercase tracking-wider">
              Appuyez pour voir les ingredients
            </span>
          </div>
        </div>

        {/* Face arrière */}
        <div className="cocktail-card-face cocktail-card-back">
          <h3 className="font-serif text-base font-bold text-lgo-gold-light leading-tight mb-2">
            {cocktail.name}
          </h3>

          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-0">
            <h4 className="text-[10px] uppercase tracking-wider text-lgo-gold-dark mb-1">
              Ingrédients ({sortedIngredients.length})
            </h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-0.5">
              {sortedIngredients.map(ing => (
                <li key={ing.id} className="text-[11px] text-lgo-gold-light leading-snug">
                  {ing.name}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-2 text-center">
            <span className="text-[10px] text-lgo-gold-light/50 uppercase tracking-wider">
              Appuyez pour retourner
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
