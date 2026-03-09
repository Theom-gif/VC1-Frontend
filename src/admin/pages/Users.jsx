import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Save, Search, Trash2, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { API_BASE_URL } from "../../lib/apiClient";
import { useLanguage } from "../../i18n/LanguageContext";

const TOKEN_KEY = "bookhub_token";
const trimTrailingSlash = (value) => String(value || "").replace(/\/+$/, "");

const getApiBaseCandidates = () => {
  const candidates = [""];

  if (typeof window !== "undefined") {
    const origin = trimTrailingSlash(window.location.origin);
    if (origin) {
      candidates.push(origin);
    }

    const hostname = String(window.location.hostname || "").trim().toLowerCase();
    if (hostname) {
      const protocol = window.location.protocol === "https:" ? "https" : "http";
      candidates.push(`${protocol}://${hostname}:8000`);
    }
  }

  candidates.push(trimTrailingSlash(API_BASE_URL));
  candidates.push("http://127.0.0.1:8000");
  candidates.push("http://localhost:8000");
  candidates.push("https://127.0.0.1:8000");
  candidates.push("https://localhost:8000");

  return Array.from(new Set(candidates.filter(Boolean)));
};

const normalizeRole = (role) => {
  const value = String(role ?? "").trim().toLowerCase();
  if (value === "1") return "Admin";
  if (value === "2") return "Author";
  if (value === "3") return "User";
  if (value === "admin") return "Admin";
  if (value === "author") return "Author";
  return "User";
};

const getRoleIdByWord = (role) => {
  if (role === "Admin") return 1;
  if (role === "Author") return 2;
  return 3;
};

const normalizeUser = (user) => ({
  id: user?.id ?? "",
  role: normalizeRole(user?.role ?? user?.role_name),
  first_name: user?.first_name ?? user?.firstname ?? "",
  last_name: user?.last_name ?? user?.lastname ?? "",
  email: user?.email ?? "",
  created_at: user?.created_at ?? user?.createdAt ?? "",
});

const toApiError = async (response, fallbackMessage) => {
  let json = null;
  try {
    json = await response.json();
  } catch {
    json = null;
  }
  const validationErrors = json?.errors;
  if (validationErrors && typeof validationErrors === "object") {
    const details = Object.values(validationErrors)
      .flatMap((value) => (Array.isArray(value) ? value : [value]))
      .filter(Boolean)
      .map((value) => String(value))
      .join(" ");
    if (details) {
      return details;
    }
  }
  return json?.message || fallbackMessage;
};

const Users = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [activeApiBase, setActiveApiBase] = useState("");
  const apiBaseCandidates = useMemo(() => getApiBaseCandidates(), []);
  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: "User",
  });

  const requestWithFallback = useCallback(
    async ({ path, method = "GET", body, signal, fallbackMessage }) => {
      const token =
        window.localStorage.getItem(TOKEN_KEY) ||
        window.sessionStorage.getItem(TOKEN_KEY);
      if (!token) {
        throw new Error(t("Missing login token. Please login again."));
      }

      const orderedBases = [
        activeApiBase,
        ...apiBaseCandidates.filter((baseUrl) => baseUrl !== activeApiBase),
      ];
      const checkedEndpoints = orderedBases.map((baseUrl) =>
        baseUrl ? `${baseUrl}${path}` : path,
      );

      let lastNetworkError = null;
      let lastApiError = null;
      for (const baseUrl of orderedBases) {
        try {
          const response = await fetch(`${baseUrl}${path}`, {
            method,
            headers: {
              Accept: "application/json",
              ...(body ? { "Content-Type": "application/json" } : {}),
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            ...(body ? { body: JSON.stringify(body) } : {}),
            signal,
          });

          if (!response.ok) {
            const errorText = await toApiError(response, fallbackMessage);
            const statusError = new Error(`${errorText} (HTTP ${response.status})`);

            // If dev proxy is not active, same-origin /api can return 404.
            // Continue with absolute URLs instead of failing immediately.
            const isSameOriginCandidate =
              baseUrl === "" ||
              (typeof window !== "undefined" &&
                trimTrailingSlash(baseUrl) === trimTrailingSlash(window.location.origin));

            if (isSameOriginCandidate && response.status === 404) {
              lastApiError = statusError;
              continue;
            }

            // Some hosts can return 5xx while another candidate works.
            if (response.status >= 500) {
              lastApiError = statusError;
              continue;
            }

            throw statusError;
          }

          setActiveApiBase(baseUrl);
          return response;
        } catch (requestError) {
          if (requestError?.name === "AbortError") {
            throw requestError;
          }

          // For HTTP/API errors, do not continue trying random hosts.
          // Only retry on real network failures like "Failed to fetch".
          const messageText = String(requestError?.message || "");
          const lowerText = messageText.toLowerCase();
          const isNetworkLike =
            lowerText.includes("failed to fetch") ||
            lowerText.includes("network") ||
            lowerText.includes("load failed");

          if (!isNetworkLike) {
            throw requestError;
          }

          lastNetworkError = requestError;
        }
      }

      throw (
        lastApiError ||
        (lastNetworkError
          ? new Error(
            `Cannot connect to backend. Checked endpoints: ${checkedEndpoints.join(", ")}`,
          )
          : null) ||
        new Error("Cannot connect to backend. Start Laravel server on port 8000.")
      );
    },
    [activeApiBase, apiBaseCandidates, t],
  );

  const fetchUsers = useCallback(async (signal) => {
    setIsLoading(true);
    setError("");

    try {
      const roleValue = roleFilter === "All" ? "" : roleFilter;
      const searchPath = `/api/admin/users?search=${encodeURIComponent(searchQuery)}&role=${encodeURIComponent(roleValue)}`;
      const response = await requestWithFallback({
        path: searchPath,
        method: "GET",
        signal,
        fallbackMessage: t("Failed to load users."),
      });

      const json = await response.json();
      const rows = Array.isArray(json?.data) ? json.data : [];
      setUsers(rows.map(normalizeUser));
    } catch (fetchError) {
      if (fetchError?.name === "AbortError") {
        return;
      }
      setUsers([]);
      setError(fetchError?.message || t("Failed to load users."));
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, [requestWithFallback, roleFilter, searchQuery, t]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetchUsers(controller.signal);
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [fetchUsers]);

  const startEdit = (user) => {
    setEditingId(user.id);
    setEditForm({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: normalizeRole(user.role),
    });
    setActionError("");
    setActionSuccess("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setActionError("");
  };

  const handleSave = async (id) => {
    const firstName = editForm.first_name.trim();
    const lastName = editForm.last_name.trim();
    const email = editForm.email.trim().toLowerCase();
    const role = normalizeRole(editForm.role);

    if (!firstName || !lastName || !email) {
      setActionError(t("First name, last name, and email are required."));
      return;
    }

    const token =
      window.localStorage.getItem(TOKEN_KEY) ||
      window.sessionStorage.getItem(TOKEN_KEY);
    if (!token) {
      setActionError(t("Missing login token. Please login again."));
      return;
    }

    const payload = {
      first_name: firstName,
      last_name: lastName,
      firstname: firstName,
      lastname: lastName,
      email,
      role,
      role_id: getRoleIdByWord(role),
    };

    setActionLoadingId(id);
    setActionError("");
    setActionSuccess("");
    try {
      let updated = false;
      let lastErrorMessage = t("Failed to update user.");

      for (const method of ["PUT", "PATCH"]) {
        try {
          await requestWithFallback({
            path: `/api/admin/users/${id}`,
            method,
            body: payload,
            fallbackMessage: t("Failed to update user."),
          });
          updated = true;
          break;
        } catch (attemptError) {
          const text = String(attemptError?.message || t("Failed to update user."));
          lastErrorMessage = text;
          const isMethodMismatch =
            text.includes("HTTP 405") ||
            text.toLowerCase().includes("method not allowed") ||
            text.toLowerCase().includes("not supported");
          if (!isMethodMismatch) {
            throw attemptError;
          }
        }
      }

      if (!updated) {
        throw new Error(lastErrorMessage);
      }

      setEditingId(null);
      setActionSuccess(t("User updated successfully."));
      await fetchUsers();
    } catch (saveError) {
      setActionError(saveError?.message || t("Failed to update user."));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (user) => {
    const confirmed = window.confirm(t("Delete user \"{name}\"?", { name: `${user.first_name} ${user.last_name}` }));
    if (!confirmed) return;

    const token =
      window.localStorage.getItem(TOKEN_KEY) ||
      window.sessionStorage.getItem(TOKEN_KEY);
    if (!token) {
      setActionError(t("Missing login token. Please login again."));
      return;
    }

    setActionLoadingId(user.id);
    setActionError("");
    setActionSuccess("");
    try {
      await requestWithFallback({
        path: `/api/admin/users/${user.id}`,
        method: "DELETE",
        fallbackMessage: t("Failed to delete user."),
      });

      if (editingId === user.id) {
        setEditingId(null);
      }

      setActionSuccess(t("User deleted successfully."));
      await fetchUsers();
    } catch (deleteError) {
      setActionError(deleteError?.message || t("Failed to delete user."));
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t("Search users...")}
              className="bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-purple-500 w-64"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            className="bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none"
          >
            <option value="All">{t("All Roles")}</option>
            <option value="User">{t("User")}</option>
            <option value="Admin">{t("Admin")}</option>
            <option value="Author">{t("Author")}</option>
          </select>
        </div>
      </div>
      <table className="w-full text-left">
        <thead>
          <tr className="bg-white/2 text-slate-500 text-xs font-bold uppercase tracking-wider">
            <th className="px-6 py-4">{t("ID")}</th>
            <th className="px-6 py-4">{t("Role")}</th>
            <th className="px-6 py-4">{t("First Name")}</th>
            <th className="px-6 py-4">{t("Last Name")}</th>
            <th className="px-6 py-4">{t("Email")}</th>
            <th className="px-6 py-4">{t("Created At")}</th>
            <th className="px-6 py-4 text-right">{t("Actions")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {(actionError || actionSuccess) && (
            <tr>
              <td colSpan={7} className={cn("px-6 py-3 text-sm", actionError ? "text-red-400" : "text-emerald-400")}>
                {actionError || actionSuccess}
              </td>
            </tr>
          )}

          {isLoading && (
            <tr>
              <td colSpan={7} className="px-6 py-8 text-center text-sm text-slate-400">
                {t("Loading users...")}
              </td>
            </tr>
          )}

          {!isLoading && error && (
            <tr>
              <td colSpan={7} className="px-6 py-8 text-center text-sm text-red-400">
                {error}
              </td>
            </tr>
          )}

          {!isLoading && !error && users.map((user) => (
            <tr key={user.id} className="hover:bg-white/2 transition-colors">
              <td className="px-6 py-4 text-sm font-medium">{user.id}</td>
              <td className="px-6 py-4">
                {editingId === user.id ? (
                  <select
                    value={editForm.role}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, role: event.target.value }))}
                    className="bg-gray-800 border border-white/10 rounded-lg px-2 py-1 text-sm focus:outline-none"
                  >
                    <option value="User">{t("User")}</option>
                    <option value="Author">{t("Author")}</option>
                    <option value="Admin">{t("Admin")}</option>
                  </select>
                ) : (
                  <span
                    className={cn(
                      "text-xs font-bold px-2 py-1 rounded-lg",
                      user.role === "Admin"
                        ? "text-purple-400 bg-purple-400/10"
                        : user.role === "Author"
                          ? "text-pink-400 bg-pink-400/10"
                          : "text-blue-400 bg-blue-400/10",
                    )}
                  >
                    {t(user.role)}
                  </span>
                )}
              </td>
              <td className="px-6 py-4 text-slate-300 text-sm">
                {editingId === user.id ? (
                  <input
                    type="text"
                    value={editForm.first_name}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, first_name: event.target.value }))}
                    className="w-full min-w-24 bg-white/5 border border-white/10 rounded-md px-2 py-1 text-sm focus:outline-none"
                  />
                ) : (
                  user.first_name
                )}
              </td>
              <td className="px-6 py-4 text-slate-300 text-sm">
                {editingId === user.id ? (
                  <input
                    type="text"
                    value={editForm.last_name}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, last_name: event.target.value }))}
                    className="w-full min-w-24 bg-white/5 border border-white/10 rounded-md px-2 py-1 text-sm focus:outline-none"
                  />
                ) : (
                  user.last_name
                )}
              </td>
              <td className="px-6 py-4 text-slate-300 text-sm">
                {editingId === user.id ? (
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, email: event.target.value }))}
                    className="w-full min-w-40 bg-white/5 border border-white/10 rounded-md px-2 py-1 text-sm focus:outline-none"
                  />
                ) : (
                  user.email
                )}
              </td>
              <td className="px-6 py-4 text-slate-300 text-sm">{user.created_at}</td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2">
                  {editingId === user.id ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleSave(user.id)}
                        disabled={actionLoadingId === user.id}
                        className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-50"
                      >
                        <Save size={14} />
                        {t("Save")}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        disabled={actionLoadingId === user.id}
                        className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/10 disabled:opacity-50"
                      >
                        <X size={14} />
                        {t("Cancel")}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startEdit(user)}
                      disabled={actionLoadingId === user.id}
                      className="inline-flex items-center gap-1 rounded-lg border border-blue-500/40 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-300 transition hover:bg-blue-500/20 disabled:opacity-50"
                    >
                      <Pencil size={14} />
                      {t("Edit")}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(user)}
                    disabled={actionLoadingId === user.id}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                    {t("Delete")}
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {!isLoading && !error && users.length === 0 && (
            <tr>
              <td colSpan={7} className="px-6 py-8 text-center text-sm text-slate-400">
                {t("No users found.")}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Users;
