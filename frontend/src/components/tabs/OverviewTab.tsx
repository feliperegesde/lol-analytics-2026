import React from 'react';
import { Trophy, Clock, Crosshair, Shield, Flame, Users, FileText } from 'lucide-react';

export default function OverviewTab({ stats, teamConf, aiStyle, goldDiff, setGoldDiff, winProb, dynamicLineup }: any) {
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

      <div className="grid grid-cols-3 gap-4">
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

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#0b0c10] border border-[#27272a] p-6 rounded-sm">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4 block">Balanço do Recorte</span>
          <div className="flex items-baseline gap-6 mb-4">
            <div><span className={`text-4xl font-black mr-1 ${teamConf.color}`}>{(stats.wins).toString().padStart(2, '0')}</span><span className="text-xs text-gray-500">VIT</span></div>
            <div><span className="text-4xl font-black text-gray-600 mr-1">{(stats.losses).toString().padStart(2, '0')}</span><span className="text-xs text-gray-500">DER</span></div>
          </div>
        </div>
        
        <div className="bg-[#0b0c10] border border-[#27272a] p-6 rounded-sm relative">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4 block">Line-up Dinâmica</span>
          <h4 className="text-base font-bold text-white leading-snug">
            {dynamicLineup.split(' • ').slice(0, 3).join(' • ')}<br />
            {dynamicLineup.split(' • ').slice(3).join(' • ')}
          </h4>
          <Users size={16} className="absolute top-6 right-6 text-gray-500" />
        </div>

        <div className="bg-[#0b0c10] border border-[#27272a] p-6 rounded-sm relative">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4 block">Motor de IA</span>
          <p className="text-[11px] text-gray-400 leading-relaxed mb-4">Modelos PyTorch e XGBoost processando dados do Oracle's Elixir.</p>
          <FileText size={16} className="absolute top-6 right-6 text-gray-500" />
        </div>
      </div>
    </>
  );
}