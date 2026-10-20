import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { api } from './api';
import Sidebar from './components/Sidebar';
import OverviewTab from './components/tabs/OverviewTab';
import ObjectivesTab from './components/tabs/ObjectivesTab';
import SnowballTab from './components/tabs/SnowballTab';
import RadarTab from './components/tabs/RadarTab';
import SimulatorTab from './components/tabs/SimulatorTab';

const TEAM_COLORS: any = {
  "FURIA": { color: "text-[#D4AF37]", hex: "#D4AF37" },
  "LOUD": { color: "text-[#22c55e]", hex: "#22c55e" },
  "paiN Gaming": { color: "text-[#3b82f6]", hex: "#3b82f6" },
  "RED Canids": { color: "text-[#ef4444]", hex: "#ef4444" },
  "T1": { color: "text-[#ef4444]", hex: "#ef4444" },
  "Gen.G": { color: "text-[#eab308]", hex: "#eab308" },
  "LØS": { color: "text-[#f97316]", hex: "#f97316" }
};
const DEFAULT_COLOR = { color: "text-white", hex: "#ffffff" };

export default function App() {
  const [teams, setTeams] = useState<string[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("FURIA");
  const [teamInput, setTeamInput] = useState<string>("");
  const [tournaments, setTournaments] = useState<string[]>(["Todos"]);
  const [selectedTourney, setSelectedTourney] = useState<string>("Todos");
  const [selectedSide, setSelectedSide] = useState<string>("Ambos");
  const [activeTab, setActiveTab] = useState<string>("Visão geral");
  
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [aiStyle, setAiStyle] = useState<any>(null);
  const [goldDiff, setGoldDiff] = useState<number>(0);
  const [winProb, setWinProb] = useState<number>(50.0);
  const [dynamicLineup, setDynamicLineup] = useState<string>("Buscando...");

  const [opponents, setOpponents] = useState<string[]>([]);
  const [selectedRival, setSelectedRival] = useState<string>("");
  const [seriesFormat, setSeriesFormat] = useState<string>("MD5");
  const [simResult, setSimResult] = useState<any>(null);
  const [simulating, setSimulating] = useState(false);
  const [radarData, setRadarData] = useState<any>(null);

  const teamConf = TEAM_COLORS[selectedTeam] || DEFAULT_COLOR;

  useEffect(() => {
    api.getTeams().then(d => { 
      setTeams(d.teams); 
      if (d.teams.includes("LØS")) { setSelectedTeam("LØS"); setTeamInput("LØS"); }
    });
  }, []);

  useEffect(() => {
    if (!selectedTeam) return;
    api.getTournaments(selectedTeam).then(d => setTournaments(d.tournaments));
    api.getOpponents(selectedTeam).then(d => { setOpponents(d.opponents); if (d.opponents.length > 0) setSelectedRival(d.opponents[0]); });
    api.getPlaystyle(selectedTeam).then(d => setAiStyle(d.error ? null : d));
    api.getLineup(selectedTeam).then(d => setDynamicLineup(d.lineup));
    api.getRadar(selectedTeam).then(d => setRadarData(d));
  }, [selectedTeam]);

  useEffect(() => {
    if (!selectedTeam) return;
    setLoading(true);
    api.getStats(selectedTeam, selectedTourney, selectedSide).then(d => {
      setStats(d.error ? null : d);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [selectedTeam, selectedTourney, selectedSide]);

  useEffect(() => {
    api.getPrediction(goldDiff).then(d => { if(!d.error) setWinProb(d.win_probability); });
  }, [goldDiff]);

  const runSim = () => {
    if (!selectedRival) return;
    setSimulating(true);
    api.runSimulation(selectedTeam, selectedRival, seriesFormat).then(d => {
      setSimResult(d); setSimulating(false);
    }).catch(() => setSimulating(false));
  };

  const handleTeamInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTeamInput(e.target.value);
    if (teams.includes(e.target.value)) setSelectedTeam(e.target.value);
  };

  const formattedRadar = radarData?.team_stats ? Object.keys(radarData.team_stats).map(key => ({
    subject: key, Time: radarData.team_stats[key], Liga: radarData.league_stats[key], fullMark: Math.max(radarData.team_stats[key], radarData.league_stats[key]) * 1.5
  })) : [];

  return (
    <div className="flex h-screen bg-[#09090b] text-[#e4e4e7] font-sans overflow-hidden">
      <Sidebar 
        teams={teams} selectedTeam={selectedTeam} teamInput={teamInput} handleTeamInputChange={handleTeamInputChange}
        activeTab={activeTab} setActiveTab={setActiveTab} totalGames={stats?.total_games} 
      />

      <main className="flex-1 flex flex-col overflow-y-auto bg-[#09090b]">
        <header className="h-12 border-b border-[#27272a] flex items-center justify-between px-10 text-xs">
          <div className="text-gray-500 tracking-wide">LOL <span className="mx-2">/</span> <span className="text-white">{activeTab}</span></div>
          <div className="flex items-center gap-2 text-gray-500"><span className="w-1.5 h-1.5 rounded-sm bg-gray-400"></span> Dados da referência • <span className="text-white">{selectedTourney} • {stats?.total_games || 0} jogos</span></div>
        </header>

        <div className="p-10 max-w-[1400px] w-full mx-auto space-y-10">
          <div className="flex justify-between items-end border-b border-[#27272a] pb-8">
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-3 font-bold">Performance Center / Temporada 2026</p>
              <h2 className="text-5xl font-black tracking-tighter text-white uppercase mb-2">{selectedTeam} <span className={teamConf.color}>EM NÚMEROS</span></h2>
              <p className="text-sm text-gray-400">Análise Tática, Economia e Machine Learning em uma só leitura.</p>
            </div>
            <div className="flex flex-col items-end gap-3">
              <select value={selectedTourney} onChange={e => setSelectedTourney(e.target.value)} className="bg-[#121214] border border-[#27272a] px-4 py-2 rounded-md text-xs font-bold text-white focus:outline-none">
                {tournaments.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select value={selectedSide} onChange={e => setSelectedSide(e.target.value)} className="bg-[#121214] border border-[#27272a] px-4 py-2 rounded-md text-xs font-bold text-white focus:outline-none">
                <option value="Ambos">Lado do Mapa: Todos</option><option value="Blue">Lado Azul</option><option value="Red">Lado Vermelho</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-32"><Loader2 className={`animate-spin ${teamConf.color}`} size={48} /></div>
          ) : (
            <>
              {activeTab === "Visão geral" && <OverviewTab stats={stats} teamConf={teamConf} aiStyle={aiStyle} goldDiff={goldDiff} setGoldDiff={setGoldDiff} winProb={winProb} dynamicLineup={dynamicLineup} />}
              {activeTab === "Objetivos & Macro" && <ObjectivesTab stats={stats} teamConf={teamConf} />}
              {activeTab === "Snowball & Economia" && <SnowballTab stats={stats} teamConf={teamConf} />}
              {activeTab === "Radar Avançado" && <RadarTab formattedRadar={formattedRadar} selectedTeam={selectedTeam} teamConf={teamConf} />}
              {activeTab === "Simulador IA" && <SimulatorTab opponents={opponents} selectedRival={selectedRival} setSelectedRival={setSelectedRival} seriesFormat={seriesFormat} setSeriesFormat={setSeriesFormat} runSim={runSim} simulating={simulating} simResult={simResult} teamConf={teamConf} />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}