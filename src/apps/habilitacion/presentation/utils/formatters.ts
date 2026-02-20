import {
  ESTADOS_HABILITACION,
  ESTADOS_AUTOEVALUACION,
  ESTADOS_CUMPLIMIENTO,
  ESTADOS_PLAN_MEJORA,
  TIPOS_HALLAZGO,
  SEVERIDADES_HALLAZGO,
  ESTADOS_HALLAZGO,
  ORIGENES_TIPO,
} from '../../domain/types';

type EstadoItem = { readonly value: string; readonly label: string; readonly color?: string };

const ALL_ESTADOS: readonly EstadoItem[][] = [
  ESTADOS_HABILITACION,
  ESTADOS_AUTOEVALUACION,
  ESTADOS_CUMPLIMIENTO,
  ESTADOS_PLAN_MEJORA,
  TIPOS_HALLAZGO,
  SEVERIDADES_HALLAZGO,
  ESTADOS_HALLAZGO,
  ORIGENES_TIPO,
] as unknown as EstadoItem[][];

export const getEstadoLabel = (estado: string): string => {
  for (const list of ALL_ESTADOS) {
    const found = list.find(e => e.value === estado);
    if (found) return found.label;
  }
  return estado || 'N/A';
};

export const getEstadoColor = (estado: string): string => {
  for (const list of ALL_ESTADOS) {
    const found = list.find(e => e.value === estado);
    if (found?.color) return found.color;
  }
  return 'bg-gray-100 text-gray-800';
};

export const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  } catch {
    return 'Fecha inválida';
  }
};

export const diasParaVencimiento = (fechaVencimiento?: string): number | null => {
  if (!fechaVencimiento) return null;
  const fechaVencimientoDate = new Date(fechaVencimiento);
  const hoy = new Date();
  const diferencia = fechaVencimientoDate.getTime() - hoy.getTime();
  return Math.ceil(diferencia / (1000 * 3600 * 24));
};

export const estaProximoAVencer = (fechaVencimiento?: string, dias: number = 90): boolean => {
  const diasFaltantes = diasParaVencimiento(fechaVencimiento);
  if (diasFaltantes === null) return false;
  return diasFaltantes >= 0 && diasFaltantes <= dias;
};

export const estaVencido = (fechaVencimiento?: string): boolean => {
  const diasFaltantes = diasParaVencimiento(fechaVencimiento);
  if (diasFaltantes === null) return false;
  return diasFaltantes < 0;
};

export const getEstadoVencimiento = (fechaVencimiento?: string): 'vigente' | 'proximo' | 'vencido' => {
  if (estaVencido(fechaVencimiento)) return 'vencido';
  if (estaProximoAVencer(fechaVencimiento)) return 'proximo';
  return 'vigente';
};
