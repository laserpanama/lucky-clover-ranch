const API_BASE = "/api";

export async function apiRequest(endpoint: string, options?: RequestInit): Promise<any> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    // Backend may return { message } or { error } — handle both
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || body.error || `Request failed (${response.status})`);
  }

  return response.json().catch(() => ({}));
}