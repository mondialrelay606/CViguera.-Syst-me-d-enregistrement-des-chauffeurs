import { CheckinRecord, DailyStats } from '../types';

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

  let busiestHour = 'N/A';
  if (totalCheckins > 0) {
    const hours = todayRecords.map(r => r.timestamp.getHours());
    const hourCounts: { [key: number]: number } = {};
    let maxCount = 0;
    let bestHour = -1;

    for (const hour of hours) {
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      if (hourCounts[hour] > maxCount) {
        maxCount = hourCounts[hour];
        bestHour = hour;
      }
    }
    if (bestHour !== -1) {
        const nextHour = bestHour + 1;
        busiestHour = `${bestHour.toString().padStart(2, '0')}:00 - ${nextHour.toString().padStart(2, '0')}:00`;
    }
  }

  return {
    totalCheckins,
    uniqueDrivers,
    busiestHour,
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
