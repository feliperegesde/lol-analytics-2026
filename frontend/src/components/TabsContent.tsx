import React from 'react';
import { Trophy, Flame, Clock, Crosshair, Shield, Target, Zap, Radar as RadarIcon, PlayCircle, Loader2, Swords, Users, FileText } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area, PieChart, Pie, Cell, ReferenceLine } from 'recharts';

const CustomTooltip = ({ active, payload, label }: any) => {
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

export default function TabsContent({ 
  activeTab, stats, teamConf, aiStyle, goldDiff, setGoldDiff, winProb, dynamicLineup,
  opponents, selectedRival, setSelectedRival, seriesFormat, setSeriesFormat, runSim, simulating, simResult, formattedRadar 
}: any) {

  const off = () => {
    if(!stats || !stats.gold_trend) return 0;
    const dataMax = Math.max(...stats.gold_trend.map((i:any) => i.diff));
    const dataMin = Math.min(...stats.gold_trend.map((i:any) => i.diff));
    if (dataMax <= 0) return 0;
    if (dataMin >= 0) return 1;
    return dataMax / (dataMax - dataMin);
  };

  if (activeTab === "Visão geral") {
    return (
      <>
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-sm shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6"><span className="text-[10px] tracking-widest font-bold text-black uppercase">Taxa de Vitória</span><Trophy size={14} className="text-black" /></div>
            <div><div className="text-4xl font-black text-black tracking-tight">{stats.win_rate}<span className="text-xl font-medium">%</span></div>
            <div className="text-[11px] text-gray-600 mt-2 font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 bg-black rounded-sm"></span> {stats.wins}V / {stats.losses}D</div></div>
          </div>
          {[
            { label: "Abates por Jogo", val: stats.avg_kills, desc: "Média de abates", icon: Crosshair },
            { label: "Duração Média", val: `${stats.avg_duration}m`, desc: "Tempo médio", icon: Clock },
            { label: "First Blood", val: `${stats.first_blood_rate}%`, desc: "Presença no FB", icon: Flame },
            { label: "Primeira Torre", val: `${stats.first_tower_rate}%`, desc: "Controle de torre", icon: Shield }
          ].map((k, i) => (
            <div key={i} className="bg-[#121214] border border-[#27272a] p-5 rounded-sm flex flex-col justify-between">
              <div className="flex justify-between items-start mb-6"><span className="text-[10px] tracking-widest font-bold text-gray-500 uppercase">{k.label}</span><k.icon size={14} className="text-gray-500" /></div>
              <div><div className="text-4xl font-black text-white tracking-tight">{k.val}</div><div className="text-[11px] text-gray-500 mt-2">{k.desc}</div></div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="bg-[#0b0c10] border border-[#27272a] p-8 rounded-sm col-span-2">
            <div className="mb-6"><span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2 block">01 / Machine Learning Preditor</span><h4 className="text-lg font-medium text-white">Probabilidade de Vitória (XGBoost)</h4></div>
            <div className="flex gap-8 items-center bg-[#121214] p-6 rounded-sm border border-[#27272a]">
              <div className="flex-1">
                <div className="flex justify-between text-xs text-gray-400 mb-4"><span>Vantagem de Ouro aos 15 Min: <b className="text-white">{goldDiff > 0 ? `+${goldDiff}` : goldDiff}g</b></span></div>
                <input type="range" min="-4000" max="4000" step="200" value={goldDiff} onChange={(e) => setGoldDiff(Number(e.target.value))} className="w-full cursor-pointer accent-white" />
                <div className="flex justify-between text-[10px] text-gray-600 mt-2 font-mono"><span>-4k (Desvantagem)</span><span>+4k (Vantagem)</span></div>
              </div>
              <div className="w-[1px] h-16 bg-[#27272a]"></div>
              <div className="px-4 text-center">
                <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 font-bold">Chance de Vitória</div>
                <div className={`text-5xl font-black ${teamConf.color} tracking-tighter`}>{winProb}%</div>
              </div>
            </div>
          </div>

          <div className="bg-[#0b0c10] border border-[#27272a] p-8 rounded-sm">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2 block">02 / Identidade Tática</span>
            <h4 className="text-lg font-medium text-white mb-6">DNA (Autoencoder)</h4>
            <div className="text-2xl font-black text-white mb-2 tracking-tight">{aiStyle?.nome || "Analisando..."}</div>
            <p className="text-xs text-gray-400 leading-relaxed">{aiStyle?.desc}</p>
          </div>
        </div>
      </>
    );
  }

  if (activeTab === "Objetivos & Macro") {
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#0b0c10] border border-[#27272a] p-8 rounded-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-10">
            <div><h3 className="text-2xl font-bold text-white">Prioridade de Objetivos Iniciais</h3><p className="text-gray-400 text-sm mt-1">Taxas de domínio do 1º objetivo do mapa.</p></div>
            <Target size={32} className="text-gray-600" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.obj_rates || []} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
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

  // (Mantenha o restante das Abas Snowball, Radar e Simulador exatamente iguais ao código anterior aqui em baixo)
  return null;
}