import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import { Driver } from '../types';

interface LoginProps {
    onIdentifyDriver: (id: string) => { driver: Driver | null, isCheckedIn: boolean, error?: string };
    onAdminAccess: () => void;
    onProfileAccess: (driver: Driver) => void;
    onCheckIn: (driver: Driver, plate: string) => void;
    onCheckOut: (driver: Driver) => void;
    onSubcontractorAccessRequest: () => void;
}

const BarcodeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.5A.75.75 0 0 1 4.5 3.75h15a.75.75 0 0 1 .75.75v15a.75.75 0 0 1-.75.75h-15a.75.75 0 0 1-.75-.75v-15Zm.75 0v15h13.5v-15h-13.5ZM8.25 6h.75v12h-.75V6Zm2.25 0h.75v12h-.75V6Zm2.25 0h.75v12h-.75V6Zm2.25 0h.75v12h-.75V6Z" />
    </svg>
);


const CompanyLogo = () => {
    const { t } = useTranslation();
    return (
        <img src="/logo.png" alt={t('login.companyLogoAlt')} className="w-24 h-24 mx-auto mb-4" />
    );
};


const Login: React.FC<LoginProps> = ({ onIdentifyDriver, onAdminAccess, onProfileAccess, onCheckIn, onCheckOut, onSubcontractorAccessRequest }) => {
    const { t } = useTranslation();
    const [id, setId] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [identifiedDriver, setIdentifiedDriver] = useState<Driver | null>(null);
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [isEnteringPlate, setIsEnteringPlate] = useState(false);
    const [plate, setPlate] = useState('');
    
    const scanInputRef = useRef<HTMLInputElement>(null);
    const plateInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEnteringPlate) {
            plateInputRef.current?.focus();
        } else if (!identifiedDriver) {
            scanInputRef.current?.focus();
        }
    }, [identifiedDriver, isEnteringPlate]);

    const resetState = () => {
        setId('');
        setIdentifiedDriver(null);
        setIsCheckedIn(false);
        setIsEnteringPlate(false);
        setPlate('');
        setError(null);
    };

    const handleIdentificationSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!id.trim()) return;
        
        if (id.trim().toUpperCase() === 'ADMIN') {
            onAdminAccess();
            setId('');
            return;
        }

        const result = onIdentifyDriver(id);
        
        if (result.driver) {
            setIdentifiedDriver(result.driver);
            setIsCheckedIn(result.isCheckedIn);
            setId('');
        } else {
            setError(result.error || t('login.errorNotFound', { id }));
            setId('');
        }
    }
    
    const handleCheckInClick = () => {
        if (!identifiedDriver) return;
        if (identifiedDriver.vehiclePlate) {
            onCheckIn(identifiedDriver, identifiedDriver.vehiclePlate);
            resetState();
        } else {
            setPlate('');
            setIsEnteringPlate(true);
        }
    };

    const handlePlateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (identifiedDriver && plate.trim()) {
            onCheckIn(identifiedDriver, plate.trim());
            resetState();
        }
    };

    const handleCheckOutClick = () => {
        if (identifiedDriver) {
            onCheckOut(identifiedDriver);
            resetState();
        }
    };

    const handleCancel = () => {
        resetState();
    };

    const renderIdentificationView = () => (
        <form onSubmit={handleIdentificationSubmit} className="space-y-4">
            <div>
                <label htmlFor="scan-input" className="block text-sm font-medium text-gray-700 text-center mb-2">
                    {t('login.scanPrompt')}
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none"><BarcodeIcon/></div>
                    <input
                        ref={scanInputRef}
                        id="scan-input"
                        type="text"
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                        placeholder={t('general.waitingForCode')}
                        className="w-full ps-12 pe-4 py-3 text-lg bg-white/50 border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:bg-white/75 transition"
                        autoFocus
                    />
                </div>
            </div>
        </form>
    );

    const renderActionView = () => {
        if (!identifiedDriver) return null;
        
        const actionButtonText = isCheckedIn ? t('login.registerExitButton') : t('login.registerEntryButton');
        const actionButtonClass = isCheckedIn 
            ? 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:ring-red-500' 
            : 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:ring-green-500';
        const actionHandler = isCheckedIn ? handleCheckOutClick : handleCheckInClick;

        return (
             <div className="space-y-4 text-center">
                 <p className="text-gray-800 text-lg">{t('login.driverIdentified', { name: identifiedDriver.name })}</p>
                <div className="flex flex-col space-y-3 pt-2">
                    <button 
                        onClick={() => onProfileAccess(identifiedDriver)}
                        className="w-full py-3 px-4 rounded-lg shadow-sm font-semibold text-white bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all transform hover:scale-105"
                    >
                       {t('login.profileButton')}
                    </button>
                    <button 
                        onClick={actionHandler}
                        className={`w-full py-3 px-4 rounded-lg shadow-sm font-semibold text-white bg-gradient-to-r focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all transform hover:scale-105 ${actionButtonClass}`}
                    >
                        {actionButtonText}
                    </button>
                </div>
                 <button onClick={handleCancel} className="text-sm text-blue-600 hover:underline pt-2">
                    {t('login.scanAnother')}
                 </button>
            </div>
        );
    };

    const renderPlateEntryView = () => {
        if (!identifiedDriver) return null;
        return (
             <div className="space-y-4">
                <div className="text-center">
                    <h3 className="font-semibold text-gray-800">{t('login.driverIdentified', { name: identifiedDriver.name })}</h3>
                    <p className="text-gray-600 text-sm mt-1">{t('login.plateInstruction')}</p>
                </div>
                 <form onSubmit={handlePlateSubmit} className="space-y-3">
                    <div>
                         <label htmlFor="plate-input" className="sr-only">
                            {t('login.plateLabel')}
                        </label>
                        <input
                            ref={plateInputRef}
                            id="plate-input"
                            type="text"
                            value={plate}
                            onChange={(e) => setPlate(e.target.value.toUpperCase())}
                            className="w-full px-3 py-2 bg-white/50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-mono text-center"
                            required
                            placeholder={t('login.platePlaceholder')}
                            autoFocus
                        />
                    </div>
                     <button 
                        type="submit" 
                        className="w-full py-2 px-4 border border-transparent rounded-lg shadow-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all transform hover:scale-105"
                        disabled={!plate.trim()}
                    >
                        {t('login.confirmButton')}
                    </button>
                </form>
                 <button onClick={() => setIsEnteringPlate(false)} className="w-full text-sm text-center text-gray-500 hover:underline mt-2">
                    {t('general.cancel')}
                </button>
            </div>
        );
    };

    const renderContent = () => {
        if (isEnteringPlate) {
            return renderPlateEntryView();
        }
        if (identifiedDriver) {
            return renderActionView();
        }
        return renderIdentificationView();
    }

    return (
        <div className="flex flex-col justify-center items-center p-4 w-full">
             <div className="absolute top-4 right-4">
                <LanguageSwitcher />
            </div>
            <div className="max-w-md w-full bg-white/20 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8 space-y-6">
                <div className="text-center">
                    <CompanyLogo />
                    <h1 className="text-3xl font-bold text-gray-800">{t('login.welcome')}</h1>
                    <p className="text-gray-600">{t('login.title')}</p>
                </div>
                
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">{error}</div>}

                {renderContent()}

                 <div className="text-center pt-4 border-t border-white/20">
                    <button
                        onClick={onSubcontractorAccessRequest}
                        className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                    >
                        {t('login.subcontractor.access')}
                    </button>
                </div>
            </div>

            <div className="mt-6 text-center">
                <button
                    onClick={onAdminAccess}
                    className="text-sm font-medium text-gray-300 hover:text-white text-shadow transition-colors"
                >
                    {t('login.adminAccess')}
                </button>
            </div>

            <footer className="absolute bottom-4 text-center w-full">
                <p className="text-xs text-white/50 text-shadow">
                    Desarrollado por cviguera
                </p>
            </footer>
        </div>
    );
};

export default Login;
