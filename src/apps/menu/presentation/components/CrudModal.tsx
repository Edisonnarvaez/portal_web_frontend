import React, { useState, useEffect } from "react";
import { HiXMark } from "react-icons/hi2";

interface CrudModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSubmit?: () => void;
  loading?: boolean;
  submitText?: string;
  submitButtonColor?: 'blue' | 'red' | 'green';
  showFooter?: boolean; // 👈 NUEVO: controlar si mostrar footer
}

export default function CrudModal({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  loading = false,
  submitText = "Guardar",
  submitButtonColor = 'blue',
  showFooter = true // 👈 NUEVO: por defecto true
}: CrudModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      setIsVisible(false);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getButtonColors = () => {
    switch (submitButtonColor) {
      case 'red':
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
      case 'green':
        return 'bg-green-600 hover:bg-green-700 focus:ring-green-500';
      default:
        return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
    }
  };

  // 👈 NUEVO: función para disparar submit del formulario hijo
  const handleSubmit = () => {
    const form = document.querySelector('#crud-form') as HTMLFormElement;
    if (form) {
      form.requestSubmit(); // Dispara el submit del formulario
    } else if (onSubmit) {
      onSubmit(); // Fallback para modales sin formulario
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className={`
            relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-xl 
            transform transition-all duration-200
            ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              disabled={loading}
            >
              <HiXMark className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[70vh] overflow-y-auto"> {/* 👈 MEJORAR: altura máxima */}
            {children}
          </div>

          {/* Footer - Condicional */}
          {showFooter && (
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSubmit} // 👈 CAMBIAR: usar handleSubmit
                disabled={loading}
                className={`
                  px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center gap-2 ${getButtonColors()}
                `}
              >
                {loading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {submitText}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}