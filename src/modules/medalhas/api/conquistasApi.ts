import apiClient from '../../../shared/http/apiClient'
import type { Conquistas } from '../domain/conquistas'

export async function getMinhasConquistasApi(): Promise<Conquistas> {
  const response = await apiClient.get<Conquistas>('/me/conquistas')
  return response.data
}
