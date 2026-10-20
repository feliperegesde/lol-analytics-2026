import React from 'react';
import { Target } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { CustomTooltip } from '../CustomTooltip';

export default function ObjectivesTab({ stats, teamConf }: any) {
  const objData = stats?.obj_rates ? stats.obj_rates : [];

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-[#0b0c10] border border-[#27272a] p-8 rounded-sm flex flex-col justify-between">
        <div className="flex justify-between items-center mb-10">
          <div><h3 className="text-2xl font-bold text-white">Prioridade de Objetivos Iniciais</h3><p className="text-gray-400 text-sm mt-1">Taxas de domínio do 1º objetivo do mapa.</p></div>
          <Target size={32} className="text-gray-600" />
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={objData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={true} vertical={false} />
              <XAxis type="number" stroke="#71717a" fontSize={12} domain={[0, 100]} />
              <YAxis type="category" dataKey="name" stroke="#71717a" fontSize={12} width={80} />
              <Tooltip cursor={{fill: '#18181b'}} content={<CustomTooltip />} />
              <Bar dataKey="Taxa" fill={teamConf.hex} radius={[0, 4, 4, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[#0b0c10] border border-[#27272a] p-8 rounded-sm">
        <div className="mb-6"><h3 className="text-2xl font-bold text-white">Perfil de Dragões (Drakes)</h3><p className="text-gray-400 text-sm mt-1">Proporção dos elementos abatidos pela equipe.</p></div>
        {stats.dragons && stats.dragons.length > 0 ? (
          <div className="h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.dragons} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
                  {stats.dragons.map((entry:any, index:number) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                </Pie>
                <Tooltip contentStyle={{backgroundColor: '#121214', border: '1px solid #27272a', borderRadius: '4px'}} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 ml-4">
              {stats.dragons.map((d:any, i:number) => (
                <div key={i} className="flex items-center gap-2 text-xs text-gray-300"><span className="w-3 h-3 rounded-full" style={{backgroundColor: d.fill}}></span>{d.name}: {d.value}</div>
              ))}
            </div>
          </div>
        ) : <div className="h-72 flex items-center justify-center text-gray-600">Sem abates de dragão computados.</div>}
      </div>
    </div>
  );
}