import { ReturnReport, CheckinRecord, CheckinType } from '../types';

// Declaraciones para que TypeScript reconozca las bibliotecas globales
declare var XLSX: any;
declare var saveAs: any;

/**
 * Exporta una lista de reportes a un archivo Excel (.xlsx) con formato.
 * @param reports - La lista de reportes a exportar.
 * @param filename - El nombre del archivo .xlsx a generar.
 */
export const exportReportsToExcel = (reports: ReturnReport[], filename: string = 'rapports.xlsx'): void => {
    if (reports.length === 0) {
        alert("Il n'y a pas de rapports à exporter.");
        return;
    }

    const headers = [
        'Date Rapport', 
        'Nom Chauffeur', 
        'Sous-traitant', 
        'Lettre de Voiture - Tampon', 
        'Lettre de Voiture - Horaire', 
        'Type Incident', 
        'Détail (Casier/PUDO)', 
        'Raison Fermeture', 
        'Nº Sacs', 
        'Nº Vracs',
        'Notes Supplémentaires'
    ];
    
    const data: any[][] = [];

    for (const report of reports) {
        const baseRow = [
            new Date(report.reportDate).toLocaleString('fr-FR'),
            report.driverName,
            report.subcontractor,
            report.lettreDeVoiture.tamponDuRelais ? 'Oui' : 'Non',
            report.lettreDeVoiture.horaireDePassageLocker ? 'Oui' : 'Non',
        ];
        
        let hasIncidents = false;
        const notes = report.notes || ''; // Usar notas en la primera línea de incidencia de un reporte

        (report.saturationLockers || []).forEach((item, index) => {
            data.push([...baseRow, 'Saturation Casier', item.lockerName, '', item.sacs, item.vracs, index === 0 ? notes : '']);
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
             data.push([...baseRow, 'Aucun Incident', '', '', '', '', notes]);
        }
    }
    
    // Crear la hoja de cálculo
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

    // --- Aplicar Formato ---
    const headerStyle = {
        fill: { fgColor: { rgb: "FF4F81BD" } },
        font: { color: { rgb: "FFFFFFFF" }, bold: true, sz: 12 },
        alignment: { horizontal: "center", vertical: "center" }
    };

    const colWidths = headers.map((_, i) => ({
        wch: Math.max(
            headers[i].length,
            ...data.map(row => (row[i] ? String(row[i]).length : 0))
        ) + 2
    }));
    ws['!cols'] = colWidths;

    const headerRange = XLSX.utils.decode_range(ws['!ref']);
    for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
        const address = XLSX.utils.encode_cell({ r: 0, c: C });
        if (!ws[address]) continue;
        ws[address].s = headerStyle;
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rapports');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });

    function s2ab(s: string) {
        const buf = new ArrayBuffer(s.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
    }

    saveAs(new Blob([s2ab(wbout)], { type: "application/octet-stream" }), filename);
};

/**
 * Exporta los registros de fichaje a un archivo Excel (.xlsx) con formato.
 * @param records - La lista de fichajes a exportar.
 * @param filename - El nombre del archivo .xlsx a generar.
 */
export const exportCheckinsToExcel = (records: CheckinRecord[], filename: string = 'pointages.xlsx'): void => {
  if (records.length === 0) {
    alert("Il n'y a pas d'enregistrements à exporter.");
    return;
  }

  const headers = ['Heure d\'Entrée', 'Nom du Chauffeur', 'Sous-traitant', 'Tournée', 'Tenue', 'Commentaire', 'Identifiant', 'Téléphone', 'Type de Mouvement'];
  
  const data = records.map(record => {
    const uniformStatus = record.type === CheckinType.DEPARTURE 
        ? (record.hasUniform ? 'Oui' : 'Non') 
        : 'N/A';

    return [
      record.timestamp.toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }),
      record.driver.name,
      record.driver.subcontractor,
      record.driver.tour,
      uniformStatus,
      record.departureComment || '',
      record.driver.id,
      record.driver.telephone,
      record.type
    ];
  });

  const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

  const headerStyle = {
      fill: { fgColor: { rgb: "FF4F81BD" } },
      font: { color: { rgb: "FFFFFFFF" }, bold: true, sz: 12 },
      alignment: { horizontal: "center", vertical: "center" }
  };

  const colWidths = headers.map((_, i) => ({
      wch: Math.max(
          headers[i].length,
          ...data.map(row => (row[i] ? String(row[i]).length : 0))
      ) + 2
  }));

  ws['!cols'] = colWidths;

  const headerRange = XLSX.utils.decode_range(ws['!ref']);
  for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
      const address = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!ws[address]) continue;
      ws[address].s = headerStyle;
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Pointages');

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });

  function s2ab(s: string) {
      const buf = new ArrayBuffer(s.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
      return buf;
  }

  saveAs(new Blob([s2ab(wbout)], { type: "application/octet-stream" }), filename);
};