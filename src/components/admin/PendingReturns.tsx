import React from 'react';
import { CheckinRecord } from '../../types';

interface PendingReturnsProps {
    pendingCheckins: CheckinRecord[];
}

const PendingReturns: React.FC<PendingReturnsProps> = ({ pendingCheckins }) => {
    return (
        <div className="h-full flex flex-col">
            <h2 className="text-xl font-bold text-gray-700 mb-4">
                Chauffeurs en Attente de Retour ({pendingCheckins.length})
            </h2>
            <div className="flex-grow overflow-y-auto">
                {pendingCheckins.length === 0 ? (
                    <div className="flex items-center justify-center h-full bg-green-50 text-green-700 rounded-lg p-4">
                        {/* FIX: Corrected mixed-language string from Spanish "Todos los" to French "Tous les" */}
                        <p>Tous les chauffeurs partis aujourd'hui sont revenus.</p>
                    </div>
                ) : (
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                            <tr>
                                <th scope="col" className="px-4 py-2">Heure Départ</th>
                                <th scope="col" className="px-4 py-2">Nom</th>
                                <th scope="col" className="px-4 py-2">Sous-traitant</th>
                                <th scope="col" className="px-4 py-2">Tournée</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingCheckins.map(record => (
                                <tr key={record.driver.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-4 py-2 font-medium text-gray-900">
                                        {record.timestamp.toLocaleTimeString('fr-FR')}
                                    </td>
                                    <td className="px-4 py-2">{record.driver.name}</td>
                                    <td className="px-4 py-2">{record.driver.subcontractor}</td>
                                    <td className="px-4 py-2">{record.driver.tour}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default PendingReturns;