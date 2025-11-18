import React from 'react';
import { CheckinRecord } from '../../types';

interface PendingReturnsProps {
    pendingCheckins: CheckinRecord[];
}

const WarningIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2 text-amber-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
);

const PhoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 inline-block mr-1 text-gray-400">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 6.75Z" />
    </svg>
);

const PendingReturns: React.FC<PendingReturnsProps> = ({ pendingCheckins }) => {
    
    const sortedCheckins = [...pendingCheckins].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center">
                <WarningIcon />
                Chauffeurs en Attente de Retour ({sortedCheckins.length})
            </h2>
            <div className="flex-grow overflow-y-auto">
                {sortedCheckins.length === 0 ? (
                    <div className="flex items-center justify-center h-full bg-green-50 text-green-700 rounded-lg p-4">
                        <p>Tous les chauffeurs partis aujourd'hui sont revenus.</p>
                    </div>
                ) : (
                    <div className="relative overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                                <tr>
                                    <th scope="col" className="px-4 py-3">Heure Départ</th>
                                    <th scope="col" className="px-4 py-3">Nom</th>
                                    <th scope="col" className="px-4 py-3">Tournée</th>
                                    <th scope="col" className="px-4 py-3">Téléphone</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedCheckins.map(record => (
                                    <tr key={`${record.driver.id}-${record.timestamp.getTime()}`} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-900">
                                            {record.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-4 py-3">{record.driver.name}</td>
                                        <td className="px-4 py-3">{record.driver.tour || <span className="text-gray-400">N/A</span>}</td>
                                        <td className="px-4 py-3">
                                            {record.driver.telephone ? (
                                                <a href={`tel:${record.driver.telephone}`} className="text-blue-600 hover:underline flex items-center">
                                                    <PhoneIcon />
                                                    {record.driver.telephone}
                                                </a>
                                            ) : (
                                                <span className="text-gray-400">N/A</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PendingReturns;
