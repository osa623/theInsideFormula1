import constructorsData from '@/data/f1/constructors.json'
import driversData from '@/data/f1/drivers.json'
import constructorHistoryData from '@/data/f1/history/constructor-history.json'
import driverHistoryData from '@/data/f1/history/driver-history.json'
import quizQuestionsData from '@/data/f1/quiz-questions.json'
import season2026Data from '@/data/f1/seasons/2026.json'
import { jolpicaAdapter } from './JolpicaAdapter'
import { openF1Adapter } from './OpenF1Adapter'

export interface DriverSeasonStats {
  position: number
  points: number
  wins: number
  podiums: number
  poles: number
  starts: number
  dnf: number
  fastestLaps: number
}

export interface DriverCareerStats {
  championships: number
  wins: number
  podiums: number
  poles: number
  starts: number
}

export interface DriverProfile {
  id: string
  name: string
  number: number
  team: string
  teamColor: string
  country: string
  headshotUrl?: string
  season2026: DriverSeasonStats
  career: DriverCareerStats
}

export interface ConstructorProfile {
  id: string
  name: string
  shortName: string
  color: string
  season2026: {
    position: number
    points: number
    gap: number
    status: string
    wins: number
    podiums: number
    poles: number
  }
  history: {
    championships: number
    wins: number
    podiums: number
    poles: number
    seasonsCompeted: number
  }
}

export interface CareerTimelineItem {
  year: string
  event: string
}

export interface RaceResultItem {
  round: string
  name: string
  pos: string
  pts: number
  fl: boolean
  pole: boolean
}

export interface DriverHistoryRecord {
  timeline: CareerTimelineItem[]
  raceResults2026: RaceResultItem[]
}

export interface ConstructorHistoryRecord {
  timeline: CareerTimelineItem[]
  championshipYears: number[]
}

export interface RaceEvent {
  round: number
  name: string
  circuit: string
  circuitId: string
  location: string
  country: string
  date: string
  status: 'completed' | 'next' | 'upcoming'
  winner?: string
  podium?: string[]
  pole?: string
  fastestLap?: string
  laps?: number
  lengthKm?: number
}

export interface QuizQuestion {
  id: number
  category: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface ChampionshipGraphDriver {
  id: string
  name: string
  color: string
  points: number[]
}

export interface ChampionshipGraphData {
  rounds: string[]
  drivers: ChampionshipGraphDriver[]
}


export const TEAM_COLOR_MAP: Record<string, string> = {
  mercedes: '#00d2be',
  ferrari: '#e8002d',
  mclaren: '#ff8000',
  red_bull: '#3671c6',
  redbull: '#3671c6',
  aston_martin: '#229971',
  alpine: '#0093cc',
  williams: '#64c4ff',
  rb: '#6692ff',
  racing_bulls: '#6692ff',
  haas: '#b6babd',
  sauber: '#52e252',
  audi: '#52e252',
  cadillac: '#d4af37',
}

// Known circuit images / outlines / photography mappings
export const CIRCUIT_IMAGE_MAP: Record<string, string> = {
  bahrain: 'https://media.formula1.com/image/upload/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Bahrain_Circuit.png',
  jeddah: 'https://media.formula1.com/image/upload/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Saudi_Arabia_Circuit.png',
  albert_park: 'https://media.formula1.com/image/upload/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Australia_Circuit.png',
  suzuka: 'https://media.formula1.com/image/upload/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Japan_Circuit.png',
  shanghai: 'https://media.formula1.com/image/upload/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/China_Circuit.png',
  miami: 'https://media.formula1.com/image/upload/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Miami_Circuit.png',
  imola: 'https://media.formula1.com/image/upload/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Emilia_Romagna_Circuit.png',
  monaco: 'https://media.formula1.com/image/upload/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Monaco_Circuit.png',
  villeneuve: 'https://media.formula1.com/image/upload/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Canada_Circuit.png',
  barcelona: 'https://media.formula1.com/image/upload/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Spain_Circuit.png',
  red_bull_ring: 'https://media.formula1.com/image/upload/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Austria_Circuit.png',
  silverstone: 'https://media.formula1.com/image/upload/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Great_Britain_Circuit.png',
  hungaroring: 'https://media.formula1.com/image/upload/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Hungary_Circuit.png',
  spa: 'https://media.formula1.com/image/upload/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Belgium_Circuit.png',
  zandvoort: 'https://media.formula1.com/image/upload/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Netherlands_Circuit.png',
  monza: 'https://media.formula1.com/image/upload/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Italy_Circuit.png',
  baku: 'https://media.formula1.com/image/upload/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Azerbaijan_Circuit.png',
  marina_bay: 'https://media.formula1.com/image/upload/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Singapore_Circuit.png',
  americas: 'https://media.formula1.com/image/upload/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/USA_Circuit.png',
  rodriguez: 'https://media.formula1.com/image/upload/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Mexico_Circuit.png',
  interlagos: 'https://media.formula1.com/image/upload/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Brazil_Circuit.png',
  las_vegas: 'https://media.formula1.com/image/upload/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Las_Vegas_Circuit.png',
  losail: 'https://media.formula1.com/image/upload/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Qatar_Circuit.png',
  yas_marina: 'https://media.formula1.com/image/upload/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Abu_Dhabi_Circuit.png',
}

export function formatStat(val: any, fallback = '—'): string {
  if (val === undefined || val === null || Number.isNaN(val)) return fallback
  if (typeof val === 'number') return String(val)
  if (typeof val === 'string' && val.trim().length > 0) return val
  return fallback
}

type Listener = () => void

class F1DataService {
  private drivers: DriverProfile[] = driversData as DriverProfile[]
  private constructors: ConstructorProfile[] = constructorsData as ConstructorProfile[]
  private driverHistories: Record<string, DriverHistoryRecord> =
    driverHistoryData as unknown as Record<string, DriverHistoryRecord>
  private constructorHistories: Record<string, ConstructorHistoryRecord> =
    constructorHistoryData as unknown as Record<string, ConstructorHistoryRecord>
  private season2026 = season2026Data
  private quizQuestions: QuizQuestion[] = quizQuestionsData as QuizQuestion[]
  private calendarRaces: RaceEvent[] = []

  private isLive = false
  private lastUpdated: Date | null = null
  private isRefreshing = false
  private listeners = new Set<Listener>()
  private refreshTimer: any = null

  constructor() {
    this.buildInitialCalendar()
    if (typeof window !== 'undefined') {
      this.refreshLiveData()
      this.refreshTimer = setInterval(() => {
        this.refreshLiveData()
      }, 60000)
    }
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notifySubscribers(): void {
    this.listeners.forEach((listener) => {
      try {
        listener()
      } catch (err) {
        console.error('[F1DataService] Error in listener:', err)
      }
    })
  }

  public isLiveConnected(): boolean {
    return this.isLive
  }

  public getLastUpdated(): Date | null {
    return this.lastUpdated
  }

  private buildInitialCalendar() {
    const rawRaces = (this.season2026 as any).calendar || []
    this.calendarRaces = rawRaces.map((r: any, idx: number) => {
      const roundNum = idx + 1
      const isCompleted = roundNum <= this.season2026.currentRound
      const isNext = roundNum === this.season2026.currentRound + 1
      return {
        round: roundNum,
        name: r.name,
        circuit: r.circuit,
        circuitId: r.circuitId || 'circuit',
        location: r.location,
        country: r.country,
        date: r.date,
        status: isCompleted ? 'completed' : isNext ? 'next' : 'upcoming',
        winner: r.winner,
        podium: r.podium,
        pole: r.pole,
        fastestLap: r.fastestLap,
        laps: r.laps || 57,
        lengthKm: r.lengthKm || 5.412,
      } as RaceEvent
    })
  }

  public async refreshLiveData(): Promise<void> {
    if (this.isRefreshing) return
    this.isRefreshing = true

    try {
      const [
        liveDriverStandings,
        liveConstructorStandings,
        liveCalendar,
        liveResults,
        liveQualifying,
        openF1Drivers,
      ] = await Promise.all([
        jolpicaAdapter.getDriverStandings('current'),
        jolpicaAdapter.getConstructorStandings('current'),
        jolpicaAdapter.getCalendar('current'),
        jolpicaAdapter.getResults('current'),
        jolpicaAdapter.getQualifyingResults('current'),
        openF1Adapter.getDrivers('latest').catch(() => null),
      ])

      let updated = false

      // 1. Process Live Race Results and Calendar
      if (liveCalendar && liveCalendar.length > 0) {
        const resultMap = new Map<string, any>()
        const qualMap = new Map<string, any>()

        if (liveResults && Array.isArray(liveResults)) {
          liveResults.forEach((r) => resultMap.set(String(r.round), r))
        }
        if (liveQualifying && Array.isArray(liveQualifying)) {
          liveQualifying.forEach((q) => qualMap.set(String(q.round), q))
        }

        const newCalendar: RaceEvent[] = liveCalendar.map((r, idx) => {
          const roundNum = parseInt(r.round, 10) || idx + 1
          const completedResult = resultMap.get(String(roundNum))
          const qualResult = qualMap.get(String(roundNum))

          let winner: string | undefined
          let podium: string[] | undefined
          let pole: string | undefined
          let fastestLap: string | undefined

          if (completedResult && completedResult.Results && completedResult.Results.length > 0) {
            const p1 = completedResult.Results[0]
            winner = `${p1.Driver.givenName} ${p1.Driver.familyName}`.trim()
            podium = completedResult.Results.slice(0, 3).map((res: any) =>
              `${res.Driver.givenName} ${res.Driver.familyName}`.trim()
            )
            const fl = completedResult.Results.find((res: any) => res.FastestLap?.rank === '1')
            if (fl) {
              fastestLap = `${fl.Driver.givenName} ${fl.Driver.familyName}`.trim()
            }
          }

          if (qualResult && qualResult.QualifyingResults && qualResult.QualifyingResults.length > 0) {
            const p1Qual = qualResult.QualifyingResults[0]
            pole = `${p1Qual.Driver.givenName} ${p1Qual.Driver.familyName}`.trim()
          }

          const hasCompleted = Boolean(completedResult && completedResult.Results && completedResult.Results.length > 0)

          let dateStr = r.date
          try {
            const d = new Date(r.date)
            if (!isNaN(d.getTime())) {
              const day = String(d.getDate()).padStart(2, '0')
              const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase()
              dateStr = `${day} ${month}`
            }
          } catch {
            // Keep raw date
          }

          return {
            round: roundNum,
            name: r.raceName,
            circuit: r.Circuit?.circuitName || 'Grand Prix Circuit',
            circuitId: r.Circuit?.circuitId || 'circuit',
            location: r.Circuit?.Location?.locality || 'City',
            country: r.Circuit?.Location?.country || 'Country',
            date: dateStr,
            status: hasCompleted ? 'completed' : 'upcoming',
            winner,
            podium,
            pole,
            fastestLap,
            laps: completedResult?.Results?.[0]?.laps ? parseInt(completedResult.Results[0].laps, 10) : 57,
            lengthKm: 5.2,
          } as RaceEvent
        })

        // Mark the first upcoming race as 'next'
        let assignedNext = false
        for (let i = 0; i < newCalendar.length; i++) {
          if (newCalendar[i].status === 'upcoming' && !assignedNext) {
            newCalendar[i].status = 'next'
            assignedNext = true
          }
        }

        this.calendarRaces = newCalendar
        updated = true

        // 2. Update Season Metadata & Latest Race
        const completedList = newCalendar.filter((r) => r.status === 'completed')
        const currentRound = completedList.length
        this.season2026.currentRound = currentRound
        this.season2026.totalRounds = newCalendar.length

        if (completedList.length > 0) {
          const last = completedList[completedList.length - 1]
          const lastRaw = resultMap.get(String(last.round))
          const winnerResult = lastRaw?.Results?.[0]
          this.season2026.latestRace = {
            round: last.round,
            name: last.name,
            circuit: last.circuit,
            country: last.country.slice(0, 3).toUpperCase(),
            winner: last.winner || 'Grand Prix Winner',
            winnerTeam: winnerResult?.Constructor?.name || 'F1 Team',
            polePosition: last.pole || last.winner || 'Pole Winner',
            fastestLap: last.fastestLap || 'Fastest Lap',
            podium: last.podium || [last.winner || 'Winner'],
          }
        }
      }

      // 3. Process Live Driver Standings
      if (liveDriverStandings && liveDriverStandings.length > 0) {
        const liveDriverProfiles: DriverProfile[] = liveDriverStandings.map((standing) => {
          const id = standing.Driver.driverId
          const fullName = `${standing.Driver.givenName} ${standing.Driver.familyName}`.trim()
          const permNumber = parseInt(standing.Driver.permanentNumber || '0', 10)
          const teamName = standing.Constructors?.[0]?.name || 'Formula 1 Team'
          const teamId = standing.Constructors?.[0]?.constructorId || ''

          const existing = this.drivers.find(
            (d) =>
              d.id.toLowerCase() === id.toLowerCase() ||
              d.name.toLowerCase() === fullName.toLowerCase() ||
              (permNumber > 0 && d.number === permNumber)
          )

          const mappedColor =
            TEAM_COLOR_MAP[teamId.toLowerCase()] ||
            TEAM_COLOR_MAP[teamName.toLowerCase().replace(/\s+/g, '_')] ||
            existing?.teamColor ||
            '#e10600'

          let podiumCount = 0
          let poleCount = 0
          let flCount = 0
          let starts = 0
          let dnfCount = 0

          if (liveResults && Array.isArray(liveResults)) {
            liveResults.forEach((race) => {
              const res = race.Results?.find((r: any) => r.Driver.driverId === id)
              if (res) {
                starts++
                const pos = parseInt(res.position, 10)
                if (pos >= 1 && pos <= 3) podiumCount++
                if (res.FastestLap?.rank === '1') flCount++
                if (res.status && !res.status.toLowerCase().includes('finished') && !res.status.includes('+')) {
                  dnfCount++
                }
              }
            })
          }

          if (liveQualifying && Array.isArray(liveQualifying)) {
            liveQualifying.forEach((race) => {
              const qual = race.QualifyingResults?.find((q: any) => q.Driver.driverId === id)
              if (qual && qual.position === '1') poleCount++
            })
          }

          const wins = parseInt(standing.wins, 10) || 0

          return {
            id,
            name: fullName,
            number: permNumber || existing?.number || 0,
            team: teamName,
            teamColor: mappedColor,
            country: standing.Driver.nationality?.slice(0, 3).toUpperCase() || existing?.country || 'FIA',
            headshotUrl: existing?.headshotUrl,
            season2026: {
              position: parseInt(standing.position, 10) || 1,
              points: parseFloat(standing.points) || 0,
              wins,
              podiums: podiumCount || existing?.season2026.podiums || wins,
              poles: poleCount || existing?.season2026.poles || 0,
              starts: starts || existing?.season2026.starts || this.season2026.currentRound,
              dnf: dnfCount,
              fastestLaps: flCount || existing?.season2026.fastestLaps || 0,
            },
            career: {
              championships: existing?.career.championships || 0,
              wins: Math.max(wins, existing?.career.wins || wins),
              podiums: Math.max(podiumCount, existing?.career.podiums || podiumCount),
              poles: Math.max(poleCount, existing?.career.poles || poleCount),
              starts: Math.max(starts, existing?.career.starts || starts),
            },
          }
        })

        // Merge OpenF1 headshots and broadcast colors
        if (openF1Drivers && Array.isArray(openF1Drivers)) {
          openF1Drivers.forEach((opD) => {
            const match = liveDriverProfiles.find(
              (d) =>
                d.number === opD.driver_number ||
                d.name.toLowerCase().includes(opD.last_name.toLowerCase())
            )
            if (match) {
              if (opD.headshot_url) match.headshotUrl = opD.headshot_url
              if (opD.team_colour) match.teamColor = `#${opD.team_colour.replace('#', '')}`
            }
          })
        }

        this.drivers = liveDriverProfiles
        updated = true
      }

      // 4. Process Live Constructor Standings
      if (liveConstructorStandings && liveConstructorStandings.length > 0) {
        const topPoints = parseFloat(liveConstructorStandings[0].points) || 0

        this.constructors = liveConstructorStandings.map((standing) => {
          const cId = standing.Constructor.constructorId
          const cName = standing.Constructor.name
          const points = parseFloat(standing.points) || 0
          const wins = parseInt(standing.wins, 10) || 0
          const pos = parseInt(standing.position, 10) || 1

          const existing = this.constructors.find(
            (c) => c.id.toLowerCase() === cId.toLowerCase() || c.name.toLowerCase() === cName.toLowerCase()
          )

          const color =
            TEAM_COLOR_MAP[cId.toLowerCase()] ||
            existing?.color ||
            '#e10600'

          return {
            id: cId,
            name: cName,
            shortName: existing?.shortName || cName.split(' ')[0],
            color,
            season2026: {
              position: pos,
              points,
              gap: topPoints - points,
              status: pos === 1 ? 'LEADER' : `-${(topPoints - points).toFixed(0)} PTS`,
              wins,
              podiums: existing?.season2026.podiums || wins,
              poles: existing?.season2026.poles || 0,
            },
            history: {
              championships: existing?.history.championships || 0,
              wins: Math.max(wins, existing?.history.wins || wins),
              podiums: existing?.history.podiums || 0,
              poles: existing?.history.poles || 0,
              seasonsCompeted: existing?.history.seasonsCompeted || 10,
            },
          }
        })
        updated = true
      }

      // 5. Build Dynamic Championship Progression Graph
      if (this.calendarRaces.length > 0 && liveResults && liveResults.length > 0) {
        const completedRounds = this.calendarRaces.filter((r) => r.status === 'completed')
        const roundLabels = completedRounds.map((r) =>
          r.location.slice(0, 3).toUpperCase() || `R${r.round}`
        )

        const topDrivers = this.drivers.slice(0, 6)
        const graphDrivers: ChampionshipGraphDriver[] = topDrivers.map((driver) => {
          let runningPoints = 0
          const pointsArray: number[] = []

          completedRounds.forEach((cr) => {
            const raceRes = liveResults.find((r: any) => parseInt(r.round, 10) === cr.round)
            const driverResult = raceRes?.Results?.find(
              (res: any) => res.Driver.driverId === driver.id
            )
            if (driverResult) {
              runningPoints += parseFloat(driverResult.points) || 0
            }
            pointsArray.push(runningPoints)
          })

          return {
            id: driver.id,
            name: `${driver.name[0]}. ${driver.name.split(' ').pop()}`,
            color: driver.teamColor,
            points: pointsArray,
          }
        })

        this.season2026.graphProgression = {
          rounds: roundLabels,
          drivers: graphDrivers,
        }
        updated = true
      }

      if (updated) {
        this.isLive = true
        this.lastUpdated = new Date()
        console.log(`[F1DataService] Successfully synced live F1 data: ${this.drivers.length} drivers, ${this.constructors.length} constructors, ${this.calendarRaces.length} races.`)
        this.notifySubscribers()
      }
    } catch (err) {
      console.warn('[F1DataService] Error during live data refresh, using baseline fallback:', err)
    } finally {
      this.isRefreshing = false
    }
  }

  // Drivers
  public getCurrentDrivers(): DriverProfile[] {
    return this.drivers
  }

  public getDriverById(id: string): DriverProfile | undefined {
    return this.drivers.find((d) => d.id === id)
  }

  public getDriverStats(driverId: string): { season: DriverSeasonStats; career: DriverCareerStats } | null {
    const driver = this.getDriverById(driverId)
    if (!driver) return null
    return {
      season: driver.season2026,
      career: driver.career,
    }
  }

  public getDriverHistory(driverId: string): DriverHistoryRecord | null {
    return this.driverHistories[driverId] || null
  }

  public getDriverImage(driverId: string): string | null {
    const driver = this.getDriverById(driverId)
    return driver?.headshotUrl || null
  }

  // Constructors
  public getCurrentConstructors(): ConstructorProfile[] {
    return this.constructors
  }

  public getConstructorById(id: string): ConstructorProfile | undefined {
    return this.constructors.find((c) => c.id === id)
  }

  public getConstructorHistory(constructorId: string): ConstructorHistoryRecord | null {
    return this.constructorHistories[constructorId] || null
  }

  // Standings
  public getCurrentStandings(): DriverProfile[] {
    return [...this.drivers].sort((a, b) => a.season2026.position - b.season2026.position)
  }

  public getConstructorStandings(): ConstructorProfile[] {
    return [...this.constructors].sort((a, b) => a.season2026.position - b.season2026.position)
  }

  // Calendar & Races
  public get2026Calendar(): RaceEvent[] {
    return this.calendarRaces
  }

  public get2026CompletedRaces(): RaceEvent[] {
    return this.calendarRaces.filter((r) => r.status === 'completed')
  }

  public get2026RemainingRaces(): RaceEvent[] {
    return this.calendarRaces.filter((r) => r.status === 'upcoming')
  }

  public getNextRace(): RaceEvent | null {
    return this.calendarRaces.find((r) => r.status === 'next') || this.calendarRaces[this.calendarRaces.length - 1] || null
  }

  public getCircuitInfo(circuitId: string): { name: string; mapUrl: string | null } {
    const race = this.calendarRaces.find((r) => r.circuitId === circuitId)
    const mapUrl = CIRCUIT_IMAGE_MAP[circuitId] || null
    return {
      name: race?.circuit || 'FIA Formula 1 Circuit',
      mapUrl,
    }
  }

  public getCircuitImage(circuitId: string): string | null {
    return CIRCUIT_IMAGE_MAP[circuitId] || null
  }

  // Season & Graph
  public getChampionshipGraphData(): ChampionshipGraphData {
    return this.season2026.graphProgression
  }

  public getLatestRaceInfo() {
    return this.season2026.latestRace
  }

  public getSeasonMeta() {
    return {
      year: this.season2026.year,
      currentRound: this.season2026.currentRound,
      totalRounds: this.season2026.totalRounds,
    }
  }

  // Quiz
  public getQuizQuestions(count = 10): QuizQuestion[] {
    const shuffled = [...this.quizQuestions].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
  }
}

export const f1DataService = new F1DataService()
