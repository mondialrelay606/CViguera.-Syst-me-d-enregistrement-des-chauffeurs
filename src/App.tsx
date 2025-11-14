import React, { useState, useEffect, useRef } from 'react';
import { Driver, CheckinRecord, ScanStatus, type ScanResult as ScanResultType, CheckinType, ReturnReport } from './types';
import { driverService } from './services/driverService';
import Clock from './components/Clock';
import ScanResult from './components/ScanResult';
import CheckinLog from './components/CheckinLog';
import AdminLoginModal from './components/admin/AdminLoginModal';
import AdminDashboard from './components/admin/AdminDashboard';
import { isToday } from './utils/dateUtils';

// --- Constantes de la aplicación ---
const ADMIN_PASSWORD = 'admin'; // Dans une application réelle, cela devrait être sécurisé.
const CHECKIN_LOG_STORAGE_key = 'checkinLog';
const RETURN_REPORTS_STORAGE_KEY = 'returnReports';


const IdentificationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z" />
    </svg>
);

const AdminIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
    </svg>
);


const App: React.FC = () => {
    const [allDrivers, setAllDrivers] = useState<Driver[]>([]);
    const [checkinLog, setCheckinLog] = useState<CheckinRecord[]>(() => {
        try {
            const savedLog = localStorage.getItem(CHECKIN_LOG_STORAGE_key);
            if (!savedLog) return [];
            const parsedLog: (Omit<CheckinRecord, 'timestamp'> & { timestamp: string })[] = JSON.parse(savedLog);
            return parsedLog.map(r => ({
                ...r, 
                timestamp: new Date(r.timestamp),
            }));
        } catch (error) {
            console.error("Erreur lors du chargement de l'historique des pointages :", error);
            return [];
        }
    });
    const [returnReports, setReturnReports] = useState<ReturnReport[]>(() => {
        try {
            const savedReports = localStorage.getItem(RETURN_REPORTS_STORAGE_KEY);
            return savedReports ? JSON.parse(savedReports) : [];
        } catch (error) {
            console.error("Erreur lors du chargement des rapports de retour :", error);
            return [];
        }
    });
    const [identifier, setIdentifier] = useState('');
    const [lastScanResult, setLastScanResult] = useState<ScanResultType>({ status: ScanStatus.IDLE, message: '' });
    const [loading, setLoading] = useState(true);
    const [checkinType, setCheckinType] = useState<CheckinType>(CheckinType.DEPARTURE);
    const [hasUniform, setHasUniform] = useState(true);
    
    const [isAdminView, setIsAdminView] = useState(false);
    const [showAdminLogin, setShowAdminLogin] = useState(false);
    
    const identifierInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const loadDrivers = async () => {
            try {
                const drivers = await driverService.fetchDrivers();
                setAllDrivers(drivers);
            } catch (error) {
                console.error("Erreur lors du chargement des chauffeurs :", error);
                setLastScanResult({ status: ScanStatus.ERROR, message: 'Impossible de charger la liste des chauffeurs.' });
            } finally {
                setLoading(false);
            }
        };
        loadDrivers();
        identifierInputRef.current?.focus();
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(CHECKIN_LOG_STORAGE_key, JSON.stringify(checkinLog));
        } catch (error) {
            console.error("Erreur lors de la sauvegarde de l'historique des pointages :", error);
        }
    }, [checkinLog]);

    useEffect(() => {
        try {
            localStorage.setItem(RETURN_REPORTS_STORAGE_KEY, JSON.stringify(returnReports));
        } catch (error) {
            console.error("Erreur lors de la sauvegarde des rapports de retour :", error);
        }
    }, [returnReports]);

    const handleScan = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!identifier.trim()) return;

        const foundDriver = allDrivers.find(driver => driver.id === identifier.trim());

        if (foundDriver) {
            const driverCheckinsToday = checkinLog
                .filter(record => record.driver.id === foundDriver.id && isToday(record.timestamp))
                .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
            
            const lastCheckinType = driverCheckinsToday.length > 0 ? driverCheckinsToday[0].type : null;

            if (checkinType === CheckinType.DEPARTURE && lastCheckinType === CheckinType.DEPARTURE) {
                setLastScanResult({
                    status: ScanStatus.ERROR,
                    message: `Erreur : ${foundDriver.name} a déjà un départ enregistré sans retour. Ne peut pas pointer 'Départ' à nouveau.`
                });
                setIdentifier('');
                return;
            }

            if (checkinType === CheckinType.RETURN && lastCheckinType !== CheckinType.DEPARTURE) {
                setLastScanResult({
                    status: ScanStatus.ERROR,
                    message: `Erreur : ${foundDriver.name} ne peut pas pointer 'Retour' sans un 'Départ' préalable aujourd'hui.`
                });
                setIdentifier('');
                return;
            }

            const newRecord: CheckinRecord = {
                driver: foundDriver,
                timestamp: new Date(),
                type: checkinType,
            };
            
            let successMessage = `[${checkinType}] ${foundDriver.name} pointage réussi.`;
            if (checkinType === CheckinType.DEPARTURE) {
                newRecord.hasUniform = hasUniform;
                successMessage = `[${checkinType}] ${foundDriver.name} pointé (Tenue: ${hasUniform ? 'Oui' : 'Non'}).`;
            }

            setCheckinLog(prevLog => [newRecord, ...prevLog]);
            setLastScanResult({ status: ScanStatus.SUCCESS, message: successMessage });
        
        } else {
            setLastScanResult({ status: ScanStatus.ERROR, message: `Identifiant "${identifier}" non trouvé. Veuillez vérifier le chauffeur.` });
        }
        setIdentifier('');
        setHasUniform(true);
    };

    const handleAdminLogin = (password: string) => {
        if (password === ADMIN_PASSWORD) {
            setIsAdminView(true);
            setShowAdminLogin(false);
        } else {
            alert('Mot de passe incorrect.');
        }
    };
    
    const handleLogout = () => {
        setIsAdminView(false);
        identifierInputRef.current?.focus();
    };

    const handleUpdateDrivers = async (newDrivers: Driver[]) => {
        try {
            await driverService.updateDrivers(newDrivers);
            setAllDrivers(newDrivers);
            alert('La liste des chauffeurs a été mise à jour avec succès.');
        } catch (error) {
            alert('Erreur lors de la mise à jour de la liste des chauffeurs.');
            console.error(error);
        }
    };

    const handleUpdateSingleDriver = async (updatedDriver: Driver) => {
        try {
            await driverService.updateSingleDriver(updatedDriver);
            setAllDrivers(prevDrivers => 
                prevDrivers.map(d => d.id === updatedDriver.id ? updatedDriver : d)
            );
        } catch (error) {
            alert('Erreur lors de la mise à jour du chauffeur.');
            console.error(error);
        }
    };
    
    const handleUpdateCheckinComment = (checkinId: string, comment: string) => {
        setCheckinLog(prevLog => {
            return prevLog.map(record => {
                const currentId = `${record.driver.id}-${record.timestamp.getTime()}`;
                if (currentId === checkinId) {
                    return { ...record, departureComment: comment };
                }
                return record;
            });
        });
    };

    const handleDeleteDriver = async (driverId: string) => {
        if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le chauffeur avec l'ID ${driverId} ? Cette action est irréversible.`)) {
            return;
        }
        try {
            await driverService.deleteDriver(driverId);
            setAllDrivers(prevDrivers => prevDrivers.filter(d => d.id !== driverId));
            alert('Chauffeur supprimé avec succès.');
        } catch (error) {
            alert('Erreur lors de la suppression du chauffeur.');
            console.error(error);
        }
    };
    
    const handleAddReport = (newReport: ReturnReport) => {
        setReturnReports(prevReports => [newReport, ...prevReports]);
    };

    const handleUpdateReport = (updatedReport: ReturnReport) => {
        setReturnReports(prevReports => 
            prevReports.map(report => 
                report.id === updatedReport.id ? updatedReport : report
            )
        );
    };
    
    const handleClearOldCheckins = () => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer tous les pointages des jours précédents ? Seuls les pointages d'aujourd'hui seront conservés. Cette action est irréversible.")) {
            return;
        }
        setCheckinLog(prevLog => prevLog.filter(record => isToday(record.timestamp)));
        alert('Les anciens pointages ont été supprimés.');
    };

    const handleClearAllReports = () => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer TOUS les rapports de retour ? Cette action est irréversible et supprimera tout l'historique des rapports.")) {
            return;
        }
        setReturnReports([]);
        alert('Tous les rapports de retour ont été supprimés.');
    };
    
    const refreshData = async () => {
        // Recharger les chauffeurs
        try {
            const drivers = await driverService.fetchDrivers();
            setAllDrivers(drivers);
        } catch (error) {
            console.error("Erreur lors du rafraîchissement des chauffeurs :", error);
        }

        // Recharger l'historique des pointages
        try {
            const savedLog = localStorage.getItem(CHECKIN_LOG_STORAGE_key);
            const parsedLog = savedLog ? JSON.parse(savedLog) : [];
            setCheckinLog(parsedLog.map((r: any) => ({ ...r, timestamp: new Date(r.timestamp) })));
        } catch (error) {
            console.error("Erreur lors du rafraîchissement de l'historique des pointages :", error);
            setCheckinLog([]);
        }
        
        // Recharger les rapports de retour
        try {
            const savedReports = localStorage.getItem(RETURN_REPORTS_STORAGE_KEY);
            setReturnReports(savedReports ? JSON.parse(savedReports) : []);
        } catch (error) {
            console.error("Erreur lors du rafraîchissement des rapports de retour :", error);
            setReturnReports([]);
        }
    };

    if (isAdminView) {
        return <AdminDashboard 
            allRecords={checkinLog} 
            allDrivers={allDrivers} 
            allReports={returnReports}
            onLogout={handleLogout} 
            onUpdateDrivers={handleUpdateDrivers}
            onUpdateSingleDriver={handleUpdateSingleDriver}
            onUpdateCheckinComment={handleUpdateCheckinComment}
            onDeleteDriver={handleDeleteDriver}
            onAddReport={handleAddReport}
            onUpdateReport={handleUpdateReport}
            onClearOldCheckins={handleClearOldCheckins}
            onClearAllReports={handleClearAllReports}
            onRefreshData={refreshData}
        />;
    }

    return (
        <>
            <AdminLoginModal
                isOpen={showAdminLogin}
                onClose={() => setShowAdminLogin(false)}
                onLogin={handleAdminLogin}
            />
            <div className="min-h-screen p-4 sm:p-6 lg:p-8 flex flex-col">
                <header className="mb-6">
                    <div className="relative text-center">
                        <h1 className="text-4xl font-bold text-[#9c0058]">Système de Pointage des Chauffeurs</h1>
                        <p className="text-lg text-gray-600">Enregistrement des arrivées par Identifiant</p>
                        <button
                            onClick={() => setShowAdminLogin(true)}
                            className="absolute top-0 right-0 flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-all"
                            aria-label="Accès administrateur"
                        >
                            <AdminIcon />
                            <span>Administration</span>
                        </button>
                    </div>
                </header>
                <main className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Columna Izquierda: Escaneo y Reloj */}
                    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-center space-y-6">
                        <Clock />
                        <div className="w-full max-w-md mx-auto">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <button
                                    onClick={() => setCheckinType(CheckinType.DEPARTURE)}
                                    className={`py-4 px-4 rounded-lg text-lg font-semibold transition-all duration-200 ${checkinType === CheckinType.DEPARTURE ? 'bg-[#9c0058] text-white shadow-lg scale-105' : 'bg-gray-200 text-gray-700 hover:bg-fuchsia-100'}`}
                                >
                                    {CheckinType.DEPARTURE}
                                </button>
                                <button
                                    onClick={() => setCheckinType(CheckinType.RETURN)}
                                    className={`py-4 px-4 rounded-lg text-lg font-semibold transition-all duration-200 ${checkinType === CheckinType.RETURN ? 'bg-[#9c0058] text-white shadow-lg scale-105' : 'bg-gray-200 text-gray-700 hover:bg-fuchsia-100'}`}
                                >
                                    {CheckinType.RETURN}
                                </button>
                            </div>
                            
                            {checkinType === CheckinType.DEPARTURE && (
                                <div className="flex items-center justify-center mb-4 p-3 bg-fuchsia-50 rounded-lg">
                                    <input
                                        id="uniform-check"
                                        type="checkbox"
                                        checked={hasUniform}
                                        onChange={(e) => setHasUniform(e.target.checked)}
                                        className="h-5 w-5 rounded border-gray-300 text-[#9c0058] focus:ring-[#9c0058]"
                                    />
                                    <label htmlFor="uniform-check" className="ml-3 text-base font-medium text-gray-800">
                                        Porte la tenue
                                    </label>
                                </div>
                            )}


                            <form onSubmit={handleScan}>
                                <label htmlFor="identifier-input" className="block text-sm font-medium text-gray-700 mb-2 text-center">
                                    Saisir l'Identifiant du chauffeur
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <IdentificationIcon />
                                    </div>
                                    <input
                                        ref={identifierInputRef}
                                        id="identifier-input"
                                        type="text"
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        placeholder="En attente de l'Identifiant..."
                                        className="w-full pl-14 pr-4 py-3 text-lg border-gray-300 rounded-lg shadow-sm focus:ring-[#9c0058] focus:border-[#9c0058]"
                                        autoFocus
                                    />
                                </div>
                            </form>
                            <ScanResult result={lastScanResult} />
                        </div>
                    </div>

                    {/* Columna Derecha: Registros */}
                     <div className="flex flex-col min-h-[500px]">
                         {loading ? (
                            <div className="flex items-center justify-center h-full bg-white rounded-lg shadow-md">
                                <p className="text-gray-500">Chargement des données...</p>
                            </div>
                        ) : (
                           <CheckinLog records={checkinLog.filter(record => isToday(record.timestamp))} />
                        )}
                    </div>
                </main>
                <footer className="text-center py-4">
                    <p className="text-xs text-gray-500">Développé par cviguera</p>
                </footer>
            </div>
        </>
    );
};

export default App;
