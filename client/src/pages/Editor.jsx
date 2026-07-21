import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { login, getVapidPublicKey, subscribePush } from '../api';
import CocktailForm from '../components/editor/CocktailForm';
import IngredientForm from '../components/editor/IngredientForm';
import CategoryManager from '../components/editor/CategoryManager';
import PageManager from '../components/editor/PageManager';
import RecipeBook from '../components/editor/RecipeBook';
import OrderList from '../components/editor/OrderList';

const tabs = [
  { id: 'orders', label: 'Commandes' },
  { id: 'cocktails', label: 'Cocktails' },
  { id: 'ingredients', label: 'Ingrédients' },
  { id: 'categories', label: 'Catégories' },
  { id: 'pages', label: 'Pages' },
  { id: 'recipebook', label: 'Livre' }
];

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

export default function Editor() {
  const navigate = useNavigate();
  const { auth, username, login: doLogin, logout, isLoggedIn } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [notifStatus, setNotifStatus] = useState('');

  useEffect(() => {
    if (!isLoggedIn) return;
    setupPushNotifications();
  }, [isLoggedIn]);

  const setupPushNotifications = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setNotifStatus('unsupported');
      return;
    }
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setNotifStatus('denied');
        return;
      }
      const { publicKey } = await getVapidPublicKey();
      if (!publicKey) {
        setNotifStatus('no-key');
        return;
      }
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey)
        });
      }
      await subscribePush(subscription.toJSON(), auth);
      setNotifStatus('active');
    } catch (err) {
      console.error('Push setup error:', err);
      setNotifStatus('error');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(form.username, form.password);
      doLogin(form.username, form.password, data.auth);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lgo-bg text-lgo-gold-light px-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm bg-lgo-card border border-lgo-border rounded-xl p-6 shadow-2xl space-y-4"
        >
          <h1 className="font-serif text-2xl font-bold text-center">Connexion éditeur</h1>

          {error && (
            <div className="p-3 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs text-lgo-gold-light/70 mb-1">Identifiant</label>
            <input
              type="text"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              className="w-full bg-lgo-bg border border-lgo-border rounded-lg px-3 py-2 text-lgo-gold-light"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-xs text-lgo-gold-light/70 mb-1">Mot de passe</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full bg-lgo-bg border border-lgo-border rounded-lg px-3 py-2 text-lgo-gold-light"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-lgo-gold-dark text-lgo-bg font-semibold disabled:opacity-50"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full text-center text-sm text-lgo-gold-light/60 hover:text-lgo-gold-light underline"
          >
            Retour au site
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lgo-bg text-lgo-gold-light">
      <header className="sticky top-0 z-50 bg-lgo-bg/95 backdrop-blur-sm border-b border-lgo-border/50 px-4 py-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-xl font-bold text-lgo-gold-light">La Goutte</h1>
            <span className="font-serif text-xl font-bold text-lgo-gold-dark">d'Or</span>
            <span className="text-xs text-lgo-gold-light/50 ml-2">— Éditeur</span>
            <span className="text-xs text-lgo-gold-dark ml-2">({username})</span>
          </div>
          <div className="flex items-center gap-2">
            <nav className="flex gap-2 overflow-x-auto hide-scrollbar">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`shrink-0 px-4 py-2 rounded-full text-sm border transition-colors ${
                    activeTab === tab.id
                      ? 'bg-lgo-card text-lgo-gold-light border-lgo-border'
                      : 'bg-transparent text-lgo-gold-light/70 border-lgo-border/50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
            <button
              onClick={() => navigate('/')}
              className="shrink-0 px-4 py-2 rounded-full text-sm border border-lgo-gold-dark/50 bg-lgo-gold-dark/10 text-lgo-gold-light hover:bg-lgo-gold-dark/20 transition-colors whitespace-nowrap"
            >
              Voir le site
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {(notifStatus === 'denied' || notifStatus === 'unsupported') && (
          <div className="mb-4 p-3 rounded-lg bg-lgo-card border border-lgo-border text-xs text-lgo-gold-light/70">
            Notifications désactivées. Sur iPhone/iPad : ajoutez ce site à l'écran d'accueil via Safari
            (bouton Partager → "Sur l'écran d'accueil"), puis rouvrez-le depuis l'icône et autorisez les notifications.
          </div>
        )}
        {activeTab === 'orders' && <OrderList auth={auth} />}
        {activeTab === 'cocktails' && <CocktailForm auth={auth} />}
        {activeTab === 'ingredients' && <IngredientForm auth={auth} />}
        {activeTab === 'categories' && <CategoryManager auth={auth} />}
        {activeTab === 'pages' && <PageManager auth={auth} />}
        {activeTab === 'recipebook' && <RecipeBook />}
      </main>

      <div className="fixed bottom-4 right-4 flex gap-2">
        <button
          onClick={logout}
          className="px-4 py-2 rounded-full bg-lgo-card border border-lgo-border text-xs text-red-400"
        >
          Déconnexion
        </button>
      </div>
    </div>
  );
}
