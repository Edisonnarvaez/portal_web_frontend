/**
 * formConstants.test.ts
 * Tests for form validation constants and configurations
 */

import { describe, it, expect } from 'vitest';
import {
  CRITERIO_VALIDATION,
  CUMPLIMIENTO_VALIDATION,
  FORM_DEFAULTS,
  VALIDATION_MESSAGES,
  FORM_HINTS,
  LIMITS,
} from '../formConstants';

describe('Form Constants', () => {
  describe('CRITERIO_VALIDATION', () => {
    it('should have validation rules for codigo', () => {
      expect(CRITERIO_VALIDATION.codigo).toHaveProperty('minLength');
      expect(CRITERIO_VALIDATION.codigo).toHaveProperty('maxLength');
      expect(CRITERIO_VALIDATION.codigo).toHaveProperty('pattern');
      expect(CRITERIO_VALIDATION.codigo.minLength).toBe(3);
      expect(CRITERIO_VALIDATION.codigo.maxLength).toBe(20);
    });

    it('should validate codigo pattern correctly', () => {
      const pattern = CRITERIO_VALIDATION.codigo.pattern;
      expect(pattern.test('INF-001')).toBe(true);
      expect(pattern.test('TH-005')).toBe(true);
      expect(pattern.test('invalid-code')).toBe(false);
      expect(pattern.test('123!@#')).toBe(false);
    });

    it('should have validation rules for all required fields', () => {
      expect(CRITERIO_VALIDATION.codigo).toBeDefined();
      expect(CRITERIO_VALIDATION.nombre).toBeDefined();
      expect(CRITERIO_VALIDATION.descripcion).toBeDefined();
    });

    it('should have helpful placeholders', () => {
      expect(CRITERIO_VALIDATION.codigo.placeholder).toBeDefined();
      expect(CRITERIO_VALIDATION.nombre.placeholder).toBeDefined();
      expect(typeof CRITERIO_VALIDATION.codigo.placeholder).toBe('string');
    });
  });

  describe('CUMPLIMIENTO_VALIDATION', () => {
    it('should have validation rules for hallazgo', () => {
      expect(CUMPLIMIENTO_VALIDATION.hallazgo).toHaveProperty('minLength');
      expect(CUMPLIMIENTO_VALIDATION.hallazgo).toHaveProperty('maxLength');
      expect(CUMPLIMIENTO_VALIDATION.hallazgo.minLength).toBe(10);
    });

    it('should have validation rules for fecha_compromiso', () => {
      expect(CUMPLIMIENTO_VALIDATION.fecha_compromiso).toHaveProperty('format');
      expect(CUMPLIMIENTO_VALIDATION.fecha_compromiso.format).toBe('YYYY-MM-DD');
    });
  });

  describe('FORM_DEFAULTS', () => {
    it('should provide sensible defaults for criterio', () => {
      expect(FORM_DEFAULTS.criterio.complejidad).toBe('MEDIA');
      expect(FORM_DEFAULTS.criterio.es_mandatorio).toBe(false);
      expect(FORM_DEFAULTS.criterio.requiere_evidencia_documental).toBe(false);
    });

    it('should provide sensible defaults for cumplimiento', () => {
      expect(FORM_DEFAULTS.cumplimiento.cumple).toBe('CUMPLE');
    });

    it('should provide sensible defaults for servicio', () => {
      expect(FORM_DEFAULTS.servicio.modalidad).toBe('INTRAMURAL');
      expect(FORM_DEFAULTS.servicio.complejidad).toBe('MEDIA');
    });
  });

  describe('VALIDATION_MESSAGES', () => {
    it('should provide proper validation message functions', () => {
      const requiredMsg = VALIDATION_MESSAGES.required('Código');
      expect(requiredMsg).toContain('Código');
      expect(requiredMsg).toContain('requerido');

      const minLengthMsg = VALIDATION_MESSAGES.minLength('Nombre', 5);
      expect(minLengthMsg).toContain('5');
      expect(minLengthMsg).toContain('caracteres');
    });

    it('should handle various message types', () => {
      expect(VALIDATION_MESSAGES.required('Test')).toBeDefined();
      expect(VALIDATION_MESSAGES.minLength('Test', 3)).toBeDefined();
      expect(VALIDATION_MESSAGES.maxLength('Test', 100)).toBeDefined();
      expect(VALIDATION_MESSAGES.invalidEmail).toBeDefined();
      expect(VALIDATION_MESSAGES.invalidDate).toBeDefined();
    });
  });

  describe('FORM_HINTS', () => {
    it('should provide helpful hints for criterio fields', () => {
      expect(FORM_HINTS.criterio.codigo).toBeDefined();
      expect(FORM_HINTS.criterio.nombre).toBeDefined();
      expect(FORM_HINTS.criterio.es_mandatorio).toBeDefined();

      // Hints should be user-friendly strings
      expect(typeof FORM_HINTS.criterio.codigo).toBe('string');
      expect(FORM_HINTS.criterio.codigo.length).toBeGreaterThan(0);
    });

    it('should provide helpful hints for cumplimiento fields', () => {
      expect(FORM_HINTS.cumplimiento.cumple).toBeDefined();
      expect(FORM_HINTS.cumplimiento.hallazgo).toBeDefined();
      expect(FORM_HINTS.cumplimiento.fecha_compromiso).toBeDefined();
    });
  });

  describe('LIMITS', () => {
    it('should define reasonable limits', () => {
      expect(LIMITS.criterios_por_estandar).toBeGreaterThan(0);
      expect(LIMITS.cumplimientos_por_autoevaluacion).toBeGreaterThan(0);
      expect(LIMITS.archivos_adjuntos_max_size_mb).toBeGreaterThan(0);
      expect(LIMITS.archivos_adjuntos_max_count).toBeGreaterThan(0);
    });

    it('should have expected values for limits', () => {
      expect(LIMITS.criterios_por_estandar).toBe(50);
      expect(LIMITS.caracteres_hallazgo_preview).toBe(100);
      expect(LIMITS.archivos_adjuntos_max_size_mb).toBe(10);
    });
  });

  describe('Constants are immutable', () => {
    it('should use as const for type safety', () => {
      // These should pass TypeScript checks
      const codigo: 'MEDIA' = FORM_DEFAULTS.criterio.complejidad;
      expect(codigo).toBe('MEDIA');

      const cumple: 'CUMPLE' = FORM_DEFAULTS.cumplimiento.cumple;
      expect(cumple).toBe('CUMPLE');
    });
  });
});
