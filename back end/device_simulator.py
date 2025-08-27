"""Simulates 12 remote devices sending data to the Flask backend.

Run with:
    python device_simulator.py --url http://127.0.0.1:5000 --interval 5

Each "device" posts a small JSON payload every <interval> seconds to
    POST <url>/model/<model_key>
where <model_key> is model1..model12.

Stop with Ctrl-C.
"""

import argparse
import json
import random
import threading
import time
from datetime import datetime
from typing import List

import requests

DEFAULT_KEYS = [f"model{i}" for i in range(1, 13)]


def make_payload(model_key: str) -> dict:
    """Generate a dummy payload based on the model key."""
    if model_key == "model1":  # example: brute-force detector
        return {
            "features": [random.random() for _ in range(6)],
            "device": "server-A",
            "timestamp": datetime.utcnow().isoformat(),
        }
    elif model_key == "model2":  # anomaly detector
        return {
            "metrics": {
                "cpu": random.randint(0, 100),
                "mem": random.randint(0, 100),
                "disk": random.randint(0, 100),
            },
            "timestamp": datetime.utcnow().isoformat(),
        }
    elif model_key == "model3":  # keylogger detection
        return {
            "keystroke_sequence": "".join(random.choices("asdfjkl;", k=50)),
            "window_title": random.choice(["chrome.exe", "word.exe", "discord.exe"]),
            "timestamp": datetime.utcnow().isoformat(),
        }
    elif model_key == "model4":  # ransomware behaviour
        return {
            "entropy": round(random.uniform(4.0, 7.9), 2),
            "file_ext": random.choice([".docx", ".xlsx", ".pdf"]),
            "access_type": random.choice(["write", "rename", "delete"]),
            "timestamp": datetime.utcnow().isoformat(),
        }
    elif model_key == "model5":  # botnet traffic
        return {
            "src_ip": f"192.168.1.{random.randint(1,254)}",
            "dst_ip": f"10.0.0.{random.randint(1,254)}",
            "packets": random.randint(10, 500),
            "bytes": random.randint(1000, 50000),
            "timestamp": datetime.utcnow().isoformat(),
        }
    elif model_key == "model6":  # SQL injection
        return {
            "query": "SELECT * FROM users WHERE id = " + str(random.randint(1, 100)) + " --",
            "user_agent": random.choice(["curl/7.68.0", "Mozilla/5.0"]),
            "timestamp": datetime.utcnow().isoformat(),
        }
    elif model_key == "model7":  # XSS detection
        return {
            "url": "/search?q=<script>alert('x')</script>",
            "referrer": "http://example.com",
            "timestamp": datetime.utcnow().isoformat(),
        }
    elif model_key == "model8":  # brute-force login attempts
        return {
            "username": random.choice(["admin", "root", "guest"]),
            "success": False,
            "src_ip": f"203.0.113.{random.randint(1,254)}",
            "timestamp": datetime.utcnow().isoformat(),
        }
    elif model_key == "model9":  # network anomaly score
        return {
            "flow_duration_ms": random.randint(10, 10000),
            "packet_loss": round(random.random(), 3),
            "timestamp": datetime.utcnow().isoformat(),
        }
    elif model_key == "model10":  # malware file upload
        return {
            "filename": f"sample{random.randint(1,1000)}.exe",
            "size_kb": random.randint(100, 20480),
            "mime": "application/vnd.microsoft.portable-executable",
            "timestamp": datetime.utcnow().isoformat(),
        }
    elif model_key == "model11":  # phishing email classifier
        return {
            "subject": random.choice(["Urgent update", "Invoice #12345", "Congrats, you won!"]),
            "from_domain": random.choice(["example.com", "mail.ru", "phish.co"]),
            "timestamp": datetime.utcnow().isoformat(),
        }
    elif model_key == "model12":  # DDoS traffic predictor
        return {
            "pps": random.randint(1000, 100000),
            "bpp": random.randint(64, 1500),
            "timestamp": datetime.utcnow().isoformat(),
        }
    # Fallback generic payload
    return {
        "value": random.randint(0, 1000),
        "timestamp": datetime.utcnow().isoformat(),
    }


def worker(model_key: str, url: str, interval: float):
    endpoint = f"{url.rstrip('/')}/model/{model_key}"
    while True:
        payload = make_payload(model_key)
        try:
            resp = requests.post(endpoint, json=payload, timeout=3)
            status = resp.status_code
            print(f"[{model_key}] → {status}")
        except Exception as exc:
            print(f"[{model_key}] error: {exc}")
        time.sleep(interval)


def run(keys: List[str], url: str, interval: float):
    threads = []
    for key in keys:
        t = threading.Thread(target=worker, args=(key, url, interval), daemon=True)
        t.start()
        threads.append(t)
    # Keep main thread alive
    try:
        while True:
            time.sleep(3600)
    except KeyboardInterrupt:
        print("Stopping simulator…")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Simulate devices sending data to backend")
    parser.add_argument("--url", default="http://127.0.0.1:5000", help="Backend base URL")
    parser.add_argument("--interval", type=float, default=5.0, help="Seconds between messages per model")
    args = parser.parse_args()

    run(DEFAULT_KEYS, args.url, args.interval)
