import React from 'react';
import {
  HiOutlineShieldCheck,
  HiOutlineExclamationTriangle,
  HiOutlineClock,
  HiOutlineXCircle,
} from 'react-icons/hi2';
import { diasParaVencimiento } from '../utils/formatters';

export type VencimientoLevel = 'safe' | 'notice' | 'warning' | 'danger' | 'expired' | 'unknown';

/**
 * Returns a vencimiento level following the color scheme:
 * - Green  (safe)   : > 180 days
 * - Yellow (notice)  : 90–180 days
 * - Orange (warning) : 30–90 days
 * - Red    (danger)  : 1–30 days
 * - Red    (expired) : ≤ 0 days
 */
export const getVencimientoLevel = (fechaVencimiento?: string): VencimientoLevel => {
  const dias = diasParaVencimiento(fechaVencimiento);
  if (dias === null) return 'unknown';
  if (dias <= 0) return 'expired';
  if (dias <= 30) return 'danger';
  if (dias <= 90) return 'warning';
  if (dias <= 180) return 'notice';
  return 'safe';
};

const levelConfig: Record<VencimientoLevel, {
  bg: string;
  text: string;
  border: string;
  icon: React.ReactNode;
  labelFn: (dias: number | null) => string;
}> = {
  safe: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    text: 'text-green-700 dark:text-green-300',
    border: 'border-green-200 dark:border-green-800',
    icon: <HiOutlineShieldCheck className="h-4 w-4 text-green-600 dark:text-green-400" />,
    labelFn: (d) => `${d} días`,
  },
  notice: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    text: 'text-yellow-700 dark:text-yellow-300',
    border: 'border-yellow-200 dark:border-yellow-800',
    icon: <HiOutlineClock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />,
    labelFn: (d) => `${d} días`,
  },
  warning: {
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    text: 'text-orange-700 dark:text-orange-300',
    border: 'border-orange-200 dark:border-orange-800',
    icon: <HiOutlineExclamationTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />,
    labelFn: (d) => `${d} días`,
  },
  danger: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-200 dark:border-red-800',
    icon: <HiOutlineXCircle className="h-4 w-4 text-red-600 dark:text-red-400" />,
    labelFn: (d) => `${d} días`,
  },
  expired: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-800 dark:text-red-200',
    border: 'border-red-300 dark:border-red-700',
    icon: <HiOutlineXCircle className="h-4 w-4 text-red-700 dark:text-red-300" />,
    labelFn: (d) => `Vencido hace ${Math.abs(d ?? 0)} días`,
  },
  unknown: {
    bg: 'bg-gray-50 dark:bg-gray-800',
    text: 'text-gray-500 dark:text-gray-400',
    border: 'border-gray-200 dark:border-gray-700',
    icon: <HiOutlineClock className="h-4 w-4 text-gray-400" />,
    labelFn: () => 'Sin fecha',
  },
};

export interface VencimientoBadgeProps {
  fechaVencimiento?: string;
  /** Compact mode – icon + days only */
  compact?: boolean;
  /** Show icon. Default true */
  showIcon?: boolean;
  /** Additional classname */
  className?: string;
}

/**
 * Renders a color-coded badge showing how many days until `fechaVencimiento`.
 *
 * | Range       | Color  |
 * |------------|--------|
 * | > 180 d    | Green  |
 * | 90–180 d   | Yellow |
 * | 30–90 d    | Orange |
 * | 1–30 d     | Red    |
 * | ≤ 0 d      | Red (solid) |
 */
const VencimientoBadge: React.FC<VencimientoBadgeProps> = ({
  fechaVencimiento,
  compact = false,
  showIcon = true,
  className = '',
}) => {
  const dias = diasParaVencimiento(fechaVencimiento);
  const level = getVencimientoLevel(fechaVencimiento);
  const config = levelConfig[level];

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1 text-xs font-semibold ${config.text} ${className}`}>
        {showIcon && config.icon}
        {config.labelFn(dias)}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      {showIcon && config.icon}
      {config.labelFn(dias)}
    </span>
  );
};

export default VencimientoBadge;
