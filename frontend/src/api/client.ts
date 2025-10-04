// frontend/src/api/client.ts
import axios from "axios";

// Read from env; default to local backend if not set.
const baseURL =
  (process?.env?.NEXT_PUBLIC_API_URL || "http://localhost:3002").replace(/\/$/, "");

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

// Optional quick health probe you can call in dev UIs if needed:
// export const healthCheck = () => api.get("/health").then(r => r.data);
