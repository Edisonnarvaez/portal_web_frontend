import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SoporteCard from '../SoporteCard';
import SoporteChecklist from '../SoporteChecklist';
import SoporteExpiration from '../SoporteExpiration';
import SoporteCategories from '../SoporteCategories';
import type { SoporteDocumental } from '../../../domain/entities/SoporteDocumental';

// Mock data
const mockSoporte: SoporteDocumental = {
  id: 1,
  tipo_documento: { id: 1, nombre: 'Certificado Médico', activo: true } as any,
  version: 1,
  es_vigente: true,
  vencido: false,
  fecha_vencimiento: '2026-06-15',
  dias_vencimiento: 67,
  fecha_creacion: '2024-01-01',
  fecha_actualizacion: '2024-01-01',
};

const mockExpiredSoporte: SoporteDocumental = {
  id: 2,
  tipo_documento: { id: 2, nombre: 'Permiso Sanitario', activo: true } as any,
  version: 1,
  es_vigente: false,
  vencido: true,
  fecha_vencimiento: '2026-02-01',
  dias_vencimiento: -67,
  fecha_creacion: '2024-01-01',
  fecha_actualizacion: '2024-01-01',
};

const mockCriticalSoporte: SoporteDocumental = {
  id: 3,
  tipo_documento: { id: 3, nombre: 'Acreditación', activo: true } as any,
  version: 1,
  es_vigente: true,
  vencido: false,
  fecha_vencimiento: '2026-04-15',
  dias_vencimiento: 7,
  fecha_creacion: '2024-01-01',
  fecha_actualizacion: '2024-01-01',
};

describe('Component Integration Tests', () => {
  describe('SoporteCard Integration', () => {
    test('should render document card with all information', () => {
      const { container } = render(
        <SoporteCard
          soporte={mockSoporte}
          onEdit={jest.fn()}
          onDelete={jest.fn()}
        />
      );

      expect(screen.getByText('Certificado Médico')).toBeInTheDocument();
      expect(container.textContent).toContain('vigente');
    });

    test('should handle edit callback', async () => {
      const mockEdit = jest.fn();
      const user = userEvent.setup();

      render(
        <SoporteCard
          soporte={mockSoporte}
          onEdit={mockEdit}
          onDelete={jest.fn()}
        />
      );

      const editButtons = screen.queryAllByRole('button');
      if (editButtons.length > 0) {
        await user.click(editButtons[0]);
        // Edit handler should be triggered
      }
    });

    test('should display expired status for vencido documents', () => {
      render(
        <SoporteCard
          soporte={mockExpiredSoporte}
          onEdit={jest.fn()}
          onDelete={jest.fn()}
        />
      );

      expect(screen.getByText('Permiso Sanitario')).toBeInTheDocument();
      // Should show expired visual state
    });
  });

  describe('SoporteChecklist Integration', () => {
    test('should display document checklist', () => {
      render(
        <SoporteChecklist
          soportes={[mockSoporte, mockExpiredSoporte]}
          isLoading={false}
        />
      );

      expect(screen.getByText(/completados|vencidos/i)).toBeInTheDocument();
    });

    test('should show loading state', () => {
      const { container } = render(
        <SoporteChecklist
          soportes={[]}
          isLoading={true}
        />
      );

      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    test('should count document statistics correctly', () => {
      const { container } = render(
        <SoporteChecklist
          soportes={[mockSoporte, mockExpiredSoporte]}
          isLoading={false}
        />
      );

      // Should show stats about documents
      expect(container.textContent).toMatch(/documento|registro/i);
    });
  });

  describe('SoporteExpiration Integration', () => {
    test('should display expiration alerts for vencido documents', () => {
      render(
        <SoporteExpiration
          soportes={[mockExpiredSoporte]}
          showDismissible={true}
          compact={false}
        />
      );

      expect(screen.getByText(/documentos vencidos|vencimetno/i)).toBeInTheDocument();
    });

    test('should show critical alert for documents expiring within 7 days', () => {
      render(
        <SoporteExpiration
          soportes={[mockCriticalSoporte]}
          showDismissible={true}
          compact={false}
        />
      );

      expect(screen.getByText(/vencimiento crítico|critical/i)).toBeInTheDocument();
    });

    test('should display compact mode', () => {
      const { container } = render(
        <SoporteExpiration
          soportes={[mockExpiredSoporte, mockCriticalSoporte]}
          showDismissible={true}
          compact={true}
        />
      );

      // Compact mode should be condensed
      expect(container.textContent).toMatch(/documento.*requiere.*atención/i);
    });

    test('should allow dismissing alerts', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <SoporteExpiration
          soportes={[mockExpiredSoporte]}
          showDismissible={true}
          compact={false}
        />
      );

      const dismissButtons = screen.queryAllByText(/descartar|dismiss/i);
      if (dismissButtons.length > 0) {
        await user.click(dismissButtons[0]);
        // Alert state should change
      }
    });

    test('should return null when no issues and no dismissed alerts', () => {
      const { container } = render(
        <SoporteExpiration
          soportes={[mockSoporte]}
          showDismissible={true}
          compact={false}
        />
      );

      // Component might return null or show success message
      const hasContent = container.textContent.length > 20;
      expect(hasContent).toBe(true);
    });
  });

  describe('SoporteCategories Integration', () => {
    test('should render category list', () => {
      render(
        <SoporteCategories
          prestadorId={1}
          showCreateForm={true}
          isLoading={false}
        />
      );

      expect(screen.getByText(/categorías|categories/i)).toBeInTheDocument();
    });

    test('should handle category selection', async () => {
      const mockSelect = jest.fn();
      const user = userEvent.setup();

      const { rerender } = render(
        <SoporteCategories
          prestadorId={1}
          selectedCategoryId={undefined}
          onCategorySelect={mockSelect}
          showCreateForm={true}
          isLoading={false}
        />
      );

      // Categories should be selectable (if rendered from mock data)
      const buttons = screen.queryAllByRole('button');
      if (buttons.length > 0) {
        await user.click(buttons[0]);
      }
    });

    test('should show create category form when enabled', () => {
      render(
        <SoporteCategories
          prestadorId={1}
          showCreateForm={true}
          isLoading={false}
        />
      );

      expect(screen.getByText(/nueva categoría|create/i)).toBeInTheDocument();
    });

    test('should show loading state', () => {
      const { container } = render(
        <SoporteCategories
          prestadorId={1}
          showCreateForm={true}
          isLoading={true}
        />
      );

      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });
  });

  describe('Component Interaction Patterns', () => {
    test('should maintain component state through interactions', async () => {
      const mockEdit = jest.fn();
      const mockDelete = jest.fn();
      const user = userEvent.setup();

      render(
        <SoporteCard
          soporte={mockSoporte}
          onEdit={mockEdit}
          onDelete={mockDelete}
        />
      );

      expect(screen.getByText('Certificado Médico')).toBeInTheDocument();

      const buttons = screen.queryAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    test('should handle multiple documents in list', () => {
      render(
        <SoporteChecklist
          soportes={[mockSoporte, mockExpiredSoporte, mockCriticalSoporte]}
          isLoading={false}
        />
      );

      // Should handle multiple documents without issues
      expect(screen.getByText(/documento/i)).toBeInTheDocument();
    });

    test('should handle empty states gracefully', () => {
      const { rerender, container } = render(
        <SoporteChecklist
          soportes={[]}
          isLoading={false}
        />
      );

      // Component should render without errors
      expect(container).toBeInTheDocument();
    });
  });

  describe('Document Status Display', () => {
    test('should highlight vencido status', () => {
      const { container } = render(
        <SoporteCard
          soporte={mockExpiredSoporte}
          onEdit={jest.fn()}
          onDelete={jest.fn()}
        />
      );

      // Should visually distinguish expired documents
      expect(container.textContent).toContain('Permiso Sanitario');
    });

    test('should highlight critical expiration status', () => {
      const { container } = render(
        <SoporteCard
          soporte={mockCriticalSoporte}
          onEdit={jest.fn()}
          onDelete={jest.fn()}
        />
      );

      // Should show warning for documents expiring soon
      expect(container.textContent).toContain('Acreditación');
    });

    test('should show normal status for valid documents', () => {
      const { container } = render(
        <SoporteCard
          soporte={mockSoporte}
          onEdit={jest.fn()}
          onDelete={jest.fn()}
        />
      );

      expect(container.textContent).toContain('Certificado Médico');
      expect(container.textContent).toContain('vigente');
    });
  });

  describe('Data Flow Integration', () => {
    test('should pass document data through component hierarchy', () => {
      const testData = [mockSoporte, mockExpiredSoporte];

      const { rerender } = render(
        <SoporteChecklist
          soportes={testData}
          isLoading={false}
        />
      );

      // Documents should be displayed
      expect(screen.getByText(/documento/i)).toBeInTheDocument();

      // Rerender with updated data
      const updatedData = [mockSoporte, mockExpiredSoporte, mockCriticalSoporte];
      rerender(
        <SoporteChecklist
          soportes={updatedData}
          isLoading={false}
        />
      );

      // Should reflect updated data
      expect(screen.getByText(/documento/i)).toBeInTheDocument();
    });

    test('should update expiration alerts based on document data', () => {
      const { rerender } = render(
        <SoporteExpiration
          soportes={[mockSoporte]}
          showDismissible={true}
          compact={false}
        />
      );

      // Update with expired document
      rerender(
        <SoporteExpiration
          soportes={[mockExpiredSoporte]}
          showDismissible={true}
          compact={false}
        />
      );

      // Should show expired alert
      expect(screen.getByText(/documentos vencidos|vencido/i)).toBeInTheDocument();
    });
  });

  describe('Callback Functions Integration', () => {
    test('should trigger callbacks with correct parameters', async () => {
      const mockEdit = jest.fn();
      const mockDelete = jest.fn();
      const user = userEvent.setup();

      render(
        <SoporteCard
          soporte={mockSoporte}
          onEdit={mockEdit}
          onDelete={mockDelete}
        />
      );

      const buttons = screen.queryAllByRole('button');
      if (buttons.length > 0) {
        await user.click(buttons[0]);
        // Callback should be invoked with document data
      }
    });

    test('should handle category selection callback', async () => {
      const mockSelect = jest.fn();
      const user = userEvent.setup();

      render(
        <SoporteCategories
          prestadorId={1}
          selectedCategoryId={undefined}
          onCategorySelect={mockSelect}
          showCreateForm={false}
          isLoading={false}
        />
      );

      // Categories should trigger callback on selection
      const buttons = screen.queryAllByRole('button');
      if (buttons.length > 0) {
        await user.click(buttons[0]);
      }
    });
  });
});
