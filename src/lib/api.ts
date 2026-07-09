const API_BASE = import.meta.env.DEV ? "http://localhost:8000" : "";

export async function apiFetch(path: string, options?: RequestInit) {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });
  
  if (!response.ok) {
    let errorMessage = `API error: ${response.statusText}`;
    try {
      const errData = await response.json();
      if (errData && errData.detail) {
        errorMessage = errData.detail;
      }
    } catch (e) {
      // Ignore JSON parse error if body is not JSON
    }
    throw new Error(errorMessage);
  }
  
  return response.json();
}

export function getApiUrl(path: string): string {
  return `${API_BASE}${path}`;
}
