import { request } from './client'

export interface UnitMeta {
  unit: string
  exercises: string[]
}

export async function fetchUnits(): Promise<UnitMeta[]> {
  const { units } = await request<{ units: UnitMeta[] }>('/api/content/units')
  return units
}

export async function fetchFileContent(unit: string, exercise: string, file: string): Promise<string> {
  const { content } = await request<{ content: string }>(`/api/content/${unit}/${exercise}/${file}`)
  return content
}
