import { createContext, useState, useEffect } from "react";
import { getMe } from "../services/auth";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // 🔥 ao abrir o sistema
useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) return;

  getMe()
    .then(res => setUser(res.data))
    .catch(() => {
      console.warn("Token inválido");
      localStorage.removeItem("token");
      setUser(null);
      // ❌ NÃO redireciona aqui
    });
}, []);

  const loginUser = (data) => {
    localStorage.setItem("token", data.access_token); // 🔥 padrão correto
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    //window.location.href = "/login"; // evita loop
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
