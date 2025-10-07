
export const ESTADOS_FACTURA = [
  {
    value: 1,
    label: "Factura conforme",
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  },
  {
    value: 2,
    label: "Factura no conforme",
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  },
] as const;

export const ETAPAS_FACTURA = [
  { value: "gestion", label: "Gestión" },
  { value: "contabilidad", label: "Contabilidad" },
  { value: "revision", label: "Revisión" },
  { value: "impuestos", label: "Impuestos" },
  { value: "pago", label: "Pago" },
  { value: "conformidad", label: "Conformidad" },
  { value: "contraloria", label: "Contraloría" },
] as const;

export const ESTADOS_DETALLE = [
  { value: "pendiente", label: "Pendiente" },
  { value: "procesado", label: "Procesado" },
  { value: "completado", label: "Completado" },
] as const;

export type EstadoFactura = (typeof ESTADOS_FACTURA)[number]["value"];
export type EtapaFactura = (typeof ETAPAS_FACTURA)[number]["value"];
export type EstadoDetalle = (typeof ESTADOS_DETALLE)[number]["value"];

export type { Factura } from "../entities/Factura";
export type { FacturaElectronicaDetalle } from "../entities/FacturaDetalle";
export type { EstadoFactura as EstadoFacturaEntidad } from "../entities/EstadoFactura";
export type { CentroOperaciones } from "../entities/CentroOperaciones";
export type { CentroCostos } from "../entities/CentroCostos";
export type { CausalDevolucion } from "../entities/CausalDevolucion";
