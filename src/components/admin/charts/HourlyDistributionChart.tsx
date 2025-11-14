import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ChartTitle from './ChartTitle';

interface ChartData {
    hour: string;
    count: number;
}

interface HourlyDistributionChartProps {
  data: ChartData[];
}

const HourlyDistributionChart: React.FC<HourlyDistributionChartProps> = ({ data }) => {
  return (
    <div className="h-80">
      <ChartTitle>Distribution Horaire des Pointages</ChartTitle>
       {data.every(d => d.count === 0) ? (
         <div className="flex items-center justify-center h-full text-gray-500">Aucun pointage aujourd'hui.</div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" name="Pointages" fill="#9c0058" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default HourlyDistributionChart;