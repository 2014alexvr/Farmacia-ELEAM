

import { Panel, UserRole, Resident, Medication, ResidentMedication, Provenance, PermissionLevel, ManagedUser } from './types';

export const ROLE_PERMISSIONS: Record<UserRole, PermissionLevel> = {
  [UserRole.Admin]: 'Total',
  [UserRole.Director]: 'Solo Lectura',
  [UserRole.Tens]: 'Modificar',
  [UserRole.Visitor]: 'Solo Lectura',
};

export const MOCK_USERS: ManagedUser[] = [
  { id: 'user-admin', role: UserRole.Admin, name: 'Administración ELEAM', password: 'admin1122', permissions: 'Total' },
  { id: 'user-director', role: UserRole.Director, name: 'Dirección Técnica', password: 'dt1122', permissions: 'Solo Lectura' },
  { id: 'user-tens', role: UserRole.Tens, name: 'Tens', password: 'pau1122', permissions: 'Modificar' },
  { id: 'user-visitor', role: UserRole.Visitor, name: 'Visita', password: 'visita1122', permissions: 'Solo Lectura' },
];


export const MOCK_RESIDENTS: Resident[] = [
  { id: 1, name: 'Jaime Eduardo Sanhueza Vivanco', rut: '5.854.672-0', dateOfBirth: '1946-12-10' },
  { id: 2, name: 'Raúl Jiménez Ramos', rut: '3.325.600-0', dateOfBirth: '1935-09-16' },
  { id: 3, name: 'Ana Rosa Peirano Ibaceta', rut: '4.916.829-2', dateOfBirth: '1945-05-04' },
  { id: 4, name: 'Jorge Rodolfo Medina Mocada', rut: '4.806.439-6', dateOfBirth: '1944-07-06' },
  { id: 5, name: 'Eugenio Ernesto González Basualto', rut: '4.402.706-2', dateOfBirth: '1940-03-05' },
  { id: 6, name: 'Rosa de las Mercedes Ahumada Loyola', rut: '4.808.912-7', dateOfBirth: '1944-08-12' },
  { id: 7, name: 'Edmundo Fernando Jorquera Quiroga', rut: '4.158.390-8', dateOfBirth: '1949-04-05' },
  { id: 8, name: 'Patricia Vivian De la Fuente Soto', rut: '7.383.363-9', dateOfBirth: '1956-12-22' },
  { id: 9, name: 'Celia Ester Caneleo Figueroa', rut: '489.292-5', dateOfBirth: '1946-11-08' },
  { id: 10, name: 'Zulema Olimpia Peña Díaz', rut: '5.616.384-0', dateOfBirth: '1948-11-26' },
  { id: 11, name: 'María Jiménez Torrejón', rut: '4.966.179-7', dateOfBirth: '1940-12-24' },
  { id: 12, name: 'Nancy Flores Sánchez', rut: '6.626.697-4', dateOfBirth: '1950-01-22' },
  { id: 13, name: 'Myriam Jeanette Silva Jara', rut: '9.137.387-4', dateOfBirth: '1962-09-13' },
  { id: 14, name: 'Gladys Nelsa Del Carmen Arellano Pavez', rut: '4.204.630-2', dateOfBirth: '1940-01-07' },
  { id: 15, name: 'Genoveva Del Carmen Sáez Hernández', rut: '3.139.105-9', dateOfBirth: '1933-10-24' },
  { id: 16, name: 'Rita Del Carmen Torres Briceño', rut: '6.688.988-2', dateOfBirth: '1950-03-07' },
];

export const MOCK_MEDICATIONS: Medication[] = [
    { id: 'MED001', name: 'Losartán 50mg', stock: 500, unit: 'comprimidos', lastOrdered: '2024-06-20', lowStockThreshold: 100 },
    { id: 'MED002', name: 'Aspirina 100mg', stock: 800, unit: 'comprimidos', lastOrdered: '2024-06-15', lowStockThreshold: 200 },
    { id: 'MED003', name: 'Metformina 850mg', stock: 350, unit: 'comprimidos', lastOrdered: '2024-07-01', lowStockThreshold: 150 },
    { id: 'MED004', name: 'Atorvastatina 20mg', stock: 60, unit: 'comprimidos', lastOrdered: '2024-05-28', lowStockThreshold: 100 },
    { id: 'MED005', name: 'Omeprazol 20mg', stock: 1200, unit: 'comprimidos', lastOrdered: '2024-07-05', lowStockThreshold: 300 },
    { id: 'MED006', name: 'Sertralina 50mg', stock: 250, unit: 'comprimidos', lastOrdered: '2024-06-18', lowStockThreshold: 100 },
    { id: 'MED007', name: 'Paracetamol 500mg', stock: 90, unit: 'comprimidos', lastOrdered: '2024-07-02', lowStockThreshold: 100 },
    { id: 'MED008', name: 'Insulina Glargina', stock: 20, unit: 'unidades', lastOrdered: '2024-07-10', lowStockThreshold: 15 },
];

export const MOCK_RESIDENT_MEDICATIONS: ResidentMedication[] = [
    // 1. Jaime Eduardo Sanhueza Vivanco
    { id: 'RMED101', residentId: 1, medicationName: 'Fenitoína', doseValue: '100', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2025-12-02' },
    { id: 'RMED102', residentId: 1, medicationName: 'Folifer', doseValue: '330', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Compras' },
    { id: 'RMED103', residentId: 1, medicationName: 'Tamsulosina/Dutasteride (Finaprost)', doseValue: '0.5/0.4', doseUnit: 'Mg', schedules: [{ time: '20:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Compras' },
    { id: 'RMED104', residentId: 1, medicationName: 'Quetiapina', doseValue: '100', doseUnit: 'Mg', schedules: [{ time: '20:00', quantity: 0.5, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Compras' },

    // 2. Raúl Jiménez Ramos
    { id: 'RMED201', residentId: 2, medicationName: 'Eutirox Lun-Jue', doseValue: '100', doseUnit: 'Mg', schedules: [{ time: '07:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Compras' },
    { id: 'RMED202', residentId: 2, medicationName: 'Eutirox Vie-Dom', doseValue: '100', doseUnit: 'Mg', schedules: [{ time: '07:00', quantity: 1.5, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Compras' },
    { id: 'RMED203', residentId: 2, medicationName: 'Losartán', doseValue: '50', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Compras' },
    { id: 'RMED204', residentId: 2, medicationName: 'Quetiapina', doseValue: '100', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 0.5, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Compras' },
    { id: 'RMED205', residentId: 2, medicationName: 'Amlodipino', doseValue: '5', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Compras' },
    { id: 'RMED206', residentId: 2, medicationName: 'Risperidona', doseValue: '1', doseUnit: 'Mg', schedules: [{ time: '16:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Compras' },
    { id: 'RMED207', residentId: 2, medicationName: 'Losartán', doseValue: '50', doseUnit: 'Mg', schedules: [{ time: '20:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Compras' },
    { id: 'RMED208', residentId: 2, medicationName: 'Quetiapina', doseValue: '100', doseUnit: 'Mg', schedules: [{ time: '20:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Compras' },
    { id: 'RMED209', residentId: 2, medicationName: 'Zopiclona', doseValue: '7.5', doseUnit: 'Mg', schedules: [{ time: '20:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Compras' },
    { id: 'RMED210', residentId: 2, medicationName: 'Amlodipino', doseValue: '5', doseUnit: 'Mg', schedules: [{ time: '20:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Compras' },
    { id: 'RMED211', residentId: 2, medicationName: 'Captopril (SOS)', doseValue: '50', doseUnit: 'Mg', schedules: [], stock: 30, stockUnit: 'Comp', provenance: 'Compras' },

    // 3. Ana Rosa Peirano Ibaceta
    { id: 'RMED301', residentId: 3, medicationName: 'Eutirox', doseValue: '100', doseUnit: 'Mg', schedules: [{ time: '07:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2025-12-02' },
    { id: 'RMED302', residentId: 3, medicationName: 'Furosemida', doseValue: '40', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2025-12-02' },
    { id: 'RMED303', residentId: 3, medicationName: 'Espironolactona', doseValue: '25', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2025-12-02' },
    { id: 'RMED304', residentId: 3, medicationName: 'Amlodipino', doseValue: '10', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2025-12-02' },
    { id: 'RMED305', residentId: 3, medicationName: 'Citalopram', doseValue: '20', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 0.5, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2025-12-02' },
    { id: 'RMED306', residentId: 3, medicationName: 'Insulina', doseValue: 'NPH', doseUnit: '', schedules: [{ time: '08:00', quantity: 24, unit: 'UI' }], stock: 300, stockUnit: 'UI', provenance: 'Cesfam', deliveryDate: '2025-12-02' },
    { id: 'RMED307', residentId: 3, medicationName: 'Insulina', doseValue: 'NPH', doseUnit: '', schedules: [{ time: '20:00', quantity: 18, unit: 'UI' }], stock: 300, stockUnit: 'UI', provenance: 'Cesfam', deliveryDate: '2025-12-02' },

    // 4. Jorge Rodolfo Medina Mocada
    { id: 'RMED401', residentId: 4, medicationName: 'Eutirox', doseValue: '100', doseUnit: 'Mg', schedules: [{ time: '07:00', quantity: 0.5, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2025-12-02' },
    { id: 'RMED402', residentId: 4, medicationName: 'Citalopram', doseValue: '20', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 0.5, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2025-12-02' },
    { id: 'RMED403', residentId: 4, medicationName: 'Cilostazol', doseValue: '50', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Compras' },
    { id: 'RMED404', residentId: 4, medicationName: 'Ácido Fólico', doseValue: '1', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Compras' },
    { id: 'RMED405', residentId: 4, medicationName: 'Furosemida', doseValue: '40', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 0.5, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2025-12-02' },
    { id: 'RMED406', residentId: 4, medicationName: 'Quetiapina', doseValue: '100', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 0.5, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2025-12-02' },
    { id: 'RMED407', residentId: 4, medicationName: 'Carvedilol', doseValue: '6.25', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 0.5, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2025-12-02' },
    { id: 'RMED408', residentId: 4, medicationName: 'Espironolactona', doseValue: '25', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2025-12-02' },
    { id: 'RMED409', residentId: 4, medicationName: 'Insulina', doseValue: 'NPH', doseUnit: '', schedules: [{ time: '08:00', quantity: 10, unit: 'UI' }], stock: 300, stockUnit: 'UI', provenance: 'Cesfam', deliveryDate: '2025-12-02' },
    { id: 'RMED410', residentId: 4, medicationName: 'Ácido Fólico', doseValue: '1', doseUnit: 'Mg', schedules: [{ time: '20:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Compras' },
    { id: 'RMED411', residentId: 4, medicationName: 'Atorvastatina', doseValue: '20', doseUnit: 'Mg', schedules: [{ time: '20:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2025-12-02' },
    { id: 'RMED412', residentId: 4, medicationName: 'Alopurinol', doseValue: '100', doseUnit: 'Mg', schedules: [{ time: '20:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2025-12-02' },
    { id: 'RMED413', residentId: 4, medicationName: 'Aspirina', doseValue: '100', doseUnit: 'Mg', schedules: [{ time: '20:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2025-12-02' },

    // 5. Eugenio Ernesto González Basualto
    { id: 'RMED501', residentId: 5, medicationName: 'Losartán', doseValue: '50', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2025-12-02' },
    { id: 'RMED502', residentId: 5, medicationName: 'Aspirina', doseValue: '100', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2025-12-02' },
    { id: 'RMED503', residentId: 5, medicationName: 'Amlodipino', doseValue: '10', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2025-12-02' },
    { id: 'RMED504', residentId: 5, medicationName: 'Hidroclorotiazida', doseValue: '50', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 0.5, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2025-12-02' },
    { id: 'RMED505', residentId: 5, medicationName: 'Citalopram', doseValue: '20', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 0.5, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Compras' },
    { id: 'RMED506', residentId: 5, medicationName: 'Losartán', doseValue: '50', doseUnit: 'Mg', schedules: [{ time: '20:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2025-12-02' },
    { id: 'RMED507', residentId: 5, medicationName: 'Atorvastatina', doseValue: '20', doseUnit: 'Mg', schedules: [{ time: '20:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2025-12-02' },

    // 6. Rosa de las Mercedes Ahumada Loyola
    { id: 'RMED601', residentId: 6, medicationName: 'Levotiroxina', doseValue: '100', doseUnit: 'Mg', schedules: [{ time: '07:00', quantity: 0.75, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2025-12-02' },
    { id: 'RMED602', residentId: 6, medicationName: 'Citalopram', doseValue: '20', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Compras' },
    { id: 'RMED603', residentId: 6, medicationName: 'Metformina', doseValue: '850', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2025-12-02' },
    { id: 'RMED604', residentId: 6, medicationName: 'Aripiprazol', doseValue: '5', doseUnit: 'Mg', schedules: [{ time: '11:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Compras' },
    { id: 'RMED605', residentId: 6, medicationName: 'Atorvastatina', doseValue: '20', doseUnit: 'Mg', schedules: [{ time: '20:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2025-12-02' },

    // 7. Edmundo Fernando Jorquera Quiroga
    { id: 'RMED701', residentId: 7, medicationName: 'Eutirox', doseValue: '100', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 0.75, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2025-12-02' },
    { id: 'RMED702', residentId: 7, medicationName: 'Tonaril', doseValue: '2', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 0.5, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Hospital', deliveryDate: '2025-11-30' },
    { id: 'RMED703', residentId: 7, medicationName: 'Tonaril', doseValue: '2', doseUnit: 'Mg', schedules: [{ time: '16:00', quantity: 0.5, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Hospital', deliveryDate: '2025-11-30' },
    { id: 'RMED704', residentId: 7, medicationName: 'Atorvastatina', doseValue: '20', doseUnit: 'Mg', schedules: [{ time: '20:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2025-12-02' },
    { id: 'RMED705', residentId: 7, medicationName: 'Quetiapina', doseValue: '25', doseUnit: 'Mg', schedules: [{ time: '20:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Hospital', deliveryDate: '2025-11-30' },
    { id: 'RMED706', residentId: 7, medicationName: 'Modecate Inyectable', doseValue: '25', doseUnit: 'Mg/ml', schedules: [], stock: 0, stockUnit: 'N/A', provenance: 'Hospital', deliveryDate: '2025-11-30' },

    // 8. Patricia Vivian De la Fuente Soto
    { id: 'RMED801', residentId: 8, medicationName: 'Duloxetina', doseValue: '60', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Salud Mental', deliveryDate: '2025-11-27' },
    { id: 'RMED802', residentId: 8, medicationName: 'Escitalopram', doseValue: '20', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Salud Mental', deliveryDate: '2025-11-27' },
    { id: 'RMED803', residentId: 8, medicationName: 'Brimonidina', doseValue: '0.2', doseUnit: '%', schedules: [{ time: '08:00', quantity: 2, unit: 'Gotas' }], stock: 20, stockUnit: 'Gotas', provenance: 'CAE Viña', deliveryDate: '2025-11-27' },
    { id: 'RMED804', residentId: 8, medicationName: 'Clonazepam', doseValue: '0.5', doseUnit: 'Mg', schedules: [{ time: '16:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Salud Mental', deliveryDate: '2025-11-27' },
    { id: 'RMED805', residentId: 8, medicationName: 'Quetiapina', doseValue: '100', doseUnit: 'Mg', schedules: [{ time: '16:00', quantity: 0.5, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Salud Mental', deliveryDate: '2025-11-27' },
    { id: 'RMED806', residentId: 8, medicationName: 'Mirtazapina', doseValue: '30', doseUnit: 'Mg', schedules: [{ time: '20:00', quantity: 1.5, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Salud Mental', deliveryDate: '2025-11-27' },
    { id: 'RMED807', residentId: 8, medicationName: 'Carbonato de Litio', doseValue: '300', doseUnit: 'Mg', schedules: [{ time: '20:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Salud Mental', deliveryDate: '2025-11-27' },
    { id: 'RMED808', residentId: 8, medicationName: 'Clonazepam', doseValue: '0.5', doseUnit: 'Mg', schedules: [{ time: '20:00', quantity: 2, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Salud Mental', deliveryDate: '2025-11-27' },
    { id: 'RMED809', residentId: 8, medicationName: 'Quetiapina', doseValue: '100', doseUnit: 'Mg', schedules: [{ time: '20:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Salud Mental', deliveryDate: '2025-11-27' },
    { id: 'RMED810', residentId: 8, medicationName: 'Brimonidina', doseValue: '0.2', doseUnit: '%', schedules: [{ time: '20:00', quantity: 2, unit: 'Gotas' }], stock: 20, stockUnit: 'Gotas', provenance: 'CAE Viña', deliveryDate: '2025-11-27' },
    { id: 'RMED811', residentId: 8, medicationName: 'Latanoprost', doseValue: '50', doseUnit: 'Mg/ml', schedules: [{ time: '20:00', quantity: 2, unit: 'Gotas' }], stock: 20, stockUnit: 'Gotas', provenance: 'CAE Viña', deliveryDate: '2025-11-27' },

    // 9. Celia Ester Caneleo Figueroa
    { id: 'RMED901', residentId: 9, medicationName: 'Metformina', doseValue: '850', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2025-12-02' },
    { id: 'RMED902', residentId: 9, medicationName: 'Losartán', doseValue: '50', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2025-12-02' },
    { id: 'RMED903', residentId: 9, medicationName: 'Hidroclorotiazida', doseValue: '50', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2025-12-02' },
    { id: 'RMED904', residentId: 9, medicationName: 'Brexotide', doseValue: 'N/A', doseUnit: '', schedules: [{ time: '09:00', quantity: 2, unit: 'Puff' }], stock: 100, stockUnit: 'Puff', provenance: 'Compras' },
    { id: 'RMED905', residentId: 9, medicationName: 'Bromuro Ipatropio', doseValue: 'N/A', doseUnit: '', schedules: [{ time: '09:00', quantity: 2, unit: 'Puff' }], stock: 100, stockUnit: 'Puff', provenance: 'Compras' },
    { id: 'RMED906', residentId: 9, medicationName: 'Bromuro Ipatropio', doseValue: 'N/A', doseUnit: '', schedules: [{ time: '16:00', quantity: 2, unit: 'Puff' }], stock: 100, stockUnit: 'Puff', provenance: 'Compras' },
    { id: 'RMED907', residentId: 9, medicationName: 'Metformina', doseValue: '850', doseUnit: 'Mg', schedules: [{ time: '20:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2025-12-02' },
    { id: 'RMED908', residentId: 9, medicationName: 'Losartán', doseValue: '50', doseUnit: 'Mg', schedules: [{ time: '20:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2025-12-02' },
    { id: 'RMED909', residentId: 9, medicationName: 'Amlodipino', doseValue: '5', doseUnit: 'Mg', schedules: [{ time: '20:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2025-12-02' },
    { id: 'RMED910', residentId: 9, medicationName: 'Trazodona', doseValue: '100', doseUnit: 'Mg', schedules: [{ time: '20:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Compras' },
    { id: 'RMED911', residentId: 9, medicationName: 'Zopiclona', doseValue: '7.5', doseUnit: 'Mg', schedules: [{ time: '20:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Compras' },
    { id: 'RMED912', residentId: 9, medicationName: 'Brexotide', doseValue: 'N/A', doseUnit: '', schedules: [{ time: '20:00', quantity: 2, unit: 'Puff' }], stock: 100, stockUnit: 'Puff', provenance: 'Compras' },
    { id: 'RMED913', residentId: 9, medicationName: 'Bromuro Ipatropio', doseValue: 'N/A', doseUnit: '', schedules: [{ time: '23:00', quantity: 2, unit: 'Puff' }], stock: 100, stockUnit: 'Puff', provenance: 'Compras' },

    // 10. Zulema Olimpia Peña Díaz
    { id: 'RMED1001', residentId: 10, medicationName: 'Olmesartán', doseValue: '40/12.5', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Familia', deliveryDate: '2025-11-25' },
    { id: 'RMED1002', residentId: 10, medicationName: 'Citalopram', doseValue: '20', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Familia', deliveryDate: '2025-11-25' },
    { id: 'RMED1003', residentId: 10, medicationName: 'Aripiprazol', doseValue: '15', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Familia', deliveryDate: '2025-11-25' },
    { id: 'RMED1004', residentId: 10, medicationName: 'Aspirina', doseValue: '100', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Familia', deliveryDate: '2025-11-25' },
    { id: 'RMED1005', residentId: 10, medicationName: 'Memantina', doseValue: '10', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Familia', deliveryDate: '2025-11-25' },
    { id: 'RMED1006', residentId: 10, medicationName: 'Amlodipino', doseValue: '10', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Familia', deliveryDate: '2025-11-25' },
    { id: 'RMED1007', residentId: 10, medicationName: 'Donepezilo', doseValue: '10', doseUnit: 'Mg', schedules: [{ time: '20:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Familia', deliveryDate: '2025-11-25' },
    { id: 'RMED1008', residentId: 10, medicationName: 'Quetiapina', doseValue: '25', doseUnit: 'Mg', schedules: [{ time: '20:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Familia', deliveryDate: '2025-11-25' },
    { id: 'RMED1009', residentId: 10, medicationName: 'Memantina', doseValue: '10', doseUnit: 'Mg', schedules: [{ time: '20:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Familia', deliveryDate: '2025-11-25' },
    { id: 'RMED1010', residentId: 10, medicationName: 'Captopril (SOS)', doseValue: '50', doseUnit: 'Mg', schedules: [], stock: 30, stockUnit: 'Comp', provenance: 'Familia', deliveryDate: '2025-11-25' },

    // 11. María Jiménez Torrejón
    { id: 'RMED1101', residentId: 11, medicationName: 'Eutirox', doseValue: '100', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 0.75, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2025-12-02' },
    { id: 'RMED1102', residentId: 11, medicationName: 'Losartán', doseValue: '50', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2025-12-02' },
    { id: 'RMED1103', residentId: 11, medicationName: 'Astrocledine', doseValue: '50', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Compras' },
    { id: 'RMED1104', residentId: 11, medicationName: 'Losartán', doseValue: '50', doseUnit: 'Mg', schedules: [{ time: '20:00', quantity: 0.5, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2025-12-02' },
    { id: 'RMED1105', residentId: 11, medicationName: 'Amlodipino', doseValue: '5', doseUnit: 'Mg', schedules: [{ time: '20:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2025-12-02' },
    { id: 'RMED1106', residentId: 11, medicationName: 'Quetiapina', doseValue: '100', doseUnit: 'Mg', schedules: [{ time: '20:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2025-12-02' },
    { id: 'RMED1107', residentId: 11, medicationName: 'Clonazepam', doseValue: '2', doseUnit: 'Mg', schedules: [{ time: '20:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Compras' },

    // 12. Nancy Flores Sánchez
    { id: 'RMED1201', residentId: 12, medicationName: 'Valsartán', doseValue: '160', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Familia', deliveryDate: '2025-12-15' },
    { id: 'RMED1202', residentId: 12, medicationName: 'Aspirina', doseValue: '100', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Familia', deliveryDate: '2025-12-15' },
    { id: 'RMED1203', residentId: 12, medicationName: 'Escitalopram', doseValue: '20', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Familia', deliveryDate: '2025-12-15' },
    { id: 'RMED1204', residentId: 12, medicationName: 'Paracetamol', doseValue: '500', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 2, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Familia', deliveryDate: '2025-12-15' },
    { id: 'RMED1205', residentId: 12, medicationName: 'Quetiapina', doseValue: '25', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Familia', deliveryDate: '2025-12-15' },
    { id: 'RMED1206', residentId: 12, medicationName: 'Paracetamol', doseValue: '500', doseUnit: 'Mg', schedules: [{ time: '20:00', quantity: 2, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Familia', deliveryDate: '2025-12-15' },
    { id: 'RMED1207', residentId: 12, medicationName: 'Quetiapina', doseValue: '25', doseUnit: 'Mg', schedules: [{ time: '20:00', quantity: 4, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Familia', deliveryDate: '2025-12-15' },
    { id: 'RMED1208', residentId: 12, medicationName: 'Clonazepam', doseValue: '0.5', doseUnit: 'Mg', schedules: [{ time: '20:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Familia', deliveryDate: '2025-12-15' },
    { id: 'RMED1209', residentId: 12, medicationName: 'Zopiclona', doseValue: '7.5', doseUnit: 'Mg', schedules: [{ time: '20:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Familia', deliveryDate: '2025-12-15' },
    { id: 'RMED1210', residentId: 12, medicationName: 'Risperidona (SOS)', doseValue: '1', doseUnit: 'Mg', schedules: [], stock: 30, stockUnit: 'Comp', provenance: 'Familia', deliveryDate: '2025-12-15' },
    { id: 'RMED1211', residentId: 12, medicationName: 'Tramadol (SOS)', doseValue: '100', doseUnit: 'Mg/ml', schedules: [], stock: 80, stockUnit: 'Gotas', provenance: 'Familia', deliveryDate: '2025-12-15' },
    { id: 'RMED1212', residentId: 12, medicationName: 'Captopril (SOS)', doseValue: '50', doseUnit: 'Mg', schedules: [], stock: 30, stockUnit: 'Comp', provenance: 'Familia', deliveryDate: '2025-12-15' },

    // 13. Myriam Jeanette Silva Jara
    { id: 'RMED1301', residentId: 13, medicationName: 'Losartán', doseValue: '50', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Salud Mental', deliveryDate: '2025-11-27' },
    { id: 'RMED1302', residentId: 13, medicationName: 'Ácido Valproico', doseValue: '250', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 0.5, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Salud Mental', deliveryDate: '2025-11-27' },
    { id: 'RMED1303', residentId: 13, medicationName: 'Omeprazol', doseValue: '20', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Salud Mental', deliveryDate: '2025-11-27' },
    { id: 'RMED1304', residentId: 13, medicationName: 'Fluoxetina', doseValue: '20', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 2, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Salud Mental', deliveryDate: '2025-11-27' },
    { id: 'RMED1305', residentId: 13, medicationName: 'Olanzapina', doseValue: '10', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Salud Mental', deliveryDate: '2025-11-27' },
    { id: 'RMED1306', residentId: 13, medicationName: 'Risperidona', doseValue: '3', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 0.5, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Salud Mental', deliveryDate: '2025-11-27' },
    { id: 'RMED1307', residentId: 13, medicationName: 'Metformina', doseValue: '850', doseUnit: 'Mg', schedules: [{ time: '13:00', quantity: 0.5, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Salud Mental', deliveryDate: '2025-11-27' },
    { id: 'RMED1308', residentId: 13, medicationName: 'Atorvastatina', doseValue: '20', doseUnit: 'Mg', schedules: [{ time: '20:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Salud Mental', deliveryDate: '2025-11-27' },
    { id: 'RMED1309', residentId: 13, medicationName: 'Ácido Valproico', doseValue: '250', doseUnit: 'Mg', schedules: [{ time: '20:00', quantity: 0.5, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Salud Mental', deliveryDate: '2025-11-27' },
    { id: 'RMED1310', residentId: 13, medicationName: 'Olanzapina', doseValue: '10', doseUnit: 'Mg', schedules: [{ time: '20:00', quantity: 2, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Salud Mental', deliveryDate: '2025-11-27' },
    { id: 'RMED1311', residentId: 13, medicationName: 'Risperidona', doseValue: '3', doseUnit: 'Mg', schedules: [{ time: '23:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Salud Mental', deliveryDate: '2025-11-27' },
    { id: 'RMED1312', residentId: 13, medicationName: 'Quetiapina', doseValue: '100', doseUnit: 'Mg', schedules: [{ time: '23:00', quantity: 2, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Salud Mental', deliveryDate: '2025-11-27' },
    { id: 'RMED1313', residentId: 13, medicationName: 'Trazodona', doseValue: '100', doseUnit: 'Mg', schedules: [{ time: '23:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Salud Mental', deliveryDate: '2025-11-27' },
    { id: 'RMED1314', residentId: 13, medicationName: 'Diazepam', doseValue: '10', doseUnit: 'Mg', schedules: [{ time: '23:00', quantity: 0.5, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Salud Mental', deliveryDate: '2025-11-27' },

    // 14. Gladys Nelsa Del Carmen Arellano Pavez
    { id: 'RMED1401', residentId: 14, medicationName: 'Tellmi-D', doseValue: '40/12.5', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2025-12-02' },
    { id: 'RMED1402', residentId: 14, medicationName: 'Memantina', doseValue: '10', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2025-12-02' },
    { id: 'RMED1403', residentId: 14, medicationName: 'Primidona', doseValue: '50', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2025-12-02' },
    { id: 'RMED1404', residentId: 14, medicationName: 'Quetiapina', doseValue: '25', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2025-12-02' },
    { id: 'RMED1405', residentId: 14, medicationName: 'Alopurinol', doseValue: '300', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 0.5, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2025-12-02' },
    { id: 'RMED1406', residentId: 14, medicationName: 'Trazodona', doseValue: '100', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 0.5, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2025-12-02' },
    { id: 'RMED1407', residentId: 14, medicationName: 'Venlafaxina', doseValue: '75', doseUnit: 'Mg', schedules: [{ time: '13:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2025-12-02' },
    { id: 'RMED1408', residentId: 14, medicationName: 'Primidona', doseValue: '50', doseUnit: 'Mg', schedules: [{ time: '16:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2025-12-02' },
    { id: 'RMED1409', residentId: 14, medicationName: 'Quetiapina', doseValue: '25', doseUnit: 'Mg', schedules: [{ time: '20:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2025-12-02' },
    { id: 'RMED1410', residentId: 14, medicationName: 'Trazodona', doseValue: '100', doseUnit: 'Mg', schedules: [{ time: '20:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2025-12-02' },
    { id: 'RMED1411', residentId: 14, medicationName: 'Primidona', doseValue: '50', doseUnit: 'Mg', schedules: [{ time: '23:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2025-12-02' },
    { id: 'RMED1412', residentId: 14, medicationName: 'Risperidona (SOS)', doseValue: '1', doseUnit: 'Mg/ml', schedules: [], stock: 80, stockUnit: 'Gotas', provenance: 'Cesfam', deliveryDate: '2025-12-02' },

    // 15. Genoveva Del Carmen Sáez Hernández
    { id: 'RMED1501', residentId: 15, medicationName: 'Losartán', doseValue: '50', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2025-12-02' },
    { id: 'RMED1502', residentId: 15, medicationName: 'Lactulosa', doseValue: '10', doseUnit: 'cc', schedules: [{ time: '08:00', quantity: 10, unit: 'cc' }], stock: 250, stockUnit: 'cc', provenance: 'Compras' },
    { id: 'RMED1503', residentId: 15, medicationName: 'Sertralina', doseValue: '50', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2025-12-02' },
    { id: 'RMED1504', residentId: 15, medicationName: 'Memantina', doseValue: '20', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Compras' },
    { id: 'RMED1505', residentId: 15, medicationName: 'Aripiprazol', doseValue: '10', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Compras' },
    { id: 'RMED1506', residentId: 15, medicationName: 'Vitamina D 800', doseValue: '20', doseUnit: 'Mcg', schedules: [{ time: '13:00', quantity: 4, unit: 'Gotas' }], stock: 40, stockUnit: 'Gotas', provenance: 'Compras' },
    { id: 'RMED1507', residentId: 15, medicationName: 'Trazodona', doseValue: '25', doseUnit: 'Mg', schedules: [{ time: '20:00', quantity: 2, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2025-12-02' },
    { id: 'RMED1508', residentId: 15, medicationName: 'Quetiapina', doseValue: '100', doseUnit: 'Mg', schedules: [{ time: '20:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2025-12-02' },

    // 16. Rita Del Carmen Torres Briceño
    { id: 'RMED1601', residentId: 16, medicationName: 'Levotiroxina (Lun-Sáb)', doseValue: '100', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 0.5, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2025-12-02' },
    { id: 'RMED1602', residentId: 16, medicationName: 'Levotiroxina (Domingo)', doseValue: '100', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2025-12-02' },
    { id: 'RMED1603', residentId: 16, medicationName: 'Risperidona', doseValue: '3', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 0.5, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Hospital', deliveryDate: '2025-11-30' },
    { id: 'RMED1604', residentId: 16, medicationName: 'Escitalopram', doseValue: '10', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2025-12-02' },
    { id: 'RMED1605', residentId: 16, medicationName: 'Tonaril', doseValue: '2', doseUnit: 'Mg', schedules: [{ time: '08:00', quantity: 0.5, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Hospital', deliveryDate: '2025-11-30' },
    { id: 'RMED1606', residentId: 16, medicationName: 'Tolterodina', doseValue: '2', doseUnit: 'Mg', schedules: [{ time: '13:00', quantity: 1, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Hospital', deliveryDate: '2025-11-30' },
    { id: 'RMED1607', residentId: 16, medicationName: 'Tonaril', doseValue: '2', doseUnit: 'Mg', schedules: [{ time: '20:00', quantity: 0.5, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Hospital', deliveryDate: '2025-11-30' },
    { id: 'RMED1608', residentId: 16, medicationName: 'Risperidona', doseValue: '3', doseUnit: 'Mg', schedules: [{ time: '20:00', quantity: 0.5, unit: 'Comp' }], stock: 30, stockUnit: 'Comp', provenance: 'Hospital', deliveryDate: '2025-11-30' },
    { id: 'RMED1609', residentId: 16, medicationName: 'Quetiapina (SOS)', doseValue: '25', doseUnit: 'Mg', schedules: [], stock: 30, stockUnit: 'Comp', provenance: 'Hospital', deliveryDate: '2025-11-30' },
];


export const MOCK_PURCHASES_DATA = [
  { name: 'Enero', 'Costo Total': 4000 },
  { name: 'Febrero', 'Costo Total': 3000 },
  { name: 'Marzo', 'Costo Total': 5000 },
  { name: 'Abril', 'Costo Total': 4500 },
  { name: 'Mayo', 'Costo Total': 6000 },
  { name: 'Junio', 'Costo Total': 5500 },
];


export const ROLE_PANELS: Record<UserRole, Panel[]> = {
  [UserRole.Admin]: [
    Panel.Dashboard,
    Panel.Residents,
    Panel.GeneralInventory,
    Panel.SummaryCesfam,
    Panel.SummaryIndividualStock,
    Panel.SummaryMentalHealth, // New
    Panel.SummaryPurchases,    // New
    Panel.AdminApp,
  ],
  [UserRole.Director]: [
    Panel.Dashboard,
    Panel.Residents,
    Panel.GeneralInventory,
    Panel.SummaryCesfam,
    Panel.SummaryIndividualStock,
  ],
  [UserRole.Tens]: [
    Panel.Dashboard,
    Panel.Residents,
    Panel.GeneralInventory,
    Panel.SummaryCesfam,
    Panel.SummaryIndividualStock,
  ],
  [UserRole.Visitor]: [
    Panel.Dashboard,
    Panel.Residents,
  ],
};