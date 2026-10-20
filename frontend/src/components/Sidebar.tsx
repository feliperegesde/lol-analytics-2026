import React from 'react';
import { LayoutDashboard, Target, Radar as RadarIcon, PlayCircle, Zap } from 'lucide-react';

export default function Sidebar({ 
  teams, selectedTeam, teamInput, handleTeamInputChange, 
  activeTab, setActiveTab, totalGames 
}: any) {
  const tabs = [
    { name: "Visão geral", icon: LayoutDashboard }, 
    { name: "Objetivos & Macro", icon: Target },
    { name: "Snowball & Economia", icon: Zap }, 
    { name: "Radar Avançado", icon: RadarIcon }, 
    { name: "Simulador IA", icon: PlayCircle }
  ];

  return (
    <aside className="w-[280px] bg-[#000000] border-r border-[#27272a] flex flex-col p-6 overflow-y-auto">
      <div className="mb-10 mt-2">
        <h1 className="text-3xl font-black italic tracking-tighter text-white">LOL <span className="text-gray-500">/ 26</span></h1>
        <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-1">League of Legends</p>
      </div>

      <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4">Central de Análise</div>
      <nav className="space-y-1 mb-10">
        {tabs.map(tab => (
          <button key={tab.name} onClick={() => setActiveTab(tab.name)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition ${activeTab === tab.name ? 'bg-white text-black rounded-md' : 'text-gray-400 hover:text-white'}`}>
            <tab.icon size={18} /> {tab.name}
          </button>
        ))}
      </nav>

      <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-3">Temporada</div>
      <div className="flex justify-between items-center mb-1"><div className="text-xl font-bold text-white">2026</div><div className="w-2 h-2 bg-white rounded-sm"></div></div>
      <div className="text-[11px] text-gray-500 mb-8">{totalGames || 0} jogos no recorte</div>

      <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-3">Equipe / 2026</div>
      <div className="bg-transparent border border-[#27272a] rounded-md overflow-hidden mb-8 relative">
        <input 
          type="text" list="team-list" value={teamInput} onChange={handleTeamInputChange} 
          placeholder="Digite ou selecione a equipe..."
          className="w-full bg-[#121214] text-white p-2.5 text-sm font-bold focus:outline-none placeholder-gray-600"
        />
        <datalist id="team-list">{teams.map((t: string) => <option key={t} value={t} />)}</datalist>
      </div>

      <div className="mt-auto pt-8 border-t border-[#27272a]">
        <p className="text-[9px] text-gray-500 font-mono">FEITO DE DADOS.</p>
        <p className="text-[9px] text-gray-600 mt-2 leading-relaxed">Painel inteligente com Inteligência Artificial.</p>
      </div>
    </aside>
  );
}