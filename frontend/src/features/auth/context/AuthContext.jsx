import { useEffect, useMemo, useState } from "react";
import { AuthContext } from "./authContextValue";

const AUTH_KEY = "guts_auth";

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (auth) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
    } else {
      localStorage.removeItem(AUTH_KEY);
    }
  }, [auth]);

  const value = useMemo(
    () => ({
      auth,
      token: auth?.token || null,
      role: auth?.user?.role || null,
      isAuthenticated: Boolean(auth?.token),
      setAuth,
      logout: () => setAuth(null),
    }),
    [auth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
