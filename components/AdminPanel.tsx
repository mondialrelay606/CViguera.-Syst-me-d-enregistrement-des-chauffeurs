import React, { useState, useRef } from 'react';
import { Driver, AttendanceRecord, type ScanResult as ScanResultType } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import Clock from './Clock';
import ScanResult from './ScanResult';
import CheckinLog from './CheckinLog';
import DriverList from './DriverList';
import Reports from './Reports';
import LanguageSwitcher from './LanguageSwitcher';

interface AdminPanelProps {
    allDrivers: Driver[];
    attendanceLog: AttendanceRecord[];
    onScan: (barcode: string) => void;
    lastScanResult: ScanResultType;
    loading: boolean;
    onSyncDrivers: () => void;
    isSyncing: boolean;
}

const BarcodeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.5A.75.75 0 0 1 4.5 3.75h15a.75.75 0 0 1 .75.75v15a.75.75 0 0 1-.75.75h-15a.75.75 0 0 1-.75-.75v-15Zm.75 0v15h13.5v-15h-13.5ZM8.25 6h.75v12h-.75V6Zm2.25 0h.75v12h-.75V6Zm2.25 0h.75v12h-.75V6Zm2.25 0h.75v12h-.75V6Z" />
    </svg>
);

const AdminPanel: React.FC<AdminPanelProps> = ({ allDrivers, attendanceLog, onScan, lastScanResult, loading, onSyncDrivers, isSyncing }) => {
    const { t } = useTranslation();
    const [barcode, setBarcode] = useState('');
    const [activeTab, setActiveTab] = useState<'log' | 'drivers' | 'reports'>('log');
    
    const barcodeInputRef = useRef<HTMLInputElement>(null);

    const handleScanSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onScan(barcode);
        setBarcode('');
        barcodeInputRef.current?.focus();
    };
    
    const todaysRecords = attendanceLog.filter(record => {
        const today = new Date();
        const recordDate = record.checkinTime;
        return recordDate.getDate() === today.getDate() &&
               recordDate.getMonth() === today.getMonth() &&
               recordDate.getFullYear() === today.getFullYear();
    });

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8 flex flex-col">
            <header className="mb-6">
                <div className="flex justify-between items-center">
                    <div className="flex-1 text-center">
                        <h1 className="text-4xl font-bold text-white text-shadow-lg">{t('adminPanel.title')}</h1>
                        <p className="text-lg text-gray-200 text-shadow">{t('adminPanel.subtitle')}</p>
                    </div>
                    <div className="flex-shrink-0">
                         <LanguageSwitcher />
                    </div>
                </div>
            </header>
            <main className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Columna Izquierda: Escaneo y Reloj */}
                <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-xl flex flex-col justify-center space-y-8">
                    <Clock />
                    <div className="w-full max-w-md mx-auto">
                        <form onSubmit={handleScanSubmit}>
                            <label htmlFor="barcode-input" className="block text-sm font-medium text-gray-700 mb-2 text-center">
                                {t('adminPanel.scanLabel')}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
                                    <BarcodeIcon />
                                </div>
                                <input
                                    ref={barcodeInputRef}
                                    id="barcode-input"
                                    type="text"
                                    value={barcode}
                                    onChange={(e) => setBarcode(e.target.value)}
                                    placeholder={t('general.waitingForCode')}
                                    className="w-full ps-14 pe-4 py-3 text-lg border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    autoFocus
                                />
                            </div>
                        </form>
                        <ScanResult result={lastScanResult} />
                    </div>
                </div>

                {/* Columna Derecha: Registros y Lista */}
                <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-xl flex flex-col">
                    <div className="p-6">
                        <div className="mb-4 border-b border-gray-200/80">
                            <nav className="-mb-px flex space-x-4 rtl:space-x-reverse" aria-label="Tabs">
                                <button
                                    onClick={() => setActiveTab('log')}
                                    className={`${activeTab === 'log' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                                >
                                    {t('adminPanel.tabs.activity')}
                                </button>
                                <button
                                    onClick={() => setActiveTab('reports')}
                                    className={`${activeTab === 'reports' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                                >
                                    {t('adminPanel.tabs.reports')}
                                </button>
                                <button
                                    onClick={() => setActiveTab('drivers')}
                                    className={`${activeTab === 'drivers' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                                >
                                    {t('adminPanel.tabs.driverList')}
                                </button>
                            </nav>
                        </div>
                    </div>
                    <div className="flex-grow px-6 pb-6">
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-gray-500">{t('adminPanel.loadingDrivers')}</p>
                            </div>
                        ) : (
                            <>
                                <div className={activeTab === 'log' ? 'block h-full' : 'hidden'}>
                                    <CheckinLog records={todaysRecords} />
                                </div>
                                <div className={activeTab === 'drivers' ? 'block h-full' : 'hidden'}>
                                    <DriverList 
                                        drivers={allDrivers} 
                                        onSync={onSyncDrivers} 
                                        isSyncing={isSyncing} 
                                    />
                                </div>
                                 <div className={activeTab === 'reports' ? 'block h-full' : 'hidden'}>
                                    <Reports drivers={allDrivers} records={attendanceLog} />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminPanel;