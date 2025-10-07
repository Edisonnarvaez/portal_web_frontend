import { MenuRepository } from "../../infrastructure/repositories/MenuRepository";
import type { 
  Funcionario, 
  CreateFuncionarioRequest, 
  UpdateFuncionarioRequest,
  CrudResponse 
} from "../../domain/types";

export class FuncionarioCrudService {
  private repository: MenuRepository;

  constructor() {
    this.repository = new MenuRepository();
  }

  async createFuncionario(data: CreateFuncionarioRequest): Promise<CrudResponse<Funcionario>> {
    try {
      const funcionario = await this.repository.createFuncionario(data);
      return {
        success: true,
        data: funcionario,
        message: 'Funcionario creado exitosamente'
      };
    } catch (error: any) {
      // Mostrar el mensaje real del backend si existe
      const backendMsg = error.response?.data
        ? JSON.stringify(error.response.data)
        : (error.response?.data?.message || 'Error al crear funcionario');
      return {
        success: false,
        message: backendMsg
      };
    }
  }

  async updateFuncionario(data: UpdateFuncionarioRequest): Promise<CrudResponse<Funcionario>> {
    try {
      const funcionario = await this.repository.updateFuncionario(data);
      return {
        success: true,
        data: funcionario,
        message: 'Funcionario actualizado exitosamente'
      };
    } catch (error: any) {
      console.error('Error updating funcionario:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al actualizar funcionario'
      };
    }
  }

  async deleteFuncionario(id: number): Promise<CrudResponse<void>> {
    try {
      await this.repository.deleteFuncionario(id);
      return {
        success: true,
        message: 'Funcionario eliminado exitosamente'
      };
    } catch (error: any) {
      console.error('Error deleting funcionario:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al eliminar funcionario'
      };
    }
  }
}