/**
 * Z-Index Constants for Habilitación Module
 * Centralized z-index values to prevent stacking conflicts
 */

export const Z_INDEX = {
  // Base layers
  DROPDOWN: 20,
  STICKY: 25,

  // Modal related
  MODAL_BACKDROP: 40,
  SIDEBAR_MOBILE: 40,
  MODAL: 50,

  // Tooltips & popovers
  TOOLTIP: 60,
} as const;

export type ZIndexKey = keyof typeof Z_INDEX;
