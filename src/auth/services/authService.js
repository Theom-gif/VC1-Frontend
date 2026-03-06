import { authApiClient } from "./apiClient";

export function loginRequest(payload) {
  return authApiClient.post("/api/auth/login", payload);
}

export function registerRequest(payload) {
  return authApiClient.post("/api/auth/register", payload);
}
