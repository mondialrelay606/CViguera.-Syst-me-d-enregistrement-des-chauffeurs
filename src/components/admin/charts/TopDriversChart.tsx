import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import ChartTitle from './ChartTitle';

interface ChartData {
  name: string;
  count: number;
}

interface TopDriversChartProps {
  data: ChartData[];
}

const COLORS = ['#a0006c', '#b00074', '#c0007c', '#d00084', '#e0008c'].reverse();

const TopDriversChart: React.FC<TopDriversChartProps> = ({ data }) => {
  return (
    <div className="h-80">
      <ChartTitle>Top 5 Chauffeurs par Incidents</ChartTitle>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">Aucun chauffeur avec incidents aujourd'hui.</div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" allowDecimals={false} />
            <YAxis 
                type="category" 
                dataKey="name" 
                width={80} 
                tick={{ fontSize: 10 }} 
                interval={0}
            />
            <Tooltip />
            <Bar dataKey="count" name="Incidents">
               {data.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default TopDriversChart;