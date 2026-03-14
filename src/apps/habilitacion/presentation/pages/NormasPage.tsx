import React, { useEffect, useMemo, useState } from 'react';
import { HiOutlineBookOpen, HiOutlinePlus, HiOutlinePencilSquare } from 'react-icons/hi2';
import LoadingScreen from '../../../../shared/components/LoadingScreen';
import { Breadcrumbs, EstandarFormModal } from '../components';
import { useEstandar } from '../hooks';
import type { Estandar } from '../../domain/entities/Estandar';

interface NormaGroup {
  norma: string;
  total: number;
  activos: number;
  estandares: Estandar[];
}

const NormasPage: React.FC = () => {
  const { estandares, loading, error, fetchEstandaresFull } = useEstandar();
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<Estandar | undefined>(undefined);

  useEffect(() => {
    fetchEstandaresFull();
  }, [fetchEstandaresFull]);

  const grouped = useMemo<NormaGroup[]>(() => {
    const groups = new Map<string, NormaGroup>();

    estandares.forEach(item => {
      const norma = item.version_resolucion || 'Sin norma definida';
      const current = groups.get(norma);

      if (!current) {
        groups.set(norma, {
          norma,
          total: 1,
          activos: item.estado === false ? 0 : 1,
          estandares: [item],
        });
        return;
      }

      current.total += 1;
      current.activos += item.estado === false ? 0 : 1;
      current.estandares.push(item);
    });

    return [...groups.values()].sort((a, b) => a.norma.localeCompare(b.norma, 'es'));
  }, [estandares]);

  if (loading && estandares.length === 0) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gray-50 p-4 dark:bg-gray-900 sm:p-6 lg:p-8 space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Habilitación', path: '/habilitacion/' },
          { label: 'Normas' },
        ]}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Normas</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Vista normativa agrupada por resolución con edición de estándares asociados.</p>
        </div>
        <button
          onClick={() => {
            setSelected(undefined);
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <HiOutlinePlus className="h-4 w-4" /> Agregar estándar/norma
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}

      {grouped.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center dark:border-gray-700 dark:bg-gray-800">
          <HiOutlineBookOpen className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600" />
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">No hay normas registradas.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(group => (
            <section key={group.norma} className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
              <header className="flex flex-col gap-2 border-b border-gray-200 px-5 py-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{group.norma}</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {group.total} estándares, {group.activos} activos
                  </p>
                </div>
              </header>

              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {group.estandares.map(item => (
                  <div key={item.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {item.codigo} - {item.nombre}
                      </p>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                        {item.descripcion || 'Sin descripción'}
                      </p>
                      <div className="mt-2">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${item.estado === false ? 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300' : 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'}`}>
                          {item.estado === false ? 'Inactivo' : 'Activo'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelected(item);
                        setShowModal(true);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      <HiOutlinePencilSquare className="h-4 w-4" /> Editar
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <EstandarFormModal
        isOpen={showModal}
        estandar={selected}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          fetchEstandaresFull();
        }}
      />
    </div>
  );
};

export default NormasPage;
