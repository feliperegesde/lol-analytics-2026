import pandas as pd
import numpy as np
import os
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
import xgboost as xgb
import torch
import torch.nn as nn

CSV_PATH = "2026_LoL_esports_match_data_from_OraclesElixir.csv"

# Modelos
class PlaystyleAutoencoder(nn.Module):
    def __init__(self, input_dim):
        super(PlaystyleAutoencoder, self).__init__()
        self.encoder = nn.Sequential(nn.Linear(input_dim, 16), nn.ReLU(), nn.Linear(16, 8), nn.ReLU(), nn.Linear(8, 2))
        self.decoder = nn.Sequential(nn.Linear(2, 8), nn.ReLU(), nn.Linear(8, 16), nn.ReLU(), nn.Linear(16, input_dim))
    def forward(self, x): return self.encoder(x), self.decoder(self.encoder(x))

# Estado Global
class MLState:
    df_global = None
    df_full = None
    scaler_dl = StandardScaler()
    autoencoder = None
    kmeans = None
    xgb_model = None

state = MLState()

def load_data():
    if not os.path.exists(CSV_PATH): return None, None
    df = pd.read_csv(CSV_PATH, low_memory=False)
    df_team = df[df['position'].str.lower() == 'team'].copy()
    if 'gameid' in df_team.columns and 'teamname' in df_team.columns:
        pairs = df_team[['gameid', 'teamname']].drop_duplicates()
        merged = pd.merge(pairs, pairs, on='gameid', suffixes=('', '_opp'))
        merged = merged[merged['teamname'] != merged['teamname_opp']].drop_duplicates(subset=['gameid', 'teamname'])
        df_team = pd.merge(df_team, merged[['gameid', 'teamname', 'teamname_opp']], on=['gameid', 'teamname'], how='left')
        df_team['opponent'] = df_team['teamname_opp'].fillna("Desconhecido")
    df_team['duration_min'] = (df_team['gamelength'] / 60.0).round(1) if 'gamelength' in df_team.columns else 30.0
    return df_team, df

def train_models():
    state.df_global, state.df_full = load_data()
    if state.df_global is None: return

    # Deep Learning (DNA Tático)
    features_dl = ['ckpm', 'vspm', 'gspd', 'cspm', 'dpm']
    df_dl = state.df_global.dropna(subset=features_dl).copy()
    if len(df_dl) > 50:
        X_dl = state.scaler_dl.fit_transform(df_dl[features_dl])
        tensor_x = torch.FloatTensor(X_dl)
        state.autoencoder = PlaystyleAutoencoder(input_dim=len(features_dl))
        optimizer = torch.optim.Adam(state.autoencoder.parameters(), lr=0.01)
        for _ in range(50):
            optimizer.zero_grad()
            _, decoded = state.autoencoder(tensor_x)
            loss = nn.MSELoss()(decoded, tensor_x)
            loss.backward()
            optimizer.step()
        with torch.no_grad(): embeddings, _ = state.autoencoder(tensor_x)
        state.kmeans = KMeans(n_clusters=3, random_state=42)
        state.df_global.loc[df_dl.index, 'playstyle_cluster'] = state.kmeans.fit_predict(embeddings.numpy())

    # Machine Learning (XGBoost)
    features_ml = ['golddiffat15', 'xpdiffat15', 'killsat15', 'opp_killsat15']
    df_ml = state.df_global.dropna(subset=features_ml + ['result']).copy()
    if len(df_ml) > 50:
        state.xgb_model = xgb.XGBClassifier(n_estimators=100, learning_rate=0.1, random_state=42)
        state.xgb_model.fit(df_ml[features_ml], df_ml['result'])