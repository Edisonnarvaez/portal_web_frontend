import axiosInstance from "../../../../core/infrastructure/http/axiosInstance";

export class CausalDevolucionRepository {
  async getAll(): Promise<any[]> {
    const response = await axiosInstance.get("/gestionProveedores/causales_devolucion/");
    return response.data;
  }
}
