export function normalizeRoleValue(role) {
  return String(role ?? "").trim().toLowerCase();
}

export function getRoleName(role) {
  const normalized = normalizeRoleValue(role);

  if (normalized === "1" || normalized === "admin" || normalized === "administrator") {
    return "Admin";
  }

  if (normalized === "2" || normalized === "author") {
    return "Author";
  }

  if (
    normalized === "3" ||
    normalized === "user" ||
    normalized === "reader" ||
    normalized === "member"
  ) {
    return "User";
  }

  return "User";
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
