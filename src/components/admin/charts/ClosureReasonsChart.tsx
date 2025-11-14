import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import ChartTitle from './ChartTitle';

interface ChartData {
  name: string;
  value: number;
}

interface ClosureReasonsChartProps {
  data: ChartData[];
}

const COLORS = ['#FFBB28', '#FF8042', '#0088FE', '#00C49F'];

const ClosureReasonsChart: React.FC<ClosureReasonsChartProps> = ({ data }) => {
  return (
    <div className="h-80">
      <ChartTitle>Analyse des Fermetures PUDO/APM</ChartTitle>
      {data.length === 0 ? (
         <div className="flex items-center justify-center h-full text-gray-500">Aucun PUDO/APM fermé aujourd'hui.</div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            >
              {data.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend wrapperStyle={{ bottom: 0 }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default ClosureReasonsChart;