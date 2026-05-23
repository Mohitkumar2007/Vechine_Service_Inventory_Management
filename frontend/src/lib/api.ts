const API_BASE_URL =
  ((import.meta as any).env?.VITE_API_URL as string | undefined) ||
  ((import.meta as any).env?.PROD ? '/_/backend/api' : '/api');

interface ApiOptions extends RequestInit {
  role?: string;
}

export async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (options.role) headers.set('X-Role', options.role);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail || 'API request failed');
  }

  return response.json();
}
