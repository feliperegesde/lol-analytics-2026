import React from 'react';
import { Swords, PlayCircle, Loader2 } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { CustomTooltip } from '../CustomTooltip';

export default function SimulatorTab({ 
  opponents, selectedRival, setSelectedRival, seriesFormat, setSeriesFormat, 
  runSim, simulating, simResult, teamConf 
}: any) {
  return (
    <div className="bg-[#0b0c10] border border-[#27272a] p-8 rounded-sm">
      <div className="flex justify-between items-center mb-8">
        <div><h3 className="text-2xl font-bold text-white">Motor de Simulação (Machine Learning)</h3><p className="text-gray-400 text-sm mt-1">10.000 cenários probabilísticos.</p></div>
        <Swords size={32} className="text-gray-600" />
      </div>
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div><label className="text-xs text-gray-400 font-bold uppercase mb-2 block">Adversário</label><select value={selectedRival} onChange={e => setSelectedRival(e.target.value)} className="w-full bg-[#121214] border border-[#27272a] p-3 text-white rounded-sm outline-none font-medium">{opponents.map((o:string) => <option key={o}>{o}</option>)}</select></div>
        <div><label className="text-xs text-gray-400 font-bold uppercase mb-2 block">Série</label><select value={seriesFormat} onChange={e => setSeriesFormat(e.target.value)} className="w-full bg-[#121214] border border-[#27272a] p-3 text-white rounded-sm outline-none font-medium"><option>MD5</option><option>MD3</option></select></div>
        <div className="flex items-end"><button onClick={runSim} className="w-full bg-white text-black font-bold p-3 rounded-sm flex items-center justify-center gap-2 hover:bg-gray-200 transition">{simulating ? <Loader2 size={18} className="animate-spin" /> : <><PlayCircle size={18}/> Executar Algoritmo</>}</button></div>
      </div>

      {simResult && !simulating && (
        <>
          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-[#27272a] mb-10">
            <div className="bg-[#121214] border border-[#27272a] p-6 text-center rounded-sm"><div className="text-[11px] text-gray-500 uppercase tracking-widest font-bold">Chance na Série</div><div className={`text-5xl font-black mt-2 tracking-tighter ${teamConf.color}`}>{simResult.seriesWinRate}%</div></div>
            <div className="bg-[#121214] border border-[#27272a] p-6 text-center rounded-sm"><div className="text-[11px] text-gray-500 uppercase tracking-widest font-bold">Favoritismo por Mapa</div><div className="text-5xl font-black mt-2 tracking-tighter text-white">{simResult.mapWinRate}%</div></div>
            <div className="bg-[#121214] border border-[#27272a] p-6 text-center rounded-sm"><div className="text-[11px] text-gray-500 uppercase tracking-widest font-bold">Placar Exato Provável</div><div className="text-4xl font-black mt-3 tracking-tight text-white">{simResult.mostLikelyScore}</div></div>
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4 block">Distribuição de Probabilidades</span>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={simResult.scores} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <defs><linearGradient id="colorProb" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={teamConf.hex} stopOpacity={0.6}/><stop offset="95%" stopColor={teamConf.hex} stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="score" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="prob" stroke={teamConf.hex} strokeWidth={3} fillOpacity={1} fill="url(#colorProb)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}