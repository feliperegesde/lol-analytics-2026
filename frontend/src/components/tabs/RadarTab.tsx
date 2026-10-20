import React from 'react';
import { Radar as RadarIcon } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

export default function RadarTab({ formattedRadar, selectedTeam, teamConf }: any) {
  return (
    <div className="bg-[#0b0c10] border border-[#27272a] p-8 rounded-sm">
      <div className="flex justify-between items-center mb-6">
        <div><h3 className="text-2xl font-bold text-white">Radar Tático Oficial</h3><p className="text-gray-400 text-sm mt-1">Comparação de Fundamentos contra a liga.</p></div>
        <RadarIcon size={32} className="text-gray-600" />
      </div>
      {formattedRadar.length > 0 && (
        <div className="h-[500px] w-full flex justify-center items-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={formattedRadar}>
              <PolarGrid stroke="#27272a" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#d4d4d8', fontSize: 13, fontWeight: 'bold' }} />
              <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
              <Radar name={selectedTeam} dataKey="Time" stroke={teamConf.hex} strokeWidth={2} fill={teamConf.hex} fillOpacity={0.4} />
              <Radar name="Média da Liga" dataKey="Liga" stroke="#71717a" strokeWidth={2} fill="#71717a" fillOpacity={0.2} />
              <Tooltip contentStyle={{backgroundColor: '#121214', border: '1px solid #27272a', borderRadius: '4px'}} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}