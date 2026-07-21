import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'lgo_editor_session';

function loadStoredSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { auth: null, username: '' };
    const parsed = JSON.parse(raw);
    return { auth: parsed.auth || null, username: parsed.username || '' };
  } catch {
    return { auth: null, username: '' };
  }
}

export function AuthProvider({ children }) {
  const stored = loadStoredSession();
  const [auth, setAuth] = useState(stored.auth);
  const [username, setUsername] = useState(stored.username);

  const login = useCallback((user, pass, authHeader) => {
    setUsername(user);
    setAuth(authHeader);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ username: user, auth: authHeader }));
  }, []);

  const logout = useCallback(() => {
    setAuth(null);
    setUsername('');
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = {
    auth,
    username,
    login,
    logout,
    isLoggedIn: !!auth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
