import { CheckinRecord, DailyStats, CheckinType } from '../types';

/**
 * Vérifie si une date donnée correspond à aujourd'hui.
 */
const isToday = (someDate: Date): boolean => {
  const today = new Date();
  return someDate.getDate() === today.getDate() &&
    someDate.getMonth() === today.getMonth() &&
    someDate.getFullYear() === today.getFullYear();
};

/**
 * Calcule les statistiques clés pour les pointages d'aujourd'hui.
 */
export const calculateDailyStats = (records: CheckinRecord[]): DailyStats => {
  const todayRecords = records.filter(r => isToday(r.timestamp));

  const totalCheckins = todayRecords.length;

  const uniqueDriverIds = new Set(todayRecords.map(r => r.driver.id));
  const uniqueDrivers = uniqueDriverIds.size;

  return {
    totalCheckins,
    uniqueDrivers,
  };
};

/**
 * Génère la distribution des pointages par heure pour aujourd'hui.
 */
export const getHourlyDistribution = (records: CheckinRecord[]): number[] => {
    const todayRecords = records.filter(r => isToday(r.timestamp));
    const distribution = Array(24).fill(0);

    todayRecords.forEach(record => {
        const hour = record.timestamp.getHours();
        distribution[hour]++;
    });

    return distribution;
};

/**
 * Récupère les pointages de départ des chauffeurs qui ne sont pas encore revenus aujourd'hui.
 */
export const getPendingReturnCheckins = (records: CheckinRecord[]): CheckinRecord[] => {
    const todayRecords = records.filter(r => isToday(r.timestamp));

    // Nous trions les enregistrements du jour du plus ancien au plus récent
    const sortedTodayRecords = todayRecords.slice().sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Nous utilisons une carte pour enregistrer le dernier état de chaque chauffeur
    const driverLastStatus: { [driverId: string]: { lastAction: CheckinType, record: CheckinRecord } } = {};

    for (const record of sortedTodayRecords) {
        driverLastStatus[record.driver.id] = { lastAction: record.type, record: record };
    }

    // Nous filtrons pour ne garder que ceux dont le dernier état est 'Départ'
    const pendingDriversRecords: CheckinRecord[] = [];
    for (const driverId in driverLastStatus) {
        if (driverLastStatus[driverId].lastAction === CheckinType.DEPARTURE) {
            pendingDriversRecords.push(driverLastStatus[driverId].record);
        }
    }

    return pendingDriversRecords;
};