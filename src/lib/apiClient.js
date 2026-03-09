import axios from "axios";

const TOKEN_KEY = "bookhub_token";
const DEFAULT_API_BASE_URL = "http://127.0.0.1:8000";
const DEFAULT_TIMEOUT_MS = 8000;

const trimTrailingSlash = (value) => String(value || "").replace(/\/+$/, "");

export const API_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL,
);

const API_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: API_TIMEOUT_MS,
});

apiClient.interceptors.request.use((config) => {
  const token =
    window.localStorage.getItem(TOKEN_KEY) ||
    window.sessionStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApiClient = apiClient;
