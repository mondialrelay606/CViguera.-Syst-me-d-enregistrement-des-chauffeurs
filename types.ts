export interface Driver {
  id: string; // Barcode value
  name: string;
  company: string;
  password?: string; // Contraseña para el inicio de sesión
  vehiclePlate?: string; // Matrícula del vehículo
}

export interface AttendanceRecord {
  driver: Driver;
  checkinTime: Date;
  checkoutTime: Date | null;
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
    checkinTime: string;
    checkoutTime: string;
    duration: string;
}
