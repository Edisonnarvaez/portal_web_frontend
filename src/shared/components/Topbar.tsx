import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiChevronDown, HiLogout, HiUser, HiMoon, HiSun } from "react-icons/hi";
import { useAuthContext } from "../../apps/auth/presentation/context/AuthContext";
import { getProfilePicUrl } from "../utils/profile"; // Ajusta el path si es necesario
import { useDarkMode } from "../hooks/useDarkMode";

export default function Topbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, roles } = useAuthContext();
  const [darkMode, setDarkMode] = useDarkMode();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth/login");
  };

  //...(roles.includes("admin")

  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <img 
            src="/logo_pilot_1.png" 
            alt="Logo PILOT" 
            className="h-4 sm:h-6 w-auto"
          />
          {/* Botón de menú móvil aquí si lo necesitas */}
          {/* Título solo "PILOT" en móvil */}
          <h1 className="block sm:hidden text-lg font-semibold text-gray-900 dark:text-gray-100">
            PILOT
          </h1>
          {/* Título completo en pantallas mayores */}
          <h1 className="hidden sm:block text-xl font-semibold text-gray-900 dark:text-gray-100">
            Portal de Gestión Institucional PILOT
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg"
            >
              <img
                src={
                  user?.profile_picture
                    ? getProfilePicUrl(user.profile_picture) || undefined
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user?.username || "U"
                      )}&background=1e40af&color=fff`
                }
                alt="avatar"
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="hidden md:block font-medium text-gray-700 dark:text-gray-100">
                {user?.username}
              </span>
              <HiChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-300" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-lg py-1 border border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => {
                    navigate("/profile");
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 text-left"
                >
                  <HiUser className="w-5 h-5" />
                  Mi Perfil
                </button>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 w-full px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 text-left"
                >
                  <HiLogout className="w-5 h-5" />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setDarkMode((v) => !v)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Cambiar modo oscuro"
          >
            {darkMode ? (
              <HiSun className="w-5 h-5 text-yellow-400" />
            ) : (
              <HiMoon className="w-5 h-5 text-gray-700" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}