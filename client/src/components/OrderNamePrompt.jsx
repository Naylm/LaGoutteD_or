import { useState } from 'react';

export default function OrderNamePrompt({ onConfirm, onCancel }) {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onConfirm(name.trim());
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onCancel}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-lgo-card border border-lgo-border rounded-xl p-5 shadow-2xl space-y-4"
      >
        <h2 className="font-serif text-lg font-bold text-lgo-gold-light">Quel est votre prénom ?</h2>
        <p className="text-xs text-lgo-gold-light/60">
          Il sera associé à votre commande. Il sera mémorisé pour vos prochaines commandes.
        </p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Votre prénom"
          className="w-full px-3 py-2 rounded-lg bg-lgo-bg border border-lgo-border text-lgo-gold-light text-sm placeholder:text-lgo-gold-light/30 focus:outline-none focus:border-lgo-gold-dark"
          autoFocus
          required
        />
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 py-2 rounded-lg bg-lgo-gold-dark text-lgo-bg font-semibold text-sm hover:bg-lgo-gold-light transition-colors"
          >
            Commander
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-lgo-border text-lgo-gold-light/70 text-sm"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
