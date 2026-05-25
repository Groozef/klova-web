const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';

export interface ApiError extends Error {
  status: number;
  payload?: unknown;
}

class ApiErrorImpl extends Error implements ApiError {
  constructor(public status: number, message: string, public payload?: unknown) {
    super(message);
    this.name = 'ApiError';
  }
}

type TokenGetter = () => string | null;
type RefreshHandler = () => Promise<string | null>;

let getAccessToken: TokenGetter = () => null;
let refreshAccessToken: RefreshHandler = async () => null;

export function configureApiAuth(token: TokenGetter, refresh: RefreshHandler) {
  getAccessToken = token;
  refreshAccessToken = refresh;
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  skipAuth?: boolean;
  retried?: boolean;
}

export async function api<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, skipAuth, retried, headers, ...rest } = options;

  const merged: HeadersInit = {
    'Content-Type': 'application/json',
    ...(headers ?? {}),
  };

  if (!skipAuth) {
    const token = getAccessToken();
    if (token) (merged as Record<string, string>).Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: merged,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && !skipAuth && !retried) {
    const fresh = await refreshAccessToken();
    if (fresh) {
      return api<T>(path, { ...options, retried: true });
    }
  }

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await res.json().catch(() => undefined) : await res.text().catch(() => undefined);

  if (!res.ok) {
    const message =
      (typeof payload === 'object' && payload && 'message' in payload && String((payload as any).message)) ||
      `Request failed (${res.status})`;
    throw new ApiErrorImpl(res.status, message, payload);
  }

  return payload as T;
}

export const apiFetcher = <T = unknown>(path: string) => api<T>(path);
