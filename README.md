# An-artificial-intelligence-system-to-analyze-attempts-to-hack"# secuirity-ai" 
This file explains in detail how the system works (backend and frontend), how to run it, and how to customize it.
The original documentation is provided in Arabic with examples of commands and model names.

Table of Contents

Short Introduction

Project Architecture

Software Requirements

Step-by-Step Setup

Backend (Flask) Explanation

Frontend (React / Tailwind / Recharts) Explanation

Supported Models and Naming Conventions

Adding New Models

Logs and Daily Reports

Frequently Asked Questions (FAQ)

1. Short Introduction

This project provides a real-time monitoring system for 12 AI models specialized in cybersecurity.
The models are served through a Flask backend, while a React frontend displays a live dashboard that refreshes automatically every few seconds without reloading the page.

2. Project Architecture
final ai/
├── back end/                 # Flask server + model loading
│   ├── app.py                # REST endpoints + data simulation
│   ├── model_loader.py       # Discover & load *.joblib / *.pt / *.h5
│   ├── device_simulator.py   # Sends fake data to test the system
│   └── data/                 # Attack logs in JSONL format
│
├── pageeee/ai-dashboard/     # React 18 + TailwindCSS app
│   ├── src/api/              # REST calls (models.js, attacks.js)
│   ├── src/components/       # UI cards and widgets
│   └── src/pages/Dashboard.jsx # Main dashboard page
│
└── README_Arabic.md          # Arabic documentation

3. Software Requirements
Layer	Recommended Version
Python	3.9+
Node.js	18+
npm / pnpm / yarn	9 / 8 / 3
ML Libraries	scikit-learn, torch, tensorflow (optional per model)

Note: Heavy libraries such as PyTorch are only needed if you add real .pt models.

4. Step-by-Step Setup
# 1) Backend setup
cd "back end"
python -m venv .venv && . .venv/Scripts/activate   # Windows
pip install -r requirements.txt
python app.py                                      # Runs on port 5000

# 2) (Optional) Start device simulator for continuous fake data
python device_simulator.py

# 3) Frontend setup
cd ../pageeee/ai-dashboard
npm install
npm start                                         # Opens at http://localhost:3000


The dashboard automatically refreshes itself every 5 seconds using a scheduled fetch.

5. Backend (Flask) Explanation
Endpoint	Method	Description
/models	GET	Returns list of available model keys (real + dummy)
/model/<model_key>	GET	Check model readiness; returns {status:"ready"} or 404
/model/<model_key>	POST	Send JSON payload for prediction; returns {prediction, label}
/dashboard	GET	Aggregates alerts and statistics for the frontend
/attacks	GET	Returns last N attack logs (JSONL)
/log-files	GET	Lists daily log files attacks_YYYY-MM-DD.log
/download-log?file=...	GET	Download specific log file
Daily Logs

A new file is created daily in back end/data/ named attacks_<date>.log.
Each line is a full JSON record, making it easy to analyze with ELK or Pandas.

6. Frontend Explanation

Framework: React 18 with Vite + TailwindCSS

Charts: Recharts (LineChart, BarChart)

Data Updates: useEffect fetches /dashboard periodically and updates state

Dark Mode: Toggle between Tailwind dark/light, preference saved in localStorage

Sidebar: Tabs for Alerts and Reports. Reports fetch /log-files

Download Button: handleDownloadReport fetches CSV from /attacks

7. Supported Models and Default Names

If no real models are provided, the backend generates 12 dummy keys.

To replace them, place your models inside the models/ folder with the following naming pattern:

File Name	Attack Type (Example)	Framework
ddos.joblib	DDoS	Scikit-learn
sql_injection.pt	SQL Injection (SQLi)	PyTorch
xss.h5	XSS	TensorFlow/Keras
…	…	…

The filename (without extension) will appear as the model key in /models and the dashboard.

8. Adding a New Model

Train your model and save it (joblib.dump, torch.save, or equivalent).

Place the file in the models/ directory.

Restart Flask – models are auto-discovered via model_loader.load_models().

Send a POST request to /model/<key> with a JSON input matching your model.

(Optional) Add custom prediction logic in app.py.

9. Daily Reports

Creation: Each successful prediction is appended as a line in the daily log file.

View: Open Sidebar → "Reports" to see available log files.

Direct CSV Download: Use the "Download" button to export the last 1000 records.

10. Frequently Asked Questions (FAQ)
Question	Answer
I don’t see data on the charts	Ensure the backend is running and the simulator is active
Console shows 404 errors	Safe to ignore; missing models are skipped
How to change refresh interval?	Edit the POLL_INTERVAL constant in Dashboard.jsx
Does it support WebSocket?	Not yet, but extendable via Flask-SocketIO and React socket.io-client
Contributions

We welcome pull requests, bug reports, and feature suggestions.

License

This project was created for educational and experimental purposes.
Feel free to use, modify, and share improvements.
