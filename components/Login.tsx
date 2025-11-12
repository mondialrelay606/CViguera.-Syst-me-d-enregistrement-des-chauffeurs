import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

interface LoginProps {
    onDriverLogin: (id: string) => boolean;
    onAdminAccess: () => void;
}

const BarcodeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.5A.75.75 0 0 1 4.5 3.75h15a.75.75 0 0 1 .75.75v15a.75.75 0 0 1-.75.75h-15a.75.75 0 0 1-.75-.75v-15Zm.75 0v15h13.5v-15h-13.5ZM8.25 6h.75v12h-.75V6Zm2.25 0h.75v12h-.75V6Zm2.25 0h.75v12h-.75V6Zm2.25 0h.75v12h-.75V6Z" />
    </svg>
);

const Login: React.FC<LoginProps> = ({ onDriverLogin, onAdminAccess }) => {
    const { t } = useTranslation();
    const [id, setId] = useState('');
    const [error, setError] = useState<string | null>(null);
    const scanInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        scanInputRef.current?.focus();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!id.trim()) return;
        const loginSuccessful = onDriverLogin(id);
        if (!loginSuccessful) {
            setError(t('login.errorNotFound', { id }));
            setId('');
        }
    }

    return (
        <div className="min-h-screen flex flex-col justify-center items-center p-4">
             <div className="absolute top-4 right-4">
                <LanguageSwitcher />
            </div>
            <div className="max-w-md w-full bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-8 space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-800">{t('login.welcome')}</h1>
                    <p className="text-gray-500">{t('login.title')}</p>
                </div>
                
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
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
                                className="w-full ps-12 pe-4 py-3 text-lg border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                autoFocus
                            />
                        </div>
                    </div>
                     <button type="submit" className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        {t('login.accessButton')}
                    </button>
                </form>
            </div>

            <div className="mt-6 text-center">
                <button
                    onClick={onAdminAccess}
                    className="text-sm font-medium text-gray-200 hover:text-white text-shadow"
                >
                    {t('login.adminAccess')}
                </button>
            </div>
        </div>
    );
};

export default Login;