import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);

function setAuthToken(token) {
  if (token) {
    localStorage.setItem("geoquiz_token", token);
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem("geoquiz_token");
    delete api.defaults.headers.common.Authorization;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("geoquiz_token");
    if (!token) {
      setAuthLoading(false);
      return;
    }
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    api.get("/auth/me")
      .then((res) => {
        const freshUser = res.data.user;
        setUser(freshUser);
        localStorage.setItem("user", JSON.stringify(freshUser));
      })
      .catch(() => {
        logOut(); 
      })
      .finally(() => setAuthLoading(false));
  }, []);

  async function login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });
    setAuthToken(data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }

  async function register(name, email, password) {
    const { data } = await api.post("/auth/register", { name, email, password });
    setAuthToken(data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }

  function logout() {
    setAuthToken(null); // Čisti token i Axios header
    localStorage.removeItem("user");
    setUser(null);
  }

  const value = {
    user,
    authLoading,
    register,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!authLoading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth mora da se koristi unutar AuthProvider-a");
  }
  return context;
}