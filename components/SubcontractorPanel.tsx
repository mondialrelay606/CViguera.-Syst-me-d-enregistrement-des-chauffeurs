import React, { useState } from 'react';
import { Driver, AttendanceRecord, SubcontractorUser } from '../types';
import CheckinLog from './CheckinLog';
import Reports from './Reports';
import DriverList from './DriverList';
import { useTranslation } from '../contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

interface SubcontractorPanelProps {
  subcontractor: SubcontractorUser;
  drivers: Driver[];
  records: AttendanceRecord[];
  onLogout: () => void;
}

type Tab = 'log' | 'reports' | 'drivers';

const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 me-2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
    </svg>
);

const SubcontractorPanel: React.FC<SubcontractorPanelProps> = ({ subcontractor, drivers, records, onLogout }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<Tab>('log');

    const TabButton: React.FC<{ tab: Tab, label: string }> = ({ tab, label }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tab ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}
        >
            {label}
        </button>
    );
    
    // El componente DriverList espera una función onUpdateDriverRoute, pero las subcontratas no pueden editar.
    // Pasamos una función vacía para satisfacer la prop ya que la edición estará deshabilitada.
    const handleUpdateRouteDummy = () => {};


    const renderContent = () => {
        switch (activeTab) {
            case 'log':
                return <CheckinLog records={records} />;
            case 'reports':
                return <Reports drivers={drivers} records={records} />;
            case 'drivers':
                return <DriverList drivers={drivers} onUpdateDriverRoute={handleUpdateRouteDummy} canEdit={false} />;
            default:
                return null;
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 h-screen flex flex-col bg-gray-100">
            <header className="mb-6 pb-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                     <div>
                        <h1 className="text-2xl font-bold text-gray-800">{t('subcontractorPanel.title')}</h1>
                        <p className="text-gray-600">{t('subcontractorPanel.welcome', { company: subcontractor.companyName })}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <LanguageSwitcher />
                        <button
                            onClick={onLogout}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
                        >
                            <LogoutIcon />
                            {t('driverDashboard.logoutButton')}
                        </button>
                    </div>
                </div>
                 <div className="flex justify-start items-center mt-4">
                    <div className="flex flex-wrap space-x-1 border border-gray-200 rounded-lg p-1 bg-gray-50">
                        <TabButton tab="log" label={t('subcontractorPanel.tabs.log')} />
                        <TabButton tab="reports" label={t('subcontractorPanel.tabs.reports')} />
                        <TabButton tab="drivers" label={t('subcontractorPanel.tabs.drivers')} />
                    </div>
                </div>
            </header>
            <main className="flex-grow bg-white p-6 rounded-lg shadow-inner overflow-hidden">
                {renderContent()}
            </main>
        </div>
    );
};

export default SubcontractorPanel;