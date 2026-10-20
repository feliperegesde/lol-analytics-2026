from fastapi import APIRouter
from ml_engine import state
import pandas as pd
import numpy as np

router = APIRouter()

@router.get("/api/teams")
def get_teams():
    if state.df_global is None: return {"teams": []}
    return {"teams": sorted(state.df_global['teamname'].dropna().unique().tolist())}

@router.get("/api/tournaments/{team_name}")
def get_tournaments(team_name: str):
    if state.df_global is None: return {"tournaments": ["Todos"]}
    return {"tournaments": ["Todos"] + sorted(state.df_global[state.df_global['teamname'].str.lower() == team_name.lower()]['league'].dropna().unique().tolist())}

@router.get("/api/opponents/{team_name}")
def get_opponents(team_name: str):
    if state.df_global is None: return {"opponents": []}
    sub = state.df_global[state.df_global['teamname'].str.lower() == team_name.lower()]
    return {"opponents": [o for o in sorted(sub['opponent'].dropna().unique().tolist()) if o != "Desconhecido"]}

@router.get("/api/lineup/{team_name}")
def get_team_lineup(team_name: str):
    if state.df_full is None: return {"lineup": "Elenco Desconhecido"}
    sub = state.df_full[(state.df_full['teamname'].str.lower() == team_name.lower()) & (state.df_full['position'].str.lower() != 'team')]
    if sub.empty: return {"lineup": "Elenco 2026"}
    return {"lineup": " • ".join(sub['playername'].value_counts().head(5).index.tolist())}

@router.get("/api/ai/playstyle/{team_name}")
def get_team_playstyle(team_name: str):
    if state.autoencoder is None: return {"error": "Modelo não treinado."}
    sub = state.df_global[(state.df_global['teamname'].str.lower() == team_name.lower()) & (state.df_global['playstyle_cluster'].notna())]
    if sub.empty: return {"nome": "Desconhecido", "desc": "Sem dados suficientes."}
    styles = {
        0: {"nome": "Snowball Agressivo", "desc": "Ritmo de jogo acelerado, focado em early kills e lutas."},
        1: {"nome": "Macro & Controle", "desc": "Jogo metódico: foco em visão, farm e late game scaling."},
        2: {"nome": "Equilibrado/Flex", "desc": "Adapta-se ao adversário, balanceando lutas e controle de mapa."}
    }
    return styles.get(int(sub['playstyle_cluster'].mode()[0]), {"nome": "Híbrido", "desc": "Múltiplas assinaturas detectadas."})

@router.get("/api/ai/predict-15m")
def predict_win_15m(gold_diff: float, xp_diff: float, kills: int, opp_kills: int):
    if state.xgb_model is None: return {"error": "Modelo não treinado."}
    features = pd.DataFrame([[gold_diff, xp_diff, kills, opp_kills]], columns=['golddiffat15', 'xpdiffat15', 'killsat15', 'opp_killsat15'])
    return {"win_probability": round(float(state.xgb_model.predict_proba(features)[0][1]) * 100, 1)}

@router.get("/api/simulate")
def run_monte_carlo(team1: str, team2: str, format: str = "MD5"):
    if state.df_global is None: return {"error": "Sem dados"}
    t1_df = state.df_global[state.df_global['teamname'].str.lower() == team1.lower()]
    t2_df = state.df_global[state.df_global['teamname'].str.lower() == team2.lower()]
    if t1_df.empty or t2_df.empty: return {"error": "Times não encontrados"}
    
    t1_wr = t1_df['result'].mean() if 'result' in t1_df.columns else 0.5
    t2_wr = t2_df['result'].mean() if 'result' in t2_df.columns else 0.5
    prob_t1 = t1_wr / (t1_wr + t2_wr) if (t1_wr + t2_wr) > 0 else 0.5
    
    wins_needed = 3 if format == "MD5" else 2
    sims = 10000
    t1_series_wins = 0
    scores = {f"{team1} 3 x 0 {team2}": 0, f"{team1} 3 x 1 {team2}": 0, f"{team1} 3 x 2 {team2}": 0, 
              f"{team1} 2 x 3 {team2}": 0, f"{team1} 1 x 3 {team2}": 0, f"{team1} 0 x 3 {team2}": 0} if wins_needed == 3 else \
             {f"{team1} 2 x 0 {team2}": 0, f"{team1} 2 x 1 {team2}": 0, f"{team1} 1 x 2 {team2}": 0, f"{team1} 0 x 2 {team2}": 0}
             
    np.random.seed()
    for _ in range(sims):
        w1, w2 = 0, 0
        while w1 < wins_needed and w2 < wins_needed:
            if np.random.rand() < np.clip(np.random.normal(prob_t1, 0.15), 0.1, 0.9): w1 += 1
            else: w2 += 1
        if w1 == wins_needed: t1_series_wins += 1
        key = f"{team1} {w1} x {w2} {team2}"
        if key in scores: scores[key] += 1
        
    sorted_scores = [{"score": k, "prob": round((v/sims)*100, 1)} for k, v in sorted(scores.items(), key=lambda i: i[1], reverse=True)]
    return {"seriesWinRate": round((t1_series_wins / sims) * 100, 1), "mapWinRate": round(prob_t1 * 100, 1), "mostLikelyScore": sorted_scores[0]["score"], "scores": sorted_scores}

@router.get("/api/radar/{team_name}")
def get_radar_stats(team_name: str):
    if state.df_global is None: return {}
    t_sub = state.df_global[state.df_global['teamname'].str.lower() == team_name.lower()]
    metrics = ['cspm', 'vspm', 'wpm', 'team kpm', 'dpm']
    labels = ['Farm/Min', 'Visão/Min', 'Wards/Min', 'Kills/Min', 'Dano/Min (x100)']
    
    t_stats, l_stats = {}, {}
    for m, l in zip(metrics, labels):
        val_t = float(t_sub[m].mean()) if m in t_sub.columns else 0.0
        val_l = float(state.df_global[m].mean()) if m in state.df_global.columns else 1.0
        if m == 'dpm': val_t, val_l = val_t/100, val_l/100
        t_stats[l] = round(val_t, 2)
        l_stats[l] = round(val_l, 2)
    return {"team_stats": t_stats, "league_stats": l_stats}

@router.get("/api/stats/{team_name}")
def get_team_stats(team_name: str, tournament: str = "Todos", side: str = "Ambos"):
    if state.df_global is None: return {"error": "Sem dados globais"}
    sub = state.df_global[state.df_global['teamname'].str.lower() == team_name.lower()].copy()
    if tournament != "Todos": sub = sub[sub['league'].str.lower() == tournament.lower()]
    if side != "Ambos" and 'side' in sub.columns: sub = sub[sub['side'].str.lower() == side.lower()]
    if sub.empty: return {"error": "Vazio"}
        
    total_games = len(sub)
    wins = int(sub['result'].sum()) if 'result' in sub.columns else 0
    
    gold_trend = []
    for t in [10, 15, 20, 25]:
        col = f'golddiffat{t}'
        val = float(sub[col].mean()) if col in sub.columns else 0.0
        gold_trend.append({"tempo": f"{t} min", "diff": round(val, 0)})

    drags = []
    drag_cols = {'infernals': '#ef4444', 'oceans': '#3b82f6', 'mountains': '#a16207', 'clouds': '#f8fafc', 'hextechs': '#06b6d4', 'chemtechs': '#22c55e'}
    for col, color in drag_cols.items():
        val = float(sub[col].mean()) if col in sub.columns else 0.0
        if val > 0: drags.append({"name": col.replace('s', '').capitalize(), "value": round(val, 2), "fill": color})

    return {
        "team": team_name, "total_games": total_games, "wins": wins, "losses": total_games - wins,
        "win_rate": round((wins / total_games * 100), 1) if total_games > 0 else 0.0,
        "avg_kills": round(sub['kills'].mean(), 1) if 'kills' in sub.columns else 0.0,
        "avg_duration": round(sub['duration_min'].mean(), 1) if 'duration_min' in sub.columns else 0.0,
        "first_blood_rate": round((sub['firstblood'].mean() * 100), 1) if 'firstblood' in sub.columns else 0.0,
        "first_tower_rate": round((sub['firsttower'].mean() * 100), 1) if 'firsttower' in sub.columns else 0.0,
        "gold_trend": gold_trend,
        "dragons": sorted(drags, key=lambda x: x['value'], reverse=True),
        "conversion": {
            "first_tower": round((sub[sub['firsttower'] == 1]['result'].mean() * 100), 1) if 'firsttower' in sub.columns and len(sub[sub['firsttower'] == 1]) > 0 else 0.0,
            "first_blood": round((sub[sub['firstblood'] == 1]['result'].mean() * 100), 1) if 'firstblood' in sub.columns and len(sub[sub['firstblood'] == 1]) > 0 else 0.0,
            "first_dragon": round((sub[sub['firstdragon'] == 1]['result'].mean() * 100), 1) if 'firstdragon' in sub.columns and len(sub[sub['firstdragon'] == 1]) > 0 else 0.0
        }
    }


# ... (restante do código acima fica igual) ...

@router.get("/api/stats/{team_name}")
def get_team_stats(team_name: str, tournament: str = "Todos", side: str = "Ambos"):
    if state.df_global is None: return {"error": "Sem dados globais"}
    sub = state.df_global[state.df_global['teamname'].str.lower() == team_name.lower()].copy()
    if tournament != "Todos": sub = sub[sub['league'].str.lower() == tournament.lower()]
    if side != "Ambos" and 'side' in sub.columns: sub = sub[sub['side'].str.lower() == side.lower()]
    if sub.empty: return {"error": "Vazio"}
        
    total_games = len(sub)
    wins = int(sub['result'].sum()) if 'result' in sub.columns else 0
    
    gold_trend = []
    for t in [10, 15, 20, 25]:
        col = f'golddiffat{t}'
        val = float(sub[col].mean()) if col in sub.columns else 0.0
        gold_trend.append({"tempo": f"{t} min", "diff": round(val, 0)})

    drags = []
    drag_cols = {'infernals': '#ef4444', 'oceans': '#3b82f6', 'mountains': '#a16207', 'clouds': '#f8fafc', 'hextechs': '#06b6d4', 'chemtechs': '#22c55e'}
    for col, color in drag_cols.items():
        val = float(sub[col].mean()) if col in sub.columns else 0.0
        if val > 0: drags.append({"name": col.replace('s', '').capitalize(), "value": round(val, 2), "fill": color})

    return {
        "team": team_name, "total_games": total_games, "wins": wins, "losses": total_games - wins,
        "win_rate": round((wins / total_games * 100), 1) if total_games > 0 else 0.0,
        "avg_kills": round(sub['kills'].mean(), 1) if 'kills' in sub.columns else 0.0,
        "avg_duration": round(sub['duration_min'].mean(), 1) if 'duration_min' in sub.columns else 0.0,
        "first_blood_rate": round((sub['firstblood'].mean() * 100), 1) if 'firstblood' in sub.columns else 0.0,
        "first_tower_rate": round((sub['firsttower'].mean() * 100), 1) if 'firsttower' in sub.columns else 0.0,
        "gold_trend": gold_trend,
        "dragons": sorted(drags, key=lambda x: x['value'], reverse=True),
        # === AQUI ESTAVA FALTANDO PARA O GRÁFICO APARECER ===
        "obj_rates": [
            {"name": "1ª Torre", "Taxa": round((sub['firsttower'].mean() * 100), 1) if 'firsttower' in sub.columns else 0},
            {"name": "1º Dragão", "Taxa": round((sub['firstdragon'].mean() * 100), 1) if 'firstdragon' in sub.columns else 0},
            {"name": "First Blood", "Taxa": round((sub['firstblood'].mean() * 100), 1) if 'firstblood' in sub.columns else 0},
            {"name": "1º Barão", "Taxa": round((sub['firstbaron'].mean() * 100), 1) if 'firstbaron' in sub.columns else 0}
        ],
        "conversion": {
            "first_tower": round((sub[sub['firsttower'] == 1]['result'].mean() * 100), 1) if 'firsttower' in sub.columns and len(sub[sub['firsttower'] == 1]) > 0 else 0.0,
            "first_blood": round((sub[sub['firstblood'] == 1]['result'].mean() * 100), 1) if 'firstblood' in sub.columns and len(sub[sub['firstblood'] == 1]) > 0 else 0.0,
            "first_dragon": round((sub[sub['firstdragon'] == 1]['result'].mean() * 100), 1) if 'firstdragon' in sub.columns and len(sub[sub['firstdragon'] == 1]) > 0 else 0.0
        }
    }