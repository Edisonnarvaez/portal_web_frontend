import { MenuRepository } from "../../infrastructure/repositories/MenuRepository";
import type { 
  Reconocimiento, 
  CreateReconocimientoRequest, 
  UpdateReconocimientoRequest,
  CrudResponse 
} from "../../domain/types";

export class ReconocimientoCrudService {
  private repository: MenuRepository;

  constructor() {
    this.repository = new MenuRepository();
  }

  async createReconocimiento(data: CreateReconocimientoRequest): Promise<CrudResponse<Reconocimiento>> {
    try {
      const reconocimiento = await this.repository.createReconocimiento(data);
      return {
        success: true,
        data: reconocimiento,
        message: 'Reconocimiento creado exitosamente'
      };
    } catch (error: any) {
      console.error('Error creating reconocimiento:', error);
      
      // 👈 MEJORAR: Capturar detalles específicos del error
      let errorMessage = 'Error al crear reconocimiento';
      if (error.response?.data) {
        console.error('Error response data:', error.response.data); // 👈 DEBUG
        if (typeof error.response.data === 'object') {
          // Formatear errores de validación de Django
          const errors = Object.entries(error.response.data)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
          errorMessage = `Errores de validación:\n${errors}`;
        } else {
          errorMessage = error.response.data.message || error.response.data;
        }
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  async updateReconocimiento(data: UpdateReconocimientoRequest): Promise<CrudResponse<Reconocimiento>> {
    try {
      const reconocimiento = await this.repository.updateReconocimiento(data);
      return {
        success: true,
        data: reconocimiento,
        message: 'Reconocimiento actualizado exitosamente'
      };
    } catch (error: any) {
      console.error('Error updating reconocimiento:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al actualizar reconocimiento'
      };
    }
  }

  async deleteReconocimiento(id: number): Promise<CrudResponse<void>> {
    try {
      await this.repository.deleteReconocimiento(id);
      return {
        success: true,
        message: 'Reconocimiento eliminado exitosamente'
      };
    } catch (error: any) {
      console.error('Error deleting reconocimiento:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al eliminar reconocimiento'
      };
    }
  }
}