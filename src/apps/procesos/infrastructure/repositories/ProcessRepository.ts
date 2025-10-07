import axiosInstance from '../../../../core/infrastructure/http/axiosInstance';
import type { Process } from '../../domain/entities/Process';

export class ProcessRepository {
    async getAll(): Promise<Process[]> {
        const response = await axiosInstance.get("/companies/processes/");
        return response.data;
    }

    async getById(id: number): Promise<Process> {
        const response = await axiosInstance.get(`/companies/processes/${id}/`);
        return response.data;
    }

    async create(data: Partial<Process>): Promise<Process> {
        const response = await axiosInstance.post("/companies/processes/", data);
        return response.data;
    }

    async update(id: number, data: Partial<Process>): Promise<Process> {
        const response = await axiosInstance.put(`/companies/processes/${id}/`, data);
        return response.data;
    }

    async delete(id: number): Promise<void> {
        await axiosInstance.delete(`/companies/processes/${id}/`);
    }
}