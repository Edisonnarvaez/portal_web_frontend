import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { HiEye, HiEyeOff } from "react-icons/hi";
import Button from "../../../../shared/components/Button";
import Input from "../../../../shared/components/Input";
import { Link } from "react-router-dom";

export default function LoginPage() {
  const { loginUser, loading, error } = useAuth();
  const [values, setValues] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.successMessage;

  const currentYear = new Date().getFullYear();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      //console.log('Form values:', values); // Para ver qué se está enviando
      await loginUser(values.username, values.password);
    } catch (err) {
      //console.error('Submit error:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Panel izquierdo - Ajustado para mejor visualización en móviles */}
      <div className="w-full lg:w-7/12 min-h-[40vh] lg:min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-12 bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 relative">
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
                Portal de Gestión Institucional
              </h1>
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 lg:mb-6 leading-tight">
              Gestión médica <br/>
              simplificada
            </h2>
            <p className="text-lg sm:text-xl text-blue-100 max-w-md">
              Accede a todas las herramientas necesarias para tu institución médica en un solo lugar.
            </p>
          </div>

          {/* Características - Ajustadas para móviles */}
          <div className="mt-8 lg:mt-12 mb-8 lg:mb-16 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-white/10">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold">Acceso Seguro</h3>
                <p className="text-blue-100 text-sm">Conexión encriptada y autenticación de dos factores</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-white/10">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold">Experiencia Comprobada</h3>
                <p className="text-blue-100 text-sm">Diseñamos con pasión y dedicación para tu institución</p>
              </div>
            </div>
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

      {/* Panel derecho - Formulario ajustado */}
      <div className="w-full lg:w-5/12 flex items-center justify-center p-4 sm:p-6 lg:p-12 bg-white">
        <div className="w-full max-w-sm space-y-6 lg:space-y-8">
          {successMessage && (
            <div className="bg-green-50 text-green-700 p-4 rounded-lg text-sm flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {successMessage}
            </div>
          )}

          <div className="text-center lg:text-left">
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Bienvenido de nuevo
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
            <div className="space-y-5">
              <Input
                id="username"
                name="username"
                type="text"
                required
                label="Usuario"
                placeholder="Ingresa tu nombre de usuario"
                value={values.username}
                onChange={handleChange}
                autoComplete="username"
              />

              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  label="Contraseña"
                  placeholder="Ingresa tu contraseña"
                  value={values.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? (
                    <HiEyeOff className="w-5 h-5" />
                  ) : (
                    <HiEye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error === "Invalid credentials" ? "Credenciales inválidas" : error}
              </div>
            )}

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">Recordarme</span>
              </label>
              <Link
                to="/auth/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              className="py-2.5"
            >
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
          </form>

          {/* Información de soporte - Ajustada para móviles */}
          <div className="mt-6 lg:mt-8 pt-4 lg:pt-6 border-t border-gray-200">
            <div className="space-y-3 lg:space-y-4">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                <a href="#" className="hover:text-gray-700">Términos de uso</a>
                <span className="hidden sm:inline">·</span>
                <a href="#" className="hover:text-gray-700">Política de privacidad</a>
              </div>
              <div className="text-center">
                <p className="text-[11px] sm:text-xs text-gray-500">
                  Horario de soporte: Lun-Vie 7:00 AM - 3:30 PM
                </p>
                <p className="text-[11px] sm:text-xs text-gray-500">
                  Contacto: edisonnarvaez.esn@gmail.com <br className="sm:hidden"/>
                </p>
              </div>
            </div>
          </div>

          {/* Copyright móvil */}
          <div className="lg:hidden text-center text-[11px] text-gray-500 pt-4">
            © {currentYear} PILOT. Todos los derechos reservados.
          </div>
        </div>
      </div>
    </div>
  );
}

