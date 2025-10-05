import axios from "axios";

const raw = process.env.NEXT_PUBLIC_API_URL;
const baseURL = (raw && raw.trim().length > 0 ? raw : "/hotel-api").replace(/\/$/, "");

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

export default api;
