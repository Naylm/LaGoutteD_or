import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(null);
  const [username, setUsername] = useState('');

  const login = useCallback((user, pass, authHeader) => {
    setUsername(user);
    setAuth(authHeader);
  }, []);

  const logout = useCallback(() => {
    setAuth(null);
    setUsername('');
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
