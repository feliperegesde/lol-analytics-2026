# 🐾 LoL Esports Analytics & AI Engine 2026

A high-performance analytical, predictive, and machine learning dashboard built for the 2026 professional League of Legends season, focused on analyzing FURIA's performance (and other irrelevant teams).

---

## 🚀 Tech Stack

- **Back-end & AI:** Python, FastAPI, Pandas, PyTorch, XGBoost, Scikit-learn, Uvicorn
- **Front-end:** React, TypeScript, Tailwind CSS, Recharts, Lucide Icons
- **Data Source:** Oracle's Elixir (official 2026 match data)

---

## 📊 Key Features & AI Models

1. **Machine Learning Predictor (XGBoost):** Real-time win probability calculator based on in-game metrics and team performance.
2. **Tactical DNA (Deep Learning Autoencoder):** PyTorch-based neural network that clusters and identifies each team's playstyle patterns.
3. **Advanced Monte Carlo Simulator:** Statistical engine running 10,000 matchup scenarios to estimate win probabilities between two teams.
4. **Snowball & Economy Tracking:** Interactive area charts showcasing the average gold advantage and how leads evolve throughout the game.
5. **Macro & Objectives:** Deep dive into map control, including First Objective conversion rates (tower, first blood, and dragon).
6. **Comparative Radar:** Radar charts comparing a team's fundamental metrics (Vision, Aggression, Objectives, and more) against other teams.

---

## 🛠️ How to Run the Project

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/furia-lol-analytics-2026.git
cd furia-lol-analytics-2026
```

### 2. Set Up and Run the Back-end (FastAPI & AI)

```bash
cd backend
pip install fastapi uvicorn pandas numpy scikit-learn xgboost torch
uvicorn main:app --reload
```

*(Make sure the Oracle's Elixir CSV file is inside the `backend/` folder. The AI models will automatically train upon startup.)*

The back-end API will be available at `http://localhost:8000`.

*(Optional)* Test the AI engine directly:

```bash
python test_ai.py
```

### 3. Set Up and Run the Front-end (React)

Open another terminal in the `frontend` folder:

```bash
cd frontend
npm install
npm install recharts lucide-react
npm run dev
```

The front-end will be available at `http://localhost:5173`.

---

## 📌 Repository Structure

```plaintext
furia-lol-analytics-2026/
├── backend/
│   ├── 2026_LoL_esports_match_data_from_OraclesElixir.csv
│   ├── main.py              # FastAPI entry point
│   ├── api_routes.py        # API Endpoints mapping
│   ├── ml_engine.py         # PyTorch Autoencoder, XGBoost & Data processing
│   ├── test_ai.py           # Diagnostic script for AI models
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/      # Componentized architecture
│   │   │   ├── tabs/        # Individual tab views (Overview, Radar, Simulator, etc.)
│   │   │   └── Sidebar.tsx  # Navigation sidebar
│   │   ├── api.ts           # Centralized Fetch/HTTP requests
│   │   ├── App.tsx          # Main React component
│   │   ├── index.css        # Tailwind global directives
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

---

## 📄 License

Independent project for portfolio and study purposes. No official affiliation with FURIA Esports or Riot Games. All match data belongs to Oracle's Elixir.
