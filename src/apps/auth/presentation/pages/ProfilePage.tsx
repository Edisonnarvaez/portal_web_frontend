import { useState, useEffect, useMemo } from "react";
import type { ChangeEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import Button from "../../../../shared/components/Button";
import Input from "../../../../shared/components/Input";
import UserAvatar from "../../../../shared/components/UserAvatar";
import { disable2FA, getProfile, updateProfile, changePassword } from "../../infrastructure/repositories/AuthRepository";
import { notify } from '../../../../shared/utils/notifications';
import { useAuthContext } from "../context/AuthContext";
import { validateNewPassword } from "../../../../shared/utils/passwordValidation";

// 🔧 NUEVO: Modal personalizado para desactivar 2FA en ProfilePage
const Disable2FAConfirmModal = ({ isOpen, onClose, onConfirm, loading }: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <span className="text-red-600 dark:text-red-400 text-lg">⚠️</span>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Desactivar Autenticación de Dos Factores
            </h3>
          </div>

          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-400 mb-3">
              ¿Estás seguro de que deseas desactivar la autenticación de dos factores?
            </p>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                <strong>Advertencia:</strong> Esta acción reducirá significativamente la seguridad de tu cuenta. Sin 2FA, tu cuenta será más vulnerable a accesos no autorizados.
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              {loading ? 'Desactivando...' : 'Sí, desactivar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper para requisitos individuales
const passwordRequirements = [
  {
    label: "Al menos 8 caracteres",
    test: (pw: string) => pw.length >= 8,
  },
  {
    label: "Una letra mayúscula",
    test: (pw: string) => /[A-Z]/.test(pw),
  },
  {
    label: "Una letra minúscula",
    test: (pw: string) => /[a-z]/.test(pw),
  },
  {
    label: "Un número",
    test: (pw: string) => /[0-9]/.test(pw),
  },
  {
    label: "Un carácter especial",
    test: (pw: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pw),
  },
  {
    label: "Las contraseñas coinciden",
    test: (_pw: string, confirm: string) => _pw.length > 0 && _pw === confirm,
    isMatch: true,
  },
];

export default function ProfilePage() {
  const { user, setUser } = useAuthContext();
  const location = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [values, setValues] = useState({
    username: user?.username || "",
    email: user?.email || "",
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    roles: Array.isArray(user?.roles) ? user.roles : [],

    profile_picture: user?.profile_picture || null,
  });
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(user?.profile_picture || null);
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [is2FAEnabled, setIs2FAEnabled] = useState(user?.is_2fa_enabled || false);
  const [loading2FA, setLoading2FA] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  // 🔧 NUEVO: Estado para el modal
  const [showDisableModal, setShowDisableModal] = useState(false);

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [originalValues, setOriginalValues] = useState(values);

  // Traer datos frescos del perfil al montar
  useEffect(() => {
    const fetchProfile = async () => {
      setLoadingProfile(true);
      try {
        const profile = await getProfile();
        setValues({
          username: profile.username,
          email: profile.email,
          first_name: profile.first_name || "",
          last_name: profile.last_name || "",
          roles: Array.isArray(profile.roles) ? profile.roles : [],
          profile_picture: profile.profile_picture || null,
        });
        setProfilePicPreview(profile.profile_picture || null);
        setIs2FAEnabled(profile.is_2fa_enabled);
        setUser(profile);
      } catch (err: any) {
        notify.error("No se pudo cargar el perfil");
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (location.state?.is2FAEnabled !== undefined) {
      setIs2FAEnabled(location.state.is2FAEnabled);
    }
  }, [location.state]);

  // Manejar cambio de imagen de perfil
  const handleProfilePicChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicFile(file);
      setProfilePicPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingProfile(true);
    try {
      const formData = new FormData();
      formData.append("username", values.username);
      formData.append("email", values.email);
      formData.append("first_name", values.first_name);
      formData.append("last_name", values.last_name);
      if (profilePicFile) {
        formData.append("profile_picture", profilePicFile);
      }
      const updated = await updateProfile(formData, true);
      setUser(updated);
      setValues({
        ...values,
        profile_picture: updated.profile_picture,
      });
      setProfilePicPreview(updated.profile_picture || null);
      setIsEditing(false);
      setProfilePicFile(null);
      notify.success("Perfil actualizado correctamente");
    } catch (err: any) {
      notify.error(err.message || "Error al actualizar el perfil");
    } finally {
      setLoadingProfile(false);
    }
  };

  // 🔧 CORREGIDO: Usar modal personalizado en lugar de window.confirm
  const handleDisable2FA = () => {
    setShowDisableModal(true);
  };

  // 🔧 NUEVO: Manejar confirmación desde el modal
  const handleConfirmDisable2FA = async () => {
    setLoading2FA(true);
    try {
      await disable2FA();
      setIs2FAEnabled(false);
      setUser({ ...(user as any), is_2fa_enabled: false, id: user!.id });
      setShowDisableModal(false);
      notify.success("Autenticación de dos factores desactivada exitosamente");
    } catch (err: any) {
      notify.error(err.message || "Error al desactivar 2FA");
    } finally {
      setLoading2FA(false);
    }
  };

  // 🔧 NUEVO: Manejar cierre del modal
  const handleCloseModal = () => {
    if (!loading2FA) {
      setShowDisableModal(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordLoading(true);

    const validationError = validateNewPassword(passwords.new);
    if (validationError) {
      setPasswordError(validationError);
      setPasswordLoading(false);
      return;
    }

    if (passwords.new !== passwords.confirm) {
      setPasswordError("Las contraseñas no coinciden");
      setPasswordLoading(false);
      return;
    }

    try {
      await changePassword({
        current_password: passwords.current,
        new_password: passwords.new,
      });
      notify.success("Contraseña actualizada correctamente");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (err: any) {
      setPasswordError(err.message || "Error al cambiar la contraseña");
    } finally {
      setPasswordLoading(false);
    }
  };

  const passwordChecks = useMemo(
    () =>
      passwordRequirements.map(req =>
        req.isMatch
          ? req.test(passwords.new, passwords.confirm)
          : req.test(passwords.new, passwords.confirm)
      ),
    [passwords.new, passwords.confirm]
  );

  useEffect(() => {
    if (location.state?.successMessage) {
      notify.success(location.state.successMessage);
    }
  }, [location.state]);

  // Cuando entras en edición, guarda los valores originales
  const handleEditClick = () => {
    setOriginalValues(values);
    setIsEditing(true);
  };

  // Cuando cancelas, restaura los valores originales
  const handleCancelEdit = () => {
    setValues(originalValues);
    setProfilePicPreview(originalValues.profile_picture || null);
    setProfilePicFile(null);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-500">
      <div className="w-full max-w-6xl mx-auto py-10 px-2 lg:px-16 xl:px-32 space-y-10">
        {/* CABECERA */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 flex flex-col md:flex-row gap-8 items-center md:items-start w-full">
          <div className="flex flex-col items-center md:w-1/3">
            <UserAvatar
              src={profilePicPreview || values.profile_picture}
              name={`${values.first_name} ${values.last_name}`.trim() || values.username}
              size={128}
              className="mb-4"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Miembro desde: {user?.date_joined ? new Date(user.date_joined).toLocaleDateString() : "No disponible"}
            </p>
            {isEditing && (
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePicChange}
                className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            )}
          </div>
          <div className="flex-1 w-full">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Mi Perfil</h1>
              <Button
                variant={isEditing ? "secondary" : "primary"}
                onClick={isEditing ? handleCancelEdit : handleEditClick}
                disabled={loadingProfile}
              >
                {isEditing ? "Cancelar" : "Editar Perfil"}
              </Button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6 w-full ">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
                <Input label="Nombre" value={values.first_name} onChange={e => setValues({ ...values, first_name: e.target.value })} disabled={!isEditing || loadingProfile} />
                <Input label="Apellido" value={values.last_name} onChange={e => setValues({ ...values, last_name: e.target.value })} disabled={!isEditing || loadingProfile} />
                <Input label="Nombre de usuario" value={values.username} onChange={e => setValues({ ...values, username: e.target.value })} disabled={!isEditing || loadingProfile} />
                <Input label="Correo electrónico" type="email" value={values.email} onChange={e => setValues({ ...values, email: e.target.value })} disabled={!isEditing || loadingProfile} />
                <Input
                  label="Roles"
                  value={
                    Array.isArray(values.roles)
                      ? values.roles.map(r => `${r.name} (${r.app?.name})`).join(', ')
                      : ""
                  }
                  disabled
                />
              </div>
              {isEditing && (
                <div className="flex gap-4 pt-2">
                  <Button type="submit" variant="primary" loading={loadingProfile}>Guardar cambios</Button>
                  <Button type="button" variant="secondary" onClick={handleCancelEdit} disabled={loadingProfile}>Cancelar</Button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* SECCIÓN DE SEGURIDAD */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 space-y-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Seguridad</h2>

          {/* 2FA */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Autenticación de dos factores</h3>
              <p className="text-sm text-gray-600">
                {is2FAEnabled
                  ? "La autenticación de dos factores está activada"
                  : "Añade una capa extra de seguridad a tu cuenta"}
              </p>
            </div>
            {is2FAEnabled ? (
              <div className="flex gap-3">
                <Button variant="danger" onClick={handleDisable2FA} loading={loading2FA}>
                  {loading2FA ? "Desactivando..." : "Desactivar 2FA"}
                </Button>
                <Link
                  to="/auth/configure-2fa"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
                >
                  Reconfigurar 2FA
                </Link>
              </div>
            ) : (
              <Link
                to="/auth/configure-2fa"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Configurar 2FA
              </Link>
            )}
          </div>

          <div className="border-t border-gray-200 my-6" />

          {/* CAMBIO DE CONTRASEÑA */}
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Cambiar contraseña</h3>
            <form className="space-y-4 max-w-md" onSubmit={handlePasswordChange}>
              <Input
                type="password"
                label="Contraseña actual"
                placeholder="Ingresa tu contraseña actual"
                value={passwords.current}
                onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                required
                disabled={passwordLoading}
                showPasswordToggle
              />
              <Input
                type="password"
                label="Nueva contraseña"
                placeholder="Ingresa tu nueva contraseña"
                value={passwords.new}
                onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                required
                disabled={passwordLoading}
                showPasswordToggle
              />
              {/* Validación dinámica */}
              <ul className="mb-2 space-y-1 text-sm">
                {passwordRequirements.map((req, i) => (
                  <li key={req.label} className="flex items-center gap-2">
                    {passwordChecks[i] ? (
                      <span className="inline-block w-4 h-4 rounded-full bg-green-500 text-white flex items-center justify-center text-xs">&#10003;</span>
                    ) : (
                      <span className="inline-block w-4 h-4 rounded-full bg-gray-300 text-gray-500 flex items-center justify-center text-xs">–</span>
                    )}
                    <span className={passwordChecks[i] ? "text-green-600" : "text-gray-600"}>
                      {req.label}
                    </span>
                  </li>
                ))}
              </ul>
              <Input
                type="password"
                label="Confirmar contraseña"
                placeholder="Confirma tu nueva contraseña"
                value={passwords.confirm}
                onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                required
                disabled={passwordLoading}
                showPasswordToggle
              />
              {passwordError && <div className="text-red-600 text-sm">{passwordError}</div>}
              <Button variant="primary" type="submit" loading={passwordLoading}>
                Actualizar contraseña
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* 🔧 NUEVO: Modal de confirmación personalizado */}
      <Disable2FAConfirmModal
        isOpen={showDisableModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDisable2FA}
        loading={loading2FA}
      />
    </div>
  );
}
