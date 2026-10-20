# FURIA Esports LoL Analytics 2026

A high-performance analytical and predictive dashboard built for the 2026 professional League of Legends season, focused on analyzing FURIA's performance.

---

## 🚀 Tech Stack

* **Back-end:** Python, FastAPI, Pandas, Uvicorn
* **Front-end:** React, TypeScript, Tailwind CSS, Lucide Icons
* **Data Source:** Oracle's Elixir (official 2026 match data)

---

## 📊 Key Features

1. **Interactive Tactical Dashboard:** Tracks win rate, average kills, average game duration, first blood, and first tower, with filters by tournament and map side.
2. **Objective Control (*Snowball*):** Analyzes how often winning the first objective (tower, first blood, and dragon) converts into a victory.
3. **Comparative Attribute Radar:** Direct statistical comparison of performance between different teams.
4. **Matchup Simulator (Monte Carlo):** Statistical engine that runs 10,000 scenarios to estimate the win probability between two teams.

---

## 🛠️ How to Run the Project

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/furia-lol-analytics-2026.git
cd furia-lol-analytics-2026
```

### 2. Set Up and Run the Back-end (FastAPI)

```bash
cd backend
pip install fastapi uvicorn pandas
uvicorn main:app --reload
```

*(Make sure the Oracle's Elixir CSV file is inside the `backend/` folder.)*

The back-end will be available at `http://localhost:8000`.

### 3. Set Up and Run the Front-end (React)

Open another terminal in the `frontend` folder:

```bash
cd frontend
npm install
npm run dev
```

The front-end will be available at `http://localhost:5173`.

---

## 📌 Repository Structure

```plaintext
furia-lol-analytics-2026/
├── backend/
│   ├── 2026_LoL_esports_match_data_from_OraclesElixir.csv
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
└── README.md
```

---

## 📄 License

Independent project, with no official affiliation with FURIA Esports or Riot Games. All data belongs to Oracle's Elixir.