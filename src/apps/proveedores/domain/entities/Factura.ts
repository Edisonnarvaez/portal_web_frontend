export interface Factura {
  factura_id: number;
  factura_id_factura_electronica: string | null;
  factura_centro_operaciones: number | null;
  factura_centro_costo: number | null;
  factura_etapa: string | null;
  factura_fecha: string | null;
  factura_estado_factura: number;
  factura_numero_autorizacion: string | null;
  factura_concepto: string | null;
  factura_razon_social_proveedor: string | null;
  factura_razon_social_adquiriente: string | null;
  factura_valor: number;
  factura_estado: boolean;
  causal_anulacion: number | null;
  causal_contabilidad: number | null;
  causal_revision: number | null;
  causal_impuestos: number | null;
}
