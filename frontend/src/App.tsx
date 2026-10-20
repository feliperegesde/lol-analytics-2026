import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Target, Zap, Radar as RadarIcon, PlayCircle, 
  Trophy, Clock, Flame, Shield, Users, Loader2, Swords, BarChart2 
} from 'lucide-react';

interface StatsData {
  team: string;
  total_games: number;
  wins: number;
  losses: number;
  win_rate: number;
  avg_kills: number;
  avg_duration: number;
  first_blood_rate: number;
  first_tower_rate: number;
  conversion: {
    first_tower: number;
    first_blood: number;
    first_dragon: number;
  };
  matches: Array<{
    opponent: string;
    league: string;
    result: number;
    kills: number;
    duration_min: number;
    side: string;
  }>;
}

// Line-ups e cores oficiais atualizadas
const TEAM_CONFIGS: Record<string, { color: string; hex: string; lineup: string }> = {
  "FURIA": { color: "text-[#D4AF37]", hex: "#D4AF37", lineup: "Guigo • Tatu • Tutsz • Ayu • Jojo" },
  "LOUD": { color: "text-[#22c55e]", hex: "#22c55e", lineup: "Robo • Crock • Tinowns • Route • RedBert" },
  "paiN Gaming": { color: "text-[#3b82f6]", hex: "#3b82f6", lineup: "Wizer • Cariok • dyNquedo • TitaN • Kuri" },
  "RED Canids": { color: "text-[#ef4444]", hex: "#ef4444", lineup: "FNB • Aegis • Grevthar • BrTT • Scamber" },
  "T1": { color: "text-[#ef4444]", hex: "#ef4444", lineup: "Zeus • Oner • Faker • Gumayusi • Keria" },
  "Gen.G": { color: "text-[#eab308]", hex: "#eab308", lineup: "Kiin • Canyon • Chovy • Peyz • Lehends" }
};

const DEFAULT_CONFIG = { color: "text-[#D4AF37]", hex: "#D4AF37", lineup: "Elenco Profissional 2026" };

export default function App() {
  const [teams, setTeams] = useState<string[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("FURIA");
  const [tournaments, setTournaments] = useState<string[]>(["Todos"]);
  const [selectedTourney, setSelectedTourney] = useState<string>("Todos");
  const [selectedSide, setSelectedSide] = useState<string>("Ambos");
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("Visão geral");

  // Estados do Simulador
  const [opponents, setOpponents] = useState<string[]>([]);
  const [selectedRival, setSelectedRival] = useState<string>("");
  const [seriesFormat, setSeriesFormat] = useState<string>("MD5");
  const [simulationResult, setSimulationResult] = useState<any>(null);

  // Estados do Radar
  const [radarData, setRadarData] = useState<any>(null);

  const teamConf = TEAM_CONFIGS[selectedTeam] || DEFAULT_CONFIG;

  // Carregar times
  useEffect(() => {
    fetch("http://localhost:8000/api/teams")
      .then(res => res.json())
      .then(data => {
        setTeams(data.teams);
        if (data.teams.includes("FURIA")) setSelectedTeam("FURIA");
      });
  }, []);

  // Carregar campeonatos e oponentes
  useEffect(() => {
    if (!selectedTeam) return;
    fetch(`http://localhost:8000/api/tournaments/${selectedTeam}`)
      .then(res => res.json())
      .then(data => setTournaments(data.tournaments));

    fetch(`http://localhost:8000/api/opponents/${selectedTeam}`)
      .then(res => res.json())
      .then(data => {
        setOpponents(data.opponents);
        if (data.opponents.length > 0) setSelectedRival(data.opponents[0]);
      });

    fetch(`http://localhost:8000/api/radar/${selectedTeam}`)
      .then(res => res.json())
      .then(data => setRadarData(data));
  }, [selectedTeam]);

  // Carregar estatísticas principais
  useEffect(() => {
    if (!selectedTeam) return;
    setLoading(true);
    fetch(`http://localhost:8000/api/stats/${selectedTeam}?tournament=${selectedTourney}&side=${selectedSide}`)
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedTeam, selectedTourney, selectedSide]);

  // Motor de Simulação Monte Carlo
  const runSimulation = () => {
    if (!stats || !selectedRival) return;
    const winsNeeded = seriesFormat === "MD5" ? 3 : 2;
    const pTeam = stats.win_rate / 100;
    const pRival = 0.5; // Base neutra para o rival
    const probMap = pTeam / (pTeam + pRival);

    let teamSeriesWins = 0;
    const sims = 10000;
    const scoreCounts: Record<string, number> = {};

    for (let i = 0; i < sims; i++) {
      let tWins = 0;
      let rWins = 0;
      while (tWins < winsNeeded && rWins < winsNeeded) {
        if (Math.random() < probMap) tWins++;
        else rWins++;
      }
      const scoreKey = `${selectedTeam} ${tWins} x ${rWins} ${selectedRival}`;
      scoreCounts[scoreKey] = (scoreCounts[scoreKey] || 0) + 1;
      if (tWins === winsNeeded) teamSeriesWins++;
    }

    const seriesWinRate = (teamSeriesWins / sims) * 100;
    const sortedScores = Object.entries(scoreCounts)
      .map(([score, count]) => ({ score, prob: Number(((count / sims) * 100).toFixed(1)) }))
      .sort((a, b) => b.prob - a.prob);

    setSimulationResult({
      seriesWinRate: seriesWinRate.toFixed(1),
      mapWinRate: (probMap * 100).toFixed(1),
      mostLikelyScore: sortedScores[0]?.score || "N/A",
      scores: sortedScores
    });
  };

  return (
    <div className="flex h-screen bg-[#0b0c10] text-white font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#07080a] border-r border-[#1f232a] flex flex-col justify-between p-6">
        <div>
          <div className="mb-8">
            <h1 className="text-xl font-black tracking-widest text-[#D4AF37]">LOL / 26</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">League of Legends Analytics</p>
          </div>

          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-3">Central de Análise</div>
          
          <nav className="space-y-1.5 mb-6">
            {[
              { name: "Visão geral", icon: LayoutDashboard },
              { name: "Objetivos", icon: Target },
              { name: "Agressividade / Snowball", icon: Zap },
              { name: "Radar comparativo", icon: RadarIcon },
              { name: "Simulador", icon: PlayCircle }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.name;
              return (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    isActive 
                      ? 'bg-[#16181f] text-[#D4AF37] border-l-2 border-[#D4AF37]' 
                      : 'text-gray-400 hover:bg-[#16181f] hover:text-white'
                  }`}
                >
                  <Icon size={18} /> {tab.name}
                </button>
              );
            })}
          </nav>

          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">Temporada</div>
          <div className="bg-[#16181f] p-3 rounded-lg border border-[#232733] mb-6">
            <div className="text-base font-bold">2026</div>
            <div className="text-xs text-gray-400">{stats?.total_games || 0} jogos no recorte</div>
          </div>

          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">Equipe / 2026</div>
          <select 
            value={selectedTeam} 
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="w-full bg-[#16181f] border border-[#232733] text-white p-2.5 rounded-lg text-sm focus:outline-none focus:border-[#D4AF37]"
          >
            {teams.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="text-[10px] text-gray-600">
          Painel independente de análise de equipes de League of Legends.
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        
        {/* Topbar */}
        <header className="h-16 border-b border-[#1f232a] flex items-center justify-between px-8 bg-[#0b0c10]">
          <div className="text-xs text-gray-400 tracking-wide">
            LOL <span className="mx-2 text-gray-600">/</span> <span className="text-white">{activeTab}</span>
          </div>
          <div className="text-xs text-gray-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            Dados da referência <span className="text-white font-medium">• {selectedTourney} • {stats?.total_games || 0} jogos</span>
          </div>
        </header>

        {/* Corpo do Dashboard */}
        <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
          
          <div className="flex justify-between items-end border-b border-[#1f232a] pb-6">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Performance Center / Temporada 2026</p>
              <h2 className="text-4xl font-black tracking-tight text-white uppercase">
                {selectedTeam} <span className={teamConf.color}>EM NÚMEROS</span> / 2026
              </h2>
              <p className="text-sm text-gray-400 mt-1">Resultados, ritmo de jogo e controle de objetivos em uma só leitura.</p>
            </div>
            <div className="text-right">
              <h3 className="text-2xl font-black uppercase tracking-wider text-white">{selectedTourney}</h3>
              <p className="text-xs text-gray-500 uppercase tracking-widest">Recorte Oficial</p>
            </div>
          </div>

          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2 bg-[#16181f] px-4 py-2 rounded-lg border border-[#232733]">
              <span className="text-xs text-gray-400">Campeonato</span>
              <select 
                value={selectedTourney} 
                onChange={(e) => setSelectedTourney(e.target.value)}
                className="bg-transparent text-white text-sm font-semibold focus:outline-none"
              >
                {tournaments.map(t => <option key={t} value={t} className="bg-[#16181f]">{t}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-[#16181f] px-4 py-2 rounded-lg border border-[#232733]">
              <span className="text-xs text-gray-400">Lado do mapa</span>
              <select 
                value={selectedSide} 
                onChange={(e) => setSelectedSide(e.target.value)}
                className="bg-transparent text-white text-sm font-semibold focus:outline-none"
              >
                <option value="Ambos" className="bg-[#16181f]">Todos os lados</option>
                <option value="Blue" className="bg-[#16181f]">Blue Side</option>
                <option value="Red" className="bg-[#16181f]">Red Side</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <Loader2 className="animate-spin text-[#D4AF37]" size={48} />
              <p className="text-sm text-gray-400 tracking-wider uppercase font-medium">Carregando dados estatísticos de {selectedTeam}...</p>
            </div>
          ) : (
            <>
              {/* ABA 1: VISÃO GERAL */}
              {activeTab === "Visão geral" && (
                <div className="space-y-8 animate-fadeIn">
                  <div className="grid grid-cols-5 gap-4">
                    <div className="bg-[#16181f] border border-[#232733] p-5 rounded-xl shadow-lg relative overflow-hidden">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] tracking-widest font-bold text-gray-400 uppercase">Taxa de Vitória</span>
                        <Trophy size={16} className={teamConf.color} />
                      </div>
                      <div className="text-3xl font-black text-white mb-1">{stats?.win_rate.toFixed(1)}%</div>
                      <div className="text-xs text-gray-400">{stats?.wins} vitórias / {stats?.losses} derrotas</div>
                    </div>

                    <div className="bg-[#16181f] border border-[#232733] p-5 rounded-xl">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] tracking-widest font-bold text-gray-400 uppercase">Abates por Jogo</span>
                        <Flame size={16} className="text-gray-400" />
                      </div>
                      <div className="text-3xl font-black text-white mb-1">{stats?.avg_kills}</div>
                      <div className="text-xs text-gray-400">Média de abates da equipe</div>
                    </div>

                    <div className="bg-[#16181f] border border-[#232733] p-5 rounded-xl">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] tracking-widest font-bold text-gray-400 uppercase">Duração Média</span>
                        <Clock size={16} className="text-gray-400" />
                      </div>
                      <div className="text-3xl font-black text-white mb-1">{stats?.avg_duration} <span className="text-sm font-normal text-gray-400">min</span></div>
                      <div className="text-xs text-gray-400">Tempo médio de jogo</div>
                    </div>

                    <div className="bg-[#16181f] border border-[#232733] p-5 rounded-xl">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] tracking-widest font-bold text-gray-400 uppercase">First Blood</span>
                        <Zap size={16} className="text-gray-400" />
                      </div>
                      <div className="text-3xl font-black text-white mb-1">{stats?.first_blood_rate}%</div>
                      <div className="text-xs text-gray-400">Presença no primeiro abate</div>
                    </div>

                    <div className="bg-[#16181f] border border-[#232733] p-5 rounded-xl">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] tracking-widest font-bold text-gray-400 uppercase">Primeira Torre</span>
                        <Shield size={16} className="text-gray-400" />
                      </div>
                      <div className="text-3xl font-black text-white mb-1">{stats?.first_tower_rate}%</div>
                      <div className="text-xs text-gray-400">Controle da primeira torre</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-[#16181f] border border-[#232733] p-6 rounded-xl space-y-6">
                      <div>
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">01 / Controle de Mapa</span>
                        <h3 className="text-lg font-bold text-white">Objetivos que viram vitória</h3>
                        <p className="text-xs text-gray-400">Taxa de vitória quando a equipe conquista o primeiro objetivo.</p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Primeira torre</span>
                            <span className="font-bold">{stats?.conversion.first_tower}%</span>
                          </div>
                          <div className="w-full bg-[#0b0c10] h-3 rounded-full overflow-hidden">
                            <div className="h-full bg-[#D4AF37]" style={{ width: `${stats?.conversion.first_tower}%` }}></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>First blood</span>
                            <span className="font-bold">{stats?.conversion.first_blood}%</span>
                          </div>
                          <div className="w-full bg-[#0b0c10] h-3 rounded-full overflow-hidden">
                            <div className="h-full bg-gray-400" style={{ width: `${stats?.conversion.first_blood}%` }}></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Primeiro dragão</span>
                            <span className="font-bold">{stats?.conversion.first_dragon}%</span>
                          </div>
                          <div className="w-full bg-[#0b0c10] h-3 rounded-full overflow-hidden">
                            <div className="h-full bg-gray-500" style={{ width: `${stats?.conversion.first_dragon}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-rows-2 gap-6">
                      <div className="bg-[#16181f] border border-[#232733] p-6 rounded-xl flex justify-between items-center">
                        <div>
                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Balanço do Recorte</span>
                          <div className="flex items-baseline gap-4 mt-2">
                            <div><span className={`text-3xl font-black ${teamConf.color}`}>{stats?.wins}</span> <span className="text-xs text-gray-400">vitórias</span></div>
                            <div><span className="text-3xl font-black text-gray-500">{stats?.losses}</span> <span className="text-xs text-gray-400">derrotas</span></div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {stats?.matches.slice(0, 7).map((m, i) => (
                            <div key={i} className={`w-4 h-8 rounded-sm ${m.result === 1 ? 'bg-[#D4AF37]' : 'bg-[#2b2d3c]'}`}></div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-[#16181f] border border-[#232733] p-6 rounded-xl flex justify-between items-center">
                        <div>
                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Line-up / 2026</span>
                          <h4 className="text-base font-bold text-white mt-1">{teamConf.lineup}</h4>
                          <p className="text-xs text-gray-400 mt-1">Elenco cadastrado para a temporada.</p>
                        </div>
                        <Users size={24} className={teamConf.color} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ABA 2: OBJETIVOS */}
              {activeTab === "Objetivos" && (
                <div className="bg-[#16181f] border border-[#232733] p-8 rounded-xl space-y-6">
                  <h3 className="text-2xl font-bold text-white">Análise Avançada de Objetivos</h3>
                  <p className="text-gray-400">Controle de Barões, Dragões e Torres para {selectedTeam} em 2026.</p>
                  <div className="grid grid-cols-3 gap-6 pt-4">
                    <div className="bg-[#0b0c10] p-5 rounded-lg border border-[#232733]">
                      <div className="text-gray-400 text-xs">Taxa 1ª Torre</div>
                      <div className={`text-2xl font-bold mt-1 ${teamConf.color}`}>{stats?.first_tower_rate}%</div>
                    </div>
                    <div className="bg-[#0b0c10] p-5 rounded-lg border border-[#232733]">
                      <div className="text-gray-400 text-xs">Taxa First Blood</div>
                      <div className="text-2xl font-bold mt-1 text-white">{stats?.first_blood_rate}%</div>
                    </div>
                    <div className="bg-[#0b0c10] p-5 rounded-lg border border-[#232733]">
                      <div className="text-gray-400 text-xs">Conversão 1º Dragão</div>
                      <div className="text-2xl font-bold mt-1 text-white">{stats?.conversion.first_dragon}%</div>
                    </div>
                  </div>
                </div>
              )}

              {/* ABA 3: AGRESSIVIDADE */}
              {activeTab === "Agressividade / Snowball" && (
                <div className="bg-[#16181f] border border-[#232733] p-8 rounded-xl space-y-6">
                  <h3 className="text-2xl font-bold text-white">Índice de Agressividade & Snowball</h3>
                  <p className="text-gray-400">Velocidade de fechamento de partidas e média de abates.</p>
                  <div className="bg-[#0b0c10] p-6 rounded-lg border border-[#232733]">
                    <div className="flex justify-between mb-2 text-sm">
                      <span>Média de Abates / Jogo</span>
                      <span className={`font-bold ${teamConf.color}`}>{stats?.avg_kills} Kills</span>
                    </div>
                    <div className="w-full bg-[#16181f] h-3 rounded-full overflow-hidden">
                      <div className="bg-[#D4AF37] h-full" style={{ width: `${Math.min(100, (stats?.avg_kills || 0) * 5)}%` }}></div>
                    </div>
                  </div>
                </div>
              )}

              {/* ABA 4: RADAR COMPARATIVO REAL */}
              {activeTab === "Radar comparativo" && (
                <div className="bg-[#16181f] border border-[#232733] p-8 rounded-xl space-y-6">
                  <h3 className="text-2xl font-bold text-white">Radar Comparativo de Atributos</h3>
                  <p className="text-gray-400">Desempenho de {selectedTeam} comparado à média geral da liga em 2026.</p>
                  
                  {radarData && (
                    <div className="space-y-4 pt-4">
                      {Object.keys(radarData.team_stats).map((key) => {
                        const valTeam = radarData.team_stats[key];
                        const valLeague = radarData.league_stats[key] || 1;
                        const pct = Math.min(150, (valTeam / valLeague) * 100);
                        return (
                          <div key={key} className="bg-[#0b0c10] p-4 rounded-lg border border-[#232733]">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-bold">{key}</span>
                              <span className={teamConf.color}>{valTeam.toFixed(1)} <span className="text-gray-500 text-xs">(Média Liga: {valLeague.toFixed(1)})</span></span>
                            </div>
                            <div className="w-full bg-[#16181f] h-3 rounded-full overflow-hidden">
                              <div className="h-full bg-[#D4AF37]" style={{ width: `${pct}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ABA 5: SIMULADOR MONTE CARLO TOTALMENTE FUNCIONAL */}
              {activeTab === "Simulador" && (
                <div className="bg-[#16181f] border border-[#232733] p-8 rounded-xl space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-2xl font-bold text-white">Simulador de Confrontos (Monte Carlo - 10.000 Simulações)</h3>
                      <p className="text-gray-400 text-sm">Simule séries MD3 ou MD5 cruzando o histórico real de {selectedTeam}.</p>
                    </div>
                    <Swords size={32} className={teamConf.color} />
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div>
                      <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Adversário</label>
                      <select 
                        value={selectedRival} 
                        onChange={(e) => setSelectedRival(e.target.value)}
                        className="w-full bg-[#0b0c10] border border-[#232733] text-white p-3 rounded-lg text-sm focus:outline-none"
                      >
                        {opponents.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Formato da Série</label>
                      <select 
                        value={seriesFormat} 
                        onChange={(e) => setSeriesFormat(e.target.value)}
                        className="w-full bg-[#0b0c10] border border-[#232733] text-white p-3 rounded-lg text-sm focus:outline-none"
                      >
                        <option value="MD5">MD5 (Melhor de 5)</option>
                        <option value="MD3">MD3 (Melhor de 3)</option>
                      </select>
                    </div>

                    <div className="flex items-end">
                      <button 
                        onClick={runSimulation}
                        className="w-full bg-[#D4AF37] text-black font-bold p-3 rounded-lg hover:bg-[#b5952f] transition flex items-center justify-center gap-2"
                      >
                        <PlayCircle size={18} /> Rodar Simulação
                      </button>
                    </div>
                  </div>

                  {simulationResult && (
                    <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[#232733]">
                      <div className="bg-[#0b0c10] p-5 rounded-lg border border-[#232733] text-center">
                        <div className="text-gray-400 text-xs uppercase font-bold">Chance de Vitória na Série</div>
                        <div className={`text-3xl font-black mt-2 ${teamConf.color}`}>{simulationResult.seriesWinRate}%</div>
                      </div>
                      <div className="bg-[#0b0c10] p-5 rounded-lg border border-[#232733] text-center">
                        <div className="text-gray-400 text-xs uppercase font-bold">Favoritismo por Mapa</div>
                        <div className="text-3xl font-black mt-2 text-white">{simulationResult.mapWinRate}%</div>
                      </div>
                      <div className="bg-[#0b0c10] p-5 rounded-lg border border-[#232733] text-center">
                        <div className="text-gray-400 text-xs uppercase font-bold">Placar Mais Provável</div>
                        <div className="text-xl font-bold mt-3 text-white">{simulationResult.mostLikelyScore}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

        </div>
      </main>
    </div>
  );
}