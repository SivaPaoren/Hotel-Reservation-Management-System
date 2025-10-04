// frontend/src/api/client.ts
import axios from "axios";

// In prod, leave empty so requests go to same origin (Nginx will proxy /api).
// In dev, you can override with NEXT_PUBLIC_API_URL=http://localhost:3002
const baseURL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

export const api = axios.create({
  baseURL, // "" means Axios will use relative URLs like "/api/rooms"
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

export default api;
