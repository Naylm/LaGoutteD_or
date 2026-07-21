import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { login } from '../api';

const NAME_STORAGE_KEY = 'lgo_first_name';

export default function Header({ pages, activeSlug, onTabClick }) {
  const [scrolled, setScrolled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState(() => localStorage.getItem(NAME_STORAGE_KEY) || '');
  const navigate = useNavigate();
  const { login: doLogin, isLoggedIn } = useAuth();

  const changeFirstName = () => {
    localStorage.removeItem(NAME_STORAGE_KEY);
    setFirstName('');
  };

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    const syncName = () => setFirstName(localStorage.getItem(NAME_STORAGE_KEY) || '');
    window.addEventListener('lgo:name-changed', syncName);
    return () => window.removeEventListener('lgo:name-changed', syncName);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    setError('');
    setLoading(true);
    try {
      const data = await login(username, password);
      doLogin(username, password, data.auth);
      setShowModal(false);
      setUsername('');
      setPassword('');
      navigate('/editeur');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openEditor = () => {
    if (isLoggedIn) {
      navigate('/editeur');
    } else {
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setError('');
    setUsername('');
    setPassword('');
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-lgo-bg/95 backdrop-blur-sm shadow-lg' : 'bg-transparent'
        }`}
      >
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-center gap-2 mb-3">
            <h1 className="font-serif text-2xl font-bold tracking-wide text-lgo-gold-light">
              La Goutte
            </h1>
            <span className="font-serif text-2xl font-bold text-lgo-gold-dark">d'Or</span>
            <button
              onClick={openEditor}
              className="absolute right-4 top-4 p-2 rounded-full border border-lgo-border/50 text-lgo-gold-light/70 hover:text-lgo-gold-light hover:border-lgo-gold-light/50 transition-colors"
              aria-label="Accès éditeur"
              title="Accès éditeur"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </button>
          </div>

          {firstName && (
            <div className="flex items-center justify-center gap-2 mb-2 text-[11px] text-lgo-gold-light/60">
              <span>Commandes au nom de <span className="text-lgo-gold-light font-medium">{firstName}</span></span>
              <button onClick={changeFirstName} className="underline hover:text-lgo-gold-light transition-colors">
                Changer
              </button>
            </div>
          )}

          <nav className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {pages.map(page => (
              <button
                key={page.slug}
                onClick={() => onTabClick(page.slug)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors whitespace-nowrap ${
                  activeSlug === page.slug
                    ? 'bg-lgo-card text-lgo-gold-light border-lgo-border'
                    : 'bg-lgo-bg text-lgo-gold-light/70 border-lgo-border/50 hover:border-lgo-border'
                }`}
              >
                {page.title}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {showModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-sm bg-lgo-card border border-lgo-border rounded-xl p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-4 text-lgo-gold-light">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <h2 className="font-serif text-lg font-bold">Accès éditeur</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="editor-username" className="block text-xs text-lgo-gold-light/70 mb-1">
                  Identifiant
                </label>
                <input
                  id="editor-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Topaze"
                  className="w-full px-3 py-2 rounded-lg bg-lgo-bg border border-lgo-border text-lgo-gold-light text-sm placeholder:text-lgo-gold-light/30 focus:outline-none focus:border-lgo-gold-dark"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label htmlFor="editor-password" className="block text-xs text-lgo-gold-light/70 mb-1">
                  Mot de passe
                </label>
                <input
                  id="editor-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-lg bg-lgo-bg border border-lgo-border text-lgo-gold-light text-sm placeholder:text-lgo-gold-light/30 focus:outline-none focus:border-lgo-gold-dark"
                  required
                />
              </div>

              {error && (
                <p className="text-xs text-red-400">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 rounded-lg bg-lgo-gold-dark text-lgo-bg font-semibold text-sm hover:bg-lgo-gold-light transition-colors disabled:opacity-50"
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
