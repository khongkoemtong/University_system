const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");

async function authRequest(path, options = {}) {
  const { method = "POST", body } = options;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message || `Request failed with status ${response.status}`);
  }

  return payload.data;
}

export function loginAccount(payload) {
  return authRequest("/auth/login", {
    method: "POST",
    body: payload,
  });
}

export function registerAccount(payload) {
  return authRequest("/auth/register", {
    method: "POST",
    body: payload,
  });
}

export function registerStudentAccount(payload) {
  return authRequest("/students", {
    method: "POST",
    body: payload,
  });
}

export function fetchAccessRequests() {
  return authRequest("/auth/requests", {
    method: "GET",
  });
}

export function reviewAccessRequest(payload) {
  return authRequest("/auth/review", {
    method: "PUT",
    body: payload,
  });
}

export async function fetchStaffPositions() {
  const staff = await authRequest("/staff", {
    method: "GET",
  });

  if (!Array.isArray(staff)) {
    return [];
  }

  return Array.from(
    new Set(
      staff
        .map((member) => String(member.position || "").trim())
        .filter(Boolean),
    ),
  ).sort((left, right) => left.localeCompare(right));
}
