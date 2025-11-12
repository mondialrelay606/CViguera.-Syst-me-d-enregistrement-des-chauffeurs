export interface Driver {
  id: string; // Barcode value
  name: string;
  company: string;
}

export interface CheckinRecord {
  driver: Driver;
  timestamp: Date;
}

export enum ScanStatus {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  IDLE = 'IDLE',
}

export interface ScanResult {
  status: ScanStatus;
  message: string;
}

export interface DailyStats {
    totalCheckins: number;
    uniqueDrivers: number;
    busiestHour: string;
}
