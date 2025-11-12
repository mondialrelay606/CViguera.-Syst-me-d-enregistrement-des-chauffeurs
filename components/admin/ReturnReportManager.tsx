import React, { useState, useMemo } from 'react';
import { ReturnReport, CheckinRecord, CheckinType, Driver } from '../../types';
import ReturnReportFormModal from './ReturnReportFormModal';
import { exportReportsToExcel } from '../../utils/excelExporter';

interface ReturnReportManagerProps {
    allReports: ReturnReport[];
    allRecords: CheckinRecord[];
    allDrivers: Driver[];
    onAddReport: (newReport: ReturnReport) => void;
    onUpdateReport: (updatedReport: ReturnReport) => void;
}

const isToday = (someDate: Date): boolean => {
    const today = new Date();
    return someDate.getDate() === today.getDate() &&
        someDate.getMonth() === today.getMonth() &&
        someDate.getFullYear() === today.getFullYear();
};

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


const ReturnReportManager: React.FC<ReturnReportManagerProps> = ({ allReports, allRecords, allDrivers, onAddReport, onUpdateReport }) => {
    const [showModal, setShowModal] = useState(false);
    const [editingReport, setEditingReport] = useState<ReturnReport | null>(null);
    const [checkinForNewReport, setCheckinForNewReport] = useState<CheckinRecord | null>(null);
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
            alert('No hay reportes para exportar con el filtro actual.');
            return;
        }

        exportReportsToExcel(reportsToExport, `reportes_${filterSubcontractor || 'todos'}_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handleCreateClick = (checkin: CheckinRecord) => {
        setEditingReport(null);
        setCheckinForNewReport(checkin);
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
    };

    const renderIssueSummary = (report: ReturnReport) => {
        const issues: string[] = [];
        if (report.saturationLockers && report.saturationLockers.length > 0) {
            issues.push(`Saturación (${report.saturationLockers.length})`);
        }
        if (report.livraisonsManquantes && report.livraisonsManquantes.length > 0) {
            issues.push(`Faltante (${report.livraisonsManquantes.length})`);
        }
        if (report.pudosApmFermes && report.pudosApmFermes.length > 0) {
            issues.push(`Cerrado (${report.pudosApmFermes.length})`);
        }
        if (report.notes) {
            issues.push('Notas');
        }
        return issues.length > 0 ? issues.join(', ') : <span className="text-gray-400">Sin incidencias</span>;
    };


    return (
        <>
            <ReturnReportFormModal
                isOpen={showModal}
                onClose={handleCloseModal}
                onSave={handleSaveReport}
                reportToEdit={editingReport}
                checkinForNewReport={checkinForNewReport}
            />
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                    <h2 className="text-2xl font-bold text-gray-800">Estado de Reportes de Retorno (Hoy)</h2>
                    <button
                        onClick={handleExport}
                        className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors w-full sm:w-auto flex items-center justify-center"
                        disabled={allReports.length === 0}
                    >
                        <ExportExcelIcon />
                        Exportar Excel
                    </button>
                </div>

                <div className="mb-4">
                    <label htmlFor="subcontractor-filter" className="block text-sm font-medium text-gray-700">Filtrar por Subcontratista (Soutretant):</label>
                    <select
                        id="subcontractor-filter"
                        value={filterSubcontractor}
                        onChange={(e) => setFilterSubcontractor(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                        <option value="">Todos</option>
                        {uniqueSubcontractors.map(sub => (
                            <option key={sub} value={sub}>{sub}</option>
                        ))}
                    </select>
                </div>
                
                 <div className="overflow-y-auto h-[500px]">
                     <table className="w-full text-sm text-left text-gray-500">
                         <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                             <tr>
                                 <th scope="col" className="px-6 py-3">Hora Retorno</th>
                                 <th scope="col" className="px-6 py-3">Chofer</th>
                                 <th scope="col" className="px-6 py-3">Subcontratista</th>
                                 <th scope="col" className="px-6 py-3">Estado del Reporte</th>
                                 <th scope="col" className="px-6 py-3">Resumen Incidencias</th>
                                 <th scope="col" className="px-6 py-3 text-center">Acciones</th>
                             </tr>
                         </thead>
                         <tbody>
                            {filteredCheckins.length > 0 ? filteredCheckins.map(checkin => {
                                const checkinId = `${checkin.driver.id}-${checkin.timestamp.getTime()}`;
                                const report = reportsByCheckinId.get(checkinId);
                                const hasReport = !!report;

                                return (
                                <tr key={checkinId} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{checkin.timestamp.toLocaleTimeString('es-ES')}</td>
                                    <td className="px-6 py-4">{checkin.driver.name}</td>
                                    <td className="px-6 py-4">{checkin.driver.subcontractor}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            hasReport ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {hasReport ? 'Reportado' : 'Pendiente'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{hasReport ? renderIssueSummary(report) : <span className="text-gray-400">---</span>}</td>
                                    <td className="px-6 py-4 text-center">
                                        {hasReport ? (
                                            <button 
                                                onClick={() => handleEditClick(report)} 
                                                className="text-blue-600 hover:text-blue-800 inline-flex items-center text-sm font-medium"
                                                title="Editar Reporte"
                                            >
                                                <EditIcon /> Editar
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleCreateClick(checkin)} 
                                                className="text-green-600 hover:text-green-800 inline-flex items-center text-sm font-medium"
                                                title="Crear Reporte"
                                            >
                                                <CreateIcon /> Crear
                                            </button>
                                        )}
                                    </td>
                                </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-10 text-gray-500">
                                        No hay fichajes de retorno para el filtro actual.
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