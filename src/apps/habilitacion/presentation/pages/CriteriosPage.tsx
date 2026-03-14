import React, { useEffect, useMemo, useState } from 'react';
import {
  HiOutlinePlus,
  HiOutlineMagnifyingGlass,
  HiOutlinePencilSquare,
} from 'react-icons/hi2';
import LoadingScreen from '../../../../shared/components/LoadingScreen';
import { Breadcrumbs, CriterioFormModal, DataTable } from '../components';
import type { DataTableColumn } from '../components';
import type { Criterio } from '../../domain/entities/Criterio';
import { useCriterio, useEstandar } from '../hooks';

const CriteriosPage: React.FC = () => {
  const { criterios, loading, error, fetchCriterios } = useCriterio();
  const { estandares, fetchEstandares } = useEstandar();

  const [search, setSearch] = useState('');
  const [filtroEstandar, setFiltroEstandar] = useState('');
  const [filtroComplejidad, setFiltroComplejidad] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<Criterio | undefined>(undefined);

  useEffect(() => {
    fetchCriterios();
    fetchEstandares();
  }, [fetchCriterios, fetchEstandares]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return criterios.filter(item => {
      const matchSearch =
        !term ||
        item.codigo.toLowerCase().includes(term) ||
        item.nombre.toLowerCase().includes(term) ||
        item.descripcion.toLowerCase().includes(term);

      const matchEstandar =
        !filtroEstandar ||
        String(item.estandar_id || item.estandar?.id || '') === filtroEstandar;

      const matchComplejidad = !filtroComplejidad || item.complejidad === filtroComplejidad;

      return matchSearch && matchEstandar && matchComplejidad;
    });
  }, [criterios, search, filtroEstandar, filtroComplejidad]);

  const columns: DataTableColumn<Criterio>[] = [
    { key: 'codigo', label: 'Código', accessor: r => r.codigo },
    { key: 'nombre', label: 'Nombre', accessor: r => r.nombre },
    {
      key: 'estandar',
      label: 'Estándar',
      accessor: r => r.estandar_display || r.estandar?.nombre || '—',
      render: r => <span>{r.estandar_display || r.estandar?.nombre || '—'}</span>,
    },
    {
      key: 'complejidad',
      label: 'Complejidad',
      accessor: r => r.complejidad || '—',
      render: r => <span>{r.complejidad_display || r.complejidad || '—'}</span>,
      align: 'center',
    },
    {
      key: 'mandatorio',
      label: 'Mandatorio',
      accessor: r => (r.es_mandatorio ? 'Sí' : 'No'),
      render: r => <span>{r.es_mandatorio ? 'Sí' : 'No'}</span>,
      align: 'center',
    },
  ];

  if (loading && criterios.length === 0) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gray-50 p-4 dark:bg-gray-900 sm:p-6 lg:p-8 space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Habilitación', path: '/habilitacion/' },
          { label: 'Criterios' },
        ]}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Criterios</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Administración de criterios normativos para autoevaluación y cumplimiento.</p>
        </div>
        <button
          onClick={() => {
            setSelected(undefined);
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <HiOutlinePlus className="h-4 w-4" /> Nuevo criterio
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 lg:grid-cols-3">
        <div className="relative lg:col-span-2">
          <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por código, nombre o descripción..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <select
            value={filtroEstandar}
            onChange={e => setFiltroEstandar(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Todos los estándares</option>
            {estandares.map(item => (
              <option key={item.id} value={item.id}>
                {item.codigo} - {item.nombre}
              </option>
            ))}
          </select>

          <select
            value={filtroComplejidad}
            onChange={e => setFiltroComplejidad(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Todas las complejidades</option>
            <option value="BAJA">Baja</option>
            <option value="MEDIA">Media</option>
            <option value="ALTA">Alta</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}

      <DataTable
        data={filtered}
        columns={columns}
        keyExtractor={row => row.id}
        pageSize={10}
        renderActions={row => (
          <button
            type="button"
            onClick={() => {
              setSelected(row);
              setShowModal(true);
            }}
            className="rounded p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-700"
            title="Editar criterio"
          >
            <HiOutlinePencilSquare className="h-4 w-4" />
          </button>
        )}
      />

      <CriterioFormModal
        isOpen={showModal}
        criterio={selected}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          fetchCriterios();
          fetchEstandares();
        }}
      />
    </div>
  );
};

export default CriteriosPage;
