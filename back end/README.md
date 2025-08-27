# AI Dashboard Backend (Flask)

This lightweight Flask service exposes 12 placeholder endpoints – one per AI model – and an aggregated `/dashboard` route consumed by the React front-end.

## Project structure
```
back end/
├── app.py              # main Flask application
├── requirements.txt    # Python dependencies
└── README.md           # this guide
```

## Setup & run
```bash
# 1. Create/activate a virtual environment (recommended)
python -m venv venv
venv\Scripts\activate  # Windows

# 2. Install dependencies
pip install -r requirements.txt

# 3. Start the development server (auto-reload enabled)
python app.py
# → Service listens on http://127.0.0.1:5000
```

## Next steps
1. **Load your real AI models** – replace the `run_inference_*` stubs in `app.py` with actual model loading / prediction.
2. **Update routes** – adapt or rename `/model1` .. `/model12` as needed.
3. **Security & performance** – switch off `debug=True` in production, add proper error handling, authentication, etc.
