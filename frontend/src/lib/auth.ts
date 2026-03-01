// ----------------------------------------------------
// Frontend authentication helper
// Handles login, logout, and JWT persistence
// ----------------------------------------------------
export interface LoginResponse {
  token: string;
  role: "admin" | "processor";
}

// Performs login against backend API
// On success, persists JWT + role in localStorage
export async function login(
  email: string,
  password: string,
): Promise<LoginResponse | null> {
  try {
    // Backend authentication endpoint
    const res = await fetch("http://localhost:5500/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) return null;

    const data = await res.json();

    // Persist session data for subsequent API calls
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);
    localStorage.setItem("user", data.name);

    return {
      token: data.token,
      role: data.role,
    };
  } catch (err) {
    console.error("Login error:", err);
    return null;
  }
}

// Clears persisted authentication data
// Used during logout flow
export function logout(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
}
