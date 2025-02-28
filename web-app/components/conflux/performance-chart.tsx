"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// Sample data for the performance chart
const generateData = () => {
  const data = [];
  let value = 100;
  
  for (let i = 0; i < 7; i++) {
    // Generate a random change between -3% and +5%
    const change = (Math.random() * 8 - 3) / 100;
    value = value * (1 + change);
    
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: parseFloat(value.toFixed(2)),
    });
  }
  
  return data;
};

export default function PerformanceChart() {
  const [data, setData] = useState(generateData());
  const [isPositive, setIsPositive] = useState(true);
  
  useEffect(() => {
    // Calculate if the trend is positive
    const firstValue = data[0].value;
    const lastValue = data[data.length - 1].value;
    setIsPositive(lastValue > firstValue);
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-950 border border-zinc-800 p-2 text-xs rounded shadow-md">
          <p className="text-zinc-300">{`${label}`}</p>
          <p className="text-indigo-400 font-semibold">{`Value: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <div className="text-xs text-zinc-400">Current Value</div>
          <div className="text-2xl font-semibold">{data[data.length - 1].value}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-zinc-400">24h Change</div>
          <div className={`text-lg font-semibold ${isPositive ? 'text-indigo-400' : 'text-red-500'}`}>
            {isPositive ? '+' : ''}{((data[data.length - 1].value / data[data.length - 2].value - 1) * 100).toFixed(2)}%
          </div>
        </div>
      </div>
      
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#71717a', fontSize: 12 }}
            />
            <YAxis 
              domain={['dataMin - 5', 'dataMax + 5']}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#71717a', fontSize: 12 }}
              width={30}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={isPositive ? "#818cf8" : "#ef4444"} 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: isPositive ? "#818cf8" : "#ef4444" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}