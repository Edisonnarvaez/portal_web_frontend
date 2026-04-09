import React, { useEffect, useState } from 'react';
import type { CategoriaSoporte } from '../../domain/entities/SoporteDocumental';

interface SoporteCategoriesProps {
  prestadorId: number;
  selectedCategoryId?: number;
  onCategorySelect?: (categoryId: number) => void;
  showCreateForm?: boolean;
  onCreateCategory?: (category: Partial<CategoriaSoporte>) => void;
  isLoading?: boolean;
}

interface CategoryStats {
  categoryId: number;
  totalDocuments: number;
  activeDocuments: number;
  expiredDocuments: number;
  expiringDocuments: number;
}

/**
 * Component for managing and displaying document categories
 * Shows category list with document counts and allows category filtering
 */
const SoporteCategories: React.FC<SoporteCategoriesProps> = ({
  prestadorId,
  selectedCategoryId,
  onCategorySelect,
  showCreateForm = false,
  onCreateCategory,
  isLoading = false,
}) => {
  const [categories, setCategories] = useState<CategoriaSoporte[]>([]);
  const [categoryStats, setCategoryStats] = useState<Map<number, CategoryStats>>(new Map());
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [showForm, setShowForm] = useState(showCreateForm);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
  });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, [prestadorId]);

  const loadCategories = async () => {
    try {
      setIsLoadingData(true);

      // Mock categories (in real implementation, would fetch from API)
      const mockCategories: CategoriaSoporte[] = [
        {
          id: 1,
          nombre: 'Documentos Administrativos',
          descripcion: 'Certificados y permisos administrativos',
          activo: true,
          fecha_creacion: new Date().toISOString(),
        },
        {
          id: 2,
          nombre: 'Documentos Sanitarios',
          descripcion: 'Certificados de calidad y bioseguridad',
          activo: true,
          fecha_creacion: new Date().toISOString(),
        },
        {
          id: 3,
          nombre: 'Acreditación de Personal',
          descripcion: 'Títulos y licencias de profesionales',
          activo: true,
          fecha_creacion: new Date().toISOString(),
        },
        {
          id: 4,
          nombre: 'Documentos Técnicos',
          descripcion: 'Manuales, protocolos y procedimientos',
          activo: true,
          fecha_creacion: new Date().toISOString(),
        },
        {
          id: 5,
          nombre: 'Otros Documentos',
          descripcion: 'Documentación adicional o complementaria',
          activo: true,
          fecha_creacion: new Date().toISOString(),
        },
      ];

      setCategories(mockCategories);

      // Calculate mock stats
      const stats = new Map<number, CategoryStats>();
      mockCategories.forEach((cat) => {
        stats.set(cat.id, {
          categoryId: cat.id,
          totalDocuments: Math.floor(Math.random() * 20),
          activeDocuments: Math.floor(Math.random() * 15),
          expiredDocuments: Math.floor(Math.random() * 3),
          expiringDocuments: Math.floor(Math.random() * 5),
        });
      });

      setCategoryStats(stats);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre.trim()) {
      setFormError('Nombre es requerido');
      return;
    }

    try {
      const newCategory: Partial<CategoriaSoporte> = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        activo: true,
      };

      if (onCreateCategory) {
        await onCreateCategory(newCategory);
      }

      // Reset form
      setFormData({ nombre: '', descripcion: '' });
      setShowForm(false);
      setFormError(null);

      // Add new category to list
      const createdCategory: CategoriaSoporte = {
        ...newCategory,
        id: Math.max(...categories.map((c) => c.id), 0) + 1,
        fecha_creacion: new Date().toISOString(),
      } as CategoriaSoporte;

      setCategories([...categories, createdCategory]);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Error al crear categoría');
    }
  };

  const handleSelectCategory = (categoryId: number) => {
    if (onCategorySelect) {
      onCategorySelect(categoryId);
    }
  };

  const handleToggleCategory = (categoryId: number, currentActive: boolean) => {
    // Update active status
    setCategories(
      categories.map((cat) =>
        cat.id === categoryId ? { ...cat, activo: !currentActive } : cat
      )
    );
  };

  if (isLoading || isLoadingData) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-gray-200 rounded" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Categorías de Documentos</h2>
          <p className="text-sm text-gray-600 mt-1">
            {categories.length} categoría(s) disponible(s)
          </p>
        </div>
        {showCreateForm && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            {showForm ? '✕ Cancelar' : '+ Nueva Categoría'}
          </button>
        )}
      </div>

      {/* Create Form */}
      {showForm && showCreateForm && (
        <form onSubmit={handleCreateCategory} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nombre *
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej: Documentos Administrativos"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Describa el propósito de esta categoría..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
          </div>

          {formError && (
            <div className="bg-red-50 border border-red-200 rounded p-2 mb-4">
              <p className="text-sm text-red-700">❌ {formError}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              Crear Categoría
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.length === 0 ? (
          <div className="col-span-full text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No hay categorías disponibles</p>
          </div>
        ) : (
          categories.map((category) => {
            const stats = categoryStats.get(category.id);
            const isSelected = selectedCategoryId === category.id;

            return (
              <div
                key={category.id}
                onClick={() => handleSelectCategory(category.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-blue-300'
                } ${!category.activo ? 'opacity-60' : ''}`}
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-800">{category.nombre}</h3>
                    <p className="text-sm text-gray-600 mt-1">{category.descripcion}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleCategory(category.id, category.activo);
                    }}
                    className={`text-xs font-medium px-2 py-1 rounded ${
                      category.activo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {category.activo ? '✓ Activo' : '○ Inactivo'}
                  </button>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {category.descripcion}
                </p>

                {/* Stats */}
                {stats && (
                  <div className="grid grid-cols-4 gap-2">
                    <div className="bg-gray-50 rounded p-2 text-center">
                      <p className="text-xs text-gray-600">Total</p>
                      <p className="text-lg font-bold text-gray-800">{stats.totalDocuments}</p>
                    </div>
                    <div className="bg-green-50 rounded p-2 text-center">
                      <p className="text-xs text-green-600">Activos</p>
                      <p className="text-lg font-bold text-green-700">{stats.activeDocuments}</p>
                    </div>
                    <div className="bg-orange-50 rounded p-2 text-center">
                      <p className="text-xs text-orange-600">Próximos</p>
                      <p className="text-lg font-bold text-orange-700">{stats.expiringDocuments}</p>
                    </div>
                    <div className="bg-red-50 rounded p-2 text-center">
                      <p className="text-xs text-red-600">Vencidos</p>
                      <p className="text-lg font-bold text-red-700">{stats.expiredDocuments}</p>
                    </div>
                  </div>
                )}

                {/* Action */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="mt-3 w-full text-blue-600 hover:text-blue-800 text-sm font-medium py-2 rounded hover:bg-blue-50"
                >
                  Ver documentos →
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-600 uppercase tracking-wide">Total Documentos</p>
            <p className="text-2xl font-bold text-gray-800">
              {Array.from(categoryStats.values()).reduce((sum, stat) => sum + stat.totalDocuments, 0)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 uppercase tracking-wide">Vigentes</p>
            <p className="text-2xl font-bold text-green-600">
              {Array.from(categoryStats.values()).reduce((sum, stat) => sum + stat.activeDocuments, 0)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 uppercase tracking-wide">Por Vencer</p>
            <p className="text-2xl font-bold text-orange-600">
              {Array.from(categoryStats.values()).reduce((sum, stat) => sum + stat.expiringDocuments, 0)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 uppercase tracking-wide">Vencidos</p>
            <p className="text-2xl font-bold text-red-600">
              {Array.from(categoryStats.values()).reduce((sum, stat) => sum + stat.expiredDocuments, 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoporteCategories;
