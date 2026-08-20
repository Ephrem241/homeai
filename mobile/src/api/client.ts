// The backend is a separate service (CLAUDE.md §1) reachable over the LAN
// while developing on a device/simulator — "localhost" only works when the
// app itself runs on the same machine as the API (e.g. web preview). Override
// with EXPO_PUBLIC_API_URL for device testing, e.g. http://192.168.1.20:3000.
const DEFAULT_API_URL = 'http://localhost:3000';

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_API_URL;

// Never surfaces raw fetch/HTTP errors to the UI (CLAUDE.md §4 guardrail) —
// callers catch this and show a plain-language fallback instead.
export class ApiError extends Error {
  constructor(message = 'Something went wrong. Please try again.') {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    });
  } catch (error) {
    console.error(`[api] network error for ${path}:`, error);
    throw new ApiError();
  }

  if (!response.ok) {
    console.error(`[api] ${response.status} for ${path}`);
    throw new ApiError();
  }

  return response.json() as Promise<T>;
}

export function buildQueryString(params: Record<string, string | number | boolean | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}
