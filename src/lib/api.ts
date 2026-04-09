const API_BASE = import.meta.env.VITE_API_URL || "/api";

export async function apiRequest<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: "Request failed",
    }));

    throw new Error(
      error.message || error.error || `HTTP ${response.status}`
    );
  }

  return response.json().catch(() => ({}));
}