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
        setTimeout(() => setUpdateMessage(''), 3000);
    };

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-4">
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-white text-shadow-lg">{t('driverDashboard.welcome', { name: driver.name })}</h1>
                        <p className="text-lg text-gray-300 text-shadow">{driver.company}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <LanguageSwitcher />
                        <button
                            onClick={onLogout}
                            className="bg-red-600/80 text-white px-4 py-2 rounded-lg hover:bg-red-700/90 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-70 flex items-center transition-colors backdrop-blur-sm border border-white/20"
                        >
                            <LogoutIcon />
                            {t('driverDashboard.logoutButton')}
                        </button>
                    </div>
                </header>

                <main className="space-y-8">
                    <div className="bg-white/10 backdrop-blur-xl p-6 rounded-xl shadow-lg border border-white/20">
                        <h2 className="text-xl font-bold text-white text-shadow mb-4">{t('driverDashboard.myVehicleTitle')}</h2>
                        <div className="space-y-3">
                            <label htmlFor="vehicle-plate" className="block text-sm font-medium text-gray-200 text-shadow">
                                {t('driverDashboard.plateLabel')}
                            </label>
                             <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                <input
                                    id="vehicle-plate"
                                    type="text"
                                    value={vehiclePlate}
                                    onChange={(e) => { setVehiclePlate(e.target.value.toUpperCase()); setIsEditing(true); }}
                                    className="w-full px-3 py-2 bg-white/20 text-white border border-white/30 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 placeholder:text-gray-300"
                                    placeholder={t('driverDashboard.platePlaceholder')}
                                />
                                {isEditing && (
                                    <button
                                        onClick={handleUpdateClick}
                                        className="bg-blue-600/80 text-white px-4 py-2 rounded-lg hover:bg-blue-700/90 whitespace-nowrap backdrop-blur-sm border border-white/20"
                                    >
                                        {t('general.update')}
                                    </button>
                                )}
                            </div>
                            {updateMessage && <p className="text-sm text-green-300 mt-2">{updateMessage}</p>}
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-xl p-6 rounded-xl shadow-lg border border-white/20">
                        <h2 className="text-xl font-bold text-white text-shadow mb-4">{t('driverDashboard.historyTitle')}</h2>
                        <div className="max-h-96 overflow-y-auto border border-white/20 rounded-lg">
                             {driverRecords.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-gray-300 py-10">
                                    <p>{t('driverDashboard.noRecords')}</p>
                                </div>
                            ) : (
                                <table className="w-full text-sm text-start text-gray-200">
                                    <thead className="text-xs text-white/80 uppercase bg-white/10 table-fixed-header">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 font-semibold">{t('driverDashboard.headers.date')}</th>
                                            <th scope="col" className="px-6 py-3 font-semibold">{t('driverDashboard.headers.plate')}</th>
                                            <th scope="col" className="px-6 py-3 font-semibold">{t('driverDashboard.headers.checkin')}</th>
                                            <th scope="col" className="px-6 py-3 font-semibold">{t('driverDashboard.headers.checkout')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-black/10">
                                        {driverRecords.map((record, index) => (
                                            <tr key={index} className={`border-b border-white/10 ${index % 2 === 0 ? 'bg-black/10' : 'bg-black/20'}`}>
                                                <td className="px-6 py-4 font-medium text-white">
                                                    {record.checkinTime.toLocaleDateString('es-ES')}
                                                </td>
                                                <td className="px-6 py-4 font-mono text-xs">{record.vehiclePlate || '---'}</td>
                                                <td className="px-6 py-4 text-green-400 font-semibold">
                                                    {record.checkinTime.toLocaleTimeString('es-ES')}
                                                </td>
                                                <td className="px-6 py-4 text-red-400 font-semibold">
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
