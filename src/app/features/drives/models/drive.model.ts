export interface Drive {
    _id: string;
    date: string;
    startKM: number;
    endKM?: number | null;
    totalKM: number;
    purpose?: string;
    notes?: string;
    status: 'pending' | 'completed';
};