import React, { useState, useRef } from 'react';
import { Driver, AttendanceRecord, ReturnInfo, SubcontractorUser } from '../types';
import CheckinLog from './CheckinLog';
import Reports from './Reports';
import DriverList from './DriverList';
import RetourTournee from './RetourTournee';
import DailyReport from './DailyReport';
import DepartChauffeur from './DepartChauffeur';
import SubcontractorManagement from './SubcontractorManagement';
import { useTranslation } from '../contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

interface AdminPanelProps {
  drivers: Driver[];
  records: AttendanceRecord[];
  returnRecords: ReturnInfo[];
  subcontractorUsers: SubcontractorUser[];
  onLogout: () => void;
  onFileImport: (file: File) => void;
  onUpdateDriverRoute: (driverId: string, newRoute: string) => void;
  onSaveReturnInfo: (info: Omit<ReturnInfo, 'recordedAt'>) => void;
  onSaveDepartureNotes: (attendanceRecordId: string, notes: string) => void;
  onVerifyUniform: (attendanceRecordId: string) => void;
  onAddSubcontractorUser: (user: SubcontractorUser) => void;
  onUpdateSubcontractorPassword: (username: string, newPassword: string) => void;
}

type Tab = 'departChauffeur' | 'retourTournee' | 'dailyReport' | 'log' | 'reports' | 'drivers' | 'subcontractors';

const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 me-2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
    </svg>
);

const ImportIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 me-2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3.75 3.75M12 9.75l3.75 3.75M3 13.5V18a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 18v-4.5M3 13.5V6a2.25 2.25 0 012.25-2.25h1.5A2.25 2.25 0 019 6v1.5h6V6a2.25 2.25 0 012.25-2.25h1.5A2.25 2.25 0 0121 6v7.5" />
    </svg>
);


const AdminPanel: React.FC<AdminPanelProps> = ({ drivers, records, returnRecords, subcontractorUsers, onLogout, onFileImport, onUpdateDriverRoute, onSaveReturnInfo, onSaveDepartureNotes, onVerifyUniform, onAddSubcontractorUser, onUpdateSubcontractorPassword }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<Tab>('departChauffeur');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onFileImport(file);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    
    const TabButton: React.FC<{ tab: Tab, label: string }> = ({ tab, label }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === tab 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-500 hover:bg-gray-200/50 hover:text-gray-700'
            }`}
        >
            {label}
        </button>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'departChauffeur':
                return <DepartChauffeur records={records} onSave={onSaveDepartureNotes} onVerifyUniform={onVerifyUniform} />;
            case 'retourTournee':
                return <RetourTournee records={records} onSave={onSaveReturnInfo} />;
            case 'dailyReport':
                return <DailyReport records={records} returnRecords={returnRecords} />;
            case 'log':
                return <CheckinLog records={records} />;
            case 'reports':
                return <Reports drivers={drivers} records={records} />;
            case 'drivers':
                return <DriverList drivers={drivers} onUpdateDriverRoute={onUpdateDriverRoute} />;
            case 'subcontractors':
                return <SubcontractorManagement users={subcontractorUsers} onAddUser={onAddSubcontractorUser} onUpdatePassword={onUpdateSubcontractorPassword} />;
            default:
                return null;
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 h-screen flex flex-col">
            <header className="mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h1 className="text-3xl font-bold text-slate-800">{t('adminPanel.title')}</h1>
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <LanguageSwitcher />
                         <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept=".csv"
                        />
                        <button
                            onClick={handleImportClick}
                            className="bg-white text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-50 hover:text-slate-800 border border-slate-300 flex items-center transition-colors text-sm font-medium"
                        >
                           <ImportIcon />
                           {t('adminPanel.importFromCsv')}
                        </button>
                        <button
                            onClick={onLogout}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center transition-colors text-sm font-medium"
                        >
                            <LogoutIcon />
                            {t('adminPanel.logoutButton')}
                        </button>
                    </div>
                </div>
                <div className="mt-6">
                     <p className="text-xs text-gray-500 text-end mb-1">{t('adminPanel.csvFormatInfo')}</p>
                    <div className="flex flex-wrap gap-1 border border-gray-200 rounded-lg p-1 bg-slate-200/60">
                        <TabButton tab="departChauffeur" label={t('adminPanel.tabs.departChauffeur')} />
                        <TabButton tab="retourTournee" label={t('adminPanel.tabs.retourTournee')} />
                        <TabButton tab="dailyReport" label={t('adminPanel.tabs.dailyReport')} />
                        <TabButton tab="log" label={t('adminPanel.tabs.log')} />
                        <TabButton tab="reports" label={t('adminPanel.tabs.reports')} />
                        <TabButton tab="drivers" label={t('adminPanel.tabs.drivers')} />
                        <TabButton tab="subcontractors" label={t('adminPanel.tabs.subcontractors')} />
                    </div>
                </div>
            </header>
            <main className="flex-grow bg-white p-6 rounded-lg border border-slate-200/80 shadow-sm overflow-hidden">
                {renderContent()}
            </main>
        </div>
    );
};

export default AdminPanel;