from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import os

app = FastAPI(title="FURIA LoL Analytics API", version="1.0")

# Permitir requisições do Front-end em React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CSV_PATH = "2026_LoL_esports_match_data_from_OraclesElixir.csv"

def load_data():
    if not os.path.exists(CSV_PATH):
        raise HTTPException(status_code=500, detail="CSV do Oracle's Elixir não encontrado no servidor.")
    df = pd.read_csv(CSV_PATH, low_memory=False)
    # Filtra apenas linhas de equipe inteira
    df_team = df[df['position'].str.lower() == 'team'].copy()
    
    # Descobre o oponente cruzando o gameid
    if 'gameid' in df_team.columns and 'teamname' in df_team.columns:
        pairs = df_team[['gameid', 'teamname']].drop_duplicates()
        merged = pd.merge(pairs, pairs, on='gameid', suffixes=('', '_opp'))
        merged = merged[merged['teamname'] != merged['teamname_opp']].drop_duplicates(subset=['gameid', 'teamname'])
        df_team = pd.merge(df_team, merged[['gameid', 'teamname', 'teamname_opp']], on=['gameid', 'teamname'], how='left')
        df_team['opponent'] = df_team['teamname_opp'].fillna("Desconhecido")
        
    df_team['duration_min'] = (df_team['gamelength'] / 60.0).round(1) if 'gamelength' in df_team.columns else 30.0
    return df_team

@app.get("/api/teams")
def get_teams():
    df = load_data()
    teams = sorted(df['teamname'].dropna().unique().tolist())
    return {"teams": teams}

@app.get("/api/tournaments/{team_name}")
def get_tournaments(team_name: str):
    df = load_data()
    tourneys = sorted(df[df['teamname'].str.lower() == team_name.lower()]['league'].dropna().unique().tolist())
    return {"tournaments": ["Todos"] + tourneys}

@app.get("/api/stats/{team_name}")
def get_team_stats(team_name: str, tournament: str = "Todos", side: str = "Ambos"):
    df = load_data()
    sub = df[df['teamname'].str.lower() == team_name.lower()].copy()
    
    if tournament != "Todos":
        sub = sub[sub['league'].str.lower() == tournament.lower()]
    if side != "Ambos" and 'side' in sub.columns:
        sub = sub[sub['side'].str.lower() == side.lower()]
        
    if sub.empty:
        return {"error": "Nenhum dado encontrado para os filtros selecionados."}
        
    total_games = len(sub)
    wins = int(sub['result'].sum()) if 'result' in sub.columns else 0
    losses = total_games - wins
    win_rate = round((wins / total_games * 100), 1) if total_games > 0 else 0.0
    
    avg_kills = round(sub['kills'].mean(), 1) if 'kills' in sub.columns else 0.0
    avg_duration = round(sub['duration_min'].mean(), 1) if 'duration_min' in sub.columns else 0.0
    
    fb_rate = round((sub['firstblood'].mean() * 100), 1) if 'firstblood' in sub.columns else 0.0
    ft_rate = round((sub['firsttower'].mean() * 100), 1) if 'firsttower' in sub.columns else 0.0
    fd_rate = round((sub['firstdragon'].mean() * 100), 1) if 'firstdragon' in sub.columns else 0.0
    
    # Conversão de objetivos em vitória
    fb_win_rate = round((sub[sub['firstblood'] == 1]['result'].mean() * 100), 1) if 'firstblood' in sub.columns and len(sub[sub['firstblood'] == 1]) > 0 else 0.0
    ft_win_rate = round((sub[sub['firsttower'] == 1]['result'].mean() * 100), 1) if 'firsttower' in sub.columns and len(sub[sub['firsttower'] == 1]) > 0 else 0.0
    fd_win_rate = round((sub[sub['firstdragon'] == 1]['result'].mean() * 100), 1) if 'firstdragon' in sub.columns and len(sub[sub['firstdragon'] == 1]) > 0 else 0.0

    # Histórico de partidas para o gráfico de dispersão
    matches_list = []
    for _, row in sub.iterrows():
        matches_list.append({
            "opponent": row.get('opponent', 'N/D'),
            "league": row.get('league', 'N/D'),
            "result": int(row.get('result', 0)),
            "kills": int(row.get('kills', 0)),
            "duration_min": float(row.get('duration_min', 0)),
            "side": row.get('side', 'N/D')
        })

    return {
        "team": team_name,
        "total_games": total_games,
        "wins": wins,
        "losses": losses,
        "win_rate": win_rate,
        "avg_kills": avg_kills,
        "avg_duration": avg_duration,
        "first_blood_rate": fb_rate,
        "first_tower_rate": ft_rate,
        "conversion": {
            "first_tower": ft_win_rate,
            "first_blood": fb_win_rate,
            "first_dragon": fd_win_rate
        },
        "matches": matches_list
    }

@app.get("/api/opponents/{team_name}")
def get_opponents(team_name: str):
    df = load_data()
    sub = df[df['teamname'].str.lower() == team_name.lower()]
    opps = sorted(sub['opponent'].dropna().unique().tolist())
    return {"opponents": [o for o in opps if o != "Desconhecido"]}

@app.get("/api/radar/{team_name}")
def get_radar_stats(team_name: str):
    df = load_data()
    team_sub = df[df['teamname'].str.lower() == team_name.lower()]
    
    # Médias da equipe vs Média geral da liga
    metrics = {
        "Kills": float(team_sub['kills'].mean()) if 'kills' in team_sub.columns else 0.0,
        "Torres": float(team_sub['towers'].mean()) if 'towers' in team_sub.columns else 0.0,
        "Dragões": float(team_sub['dragons'].mean()) if 'dragons' in team_sub.columns else 0.0,
        "Barões": float(team_sub['barons'].mean()) if 'barons' in team_sub.columns else 0.0,
        "First Blood (%)": float(team_sub['firstblood'].mean() * 100) if 'firstblood' in team_sub.columns else 0.0
    }
    league_metrics = {
        "Kills": float(df['kills'].mean()) if 'kills' in df.columns else 0.0,
        "Torres": float(df['towers'].mean()) if 'towers' in df.columns else 0.0,
        "Dragões": float(df['dragons'].mean()) if 'dragons' in df.columns else 0.0,
        "Barões": float(df['barons'].mean()) if 'barons' in df.columns else 0.0,
        "First Blood (%)": float(df['firstblood'].mean() * 100) if 'firstblood' in df.columns else 0.0
    }
    return {"team_stats": metrics, "league_stats": league_metrics}