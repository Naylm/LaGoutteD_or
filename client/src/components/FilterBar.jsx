import { useMemo } from 'react';

export default function FilterBar({ categories, selected, onChange }) {
  const flatten = useMemo(() => {
    const result = [];
    function walk(nodes, depth = 0) {
      for (const node of nodes || []) {
        result.push({ ...node, depth });
        walk(node.children, depth + 1);
      }
    }
    walk(categories);
    return result;
  }, [categories]);

  return (
    <div className="flex gap-2 overflow-x-auto hide-scrollbar py-2">
      <button
        onClick={() => onChange(null)}
        className={`shrink-0 px-3 py-1.5 rounded-full text-xs border transition-colors ${
          selected === null
            ? 'bg-lgo-gold-dark text-lgo-bg border-lgo-gold-dark'
            : 'bg-transparent text-lgo-gold-light border-lgo-border/60'
        }`}
      >
        Tous
      </button>
      {flatten.map(cat => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs border transition-colors ${
            selected === cat.id
              ? 'bg-lgo-gold-dark text-lgo-bg border-lgo-gold-dark'
              : 'bg-transparent text-lgo-gold-light border-lgo-border/60'
          }`}
        >
          {'— '.repeat(cat.depth)}{cat.name}
        </button>
      ))}
    </div>
  );
}
