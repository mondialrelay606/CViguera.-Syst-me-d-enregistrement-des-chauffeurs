import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import ChartTitle from './ChartTitle';

interface ChartData {
  name: string;
  count: number;
}

interface TopPudosChartProps {
  data: ChartData[];
}

const COLORS = ['#a0006c', '#b00074', '#c0007c', '#d00084', '#e0008c'].reverse();


const TopPudosChart: React.FC<TopPudosChartProps> = ({ data }) => {
  return (
    <div className="h-80">
      <ChartTitle>Top 5 PUDOs/Casiers à Problèmes</ChartTitle>
       {data.length === 0 ? (
         <div className="flex items-center justify-center h-full text-gray-500">Aucun PUDO avec incidents aujourd'hui.</div>
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
                {data.map((entry, index) => (
                    <Cell key={`cell-${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default TopPudosChart;
