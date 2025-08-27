#!/usr/bin/env python
"""Universal launcher to spin up backend Flask API and frontend React dev server.

Usage:
    double-click after project is laid out as:
        backend/   (contains app.py and requirements.txt)
        frontend/  (React app with package.json)

The script will:
  • Create a local venv under ./env if absent.
  • Install backend python requirements.
  • Run backend (Flask) and frontend (npm run dev) concurrently.
  • Open the default browser to the frontend URL.
"""

import os
import sys
import subprocess
import shutil
import threading
import time
import webbrowser
from pathlib import Path

# Optional system-tray support
try:
    import pystray
    from PIL import Image
except ImportError:
    pystray = None

ROOT = Path(__file__).resolve().parent
BACKEND = ROOT / "back end"
# Path to React frontend root (contains package.json)
FRONTEND = ROOT / Path("pageeee")
VENV_DIR = ROOT / "env"

# Windows paths
SCRIPTS = "Scripts" if os.name == "nt" else "bin"


def ensure_venv():
    """Create virtualenv and install backend deps if missing."""
    if not VENV_DIR.exists():
        print("[launcher] Creating virtual environment …")
        subprocess.check_call([sys.executable, "-m", "venv", str(VENV_DIR)])

    pip = VENV_DIR / SCRIPTS / ("pip.exe" if os.name == "nt" else "pip")

    print("[launcher] Upgrading pip … (will ignore errors)")
    try:
        subprocess.check_call([str(pip), "install", "--upgrade", "pip"])
    except subprocess.CalledProcessError:
        print("[launcher] pip upgrade failed – continuing with existing version.")

    req_file = BACKEND / "requirements.txt"
    if req_file.exists():
        print("[launcher] Installing backend requirements …")
        subprocess.check_call([str(pip), "install", "-r", str(req_file)])
    else:
        print("[launcher] WARNING: requirements.txt not found in backend/ .")


def run_backend():
    python = VENV_DIR / SCRIPTS / ("python.exe" if os.name == "nt" else "python")
    env = os.environ.copy()
    env.setdefault("FLASK_APP", "app.py")
    env.setdefault("FLASK_ENV", "development")
    print("[launcher] Starting Flask backend …")
    subprocess.call([str(python), "app.py"], cwd=str(BACKEND), env=env)


def run_frontend():
    """Install dependencies (once) and start the React dev server."""
    # Locate npm executable first – gives friendlier error than FileNotFound
    npm_bin = shutil.which("npm")
    if npm_bin is None:
        print("[launcher] ERROR: npm is not installed or not found in PATH. Please install Node.js to run the frontend.")
        return

    # install node modules if first run
    # install node modules if first run
    if not (FRONTEND / "node_modules").exists():
        print("[launcher] Running npm install for frontend …")
        subprocess.check_call([npm_bin, "install"], cwd=str(FRONTEND))
    print("[launcher] Starting React dev server …")
    env = os.environ.copy()
    # Suppress CRA/Vite auto-launch to avoid double browser tabs
    env.setdefault("BROWSER", "none")
    subprocess.call([npm_bin, "start"], cwd=str(FRONTEND), env=env)


def main():
    if not BACKEND.exists() or not FRONTEND.exists():
        print("This launcher expects 'backend' and 'frontend' directories beside it.")
        sys.exit(1)

    ensure_venv()

    t_backend = threading.Thread(target=run_backend, daemon=True)
    t_frontend = threading.Thread(target=run_frontend, daemon=True)
    t_backend.start()
    t_frontend.start()

    print("[launcher] Waiting for servers to boot …")
    time.sleep(5)
    print("[launcher] Opening browser …")
    webbrowser.open("http://localhost:3000")

    # keep main thread alive
    if pystray:
        # prepare simple tray icon
        def on_exit(icon, item):
            print("[launcher] Exiting …")
            sys.exit(0)
        menu = pystray.Menu(pystray.MenuItem('Quit', on_exit))
        # use generic blank icon if custom not found
        icon_path = ROOT / 'icon.ico'
        if icon_path.exists():
            image = Image.open(icon_path)
        else:
            image = Image.new('RGB', (64, 64), color='blue')
        tray = pystray.Icon('AI Dashboard', image, 'AI Dashboard', menu)
        tray.run()

    t_backend.join()
    t_frontend.join()


if __name__ == "__main__":
    main()
