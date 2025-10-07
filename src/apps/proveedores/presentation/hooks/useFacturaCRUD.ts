import { useState, useEffect } from "react";
import type { Factura } from "../../domain/entities/Factura";
import { FacturaService } from "../../application/services/FacturaService";
import { FacturaRepository } from "../../infrastructure/repositories/FacturaRepository";
import { CentroOperacionesRepository } from "../../infrastructure/repositories/CentroOperacionesRepository";
import { EstadoFacturaRepository } from "../../infrastructure/repositories/EstadoFacturaRepository";
import { CausalDevolucionRepository } from "../../infrastructure/repositories/CausalDevolucionRepository";

export const useFacturaCRUD = () => {
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const facturaService = new FacturaService(
    new FacturaRepository(),
    new CentroOperacionesRepository(),
    new EstadoFacturaRepository(),
    new CausalDevolucionRepository()
  );

  const fetchFacturas = async () => {
    try {
      setLoading(true);
      const data = await facturaService.getFacturas();
      const activas = data.filter((f: Factura) => f.factura_estado === true);
      setFacturas(activas);
      setError(null);
    } catch (err: any) {
      setError("No se pudieron cargar las facturas");
      console.error("Error al cargar facturas:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateFactura = async (id: number, data: any) => {
    try {
      const formData = new FormData();
      for (const key in data) {
        if (data[key] !== null && data[key] !== undefined) {
          formData.append(key, data[key].toString());
        }
      }
      const updated = await facturaService.updateFactura(id, formData);
      setFacturas((prev) =>
        prev.map((f) => (f.factura_id === id ? updated : f))
      );
      return updated;
    } catch (error) {
      console.error("Error actualizando factura:", error);
      throw error;
    }
  };

  useEffect(() => {
    fetchFacturas();
  }, []);

  return {
    facturas,
    loading,
    error,
    fetchFacturas,
    updateFactura,
    facturaService,
  };
};
