import { CheckinRecord, DailyStats, CheckinType } from '../types';

/**
 * Comprueba si una fecha dada corresponde al día de hoy.
 */
const isToday = (someDate: Date): boolean => {
  const today = new Date();
  return someDate.getDate() === today.getDate() &&
    someDate.getMonth() === today.getMonth() &&
    someDate.getFullYear() === today.getFullYear();
};

/**
 * Calcula las estadísticas clave para los fichajes de hoy.
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
 * Genera la distribución de fichajes por hora para el día de hoy.
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
 * Obtiene los fichajes de salida de los choferes que aún no han regresado hoy.
 */
export const getPendingReturnCheckins = (records: CheckinRecord[]): CheckinRecord[] => {
    const todayRecords = records.filter(r => isToday(r.timestamp));

    // Ordenamos los registros del día de más antiguo a más reciente
    const sortedTodayRecords = todayRecords.slice().sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Usamos un mapa para registrar el último estado de cada chofer
    const driverLastStatus: { [driverId: string]: { lastAction: CheckinType, record: CheckinRecord } } = {};

    for (const record of sortedTodayRecords) {
        driverLastStatus[record.driver.id] = { lastAction: record.type, record: record };
    }

    // Filtramos para quedarnos solo con aquellos cuyo último estado es 'Départ'
    const pendingDriversRecords: CheckinRecord[] = [];
    for (const driverId in driverLastStatus) {
        if (driverLastStatus[driverId].lastAction === CheckinType.DEPARTURE) {
            pendingDriversRecords.push(driverLastStatus[driverId].record);
        }
    }

    return pendingDriversRecords;
};