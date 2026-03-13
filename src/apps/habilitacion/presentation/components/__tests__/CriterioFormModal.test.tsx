/**
 * CriterioFormModal.test.tsx
 * Tests for the Criterio form modal component
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CriterioFormModal from '../CriterioFormModal';
import type { Criterio } from '../../domain/entities/Criterio';
import { ComplejidadCriterioEnum } from '../../domain/enums';

// Mock the useCriterio hook
vi.mock('../../hooks/useCriterio', () => ({
  useCriterio: () => ({
    createCriterio: vi.fn().mockResolvedValue({ id: 1 }),
    updateCriterio: vi.fn().mockResolvedValue({ id: 1 }),
  }),
}));

describe('CriterioFormModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSuccess: mockOnSuccess,
  };

  const mockCriterio: Criterio = {
    id: 1,
    codigo: 'INF-001',
    nombre: 'Infraestructura Física',
    descripcion: 'Evaluación de la infraestructura física de la institución',
    complejidad: 'MEDIA' as const,
    es_mandatorio: true,
    requiere_evidencia_documental: true,
    fecha_actualizacion: '2025-03-13',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Creation Mode', () => {
    it('should render form in creation mode when criterio is not provided', () => {
      render(<CriterioFormModal {...defaultProps} />);
      expect(screen.getByText('Nuevo Criterio')).toBeInTheDocument();
    });

    it('should initialize empty fields in creation mode', () => {
      render(<CriterioFormModal {...defaultProps} />);
      
      const codigoInput = screen.getByPlaceholderText('Ej: INF-001') as HTMLInputElement;
      const nombreInput = screen.getByPlaceholderText('Ej: Infraestructura Física') as HTMLInputElement;
      
      expect(codigoInput.value).toBe('');
      expect(nombreInput.value).toBe('');
    });

    it('should enable codigo field in creation mode', () => {
      render(<CriterioFormModal {...defaultProps} />);
      const codigoInput = screen.getByPlaceholderText('Ej: INF-001') as HTMLInputElement;
      expect(codigoInput.disabled).toBe(false);
    });
  });

  describe('Edit Mode', () => {
    it('should render form in edit mode when criterio is provided', () => {
      render(<CriterioFormModal {...defaultProps} criterio={mockCriterio} />);
      expect(screen.getByText('Editar Criterio')).toBeInTheDocument();
    });

    it('should populate fields with existing criterio data', async () => {
      render(<CriterioFormModal {...defaultProps} criterio={mockCriterio} />);
      
      await waitFor(() => {
        const codigoInput = screen.getByDisplayValue('INF-001') as HTMLInputElement;
        const nombreInput = screen.getByDisplayValue('Infraestructura Física') as HTMLInputElement;
        
        expect(codigoInput).toBeInTheDocument();
        expect(nombreInput).toBeInTheDocument();
      });
    });

    it('should disable codigo field in edit mode', async () => {
      render(<CriterioFormModal {...defaultProps} criterio={mockCriterio} />);
      
      await waitFor(() => {
        const codigoInput = screen.getByDisplayValue('INF-001') as HTMLInputElement;
        expect(codigoInput.disabled).toBe(true);
      });
    });

    it('should show codigo info message in edit mode', async () => {
      render(<CriterioFormModal {...defaultProps} criterio={mockCriterio} />);
      
      await waitFor(() => {
        expect(screen.getByText('No se puede cambiar')).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('should require codigo field', async () => {
      render(<CriterioFormModal {...defaultProps} />);
      const submitButton = screen.getByRole('button', { name: 'Crear Criterio' });
      
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Código y nombre del criterio son obligatorios/)).toBeInTheDocument();
      });
    });

    it('should require nombre field', async () => {
      render(<CriterioFormModal {...defaultProps} />);
      
      const codigoInput = screen.getByPlaceholderText('Ej: INF-001');
      fireEvent.change(codigoInput, { target: { value: 'TEST-001' } });
      
      const submitButton = screen.getByRole('button', { name: 'Crear Criterio' });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Código y nombre del criterio son obligatorios/)).toBeInTheDocument();
      });
    });

    it('should require descripcion for mandatory criterios', async () => {
      render(<CriterioFormModal {...defaultProps} />);
      
      const codigoInput = screen.getByPlaceholderText('Ej: INF-001');
      const nombreInput = screen.getByPlaceholderText('Ej: Infraestructura Física');
      const mandatorioCheckbox = screen.getByRole('checkbox', { name: /Criterio Mandatorio/ });
      
      fireEvent.change(codigoInput, { target: { value: 'TEST-001' } });
      fireEvent.change(nombreInput, { target: { value: 'Test Criterio' } });
      fireEvent.click(mandatorioCheckbox);
      
      const submitButton = screen.getByRole('button', { name: 'Crear Criterio' });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Los criterios mandatorios requieren una descripción/)).toBeInTheDocument();
      });
    });
  });

  describe('Form Fields', () => {
    it('should have complejidad dropdown with correct options', async () => {
      render(<CriterioFormModal {...defaultProps} />);
      
      const complejidadSelect = screen.getByDisplayValue('Media');
      expect(complejidadSelect).toBeInTheDocument();
      
      // Check for options
      fireEvent.click(complejidadSelect);
      expect(screen.getByRole('option', { name: 'Baja' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Media' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Alta' })).toBeInTheDocument();
    });

    it('should have checkboxes for es_mandatorio and requiere_evidencia_documental', () => {
      render(<CriterioFormModal {...defaultProps} />);
      
      const mandatorioCheckbox = screen.getByRole('checkbox', { name: /Criterio Mandatorio/ });
      const evidenciaCheckbox = screen.getByRole('checkbox', { name: /Requiere Evidencia Documental/ });
      
      expect(mandatorioCheckbox).toBeInTheDocument();
      expect(evidenciaCheckbox).toBeInTheDocument();
    });

    it('should toggle es_mandatorio checkbox', async () => {
      render(<CriterioFormModal {...defaultProps} />);
      
      const mandatorioCheckbox = screen.getByRole('checkbox', { name: /Criterio Mandatorio/ }) as HTMLInputElement;
      
      expect(mandatorioCheckbox.checked).toBe(false);
      
      fireEvent.click(mandatorioCheckbox);
      
      expect(mandatorioCheckbox.checked).toBe(true);
    });
  });

  describe('Modal Actions', () => {
    it('should close modal when Cancel button is clicked', () => {
      render(<CriterioFormModal {...defaultProps} />);
      
      const cancelButton = screen.getByRole('button', { name: 'Cancelar' });
      fireEvent.click(cancelButton);
      
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should not render when isOpen is false', () => {
      const { container } = render(<CriterioFormModal {...defaultProps} isOpen={false} />);
      expect(container.firstChild).toBeNull();
    });

    it('should close modal on X button click', () => {
      render(<CriterioFormModal {...defaultProps} />);
      
      const closeButton = screen.getByRole('button', { title: 'Cerrar' });
      fireEvent.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for all form fields', () => {
      render(<CriterioFormModal {...defaultProps} />);
      
      expect(screen.getByText('Código')).toBeInTheDocument();
      expect(screen.getByText('Nombre/Título')).toBeInTheDocument();
      expect(screen.getByText('Descripción Detallada')).toBeInTheDocument();
      expect(screen.getByText('Complejidad')).toBeInTheDocument();
    });

    it('should show required indicators (*) for mandatory fields', () => {
      render(<CriterioFormModal {...defaultProps} />);
      
      const requiredIndicators = screen.getAllByText('*');
      expect(requiredIndicators.length).toBeGreaterThan(0);
    });
  });
});
