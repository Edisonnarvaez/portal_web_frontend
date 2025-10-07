import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import Button from "../../../../shared/components/Button";
import { enable2FA, disable2FA } from "../../infrastructure/repositories/AuthRepository";
import { notify } from '../../../../shared/utils/notifications';
import { useAuthContext } from '../context/AuthContext';

interface TwoFactorResponse {
  message: string;
  secret: string;
  otp_uri: string;
  is_2fa_enabled: boolean;
}

// 🔧 NEW: Custom confirmation modal for 2FA disable
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

export default function Configure2FA() {
  const [otpUri, setOtpUri] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasInitialized, setHasInitialized] = useState(false);
  // 🔧 NEW: Modal state
  const [showDisableModal, setShowDisableModal] = useState(false);
  
  const navigate = useNavigate();
  const { user, setUser } = useAuthContext();
  const [is2FAEnabled, setIs2FAEnabled] = useState(user?.is_2fa_enabled || false);

  // 🔧 CORREGIR: Evitar llamada automática duplicada
  useEffect(() => {
    // Solo inicializar si el usuario no tiene 2FA habilitado y no se ha inicializado ya
    if (!user?.is_2fa_enabled && !hasInitialized) {
      setHasInitialized(true);
      // No llamar automáticamente, dejar que el usuario decida
    }
  }, [user, hasInitialized]);

  // 🔧 MEJORAR: Actualizar estado del usuario en el contexto
  const updateUserState = (is2FAEnabled: boolean) => {
    if (user) {
      const updatedUser = { ...user, is_2fa_enabled: is2FAEnabled };
      setUser(updatedUser);
      
      // Actualizar localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  const handleEnable2FA = async () => {
    setLoading(true);
    setError("");

    try {
      //console.log('🔐 Habilitando 2FA...');
      
      const response = await enable2FA();
      const data = response as TwoFactorResponse;
      
      //console.log('📥 Respuesta del servidor:', data);
      
      if (data.otp_uri && data.secret) {
        setOtpUri(data.otp_uri);
        setSecret(data.secret);
        notify.success("2FA configurado exitosamente. Escanea el código QR con tu aplicación de autenticación");
        notify.info("Se ha enviado un correo con la información de respaldo y los pasos de configuración");
      } else {
        throw new Error('No se recibió la información necesaria del servidor');
      }
    } catch (err: any) {
      console.error('❌ Error al habilitar 2FA:', err);
      const errorMessage = err.message || "Error al configurar 2FA";
      setError(errorMessage);
      notify.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 🔧 UPDATED: Show modal instead of window.confirm
  const handleDisable2FA = () => {
    setShowDisableModal(true);
  };

  // 🔧 NEW: Handle confirm disable from modal
  const handleConfirmDisable2FA = async () => {
    setLoading(true);
    setError("");

    try {
      //console.log('🔐 Deshabilitando 2FA...');
      
      await disable2FA();
      
      setIs2FAEnabled(false);
      updateUserState(false);
      setShowDisableModal(false);
      
      notify.success("Autenticación de dos factores desactivada exitosamente");
      navigate("/profile", { 
        state: { 
          is2FAEnabled: false,
          successMessage: "2FA desactivado correctamente" 
        }
      });
    } catch (err: any) {
      console.error('❌ Error al deshabilitar 2FA:', err);
      const errorMessage = err.message || "Error al desactivar 2FA";
      setError(errorMessage);
      notify.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 🔧 NEW: Handle modal close
  const handleCloseModal = () => {
    if (!loading) {
      setShowDisableModal(false);
    }
  };

  const handleFinish = () => {
    // 🔧 MEJORAR: Actualizar estado del usuario cuando se complete la configuración
    setIs2FAEnabled(true);
    updateUserState(true);
    
    notify.info("Recuerda usar el código de tu aplicación de autenticación en tu próximo inicio de sesión");
    navigate("/profile", { 
      state: { 
        is2FAEnabled: true,
        successMessage: "2FA configurado correctamente" 
      }
    });
  };

  const handleCancel = () => {
    // 🔧 NUEVO: Limpiar estado al cancelar
    setOtpUri("");
    setSecret("");
    setError("");
    navigate("/profile");
  };

  // 🔧 NUEVO: Función para volver al perfil sin configurar 2FA
  const handleBackToProfile = () => {
    navigate("/profile");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        {/* 🔧 NUEVO: Botón de volver arriba */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBackToProfile}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            disabled={loading}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm">Volver al perfil</span>
          </button>
          
          {/* 🔧 OPCIONAL: Indicador de progreso */}
          {!is2FAEnabled && (
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex gap-1">
                <div className={`w-2 h-2 rounded-full ${!otpUri ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                <div className={`w-2 h-2 rounded-full ${otpUri ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
              </div>
              <span>{!otpUri ? 'Configurar' : 'Completar'}</span>
            </div>
          )}
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Configuración de Autenticación de Dos Factores
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {is2FAEnabled 
              ? "Gestiona tu configuración de autenticación de dos factores" 
              : "Mejora la seguridad de tu cuenta configurando la autenticación de dos factores"}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {is2FAEnabled ? (
            <div className="flex flex-col items-center gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg text-green-800 dark:text-green-200 text-center">
                <p className="font-medium">✅ 2FA está actualmente activado</p>
                <p className="text-sm mt-1">Tu cuenta está protegida con autenticación de dos factores</p>
              </div>
              <div className="flex gap-4">
                <Button
                  variant="danger"
                  onClick={handleDisable2FA}
                  loading={loading}
                  disabled={loading}
                >
                  {loading ? "Desactivando..." : "Desactivar 2FA"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleEnable2FA}
                  disabled={loading}
                >
                  Reconfigurar 2FA
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* 🔧 MEJORAR: Mostrar botón para iniciar configuración si no hay QR */}
              {!otpUri && (
                <div className="text-center">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg text-yellow-800 dark:text-yellow-200 mb-6">
                    <p className="font-medium">⚠️ 2FA no está activado</p>
                    <p className="text-sm mt-1">Tu cuenta no está protegida con autenticación de dos factores</p>
                  </div>
                  
                  {/* 🔧 MEJORAR: Botones centrados con mejor espacio */}
                  <div className="space-y-3">
                    <Button
                      variant="primary"
                      onClick={handleEnable2FA}
                      loading={loading}
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? "Configurando..." : "Configurar 2FA"}
                    </Button>
                    
                    {/* 🔧 NUEVO: Botón para saltar configuración */}
                    <Button
                      variant="secondary"
                      onClick={handleBackToProfile}
                      disabled={loading}
                      className="w-full"
                    >
                      Tal vez más tarde
                    </Button>
                  </div>
                </div>
              )}

              {/* 🔧 MEJORAR: Mostrar instrucciones y QR cuando esté disponible */}
              {otpUri && (
                <>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                      Pasos a seguir:
                    </h3>
                    <ol className="list-decimal list-inside text-blue-700 dark:text-blue-300 space-y-1 text-sm">
                      <li>Descarga una aplicación de autenticación como Google Authenticator, Microsoft Authenticator, Authy u otra de tu preferencia</li>
                      <li>Abre la aplicación y selecciona añadir una nueva cuenta</li>
                      <li>Escanea el código QR que aparece abajo o introduce manualmente la clave secreta</li>
                      <li>Guarda la clave secreta en un lugar seguro como respaldo</li>
                      <li>Se te ha enviado un correo con esta información y los pasos detallados</li>
                    </ol>
                  </div>

                  <div className="flex flex-col items-center space-y-4">
                    <div className="p-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                      <QRCodeCanvas 
                        value={otpUri}
                        size={200}
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                    
                    <div className="w-full text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Escanea este código QR con tu aplicación de autenticación
                      </p>
                      {secret && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Clave de respaldo:
                          </p>
                          <div className="bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 mb-2">
                            <p className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all">
                              {secret}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Guarda esta clave en un lugar seguro. La necesitarás si pierdes acceso a tu aplicación de autenticación.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4 justify-center">
                    <Button
                      type="button"
                      variant="primary"
                      onClick={handleFinish}
                      disabled={loading || !otpUri}
                    >
                      He configurado la autenticación
                    </Button>
                    
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      Cancelar
                    </Button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* 🔧 NEW: Custom confirmation modal */}
      <Disable2FAConfirmModal
        isOpen={showDisableModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDisable2FA}
        loading={loading}
      />
    </div>
  );
}