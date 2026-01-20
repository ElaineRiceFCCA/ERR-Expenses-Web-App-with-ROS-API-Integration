// frontend/src/lib/auth.ts
// Handles login, logout, and JWT persistence for the ERR Expenses Web App frontend

export interface LoginResponse {
  token: string;
  role: "admin" | "processor";
}

export async function login(
  email: string,
  password: string
): Promise<LoginResponse | null> {
  try {
    // Backend API endpoint
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) return null;

    const data = await res.json();

    // Persist credentials
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);

    return {
      token: data.token,
      role: data.role,
    };
  } catch (err) {
    console.error("Login error:", err);
    return null;
  }
}

// Added logout helper
export function logout(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
}
