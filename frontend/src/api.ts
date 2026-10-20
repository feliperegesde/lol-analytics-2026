const BASE_URL = "http://localhost:8000/api";

export const api = {
  getTeams: () => fetch(`${BASE_URL}/teams`).then(r => r.json()),
  getTournaments: (team: string) => fetch(`${BASE_URL}/tournaments/${team}`).then(r => r.json()),
  getOpponents: (team: string) => fetch(`${BASE_URL}/opponents/${team}`).then(r => r.json()),
  getLineup: (team: string) => fetch(`${BASE_URL}/lineup/${team}`).then(r => r.json()),
  getPlaystyle: (team: string) => fetch(`${BASE_URL}/ai/playstyle/${team}`).then(r => r.json()),
  getRadar: (team: string) => fetch(`${BASE_URL}/radar/${team}`).then(r => r.json()),
  getStats: (team: string, tourney: string, side: string) => 
    fetch(`${BASE_URL}/stats/${team}?tournament=${tourney}&side=${side}`).then(r => r.json()),
  getPrediction: (goldDiff: number) => {
    const xp = goldDiff * 0.6;
    const kills = goldDiff > 0 ? 3 : 0;
    const opp_kills = goldDiff < 0 ? 3 : 0;
    return fetch(`${BASE_URL}/ai/predict-15m?gold_diff=${goldDiff}&xp_diff=${xp}&kills=${kills}&opp_kills=${opp_kills}`).then(r => r.json());
  },
  runSimulation: (team1: string, team2: string, format: string) => 
    fetch(`${BASE_URL}/simulate?team1=${team1}&team2=${team2}&format=${format}`).then(r => r.json()),
};