import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../../../../shared/components/Button";
import Input from "../../../../shared/components/Input";
import axiosInstance from "../../../../core/infrastructure/http/axiosInstance";

export default function ResetPassword() {
  const [passwords, setPasswords] = useState({ password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { userId, token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (passwords.password !== passwords.confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    try {
      await axiosInstance.post(`/users/password-reset-confirm/${userId}/${token}/`, {
        new_password: passwords.password,
        confirm_password: passwords.confirmPassword
      });
      
      setSuccess(true);
      // Redirigir después de 3 segundos
      setTimeout(() => {
        navigate("/auth/login", { 
          state: { 
            successMessage: "Tu contraseña ha sido actualizada exitosamente. Por favor, inicia sesión con tu nueva contraseña." 
          }
        });
      }, 3000);
    } catch (err: any) {
      //console.error('Reset password error:', err.response?.data);
      setError(err.response?.data?.detail || "Error al restablecer la contraseña");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm">
          <div className="text-center">
            {/* Ícono de éxito */}
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg 
                className="h-6 w-6 text-green-600" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Contraseña actualizada!
            </h2>
            <p className="text-gray-600 mb-8">
              Tu contraseña ha sido cambiada exitosamente.
            </p>
            
            {/* Indicador de redirección */}
            <div className="text-sm text-gray-500">
              Serás redirigido al inicio de sesión en unos segundos...
            </div>
            
            {/* Botón opcional para redirección manual */}
            <button
              onClick={() => navigate("/auth/login")}
              className="mt-4 text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              Ir al inicio de sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Restablecer contraseña</h2>
          <p className="mt-2 text-gray-600">Ingresa tu nueva contraseña</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Input
              type="password"
              label="Nueva contraseña"
              value={passwords.password}
              onChange={(e) => setPasswords({ ...passwords, password: e.target.value })}
              required
              minLength={8}
              disabled={loading}
            />

            <Input
              type="password"
              label="Confirmar contraseña"
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
              required
              minLength={8}
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            className="py-2.5"
            loading={loading}
          >
            {loading ? "Cambiando contraseña..." : "Cambiar contraseña"}
          </Button>
        </form>
      </div>
    </div>
  );
}