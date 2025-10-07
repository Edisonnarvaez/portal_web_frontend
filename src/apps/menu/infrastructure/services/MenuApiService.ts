import axiosInstance from "../../../../core/infrastructure/http/axiosInstance";
import type { 
  Funcionario, 
  Headquarters,
  ContenidoInformativo, 
  Evento, 
  FelicitacionCumpleanios, 
  Reconocimiento,
  CreateFuncionarioRequest,
  UpdateFuncionarioRequest,
  CreateContenidoRequest,
  UpdateContenidoRequest,
  CreateEventoRequest,
  UpdateEventoRequest,
  CreateReconocimientoRequest,
  UpdateReconocimientoRequest,
  CreateFelicitacionRequest,
  UpdateFelicitacionRequest
} from "../../domain/types";

export class MenuApiService {
  // ================ SEDES (HEADQUARTERS) ================
  static async getHeadquarters(): Promise<Headquarters[]> {
    const response = await axiosInstance.get("/companies/headquarters/");
    return response.data;
  }

  static async getHeadquarter(id: number): Promise<Headquarters> {
    const response = await axiosInstance.get(`/companies/headquarters/${id}/`);
    return response.data;
  }

  // ================ FUNCIONARIOS - CONSULTAS ================
  static async getFuncionarios(): Promise<Funcionario[]> {
    const response = await axiosInstance.get("/main/funcionarios/");
    return response.data;
  }

  static async getFuncionario(id: number): Promise<Funcionario> {
    const response = await axiosInstance.get(`/main/funcionarios/${id}/`);
    return response.data;
  }

  static async getFuncionariosBySede(sedeId: number): Promise<Funcionario[]> {
    const response = await axiosInstance.get(`/main/funcionarios/?sede=${sedeId}`);
    return response.data;
  }

  // 👈 AGREGAR: Método faltante
  static async getFuncionariosByCargo(cargo: string): Promise<Funcionario[]> {
    const response = await axiosInstance.get(`/main/funcionarios/?cargo=${encodeURIComponent(cargo)}`);
    return response.data;
  }

  // ================ CRUD FUNCIONARIOS ================
  static async createFuncionario(data: CreateFuncionarioRequest): Promise<Funcionario> {
    const formData = new FormData();
    
    const appendSafeField = (key: string, value: any) => {
      if (value !== undefined && value !== null && value !== '') {
        if (key === 'sede') {
          formData.append('sede_id', value.toString());
        } else if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value.toString());
        }
      }
    };

    // Agregar todos los campos de forma segura
    appendSafeField('documento', data.documento);
    appendSafeField('nombres', data.nombres);
    appendSafeField('apellidos', data.apellidos);
    appendSafeField('fecha_nacimiento', data.fecha_nacimiento);
    appendSafeField('cargo', data.cargo);
    appendSafeField('sede', data.sede);
    appendSafeField('telefono', data.telefono);
    appendSafeField('correo', data.correo);
    appendSafeField('foto', data.foto);
    
    const response = await axiosInstance.post("/main/funcionarios/", formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  static async updateFuncionario(data: UpdateFuncionarioRequest): Promise<Funcionario> {
    const { id, ...updateData } = data;
    const formData = new FormData();
    
    const appendSafeField = (key: string, value: any) => {
      if (value !== undefined && value !== null && value !== '') {
        if (key === 'sede') {
          formData.append('sede_id', value.toString());
        } else if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value.toString());
        }
      }
    };

    // Iterar sobre los datos de actualización
    Object.entries(updateData).forEach(([key, value]) => {
      appendSafeField(key, value);
    });

    const response = await axiosInstance.patch(`/main/funcionarios/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  static async deleteFuncionario(id: number): Promise<void> {
    await axiosInstance.delete(`/main/funcionarios/${id}/`);
  }

  // ================ CRUD CONTENIDOS ================
  static async createContenido(data: CreateContenidoRequest): Promise<ContenidoInformativo> {
    const formData = new FormData();
    
    const appendSafeField = (key: string, value: any) => {
      if (value !== undefined && value !== null && value !== '') {
        if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value.toString());
        }
      }
    };
    
    appendSafeField('titulo', data.titulo);
    appendSafeField('fecha', data.fecha);
    appendSafeField('contenido', data.contenido);
    appendSafeField('enlace', data.enlace);
    appendSafeField('urgente', data.urgente);
    appendSafeField('tipo', data.tipo);
    appendSafeField('imagen', data.imagen);

    const response = await axiosInstance.post("/main/contenidos/", formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  static async updateContenido(data: UpdateContenidoRequest): Promise<ContenidoInformativo> {
    const { id, ...updateData } = data;
    const formData = new FormData();
    
    const appendSafeField = (key: string, value: any) => {
      if (value !== undefined && value !== null && value !== '') {
        if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value.toString());
        }
      }
    };
    
    appendSafeField('titulo', updateData.titulo);
    appendSafeField('fecha', updateData.fecha);
    appendSafeField('contenido', updateData.contenido);
    appendSafeField('enlace', updateData.enlace);
    appendSafeField('urgente', updateData.urgente);
    appendSafeField('tipo', updateData.tipo);
    appendSafeField('imagen', updateData.imagen);

    const response = await axiosInstance.patch(`/main/contenidos/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  static async deleteContenido(id: number): Promise<void> {
    await axiosInstance.delete(`/main/contenidos/${id}/`);
  }

  // ================ CRUD EVENTOS ================
  static async createEvento(data: CreateEventoRequest): Promise<Evento> {
    const response = await axiosInstance.post("/main/eventos/", data);
    return response.data;
  }

  static async updateEvento(data: UpdateEventoRequest): Promise<Evento> {
    const { id, ...updateData } = data;
    const response = await axiosInstance.patch(`/main/eventos/${id}/`, updateData);
    return response.data;
  }

  static async deleteEvento(id: number): Promise<void> {
    await axiosInstance.delete(`/main/eventos/${id}/`);
  }

  // ================ CRUD RECONOCIMIENTOS ================
  static async createReconocimiento(data: CreateReconocimientoRequest): Promise<Reconocimiento> {
    //console.log('MenuApiService - Enviando reconocimiento:', data);
    
    // 👈 SOLUCIÓN: Mapear funcionario a funcionario_id
    const requestData = {
      funcionario_id: data.funcionario, // 👈 CAMBIAR: mapear funcionario a funcionario_id
      titulo: data.titulo,
      descripcion: data.descripcion,
      fecha: data.fecha,
      tipo: data.tipo,
      publicar: data.publicar
    };
    
    //console.log('MenuApiService - Datos mapeados:', requestData);
    
    const response = await axiosInstance.post("/main/reconocimientos/", requestData);
    
    //console.log('MenuApiService - Respuesta del servidor:', response.data);
    
    return response.data;
  }

  static async updateReconocimiento(data: UpdateReconocimientoRequest): Promise<Reconocimiento> {
    const { id, funcionario, ...otherData } = data;
    
    const updateData = funcionario !== undefined 
      ? { funcionario_id: funcionario, ...otherData }
      : otherData;
    
    //console.log('MenuApiService - Actualizando reconocimiento:', { id, updateData });
    
    // 👈 CAMBIAR: usar PUT en lugar de PATCH si también da error 405
    const response = await axiosInstance.put(`/main/reconocimientos/${id}/`, updateData);
    
    //console.log('MenuApiService - Respuesta del servidor:', response.data);
    
    return response.data;
  }

  static async deleteReconocimiento(id: number): Promise<void> {
    await axiosInstance.delete(`/main/reconocimientos/${id}/`);
  }

  // ================ CRUD FELICITACIONES ================
  static async createFelicitacion(data: CreateFelicitacionRequest): Promise<FelicitacionCumpleanios> {
    //console.log('MenuApiService - Enviando felicitación:', data);
    
    const requestData = {
      funcionario_id: data.funcionario,
      mensaje: data.mensaje
    };
    
    //console.log('MenuApiService - Datos mapeados:', requestData);
    
    const response = await axiosInstance.post("/main/felicitaciones/", requestData);
    return response.data;
  }

  static async updateFelicitacion(data: UpdateFelicitacionRequest): Promise<FelicitacionCumpleanios> {
    const { id, funcionario, ...otherData } = data;
    
    // Mapear funcionario a funcionario_id si está presente
    const updateData = funcionario !== undefined 
      ? { funcionario_id: funcionario, ...otherData }
      : otherData;
    
    //console.log('MenuApiService - Actualizando felicitación:', { id, updateData });
    
    // 👈 CAMBIAR: usar PUT en lugar de PATCH
    const response = await axiosInstance.put(`/main/felicitaciones/${id}/`, updateData);
    
    //console.log('MenuApiService - Respuesta del servidor:', response.data);
    
    return response.data;
  }

  static async deleteFelicitacion(id: number): Promise<void> {
    await axiosInstance.delete(`/main/felicitaciones/${id}/`);
  }

  // ================ CONSULTA CONTENIDOS INFORMATIVOS ================
  static async getContenidos(): Promise<ContenidoInformativo[]> {
    const response = await axiosInstance.get(`/main/contenidos/`);
    return response.data;
  }

  static async getContenidosByTipo(tipo: 'noticia' | 'comunicado'): Promise<ContenidoInformativo[]> {
    const response = await axiosInstance.get(`/main/contenidos/?tipo=${tipo}`);
    return response.data;
  }

  static async getContenidosUrgentes(): Promise<ContenidoInformativo[]> {
    const response = await axiosInstance.get(`/main/contenidos/?urgente=true`);
    return response.data;
  }

  static async getContenido(id: number): Promise<ContenidoInformativo> {
    const response = await axiosInstance.get(`/main/contenidos/${id}/`);
    return response.data;
  }

  // ================ CONSULTA EVENTOS ================
  static async getEventos(): Promise<Evento[]> {
    const response = await axiosInstance.get(`/main/eventos/`);
    return response.data;
  }

  static async getEventosProximos(): Promise<Evento[]> {
    const response = await axiosInstance.get(`/main/eventos/?proximos=true`);
    return response.data;
  }

  static async getEventosImportantes(): Promise<Evento[]> {
    const response = await axiosInstance.get(`/main/eventos/?importante=true`);
    return response.data;
  }

  static async getEventosVirtuales(): Promise<Evento[]> {
    const response = await axiosInstance.get(`/main/eventos/?es_virtual=true`);
    return response.data;
  }

  static async getEvento(id: number): Promise<Evento> {
    const response = await axiosInstance.get(`/main/eventos/${id}/`);
    return response.data;
  }

  // ================ CONSULTA FELICITACIONES Y RECONOCIMIENTOS (ACTUALIZADO) ================
  static async getFelicitacionesMes(): Promise<FelicitacionCumpleanios[]> {
    const response = await axiosInstance.get(`/main/felicitaciones/?mes=actual`);
    return response.data;
  }

  // 👈 MÉTODO YA AGREGADO: Obtener TODAS las felicitaciones para gestión
  static async getAllFelicitaciones(): Promise<FelicitacionCumpleanios[]> {
    try {
      const response = await axiosInstance.get<FelicitacionCumpleanios[]>('/main/felicitaciones/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener todas las felicitaciones:', error);
      throw error;
    }
  }

  static async getReconocimientosPublicados(): Promise<Reconocimiento[]> {
    const response = await axiosInstance.get(`/main/reconocimientos/?publicar=true`);
    return response.data;
  }

  // 👈 MÉTODO YA AGREGADO: Obtener TODOS los reconocimientos para gestión
  static async getAllReconocimientos(): Promise<Reconocimiento[]> {
    const response = await axiosInstance.get(`/main/reconocimientos/`);
    return response.data;
  }
}