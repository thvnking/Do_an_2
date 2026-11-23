import { createContext, useContext, useEffect, useState } from 'react';
import { api, setToken } from '../api.js';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('cinemind-token')) {
      setReady(true);
      return;
    }
    api('/auth/me')
      .then(({ user: me }) => setUser(me))
      .catch(() => setToken(null))
      .finally(() => setReady(true));
  }, []);

  async function authenticate(path, body) {
    const result = await api(path, { method: 'POST', body });
    setToken(result.token);
    setUser(result.user);
    return result.user;
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, ready, authenticate, logout, setUser }}>{children}</AuthContext.Provider>;
}
