export enum UserRole {
  Admin = 'Administrador ELEAM',
  Director = 'Dirección Técnica',
  Tens = 'Tens',
  Visitor = 'Visita',
}

export type PermissionLevel = 'Total' | 'Modificar' | 'Solo Lectura';

export interface User {
  role: UserRole;
  name: string;
  permissions: PermissionLevel;
}

export enum Panel {
  Dashboard = 'Inicio',
  Residents = 'Residentes',
  Medications = 'Medicamentos',
  SummaryCesfam = 'Resumen de Stock General',
  SummaryIndividualStock = 'Resumen de Stock Individual',
  SummaryMentalHealth = 'Resumen Salud Mental',
  SummaryFamily = 'Resumen Familia',
  SummaryPurchases = 'Resumen Compras',
  ResidentMedications = 'Medicamentos de Residente', // Panel virtual
  LowStockSummary = 'Medicamentos con Bajo Stock' // Panel virtual
}

export interface Resident {
  id: number;
  name: string;
  rut: string;
  dateOfBirth: string; // YYYY-MM-DD format
}

export interface Medication {
  id: string;
  name: string;
  stock: number;
  unit: 'comprimidos' | 'ml' | 'unidades';
  lastOrdered: string;
  lowStockThreshold: number;
}

export type Provenance = 
  | 'Cesfam' 
  | 'Salud Mental' 
  | 'Hospital' 
  | 'CAE Quilpué' 
  | 'CAE Viña' 
  | 'Familia' 
  | 'Compras'
  | 'Donación';

// Interfaz para un horario de medicación estructurado
export interface MedicationSchedule {
  time: string;
  quantity: number;
  unit: string;
}

export interface ResidentMedication {
  id: string;
  residentId: number;
  medicationName: string;
  doseValue: string;
  doseUnit: string;
  schedules: MedicationSchedule[];
  stock: number;
  stockUnit: string;
  provenance: Provenance;
  deliveryDate?: string; // YYYY-MM-DD format
}

export interface LowStockItem {
  medicationName: string;
  residentName: string;
  currentStock: string;
  stockDays: number;
}