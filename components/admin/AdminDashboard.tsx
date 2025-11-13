import React, { useState, useMemo } from 'react';
import { CheckinRecord, DailyStats, Driver, CheckinType, ReturnReport } from '../../types';
import { exportCheckinsToExcel } from '../../utils/excelExporter';
import { parseDriversCSV } from '../../utils/csvParser';
import { calculateDailyStats, getPendingReturnCheckins } from '../../utils/reporting';
import SummaryCard from './SummaryCard';
import DriverList from '../DriverList';
import ReturnReportManager from './ReturnReportManager';
import PendingReturns from './PendingReturns';

interface AdminDashboardProps {
  allRecords: CheckinRecord[];
  allDrivers: Driver[];
  allReports: ReturnReport[];
  onLogout: () => void;
  onUpdateDrivers: (newDrivers: Driver[]) => void;
  onUpdateSingleDriver: (driver: Driver) => void;
  onUpdateCheckinComment: (checkinId: string, comment: string) => void;
  onDeleteDriver: (driverId: string) => void;
  onAddReport: (newReport: ReturnReport) => void;
  onUpdateReport: (updatedReport: ReturnReport) => void;
  onClearOldCheckins: () => void;
  onClearAllReports: () => void;
}

const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
    </svg>
);

const ExportExcelIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 21v-7.5h17.25V21H3.375Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 13.5v-7.5A2.25 2.25 0 0 1 5.625 3.75h12.75c1.24 0 2.25 1.01 2.25 2.25v7.5" />
    </svg>
);

const ArchiveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
        <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m5.25 4.5h3.75" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 7.5h16.5v-1.5a1.5 1.5 0 0 0-1.5-1.5h-13.5a1.5 1.5 0 0 0-1.5 1.5v1.5Z" />
    </svg>
);

const AddCommentIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-600 hover:text-green-800">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

const EditCommentIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-blue-600 hover:text-blue-800">
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
);


const AdminDashboard: React.FC<AdminDashboardProps> = ({ allRecords, allDrivers, allReports, onLogout, onUpdateDrivers, onUpdateSingleDriver, onUpdateCheckinComment, onDeleteDriver, onAddReport, onUpdateReport, onClearOldCheckins, onClearAllReports }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'stats' | 'drivers' | 'reports'>('stats');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  const dailyStats = useMemo(() => calculateDailyStats(allRecords), [allRecords]);
  const pendingReturns = useMemo(() => getPendingReturnCheckins(allRecords), [allRecords]);


  const filteredRecords = useMemo(() => {
    if (!searchTerm.trim()) return allRecords;
    const lowercasedFilter = searchTerm.toLowerCase();
    return allRecords.filter(record => {
      const uniformText = record.type === CheckinType.DEPARTURE ? (record.hasUniform ? 'oui' : 'non') : '';
      return record.driver.name.toLowerCase().includes(lowercasedFilter) ||
        record.driver.subcontractor.toLowerCase().includes(lowercasedFilter) ||
        record.driver.tour.toLowerCase().includes(lowercasedFilter) ||
        record.driver.telephone.toLowerCase().includes(lowercasedFilter) ||
        record.timestamp.toLocaleString('fr-FR').includes(lowercasedFilter) ||
        record.type.toLowerCase().includes(lowercasedFilter) ||
        uniformText.includes(lowercasedFilter) ||
        (record.departureComment && record.departureComment.toLowerCase().includes(lowercasedFilter));
    });
  }, [allRecords, searchTerm]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target?.result as string;
        try {
            const newDrivers = parseDriversCSV(text);
            if (newDrivers.length > 0) {
                onUpdateDrivers(newDrivers);
            } else {
                alert("Le fichier CSV est vide ou son format est incorrect.");
            }
        } catch (error) {
            console.error("Erreur lors de l'analyse du CSV :", error);
            alert(`Erreur lors du traitement du fichier : ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleEditCommentClick = (record: CheckinRecord) => {
    const checkinId = `${record.driver.id}-${record.timestamp.getTime()}`;
    setEditingCommentId(checkinId);
    setCommentText(record.departureComment || '');
  };

  const handleSaveComment = () => {
    if (editingCommentId) {
      onUpdateCheckinComment(editingCommentId, commentText);
      setEditingCommentId(null);
      setCommentText('');
    }
  };

  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setCommentText('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Tableau de Bord Administration</h1>
        <button
          onClick={onLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 flex items-center transition-colors"
        >
          <LogoutIcon />
          Retour au Kiosque
        </button>
      </header>
      
      <div className="mb-4 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                  onClick={() => setActiveTab('stats')}
                  className={`${activeTab === 'stats' ? 'border-[#9c0058] text-[#9c0058]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg`}
              >
                  Statistiques et Pointages
              </button>
               <button
                  onClick={() => setActiveTab('reports')}
                  className={`${activeTab === 'reports' ? 'border-[#9c0058] text-[#9c0058]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg`}
              >
                  Rapports de Retour
              </button>
              <button
                  onClick={() => setActiveTab('drivers')}
                  className={`${activeTab === 'drivers' ? 'border-[#9c0058] text-[#9c0058]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg`}
              >
                  Gestion des Chauffeurs
              </button>
          </nav>
      </div>

      <main>
        <div className={activeTab === 'stats' ? 'block' : 'hidden'}>
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <SummaryCard title="Pointages Totaux (Aujourd'hui)" value={dailyStats.totalCheckins.toString()} />
              <SummaryCard title="Chauffeurs Uniques (Aujourd'hui)" value={dailyStats.uniqueDrivers.toString()} />
            </section>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-1 bg-white p-6 rounded-lg shadow-md">
                 <PendingReturns pendingCheckins={pendingReturns} />
              </div>
              <div className="xl:col-span-2 bg-white p-6 rounded-lg shadow-md flex flex-col">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                  <h2 className="text-xl font-bold text-gray-700">Historique des Pointages ({filteredRecords.length})</h2>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <button
                        onClick={onClearOldCheckins}
                        className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50 flex items-center justify-center transition-colors"
                        disabled={allRecords.length === 0}
                        title="Supprimer tous les pointages des jours précédents"
                    >
                        <ArchiveIcon />
                        Nettoyer Anciens
                    </button>
                    <button
                        onClick={() => exportCheckinsToExcel(allRecords, `historial_fichajes_${new Date().toISOString().split('T')[0]}.xlsx`)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 flex items-center justify-center transition-colors"
                        disabled={allRecords.length === 0}
                    >
                        <ExportExcelIcon />
                        Exporter vers Excel
                    </button>
                  </div>
                </div>
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Rechercher par nom, sous-traitant, tournée, téléphone, commentaire..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-[#9c0058] focus:border-[#9c0058]"
                    />
                </div>
                <div className="flex-grow overflow-y-auto h-96">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                            <tr>
                                <th scope="col" className="px-6 py-3">Date et Heure</th>
                                <th scope="col" className="px-6 py-3">Nom</th>
                                <th scope="col" className="px-6 py-3">Sous-traitant</th>
                                <th scope="col" className="px-6 py-3">Tournée</th>
                                <th scope="col" className="px-6 py-3">Type</th>
                                <th scope="col" className="px-6 py-3">Tenue</th>
                                <th scope="col" className="px-6 py-3">Commentaire</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRecords.map((record) => {
                                const checkinId = `${record.driver.id}-${record.timestamp.getTime()}`;
                                const isEditingComment = editingCommentId === checkinId;

                                return (
                                <tr key={checkinId} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                        {record.timestamp.toLocaleString('fr-FR')}
                                    </td>
                                    <td className="px-6 py-4">{record.driver.name}</td>
                                    <td className="px-6 py-4">{record.driver.subcontractor}</td>
                                    <td className="px-6 py-4">{record.driver.tour}</td>
                                    <td className="px-6 py-4">
                                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${ record.type === CheckinType.DEPARTURE ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800' }`}>
                                            {record.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {record.type === CheckinType.DEPARTURE
                                            ? (record.hasUniform ? 'Oui' : 'Non')
                                            : <span className="text-gray-400">N/A</span>
                                        }
                                    </td>
                                    <td className="px-6 py-4 text-xs text-gray-600">
                                      {isEditingComment ? (
                                        <div className="flex flex-col gap-2">
                                            <textarea 
                                                value={commentText} 
                                                onChange={(e) => setCommentText(e.target.value)}
                                                className="w-full p-1 border rounded"
                                                rows={2}
                                                autoFocus
                                            />
                                            <div className="flex gap-2">
                                                <button onClick={handleSaveComment} className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700">Enregistrer</button>
                                                <button onClick={handleCancelEditComment} className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600">Annuler</button>
                                            </div>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-2">
                                            <span className="max-w-[180px] truncate" title={record.departureComment}>{record.departureComment || (record.type === CheckinType.DEPARTURE ? '' : <span className="text-gray-400">---</span>)}</span>
                                            {record.type === CheckinType.DEPARTURE && (
                                                <button onClick={() => handleEditCommentClick(record)} title={record.departureComment ? 'Modifier le Commentaire' : 'Ajouter un Commentaire'}>
                                                    {record.departureComment ? <EditCommentIcon /> : <AddCommentIcon />}
                                                </button>
                                            )}
                                        </div>
                                      )}
                                    </td>
                                </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {filteredRecords.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            <p>Aucun enregistrement correspondant à la recherche n'a été trouvé.</p>
                        </div>
                    )}
                </div>
              </div>
            </div>
        </div>

        <div className={activeTab === 'reports' ? 'block' : 'hidden'}>
            <ReturnReportManager 
                allReports={allReports}
                allRecords={allRecords}
                allDrivers={allDrivers}
                onAddReport={onAddReport}
                onUpdateReport={onUpdateReport}
                onClearAllReports={onClearAllReports}
            />
        </div>

        <div className={activeTab === 'drivers' ? 'block' : 'hidden'}>
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-bold text-gray-700 mb-4">Mettre à Jour la Liste des Chauffeurs</h2>
                <p className="text-sm text-gray-600 mb-4">
                    Téléchargez un fichier au format CSV pour remplacer la liste actuelle. Le fichier doit contenir les colonnes : <code className="bg-gray-200 text-sm p-1 rounded">Nom,Sous-traitant,Plaque,Tournée,Identifiant,telephone</code>.
                </p>
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-fuchsia-50 file:text-[#9c0058] hover:file:bg-fuchsia-100"
                />
            </div>
            <div className="h-[600px]">
                <DriverList 
                  drivers={allDrivers} 
                  onUpdateDriver={onUpdateSingleDriver}
                  onDeleteDriver={onDeleteDriver}
                />
            </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;