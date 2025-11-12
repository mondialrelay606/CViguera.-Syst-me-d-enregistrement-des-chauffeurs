import { ReturnReport, CheckinRecord, CheckinType } from '../types';

// Declaraciones para que TypeScript reconozca las bibliotecas globales
declare var XLSX: any;
declare var saveAs: any;

/**
 * Crea una hoja de cálculo de "Tableau de Bord" con resúmenes y estadísticas.
 */
const createDashboardSheet = (reports: ReturnReport[]): any => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });

    if (reports.length === 0) {
        const ws = XLSX.utils.aoa_to_sheet([["Aucun rapport à analyser pour le " + formattedDate]]);
        return ws;
    }

    // --- 1. Procesamiento de Datos ---
    const incidentTypes = { saturation: 0, manquantes: 0, fermes: 0 };
    reports.forEach(r => {
        incidentTypes.saturation += r.saturationLockers?.length || 0;
        incidentTypes.manquantes += r.livraisonsManquantes?.length || 0;
        incidentTypes.fermes += r.pudosApmFermes?.length || 0;
    });
    const incidentTypeData = [
        ["Type d'Incident", "Nombre"],
        ["Saturation Casier", incidentTypes.saturation],
        ["Livraison Manquante", incidentTypes.manquantes],
        ["PUDO/APM Fermé", incidentTypes.fermes],
    ];

    const incidentsBySub: { [key: string]: number } = {};
    reports.forEach(r => {
        const incidentCount = (r.saturationLockers?.length || 0) + (r.livraisonsManquantes?.length || 0) + (r.pudosApmFermes?.length || 0);
        if (incidentCount > 0) {
            incidentsBySub[r.subcontractor] = (incidentsBySub[r.subcontractor] || 0) + incidentCount;
        }
    });
    const incidentsBySubData = [
        ["Sous-traitant", "Nombre d'Incidents"],
        ...Object.entries(incidentsBySub).sort((a, b) => b[1] - a[1])
    ];

    const totalReports = reports.length;
    const tamponOui = reports.filter(r => r.lettreDeVoiture.tamponDuRelais).length;
    const horaireOui = reports.filter(r => r.lettreDeVoiture.horaireDePassageLocker).length;
    const complianceData = [
        ["Item", "Oui", "Non", "% Conformité"],
        ["Tampon du Relais", tamponOui, totalReports - tamponOui, totalReports > 0 ? `${((tamponOui / totalReports) * 100).toFixed(1)}%` : 'N/A'],
        ["Horaire de Passage", horaireOui, totalReports - horaireOui, totalReports > 0 ? `${((horaireOui / totalReports) * 100).toFixed(1)}%` : 'N/A'],
    ];

    const pudoCounts: { [key: string]: number } = {};
    reports.forEach(r => {
        (r.saturationLockers || []).forEach(item => { pudoCounts[item.lockerName] = (pudoCounts[item.lockerName] || 0) + 1; });
        (r.livraisonsManquantes || []).forEach(item => { pudoCounts[item.pudoApmName] = (pudoCounts[item.pudoApmName] || 0) + 1; });
        (r.pudosApmFermes || []).forEach(item => { pudoCounts[item.pudoApmName] = (pudoCounts[item.pudoApmName] || 0) + 1; });
    });
    const topPudosData = [
        ["PUDO / Casier", "Nombre de Rapports"],
        ...Object.entries(pudoCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)
    ];
    
    let totalSacs = 0, totalVracs = 0;
    reports.forEach(r => {
        (r.saturationLockers || []).forEach(i => { totalSacs += i.sacs; totalVracs += i.vracs; });
        (r.livraisonsManquantes || []).forEach(i => { totalSacs += i.sacs; totalVracs += i.vracs; });
    });
    const sacsVracsData = [ ["Article", "Total"], ["Sacs", totalSacs], ["Vracs", totalVracs] ];

    // NOUVEAU: Top 5 Chauffeurs par incidents
    const incidentsByDriver: { [key: string]: number } = {};
    reports.forEach(r => {
        const incidentCount = (r.saturationLockers?.length || 0) + (r.livraisonsManquantes?.length || 0) + (r.pudosApmFermes?.length || 0);
        if (incidentCount > 0) {
            incidentsByDriver[r.driverName] = (incidentsByDriver[r.driverName] || 0) + incidentCount;
        }
    });
    const topDriversData = [
        ["Chauffeur", "Nombre d'Incidents"],
        ...Object.entries(incidentsByDriver).sort((a, b) => b[1] - a[1]).slice(0, 5)
    ];

    // NOUVEAU: Desglose de raisons de fermeture
    const reasonCounts: { [key: string]: number } = {};
    reports.forEach(r => {
        (r.pudosApmFermes || []).forEach(item => {
            reasonCounts[item.reason] = (reasonCounts[item.reason] || 0) + 1;
        });
    });
    const closureReasonsData = [
        ["Raison de Fermeture", "Nombre"],
        ...Object.entries(reasonCounts)
    ];

    // --- 2. Création de la Feuille de Calcul ---
    const ws = XLSX.utils.aoa_to_sheet([[`Tableau de Bord des Rapports de Retour - ${formattedDate}`]]);
    XLSX.utils.sheet_add_aoa(ws, [["Résumé des Incidents par Type"]], { origin: 'A3' });
    XLSX.utils.sheet_add_aoa(ws, incidentTypeData, { origin: 'A4' });
    XLSX.utils.sheet_add_aoa(ws, [["Conformité Lettre de Voiture"]], { origin: 'D3' });
    XLSX.utils.sheet_add_aoa(ws, complianceData, { origin: 'D4' });
    XLSX.utils.sheet_add_aoa(ws, [["Total des Articles Signalés"]], { origin: 'A10' });
    XLSX.utils.sheet_add_aoa(ws, sacsVracsData, { origin: 'A11' });
    XLSX.utils.sheet_add_aoa(ws, [["Incidents par Sous-traitant"]], { origin: 'A17' });
    XLSX.utils.sheet_add_aoa(ws, incidentsBySubData, { origin: 'A18' });
    XLSX.utils.sheet_add_aoa(ws, [["Top 5 PUDOs/Casiers avec Incidents"]], { origin: 'D10' });
    XLSX.utils.sheet_add_aoa(ws, topPudosData, { origin: 'D11' });
    XLSX.utils.sheet_add_aoa(ws, [["Top 5 Chauffeurs par Incidents"]], { origin: 'D18' });
    XLSX.utils.sheet_add_aoa(ws, topDriversData, { origin: 'D19' });
    XLSX.utils.sheet_add_aoa(ws, [["Analyse des Fermetures"]], { origin: 'A14' });
    XLSX.utils.sheet_add_aoa(ws, closureReasonsData, { origin: 'A15' });


    // --- 3. Style et Formatage ---
    const titleStyle = { font: { sz: 18, bold: true, color: { rgb: "FF9c0058" } }, alignment: { horizontal: "center" } };
    const sectionTitleStyle = { font: { sz: 14, bold: true, color: { rgb: "FF003366" } } };
    const headerStyle = { font: { bold: true, color: { rgb: "FF333333" } }, fill: { fgColor: { rgb: "FFDDEBF7" } }, border: { bottom: { style: "thin" } } };
    const cellBorder = { border: { top: { style: "thin", color: { rgb: "FFCCCCCC" } }, bottom: { style: "thin", color: { rgb: "FFCCCCCC" } }, left: { style: "thin", color: { rgb: "FFCCCCCC" } }, right: { style: "thin", color: { rgb: "FFCCCCCC" } } } };

    ws['A1'].s = titleStyle;
    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }];

    const sections = ['A3', 'D3', 'A10', 'A17', 'D10', 'D18', 'A14'];
    sections.forEach(cell => { if(ws[cell]) ws[cell].s = sectionTitleStyle; });
    
    const applyTableStyle = (origin: string, data: any[][]) => {
        if (!data || data.length === 0 || data[0].length === 0) return;
        const start = XLSX.utils.decode_cell(origin);
        for (let r = 0; r < data.length; r++) {
            for (let c = 0; c < data[0].length; c++) {
                const cellRef = XLSX.utils.encode_cell({ r: start.r + r, c: start.c + c });
                const cell = ws[cellRef];
                if (cell) {
                    cell.s = r === 0 ? headerStyle : { ...cell.s, ...cellBorder };
                }
            }
        }
    };
    applyTableStyle('A4', incidentTypeData);
    applyTableStyle('D4', complianceData);
    applyTableStyle('A11', sacsVracsData);
    applyTableStyle('A18', incidentsBySubData);
    applyTableStyle('D11', topPudosData);
    applyTableStyle('D19', topDriversData);
    applyTableStyle('A15', closureReasonsData);

    const colWidths = [
      {wch: 25}, {wch: 15}, {wch: 5}, {wch: 25}, {wch: 15}, {wch: 10}, {wch: 15}
    ];
    ws['!cols'] = colWidths;
    
    return ws;
};


/**
 * Exporta una lista de reportes a un archivo Excel (.xlsx) con formato.
 * Ahora incluye una hoja de datos brutos y una hoja de tableau de bord.
 * @param reports - La lista de reportes a exportar.
 * @param filename - El nombre del archivo .xlsx a generar.
 */
export const exportReportsToExcel = (reports: ReturnReport[], filename: string = 'rapports.xlsx'): void => {
    if (reports.length === 0) {
        alert("Il n'y a pas de rapports à exporter.");
        return;
    }

    const wb = XLSX.utils.book_new();

    // --- Feuille 1: Données Brutes ---
    const headers = [ 'Date Rapport', 'Nom Chauffeur', 'Sous-traitant', 'Lettre de Voiture - Tampon', 'Lettre de Voiture - Horaire', 'Type Incident', 'Détail (Casier/PUDO)', 'Raison Fermeture', 'Nº Sacs', 'Nº Vracs', 'Notes Supplémentaires' ];
    const data: any[][] = [];
    for (const report of reports) {
        const baseRow = [ new Date(report.reportDate).toLocaleString('fr-FR'), report.driverName, report.subcontractor, report.lettreDeVoiture.tamponDuRelais ? 'Oui' : 'Non', report.lettreDeVoiture.horaireDePassageLocker ? 'Oui' : 'Non', ];
        let hasIncidents = false;
        const notes = report.notes || '';
        (report.saturationLockers || []).forEach((item, index) => { data.push([...baseRow, 'Saturation Casier', item.lockerName, '', item.sacs, item.vracs, index === 0 ? notes : '']); hasIncidents = true; });
        (report.livraisonsManquantes || []).forEach((item, index) => { data.push([...baseRow, 'Livraison Manquante', item.pudoApmName, '', item.sacs, item.vracs, !hasIncidents && index === 0 ? notes : '']); hasIncidents = true; });
        (report.pudosApmFermes || []).forEach((item, index) => { data.push([...baseRow, 'PUDO/APM Fermé', item.pudoApmName, item.reason, '', '', !hasIncidents && index === 0 ? notes : '']); hasIncidents = true; });
        if (!hasIncidents) { data.push([...baseRow, 'Aucun Incident', '', '', '', '', notes]); }
    }
    const ws_data = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const headerStyle = { fill: { fgColor: { rgb: "FF4F81BD" } }, font: { color: { rgb: "FFFFFFFF" }, bold: true, sz: 12 }, alignment: { horizontal: "center", vertical: "center" } };
    const colWidths = headers.map((_, i) => ({ wch: Math.max(headers[i].length, ...data.map(row => (row[i] ? String(row[i]).length : 0))) + 2 }));
    ws_data['!cols'] = colWidths;
    const headerRange = XLSX.utils.decode_range(ws_data['!ref']);
    for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
        const address = XLSX.utils.encode_cell({ r: 0, c: C });
        if (ws_data[address]) ws_data[address].s = headerStyle;
    }
    XLSX.utils.book_append_sheet(wb, ws_data, 'Données Brutes');

    // --- Feuille 2: Tableau de Bord ---
    const ws_dashboard = createDashboardSheet(reports);
    XLSX.utils.book_append_sheet(wb, ws_dashboard, 'Tableau de Bord');


    // --- Génération du Fichier ---
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