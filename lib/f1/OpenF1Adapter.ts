/**
 * OpenF1 API Adapter
 * Optional secondary data source for driver headshots, team colors, and session details
 * Base URL: https://api.openf1.org/v1/
 */

export interface OpenF1Driver {
  driver_number: number
  broadcast_name: string
  full_name: string
  name_acronym: string
  team_name: string
  team_colour: string
  first_name: string
  last_name: string
  headshot_url?: string
  country_code?: string
}

export class OpenF1Adapter {
  private baseUrl = 'https://api.openf1.org/v1'
  private timeoutMs = 5000

  async getDrivers(sessionKey = 'latest'): Promise<OpenF1Driver[] | null> {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), this.timeoutMs)

      const url = `${this.baseUrl}/drivers?session_key=${sessionKey}`
      const response = await fetch(url, { signal: controller.signal })
      clearTimeout(timer)

      if (!response.ok) return null
      return (await response.json()) as OpenF1Driver[]
    } catch {
      return null
    }
  }
}

export const openF1Adapter = new OpenF1Adapter()
