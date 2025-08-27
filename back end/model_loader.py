"""Automatic model discovery and loading utilities.

Scans the project tree for model files (extensions: .joblib, .pkl, .h5, .pt, .bin)
and loads them into a single dictionary that Flask can use for inference.

Add/adjust extensions and loader functions as needed.
"""

from pathlib import Path
from typing import Dict, Any
import importlib
import logging

logger = logging.getLogger(__name__)

# ----------------------------------------------------------------------------
# Loader helpers per extension
# ----------------------------------------------------------------------------

def _load_joblib(path: Path):
    joblib = importlib.import_module("joblib")
    return joblib.load(path)

def _load_pickle(path: Path):
    import pickle
    with open(path, "rb") as f:
        return pickle.load(f)

def _load_keras_h5(path: Path):
    tf = importlib.import_module("tensorflow")
    return tf.keras.models.load_model(path, compile=False)

def _load_torch(path: Path):
    torch = importlib.import_module("torch")
    return torch.load(path, map_location="cpu")

LOADERS = {
    ".joblib": _load_joblib,
    ".pkl": _load_joblib,  # assume sklearn joblib dumps
    ".h5": _load_keras_h5,
    ".pt": _load_torch,
    ".bin": _load_torch,   # for HF / PyTorch .bin
}

# ----------------------------------------------------------------------------
# Discovery + loading
# ----------------------------------------------------------------------------

def discover_model_files(root: Path):
    exts = LOADERS.keys()
    files = [p for p in root.rglob("*") if p.suffix in exts]
    return files


def load_models(root: Path) -> Dict[str, Any]:
    models = {}
    for path in discover_model_files(root):
        try:
            loader = LOADERS[path.suffix]
            model = loader(path)
            key = path.stem  # filename without extension
            if key in models:
                logger.warning("Duplicate model key %s (from %s) – skipping", key, path)
                continue
            models[key] = model
            logger.info("Loaded model %s from %s", key, path)
        except Exception as exc:
            logger.exception("Failed to load model %s: %s", path, exc)
    return models
