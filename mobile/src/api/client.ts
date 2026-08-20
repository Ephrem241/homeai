// The backend is a separate service (CLAUDE.md §1) reachable over the LAN
// while developing on a device/simulator — "localhost" only works when the
// app itself runs on the same machine as the API (e.g. web preview). Override
// with EXPO_PUBLIC_API_URL for device testing, e.g. http://192.168.1.20:3000.
const DEFAULT_API_URL = 'http://localhost:3000';

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_API_URL;

// Set by AuthProvider on login/logout/hydrate — read here rather than
// threading a token through every hook/api call. A plain module-level
// variable (not a callback import) keeps this file free of any dependency
// on the auth module, avoiding a circular import.
let authToken: string | null = null;
export function setAuthToken(token: string | null) {
  authToken = token;
}

// AuthProvider registers this to react to a token the server has rejected
// (expired/invalid) — clears the stored session so the app drops back to
// the login flow instead of silently failing every request.
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

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
  // FormData (file uploads) must NOT get an explicit Content-Type — fetch
  // sets one itself with the correct multipart boundary. Setting it manually
  // breaks the boundary and the server can't parse the body.
  const isFormData = typeof FormData !== 'undefined' && init?.body instanceof FormData;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...init?.headers,
      },
    });
  } catch (error) {
    console.error(`[api] network error for ${path}:`, error);
    throw new ApiError();
  }

  if (!response.ok) {
    console.error(`[api] ${response.status} for ${path}`);
    if (response.status === 401) {
      onUnauthorized?.();
    }
    // 4xx bodies are our own NestJS validation/business-rule messages (e.g.
    // "Complete the listing before publishing") — safe to show directly,
    // unlike 5xx internals which stay behind the generic fallback.
    if (response.status >= 400 && response.status < 500) {
      const message = await response
        .json()
        .then((body: { message?: unknown }) => {
          if (typeof body?.message === 'string') return body.message;
          if (Array.isArray(body?.message)) return body.message.join(' ');
          return null;
        })
        .catch(() => null);
      if (message) {
        throw new ApiError(message);
      }
    }
    throw new ApiError();
  }

  // A successful delete (or any 2xx with no body) has nothing to parse —
  // response.json() throws on an empty string, so check first.
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
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
