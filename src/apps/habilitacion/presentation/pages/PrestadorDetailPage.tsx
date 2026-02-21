import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    HiOutlinePencilSquare,
    HiOutlineTrash,
    HiOutlineClipboardDocumentCheck,
    HiOutlineBuildingOffice2,
    HiOutlineDocumentText,
    HiOutlineShieldCheck,
    HiOutlinePlus,
    HiOutlineArrowPath,
} from 'react-icons/hi2';
import {
    useDatosPrestador,
    useServicioSede,
    useAutoevaluacion,
    useCumplimiento,
} from '../hooks';
import type { DatosPrestador } from '../../domain/entities/DatosPrestador';
import type { ServicioSede } from '../../domain/entities/ServicioSede';
import type { Autoevaluacion } from '../../domain/entities/Autoevaluacion';
import {
    PrestadorFormModal, ServicioFormModal, AutoevaluacionFormModal,
    RenovacionWizard, MejorasVencidasPanel,
    Breadcrumbs, VencimientoBadge,
} from '../components';
import type { Cumplimiento } from '../../domain/entities/Cumplimiento';
import { getEstadoLabel, getEstadoColor, formatDate, diasParaVencimiento, getEstadoVencimiento } from '../utils/formatters';
import LoadingScreen from '../../../../shared/components/LoadingScreen';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';

type Tab = 'info' | 'servicios' | 'autoevaluaciones' | 'cumplimientos';

const PrestadorDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const prestadorId = Number(id);

    const [activeTab, setActiveTab] = useState<Tab>('info');
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showServicioModal, setShowServicioModal] = useState(false);
    const [showAutoModal, setShowAutoModal] = useState(false);
    const [editingServicio, setEditingServicio] = useState<ServicioSede | null>(null);
    const [editingAuto, setEditingAuto] = useState<Autoevaluacion | null>(null);
    const [showRenovacionWizard, setShowRenovacionWizard] = useState(false);

    // Local state for detail data (fetched via dedicated sub-resource endpoints)
    const [prestador, setPrestador] = useState<DatosPrestador | null>(null);
    const [serviciosPrestador, setServiciosPrestador] = useState<ServicioSede[]>([]);
    const [autoevaluacionesPrestador, setAutoevaluacionesPrestador] = useState<Autoevaluacion[]>([]);
    const [cumplimientosPrestador, setCumplimientosPrestador] = useState<Cumplimiento[]>([]);
    const [loading, setLoading] = useState(true);

    // Hooks for mutations only
    const { delete: deletePrestador, iniciarRenovacion, getServicios, getAutoevaluaciones, service: prestadorService } = useDatosPrestador();
    const { delete: deleteServicio } = useServicioSede();
    const { } = useAutoevaluacion();
    const { service: cumplimientoService } = useCumplimiento();

    // ── Data loading functions ──
    const loadPrestador = useCallback(async () => {
        try {
            const data = await prestadorService.getDatosPrestador(prestadorId);
            setPrestador(data);
            return data;
        } catch (err) {
            console.error('Error loading prestador:', err);
            setPrestador(null);
            return null;
        }
    }, [prestadorId]);

    const loadServicios = useCallback(async () => {
        try {
            const data = await getServicios(prestadorId);
            setServiciosPrestador(data);
        } catch (err) {
            console.error('Error loading servicios:', err);
            setServiciosPrestador([]);
        }
    }, [prestadorId]);

    const loadAutoevaluaciones = useCallback(async () => {
        try {
            const data = await getAutoevaluaciones(prestadorId);
            setAutoevaluacionesPrestador(data);
            return data;
        } catch (err) {
            console.error('Error loading autoevaluaciones:', err);
            setAutoevaluacionesPrestador([]);
            return [];
        }
    }, [prestadorId]);

    const loadCumplimientos = useCallback(async (autoIds: number[]) => {
        if (autoIds.length === 0) {
            setCumplimientosPrestador([]);
            return;
        }
        try {
            const results: Cumplimiento[] = [];
            for (const autoId of autoIds) {
                const data = await cumplimientoService.getCumplimientos({ autoevaluacion: autoId });
                results.push(...data);
            }
            setCumplimientosPrestador(results);
        } catch (err) {
            console.error('Error loading cumplimientos:', err);
            setCumplimientosPrestador([]);
        }
    }, [cumplimientoService]);

    // ── Initial data load ──
    useEffect(() => {
        const loadAll = async () => {
            setLoading(true);
            try {
                const [_, __, autos] = await Promise.all([
                    loadPrestador(),
                    loadServicios(),
                    loadAutoevaluaciones(),
                ]);
                // Load cumplimientos filtered by this prestador's autoevaluaciones
                if (autos && autos.length > 0) {
                    const autoIds = autos.map((a: Autoevaluacion) => a.id);
                    await loadCumplimientos(autoIds);
                } else {
                    setCumplimientosPrestador([]);
                }
            } finally {
                setLoading(false);
            }
        };
        loadAll();
    }, [prestadorId]);

    const handleDelete = async () => {
        try {
            await deletePrestador(prestadorId);
            navigate('/habilitacion/');
        } catch (err) {
            console.error('Error deleting prestador:', err);
        }
    };

    if (loading) return <LoadingScreen />;
    if (!prestador) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-lg text-gray-600 dark:text-gray-400">Prestador no encontrado</p>
                    <button onClick={() => navigate('/habilitacion/')} className="mt-4 text-blue-600 underline text-sm">
                        Volver
                    </button>
                </div>
            </div>
        );
    }

    const vencimientoEstado = getEstadoVencimiento(prestador.fecha_vencimiento_habilitacion);
    const dias = diasParaVencimiento(prestador.fecha_vencimiento_habilitacion);

    const tabs: { key: Tab; label: string; count?: number }[] = [
        { key: 'info', label: 'Información' },
        { key: 'servicios', label: 'Servicios', count: serviciosPrestador.length },
        { key: 'autoevaluaciones', label: 'Autoevaluaciones', count: autoevaluacionesPrestador.length },
        { key: 'cumplimientos', label: 'Cumplimientos', count: cumplimientosPrestador.length },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
            {/* ── Breadcrumbs ── */}
            <Breadcrumbs items={[
                { label: 'Habilitación', path: '/habilitacion/' },
                { label: prestador.codigo_reps },
            ]} />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                        <HiOutlineBuildingOffice2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{prestador.codigo_reps}</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {prestador.company_detail?.name || prestador.company_name || 'Sin empresa'} · {getEstadoLabel(prestador.clase_prestador)}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {dias !== null && dias <= 180 && (
                        <button
                            onClick={() => setShowRenovacionWizard(true)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
                        >
                            <HiOutlineArrowPath className="h-4 w-4" /> Renovar
                        </button>
                    )}
                    <button
                        onClick={() => setShowEditModal(true)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                        <HiOutlinePencilSquare className="h-4 w-4" /> Editar
                    </button>
                    <button
                        onClick={() => setShowDeleteDialog(true)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                    >
                        <HiOutlineTrash className="h-4 w-4" /> Eliminar
                    </button>
                </div>
            </div>

            {/* ── Status banner ── */}
            <div className={`rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${vencimientoEstado === 'vencido'
                    ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                    : vencimientoEstado === 'proximo'
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                        : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                }`}>
                <div className="flex items-center gap-3">
                    <HiOutlineShieldCheck className={`h-6 w-6 ${vencimientoEstado === 'vencido' ? 'text-red-600' : vencimientoEstado === 'proximo' ? 'text-yellow-600' : 'text-green-600'
                        }`} />
                    <div>
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${getEstadoColor(prestador.estado_habilitacion)}`}>
                            {getEstadoLabel(prestador.estado_habilitacion)}
                        </span>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Vence: {formatDate(prestador.fecha_vencimiento_habilitacion)}
                        </p>
                    </div>
                </div>
                <VencimientoBadge fechaVencimiento={prestador.fecha_vencimiento_habilitacion} />
            </div>

            {/* ── Mejoras vencidas alert ── */}
            <MejorasVencidasPanel compact className="mb-6" />

            {/* ── Tabs ── */}
            <div className="flex gap-1 mb-6 overflow-x-auto border-b border-gray-200 dark:border-gray-700">
                {tabs.map(t => (
                    <button
                        key={t.key}
                        onClick={() => setActiveTab(t.key)}
                        className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === t.key
                                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                            }`}
                    >
                        {t.label}
                        {t.count !== undefined && (
                            <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                {t.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* ── Content ── */}
            {activeTab === 'info' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <InfoCard title="Datos Generales">
                        <InfoRow label="Código REPS" value={prestador.codigo_reps} />
                        <InfoRow label="Clase" value={getEstadoLabel(prestador.clase_prestador)} />
                        <InfoRow label="Estado" value={getEstadoLabel(prestador.estado_habilitacion)} badge={getEstadoColor(prestador.estado_habilitacion)} />
                        <InfoRow label="Empresa" value={prestador.company_detail?.name || prestador.company_name || '—'} />
                        <InfoRow label="Sede" value={prestador.headquarters_detail?.name || '—'} />
                    </InfoCard>
                    <InfoCard title="Fechas y Vigencia">
                        <InfoRow label="Inscripción" value={formatDate(prestador.fecha_inscripcion)} />
                        <InfoRow label="Renovación" value={formatDate(prestador.fecha_renovacion)} />
                        <InfoRow label="Vencimiento" value={formatDate(prestador.fecha_vencimiento_habilitacion)} />
                        <InfoRow label="Creado" value={formatDate(prestador.fecha_creacion)} />
                        <InfoRow label="Actualizado" value={formatDate(prestador.fecha_actualizacion)} />
                    </InfoCard>
                    <InfoCard title="Póliza">
                        <InfoRow label="Aseguradora" value={prestador.aseguradora_pep || '—'} />
                        <InfoRow label="Número Póliza" value={prestador.numero_poliza || '—'} />
                        <InfoRow label="Vigencia Póliza" value={formatDate(prestador.vigencia_poliza)} />
                    </InfoCard>
                    <InfoCard title="Resumen">
                        <InfoRow label="Servicios asociados" value={String(serviciosPrestador.length)} />
                        <InfoRow label="Autoevaluaciones" value={String(autoevaluacionesPrestador.length)} />
                        <InfoRow label="Cumplimientos" value={String(cumplimientosPrestador.length)} />
                    </InfoCard>
                </div>
            )}

            {activeTab === 'servicios' && (
                <div>
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={() => { setEditingServicio(null); setShowServicioModal(true); }}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                        >
                            <HiOutlinePlus className="h-4 w-4" /> Nuevo Servicio
                        </button>
                    </div>
                    {serviciosPrestador.length === 0 ? (
                        <EmptyState message="No hay servicios asociados" />
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {serviciosPrestador.map(s => (
                                <div key={s.id} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white">{s.nombre_servicio}</p>
                                            <p className="text-xs text-gray-500">{s.codigo_servicio}</p>
                                        </div>
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getEstadoColor(s.estado_habilitacion)}`}>
                                            {getEstadoLabel(s.estado_habilitacion)}
                                        </span>
                                    </div>
                                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                        <p>Modalidad: <span className="font-medium text-gray-900 dark:text-white">{getEstadoLabel(s.modalidad)}</span></p>
                                        <p>Complejidad: <span className="font-medium text-gray-900 dark:text-white">{getEstadoLabel(s.complejidad)}</span></p>
                                        <p>Vence: <span className="font-medium">{formatDate(s.fecha_vencimiento)}</span></p>
                                    </div>
                                    <div className="flex justify-end gap-2 mt-4">
                                        <button
                                            onClick={() => { setEditingServicio(s); setShowServicioModal(true); }}
                                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-blue-600 transition-colors"
                                        >
                                            <HiOutlinePencilSquare className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={async () => { await deleteServicio(s.id); loadServicios(); }}
                                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-red-600 transition-colors"
                                        >
                                            <HiOutlineTrash className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'autoevaluaciones' && (
                <div>
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={() => { setEditingAuto(null); setShowAutoModal(true); }}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                        >
                            <HiOutlinePlus className="h-4 w-4" /> Nueva Autoevaluación
                        </button>
                    </div>
                    {autoevaluacionesPrestador.length === 0 ? (
                        <EmptyState message="No hay autoevaluaciones" />
                    ) : (
                        <div className="space-y-4">
                            {autoevaluacionesPrestador.map(a => (
                                <div
                                    key={a.id}
                                    className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => navigate(`/habilitacion/autoevaluacion/${a.id}`)}
                                >
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <HiOutlineClipboardDocumentCheck className="h-6 w-6 text-indigo-500 flex-shrink-0" />
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-white">{a.numero_autoevaluacion}</p>
                                                <p className="text-xs text-gray-500">Período {a.periodo} · v{a.version}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getEstadoColor(a.estado)}`}>
                                                {getEstadoLabel(a.estado)}
                                            </span>
                                            <span className="text-xs text-gray-500">{formatDate(a.fecha_vencimiento)}</span>
                                        </div>
                                    </div>
                                    {a.observaciones && (
                                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{a.observaciones}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'cumplimientos' && (
                <div>
                    {cumplimientosPrestador.length === 0 ? (
                        <EmptyState message="No hay cumplimientos registrados" />
                    ) : (
                        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Autoevaluación</th>
                                        <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Servicio</th>
                                        <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Criterio</th>
                                        <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Estado</th>
                                        <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Fecha Compromiso</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                                    {cumplimientosPrestador.map(c => (
                                        <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                            <td className="px-4 py-3 text-gray-900 dark:text-white">{c.autoevaluacion?.numero_autoevaluacion || '—'}</td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{c.servicio_sede?.nombre_servicio || c.servicio_nombre || '—'}</td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{c.criterio?.nombre || c.criterio_nombre || '—'}</td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getEstadoColor(c.cumple)}`}>
                                                    {getEstadoLabel(c.cumple)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-500">{formatDate(c.fecha_compromiso)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ── Modals ── */}
            {showEditModal && (
                <PrestadorFormModal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    onSuccess={() => { setShowEditModal(false); loadPrestador(); }}
                    prestador={prestador}
                />
            )}

            {showServicioModal && (
                <ServicioFormModal
                    isOpen={showServicioModal}
                    onClose={() => { setShowServicioModal(false); setEditingServicio(null); }}
                    onSuccess={() => { setShowServicioModal(false); setEditingServicio(null); loadServicios(); }}
                    servicio={editingServicio || undefined}
                />
            )}

            {showAutoModal && (
                <AutoevaluacionFormModal
                    isOpen={showAutoModal}
                    onClose={() => { setShowAutoModal(false); setEditingAuto(null); }}
                    onSuccess={(autoevaluacion) => {
                        setShowAutoModal(false);
                        setEditingAuto(null);
                        loadAutoevaluaciones();
                        if (autoevaluacion?.id && !editingAuto) {
                            navigate(`/habilitacion/autoevaluacion/${autoevaluacion.id}`);
                        }
                    }}
                    autoevaluacion={editingAuto || undefined}
                />
            )}

            <ConfirmDialog
                isOpen={showDeleteDialog}
                title="Eliminar Prestador"
                message={`¿Está seguro de que desea eliminar el prestador ${prestador.codigo_reps}? Esta acción no se puede deshacer.`}
                onConfirm={handleDelete}
                onClose={() => setShowDeleteDialog(false)}
                confirmText="Eliminar"
                cancelText="Cancelar"
            />

            {showRenovacionWizard && (
                <RenovacionWizard
                    isOpen={showRenovacionWizard}
                    onClose={() => setShowRenovacionWizard(false)}
                    prestador={prestador}
                    diasRestantes={dias}
                    onIniciarRenovacion={iniciarRenovacion}
                    onSuccess={() => loadPrestador()}
                />
            )}
        </div>
    );
};

/* ─── helpers ─── */
const InfoCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
        <div className="space-y-3">{children}</div>
    </div>
);

const InfoRow: React.FC<{ label: string; value: string; badge?: string }> = ({ label, value, badge }) => (
    <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
        {badge ? (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge}`}>{value}</span>
        ) : (
            <span className="text-sm font-medium text-gray-900 dark:text-white">{value}</span>
        )}
    </div>
);

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
    <div className="text-center py-16">
        <HiOutlineDocumentText className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600" />
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{message}</p>
    </div>
);

export default PrestadorDetailPage;
