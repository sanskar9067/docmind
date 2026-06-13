import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getProfile, login as loginRequest, signup as signupRequest } from '../api/auth';

const AuthContext = createContext(null);

const TOKEN_KEY = 'pdfchat_token';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async (activeToken) => {
    const profile = await getProfile(activeToken);
    setUser(profile);
    return profile;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const profile = await getProfile(token);
        if (!cancelled) {
          setUser(profile);
        }
      } catch {
        if (!cancelled) {
          logout();
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [token, logout]);

  const login = useCallback(async (credentials) => {
    const data = await loginRequest(credentials);
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    await refreshProfile(data.token);
    return data;
  }, [refreshProfile]);

  const signup = useCallback(async (credentials) => {
    await signupRequest(credentials);
    return login(credentials);
  }, [login]);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      signup,
      logout,
    }),
    [token, user, loading, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
