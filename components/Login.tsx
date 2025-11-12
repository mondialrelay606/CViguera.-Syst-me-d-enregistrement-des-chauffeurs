import React, { useState, useRef, useEffect } from 'react';

interface LoginProps {
    onDriverLogin: (id: string, password?: string) => boolean;
    onAdminAccess: () => void;
}

const BarcodeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.5A.75.75 0 0 1 4.5 3.75h15a.75.75 0 0 1 .75.75v15a.75.75 0 0 1-.75.75h-15a.75.75 0 0 1-.75-.75v-15Zm.75 0v15h13.5v-15h-13.5ZM8.25 6h.75v12h-.75V6Zm2.25 0h.75v12h-.75V6Zm2.25 0h.75v12h-.75V6Zm2.25 0h.75v12h-.75V6Z" />
    </svg>
);

const Login: React.FC<LoginProps> = ({ onDriverLogin, onAdminAccess }) => {
    const [loginMode, setLoginMode] = useState<'scan' | 'credentials'>('scan');
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const scanInputRef = useRef<HTMLInputElement>(null);
    const idInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (loginMode === 'scan') {
            scanInputRef.current?.focus();
        } else {
            idInputRef.current?.focus();
        }
    }, [loginMode]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        const loginSuccessful = onDriverLogin(id, loginMode === 'credentials' ? password : undefined);
        if (!loginSuccessful) {
            setError('Credenciales incorrectas o chofer no encontrado.');
            if (loginMode === 'credentials') {
                setPassword('');
            }
            setId('');
        }
    };

    const handleScanSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        const loginSuccessful = onDriverLogin(id);
        if (!loginSuccessful) {
            setError(`Código de barras "${id}" no reconocido.`);
            setId('');
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-800">Bienvenido</h1>
                    <p className="text-gray-500">Sistema de Fichaje de Choferes</p>
                </div>
                
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>}

                {loginMode === 'scan' ? (
                    <form onSubmit={handleScanSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="scan-input" className="block text-sm font-medium text-gray-700 text-center mb-2">
                                Escanee su código de barras para iniciar sesión
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><BarcodeIcon/></div>
                                <input
                                    ref={scanInputRef}
                                    id="scan-input"
                                    type="text"
                                    value={id}
                                    onChange={(e) => setId(e.target.value)}
                                    placeholder="Esperando código..."
                                    className="w-full pl-12 pr-4 py-3 text-lg border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    autoFocus
                                />
                            </div>
                        </div>
                        <p className="text-center text-sm">
                            <button type="button" onClick={() => { setLoginMode('credentials'); setError(null); setId(''); }} className="font-medium text-blue-600 hover:text-blue-500">
                                O inicie sesión con usuario y contraseña
                            </button>
                        </p>
                    </form>
                ) : (
                     <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="id-input" className="block text-sm font-medium text-gray-700">ID de Chofer (Código de Barras)</label>
                            <input
                                ref={idInputRef}
                                id="id-input"
                                type="text"
                                value={id}
                                onChange={(e) => setId(e.target.value)}
                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="password-input" className="block text-sm font-medium text-gray-700">Contraseña</label>
                             <input
                                id="password-input"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                        <button type="submit" className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Iniciar Sesión
                        </button>
                         <p className="text-center text-sm">
                            <button type="button" onClick={() => { setLoginMode('scan'); setError(null); setId(''); }} className="font-medium text-blue-600 hover:text-blue-500">
                                O escanee su código de barras
                            </button>
                        </p>
                    </form>
                )}
            </div>

            <div className="mt-6 text-center">
                <button
                    onClick={onAdminAccess}
                    className="text-sm font-medium text-gray-600 hover:text-gray-800"
                >
                    Acceso de Administrador
                </button>
            </div>
        </div>
    );
};

export default Login;
