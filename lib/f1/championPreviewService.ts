import championPreviewSeeds from '@/data/f1/champions.json'
import { JolpicaDriverStanding, JolpicaRace, jolpicaAdapter } from './JolpicaAdapter'

export interface ChampionRaceResult {
  round: number
  grandPrix: string
  circuit: string
  position: string
  status: string
  points: number
}

export interface ChampionStandingRow {
  position: number
  driver: string
  team: string
  points: number
  isChampion?: boolean
}

export interface ChampionPreviewData {
  year: number
  driver: {
    id: string
    name: string
    nationality: string
    team: string
    image: string
  }
  seasonStats: {
    wins: number
    polePositions: number | null
    podiums: number | null
    championshipPosition: number
    points: number
  }
  performanceSummary: string
  raceResults: ChampionRaceResult[]
  standings: ChampionStandingRow[]
  source: string
  loaded: boolean
}

const cache = new Map<number, Promise<ChampionPreviewData>>()

function driverName(driver: JolpicaDriverStanding['Driver']) {
  return `${driver.givenName} ${driver.familyName}`.trim()
}

function resultDriverName(result: NonNullable<JolpicaRace['Results']>[number]) {
  return `${result.Driver.givenName} ${result.Driver.familyName}`.trim()
}

function toNumber(value: string | number | undefined | null, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function formatPosition(result: NonNullable<JolpicaRace['Results']>[number]) {
  if (result.positionText && result.positionText !== '\\N') return result.positionText
  return result.position || 'N/A'
}

function buildSummary(data: {
  year: number
  name: string
  team: string
  wins: number
  podiums: number | null
  poles: number | null
  points: number
  races: number
}) {
  const podiumText = data.podiums === null ? 'podium tally unavailable' : `${data.podiums} podiums`
  const poleText = data.poles === null ? 'pole-position data unavailable' : `${data.poles} pole positions`

  return `${data.name} won the ${data.year} World Drivers' Championship with ${data.team}, scoring ${data.points} points and ${data.wins} wins across ${data.races} Grands Prix. The campaign record shown here includes ${podiumText} and ${poleText} from the loaded season data.`
}

function emptyData(year: number): ChampionPreviewData {
  const seed = championPreviewSeeds.find((item) => item.year === year)

  return {
    year,
    driver: {
      id: '',
      name: 'Data unavailable',
      nationality: 'N/A',
      team: 'N/A',
      image: seed?.image || '/placeholder-user.jpg',
    },
    seasonStats: {
      wins: 0,
      polePositions: null,
      podiums: null,
      championshipPosition: 1,
      points: 0,
    },
    performanceSummary: 'Historical data could not be loaded. The preview will populate automatically when the configured data source responds.',
    raceResults: [],
    standings: [],
    source: 'Jolpica Ergast-compatible API',
    loaded: false,
  }
}

async function buildChampionPreviewData(year: number): Promise<ChampionPreviewData> {
  if (year < 2000 || year > 2025) return emptyData(year)

  const [standings, results, qualifying] = await Promise.all([
    jolpicaAdapter.getDriverStandings(String(year)),
    jolpicaAdapter.getResults(String(year)),
    jolpicaAdapter.getQualifyingResults(String(year)),
  ])

  const champion = standings?.[0]
  if (!champion) return emptyData(year)

  const championId = champion.Driver.driverId
  const championName = driverName(champion.Driver)
  const championTeam = champion.Constructors?.[0]?.name || 'N/A'
  const seed = championPreviewSeeds.find((item) => item.year === year)

  const raceResults = (results || [])
    .map((race) => {
      const championResult = race.Results?.find((result) => result.Driver.driverId === championId)
      if (!championResult) return null

      return {
        round: toNumber(race.round),
        grandPrix: race.raceName,
        circuit: race.Circuit?.circuitName || 'N/A',
        position: formatPosition(championResult),
        status: championResult.status || 'Finished',
        points: toNumber(championResult.points),
      }
    })
    .filter((item): item is ChampionRaceResult => item !== null)

  const podiums = results
    ? raceResults.filter((race) => {
        const position = Number(race.position)
        return Number.isFinite(position) && position >= 1 && position <= 3
      }).length
    : null

  const polePositions = qualifying
    ? qualifying.filter((race) => {
        const pole = race.QualifyingResults?.find((result) => result.position === '1')
        return pole?.Driver.driverId === championId
      }).length
    : null

  const standingsRows =
    standings?.map((row) => ({
      position: toNumber(row.position),
      driver: driverName(row.Driver),
      team: row.Constructors?.[0]?.name || 'N/A',
      points: toNumber(row.points),
      isChampion: row.Driver.driverId === championId,
    })) || []

  return {
    year,
    driver: {
      id: championId,
      name: championName,
      nationality: champion.Driver.nationality || 'N/A',
      team: championTeam,
      image: seed?.image || '/placeholder-user.jpg',
    },
    seasonStats: {
      wins: toNumber(champion.wins),
      polePositions,
      podiums,
      championshipPosition: toNumber(champion.position, 1),
      points: toNumber(champion.points),
    },
    performanceSummary: buildSummary({
      year,
      name: championName,
      team: championTeam,
      wins: toNumber(champion.wins),
      podiums,
      poles: polePositions,
      points: toNumber(champion.points),
      races: results?.length || raceResults.length,
    }),
    raceResults,
    standings: standingsRows,
    source: 'Jolpica Ergast-compatible API',
    loaded: true,
  }
}

export function getChampionPreviewData(year: number) {
  if (!cache.has(year)) {
    cache.set(year, buildChampionPreviewData(year))
  }

  return cache.get(year) as Promise<ChampionPreviewData>
}
