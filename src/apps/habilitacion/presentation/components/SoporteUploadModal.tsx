import React, { useState, useRef, useEffect } from 'react';
import type { SoporteDocumentalCreate } from '../../domain/entities/SoporteDocumental';
import { useSoporte } from '../hooks/useSoporte';

interface SoporteUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: (soporte: any) => void;
  nivel: 'EMPRESA' | 'SEDE' | 'SERVICIO';
  contextId: number; // empresa_id, sede_id, or servicio_id based on nivel
}

/**
 * Modal component for uploading supporting documents
 * Handles file selection, validation, and upload with progress tracking
 */
const SoporteUploadModal: React.FC<SoporteUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
  nivel,
  contextId,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tipoDocumentoId, setTipoDocumentoId] = useState<number | ''>('');
  const [fechaEmision, setFechaEmision] = useState<string>('');
  const [observaciones, setObservaciones] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadSoporte, tiposDocumento, loading: loadingTipos, fetchTipos } = useSoporte();

  // Load types when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchTipos().catch(err => {
        console.error('Error loading document types:', err);
      });
    }
  }, [isOpen, fetchTipos]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('El archivo no puede exceder 10MB');
        return;
      }

      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword'];
      if (!allowedTypes.includes(file.type)) {
        setUploadError('Tipo de archivo no permitido. Use PDF, JPG, PNG o DOC');
        return;
      }

      setSelectedFile(file);
      setUploadError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !tipoDocumentoId) {
      setUploadError('Por favor seleccione un archivo y tipo de documento');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // Simulate progress for UX feedback
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + Math.random() * 30, 90));
      }, 200);

      const soporteData: SoporteDocumentalCreate = {
        tipo_documento: tipoDocumentoId as number,
        nivel,
        archivo: selectedFile,
        ...(fechaEmision && { fecha_emision: fechaEmision }),
        ...(observaciones && { observaciones }),
        ...(nivel === 'EMPRESA' && { empresa: contextId }),
        ...(nivel === 'SEDE' && { sede: contextId }),
        ...(nivel === 'SERVICIO' && { servicio: contextId }),
      };

      const result = await uploadSoporte(soporteData as any);

      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        setIsUploading(false);
        setSelectedFile(null);
        setTipoDocumentoId('');
        setFechaEmision('');
        setObservaciones('');
        setUploadProgress(0);

        if (onUploadSuccess) {
          onUploadSuccess(result);
        }

        onClose();
      }, 500);
    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
      setUploadError(
        error instanceof Error ? error.message : 'Error al cargar el archivo'
      );
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setSelectedFile(null);
      setTipoDocumentoId('');
      setFechaEmision('');
      setObservaciones('');
      setUploadError(null);
      setUploadProgress(0);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header - Responsive */}
        <div className="sticky top-0 bg-blue-600 dark:bg-blue-700 text-white p-3 sm:p-4 lg:p-6 flex justify-between items-center">
          <h2 className="text-lg sm:text-xl font-bold">Cargar Documento</h2>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="text-white hover:text-gray-200 text-2xl disabled:opacity-50 ml-2 flex-shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Content - Responsive Padding */}
        <div className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4">
          {/* Type Selection */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
              Tipo de Documento *
            </label>
            {loadingTipos && (
              <div className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg text-sm text-gray-500 dark:text-gray-400">
                ⏳ Cargando tipos de documento...
              </div>
            )}
            {!loadingTipos && (
              <select
                value={tipoDocumentoId}
                onChange={(e) => setTipoDocumentoId(e.target.value ? Number(e.target.value) : '')}
                disabled={isUploading || loadingTipos || tiposDocumento.length === 0}
                className="w-full px-3 sm:px-4 py-2 text-base sm:text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800"
              >
                <option value="">
                  {tiposDocumento.length === 0 ? 'Sin tipos disponibles' : 'Seleccionar tipo...'}
                </option>
                {tiposDocumento.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
            )}
            {!loadingTipos && tiposDocumento.length === 0 && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                ⚠️ No hay tipos de documento disponibles
              </p>
            )}
          </div>

          {/* File Input */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
              Archivo *
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-3 sm:p-4 lg:p-6 text-center hover:border-blue-400 transition min-h-[120px] sm:min-h-[150px] flex flex-col items-center justify-center">
              {selectedFile ? (
                <div className="space-y-2 w-full">
                  <div className="text-2xl sm:text-3xl">📄</div>
                  <p className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200 truncate" title={selectedFile.name}>{selectedFile.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-xs font-medium underline disabled:opacity-50"
                  >
                    Cambiar archivo
                  </button>
                </div>
              ) : (
                <div
                  className="cursor-pointer space-y-2 w-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="text-3xl sm:text-4xl">📁</div>
                  <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Haz clic para seleccionar</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">o arrastra un archivo</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 sm:mt-2">
                    Máximo 10MB (PDF, JPG, PNG, DOC)
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                disabled={isUploading}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
              Fecha de Emisión (opcional)
            </label>
            <input
              type="date"
              value={fechaEmision}
              onChange={(e) => setFechaEmision(e.target.value)}
              disabled={isUploading}
              className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Ingresa la fecha en que el documento fue emitido
            </p>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
              Observaciones (opcional)
            </label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              disabled={isUploading}
              placeholder="Agregue observaciones o notas sobre el documento..."
              className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 resize-none"
              rows={2}
            />
          </div>

          {/* Error Message */}
          {uploadError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded p-2 sm:p-3">
              <p className="text-xs sm:text-sm text-red-700 dark:text-red-400">❌ {uploadError}</p>
            </div>
          )}

          {/* Progress Bar */}
          {isUploading && uploadProgress > 0 && (
            <div className="space-y-1.5 sm:space-y-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 text-center">{Math.round(uploadProgress)}%</p>
            </div>
          )}

          {/* Action Buttons - Responsive */}
          <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
            <button
              onClick={handleClose}
              disabled={isUploading}
              className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 font-medium disabled:opacity-50 transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleUpload}
              disabled={isUploading || !selectedFile || !tipoDocumentoId}
              className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 font-medium disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition"
            >
              {isUploading ? '⏳ Cargando...' : '📤 Cargar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoporteUploadModal;
