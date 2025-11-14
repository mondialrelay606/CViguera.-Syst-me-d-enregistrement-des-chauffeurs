import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ChartTitle from './ChartTitle';

interface ChartData {
  name: string;
  Saturation: number;
  Manquante: number;
  Fermé: number;
}

interface IncidentsBySubcontractorChartProps {
  data: ChartData[];
}

const IncidentsBySubcontractorChart: React.FC<IncidentsBySubcontractorChartProps> = ({ data }) => {
  return (
    <div className="h-80">
      <ChartTitle>Incidents par Sous-traitant</ChartTitle>
      {data.length === 0 ? (
         <div className="flex items-center justify-center h-full text-gray-500">Aucune donnée d'incident aujourd'hui.</div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="Saturation" stackId="a" fill="#8884d8" />
            <Bar dataKey="Manquante" stackId="a" fill="#82ca9d" />
            <Bar dataKey="Fermé" stackId="a" fill="#ffc658" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default IncidentsBySubcontractorChart;