export interface Document {
  id: number;
  documento_padre: number | null;
  codigo_documento: string;
  nombre_documento: string;
  proceso: number;
  tipo_documento: string;
  version: number;
  estado: string;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
  archivo_oficial: string;
  archivo_editable: string | null;
}
