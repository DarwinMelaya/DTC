import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(() => !!localStorage.getItem("token"));

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === "token") {
        setIsAdmin(!!event.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);


  const login = (token) => {
    localStorage.setItem("token", token);
    setIsAdmin(true);
  };


  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
