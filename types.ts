export interface Driver {
  id: string; // ID Code-barres
  name: string; // Nom
  company: string; // Société
  subcontractor: string; // Sous-traitant
  defaultPlate: string; // Plaque par déf.
  tour: string; // Tournée
}

export enum CheckinType {
  DEPARTURE = 'Départ Chauffeur',
  RETURN = 'Retour Tournée',
}

export interface CheckinRecord {
  driver: Driver;
  timestamp: Date;
  type: CheckinType;
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