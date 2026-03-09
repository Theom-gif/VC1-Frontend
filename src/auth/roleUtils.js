export function normalizeRoleValue(role) {
  return String(role ?? "").trim().toLowerCase();
}

const trimTrailingSlash = (value) => String(value || "").replace(/\/+$/, "");

export const USER_PORTAL_URL =
  "http://localhost:3001/";

export function getInternalUserPortalPath() {
  const rawTarget = String(USER_PORTAL_URL || "").trim();
  if (!rawTarget) {
    return "/user/dashboard";
  }

  if (typeof window === "undefined") {
    return rawTarget.startsWith("/") ? rawTarget : "/user/dashboard";
  }

  try {
    const parsedTarget = new URL(rawTarget, window.location.origin);
    if (trimTrailingSlash(parsedTarget.origin) !== trimTrailingSlash(window.location.origin)) {
      return null;
    }
    const path = `${parsedTarget.pathname}${parsedTarget.search}${parsedTarget.hash}`;
    return path || "/user/dashboard";
  } catch {
    return rawTarget.startsWith("/") ? rawTarget : "/user/dashboard";
  }
}

export function isExternalUserPortal() {
  return getInternalUserPortalPath() === null;
}

export function getRoleName(role) {
  const normalized = normalizeRoleValue(role);
  const compact = normalized.replace(/[\s-]+/g, "_");

  if (
    compact === "1" ||
    compact === "admin" ||
    compact === "administrator" ||
    compact === "role_admin" ||
    compact.includes("admin")
  ) {
    return "Admin";
  }

  if (
    compact === "2" ||
    compact === "author" ||
    compact === "writer" ||
    compact === "role_author" ||
    compact.includes("author") ||
    compact.includes("writer")
  ) {
    return "Author";
  }

  if (
    compact === "3" ||
    compact === "user" ||
    compact === "reader" ||
    compact === "member" ||
    compact.includes("user") ||
    compact.includes("reader") ||
    compact.includes("member")
  ) {
    return "User";
  }

  return "User";
}

export function isUserRole(role) {
  return getRoleName(role) === "User";
}

export function getHomePathByRole(role) {
  const roleName = getRoleName(role);

  if (roleName === "Admin") {
    return "/admin/dashboard";
  }

  if (roleName === "Author") {
    return "/author";
  }

  return "/user/dashboard";
}
