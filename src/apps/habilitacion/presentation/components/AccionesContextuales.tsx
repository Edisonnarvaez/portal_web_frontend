import React from 'react';
import {
  HiOutlineArrowPath,
  HiOutlineDocumentPlus,
  HiOutlineEye,
} from 'react-icons/hi2';
import type { DatosPrestador } from '../../domain/entities/DatosPrestador';
import type { Autoevaluacion } from '../../domain/entities/Autoevaluacion';
import { diasParaVencimiento } from '../utils/formatters';

/* ─── types ─── */
export interface AccionContextual {
  key: string;
  label: string;
  icon: React.ReactNode;
  variant: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
  onClick: () => void;
}

/**
 * Given a prestador and its latest autoevaluación, returns
 * which contextual actions should be displayed.
 */
export const getAccionesPrestador = (
  prestador: DatosPrestador,
  ultimaAutoevaluacion?: Autoevaluacion | null,
  callbacks?: {
    onRenovar?: (id: number) => void;
    onCrearEvaluacion?: (prestadorId: number) => void;
    onVerDetalle?: (id: number) => void;
    onEditar?: (id: number) => void;
  },
): AccionContextual[] => {
  const acciones: AccionContextual[] = [];
  const dias = diasParaVencimiento(prestador.fecha_vencimiento_habilitacion);

  // "Renovar" if ≤ 180 days to expiry
  if (dias !== null && dias <= 180 && callbacks?.onRenovar) {
    acciones.push({
      key: 'renovar',
      label: dias <= 0 ? 'Renovar (Vencido)' : 'Renovar',
      icon: <HiOutlineArrowPath className="h-4 w-4" />,
      variant: dias <= 30 ? 'danger' : dias <= 90 ? 'warning' : 'success',
      onClick: () => callbacks.onRenovar!(prestador.id),
    });
  }

  // "Crear Evaluación" if last autoevaluación is VALIDADA or no autoevaluaciones
  if (
    (!ultimaAutoevaluacion || ultimaAutoevaluacion.estado === 'VALIDADA') &&
    callbacks?.onCrearEvaluacion
  ) {
    acciones.push({
      key: 'crear-evaluacion',
      label: 'Nueva Evaluación',
      icon: <HiOutlineDocumentPlus className="h-4 w-4" />,
      variant: 'primary',
      onClick: () => callbacks.onCrearEvaluacion!(prestador.id),
    });
  }

  // "Ver detalle" always
  if (callbacks?.onVerDetalle) {
    acciones.push({
      key: 'ver-detalle',
      label: 'Ver Detalle',
      icon: <HiOutlineEye className="h-4 w-4" />,
      variant: 'neutral',
      onClick: () => callbacks.onVerDetalle!(prestador.id),
    });
  }

  return acciones;
};

/* ─── Variant styles ─── */
const variantClasses: Record<AccionContextual['variant'], string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  success: 'bg-green-600 text-white hover:bg-green-700',
  warning: 'bg-orange-500 text-white hover:bg-orange-600',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  neutral: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700',
};

/* ─── Render component ─── */
export interface AccionesContextualesProps {
  acciones: AccionContextual[];
  /** Compact mode - small buttons */
  compact?: boolean;
  className?: string;
}

/**
 * Renders contextual action buttons.
 */
const AccionesContextuales: React.FC<AccionesContextualesProps> = ({
  acciones,
  compact = false,
  className = '',
}) => {
  if (acciones.length === 0) return null;

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      {acciones.map(action => (
        <button
          key={action.key}
          onClick={e => {
            e.stopPropagation();
            action.onClick();
          }}
          className={`inline-flex items-center gap-1.5 font-medium rounded-lg transition-colors ${
            compact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'
          } ${variantClasses[action.variant]}`}
          title={action.label}
        >
          {action.icon}
          {!compact && action.label}
        </button>
      ))}
    </div>
  );
};

export default AccionesContextuales;
