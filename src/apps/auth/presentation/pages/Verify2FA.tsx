import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../../../../shared/components/Button";
import Input from "../../../../shared/components/Input";
import { verify2FA } from "../../infrastructure/repositories/AuthRepository";
import { notify } from "../../../../shared/utils/notifications";
import { useAuthContext } from "../context/AuthContext"; // <-- IMPORTA EL CONTEXTO

export default function Verify2FA() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const tempToken = location.state?.tempToken;
  const username = location.state?.username;
  const { setUser } = useAuthContext(); // <-- OBTÉN setUser DEL CONTEXTO

  useEffect(() => {
    if (!tempToken) {
      navigate('/auth/login');
    }
  }, [tempToken, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || !tempToken) {
      notify.error("Se requiere el código y el token temporal");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await verify2FA({ 
        code: otp,
        temp_token: tempToken
      });

      setUser(data.user); // <-- ACTUALIZA EL CONTEXTO CON EL USUARIO AUTENTICADO

      notify.success("Verificación exitosa");
      navigate("/menu");
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || "Error en la verificación";
      notify.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Verificación 2FA</h2>
          <p className="mt-2 text-gray-600">
            Ingresa el código de verificación para {username}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Input
            type="text"
            label="Código OTP"
            value={otp}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              if (value.length <= 6) {
                setOtp(value);
              }
            }}
            placeholder="Ingresa el código de 6 dígitos"
            required
            pattern="\d{6}"
            maxLength={6}
            className="text-center tracking-wider font-mono"
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            className="py-2.5"
          >
            {loading ? "Verificando..." : "Verificar"}
          </Button>
        </form>
      </div>
    </div>
  );
}