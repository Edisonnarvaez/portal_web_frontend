/**
 * Enums.test.ts
 * Tests for habilitacion domain enums
 */

import { describe, it, expect } from 'vitest';
import {
  ComplejidadCriterioEnum,
  complejidadCriterioLabels,
  EstadoCumplimientoEnum,
  estadoCumplimientoLabels,
  isValidComplejidadCriterio,
  isValidEstadoCumplimiento,
} from '../index';

describe('Enums', () => {
  describe('ComplejidadCriterioEnum', () => {
    it('should have all expected values', () => {
      expect(ComplejidadCriterioEnum.BAJA).toBe('BAJA');
      expect(ComplejidadCriterioEnum.MEDIA).toBe('MEDIA');
      expect(ComplejidadCriterioEnum.ALTA).toBe('ALTA');
    });

    it('should have labels for all values', () => {
      expect(complejidadCriterioLabels[ComplejidadCriterioEnum.BAJA]).toBe('Baja');
      expect(complejidadCriterioLabels[ComplejidadCriterioEnum.MEDIA]).toBe('Media');
      expect(complejidadCriterioLabels[ComplejidadCriterioEnum.ALTA]).toBe('Alta');
    });

    it('should validate correct complejidad values', () => {
      expect(isValidComplejidadCriterio('BAJA')).toBe(true);
      expect(isValidComplejidadCriterio('MEDIA')).toBe(true);
      expect(isValidComplejidadCriterio('ALTA')).toBe(true);
    });

    it('should reject invalid complejidad values', () => {
      expect(isValidComplejidadCriterio('INVALID')).toBe(false);
      expect(isValidComplejidadCriterio('')).toBe(false);
      expect(isValidComplejidadCriterio(null)).toBe(false);
      expect(isValidComplejidadCriterio(undefined)).toBe(false);
    });
  });

  describe('EstadoCumplimientoEnum', () => {
    it('should have all expected values', () => {
      expect(EstadoCumplimientoEnum.CUMPLE).toBe('CUMPLE');
      expect(EstadoCumplimientoEnum.NO_CUMPLE).toBe('NO_CUMPLE');
      expect(EstadoCumplimientoEnum.PARCIALMENTE).toBe('PARCIALMENTE');
      expect(EstadoCumplimientoEnum.NO_APLICA).toBe('NO_APLICA');
    });

    it('should have labels for all values', () => {
      expect(estadoCumplimientoLabels[EstadoCumplimientoEnum.CUMPLE]).toBe('Cumple');
      expect(estadoCumplimientoLabels[EstadoCumplimientoEnum.NO_CUMPLE]).toBe('No Cumple');
      expect(estadoCumplimientoLabels[EstadoCumplimientoEnum.PARCIALMENTE]).toBe('Parcialmente');
      expect(estadoCumplimientoLabels[EstadoCumplimientoEnum.NO_APLICA]).toBe('No Aplica');
    });

    it('should validate correct estado cumplimiento values', () => {
      expect(isValidEstadoCumplimiento('CUMPLE')).toBe(true);
      expect(isValidEstadoCumplimiento('NO_CUMPLE')).toBe(true);
      expect(isValidEstadoCumplimiento('PARCIALMENTE')).toBe(true);
      expect(isValidEstadoCumplimiento('NO_APLICA')).toBe(true);
    });

    it('should reject invalid estado cumplimiento values', () => {
      expect(isValidEstadoCumplimiento('INVALID')).toBe(false);
      expect(isValidEstadoCumplimiento('')).toBe(false);
      expect(isValidEstadoCumplimiento(null)).toBe(false);
      expect(isValidEstadoCumplimiento(undefined)).toBe(false);
    });
  });

  describe('Type Guards', () => {
    it('isValidComplejidadCriterio should work as type guard', () => {
      const value: any = 'BAJA';
      if (isValidComplejidadCriterio(value)) {
        // Should be typed as ComplejidadCriterioEnum
        const typed: ComplejidadCriterioEnum = value;
        expect(typed).toBe('BAJA');
      }
    });

    it('isValidEstadoCumplimiento should work as type guard', () => {
      const value: any = 'CUMPLE';
      if (isValidEstadoCumplimiento(value)) {
        // Should be typed as EstadoCumplimientoEnum
        const typed: EstadoCumplimientoEnum = value;
        expect(typed).toBe('CUMPLE');
      }
    });
  });
});
