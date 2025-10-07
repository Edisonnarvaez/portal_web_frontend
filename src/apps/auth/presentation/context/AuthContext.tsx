import { createContext, useContext, useEffect, useState } from "react";

interface Role {
  id: number;
  name: string;
  app: { id: number; name: string };
}

interface User {
  id: number;
  username: string;
  email: string;
  roles: Role[]; // o Role si es uno solo
  is_2fa_enabled: boolean;
  [key: string]: any;
}

interface AuthContextProps {
  user: User | null;
  isAuthenticated: boolean;
  roles: Role[];
  setUser: (user: User | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const roles = user?.roles ?? [];

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/auth/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!localStorage.getItem("access_token"),
        roles,
        setUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
};