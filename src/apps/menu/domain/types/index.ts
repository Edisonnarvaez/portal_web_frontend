export interface TimeStampedModel {
  created_at: string;
  updated_at: string;
}

export interface Funcionario extends TimeStampedModel {
  id: number;
  documento: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  cargo: string;
  sede: Headquarters; // 👈 CAMBIAR: objeto completo en lugar de number
  telefono: string;
  correo: string;
  foto: string;
}

export interface ContenidoInformativo extends TimeStampedModel {
  id: number;
  titulo: string;
  fecha: string;
  contenido: string;
  enlace?: string;
  urgente: boolean;
  tipo: 'noticia' | 'comunicado';
  imagen?: string; // 👈 NUEVO: campo para la imagen
}

export interface Evento extends TimeStampedModel {
  id: number;
  titulo: string;
  fecha: string;
  hora: string;
  detalles: string;
  es_virtual: boolean;
  enlace?: string;
  lugar?: string;
  importante: boolean;
}

export interface FelicitacionCumpleanios extends TimeStampedModel {
  id: number;
  funcionario: Funcionario; // 👈 CAMBIAR: objeto completo en lugar de number
  mensaje: string;
}

export interface Reconocimiento extends TimeStampedModel {
  id: number;
  funcionario: Funcionario; // 👈 CAMBIAR: objeto completo en lugar de number
  titulo: string;
  descripcion: string;
  fecha: string;
  tipo?: string;
  publicar: boolean;
}

// Tipos para respuestas de API
export interface ApiResponse<T> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
} 

// Tipos para filtros
export type TipoContenido = 'noticia' | 'comunicado' | 'todos';
export type TipoReconocimiento = string;

// Tipos para formularios CRUD
export interface CreateFuncionarioRequest {
  documento: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  cargo: string;
  sede: number; // 👈 MANTENER: enviar solo el ID
  telefono: string;
  correo: string;
  foto?: File;
}

export interface UpdateFuncionarioRequest extends Partial<CreateFuncionarioRequest> {
  id: number;
}

export interface CreateContenidoRequest {
  titulo: string;
  fecha: string;
  contenido: string;
  enlace?: string;
  urgente: boolean;
  tipo: 'noticia' | 'comunicado';
  imagen?: File; // 👈 NUEVO: campo para la imagen en la creación
}

export interface UpdateContenidoRequest extends Partial<CreateContenidoRequest> {
  id: number;
}

export interface CreateEventoRequest {
  titulo: string;
  fecha: string;
  hora: string;
  detalles: string;
  es_virtual: boolean;
  enlace?: string;
  lugar?: string;
  importante: boolean;
}

export interface UpdateEventoRequest extends Partial<CreateEventoRequest> {
  id: number;
}

// Para CREATE requests mantenemos number porque enviamos solo el ID
export interface CreateReconocimientoRequest {
  funcionario: number; // 👈 MANTENER: ID para crear
  titulo: string;
  descripcion: string;
  fecha: string;
  tipo?: string;
  publicar: boolean;
}

export interface UpdateReconocimientoRequest extends Partial<CreateReconocimientoRequest> {
  id: number;
}

export interface CreateFelicitacionRequest {
  funcionario: number; // 👈 MANTENER: ID para crear
  mensaje: string;
}

export interface UpdateFelicitacionRequest extends Partial<CreateFelicitacionRequest> {
  id: number;
}

// Tipos para respuestas
export interface CrudResponse<T> {
  success: boolean;
  data?: T;
  message: string;
}

// Nuevo tipo para Headquarters
export interface Headquarters extends TimeStampedModel {
  id: number;
  name: string; // 👈 CAMBIAR: name en lugar de nombre
  habilitationCode: string; // 👈 AGREGAR
  city: string; // 👈 AGREGAR
  address: string; // 👈 AGREGAR
}