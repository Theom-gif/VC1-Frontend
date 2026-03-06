import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DEMO_AUTH_USERS } from "../admin/data/mockData";
import { loginRequest, registerRequest } from "./services/authService";
import { API_BASE_URL } from "../lib/apiClient";
import { getRoleName } from "./roleUtils";

const SESSION_KEY = "bookhub_session";
const TOKEN_KEY = "bookhub_token";

const AuthContext = createContext(null);

function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function saveToken(token) {
  if (!token) {
    return;
  }
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function toErrorMessage(error, fallbackMessage) {
  if (error?.code === "ECONNABORTED") {
    return "Login request timed out. Please check backend/API speed and try again.";
  }
  if (!error?.response) {
    return `Cannot reach backend at ${API_BASE_URL}. Check VITE_API_BASE_URL and backend status.`;
  }
  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message;
  const validationErrors = error?.response?.data?.errors;
  if (validationErrors && typeof validationErrors === "object") {
    const firstField = Object.keys(validationErrors)[0];
    const firstMessage = Array.isArray(validationErrors[firstField])
      ? validationErrors[firstField][0]
      : validationErrors[firstField];
    if (firstMessage) {
      return String(firstMessage);
    }
  }
  return message || fallbackMessage;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getSession());
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login: async ({ email, password }) => {
        try {
          const response = await loginRequest({
            email: String(email || "").trim().toLowerCase(),
            password,
          });
          const data = response?.data || {};
          const backendUser = data.user || data.data?.user || data;
          const backendRole =
            backendUser?.role_id ??
            backendUser?.roleId ??
            backendUser?.role ??
            data?.role_id ??
            data?.roleId ??
            data?.role;

          const sessionUser = {
            id: backendUser?.id || backendUser?._id || backendUser?.userId || `u_${Date.now()}`,
            name: backendUser?.name || backendUser?.fullName || backendUser?.username || "User",
            email: backendUser?.email || String(email || "").trim().toLowerCase(),
            role: getRoleName(backendRole),
          };

          const token =
            data.token ||
            data.accessToken ||
            data.access_token ||
            data.data?.token ||
            data.data?.accessToken ||
            data.data?.access_token;

          if (!token) {
            return { ok: false, error: "Login succeeded but no access token was returned by /api/auth/login." };
          }
          saveSession(sessionUser);
          saveToken(token);
          setUser(sessionUser);
          return { ok: true, user: sessionUser };
        } catch (error) {
          return { ok: false, error: toErrorMessage(error, "Login failed. Please try again.") };
        }
      },
      loginDemo: (role) => {
        const demoUser = DEMO_AUTH_USERS.find(
          (candidate) => getRoleName(candidate.role) === getRoleName(role),
        );
        if (!demoUser) {
          return { ok: false, error: "Demo user is unavailable." };
        }

        const sessionUser = {
          id: demoUser.id,
          name: demoUser.name,
          email: demoUser.email,
          role: getRoleName(demoUser.role),
        };
        saveSession(sessionUser);
        setUser(sessionUser);
        return { ok: true, user: sessionUser };
      },
      register: async ({
        firstname,
        lastname,
        email,
        password,
        password_confirmation,
        role_id,
      }) => {
        try {
          await registerRequest({
            firstname,
            lastname,
            email: String(email || "").trim().toLowerCase(),
            password,
            password_confirmation,
            role_id,
          });
          return { ok: true };
        } catch (error) {
          return { ok: false, error: toErrorMessage(error, "Registration failed. Please try again.") };
        }
      },
      logout: () => {
        clearSession();
        clearToken();
        setUser(null);
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
