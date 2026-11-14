import apiClient from '../../../shared/http/apiClient'
import type { MedalhaUsuario } from '../domain/medalhaTypes'

export async function getMeMedalhasApi(): Promise<MedalhaUsuario[]> {
  const response = await apiClient.get<MedalhaUsuario[]>('/me/medalhas')
  return response.data.map((medal) => ({
    ...medal,
    tipo: (medal.tipo || 'BRONZE').toUpperCase() as MedalhaUsuario['tipo'],
  }))
}
