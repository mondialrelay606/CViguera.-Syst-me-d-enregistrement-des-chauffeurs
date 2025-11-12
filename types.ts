export interface Driver {
  id: string; // Identifiant
  name: string; // Nom
  subcontractor: string; // Sous-traitant
  plate: string; // Plaque
  tour: string; // Tournée
  telephone: string; // Telephone
}

export enum CheckinType {
  DEPARTURE = 'Départ Chauffeur',
  RETURN = 'Retour Tournée',
}

export interface CheckinRecord {
  driver: Driver;
  timestamp: Date;
  type: CheckinType;
  hasUniform?: boolean; // Campo para el estado del uniforme
}

export enum PudoApmFermeReason {
    CIERRE_SALVAJE = 'Cierre salvaje',
    PANNE = 'Panne',
}

export interface ReturnReport {
    id: string; // Basado en el timestamp del reporte
    checkinId: string; // Para vincular con el fichaje original (driver.id + timestamp)
    driverId: string;
    driverName: string;
    subcontractor: string;
    reportDate: string;
    lettreDeVoiture: {
        tamponDuRelais: boolean;
        horaireDePassageLocker: boolean;
    };
    saturationLockers?: {
        lockerName: string;
        sacs: number;
        vracs: number;
    }[];
    livraisonsManquantes?: {
        pudoApmName: string;
        sacs: number;
        vracs: number;
    }[];
    pudosApmFermes?: {
        pudoApmName: string;
        reason: PudoApmFermeReason;
    }[];
    notes?: string;
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
}
