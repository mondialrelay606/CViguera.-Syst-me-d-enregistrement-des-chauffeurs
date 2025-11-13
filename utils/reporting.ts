import { CheckinRecord, DailyStats, CheckinType, ReturnReport, PudoApmFermeReason } from '../types';
import { isToday } from './dateUtils';

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
 * Récupère les pointages de départ des chauffeurs qui ne sont pas encore revenus aujourd'hui.
 */
export const getPendingReturnCheckins = (records: CheckinRecord[]): CheckinRecord[] => {
    const todayRecords = records.filter(r => isToday(r.timestamp));
    const sortedTodayRecords = todayRecords.slice().sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const driverLastStatus: { [driverId: string]: { lastAction: CheckinType, record: CheckinRecord } } = {};

    for (const record of sortedTodayRecords) {
        driverLastStatus[record.driver.id] = { lastAction: record.type, record: record };
    }

    const pendingDriversRecords: CheckinRecord[] = [];
    for (const driverId in driverLastStatus) {
        if (driverLastStatus[driverId].lastAction === CheckinType.DEPARTURE) {
            pendingDriversRecords.push(driverLastStatus[driverId].record);
        }
    }

    return pendingDriversRecords;
};

/**
 * Calcule toutes les données analytiques nécessaires pour le tableau de bord.
 * @param records - Tous les enregistrements de pointage.
 * @param reports - Tous les rapports de retour.
 * @returns Un objet contenant toutes les données prétraitées pour les graphiques.
 */
export const calculateDashboardAnalytics = (records: CheckinRecord[], reports: ReturnReport[]) => {
    const todayRecords = records.filter(r => isToday(r.timestamp));
    const todayReports = reports.filter(r => isToday(new Date(r.reportDate)));

    // 1. Distribution horaire
    const hourlyDistribution = Array(24).fill(0);
    todayRecords.forEach(record => {
        const hour = record.timestamp.getHours();
        hourlyDistribution[hour]++;
    });

    // 2. Incidents par sous-traitant
    const incidentsBySubcontractor: { [key: string]: { name: string, Saturation: number, Manquante: number, Fermé: number } } = {};
    todayReports.forEach(r => {
        if (!incidentsBySubcontractor[r.subcontractor]) {
            incidentsBySubcontractor[r.subcontractor] = { name: r.subcontractor, Saturation: 0, Manquante: 0, Fermé: 0 };
        }
        incidentsBySubcontractor[r.subcontractor].Saturation += r.saturationLockers?.length || 0;
        incidentsBySubcontractor[r.subcontractor].Manquante += r.livraisonsManquantes?.length || 0;
        incidentsBySubcontractor[r.subcontractor].Fermé += r.pudosApmFermes?.length || 0;
    });

    // 3. Analyse de conformité
    const totalReports = todayReports.length;
    const tamponOui = todayReports.filter(r => r.lettreDeVoiture.tamponDuRelais).length;
    const horaireOui = todayReports.filter(r => r.lettreDeVoiture.horaireDePassageLocker).length;
    const complianceData = {
        tampon: [
            { name: 'Conforme', value: tamponOui },
            { name: 'Non Conforme', value: totalReports - tamponOui },
        ],
        horaire: [
             { name: 'Conforme', value: horaireOui },
            { name: 'Non Conforme', value: totalReports - horaireOui },
        ]
    };

    // 4. Top 5 PUDOs/Casiers à problèmes
    const pudoCounts: { [key: string]: number } = {};
    todayReports.forEach(r => {
        (r.saturationLockers || []).forEach(item => { pudoCounts[item.lockerName] = (pudoCounts[item.lockerName] || 0) + 1; });
        (r.livraisonsManquantes || []).forEach(item => { pudoCounts[item.pudoApmName] = (pudoCounts[item.pudoApmName] || 0) + 1; });
        (r.pudosApmFermes || []).forEach(item => { pudoCounts[item.pudoApmName] = (pudoCounts[item.pudoApmName] || 0) + 1; });
    });
    const topPudos = Object.entries(pudoCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    // 5. Top 5 Chauffeurs par incidents
    const incidentsByDriver: { [key: string]: number } = {};
    todayReports.forEach(r => {
        const incidentCount = (r.saturationLockers?.length || 0) + (r.livraisonsManquantes?.length || 0) + (r.pudosApmFermes?.length || 0);
        if (incidentCount > 0) {
            incidentsByDriver[r.driverName] = (incidentsByDriver[r.driverName] || 0) + incidentCount;
        }
    });
     const topDrivers = Object.entries(incidentsByDriver)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    // 6. Analyse des fermetures
    const reasonCounts: { [key: string]: number } = {};
    todayReports.forEach(r => {
        (r.pudosApmFermes || []).forEach(item => {
            reasonCounts[item.reason] = (reasonCounts[item.reason] || 0) + 1;
        });
    });
    const closureReasons = Object.entries(reasonCounts)
        .map(([name, value]) => ({ name, value }));


    return {
        hourlyDistributionData: hourlyDistribution.map((count, hour) => ({ hour: `${hour.toString().padStart(2, '0')}:00`, count })),
        incidentsBySubcontractorData: Object.values(incidentsBySubcontractor),
        complianceData,
        topPudosData: topPudos,
        topDriversData: topDrivers,
        closureReasonsData: closureReasons,
    };
};