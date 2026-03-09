import axios from "axios";
import { API_BASE_URL, authApiClient } from "./apiClient";

const trimTrailingSlash = (value) => String(value || "").replace(/\/+$/, "");

function getBaseCandidates() {
  const candidates = [];

  // Always try relative path first so dev proxy/reverse proxy can handle /api.
  candidates.push("");

  if (typeof window !== "undefined") {
    const origin = trimTrailingSlash(window.location.origin);
    if (origin) {
      candidates.push(origin);
    }

    const host = String(window.location.hostname || "").trim().toLowerCase();
    if (host === "127.0.0.1" || host === "localhost") {
      candidates.push(`http://${host}:8000`);
    }
  }

  candidates.push(trimTrailingSlash(authApiClient?.defaults?.baseURL || API_BASE_URL));
  candidates.push("http://127.0.0.1:8000");
  candidates.push("http://localhost:8000");

  return Array.from(new Set(candidates.filter(Boolean)));
}

function toKeyValueEntries(payload) {
  return Object.entries(payload || {}).filter(
    ([, value]) => value !== undefined && value !== null,
  );
}

async function postWithFallback(path, body, headers) {
  const timeout = Number(authApiClient?.defaults?.timeout) || 8000;
  const baseCandidates = getBaseCandidates();
  let lastNetworkError = null;

  for (const base of baseCandidates) {
    const url = base ? `${base}${path}` : path;
    try {
      return await axios.post(url, body, {
        timeout,
        headers: {
          Accept: "application/json",
          ...(headers || {}),
        },
      });
    } catch (error) {
      const hasResponse = Boolean(error?.response);
      const status = Number(error?.response?.status || 0);
      const isSameOriginCandidate =
        base === "" ||
        (typeof window !== "undefined" && trimTrailingSlash(base) === trimTrailingSlash(window.location.origin));

      // If /api is not routed on current origin, or dev proxy fails (e.g. ECONNREFUSED),
      // continue trying direct backend candidates.
      const isRetriableSameOriginStatus =
        status === 404 || (status >= 500 && status < 600);
      if (hasResponse && isSameOriginCandidate && isRetriableSameOriginStatus) {
        continue;
      }

      // If backend replied, do not hide that real API/validation/auth error.
      if (hasResponse) {
        throw error;
      }

      // Network-level failure, keep trying next host.
      lastNetworkError = error;
    }
  }

  if (lastNetworkError) {
    const checked = baseCandidates.map((base) => (base ? `${base}${path}` : path)).join(", ");
    throw new Error(`Failed to fetch auth API. Checked endpoints: ${checked}`);
  }

  throw new Error("Failed to fetch auth API.");
}

function postAuth(path, payload, mode = "json") {
  if (mode === "urlencoded") {
    const params = new URLSearchParams();
    toKeyValueEntries(payload).forEach(([key, value]) => {
      params.append(key, String(value));
    });
    return postWithFallback(path, params, {
      "Content-Type": "application/x-www-form-urlencoded",
    });
  }

  if (mode === "multipart") {
    const formData = new FormData();
    toKeyValueEntries(payload).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
    return postWithFallback(path, formData, undefined);
  }

  return postWithFallback(path, payload, {
    "Content-Type": "application/json",
  });
}

export function loginRequest(payload, options = {}) {
  return postAuth("/api/auth/login", payload, options.mode || "json");
}

export function registerRequest(payload, options = {}) {
  return postAuth("/api/auth/register", payload, options.mode || "json");
}
