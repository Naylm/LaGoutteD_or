import { useEffect } from 'react';

export default function EditModal({ title, onClose, children }) {
  useEffect(() => {
    console.trace('[EditModal] mounted');
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      console.trace('[EditModal] unmounted');
      window.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center bg-black/60 backdrop-blur-sm px-4 py-8 overflow-y-auto"
      onClick={(e) => { console.trace('[EditModal] backdrop clicked', e.target); onClose(); }}
    >
      <div
        className="w-full max-w-xl my-auto bg-lgo-card border border-lgo-border rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-lgo-border/50">
          <h3 className="font-serif text-lg text-lgo-gold-light">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full text-lgo-gold-light/60 hover:text-lgo-gold-light hover:bg-lgo-bg transition-colors text-xl leading-none"
            aria-label="Fermer"
          >
            ×
          </button>
        </div>
        <div className="p-5">
          {children}
        </div>
      </div>
    </div>
  );
}
