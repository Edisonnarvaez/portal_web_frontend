import axiosInstance from '../../../../core/infrastructure/http/axiosInstance';
import type { ProcessType } from '../../domain/entities/ProcessType';

export class ProcessTypeRepository {
    async getAll(): Promise<ProcessType[]> {
        const response = await axiosInstance.get("/companies/process_types/");
        return response.data;
    }

    async getById(id: number): Promise<ProcessType> {
        const response = await axiosInstance.get(`/companies/process_types/${id}/`);
        return response.data;
    }

    async create(data: Partial<ProcessType>): Promise<ProcessType> {
        const response = await axiosInstance.post("/companies/process_types/", data);
        return response.data;
    }

    async update(id: number, data: Partial<ProcessType>): Promise<ProcessType> {
        const response = await axiosInstance.put(`/companies/process_types/${id}/`, data);
        return response.data;
    }

    async delete(id: number): Promise<void> {
        await axiosInstance.delete(`/companies/process_types/${id}/`);
    }
}
