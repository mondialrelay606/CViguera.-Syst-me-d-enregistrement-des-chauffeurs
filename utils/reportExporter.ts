import { ReturnReport } from '../types';

/**
 * Genera un string CSV a partir de una lista de reportes, detallando cada incidencia en una nueva fila.
 * @param reports - La lista de reportes a exportar.
 * @param filename - El nombre del archivo CSV a generar.
 */
export const exportReportsToCSV = (reports: ReturnReport[], filename: string = 'reportes.csv'): void => {
    if (reports.length === 0) {
        alert('No hay reportes para exportar.');
        return;
    }

    const headers = [
        'Fecha Reporte', 
        'Nombre Chofer', 
        'Subcontratista', 
        'Lettre de Voiture - Tampon', 
        'Lettre de Voiture - Horaire', 
        'Tipo Incidencia', 
        'Detalle (Locker/PUDO)', 
        'Razón Cierre', 
        'Nº Sacos', 
        'Nº Vracs',
        'Notas Adicionales'
    ];
    
    const rows: (string | number | boolean)[][] = [];

    for (const report of reports) {
        const baseRow = [
            new Date(report.reportDate).toLocaleString('es-ES'),
            report.driverName,
            report.subcontractor,
            report.lettreDeVoiture.tamponDuRelais,
            report.lettreDeVoiture.horaireDePassageLocker,
        ];
        
        let hasIncidents = false;

        report.saturationLockers?.forEach(item => {
            rows.push([
                ...baseRow, 
                'Saturation Locker', 
                item.lockerName, 
                '', // Razón Cierre N/A
                item.sacs, 
                item.vracs,
                report.notes || '' // Incluir notas en la primera incidencia
            ]);
            hasIncidents = true;
        });

        report.livraisonsManquantes?.forEach(item => {
            rows.push([
                ...baseRow, 
                'Livraison Manquante', 
                item.pudoApmName, 
                '', // Razón Cierre N/A
                item.sacs, 
                item.vracs,
                report.notes || ''
            ]);
            hasIncidents = true;
        });

        report.pudosApmFermes?.forEach(item => {
            rows.push([
                ...baseRow,
                'PUDO/APM Fermé',
                item.pudoApmName,
                item.reason,
                '', // Sacos N/A
                '', // Vracs N/A
                report.notes || ''
            ]);
            hasIncidents = true;
        });
        
        // Si no hay incidencias específicas pero hay notas, añadir una fila para las notas
        if (!hasIncidents && report.notes) {
             rows.push([
                ...baseRow,
                'Notas',
                '', '', '', '', // Campos de incidencia vacíos
                report.notes
            ]);
        } else if (!hasIncidents && !report.notes) {
            // Caso de un reporte vacío (solo info de lettre de voiture)
             rows.push([
                ...baseRow,
                'Sin Incidencias',
                '', '', '', '', ''
            ]);
        }
    }

    let csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(',') + '\n' 
        + rows.map(e => e.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);
};
