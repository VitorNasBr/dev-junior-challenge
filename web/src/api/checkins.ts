// All HTTP calls to the check-in API live in this file.

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export interface Checkin {
  id: number
  cpf: string // already masked by the API
  name: string
  arrivedAt: string // ISO date
}

// NestJS error body: "message" is a string or a list of validation messages.
interface ApiError {
  message?: string | string[]
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, options)
  } catch {
    throw new Error('Não foi possível conectar ao servidor. Tente novamente.')
  }

  const body: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    const message = (body as ApiError | null)?.message
    const text = Array.isArray(message) ? message[0] : message
    throw new Error(text ?? 'Ocorreu um erro inesperado. Tente novamente.')
  }

  return body as T
}

export function createCheckin(cpf: string): Promise<Checkin> {
  return request<Checkin>('/checkins', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cpf }),
  })
}

export function fetchQueue(): Promise<Checkin[]> {
  return request<Checkin[]>('/checkins')
}
