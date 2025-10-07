import axiosInstance from "../../../../core/infrastructure/http/axiosInstance";

export class CentroOperacionesRepository {
  async getAll(): Promise<any[]> {
    const response = await axiosInstance.get("/gestionProveedores/centro_operaciones/");
    return response.data;
  }
}
