export interface Driver {
  id: string; // Barcode value
  name: string;
  company: string;
  subcontractor?: string; // Compañía subcontratada
  vehiclePlate?: string; // Matrícula del vehículo
  route?: string; // Ruta asignada
}

export interface AttendanceRecord {
  id: string; // Unique ID for the record
  driver: Driver;
  checkinTime: Date;
  checkoutTime: Date | null;
  vehiclePlate?: string; // Matrícula usada para este fichaje
  departureNotes?: string; // Notas/instrucciones dadas al inicio del turno
  returnInfoCompleted: boolean;
}

export interface ReturnInfo {
    attendanceRecordId: string; // Links to the specific AttendanceRecord
    closedRelays: string;
    unidentifiedPackages: number;
    undeliveredPackages: number;
    saturatedLockers: string;
    notes?: string;
    recordedAt: Date;
}

export enum ScanStatus {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  INFO = 'INFO',
  IDLE = 'IDLE',
}

export interface ScanResult {
  status: ScanStatus;
  message: string;
}

export interface ReportRow {
    driverName: string;
    driverCompany: string;
    driverSubcontractor: string;
    checkinTime: string;
    checkoutTime: string;
    duration: string;
    vehiclePlate: string;
    route: string;
}

export interface DailyReportRow extends ReturnInfo {
    driverName: string;
    driverCompany: string;
    driverSubcontractor: string;
    checkinTime: Date;
    checkoutTime: Date | null;
}

export interface SubcontractorUser {
  username: string;
  password: string; // En una app real, esto debería estar hasheado.
  companyName: string; // Coincide con el campo 'subcontractor' en Driver
}
