import { useState } from "react";
import { login, logout as repoLogout } from "../../infrastructure/repositories/AuthRepository";
import { useNavigate } from "react-router-dom";
import { notify } from "../../../../shared/utils/notifications";
import { useAuthContext } from "../context/AuthContext";

export const useAuth = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser, ...ctx } = useAuthContext();

  const loginUser = async (username: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await login(username, password);

      // Si requiere 2FA
      if (response.require_2fa) {
        navigate("/auth/verify-2fa", {
          state: {
            tempToken: response.temp_token,
            username,
          },
        });
        return;
      }

      setUser(response.user);
      // Si el login es exitoso y no requiere 2FA
      notify.success("Inicio de sesión exitoso");
      navigate("/menu");
    } catch (err: any) {
      const errorMessage = err.message || "Error en el inicio de sesión";
      setError(errorMessage);
      notify.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = () => {
    repoLogout();
    setUser(null);
    navigate("/auth/login");
  };

  return {
    loginUser,
    logoutUser,
    error,
    loading,
    ...ctx,
  };
};
