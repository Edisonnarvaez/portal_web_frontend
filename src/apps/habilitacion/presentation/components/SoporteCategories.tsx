import React, { useEffect, useState } from 'react';
import type { CategoriaSoporte } from '../../domain/entities/SoporteDocumental';
import { useSoporte } from '../hooks/useSoporte'; // ✅ NUEVO: Importar hook

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
  const { categorias, fetchCategorias, loading: hookLoading } = useSoporte(); // ✅ NUEVO
  const [categoryStats, setCategoryStats] = useState<Map<number, CategoryStats>>(new Map());
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [showForm, setShowForm] = useState(showCreateForm);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
  });
  const [formError, setFormError] = useState<string | null>(null);

  // ✅ NUEVO: Cargar categorías del API
  useEffect(() => {
    loadCategories();
  }, [prestadorId]);

  const loadCategories = async () => {
    try {
      setIsLoadingData(true);
      await fetchCategorias(); // ✅ Usar fetchCategorias del hook

      // Calculate stats (mock para ahora)
      const stats = new Map<number, CategoryStats>();
      categorias.forEach((cat) => {
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

      // Reload categories
      await fetchCategorias(); // ✅ Recargar categorías del API
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
    // This would require updating via API in real implementation
    console.log(`Toggle category ${categoryId} from ${currentActive} to ${!currentActive}`);
  };

  if (isLoading || isLoadingData || hookLoading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Header - Responsive */}
      <div className="flex flex-col gap-0.5">
        <div className="min-w-0 flex-1">
          <h2 className="text-xs font-bold text-gray-800 dark:text-gray-100">
            Cats
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {categorias.length} cat(s)
          </p>
        </div>
        {showCreateForm && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full sm:w-auto px-1.5 py-0.5 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium text-xs transition-colors flex-shrink-0"
          >
            {showForm ? '✕' : '↳ Nuevo'}
          </button>
        )}
      </div>

      {/* Create Form - Responsive */}
      {showForm && showCreateForm && (
        <form onSubmit={handleCreateCategory} className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-1">
          <div className="mb-2">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej: Admin"
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div className="mb-2">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Descripción
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Propósito..."
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white resize-none"
              rows={2}
            />
          </div>

          {formError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-1.5 mb-2">
              <p className="text-xs text-red-700 dark:text-red-300">❌ {formError}</p>
            </div>
          )}

          <div className="flex gap-1.5">
            <button
              type="submit"
              className="flex-1 px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 font-medium text-xs transition-colors"
            >
              Crear
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-xs transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Categories Grid - Fully Responsive */}
      <div className="grid grid-cols-1 gap-1.5">
        {/* "Show All" Button - ✅ NUEVO */}
        {selectedCategoryId && (
          <button
            onClick={() => handleSelectCategory(0)}
            className="w-full px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium text-xs transition-colors"
          >
            📍 Mostrar todos
          </button>
        )}

        {categorias.length === 0 ? (
          <div className="col-span-full text-center py-4 bg-gray-50 dark:bg-gray-800 rounded">
            <p className="text-gray-500 dark:text-gray-400 text-xs">
              Sin categorías
            </p>
          </div>
        ) : (
          categorias.map((category) => {
            const stats = categoryStats.get(category.id);
            const isSelected = selectedCategoryId === category.id;

            return (
              <div
                key={category.id}
                onClick={() => handleSelectCategory(category.id)}
                className={`p-2 rounded-lg border-2 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-700'
                } ${!category.activo ? 'opacity-60' : ''}`}
              >
                {/* Header */}
                <div className="flex justify-between items-start gap-1 mb-1.5">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white text-xs line-clamp-1">
                      {category.nombre}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-1">
                      {category.descripcion}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleCategory(category.id, category.activo);
                    }}
                    className={`text-xs px-1 py-0.5 rounded flex-shrink-0 ${
                      category.activo
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {category.activo ? '✓' : '○'}
                  </button>
                </div>

                {/* Stats Grid - Responsive (always 4 columns) */}
                {stats && (
                  <div className="grid grid-cols-4 gap-1 mt-1.5 pt-1.5 border-t border-gray-200 dark:border-gray-700">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded p-1 text-center">
                      <p className="text-xs text-gray-600 dark:text-gray-400">📊</p>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">
                        {stats.totalDocuments}
                      </p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded p-1 text-center">
                      <p className="text-xs text-green-700 dark:text-green-300">✓</p>
                      <p className="text-xs font-bold text-green-800 dark:text-green-200">
                        {stats.activeDocuments}
                      </p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 rounded p-1 text-center">
                      <p className="text-xs text-red-700 dark:text-red-300">✗</p>
                      <p className="text-xs font-bold text-red-800 dark:text-red-200">
                        {stats.expiredDocuments}
                      </p>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded p-1 text-center">
                      <p className="text-xs text-yellow-700 dark:text-yellow-300">⏰</p>
                      <p className="text-xs font-bold text-yellow-800 dark:text-yellow-200">
                        {stats.expiringDocuments}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SoporteCategories;
