import React from 'react';
import { Zap } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { CustomTooltip } from '../CustomTooltip';

export default function SnowballTab({ stats, teamConf }: any) {
  const gradientOffset = () => {
    if(!stats?.gold_trend) return 0;
    const dataMax = Math.max(...stats.gold_trend.map((i:any) => i.diff));
    const dataMin = Math.min(...stats.gold_trend.map((i:any) => i.diff));
    if (dataMax <= 0) return 0;
    if (dataMin >= 0) return 1;
    return dataMax / (dataMax - dataMin);
  };

  return (
    <div className="bg-[#0b0c10] border border-[#27272a] p-8 rounded-sm">
      <div className="flex justify-between items-center mb-10">
        <div><h3 className="text-2xl font-bold text-white">Montanha-Russa de Ouro (Gold Trend)</h3><p className="text-gray-400 text-sm mt-1">Evolução da vantagem financeira média aos 10, 15, 20 e 25 minutos de jogo.</p></div>
        <Zap size={32} className="text-gray-600" />
      </div>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={stats.gold_trend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset={gradientOffset()} stopColor={teamConf.hex} stopOpacity={0.6}/>
                <stop offset={gradientOffset()} stopColor="#ef4444" stopOpacity={0.6}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis dataKey="tempo" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="#52525b" strokeDasharray="3 3" />
            <Area type="monotone" dataKey="diff" stroke={teamConf.hex} strokeWidth={2} fill="url(#splitColor)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}