import { MenuRepository } from "../../infrastructure/repositories/MenuRepository";
import { MenuApiService } from "../../infrastructure/services/MenuApiService";
import type {
    FelicitacionCumpleanios,
    CreateFelicitacionRequest,
    UpdateFelicitacionRequest,
    CrudResponse
} from "../../domain/types";

export class FelicitacionCrudService {
    private repository: MenuRepository;

    constructor() {
        this.repository = new MenuRepository();
    }

    async createFelicitacion(data: CreateFelicitacionRequest): Promise<CrudResponse<FelicitacionCumpleanios>> {
        try {
            const felicitacion = await this.repository.createFelicitacion(data);
            return {
                success: true,
                data: felicitacion,
                message: 'Felicitación creada exitosamente'
            };
        } catch (error: any) {
            console.error('Error creating felicitacion:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Error al crear felicitación'
            };
        }
    }

    async updateFelicitacion(data: UpdateFelicitacionRequest): Promise<CrudResponse<FelicitacionCumpleanios>> {
        try {
            const felicitacion = await this.repository.updateFelicitacion(data);
            return {
                success: true,
                data: felicitacion,
                message: 'Felicitación actualizada exitosamente'
            };
        } catch (error: any) {
            console.error('Error updating felicitacion:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Error al actualizar felicitación'
            };
        }
    }

    async deleteFelicitacion(id: number): Promise<CrudResponse<void>> {
        try {
            await this.repository.deleteFelicitacion(id);
            return {
                success: true,
                message: 'Felicitación eliminada exitosamente'
            };
        } catch (error: any) {
            console.error('Error deleting felicitacion:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Error al eliminar felicitación'
            };
        }
    }

    async getAllFelicitaciones(): Promise<FelicitacionCumpleanios[]> {
        try {
            const response = await MenuApiService.getAllFelicitaciones();
            return response;
        } catch (error) {
            console.error('Error al obtener felicitaciones:', error);
            throw error;
        }
    }
}