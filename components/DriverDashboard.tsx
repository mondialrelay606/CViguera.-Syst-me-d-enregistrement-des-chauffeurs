import React, { useState } from 'react';
import { Driver, AttendanceRecord } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

interface DriverDashboardProps {
    driver: Driver;
    records: AttendanceRecord[];
    onUpdatePlate: (driverId: string, newPlate: string) => void;
    onLogout: () => void;
}

const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 me-2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
    </svg>
);

const DriverDashboard: React.FC<DriverDashboardProps> = ({ driver, records, onUpdatePlate, onLogout }) => {
    const { t } = useTranslation();
    const [vehiclePlate, setVehiclePlate] = useState(driver.vehiclePlate || '');
    const [isEditing, setIsEditing] = useState(false);
    const [updateMessage, setUpdateMessage] = useState('');

    const driverRecords = records.filter(rec => rec.driver.id === driver.id);

    const handleUpdateClick = () => {
        onUpdatePlate(driver.id, vehiclePlate);
        setIsEditing(false);
        setUpdateMessage(t('driverDashboard.plateUpdateSuccess'));
        setTimeout(() => setUpdateMessage(''), 3000); // El mensaje desaparece después de 3 segundos
    };

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="flex justify-between items-start mb-6 bg-black/20 backdrop-blur-sm p-4 rounded-lg">
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-white text-shadow-lg">{t('driverDashboard.welcome', { name: driver.name })}</h1>
                        <p className="text-lg text-gray-200 text-shadow">{driver.company}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-4">
                        <button
                            onClick={onLogout}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 flex items-center transition-colors"
                        >
                            <LogoutIcon />
                            {t('driverDashboard.logoutButton')}
                        </button>
                        <LanguageSwitcher />
                    </div>
                </header>

                <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Sección de Vehículo */}
                    <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-xl">
                        <h2 className="text-xl font-bold text-gray-700 mb-4">{t('driverDashboard.myVehicleTitle')}</h2>
                        <div className="space-y-3">
                            <label htmlFor="vehicle-plate" className="block text-sm font-medium text-gray-700">
                                {t('driverDashboard.plateLabel')}
                            </label>
                             <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                <input
                                    id="vehicle-plate"
                                    type="text"
                                    value={vehiclePlate}
                                    onChange={(e) => { setVehiclePlate(e.target.value.toUpperCase()); setIsEditing(true); }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder={t('driverDashboard.platePlaceholder')}
                                />
                                {isEditing && (
                                    <button
                                        onClick={handleUpdateClick}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 whitespace-nowrap"
                                    >
                                        {t('general.update')}
                                    </button>
                                )}
                            </div>
                            {updateMessage && <p className="text-sm text-green-600 mt-2">{updateMessage}</p>}
                        </div>
                    </div>

                    {/* Historial de Fichajes */}
                    <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-xl md:col-span-2">
                        <h2 className="text-xl font-bold text-gray-700 mb-4">{t('driverDashboard.historyTitle')}</h2>
                        <div className="max-h-96 overflow-y-auto">
                             {driverRecords.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-gray-500 py-10">
                                    <p>{t('driverDashboard.noRecords')}</p>
                                </div>
                            ) : (
                                <table className="w-full text-sm text-start text-gray-500">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
                                        <tr>
                                            <th scope="col" className="px-6 py-3">{t('driverDashboard.headers.date')}</th>
                                            <th scope="col" className="px-6 py-3">{t('driverDashboard.headers.plate')}</th>
                                            <th scope="col" className="px-6 py-3">{t('driverDashboard.headers.checkin')}</th>
                                            <th scope="col" className="px-6 py-3">{t('driverDashboard.headers.checkout')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {driverRecords.map((record, index) => (
                                            <tr key={index} className="bg-white/70 border-b border-gray-200/50 hover:bg-gray-50/70">
                                                <td className="px-6 py-4 font-medium text-gray-900">
                                                    {record.checkinTime.toLocaleDateString('es-ES')}
                                                </td>
                                                <td className="px-6 py-4 font-mono text-xs">{record.vehiclePlate || '---'}</td>
                                                <td className="px-6 py-4 text-green-600 font-semibold">
                                                    {record.checkinTime.toLocaleTimeString('es-ES')}
                                                </td>
                                                <td className="px-6 py-4 text-red-600 font-semibold">
                                                    {record.checkoutTime ? record.checkoutTime.toLocaleTimeString('es-ES') : '---'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DriverDashboard;