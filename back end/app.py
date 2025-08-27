"""Simple Flask backend serving 12 AI-model endpoints + aggregated dashboard data.
Run with:
    python app.py
The frontend will consume each model route (e.g. http://127.0.0.1:5000/model1)
via fetch calls defined in `src/api/models.js`.
Replace the `run_inference_*` stubs with real model inference once your models
are ready.
"""

from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
import random
import json
from datetime import datetime
from pathlib import Path
from model_loader import load_models
from collections import deque
import threading
import time
import random

app = Flask(__name__)
CORS(app)  # enable CORS for all domains on all routes

# ----------------------------------------------------------------------------
# -----------------------------------------------------------------------------
# Load all discovered models once at startup
# -----------------------------------------------------------------------------
PROJECT_ROOT = Path(__file__).resolve().parent.parent
MODELS = load_models(PROJECT_ROOT)
FAKE_MODEL_KEYS = [f"model{i}" for i in range(1, 13)]
print(f"Loaded {len(MODELS)} models: {list(MODELS.keys())}")

# In-memory storage for incoming device data
MAX_ALERTS = 200
ALERTS = deque(maxlen=MAX_ALERTS)

# Persisted attack log (JSON Lines)
LOG_DIR = Path(__file__).resolve().parent / "data"
LOG_DIR.mkdir(parents=True, exist_ok=True)
LOG_FILE = LOG_DIR / "attacks.log"  # rolling central log

def _daily_log_path():
    """Return path of JSONL log for the current UTC day."""
    return LOG_DIR / f"attacks_{datetime.utcnow().strftime('%Y-%m-%d')}.log"

ATTACK_TYPES = [
    "حجب الخدمة",  # DDoS
    "حقن SQL",
    "XSS",
    "محاولات تسجيل دخول",
    "آخرون",
]

def _generate_dummy_alert():
    attack = random.choice(ATTACK_TYPES)
    return {
        "id": random.randint(1000, 9999),
        "attack": attack,  # explicit attack type
        "message": f"{attack} – حدثت محاولة هجوم",
        "source": f"192.168.1.{random.randint(1,254)}",
        "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M"),
        "level": random.choice(["high", "medium", "low"]),
    }

def _seed_data_if_empty():
    if not ALERTS:
        for _ in range(10):
            ALERTS.appendleft(_generate_dummy_alert())
        STATS["todayAttempts"] = len(ALERTS)
        STATS["topAttack"] = "SQLi"
        STATS["successRate"] = random.randint(50,95)

STATS = {
    "todayAttempts": 0,
    "topAttack": "",
    "successRate": 0,
    "dailyTrends": [],
}

# ---------------- Background simulator ----------------
_SIM_THREAD_STARTED = False

def _background_simulator(interval=5):
    while True:
        ALERTS.appendleft(_generate_dummy_alert())
        STATS["todayAttempts"] += 1
        STATS["topAttack"] = random.choice(["SQLi","XSS","DDoS","Brute Force"])
        STATS["successRate"] = random.randint(40, 98)
        time.sleep(interval)

def _start_sim_thread():
    global _SIM_THREAD_STARTED
    if _SIM_THREAD_STARTED:
        return
    _SIM_THREAD_STARTED = True
    threading.Thread(target=_background_simulator, daemon=True).start()

# Dummy inference helpers – replace with real logic or map to MODELS entries
# ----------------------------------------------------------------------------

def run_inference_classification():
    return {
        "alerts": [
            {
                "id": random.randint(1000, 9999),
                "message": "محاولة تسجيل دخول غير مصرح بها",
                "source": "192.168.1." + str(random.randint(1, 254)),
                "timestamp": "2025-07-21 18:00",
                "level": random.choice(["high", "medium", "low"]),
            }
            for _ in range(random.randint(3, 10))
        ]
    }

def default_stat(value=0):
    return value + random.randint(0, 10)

# ----------------------------------------------------------------------------
# Individual model routes (12 placeholders)
# ----------------------------------------------------------------------------


@app.route("/model/<string:model_key>", methods=["POST", "GET"])
def model_endpoint(model_key):
    """Generic route: /model/<model_key>
    Accepts JSON payload {"input": ...} and returns {"output": ...}
    For now returns a random number if model not found.
    """
    model = MODELS.get(model_key)

    # Ingest POST from any known or fake model key
    if request.method == "POST":
        if model is None and model_key not in FAKE_MODEL_KEYS:
            return jsonify({"error": f"model '{model_key}' not recognized"}), 404

        # Parse JSON body; default to empty dict if not provided
        data = request.get_json(silent=True) or {}

        # -------------------------------------------------------------
        # Validate payload – future models may define richer schemas, but
        # at minimum we expect an `input` field now. This prevents obscure
        # inference errors later and gives clients clear feedback.
        # -------------------------------------------------------------
        if "input" not in data:
            return jsonify({"error": "JSON body must contain 'input' field"}), 400

        # -------------------------------------------------------------
        # 1. Run inference (real model if loaded, else generate random)
        # -------------------------------------------------------------
        try:
            if model is not None and hasattr(model, "predict"):
                # Example: model.predict expects list/array – adapt as needed
                raw_pred = model.predict([data]).item()
                prediction = float(raw_pred) if isinstance(raw_pred, (int, float)) else float(raw_pred[0])
            else:
                prediction = round(random.uniform(0, 1), 3)
        except Exception:
            # If real inference fails fall back to random so pipeline keeps running
            prediction = round(random.uniform(0, 1), 3)

        label = "attack" if prediction > 0.7 else "normal"

        # -------------------------------------------------------------
        # 2. Update alerts & stats
        # -------------------------------------------------------------
        attack_record = {
            "model": model_key,
            "message": f"{label} (p={prediction}) from {model_key}",
            "source": data.get("src_ip", "device"),
            "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M"),
            "level": "high" if label == "attack" else "low",
        }
        ALERTS.appendleft(attack_record)
        STATS["todayAttempts"] += 1
        STATS["topAttack"] = "AI"  # placeholder

        # Persist to JSON-Lines log on disk
        try:
            # 1) Append to central rolling file
            with LOG_FILE.open("a", encoding="utf-8") as f:
                f.write(json.dumps(attack_record, ensure_ascii=False) + "\n")
            # 2) Append to date-specific daily file so we never lose data after restarts
            daily_path = _daily_log_path()
            with daily_path.open("a", encoding="utf-8") as f:
                f.write(json.dumps(attack_record, ensure_ascii=False) + "\n")
        except Exception as e:
            # Do not let IO errors break the request cycle
            print("[warn] failed to write attack log:", e)

        # -------------------------------------------------------------
        # 3. Return structured inference result
        # -------------------------------------------------------------
        return jsonify({
            "model": model_key,
            "prediction": prediction,
            "label": label,
        })

    # For GET, report readiness if model exists or is part of fake keys
    if model is not None or model_key in FAKE_MODEL_KEYS:
        return jsonify({"model": model_key, "status": "ready"})
    return jsonify({"error": f"model '{model_key}' not found"}), 404

# ----------------------------------------------------------------------------
@app.route("/models")
def list_models():
    """Return list of model keys (real + fake)."""
    # Prefer real discovered models; fall back to placeholder keys if none found
    from model_loader import discover_model_files
    if MODELS:
        keys = sorted(MODELS.keys())
    elif discover_model_files(PROJECT_ROOT):
        keys = sorted({p.stem for p in discover_model_files(PROJECT_ROOT)})
    else:
        keys = FAKE_MODEL_KEYS
    return jsonify(keys)

# ----------------------------------------------------------------------------
# Attack log retrieval
# ----------------------------------------------------------------------------

@app.route("/attacks")
def attacks():
    """Return the latest N attack records in reverse chronological order.
    Query params:
        limit: int (default 100)
    """
    limit = int(request.args.get("limit", 100))
    # Fast path if we have them buffered
    if limit <= len(ALERTS):
        return jsonify(list(ALERTS)[:limit])
    # Otherwise read from disk and merge
    records = []
    try:
        with LOG_FILE.open("r", encoding="utf-8") as f:
            for line in f.readlines()[-limit:]:
                try:
                    records.append(json.loads(line))
                except json.JSONDecodeError:
                    continue
    except FileNotFoundError:
        pass
    # Prepend in-memory ones (already newest first)
    records = list(ALERTS) + list(reversed(records))
    return jsonify(records[:limit])

# ----------------------------------------------------------------------------
# Log files listing & download
# ----------------------------------------------------------------------------

@app.route("/log-files")
def log_files():
    """Return list of available daily log files with metadata (UTC)."""
    files = []
    for p in sorted(LOG_DIR.glob("attacks_*.log")):
        date_str = p.stem.replace("attacks_", "")
        files.append({
            "date": date_str,
            "filename": p.name,
            "size": p.stat().st_size,
        })
    return jsonify(files)

@app.route("/download-log")
def download_log():
    """Download a given log file by filename query param."""
    fname = request.args.get("file")
    if not fname:
        return jsonify({"error":"file param required"}), 400
    path = LOG_DIR / fname
    if not path.exists():
        return jsonify({"error":"not found"}), 404
    # Use send_file to serve files outside default static folder
    return send_file(path, as_attachment=True)

# Dashboard aggregation
@app.route("/dashboard")
@app.route("/dashboard")
def dashboard():
    _seed_data_if_empty()
    return jsonify({
        "alerts": list(ALERTS),
        "stats": STATS,
    })

# Aggregated route for the dashboard (optional convenience)
# ----------------------------------------------------------------------------




if __name__ == "__main__":
    _start_sim_thread()
    app.run(host="0.0.0.0", port=5000, debug=True)
