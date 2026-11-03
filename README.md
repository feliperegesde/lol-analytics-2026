#  LoL Esports Analytics & AI Engine 2026

A high-performance analytical, predictive and *Machine Learning* dashboard, developed to analyze professional League of Legends matches in 2026, with a focus on FURIA Esports.

---

##  Technologies Used

- **Back-end & AI:** Python, FastAPI, Pandas, PyTorch, XGBoost, Scikit-learn, Uvicorn
- **Front-end:** React, TypeScript, Tailwind CSS, Recharts, Lucide Icons
- **Data Sources:** Oracle's Elixir (official 2026 match data) and Data Dragon (Riot Games assets)

---

##  Main Features & AI Models

1. **Global Meta:** Macro view of the LoL ecosystem, with analysis filters by region, league and team.
2. **Draft & Meta:** Scatter charts crossing pick rate (*Pick Rate*) with win rate (*Win Rate*) for each champion.
3. **Machine Learning Predictor (XGBoost):** Interactive calculator for the win probability of a match based on the draft and in-game metrics.
4. **Tactical DNA (Deep Learning Autoencoder):** PyTorch neural network that groups teams by playstyle and identifies tactical profiles.
5. **Advanced Monte Carlo Simulator:** Statistical analysis engine that runs 10,000 simulations to estimate outcomes and probabilities.
6. **Snowball & Economy:** Interactive area charts that visually show how gold and experience advantages evolve throughout the game.
7. **Macro & Objectives:** In-depth analysis of map control, including objective rates (dragons, barons, towers, etc.).
8. **Comparative Radar:** Radar (*Spider*) charts that compare the key metrics of teams and players.

---

##  How to Run the Project

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/furia-lol-analytics-2026.git
cd furia-lol-analytics-2026
```

### 2. Set Up and Run the Back-end (FastAPI & AI)

```bash
cd backend
pip install fastapi uvicorn pandas numpy scikit-learn xgboost torch requests
uvicorn main:app --reload
```

*(Make sure the Oracle's Elixir CSV file is located inside the `backend/` folder. The AI models will be trained automatically on startup.)*

The back-end API will be available at `http://localhost:8000`.

*(Optional)* Test the AI engine directly from the terminal:

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

The *front-end* will be available at `http://localhost:5173`.

---

## 📌 Repository Structure

```text
furia-lol-analytics-2026/
├── backend/
│   ├── 2026_LoL_esports_match_data_from_OraclesElixir.csv
│   ├── main.py              # FastAPI entry point
│   ├── api_routes.py        # API endpoint mapping
│   ├── ml_engine.py         # PyTorch Autoencoder, XGBoost & Data Processing
│   ├── test_ai.py           # Diagnostic script for the AI models
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/          # (Optional) Downloaded team icons
│   │   ├── components/      # Component-based architecture
│   │   │   ├── tabs/        # Individual tab views (Overview, Meta, etc.)
│   │   │   ├── CustomTooltip.tsx  # Custom Recharts tooltip
│   │   │   └── Sidebar.tsx  # Side navigation bar with search field
│   │   ├── api.ts           # Centralized HTTP requests (Fetch)
│   │   ├── App.tsx          # Main React component with state routing
│   │   ├── index.css        # Global Tailwind directives
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

---

##  License

Independent project created for portfolio and *Data Science* study purposes. Not officially affiliated with FURIA Esports or Riot Games. All raw match data belongs to Oracle's Elixir, and the images/icons belong to the Riot Games database (Data Dragon).