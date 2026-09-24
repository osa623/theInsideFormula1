import { NextResponse } from 'next/server'

interface JolpicaSession {
  date: string
  time?: string
}

interface JolpicaRaceItem {
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
  FirstPractice?: JolpicaSession
  SecondPractice?: JolpicaSession
  ThirdPractice?: JolpicaSession
  Qualifying?: JolpicaSession
  Sprint?: JolpicaSession
}

const CIRCUIT_SPECS: Record<
  string,
  {
    trackKey: string
    laps: number
    length: string
    color: string
    image?: string
    heroName?: string
  }
> = {
  albert_park: {
    trackKey: 'melbourne',
    laps: 58,
    length: '5.278 km',
    color: 'var(--primary)',
    image: '/images/race-melbourne.png',
    heroName: 'MELBOURNE',
  },
  shanghai: {
    trackKey: 'shanghai',
    laps: 56,
    length: '5.451 km',
    color: 'var(--speed)',
    image: '/images/race-shanghai.png',
    heroName: 'SHANGHAI',
  },
  suzuka: {
    trackKey: 'suzuka',
    laps: 53,
    length: '5.807 km',
    color: 'var(--neon)',
    image: '/images/race-suzuka.png',
    heroName: 'SUZUKA',
  },
  sakhir: {
    trackKey: 'sakhir',
    laps: 57,
    length: '5.412 km',
    color: 'var(--silver)',
    image: '/images/race-sakhir.png',
    heroName: 'SAKHIR',
  },
  bahrain: {
    trackKey: 'sakhir',
    laps: 57,
    length: '5.412 km',
    color: 'var(--silver)',
    image: '/images/race-sakhir.png',
    heroName: 'SAKHIR',
  },
  jeddah: {
    trackKey: 'jeddah',
    laps: 50,
    length: '6.174 km',
    color: 'var(--primary)',
    image: '/images/race-jeddah.png',
    heroName: 'JEDDAH',
  },
  miami: {
    trackKey: 'miami',
    laps: 57,
    length: '5.412 km',
    color: 'var(--speed)',
    image: '/images/race-miami.png',
    heroName: 'MIAMI',
  },
  villeneuve: {
    trackKey: 'montreal',
    laps: 70,
    length: '4.361 km',
    color: 'var(--neon)',
    image: '/images/race-montreal.png',
    heroName: 'MONTREAL',
  },
  monaco: {
    trackKey: 'monaco',
    laps: 78,
    length: '3.337 km',
    color: 'var(--silver)',
    image: '/images/race-monaco.png',
    heroName: 'MONACO',
  },
  catalunya: {
    trackKey: 'catalunya',
    laps: 66,
    length: '4.657 km',
    color: 'var(--primary)',
    image: '/images/race-barcelona.png',
    heroName: 'BARCELONA',
  },
  red_bull_ring: {
    trackKey: 'redbullring',
    laps: 71,
    length: '4.318 km',
    color: 'var(--speed)',
    image: '/images/race-spielberg.png',
    heroName: 'SPIELBERG',
  },
  silverstone: {
    trackKey: 'silverstone',
    laps: 52,
    length: '5.891 km',
    color: 'var(--neon)',
    image: '/images/race-silverstone.png',
    heroName: 'SILVERSTONE',
  },
  spa: {
    trackKey: 'spa',
    laps: 44,
    length: '7.004 km',
    color: 'var(--silver)',
    image: '/images/race-spa.png',
    heroName: 'SPA',
  },
  hungaroring: {
    trackKey: 'hungaroring',
    laps: 70,
    length: '4.381 km',
    color: 'var(--primary)',
    image: '/images/race-hungary.png',
    heroName: 'BUDAPEST',
  },
  zandvoort: {
    trackKey: 'zandvoort',
    laps: 72,
    length: '4.259 km',
    color: 'var(--speed)',
    image: '/images/race-zandvoort.png',
    heroName: 'ZANDVOORT',
  },
  monza: {
    trackKey: 'monza',
    laps: 53,
    length: '5.793 km',
    color: 'var(--neon)',
    image: '/images/race-monza.png',
    heroName: 'MONZA',
  },
  madring: {
    trackKey: 'madrid',
    laps: 57,
    length: '5.470 km',
    color: 'var(--silver)',
    image: '/images/race-madrid.png',
    heroName: 'MADRID',
  },
  baku: {
    trackKey: 'baku',
    laps: 51,
    length: '6.003 km',
    color: 'var(--primary)',
    image: '/images/race-baku.png',
    heroName: 'BAKU',
  },
  sepang: {
    trackKey: 'sepang',
    laps: 56,
    length: '5.543 km',
    color: 'var(--speed)',
    image: '/images/race-singapore.png',
    heroName: 'KUALA LUMPUR',
  },
  marina_bay: {
    trackKey: 'marinabay',
    laps: 62,
    length: '4.940 km',
    color: 'var(--speed)',
    image: '/images/race-singapore.png',
    heroName: 'SINGAPORE',
  },
  americas: {
    trackKey: 'austin',
    laps: 56,
    length: '5.513 km',
    color: 'var(--neon)',
    image: '/images/race-austin.png',
    heroName: 'AUSTIN',
  },
  rodriguez: {
    trackKey: 'mexicocity',
    laps: 71,
    length: '4.304 km',
    color: 'var(--silver)',
    image: '/images/race-mexico.png',
    heroName: 'MEXICO CITY',
  },
  interlagos: {
    trackKey: 'interlagos',
    laps: 71,
    length: '4.309 km',
    color: 'var(--primary)',
    image: '/images/race-interlagos.png',
    heroName: 'INTERLAGOS',
  },
  vegas: {
    trackKey: 'lasvegas',
    laps: 50,
    length: '6.201 km',
    color: 'var(--speed)',
    image: '/images/race-lasvegas.png',
    heroName: 'LAS VEGAS',
  },
  losail: {
    trackKey: 'lusail',
    laps: 57,
    length: '5.419 km',
    color: 'var(--neon)',
    image: '/images/race-lusail.png',
    heroName: 'LUSAIL',
  },
  yas_marina: {
    trackKey: 'yasmarina',
    laps: 58,
    length: '5.281 km',
    color: 'var(--silver)',
    image: '/images/race-yasmarina.png',
    heroName: 'ABU DHABI',
  },
}

export async function GET() {
  try {
    const res = await fetch('https://api.jolpi.ca/ergast/f1/2026/races.json', {
      headers: { Accept: 'application/json' },
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      throw new Error(`Ergast API responded with HTTP ${res.status}`)
    }

    const data = await res.json()
    const rawRaces: JolpicaRaceItem[] = data?.MRData?.RaceTable?.Races || []

    if (!rawRaces || rawRaces.length === 0) {
      throw new Error('Empty races array from Ergast API')
    }

    const now = Date.now()
    let foundNext = false

    const races = rawRaces.map((r, idx) => {
      const roundNum = parseInt(r.round, 10) || idx + 1
      const roundStr = `R${String(roundNum).padStart(2, '0')}`
      const circuitId = (r.Circuit?.circuitId || '').toLowerCase()
      const specs = CIRCUIT_SPECS[circuitId] || {
        trackKey: circuitId || 'melbourne',
        laps: 55,
        length: '5.300 km',
        color: idx % 4 === 0 ? 'var(--primary)' : idx % 4 === 1 ? 'var(--speed)' : idx % 4 === 2 ? 'var(--neon)' : 'var(--silver)',
        image: '/images/race-melbourne.png',
        heroName: r.Circuit?.Location?.locality?.toUpperCase() || r.raceName.replace(/ Grand Prix/i, '').toUpperCase(),
      }

      const isoDate = `${r.date}T${r.time || '13:00:00Z'}`
      const raceTime = new Date(isoDate).getTime()

      let status: 'completed' | 'next' | 'upcoming' = 'upcoming'
      if (raceTime < now) {
        status = 'completed'
      } else if (!foundNext) {
        status = 'next'
        foundNext = true
      }

      return {
        round: roundStr,
        roundNumber: roundNum,
        name: specs.heroName || r.Circuit?.Location?.locality?.toUpperCase() || r.raceName.replace(/ Grand Prix/i, '').toUpperCase(),
        officialName: r.raceName,
        circuit: r.Circuit?.circuitName || 'Grand Prix Circuit',
        circuitId,
        locality: r.Circuit?.Location?.locality || 'Host City',
        country: r.Circuit?.Location?.country || 'Country',
        date: isoDate,
        rawDate: r.date,
        rawTime: r.time,
        image: specs.image || '/images/race-melbourne.png',
        track: specs.trackKey,
        laps: specs.laps,
        length: specs.length,
        color: specs.color,
        status,
        sessions: {
          fp1: r.FirstPractice ? { date: r.FirstPractice.date, time: r.FirstPractice.time } : undefined,
          fp2: r.SecondPractice ? { date: r.SecondPractice.date, time: r.SecondPractice.time } : undefined,
          fp3: r.ThirdPractice ? { date: r.ThirdPractice.date, time: r.ThirdPractice.time } : undefined,
          sprint: r.Sprint ? { date: r.Sprint.date, time: r.Sprint.time } : undefined,
          qualifying: r.Qualifying ? { date: r.Qualifying.date, time: r.Qualifying.time } : undefined,
          race: { date: r.date, time: r.time },
        },
      }
    })

    return NextResponse.json({
      season: '2026',
      total: races.length,
      source: 'Jolpica Ergast API (Real 2026 FIA Calendar)',
      cachedAt: new Date().toISOString(),
      races,
    })
  } catch (error: any) {
    console.error('[API /api/f1/calendar] Error fetching live calendar: ', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch live 2026 calendar',
        message: error?.message,
      },
      { status: 500 }
    )
  }
}
