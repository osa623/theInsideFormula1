/**
 * Jolpica F1 Ergast API Adapter
 * Base URL: https://api.jolpi.ca/ergast/f1/
 */

export interface JolpicaDriverStanding {
  position: string
  points: string
  wins: string
  Driver: {
    driverId: string
    permanentNumber?: string
    code?: string
    givenName: string
    familyName: string
    dateOfBirth?: string
    nationality: string
  }
  Constructors: Array<{
    constructorId: string
    name: string
    nationality: string
  }>
}

export interface JolpicaConstructorStanding {
  position: string
  points: string
  wins: string
  Constructor: {
    constructorId: string
    name: string
    nationality: string
  }
}

export interface JolpicaRace {
  season: string
  round: string
  raceName: string
  Circuit: {
    circuitId: string
    circuitName: string
    Location: {
      lat: string
      long: string
      locality: string
      country: string
    }
  }
  date: string
  time?: string
  Results?: Array<{
    number: string
    position: string
    positionText?: string
    points: string
    status?: string
    Driver: {
      driverId: string
      code?: string
      givenName: string
      familyName: string
      nationality?: string
    }
    Constructor: {
      constructorId: string
      name: string
    }
    FastestLap?: {
      rank: string
      lap: string
      Time: { time: string }
    }
  }>
  QualifyingResults?: Array<{
    number: string
    position: string
    Driver: {
      driverId: string
      code?: string
      givenName: string
      familyName: string
    }
    Constructor: {
      constructorId: string
      name: string
    }
  }>
}

export class JolpicaAdapter {
  private baseUrl = 'https://api.jolpi.ca/ergast/f1'
  private timeoutMs = 6000

  private async fetchJson<T>(endpoint: string): Promise<T | null> {
    try {
      const url = `${this.baseUrl}${endpoint}`
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), this.timeoutMs)

      const response = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      })
      clearTimeout(timer)

      if (!response.ok) {
        console.warn(`[JolpicaAdapter] HTTP ${response.status} for ${endpoint}`)
        return null
      }

      return (await response.json()) as T
    } catch (err: any) {
      console.warn(`[JolpicaAdapter] Failed to fetch ${endpoint}: `, err?.message || err)
      return null
    }
  }

  async getDriverStandings(season = 'current'): Promise<JolpicaDriverStanding[] | null> {
    const data = await this.fetchJson<any>(`/${season}/driverstandings.json`)
    const list = data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings
    return Array.isArray(list) ? list : null
  }

  async getConstructorStandings(season = 'current'): Promise<JolpicaConstructorStanding[] | null> {
    const data = await this.fetchJson<any>(`/${season}/constructorstandings.json`)
    const list = data?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings
    return Array.isArray(list) ? list : null
  }

  async getCalendar(season = 'current'): Promise<JolpicaRace[] | null> {
    const data = await this.fetchJson<any>(`/${season}/races.json`)
    const list = data?.MRData?.RaceTable?.Races
    return Array.isArray(list) ? list : null
  }

  async getResults(season = 'current'): Promise<JolpicaRace[] | null> {
    const data = await this.fetchJson<any>(`/${season}/results.json?limit=2000`)
    const list = data?.MRData?.RaceTable?.Races
    return Array.isArray(list) ? list : null
  }

  async getQualifyingResults(season = 'current'): Promise<JolpicaRace[] | null> {
    const data = await this.fetchJson<any>(`/${season}/qualifying.json?limit=2000`)
    const list = data?.MRData?.RaceTable?.Races
    return Array.isArray(list) ? list : null
  }

  async getDriverWins(driverId: string): Promise<number> {
    const data = await this.fetchJson<any>(`/drivers/${driverId}/results/1.json?limit=1`)
    const total = Number(data?.MRData?.total)
    return Number.isFinite(total) ? total : 0
  }

  async getDriverTitles(driverId: string): Promise<number> {
    const data = await this.fetchJson<any>(`/drivers/${driverId}/driverStandings/1.json?limit=1`)
    const total = Number(data?.MRData?.total)
    return Number.isFinite(total) ? total : 0
  }
}

export const jolpicaAdapter = new JolpicaAdapter()
