import React, { useEffect, useState } from 'react';
import { Loader2, Globe, Trophy, ShieldBan, Crosshair } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { api } from '../../api';

const getChampionIcon = (champName: string) => {
  if (!champName) return "";
  let formatted = champName.replace(/['\s\.]/g, '');
  if (formatted === "Wukong") formatted = "MonkeyKing";
  if (formatted === "RenataGlasc") formatted = "Renata";
  if (formatted === "KSMante" || formatted === "KSante") formatted = "KSante";
  return `https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${formatted}.png`;
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#121214] border border-[#27272a] p-3 rounded-md shadow-lg">
        <p className="text-white text-xs font-bold mb-1">{payload[0].payload.teamname || payload[0].name}</p>
        <p className="text-gray-400 text-xs">Win Rate: <span className="text-white">{payload[0].value}%</span></p>
      </div>
    );
  }
  return null;
};

// RECEBEMOS O globalTourney COMO PROP
export default function MetaTab({ teamConf, globalTourney }: any) {
  const [metaData, setMetaData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // RECARREGA QUANDO A REGIÃO MUDA
  useEffect(() => {
    setLoading(true);
    api.getGlobalMeta(globalTourney).then(data => {
      if(!data.error) setMetaData(data);
      else setMetaData(null);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [globalTourney]);

  if (loading) return <div className="flex justify-center py-32"><Loader2 className={`animate-spin ${teamConf.color}`} size={48} /></div>;
  if (!metaData) return <div className="text-center py-32 text-gray-500">Dados do Meta insuficientes para a região selecionada.</div>;

  const sideData = metaData.side_stats.map((s: any) => ({
    name: s.side === "Blue" ? "Lado Azul" : "Lado Vermelho",
    value: s.win_rate,
    color: s.side === "Blue" ? "#3b82f6" : "#ef4444"
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-sm shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6"><span className="text-[10px] tracking-widest font-bold text-black uppercase">Partidas Analisadas</span><Globe size={16} className="text-black" /></div>
          <div className="text-5xl font-black text-black tracking-tight">{metaData.total_games}</div>
        </div>
        <div className="bg-[#121214] border border-[#27272a] p-6 rounded-sm">
          <div className="flex justify-between items-start mb-6"><span className="text-[10px] tracking-widest font-bold text-gray-500 uppercase">Win Rate (Blue Side)</span><div className="w-3 h-3 bg-blue-500 rounded-full"></div></div>
          <div className="text-5xl font-black text-white tracking-tight">{sideData.find((s:any)=>s.color === "#3b82f6")?.value || 0}%</div>
        </div>
        <div className="bg-[#121214] border border-[#27272a] p-6 rounded-sm">
          <div className="flex justify-between items-start mb-6"><span className="text-[10px] tracking-widest font-bold text-gray-500 uppercase">Win Rate (Red Side)</span><div className="w-3 h-3 bg-red-500 rounded-full"></div></div>
          <div className="text-5xl font-black text-white tracking-tight">{sideData.find((s:any)=>s.color === "#ef4444")?.value || 0}%</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#0b0c10] border border-[#27272a] p-8 rounded-sm col-span-2 flex flex-col justify-between">
          <div className="mb-8">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2 block">Ranking de Equipes ({globalTourney === 'Todos' ? 'Mundo' : globalTourney})</span>
            <h3 className="text-2xl font-bold text-white">Top 5 Times (Win Rate)</h3>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metaData.top_teams} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#71717a" fontSize={12} domain={[0, 100]} hide />
                <YAxis type="category" dataKey="teamname" stroke="#d4d4d8" fontSize={12} width={100} axisLine={false} tickLine={false} fontWeight="bold" />
                <Tooltip cursor={{fill: '#18181b'}} content={<CustomTooltip />} />
                <Bar dataKey="win_rate" name="Win Rate" fill={teamConf.hex} radius={[0, 4, 4, 0]} barSize={24}>
                  {metaData.top_teams.map((entry: any, index: number) => <Cell key={`cell-${index}`} fillOpacity={0.8} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#0b0c10] border border-[#27272a] p-8 rounded-sm">
           <div className="mb-6"><h3 className="text-xl font-bold text-white">Lado Vencedor</h3><p className="text-gray-400 text-xs mt-1">Impacto do lado do mapa.</p></div>
           <div className="h-48 flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie data={sideData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                   {sideData.map((entry:any, index:number) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                 </Pie>
                 <Tooltip contentStyle={{backgroundColor: '#121214', border: '1px solid #27272a', borderRadius: '4px'}} />
               </PieChart>
             </ResponsiveContainer>
           </div>
           <div className="flex justify-center gap-6 mt-4">
             <div className="flex items-center gap-2 text-xs text-gray-300"><span className="w-3 h-3 rounded-full bg-blue-500"></span>Lado Azul</div>
             <div className="flex items-center gap-2 text-xs text-gray-300"><span className="w-3 h-3 rounded-full bg-red-500"></span>Lado Vermelho</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#0b0c10] border border-[#27272a] p-8 rounded-sm">
          <div className="flex justify-between items-center mb-6">
            <div><span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1 block">Tier List</span><h3 className="text-xl font-bold text-white">Top 5 Picks ({globalTourney === 'Todos' ? 'Global' : globalTourney})</h3></div>
            <Crosshair size={24} className="text-gray-600" />
          </div>
          <div>
            {(metaData.top_picks || []).map((champ: any, idx: number) => (
              <div key={idx} className="flex items-center gap-4 mb-4">
                <img src={getChampionIcon(champ.champion)} alt={champ.champion} className="w-10 h-10 rounded-sm border border-[#27272a] shadow-sm" />
                <div className="flex-1">
                  <div className="flex justify-between mb-1 items-end"><span className="text-white font-bold text-sm">{champ.champion}</span><span className="text-gray-400 text-[10px] font-mono">{champ.rate}% Pick Rate</span></div>
                  <div className="w-full bg-[#18181b] h-1.5 rounded-sm overflow-hidden"><div className="bg-white h-full" style={{width: `${champ.rate}%`}}></div></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0b0c10] border border-[#27272a] p-8 rounded-sm">
          <div className="flex justify-between items-center mb-6">
            <div><span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1 block">Tier List</span><h3 className="text-xl font-bold text-white">Top 5 Bans ({globalTourney === 'Todos' ? 'Global' : globalTourney})</h3></div>
            <ShieldBan size={24} className="text-red-900/50" />
          </div>
          <div>
            {(metaData.top_bans || []).map((champ: any, idx: number) => (
              <div key={idx} className="flex items-center gap-4 mb-4">
                <img src={getChampionIcon(champ.champion)} alt={champ.champion} className="w-10 h-10 rounded-sm border border-[#27272a] shadow-sm grayscale opacity-80" />
                <div className="flex-1">
                  <div className="flex justify-between mb-1 items-end"><span className="text-white font-bold text-sm">{champ.champion}</span><span className="text-red-400 text-[10px] font-mono">{champ.rate}% Ban Rate</span></div>
                  <div className="w-full bg-[#18181b] h-1.5 rounded-sm overflow-hidden"><div className="bg-red-500 h-full" style={{width: `${champ.rate}%`}}></div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}