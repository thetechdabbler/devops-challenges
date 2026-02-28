export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? ''

export async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { code?: string; message?: string }
    throw new ApiError(res.status, body.code ?? 'UNKNOWN', body.message ?? res.statusText)
  }
  return res.json() as Promise<T>
}
