import React, { useEffect, useMemo, useState } from 'react';
import {
  HiOutlinePlus,
  HiOutlineMagnifyingGlass,
  HiOutlinePencilSquare,
} from 'react-icons/hi2';
import LoadingScreen from '../../../../shared/components/LoadingScreen';
import { Breadcrumbs, DataTable, EstandarFormModal } from '../components';
import type { DataTableColumn } from '../components';
import { useEstandar } from '../hooks';
import type { Estandar } from '../../domain/entities/Estandar';

const EstandaresPage: React.FC = () => {
  const { estandares, loading, error, fetchEstandares, fetchEstandaresFull } = useEstandar();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<Estandar | undefined>(undefined);

  useEffect(() => {
    fetchEstandares();
  }, [fetchEstandares]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return estandares;

    return estandares.filter(item =>
      item.codigo.toLowerCase().includes(term) ||
      item.nombre.toLowerCase().includes(term) ||
      (item.version_resolucion || '').toLowerCase().includes(term)
    );
  }, [estandares, search]);

  const columns: DataTableColumn<Estandar>[] = [
    { key: 'codigo', label: 'Código', accessor: r => r.codigo },
    { key: 'nombre', label: 'Nombre', accessor: r => r.nombre },
    {
      key: 'version',
      label: 'Norma/Resolución',
      accessor: r => r.version_resolucion || '—',
      render: r => <span>{r.version_resolucion || '—'}</span>,
    },
    {
      key: 'criterios_count',
      label: 'Criterios',
      accessor: r => r.criterios_count ?? r.criterios?.length ?? 0,
      render: r => <span className="font-medium">{r.criterios_count ?? r.criterios?.length ?? 0}</span>,
      align: 'center',
    },
    {
      key: 'estado',
      label: 'Estado',
      accessor: r => (r.estado === false ? 'Inactivo' : 'Activo'),
      render: r => (
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${r.estado === false ? 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300' : 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'}`}>
          {r.estado === false ? 'Inactivo' : 'Activo'}
        </span>
      ),
      align: 'center',
    },
  ];

  if (loading && estandares.length === 0) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gray-50 p-4 dark:bg-gray-900 sm:p-6 lg:p-8 space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Habilitación', path: '/habilitacion/' },
          { label: 'Estándares' },
        ]}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Estándares</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Creación y mantenimiento del catálogo de estándares de habilitación.</p>
        </div>
        <button
          onClick={() => {
            setSelected(undefined);
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <HiOutlinePlus className="h-4 w-4" /> Nuevo estándar
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="relative">
          <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por código, nombre o resolución..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
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
            title="Editar estándar"
          >
            <HiOutlinePencilSquare className="h-4 w-4" />
          </button>
        )}
      />

      <EstandarFormModal
        isOpen={showModal}
        estandar={selected}
        onClose={() => setShowModal(false)}
        onSuccess={async () => {
          await fetchEstandares();
          await fetchEstandaresFull();
        }}
      />
    </div>
  );
};

export default EstandaresPage;
