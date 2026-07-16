import CocktailCard from './CocktailCard';

export default function CocktailGrid({ cocktails }) {
  if (cocktails.length === 0) {
    return (
      <p className="text-center text-lgo-gold-light/50 py-12 text-sm">
        Aucun cocktail réalisable pour le moment.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cocktails.map(cocktail => (
        <CocktailCard key={cocktail.id} cocktail={cocktail} />
      ))}
    </div>
  );
}
