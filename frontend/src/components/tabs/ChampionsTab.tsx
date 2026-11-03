import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip, CartesianGrid, Cell, BarChart, Bar, ReferenceLine } from 'recharts';
import { api } from '../../api';

// Função auxiliar para buscar a imagem oficial do Campeão na API da Riot
const getChampionIcon = (champName: string) => {
  if (!champName) return "";
  // Limpa espaços e apóstrofos para casar com a URL da Riot
  let formatted = champName.replace(/['\s\.]/g, '');
  if (formatted === "Wukong") formatted = "MonkeyKing";
  if (formatted === "RenataGlasc") formatted = "Renata";
  if (formatted === "KSMante" || formatted === "KSante") formatted = "KSante";
  // Usa o patch 14.8.1 oficial da Data Dragon
  return `https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${formatted}.png`;
};

const ScatterTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#121214] border border-[#27272a] p-3 rounded-md shadow-lg flex items-center gap-3">
        <img src={getChampionIcon(data.champion)} alt={data.champion} className="w-10 h-10 rounded-sm" />
        <div>
          <p className="text-white font-bold mb-1">{data.champion}</p>
          <p className="text-gray-400 text-xs">Pick Rate: <span className="text-white">{data.pick_rate}%</span></p>
          <p className="text-gray-400 text-xs">Win Rate: <span className="text-white">{data.win_rate}%</span></p>
        </div>
      </div>
    );
  }
  return null;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#121214] border border-[#27272a] p-3 rounded-md shadow-lg">
        <p className="text-white text-xs font-bold mb-1">{label}</p>
        <p className="text-gray-400 text-xs">Picks: <span className="text-white">{payload[0].value}</span></p>
      </div>
    );
  }
  return null;
};

export default function ChampionsTab({ selectedTeam, teamConf }: any) {
  const [champData, setChampData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getChampions(selectedTeam).then(data => {
      if(!data.error) setChampData(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [selectedTeam]);

  if (loading) return <div className="flex justify-center py-32"><Loader2 className={`animate-spin ${teamConf.color}`} size={48} /></div>;
  if (!champData) return <div className="text-center py-32 text-gray-500">Dados de Draft não encontrados.</div>;

  return (
    <div className="grid grid-cols-3 gap-4">
      
      {/* 1. SCATTER GLOBAL (Toma 2 Colunas) */}
      <div className="bg-[#0b0c10] border border-[#27272a] p-8 rounded-sm col-span-2 flex flex-col justify-between">
        <div className="mb-8">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2 block">Meta Global</span>
          <h3 className="text-2xl font-bold text-white">Dispersão de Campeões (Win x Pick)</h3>
          <p className="text-gray-400 text-sm mt-1">Todos os campeões do campeonato. Campeões populares e vitoriosos em destaque.</p>
        </div>
        
        <div className="h-[300px] w-full bg-[#121214] p-4 rounded-md border border-[#27272a]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis type="number" dataKey="pick_rate" name="Pick Rate" unit="%" stroke="#71717a" tick={{fontSize: 12}} />
              <YAxis type="number" dataKey="win_rate" name="Win Rate" unit="%" stroke="#71717a" domain={[0, 100]} tick={{fontSize: 12}} />
              <Tooltip cursor={{ strokeDasharray: '3 3', stroke: '#52525b' }} content={<ScatterTooltip />} />
              <ReferenceLine y={50} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'top', value: '50% Win Rate', fill: '#ef4444', fontSize: 10 }} />
              <ReferenceLine x={10} stroke="#3b82f6" strokeDasharray="3 3" label={{ position: 'right', value: '10% Pick Rate', fill: '#3b82f6', fontSize: 10 }} />
              <Scatter name="Campeões" data={champData.meta_scatter} fill={teamConf.hex}>
                {(champData.meta_scatter || []).map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.pick_rate >= 10 && entry.win_rate >= 50 ? teamConf.hex : '#52525b'} fillOpacity={0.7} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. MAIS CONTESTADOS DO MUNDO (1 Coluna com Ícones da Riot) */}
      <div className="bg-[#0b0c10] border border-[#27272a] p-8 rounded-sm">
        <div className="mb-6">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2 block">Tier S+ (Global)</span>
          <h3 className="text-xl font-bold text-white">Mais Contestados</h3>
          <p className="text-gray-400 text-xs mt-1">Campeões mais Pickados ou Banidos no mundo.</p>
        </div>
        <div>
          {(champData.global_presence || []).map((champ: any, idx: number) => (
            <div key={idx} className="flex items-center gap-4 mb-4">
              <img src={getChampionIcon(champ.champion)} alt={champ.champion} className="w-10 h-10 rounded-full border border-[#27272a] shadow-sm" />
              <div className="flex-1">
                <div className="flex justify-between mb-1 items-end">
                  <span className="text-white font-bold text-sm">{champ.champion}</span>
                  <span className="text-gray-400 text-[10px] font-mono">{champ.presence_rate}% Presence</span>
                </div>
                <div className="w-full bg-[#18181b] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-white h-full" style={{width: `${champ.presence_rate}%`}}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. COMFORT PICKS DO TIME (Toma 2 Colunas) */}
      <div className="bg-[#0b0c10] border border-[#27272a] p-8 rounded-sm col-span-2">
        <div className="mb-8">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2 block">Seleções Pessoais</span>
          <h3 className="text-2xl font-bold text-white">Comfort Picks: {selectedTeam}</h3>
          <p className="text-gray-400 text-sm mt-1">Campeões mais escolhidos por esta equipe.</p>
        </div>
        
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={champData.top_champions || []} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={true} vertical={false} />
              <XAxis type="number" stroke="#71717a" fontSize={12} hide />
              <YAxis type="category" dataKey="champion" stroke="#d4d4d8" fontSize={12} width={100} axisLine={false} tickLine={false} fontWeight="bold" />
              <Tooltip cursor={{fill: '#18181b'}} content={<CustomTooltip />} />
              <Bar dataKey="picks" name="Vezes Escolhido" fill={teamConf.hex} radius={[0, 4, 4, 0]} barSize={24}>
                {(champData.top_champions || []).map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fillOpacity={entry.win_rate >= 50 ? 1 : 0.4} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. TARGET BANS CONTRA A EQUIPE (1 Coluna com Ícones) */}
      <div className="bg-[#0b0c10] border border-[#27272a] p-8 rounded-sm">
        <div className="mb-6">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2 block">O que os adversários temem</span>
          <h3 className="text-xl font-bold text-white">Target Bans</h3>
          <p className="text-gray-400 text-xs mt-1">Mais banidos contra a {selectedTeam}.</p>
        </div>
        <div>
          {(champData.target_bans || []).map((champ: any, idx: number) => (
            <div key={idx} className="flex items-center gap-4 mb-4 bg-[#121214] p-3 rounded-md border border-[#27272a]">
              <img src={getChampionIcon(champ.champion)} alt={champ.champion} className="w-8 h-8 rounded-md grayscale hover:grayscale-0 transition duration-300" />
              <div className="flex-1">
                <span className="text-white font-bold text-sm block">{champ.champion}</span>
                <span className="text-red-400 text-[10px] font-mono">{champ.bans} BANS</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}