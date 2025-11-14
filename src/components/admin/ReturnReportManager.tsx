import React, { useState, useMemo } from 'react';
import { ReturnReport, CheckinRecord, CheckinType, Driver } from '../../types';
import ReturnReportFormModal from './ReturnReportFormModal';
import { exportReportsToExcel } from '../../utils/excelExporter';
import { isToday } from '../../utils/dateUtils';

interface ReturnReportManagerProps {
    allReports: ReturnReport[];
    allRecords: CheckinRecord[];
    allDrivers: Driver[];
    onAddReport: (newReport: ReturnReport) => void;
    onUpdateReport: (updatedReport: ReturnReport) => void;
    onClearAllReports: () => void;
}

const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
);

const CreateIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

const ExportExcelIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 21v-7.5h17.25V21H3.375Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 13.5v-7.5A2.25 2.25 0 0 1 5.625 3.75h12.75c1.24 0 2.25 1.01 2.25 2.25v7.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v.008h.008V17.25H9Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 17.25v.008h.008V17.25H12Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17.25v.008h.008V17.25H15Z" />
    </svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
        {/* FIX: Corrected typo in SVG path data from 4.8108 to 48.108 */}
        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.067-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
);


const ReturnReportManager: React.FC<ReturnReportManagerProps> = ({ allRecords, allDrivers, allReports, onAddReport, onUpdateReport, onClearAllReports }) => {
    const [showModal, setShowModal] = useState(false);
    const [editingReport, setEditingReport] = useState<ReturnReport | null>(null);
    const [checkinForNewReport, setCheckinForNewReport] = useState<CheckinRecord | null>(null);
    const [departureCommentForNewReport, setDepartureCommentForNewReport] = useState<string | undefined>(undefined);
    const [filterSubcontractor, setFilterSubcontractor] = useState<string>('');

    const todayReturnCheckins = useMemo(() => {
        return allRecords
            .filter(r => r.type === CheckinType.RETURN && isToday(r.timestamp))
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }, [allRecords]);
    
    const reportsByCheckinId = useMemo(() => {
        const map = new Map<string, ReturnReport>();
        allReports.forEach(report => {
            map.set(report.checkinId, report);
        });
        return map;
    }, [allReports]);

    const uniqueSubcontractors = useMemo(() => {
        const subcontractors = new Set(allDrivers.map(driver => driver.subcontractor));
        return Array.from(subcontractors).sort();
    }, [allDrivers]);

    const filteredCheckins = useMemo(() => {
        return todayReturnCheckins.filter(c => {
            if (filterSubcontractor && c.driver.subcontractor !== filterSubcontractor) {
                return false;
            }
            return true;
        });
    }, [todayReturnCheckins, filterSubcontractor]);
    
    const handleExport = () => {
        const reportsToExport = allReports.filter(report => {
             if (filterSubcontractor && report.subcontractor !== filterSubcontractor) {
                return false;
            }
            const reportDate = new Date(report.reportDate);
            return isToday(reportDate);
        });

        if (reportsToExport.length === 0) {
            alert("Aucun rapport à exporter avec le filtre actuel.");
            return;
        }

        exportReportsToExcel(reportsToExport, `rapports_${filterSubcontractor || 'tous'}_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handleCreateClick = (checkin: CheckinRecord) => {
        const lastDeparture = allRecords
            .filter(r => 
                r.driver.id === checkin.driver.id && 
                r.type === CheckinType.DEPARTURE && 
                isToday(r.timestamp) &&
                r.timestamp < checkin.timestamp
            )
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

        setEditingReport(null);
        setCheckinForNewReport(checkin);
        setDepartureCommentForNewReport(lastDeparture?.departureComment);
        setShowModal(true);
    };

    const handleEditClick = (report: ReturnReport) => {
        setEditingReport(report);
        setCheckinForNewReport(null);
        setShowModal(true);
    };

    const handleSaveReport = (report: ReturnReport) => {
        if (editingReport) {
            onUpdateReport(report);
        } else {
            onAddReport(report);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingReport(null);
        setCheckinForNewReport(null);
        setDepartureCommentForNewReport(undefined);
    };

    const renderIssueSummary = (report: ReturnReport) => {
        const issues: string[] = [];
        if (report.saturationLockers && report.saturationLockers.length > 0) {
            issues.push(`Saturation (${report.saturationLockers.length})`);
        }
        if (report.livraisonsManquantes && report.livraisonsManquantes.length > 0) {
            issues.push(`Manquant (${report.livraisonsManquantes.length})`);
        }
        if (report.pudosApmFermes && report.pudosApmFermes.length > 0) {
            issues.push(`Fermé (${report.pudosApmFermes.length})`);
        }
        if (report.notes) {
            issues.push('Notes');
        }
        return issues.length > 0 ? issues.join(', ') : <span className="text-gray-400">Aucun incident</span>;
    };


    return (
        <>
            <ReturnReportFormModal
                isOpen={showModal}
                onClose={handleCloseModal}
                onSave={handleSaveReport}
                reportToEdit={editingReport}
                checkinForNewReport={checkinForNewReport}
                departureComment={departureCommentForNewReport}
            />
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                    <h2 className="text-2xl font-bold text-gray-800">État des Rapports de Retour (Aujourd'hui)</h2>
                     <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <button
                            onClick={onClearAllReports}
                            className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-colors w-full sm:w-auto flex items-center justify-center"
                            disabled={allReports.length === 0}
                            title="Supprimer définitivement tous les rapports"
                        >
                            <TrashIcon />
                            Tout Supprimer
                        </button>
                        <button
                            onClick={handleExport}
                            className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors w-full sm:w-auto flex items-center justify-center"
                            disabled={allReports.length === 0}
                        >
                            <ExportExcelIcon />
                            Exporter Excel
                        </button>
                    </div>
                </div>

                <div className="mb-4">
                    <label htmlFor="subcontractor-filter" className="block text-sm font-medium text-gray-700">Filtrer par Sous-traitant :</label>
                    <select
                        id="subcontractor-filter"
                        value={filterSubcontractor}
                        onChange={(e) => setFilterSubcontractor(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                        <option value="">Tous</option>
                        {uniqueSubcontractors.map(sub => (
                            <option key={sub} value={sub}>{sub}</option>
                        ))}
                    </select>
                </div>
                
                 <div className="overflow-y-auto h-[500px]">
                     <table className="w-full text-sm text-left text-gray-500">
                         <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                             <tr>
                                 <th scope="col" className="px-6 py-3">Heure Retour</th>
                                 <th scope="col" className="px-6 py-3">Chauffeur</th>
                                 <th scope="col" className="px-6 py-3">Sous-traitant</th>
                                 <th scope="col" className="px-6 py-3">État du Rapport</th>
                                 <th scope="col" className="px-6 py-3">Résumé Incidents</th>
                                 <th scope="col" className="px-6 py-3 text-center">Actions</th>
                             </tr>
                         </thead>
                         <tbody>
                            {filteredCheckins.length > 0 ? filteredCheckins.map(checkin => {
                                const checkinId = `${checkin.driver.id}-${checkin.timestamp.getTime()}`;
                                const report = reportsByCheckinId.get(checkinId);
                                const hasReport = !!report;

                                return (
                                <tr key={checkinId} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{checkin.timestamp.toLocaleTimeString('fr-FR')}</td>
                                    <td className="px-6 py-4">{checkin.driver.name}</td>
                                    <td className="px-6 py-4">{checkin.driver.subcontractor}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            hasReport ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {hasReport ? 'Rapporté' : 'En attente'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{hasReport ? renderIssueSummary(report) : <span className="text-gray-400">---</span>}</td>
                                    <td className="px-6 py-4 text-center">
                                        {hasReport ? (
                                            <button 
                                                onClick={() => handleEditClick(report)} 
                                                className="text-blue-600 hover:text-blue-800 inline-flex items-center text-sm font-medium"
                                                title="Modifier le Rapport"
                                            >
                                                <EditIcon /> Modifier
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleCreateClick(checkin)} 
                                                className="text-green-600 hover:text-green-800 inline-flex items-center text-sm font-medium"
                                                title="Créer le Rapport"
                                            >
                                                <CreateIcon /> Créer
                                            </button>
                                        )}
                                    </td>
                                </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-10 text-gray-500">
                                        Aucun pointage de retour pour le filtre actuel.
                                    </td>
                                </tr>
                            )}
                         </tbody>
                     </table>
                 </div>
            </div>
        </>
    );
};

export default ReturnReportManager;