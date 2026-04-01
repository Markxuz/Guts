import { useEffect, useMemo, useState } from "react";
import { AuthContext } from "./authContextValue";

const AUTH_KEY = "guts_auth";
const UNAUTHORIZED_EVENT = "guts:unauthorized";

function decodeJwtPayload(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const normalized = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    return JSON.parse(atob(normalized));
  } catch {
    return null;
  }
}

function isTokenExpired(token) {
  const payload = decodeJwtPayload(token);
  const exp = Number(payload?.exp || 0);
  if (!exp) return false;

  const nowSeconds = Math.floor(Date.now() / 1000);
  return nowSeconds >= exp;
}

function sanitizeStoredAuth(raw) {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.token || isTokenExpired(parsed.token)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => sanitizeStoredAuth(localStorage.getItem(AUTH_KEY)));

  useEffect(() => {
    const onUnauthorized = () => setAuth(null);
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

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
