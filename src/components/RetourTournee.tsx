import React, { useState, useMemo } from 'react';
import { AttendanceRecord, ReturnInfo } from '../types';
import { useTranslation } from '../contexts/LanguageContext';

interface RetourTourneeProps {
  records: AttendanceRecord[];
  onSave: (info: Omit<ReturnInfo, 'recordedAt'>) => void;
}

const RetourTournee: React.FC<RetourTourneeProps> = ({ records, onSave }) => {
    const { t } = useTranslation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
    const [formData, setFormData] = useState({
        closedRelays: '',
        unidentifiedPackages: 0,
        undeliveredPackages: 0,
        saturatedLockers: '',
        notes: ''
    });

    const pendingRecords = useMemo(() => {
        return records
            .filter(rec => rec.checkoutTime && !rec.returnInfoCompleted)
            .sort((a, b) => b.checkoutTime!.getTime() - a.checkoutTime!.getTime());
    }, [records]);

    const handleOpenModal = (record: AttendanceRecord) => {
        setSelectedRecord(record);
        setFormData({
            closedRelays: '',
            unidentifiedPackages: 0,
            undeliveredPackages: 0,
            saturatedLockers: '',
            notes: ''
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedRecord(null);
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value, 10) || 0 : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedRecord) {
            onSave({
                attendanceRecordId: selectedRecord.id,
                ...formData
            });
            handleCloseModal();
        }
    };

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-xl font-bold text-gray-700 mb-4">{t('adminPanel.retourTournee.title')}</h2>
            
            <div className="flex-grow overflow-y-auto">
                {pendingRecords.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <p>{t('adminPanel.retourTournee.noPending')}</p>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {pendingRecords.map(record => (
                            <li key={record.id} className="bg-white/80 p-4 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-gray-800 flex items-center">{record.driver.name} {record.driver.route && <span className="ms-2 bg-gray-200 text-gray-700 text-xs font-medium px-2.5 py-0.5 rounded-full">{record.driver.route}</span>}</p>
                                    <p className="text-sm text-gray-500">{record.driver.subcontractor || record.driver.company} - {t('checkinLog.headers.checkout')}: {record.checkoutTime?.toLocaleTimeString('es-ES')}</p>
                                </div>
                                <button 
                                    onClick={() => handleOpenModal(record)}
                                    className="bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-medium"
                                >
                                    {t('adminPanel.retourTournee.registerButton')}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Modal for Return Info */}
            {isModalOpen && selectedRecord && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
                         <div className="p-6 border-b">
                            <h3 className="text-lg font-bold text-gray-800">{t('adminPanel.retourTournee.modalTitle')}</h3>
                            <p className="text-sm text-gray-600">{t('adminPanel.retourTournee.driverInfo', { name: selectedRecord.driver.name, time: selectedRecord.checkoutTime!.toLocaleTimeString('es-ES') })}</p>
                        </div>
                        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto">
                           <div className="p-6 space-y-4">
                                {selectedRecord.departureNotes && (
                                    <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                                        <h4 className="font-semibold text-blue-800">{t('adminPanel.retourTournee.departureNotesTitle')}</h4>
                                        <p className="text-sm text-blue-700 whitespace-pre-wrap">{selectedRecord.departureNotes}</p>
                                    </div>
                                )}
                                <div>
                                    <label htmlFor="closedRelays" className="block text-sm font-medium text-gray-700">{t('adminPanel.retourTournee.closedRelaisLabel')}</label>
                                    <input type="text" name="closedRelays" id="closedRelays" value={formData.closedRelays} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2" placeholder={t('adminPanel.retourTournee.closedRelaisPlaceholder')} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="unidentifiedPackages" className="block text-sm font-medium text-gray-700">{t('adminPanel.retourTournee.unidentifiedPackagesLabel')}</label>
                                        <input type="number" name="unidentifiedPackages" id="unidentifiedPackages" value={formData.unidentifiedPackages} onChange={handleChange} min="0" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2" />
                                    </div>
                                    <div>
                                        <label htmlFor="undeliveredPackages" className="block text-sm font-medium text-gray-700">{t('adminPanel.retourTournee.undeliveredPackagesLabel')}</label>
                                        <input type="number" name="undeliveredPackages" id="undeliveredPackages" value={formData.undeliveredPackages} onChange={handleChange} min="0" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2" />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="saturatedLockers" className="block text-sm font-medium text-gray-700">{t('adminPanel.retourTournee.saturatedLockersLabel')}</label>
                                    <input type="text" name="saturatedLockers" id="saturatedLockers" value={formData.saturatedLockers} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2" placeholder={t('adminPanel.retourTournee.saturatedLockersPlaceholder')} />
                                </div>
                                <div>
                                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">{t('general.notes')}</label>
                                    <textarea name="notes" id="notes" value={formData.notes} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"></textarea>
                                </div>
                           </div>
                           <div className="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-2">
                                <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">{t('general.cancel')}</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">{t('general.save')}</button>
                           </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RetourTournee;
