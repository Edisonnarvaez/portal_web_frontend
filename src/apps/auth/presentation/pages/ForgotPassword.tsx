import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../../../shared/components/Button";
import Input from "../../../../shared/components/Input";
import { requestPasswordReset } from "../../infrastructure/repositories/AuthRepository";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const currentYear = new Date().getFullYear();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err: any) {
      setError(err.message || "Error al enviar el correo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Panel izquierdo */}
      <div className="w-full lg:w-7/12 min-h-[40vh] lg:min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-12 bg-gradient-to-br from-slate-700 via-blue-800 to-blue-900 relative">
        <div className="absolute inset-0 opacity-10 bg-pattern"></div>

        <div className="relative z-10 w-full max-w-xl mx-auto">
          <div className="mb-8 lg:mb-12">
            <div className="flex items-center gap-3 mb-8 lg:mb-16">
              <img
                src="/logo.png"
                alt="PILOT"
                className="h-12 sm:h-14 w-auto"
              />
              <h1 className="text-xl sm:text-2xl font-medium text-white">
                Portal de Gestión Institucional PILOT
              </h1>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 lg:mb-6 leading-tight">
              Recupera tu <br />
              contraseña
            </h2>
            <p className="text-lg sm:text-xl text-blue-100 max-w-md">
              Te enviaremos instrucciones para restablecer tu contraseña.
            </p>
          </div>

          <div className="hidden lg:flex flex-row items-center text-sm text-blue-200">
            <img 
                src="/logo_pilot.png" 
                alt="Logo PILOT" 
                className="h-8 sm:h-10 w-auto"
              />
              <div>
                © {currentYear} PILOT. <br />
                Todos los derechos reservados.
              </div>
          </div>
        </div>
      </div>

      {/* Panel derecho - Formulario */}
      <div className="w-full lg:w-5/12 flex items-center justify-center p-4 sm:p-6 lg:p-12 bg-white">
        <div className="w-full max-w-sm space-y-6 lg:space-y-8">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-500"
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
              <h2 className="text-2xl font-bold text-gray-900">
                ¡Correo enviado!
              </h2>
              <p className="text-gray-600">
                Te hemos enviado las instrucciones para restablecer tu contraseña.
                Por favor revisa tu bandeja de entrada.
              </p>
              <Link
                to="/auth/login"
                className="mt-6 inline-block text-blue-600 hover:text-blue-800 font-medium"
              >
                Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center lg:text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  ¿Olvidaste tu contraseña?
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  Ingresa tu correo electrónico y te enviaremos instrucciones para restablecerla.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  type="email"
                  label="Correo electrónico"
                  placeholder="ejemplo@pilot.com.co"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  className="py-2.5"
                  disabled={loading}
                >
                  {loading ? "Enviando..." : "Enviar instrucciones"}
                </Button>

                <Link
                  to="/auth/login"
                  className="block text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Volver al inicio de sesión
                </Link>
              </form>
            </>
          )}

          {/* Copyright móvil */}
          <div className="lg:hidden text-center text-[11px] text-gray-500 pt-4">
            © {currentYear} PILOT. Todos los derechos reservados.
          </div>
        </div>
      </div>
    </div>
  );
}
