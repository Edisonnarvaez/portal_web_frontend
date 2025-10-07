export interface Process {
    id: number;
    name: string;
    description?: string;
    code?: string;
    version?: string;
    processType?: number; // FK to ProcessType
    department?: number; // FK to Department
    status?: boolean;
}