import { ReturnReport } from '../types';

// Declaraciones para que TypeScript reconozca las bibliotecas globales
declare var XLSX: any;
declare var saveAs: any;

/**
 * Exporta una lista de reportes a un archivo Excel (.xlsx) con formato.
 * @param reports - La lista de reportes a exportar.
 * @param filename - El nombre del archivo .xlsx a generar.
 */
export const exportReportsToExcel = (reports: ReturnReport[], filename: string = 'reportes.xlsx'): void => {
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
    
    const data: any[][] = [];

    for (const report of reports) {
        const baseRow = [
            new Date(report.reportDate).toLocaleString('es-ES'),
            report.driverName,
            report.subcontractor,
            report.lettreDeVoiture.tamponDuRelais ? 'Sí' : 'No',
            report.lettreDeVoiture.horaireDePassageLocker ? 'Sí' : 'No',
        ];
        
        let hasIncidents = false;
        const notes = report.notes || ''; // Usar notas en la primera línea de incidencia de un reporte

        (report.saturationLockers || []).forEach((item, index) => {
            data.push([...baseRow, 'Saturation Locker', item.lockerName, '', item.sacs, item.vracs, index === 0 ? notes : '']);
            hasIncidents = true;
        });

        (report.livraisonsManquantes || []).forEach((item, index) => {
            data.push([...baseRow, 'Livraison Manquante', item.pudoApmName, '', item.sacs, item.vracs, !hasIncidents && index === 0 ? notes : '']);
            hasIncidents = true;
        });

        (report.pudosApmFermes || []).forEach((item, index) => {
            data.push([...baseRow, 'PUDO/APM Fermé', item.pudoApmName, item.reason, '', '', !hasIncidents && index === 0 ? notes : '']);
            hasIncidents = true;
        });
        
        if (!hasIncidents) {
             data.push([...baseRow, 'Sin Incidencias', '', '', '', '', notes]);
        }
    }
    
    // Crear la hoja de cálculo
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

    // --- Aplicar Formato ---

    // 1. Estilo para las cabeceras (fondo azul, texto blanco y negrita)
    const headerStyle = {
        fill: { fgColor: { rgb: "FF4F81BD" } }, // Color de fondo azul
        font: { color: { rgb: "FFFFFFFF" }, bold: true, sz: 12 },
        alignment: { horizontal: "center", vertical: "center" }
    };

    // 2. Calcular el ancho de las columnas
    const colWidths = headers.map((_, i) => ({
        wch: Math.max(
            headers[i].length,
            ...data.map(row => (row[i] ? String(row[i]).length : 0))
        ) + 2 // Añadir un poco de padding
    }));

    ws['!cols'] = colWidths;

    // 3. Aplicar el estilo a cada celda de la cabecera
    const headerRange = XLSX.utils.decode_range(ws['!ref']);
    for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
        const address = XLSX.utils.encode_cell({ r: 0, c: C });
        if (!ws[address]) continue;
        ws[address].s = headerStyle;
    }

    // Crear el libro de trabajo y añadir la hoja
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reportes');

    // Generar el archivo y descargarlo
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });

    function s2ab(s: string) {
        const buf = new ArrayBuffer(s.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
    }

    saveAs(new Blob([s2ab(wbout)], { type: "application/octet-stream" }), filename);
};
