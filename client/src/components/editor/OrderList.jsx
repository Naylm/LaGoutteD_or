import { useState } from 'react';
import { updateOrderStatus, deleteOrder } from '../../api';

export default function OrderList({ auth, orders, onReload, message, setMessage }) {
  const [expanded, setExpanded] = useState(null);

  const markDone = async (id) => {
    try {
      await updateOrderStatus(id, 'done', auth);
      onReload();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const remove = async (id) => {
    try {
      await deleteOrder(id, auth);
      onReload();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const pending = orders.filter(o => o.status === 'pending');
  const done = orders.filter(o => o.status === 'done');

  const OrderRow = ({ order }) => {
    const isExpanded = expanded === order.id;
    return (
      <div className="border border-lgo-border rounded-lg p-3 bg-lgo-card/50 space-y-2">
        <div className="flex justify-between items-center gap-3">
          <div>
            <p className="text-lgo-gold-light font-medium">
              {order.first_name} <span className="text-lgo-gold-light/50">—</span> {order.cocktail_name}
            </p>
            <p className="text-[11px] text-lgo-gold-light/50">
              {new Date(order.created_at).toLocaleString('fr-FR')}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setExpanded(isExpanded ? null : order.id)}
              className="text-xs text-lgo-gold-dark underline"
            >
              {isExpanded ? 'Masquer' : 'Recette'}
            </button>
            {order.status === 'pending' && (
              <button
                onClick={() => markDone(order.id)}
                className="text-xs text-green-400 underline"
              >
                Servie
              </button>
            )}
            <button onClick={() => remove(order.id)} className="text-xs text-red-400 underline">
              Supprimer
            </button>
          </div>
        </div>

        {isExpanded && order.cocktail && (
          <div className="bg-lgo-bg border border-lgo-border/50 rounded-lg p-3 space-y-2">
            {order.cocktail.instructions && (
              <p className="text-xs text-lgo-gold-light/80">{order.cocktail.instructions}</p>
            )}
            <ul className="text-xs text-lgo-gold-light/70 space-y-0.5">
              {(order.cocktail.ingredients || []).map(ing => (
                <li key={ing.id}>
                  {ing.name}
                  {ing.quantity > 0 && ` — ${ing.quantity} ${ing.unit}`}
                </li>
              ))}
            </ul>
          </div>
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

      <div className="space-y-3">
        <h3 className="font-serif text-lg text-lgo-gold-light">
          Commandes en attente ({pending.length})
        </h3>
        {pending.length === 0 && (
          <p className="text-sm text-lgo-gold-light/50">Aucune commande en attente.</p>
        )}
        {pending.map(order => (
          <OrderRow key={order.id} order={order} />
        ))}
      </div>

      {done.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-serif text-lg text-lgo-gold-light">
            Commandes servies ({done.length})
          </h3>
          {done.map(order => (
            <OrderRow key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
