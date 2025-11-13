import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import ChartTitle from './ChartTitle';

interface PieData {
  name: string;
  value: number;
}

interface ComplianceChartProps {
  data: {
    tampon: PieData[];
    horaire: PieData[];
  };
}

const COLORS = ['#00C49F', '#FF8042']; // Green for Conforme, Orange for Non Conforme

const CustomPieChart: React.FC<{ data: PieData[]; title: string }> = ({ data, title }) => (
  <div className="w-1/2 flex flex-col items-center">
    <h4 className="text-sm font-semibold text-gray-600">{title}</h4>
     {data.every(d => d.value === 0) ? (
        <div className="flex items-center justify-center h-full text-xs text-gray-400">Pas de données</div>
      ) : (
      <ResponsiveContainer width="100%" height={120}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={50}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      )}
  </div>
);

const ComplianceChart: React.FC<ComplianceChartProps> = ({ data }) => {
  return (
    <div className="h-80 flex flex-col">
      <ChartTitle>Analyse de Conformité</ChartTitle>
      <div className="flex-grow flex justify-around">
        <CustomPieChart data={data.tampon} title="Tampon du Relais" />
        <CustomPieChart data={data.horaire} title="Horaire de passage casier" />
      </div>
       <div className="flex justify-center mt-2">
        <div className="flex items-center mr-4">
            <div className="w-3 h-3 mr-2" style={{ backgroundColor: COLORS[0] }}></div>
            <span className="text-xs text-gray-600">Conforme</span>
        </div>
        <div className="flex items-center">
            <div className="w-3 h-3 mr-2" style={{ backgroundColor: COLORS[1] }}></div>
            <span className="text-xs text-gray-600">Non Conforme</span>
        </div>
      </div>
    </div>
  );
};

export default ComplianceChart;
