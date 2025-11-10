import React, { useState, useMemo } from 'react';
import { AttendanceRecord } from '../types';
import { useTranslation } from '../contexts/LanguageContext';

interface DepartChauffeurProps {
  records: AttendanceRecord[];
  onSave: (attendanceRecordId: string, notes: string) => void;
  onVerifyUniform: (attendanceRecordId: string) => void;
}

const DepartChauffeur: React.FC<DepartChauffeurProps> = ({ records, onSave, onVerifyUniform }) => {
    const { t } = useTranslation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
    const [notes, setNotes] = useState('');

    const activeDriversRecords = useMemo(() => {
        return records
            .filter(rec => rec.checkoutTime === null)
            .sort((a, b) => a.checkinTime.getTime() - b.checkinTime.getTime());
    }, [records]);

    const handleOpenModal = (record: AttendanceRecord) => {
        setSelectedRecord(record);
        setNotes(record.departureNotes || '');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedRecord(null);
        setNotes('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedRecord) {
            onSave(selectedRecord.id, notes);
            handleCloseModal();
        }
    };

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-xl font-bold text-slate-700 mb-4">{t('adminPanel.departChauffeur.title')}</h2>
            
            <div className="flex-grow overflow-y-auto">
                {activeDriversRecords.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-slate-500">
                        <p>{t('adminPanel.departChauffeur.noActive')}</p>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {activeDriversRecords.map(record => (
                            <li key={record.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <p className="font-semibold text-slate-800 flex items-center">{record.driver.name} {record.driver.route && <span className="ms-2 bg-slate-200 text-slate-700 text-xs font-medium px-2.5 py-0.5 rounded-full">{record.driver.route}</span>}</p>
                                    <p className="text-sm text-slate-500">
                                        {record.driver.subcontractor || record.driver.company} - {t('checkinLog.headers.checkin')}: {record.checkinTime.toLocaleTimeString('es-ES')}
                                    </p>
                                     {record.departureNotes && (
                                        <p className="text-xs text-blue-600 mt-1 italic">
                                            - {t('general.notes')} ✓
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <div className="flex items-center gap-2 p-2 rounded-md bg-slate-100 border border-slate-200/80">
                                        <span className="text-sm font-medium text-slate-600">{t('adminPanel.departChauffeur.uniformStatus')}:</span>
                                        {record.uniformVerified ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                {t('adminPanel.departChauffeur.verified')}
                                            </span>
                                        ) : (
                                             <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                {t('adminPanel.departChauffeur.notVerified')}
                                            </span>
                                        )}
                                        {!record.uniformVerified && (
                                            <button 
                                                onClick={() => onVerifyUniform(record.id)}
                                                className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 text-xs font-medium transition-colors"
                                            >
                                                {t('adminPanel.departChauffeur.verifyButton')}
                                            </button>
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => handleOpenModal(record)}
                                        className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium transition-colors"
                                    >
                                        {record.departureNotes ? t('general.edit') : t('adminPanel.departChauffeur.addButton')}
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {isModalOpen && selectedRecord && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
                         <div className="p-6 border-b">
                            <h3 className="text-lg font-bold text-slate-800">{t('adminPanel.departChauffeur.modalTitle')}</h3>
                             <p className="text-sm text-slate-600">{t('adminPanel.departChauffeur.driverInfo', { name: selectedRecord.driver.name, time: selectedRecord.checkinTime.toLocaleTimeString('es-ES') })}</p>
                        </div>
                        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto">
                           <div className="p-6">
                                <label htmlFor="notes" className="block text-sm font-medium text-slate-700">{t('adminPanel.departChauffeur.notesLabel')}</label>
                                <textarea 
                                    name="notes" 
                                    id="notes" 
                                    value={notes} 
                                    onChange={(e) => setNotes(e.target.value)} 
                                    rows={8} 
                                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                                    placeholder={t('adminPanel.departChauffeur.notesPlaceholder')}
                                    autoFocus
                                ></textarea>
                           </div>
                           <div className="px-6 py-4 bg-slate-50 border-t flex justify-end space-x-2">
                                <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50">{t('general.cancel')}</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">{t('general.save')}</button>
                           </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DepartChauffeur;
