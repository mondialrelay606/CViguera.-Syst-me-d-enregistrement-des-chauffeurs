import React, { useState } from 'react';
import { useTranslation } from '../contexts/LanguageContext';

interface SubcontractorLoginProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string, password: string) => Promise<void>;
}

const SubcontractorLogin: React.FC<SubcontractorLoginProps> = ({ isOpen, onClose, onLogin }) => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
        await onLogin(username, password);
        // El cierre del modal y el cambio de vista se manejan en App.tsx
    } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError(t('login.subcontractor.error'));
        }
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleClose = () => {
      setUsername('');
      setPassword('');
      setError(null);
      setIsLoading(false);
      onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300" onClick={handleClose}>
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm m-auto p-8" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">{t('login.subcontractor.title')}</h2>
            
            {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert"><p>{error}</p></div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">{t('login.subcontractor.username')}</label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                        autoFocus
                    />
                </div>
                <div>
                    <label htmlFor="password-sub" className="block text-sm font-medium text-gray-700">{t('login.subcontractor.password')}</label>
                    <input
                        id="password-sub"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    disabled={isLoading}
                >
                    {isLoading ? t('general.loading') : t('login.subcontractor.loginButton')}
                </button>
            </form>
        </div>
    </div>
  );
};

export default SubcontractorLogin;
