import { useState, useEffect } from 'react';
import { login as apiLogin } from './api';

const KEY = '_admin_token';

export function useAuth() {
  const [token, setToken]     = useState<string | null>(() => sessionStorage.getItem(KEY));
  const [username, setUsername] = useState<string | null>(() => sessionStorage.getItem('_admin_user'));
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (token) sessionStorage.setItem(KEY, token);
    else sessionStorage.removeItem(KEY);
  }, [token]);

  async function login(user: string, pass: string) {
    setLoading(true);
    setError(null);
    try {
      const data = await apiLogin(user, pass);
      setToken(data.token);
      setUsername(data.username);
      sessionStorage.setItem('_admin_user', data.username);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setToken(null);
    setUsername(null);
    sessionStorage.removeItem(KEY);
    sessionStorage.removeItem('_admin_user');
  }

  return { token, username, loading, error, login, logout, isAuthenticated: !!token };
}
