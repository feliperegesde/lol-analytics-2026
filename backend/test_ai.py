import requests
import time

print("="*50)
print(" 🤖 TESTE DIAGNÓSTICO DO MOTOR DE IA")
print("="*50)

# 1. Testando o Deep Learning (Autoencoder)
print("\n[1/2] Testando Deep Learning (Classificação de DNA Tático)...")
times_para_testar = ["FURIA", "LOUD", "T1", "LØS"]

for time_nome in times_para_testar:
    try:
        response = requests.get(f"http://localhost:8000/api/ai/playstyle/{time_nome}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ {time_nome}: {data.get('nome', 'N/D')} -> {data.get('desc', 'N/D')}")
        else:
            print(f"❌ {time_nome}: Erro na API (Status {response.status_code})")
    except Exception as e:
        print(f"❌ {time_nome}: Falha de conexão. A API está rodando? Erro: {e}")
    time.sleep(0.5)

# 2. Testando Machine Learning (XGBoost)
print("\n[2/2] Testando Machine Learning (Previsão XGBoost aos 15 min)...")
cenarios_ouro = [
    (0, "Jogo Empatado"),
    (1500, "Vantagem Leve (+1.5k Gold)"),
    (4000, "Snowball Forte (+4k Gold)"),
    (-2500, "Perdendo Feio (-2.5k Gold)")
]

for ouro, desc in cenarios_ouro:
    xp = ouro * 0.6
    kills = 3 if ouro > 0 else 0
    opp_kills = 3 if ouro < 0 else 0
    try:
        url = f"http://localhost:8000/api/ai/predict-15m?gold_diff={ouro}&xp_diff={xp}&kills={kills}&opp_kills={opp_kills}"
        response = requests.get(url)
        if response.status_code == 200:
            prob = response.json().get('win_probability')
            print(f"✅ Cenário: {desc} -> {prob}% de chance de vitória.")
        else:
            print(f"❌ Cenário {desc}: Erro na API.")
    except Exception as e:
        print(f"❌ Falha de conexão: {e}")
    time.sleep(0.5)

print("\n🚀 Diagnóstico Completo!")