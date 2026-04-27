const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://beeriobackend-production.up.railway.app/api'

export interface PlayerScore {
  username: string
  score: number
}

export interface RoomState {
  room_id: string
  unit_size: number
  unit_goal: number
  players: PlayerScore[]
}

export interface ApiError {
  status: number
  message: string
}

export function isApiError(err: unknown): err is ApiError {
  return typeof err === 'object' && err !== null && 'status' in err
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    const err: ApiError = { status: res.status, message: text }
    throw err
  }
  return res.json() as Promise<T>
}

export const api = {
  createRoom: (unit_size: number, unit_goal: number) =>
    request<{ room_id: string }>('/rooms', {
      method: 'POST',
      body: JSON.stringify({ unit_size, unit_goal }),
    }),

  getRoom: (room_id: string) =>
    request<RoomState>(`/rooms/${room_id}`),

  joinRoom: (room_id: string, username: string) =>
    request<PlayerScore>(`/rooms/${room_id}/join`, {
      method: 'POST',
      body: JSON.stringify({ username }),
    }),

  drink: (room_id: string, username: string, unit_size: number) =>
    request<RoomState>(`/rooms/${room_id}/players/${encodeURIComponent(username)}/drink`, {
      method: 'POST',
      body: JSON.stringify({ unit_size }),
    }),

  undrink: (room_id: string, username: string, unit_size: number) =>
    request<RoomState>(`/rooms/${room_id}/players/${encodeURIComponent(username)}/drink`, {
      method: 'DELETE',
      body: JSON.stringify({ unit_size }),
    }),
}
