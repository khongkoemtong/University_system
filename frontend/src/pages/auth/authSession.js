const STORAGE_KEY = "school-auth-session";

export function saveAuthSession(session) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function getAuthSession() {
  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearAuthSession() {
  window.localStorage.removeItem(STORAGE_KEY);
}

export function getAuthHomePath(roleName) {
  const normalizedRole = String(roleName || "").toLowerCase();

  if (normalizedRole === "admin") {
    return "/admin/dashboard";
  }

  if (normalizedRole === "student") {
    return "/user/dashboard";
  }

  return "/staff/dashboard";
}
