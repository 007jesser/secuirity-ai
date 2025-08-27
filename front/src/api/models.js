// src/api/models.js
// Helper functions to fetch data coming from the 12 AI-models that will be exposed by your local server later.
// ------------------------------------------------------------------
// Usage example (in Dashboard.jsx)
//   import { fetchDashboardData } from "../api/models";
//   const data = await fetchDashboardData();
//
// By default it expects the backend to be reachable at the IP stored in the
// environment variable REACT_APP_API_BASE_URL (e.g. http://127.0.0.1:5000).
// If this variable is not defined it will fall back to localhost:5000.

export const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:5000";

// Fetch the list of available model keys from the backend
export async function fetchModelKeys() {
  const list = await safeFetch(`${BASE_URL}/models`);
  return Array.isArray(list) ? list : [];
}

// Given a model key, fetch its status or prediction (GET for status, POST for inference)
export async function fetchModelInfo(key, payload = null) {
  const options = payload ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) } : {};
  return safeFetch(`${BASE_URL}/model/${key}`, options);
}

// Legacy hard-coded fallback, if needed
const legacyModelRoutes = [
  "/model1", // e.g. classification model
  "/model2", // e.g. anomaly detection model
  "/model3",
  "/model4",
  "/model5",
  "/model6",
  "/model7",
  "/model8",
  "/model9",
  "/model10",
  "/model11",
  "/model12",
];

// Generic fetch helper with simple error handling
async function safeFetch(url, options = {}) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      if (response.status === 404) {
        // Silently ignore missing endpoints – backend may not expose every model yet
        return null;
      }
      throw new Error(response.statusText);
    }
    return await response.json();
  } catch (err) {
    console.error("API error", url, err);
    return null; // Let the caller decide how to handle nulls
  }
}

// Fetches the raw output of each model in parallel and returns an array
export async function fetchAllModels() {
  const keys = await fetchModelKeys();
  if (keys.length === 0) {
    // fall back to legacy list if /models not available yet
    const promises = legacyModelRoutes.map((route) => safeFetch(`${BASE_URL}${route}`));
    return Promise.all(promises);
  }
  const promises = keys.map((key) => fetchModelInfo(key));
  return Promise.all(promises);
}

// Example aggregator – combine the 12 model results into a single
// dashboard-friendly shape { alerts, stats } like the mock data before.
// Replace this with your real aggregation logic when the server is ready.
export async function fetchDashboardData() {
  // Prefer the dedicated backend aggregation route if available
  const data = await safeFetch(`${BASE_URL}/dashboard`);
  if (data && data.alerts && data.stats) {
    return data;
  }
  // Fallback: aggregate results client-side
  const results = await fetchAllModels();
  const alerts = (results[0]?.alerts ?? []).slice(0, 50);
  const stats = {
    todayAttempts: results[1]?.todayAttempts ?? 0,
    topAttack: results[2]?.topAttack ?? 'N/A',
    successRate: results[3]?.successRate ?? 0,
    dailyTrends: results[4]?.dailyTrends ?? [],
  };
  return { alerts, stats };
}
