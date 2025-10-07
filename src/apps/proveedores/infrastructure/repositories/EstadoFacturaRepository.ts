import axiosInstance from "../../../../core/infrastructure/http/axiosInstance";

export class EstadoFacturaRepository {
  async getAll(): Promise<any[]> {
    const response = await axiosInstance.get("/gestionProveedores/estado_facturas/");
    return response.data;
  }
}
