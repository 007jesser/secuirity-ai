// src/api/attacks.js
// Simple helper wrappers around the new /attacks (GET) endpoint that serves a JSON-lines log
// and a convenience POST wrapper in case you want to log client-side events as well.

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:5000";

/**
 * Retrieve the latest N attack records from the backend.
 * @param {number} limit Number of latest records to pull (default 100).
 * @returns {Promise<Array>} array of attack objects
 */
export async function fetchAttackHistory(limit = 100) {
  try {
    const res = await fetch(`${BASE_URL}/attacks?limit=${limit}`);
    if (!res.ok) throw new Error(res.statusText);
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch attack history", err);
    return [];
  }
}

/**
 * Optional client-side logger in case the dashboard itself wants to write entries.
 * The backend already writes model-generated attacks automatically; use this only
 * for UI-initiated events.
 */
export async function logAttack(payload) {
  try {
    await fetch(`${BASE_URL}/attacks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("Failed to write attack log", err);
  }
}
