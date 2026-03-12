import React, { useMemo } from 'react';
import { HiOutlinePencilSquare, HiOutlineTrash } from 'react-icons/hi2';
import type { ServicioSede } from '../../domain/entities/ServicioSede';
import { formatDate } from '../utils/formatters';

interface ServicioCardProps {
  servicio: ServicioSede;
  onEdit?: (servicio: ServicioSede) => void;
  onDelete?: (id: number) => void;
}

/**
 * ServicioCard
 * Tarjeta que muestra información de un ServicioSede
 * Sincronizado con modelo Django ServicioSede
 */
export const ServicioCard: React.FC<ServicioCardProps> = ({
  servicio,
  onEdit,
  onDelete,
}) => {
  // Funciones de utilidad puras (no usan estado)
  const getComplejidadColor = (complejidad: string): string => {
    const colores: Record<string, string> = {
      'BAJA': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'MEDIA': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'ALTA': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return colores[complejidad] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const getEstadoHabilitacionColor = (estado: string): string => {
    const colores: Record<string, string> = {
      'HABILITADO': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'EN_PROCESO': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'SUSPENDIDO': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'NO_HABILITADO': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'CANCELADO': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    };
    return colores[estado] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const getModalidadColor = (modalidad: string): string => {
    const colores: Record<string, string> = {
      'INTRAMURAL': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'AMBULATORIA': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'TELEMEDICINA': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      'URGENCIAS': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'AMBULANCIA': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    };
    return colores[modalidad] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  // Cálculos de vencimiento (memorizados para evitar recálculos)
  const vencimientoInfo = useMemo(() => {
    if (!servicio.fecha_vencimiento) return null;
    
    const fechaVencimientoDate = new Date(servicio.fecha_vencimiento);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fechaVencimientoDate.setHours(0, 0, 0, 0);
    
    const diferencia = fechaVencimientoDate.getTime() - hoy.getTime();
    const dias = Math.ceil(diferencia / (1000 * 3600 * 24));
    
    return {
      dias,
      vencido: dias < 0,
      proximoVencer: dias >= 0 && dias <= 90,
    };
  }, [servicio.fecha_vencimiento]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
      {/* Encabezado - Título y Acciones */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
            {servicio.codigo_servicio}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 truncate line-clamp-2">
            {servicio.nombre_servicio}
          </p>
        </div>
        <div className="flex gap-1 ml-2 flex-shrink-0">
          {onEdit && (
            <button
              onClick={() => onEdit(servicio)}
              title="Editar servicio"
              className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
            >
              <HiOutlinePencilSquare className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(servicio.id)}
              title="Eliminar servicio"
              className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
            >
              <HiOutlineTrash className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Badges - Modalidad y Complejidad */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-2 py-1 rounded text-xs font-medium ${getModalidadColor(servicio.modalidad)}`}>
            {servicio.modalidad}
          </span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${getComplejidadColor(servicio.complejidad)}`}>
            {servicio.complejidad}
          </span>
        </div>

        {/* Estado Habilitación */}
        <div>
          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${getEstadoHabilitacionColor(servicio.estado_habilitacion)}`}>
            {servicio.estado_habilitacion}
          </span>
        </div>
      </div>

      {/* Sección de Vencimiento */}
      {servicio.fecha_vencimiento && vencimientoInfo && (
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
            <strong>Vencimiento:</strong> {formatDate(servicio.fecha_vencimiento)}
          </div>
          <div className={`text-xs font-semibold flex items-center gap-2 ${
            vencimientoInfo.vencido
              ? 'text-red-600 dark:text-red-400'
              : vencimientoInfo.proximoVencer
              ? 'text-yellow-600 dark:text-yellow-400'
              : 'text-green-600 dark:text-green-400'
          }`}>
            <span className={`inline-block w-2 h-2 rounded-full ${
              vencimientoInfo.vencido
                ? 'bg-red-600'
                : vencimientoInfo.proximoVencer
                ? 'bg-yellow-600'
                : 'bg-green-600'
            }`}></span>
            {vencimientoInfo.vencido
              ? `Vencido hace ${Math.abs(vencimientoInfo.dias)} días`
              : `Vence en ${vencimientoInfo.dias} días`}
          </div>
        </div>
      )}

      {/* Información del Prestador */}
      {servicio.prestador && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
            <strong>Prestador:</strong> {servicio.prestador.codigo_reps}
          </p>
          {servicio.prestador.nombre_prestador && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              {servicio.prestador.nombre_prestador}
            </p>
          )}
          {servicio.prestador.headquarters_detail?.name && (
            <p className="text-xs text-gray-500 dark:text-gray-500">
              <strong>Sede:</strong> {servicio.prestador.headquarters_detail.name}
            </p>
          )}
        </div>
      )}

      {/* Metadata - Fechas */}
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
        <span>Creado: {formatDate(servicio.fecha_creacion)}</span>
        {servicio.fecha_actualizacion && servicio.fecha_actualizacion !== servicio.fecha_creacion && (
          <span>Act: {formatDate(servicio.fecha_actualizacion)}</span>
        )}
      </div>
    </div>
  );
};
