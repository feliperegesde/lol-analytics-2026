import React from 'react';

export const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#121214] border border-[#27272a] p-3 rounded-md shadow-lg">
        <p className="text-gray-400 text-xs font-bold mb-1">{label}</p>
        <p className="text-white text-sm font-mono">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};