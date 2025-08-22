
## Project Overview: Codeforces Rank Progress Predictor

### 🎯 Goal

Build a **full-stack web application** that predicts **how long it will take a competitive programmer to reach the next Codeforces rank** (e.g., Expert, Candidate Master) based on their **rating history**.

* **Backend (Flask, Python)**

  * Exposes an API endpoint (e.g., `/predict/<handle>`)
  * Fetches rating history from the **Codeforces API**
  * Uses a simple **ML model / regression** to estimate rating growth trend
  * Returns predictions in JSON (e.g., `"Expert": "8 months"`, `"Candidate Master": "2 years"`)
  * No database — stateless, lightweight API

* **Frontend (React + TypeScript + TailwindCSS)**

  * Single-page app (SPA) for user interaction
  * Input field for **Codeforces handle**
  * Calls the Flask API and displays predictions clearly in a **card layout**
  * Simple, responsive, minimal UI

* **Workflow**

  1. User enters their Codeforces handle in the frontend
  2. React sends a request to Flask API
  3. Flask fetches data from Codeforces API → runs prediction → responds with JSON
  4. React displays predicted times to reach Expert, Candidate Master, etc.

* **Extensions (future)**

  * Use more advanced ML models (time series, curve fitting, etc.)
  * Add graphs of rating history + forecast
  * Deploy full-stack app (Flask + React) on cloud

👉 In short: **A predictive full-stack project where Flask handles ML predictions and React/Tailwind provides a clean user interface.**


## Setting up the Backend Environment

```bash
cd server

# create and activate a virtual environment (Windows + bash.exe)
python -m venv .venv
source .venv/Scripts/activate

pip install -r requirements.txt
```

## Run the Flask app
python app.py
