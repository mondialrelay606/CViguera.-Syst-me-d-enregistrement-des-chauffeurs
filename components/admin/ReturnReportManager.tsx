import React, { useState, useMemo } from 'react';
import { ReturnReport, CheckinRecord, CheckinType } from '../../types';
import ReturnReportFormModal from './ReturnReportFormModal';

interface ReturnReportManagerProps {
    allReports: ReturnReport[];
    allRecords: CheckinRecord[];
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
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
);


const ReturnReportManager: React.FC<ReturnReportManagerProps> = ({ allReports, allRecords, onAddReport, onUpdateReport }) => {
    const [showModal, setShowModal] = useState(false);
    const [editingReport, setEditingReport] = useState<ReturnReport | null>(null);
    const [filterSubcontractor, setFilterSubcontractor] = useState<string>('');
    
    const uniqueSubcontractors = useMemo(() => {
        const subcontractors = new Set(allReports.map(report => report.subcontractor));
        return Array.from(subcontractors).sort();
    }, [allReports]);

    const filteredReports = useMemo(() => {
        return allReports.filter(report => {
            if (filterSubcontractor && report.subcontractor !== filterSubcontractor) {
                return false;
            }
            return true;
        });
    }, [allReports, filterSubcontractor]);

    const handleCreateClick = () => {
        setEditingReport(null);
        setShowModal(true);
    };

    const handleEditClick = (report: ReturnReport) => {
        setEditingReport(report);
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
    };

    const renderIssueSummary = (report: ReturnReport) => {
        const issues: string[] = [];
        if (report.saturationLocker) issues.push(`Saturación Locker (${report.saturationLocker.lockerName})`);
        if (report.livraisonManquante) issues.push(`Entrega Faltante (${report.livraisonManquante.pudoApmName})`);
        if (report.pudoApmFerme) issues.push(`PUDO/APM Cerrado (${report.pudoApmFerme.pudoApmName})`);
        if (report.notes) issues.push('Notas adicionales');
        return issues.length > 0 ? issues.join(', ') : <span className="text-gray-400">Sin incidencias</span>;
    };


    return (
        <>
            <ReturnReportFormModal
                isOpen={showModal}
                onClose={handleCloseModal}
                onSave={handleSaveReport}
                checkinRecords={allRecords}
                existingReports={allReports}
                reportToEdit={editingReport}
            />
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                    <h2 className="text-2xl font-bold text-gray-800">Gestión de Reportes de Retorno</h2>
                    <button
                        onClick={handleCreateClick}
                        className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors w-full sm:w-auto"
                    >
                        + Crear Nuevo Reporte
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
                                 <th scope="col" className="px-6 py-3">Fecha Reporte</th>
                                 <th scope="col" className="px-6 py-3">Chofer</th>
                                 <th scope="col" className="px-6 py-3">Subcontratista</th>
                                 <th scope="col" className="px-6 py-3">Resumen de Incidencias</th>
                                 <th scope="col" className="px-6 py-3 text-center">Acciones</th>
                             </tr>
                         </thead>
                         <tbody>
                            {filteredReports.length > 0 ? filteredReports.map(report => (
                                <tr key={report.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{new Date(report.reportDate).toLocaleString('es-ES')}</td>
                                    <td className="px-6 py-4">{report.driverName}</td>
                                    <td className="px-6 py-4">{report.subcontractor}</td>
                                    <td className="px-6 py-4">{renderIssueSummary(report)}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button 
                                            onClick={() => handleEditClick(report)} 
                                            className="text-blue-600 hover:text-blue-800"
                                            title="Editar Reporte"
                                        >
                                            <EditIcon />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-gray-500">
                                        No hay reportes que coincidan con el filtro actual.
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
