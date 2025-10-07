import { MenuRepository } from "../../infrastructure/repositories/MenuRepository";
import type { 
  ContenidoInformativo, 
  CreateContenidoRequest, 
  UpdateContenidoRequest,
  CrudResponse 
} from "../../domain/types";

export class ContenidoCrudService {
  private repository: MenuRepository;

  constructor() {
    this.repository = new MenuRepository();
  }

  async createContenido(data: CreateContenidoRequest): Promise<CrudResponse<ContenidoInformativo>> {
    try {
      const contenido = await this.repository.createContenido(data);
      return {
        success: true,
        data: contenido,
        message: 'Contenido creado exitosamente'
      };
    } catch (error: any) {
      console.error('Error creating contenido:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al crear contenido'
      };
    }
  }

  async updateContenido(data: UpdateContenidoRequest): Promise<CrudResponse<ContenidoInformativo>> {
    try {
      const contenido = await this.repository.updateContenido(data);
      return {
        success: true,
        data: contenido,
        message: 'Contenido actualizado exitosamente'
      };
    } catch (error: any) {
      console.error('Error updating contenido:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al actualizar contenido'
      };
    }
  }

  async deleteContenido(id: number): Promise<CrudResponse<void>> {
    try {
      await this.repository.deleteContenido(id);
      return {
        success: true,
        message: 'Contenido eliminado exitosamente'
      };
    } catch (error: any) {
      console.error('Error deleting contenido:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al eliminar contenido'
      };
    }
  }
}