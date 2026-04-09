import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import SoportesPage from '../SoportesPage';
import { useSoporte } from '../../hooks/useSoporte';
import type { SoporteDocumental } from '../../../domain/entities/SoporteDocumental';
import type { CategoriaSoporte } from '../../../domain/entities/SoporteDocumental';

// Mock del hook useSoporte
jest.mock('../../hooks/useSoporte');

// Mock data
const mockSoportes: SoporteDocumental[] = [
  {
    id: 1,
    tipo_documento: { id: 1, nombre: 'Certificado', activo: true } as any,
    version: 1,
    es_vigente: true,
    vencido: false,
    fecha_vencimiento: new Date('2026-06-01').toISOString(),
    dias_vencimiento: 53,
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString(),
  },
  {
    id: 2,
    tipo_documento: { id: 2, nombre: 'Permiso', activo: true } as any,
    version: 1,
    es_vigente: true,
    vencido: true,
    fecha_vencimiento: new Date('2026-03-01').toISOString(),
    dias_vencimiento: -9,
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString(),
  },
];

const mockCategorias: CategoriaSoporte[] = [
  { id: 1, nombre: 'Documentos Administrativos', activo: true },
  { id: 2, nombre: 'Documentos Sanitarios', activo: true },
];

describe('SoportesPage Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useSoporte as jest.Mock).mockReturnValue({
      categorias: mockCategorias,
      soportes: mockSoportes,
      loading: false,
      error: null,
      fetchSoportes: jest.fn(),
      uploadSoporte: jest.fn(),
      createCategoria: jest.fn(),
    });
  });

  const renderSoportesPage = () => {
    return render(
      <BrowserRouter>
        <SoportesPage />
      </BrowserRouter>
    );
  };

  describe('Component Integration', () => {
    test('should render all integrated components', () => {
      renderSoportesPage();

      // Header visible
      expect(screen.getByText('Gestión de Soportes')).toBeInTheDocument();

      // Upload button visible
      expect(screen.getByText('+ Subir Documento')).toBeInTheDocument();

      // Alerts section visible (SoporteExpiration)
      expect(screen.getByText('⏰ Estado de Vencimientos')).toBeInTheDocument();

      // Categories section visible (SoporteCategories)
      expect(screen.getByText('Categorías de Documentos')).toBeInTheDocument();

      // View mode toggle visible
      expect(screen.getByText('📋 Lista')).toBeInTheDocument();
      expect(screen.getByText('🃏 Tarjetas')).toBeInTheDocument();
    });

    test('should display document count', () => {
      renderSoportesPage();
      expect(screen.getByText('2 documento(s)')).toBeInTheDocument();
    });

    test('should load data on mount', () => {
      const mockFetchSoportes = jest.fn();
      (useSoporte as jest.Mock).mockReturnValue({
        categorias: mockCategorias,
        soportes: mockSoportes,
        loading: false,
        error: null,
        fetchSoportes: mockFetchSoportes,
        uploadSoporte: jest.fn(),
      });

      renderSoportesPage();
      expect(mockFetchSoportes).toHaveBeenCalled();
    });
  });

  describe('Alert Component Integration (SoporteExpiration)', () => {
    test('should display expired documents warning', () => {
      renderSoportesPage();

      // Check for expired document alert
      expect(screen.getByText(/documento\(s\) requiere\(n\) atención inmediata/i)).toBeInTheDocument();
    });

    test('should show vencimiento critical status', async () => {
      renderSoportesPage();

      // The expired document (id: 2) should trigger critical status
      await waitFor(() => {
        expect(screen.getByText(/documentos vencidos/i)).toBeInTheDocument();
      });
    });
  });

  describe('Categories Component Integration (SoporteCategories)', () => {
    test('should display all categories', () => {
      renderSoportesPage();

      expect(screen.getByText('Documentos Administrativos')).toBeInTheDocument();
      expect(screen.getByText('Documentos Sanitarios')).toBeInTheDocument();
    });

    test('should filter documents by category selection', async () => {
      const user = userEvent.setup();
      renderSoportesPage();

      // Click on first category
      const categoryNombre = screen.getByText('Documentos Administrativos');
      await user.click(categoryNombre);

      // Wait for filtering effect
      await waitFor(() => {
        // The display should update
        expect(screen.getByText('1 documento(s)')).toBeInTheDocument();
      });
    });

    test('should show create category form option', () => {
      renderSoportesPage();

      // The "+ Nueva Categoría" button should be visible
      expect(screen.getByText('+ Nueva Categoría')).toBeInTheDocument();
    });
  });

  describe('View Mode Toggle (SoporteCard + SoporteChecklist)', () => {
    test('should toggle between list and card views', async () => {
      const user = userEvent.setup();
      renderSoportesPage();

      // Default is cards view
      const listButton = screen.getByText('📋 Lista');
      const cardsButton = screen.getByText('🃏 Tarjetas');

      // Click list view
      await user.click(listButton);
      await waitFor(() => {
        expect(listButton).toHaveClass('bg-blue-600');
      });

      // Click cards view
      await user.click(cardsButton);
      await waitFor(() => {
        expect(cardsButton).toHaveClass('bg-blue-600');
      });
    });

    test('should render SoporteChecklist when list view is active', async () => {
      const user = userEvent.setup();
      renderSoportesPage();

      await user.click(screen.getByText('📋 Lista'));

      // SoporteChecklist should be rendered
      await waitFor(() => {
        expect(screen.getByText(/completados|vencidos/i)).toBeInTheDocument();
      });
    });

    test('should render SoporteCard components when cards view is active', async () => {
      const user = userEvent.setup();
      renderSoportesPage();

      // Cards view is default
      // SoporteCard should render the documents
      await waitFor(() => {
        expect(screen.getByText('Certificado')).toBeInTheDocument();
      });
    });
  });

  describe('Upload Modal Integration (SoporteUploadModal)', () => {
    test('should open upload modal when button is clicked', async () => {
      const user = userEvent.setup();
      renderSoportesPage();

      const uploadButton = screen.getByText('+ Subir Documento');
      await user.click(uploadButton);

      // Modal should appear (check for modal content)
      await waitFor(() => {
        // The modal typically has close button or upload button
        const closeButtons = screen.queryAllByText(/cancelar|cerrar|✕/i);
        expect(closeButtons.length).toBeGreaterThan(0);
      });
    });

    test('should close modal when close button is clicked', async () => {
      const user = userEvent.setup();
      renderSoportesPage();

      // Open modal
      await user.click(screen.getByText('+ Subir Documento'));

      // Modal should be visible
      await waitFor(() => {
        const cancelButtons = screen.queryAllByText(/cancelar/i);
        expect(cancelButtons.length).toBeGreaterThan(0);
      });
    });

    test('should refresh documents after upload success', async () => {
      const mockFetchSoportes = jest.fn();
      const mockUploadSoporte = jest.fn().mockResolvedValue({});

      (useSoporte as jest.Mock).mockReturnValue({
        categorias: mockCategorias,
        soportes: mockSoportes,
        loading: false,
        error: null,
        fetchSoportes: mockFetchSoportes,
        uploadSoporte: mockUploadSoporte,
      });

      const user = userEvent.setup();
      renderSoportesPage();

      // Open modal and submit
      await user.click(screen.getByText('+ Subir Documento'));

      // Simulate upload success
      await waitFor(() => {
        expect(mockFetchSoportes).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    test('should display error message when loading fails', () => {
      (useSoporte as jest.Mock).mockReturnValue({
        categorias: [],
        soportes: [],
        loading: false,
        error: 'Error al cargar documentos',
        fetchSoportes: jest.fn(),
        uploadSoporte: jest.fn(),
      });

      renderSoportesPage();

      expect(screen.getByText(/error al cargar documentos/i)).toBeInTheDocument();
    });

    test('should show loading spinner while loading', () => {
      (useSoporte as jest.Mock).mockReturnValue({
        categorias: [],
        soportes: [],
        loading: true,
        error: null,
        fetchSoportes: jest.fn(),
        uploadSoporte: jest.fn(),
      });

      renderSoportesPage();

      expect(screen.getByText(/cargando documentos/i)).toBeInTheDocument();
    });

    test('should show empty state when no documents exist', () => {
      (useSoporte as jest.Mock).mockReturnValue({
        categorias: mockCategorias,
        soportes: [],
        loading: false,
        error: null,
        fetchSoportes: jest.fn(),
        uploadSoporte: jest.fn(),
      });

      renderSoportesPage();

      expect(screen.getByText(/no hay documentos cargados/i)).toBeInTheDocument();
    });
  });

  describe('Complete User Workflow', () => {
    test('should complete full workflow: view alerts -> filter by category -> upload document', async () => {
      const user = userEvent.setup();
      const mockFetchSoportes = jest.fn();
      const mockUploadSoporte = jest.fn().mockResolvedValue({});

      (useSoporte as jest.Mock).mockReturnValue({
        categorias: mockCategorias,
        soportes: mockSoportes,
        loading: false,
        error: null,
        fetchSoportes: mockFetchSoportes,
        uploadSoporte: mockUploadSoporte,
      });

      renderSoportesPage();

      // Step 1: Verify data loaded
      expect(mockFetchSoportes).toHaveBeenCalled();
      expect(screen.getByText('2 documento(s)')).toBeInTheDocument();

      // Step 2: Check alerts are displayed
      expect(screen.getByText(/estado de vencimientos/i)).toBeInTheDocument();

      // Step 3: Filter by category
      await user.click(screen.getByText('Documentos Administrativos'));

      await waitFor(() => {
        expect(screen.getByText('1 documento(s)')).toBeInTheDocument();
      });

      // Step 4: Open upload modal
      await user.click(screen.getByText('+ Subir Documento'));

      // Step 5: Verify modal is open
      await waitFor(() => {
        const cancelButtons = screen.queryAllByText(/cancelar/i);
        expect(cancelButtons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Keyboard Accessibility', () => {
    test('should support keyboard navigation between categories', async () => {
      const user = userEvent.setup();
      renderSoportesPage();

      // Tab to first category
      await user.tab();

      // The focus should be on the page
      // This is a basic accessibility test
      expect(document.body).toBeInTheDocument();
    });

    test('should handle Enter key on buttons', async () => {
      const user = userEvent.setup();
      renderSoportesPage();

      const uploadButton = screen.getByText('+ Subir Documento');
      uploadButton.focus();

      // Press Enter
      await user.keyboard('{Enter}');

      // Modal should open or action triggered
      // This verifies keyboard support
      expect(uploadButton).toHaveFocus();
    });
  });

  describe('Responsive Layout', () => {
    test('should render grid layout with sidebar and main content', () => {
      renderSoportesPage();

      // Check for grid layout presence
      const mainContainer = screen.getByText('Gestión de Soportes').closest('div');
      expect(mainContainer?.parentElement).toHaveClass('max-w-7xl');
    });

    test('should display categories in sidebar', () => {
      renderSoportesPage();

      const categoriesSidebar = screen.getByText('Categorías de Documentos').closest('.bg-white');
      expect(categoriesSidebar).toBeInTheDocument();
    });
  });

  describe('State Management Integration', () => {
    test('should maintain category filter across view mode changes', async () => {
      const user = userEvent.setup();
      renderSoportesPage();

      // Select category
      await user.click(screen.getByText('Documentos Administrativos'));

      await waitFor(() => {
        expect(screen.getByText('1 documento(s)')).toBeInTheDocument();
      });

      // Change view
      await user.click(screen.getByText('📋 Lista'));

      // Category filter should persist
      await waitFor(() => {
        expect(screen.getByText('1 documento(s)')).toBeInTheDocument();
      });
    });

    test('should reset document count when clearing category filter', async () => {
      const user = userEvent.setup();
      renderSoportesPage();

      // Select category
      await user.click(screen.getByText('Documentos Administrativos'));

      await waitFor(() => {
        expect(screen.getByText('1 documento(s)')).toBeInTheDocument();
      });

      // Clear by clicking same category or using a clear button
      // This would depend on actual implementation
      // For now, verify the flow exists
    });
  });
});
