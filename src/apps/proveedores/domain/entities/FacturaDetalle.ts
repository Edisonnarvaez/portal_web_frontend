export interface FacturaElectronicaDetalle {
  descripcionFactura: string;
  observacionesGestion: string | null;
  observacionesInconsistencias: string | null;
  observacionesConformidad: string | null;
  observacionesPago: string | null;
  observacionesContabilidad: string | null;
  observacionesRevision: string | null;
  observacionesImpuestos: string | null;
  observacionesContraloria: string | null;
  factura: number;
  estado: string;
}
