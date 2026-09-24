'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { useLanguage } from '@/lib/language-context'

const DRIVERS = [
  {
    name: "MAX VERSTAPPEN",
    number: "3",
    country: "Netherlands",
    team: "Red Bull Racing",
    image: "/images/drivers/max-verstappen.png",
    color: "linear-gradient(135deg, #060A2A 0%, #1E41FF 45%, #E10600 100%)",
    bio: "4-time Formula 1 World Champion known for aggressive overtaking, incredible race pace, and one of the strongest qualifying performances on the grid.",
    stats: [
      { key: "wins", value: "65" },
      { key: "podiums", value: "120" },
      { key: "poles", value: "44" },
    ],
  },

  {
    name: "ISACK HADJAR",
    number: "6",
    country: "France",
    team: "Red Bull Racing",
    image: "/images/drivers/isack-hadjar.png",
    color: "linear-gradient(135deg, #060A2A 0%, #1E41FF 45%, #E10600 100%)",
    bio: "Young Red Bull talent known for his strong junior career, sharp race intelligence, and impressive adaptability.",
    stats: [
      { key: "wins", value: "0" },
      { key: "podiums", value: "0" },
      { key: "poles", value: "0" },
    ],
  },

  {
    name: "LANDO NORRIS",
    number: "1",
    country: "United Kingdom",
    team: "McLaren",
    image: "/images/drivers/lando-norris.png",
    color: "linear-gradient(135deg, #FF8700 0%, #FFB800 50%, #111111 100%)",
    bio: "McLaren star and 2025 World Champion known for exceptional qualifying speed, consistency, and elite wheel-to-wheel racing.",
    stats: [
      { key: "wins", value: "14" },
      { key: "podiums", value: "38" },
      { key: "poles", value: "12" },
    ],
  },

  {
    name: "OSCAR PIASTRI",
    number: "81",
    country: "Australia",
    team: "McLaren",
    image: "/images/drivers/oscar-piastri.png",
    color: "linear-gradient(135deg, #FF8700 0%, #FFB800 50%, #111111 100%)",
    bio: "Rising Australian champion known for calm decision making, precise driving, and exceptional tyre management.",
    stats: [
      { key: "wins", value: "11" },
      { key: "podiums", value: "29" },
      { key: "poles", value: "8" },
    ],
  },

  {
    name: "CHARLES LECLERC",
    number: "16",
    country: "Monaco",
    team: "Ferrari",
    image: "/images/drivers/charles-leclerc.png",
    color: "linear-gradient(135deg, #8B0000 0%, #DC0000 55%, #FFCC00 100%)",
    bio: "Ferrari's qualifying master with incredible one-lap speed, precision driving, and multiple pole position records.",
    stats: [
      { key: "wins", value: "9" },
      { key: "podiums", value: "46" },
      { key: "poles", value: "26" },
    ],
  },

  {
    name: "LEWIS HAMILTON",
    number: "44",
    country: "United Kingdom",
    team: "Ferrari",
    image: "/images/drivers/lewis-hamilton.png",
    color: "linear-gradient(135deg, #8B0000 0%, #DC0000 55%, #FFCC00 100%)",
    bio: "7-time Formula 1 World Champion and one of the greatest drivers in history with record-breaking wins and poles.",
    stats: [
      { key: "wins", value: "106" },
      { key: "podiums", value: "207" },
      { key: "poles", value: "104" },
    ],
  },

  {
    name: "GEORGE RUSSELL",
    number: "63",
    country: "United Kingdom",
    team: "Mercedes",
    image: "/images/drivers/george-russell.png",
    color: "linear-gradient(135deg, #111111 0%, #00A19C 45%, #D0D0D0 100%)",
    bio: "Mercedes leader known for qualifying brilliance, technical feedback, and strong race consistency.",
    stats: [
      { key: "wins", value: "5" },
      { key: "podiums", value: "22" },
      { key: "poles", value: "6" },
    ],
  },

  {
    name: "KIMI ANTONELLI",
    number: "12",
    country: "Italy",
    team: "Mercedes",
    image: "/images/drivers/kimi-antonelli.png",
    color: "linear-gradient(135deg, #111111 0%, #00A19C 45%, #D0D0D0 100%)",
    bio: "Italian prodigy and Mercedes future star known for raw speed and exceptional racing talent.",
    stats: [
      { key: "wins", value: "1" },
      { key: "podiums", value: "5" },
      { key: "poles", value: "2" },
    ],
  },

    {
    name: "FERNANDO ALONSO",
    number: "14",
    country: "Spain",
    team: "Aston Martin",
    image: "/images/drivers/fernando-alonso.png",
    color: "linear-gradient(135deg, #00352F 0%, #006F62 50%, #229971 100%)",
    bio: "2-time World Champion famous for race intelligence, legendary defensive driving, and unmatched experience.",
    stats: [
      { key: "wins", value: "32" },
      { key: "podiums", value: "106" },
      { key: "poles", value: "22" },
    ],
  },

  {
    name: "LANCE STROLL",
    number: "18",
    country: "Canada",
    team: "Aston Martin",
    image: "/images/drivers/lance-stroll.png",
    color: "linear-gradient(135deg, #00352F 0%, #006F62 50%, #229971 100%)",
    bio: "Canadian driver known for wet-weather ability and achieving podium success early in his career.",
    stats: [
      { key: "wins", value: "0" },
      { key: "podiums", value: "3" },
      { key: "poles", value: "1" },
    ],
  },

  {
    name: "CARLOS SAINZ",
    number: "55",
    country: "Spain",
    team: "Williams",
    image: "/images/drivers/carlos-sainz.png",
    color: "linear-gradient(135deg, #041E42 0%, #0057FF 55%, #00AEEF 100%)",
    bio: "Highly consistent race winner known for strategic intelligence and smooth driving style.",
    stats: [
      { key: "wins", value: "4" },
      { key: "podiums", value: "27" },
      { key: "poles", value: "6" },
    ],
  },

  {
    name: "ALEXANDER ALBON",
    number: "23",
    country: "Thailand",
    team: "Williams",
    image: "/images/drivers/alexander-albon.png",
    color: "linear-gradient(135deg, #041E42 0%, #0057FF 55%, #00AEEF 100%)",
    bio: "Williams leader praised for extracting maximum performance from challenging cars.",
    stats: [
      { key: "wins", value: "0" },
      { key: "podiums", value: "2" },
      { key: "poles", value: "0" },
    ],
  },

  {
    name: "NICO HULKENBERG",
    number: "27",
    country: "Germany",
    team: "Audi",
    image: "/images/drivers/nico-hulkenberg.png",
    color: "linear-gradient(135deg, #111111 0%, #FF0000 55%, #FFFFFF 100%)",
    bio: "Experienced German driver famous for technical feedback and exceptional qualifying performances.",
    stats: [
      { key: "wins", value: "0" },
      { key: "podiums", value: "0" },
      { key: "poles", value: "1" },
    ],
  },

  {
    name: "GABRIEL BORTOLETO",
    number: "5",
    country: "Brazil",
    team: "Audi",
    image: "/images/drivers/gabriel-bortoleto.png",
    color: "linear-gradient(135deg, #111111 0%, #FF0000 55%, #FFFFFF 100%)",
    bio: "Brazilian rookie and Formula 2 champion known for speed, consistency, and championship mentality.",
    stats: [
      { key: "wins", value: "0" },
      { key: "podiums", value: "0" },
      { key: "poles", value: "0" },
    ],
  },

  {
    name: "PIERRE GASLY",
    number: "10",
    country: "France",
    team: "Alpine",
    image: "/images/drivers/pierre-gasly.png",
    color: "linear-gradient(135deg, #00205B 0%, #0090FF 50%, #FF87BC 100%)",
    bio: "Race winner known for strong qualifying pace and extracting performance from difficult machinery.",
    stats: [
      { key: "wins", value: "1" },
      { key: "podiums", value: "5" },
      { key: "poles", value: "0" },
    ],
  },

  {
    name: "FRANCO COLAPINTO",
    number: "43",
    country: "Argentina",
    team: "Alpine",
    image: "/images/drivers/franco-colapinto.png",
    color: "linear-gradient(135deg, #00205B 0%, #0090FF 50%, #FF87BC 100%)",
    bio: "Argentinian talent known for aggressive racing style and impressive rookie performances.",
    stats: [
      { key: "wins", value: "0" },
      { key: "podiums", value: "0" },
      { key: "poles", value: "0" },
    ],
  },

  {
    name: "ESTEBAN OCON",
    number: "31",
    country: "France",
    team: "Haas",
    image: "/images/drivers/esteban-ocon.png",
    color: "linear-gradient(135deg, #000000 0%, #B6BABD 50%, #FFFFFF 100%)",
    bio: "Race winner known for defensive driving, consistency, and strong wet-weather performances.",
    stats: [
      { key: "wins", value: "1" },
      { key: "podiums", value: "4" },
      { key: "poles", value: "0" },
    ],
  },

  {
    name: "OLIVER BEARMAN",
    number: "87",
    country: "United Kingdom",
    team: "Haas",
    image: "/images/drivers/oliver-bearman.png",
    color: "linear-gradient(135deg, #000000 0%, #B6BABD 50%, #FFFFFF 100%)",
    bio: "Young Ferrari academy driver with impressive debut performances and strong technical ability.",
    stats: [
      { key: "wins", value: "0" },
      { key: "podiums", value: "0" },
      { key: "poles", value: "0" },
    ],
  },

  {
    name: "LIAM LAWSON",
    number: "30",
    country: "New Zealand",
    team: "Racing Bulls",
    image: "/images/drivers/liam-lawson.png",
    color: "linear-gradient(135deg, #0B0B45 0%, #6692FF 50%, #FFFFFF 100%)",
    bio: "Aggressive New Zealand racer known for confidence under pressure and adaptability.",
    stats: [
      { key: "wins", value: "0" },
      { key: "podiums", value: "0" },
      { key: "poles", value: "0" },
    ],
  },

  {
    name: "ARVID LINDBLAD",
    number: "41",
    country: "United Kingdom",
    team: "Racing Bulls",
    image: "/images/drivers/arvid-lindblad.png",
    color: "linear-gradient(135deg, #0B0B45 0%, #6692FF 50%, #FFFFFF 100%)",
    bio: "Red Bull junior sensation and one of the youngest talents entering Formula 1.",
    stats: [
      { key: "wins", value: "0" },
      { key: "podiums", value: "0" },
      { key: "poles", value: "0" },
    ],
  },

  {
    name: "SERGIO PEREZ",
    number: "11",
    country: "Mexico",
    team: "Cadillac",
    image: "/images/drivers/sergio-perez.png",
    color: "linear-gradient(135deg, #050505 0%, #7C7C7C 50%, #FFFFFF 100%)",
    bio: "Veteran race winner famous for tyre management, street circuit strength, and strategic racing.",
    stats: [
      { key: "wins", value: "6" },
      { key: "podiums", value: "39" },
      { key: "poles", value: "3" },
    ],
  },

  {
    name: "VALTTERI BOTTAS",
    number: "77",
    country: "Finland",
    team: "Cadillac",
    image: "/images/drivers/valtteri-bottas.png",
    color: "linear-gradient(135deg, #050505 0%, #7C7C7C 50%, #FFFFFF 100%)",
    bio: "10-time Grand Prix winner known for qualifying speed and elite Mercedes-era performances.",
    stats: [
      { key: "wins", value: "10" },
      { key: "podiums", value: "67" },
      { key: "poles", value: "20" },
    ],
  },
];


function DriverPanel({ driver }: { driver: (typeof DRIVERS)[number] }) {
  const { t } = useLanguage()
  const statLabels: Record<string, string> = {
    wins: t.drivers.wins,
    podiums: t.drivers.podiums,
    poles: t.drivers.poles,
  }

  return (
    <article
      className="group relative h-[70vh] w-[82vw] shrink-0 overflow-hidden border border-border bg-card md:w-[38vw]"
      data-cursor="hover"
    >
      {/* Background lighting animates on hover */}
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-0 transition-all duration-700 group-hover:opacity-100"
            style={{
              background: driver.color,
              opacity: 0.25,
              filter: "blur(40px)",
              transform: "scale(1.2)",
            }}
          />

      

      {/* Giant number */}
      <span
        aria-hidden="true"
        className="absolute -right-4 -top-8 select-none font-black leading-none tracking-tighter text-foreground/[0.06] transition-all duration-700 group-hover:text-foreground/[0.12]"
        style={{ fontSize: 'clamp(10rem, 22vw, 20rem)',
                 WebkitTextStroke: "2px white",
          
         }}
      >
        {driver.number}
      </span>

      {/* bio

       <span
        aria-hidden="true"
        className="absolute left-0 top-0 select-none p-2 w-[50%] font-mono leading-none tracking-wider text-foreground/[0.06] transition-all duration-700 group-hover:text-primary"
        style={{ 
                
          
         }}
      >
        {driver.bio}
      </span>  */}

      {/* Portrait
      <img
        src={driver.image || '/placeholder.svg'}
        alt={`Portrait of ${driver.name}`}
        className="absolute inset-0 h-full w-full object-cover object-top opacity-80 transition-all duration-1000 ease-out group-hover:scale-105 group-hover:opacity-100"
      />  */}

      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

      {/* Info */}
      <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.4em]" style={{ color: driver.color }}>
          {driver.country} — {driver.team}
        </p>
        <h3 className="mt-2 text-4xl font-black leading-[0.9] tracking-tighter md:text-5xl">
          {driver.name}
        </h3>

        {/* Stats reveal on hover */}
        <div className="mt-4 grid max-h-0 grid-cols-3 gap-4 overflow-hidden opacity-0 transition-all duration-500 ease-out group-hover:max-h-40 group-hover:opacity-100">
          {driver.stats.map((stat) => (
            <div key={stat.key} className="border-l border-border pl-3">
              <p className="text-2xl font-black tabular-nums">{stat.value}</p>
              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
                {statLabels[stat.key]}
              </p>
            </div>
          ))}
          <p className="col-span-3 text-pretty text-sm font-extralight leading-relaxed text-muted-foreground">
            {t.drivers.highlights[driver.number as keyof typeof t.drivers.highlights]}
          </p>
        </div>
      </div>
    </article>
  )
}

export function Drivers() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref })
  const x = useTransform(scrollYProgress, [0, 1], ['2%', '-500%'])
  const titleOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0.15])
  const { t } = useLanguage()

  return (
    <section id="drivers" ref={ref} className="relative h-auto" aria-label="The drivers">
      <div className=" top-0 flex h-svh flex-col justify-center overflow-x-scroll no-scrollbar overflow-hidden">
        {/* Section marker */}
        <motion.div
          className="pointer-events-none absolute left-5 top-24 z-10 md:left-10"
          style={{ opacity: titleOpacity }}
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-speed">
            {t.drivers.tag}
          </p>
          <h2 className="mt-2 font-black leading-[0.85] tracking-tighter">
            <span className="block text-[12vw] md:text-[7vw]">{t.drivers.title1}</span>
            <span className="block text-[12vw] text-primary md:text-[7vw]">{t.drivers.title2}</span>
          </h2>
        </motion.div>

        {/* Horizontal track */}
        <motion.div className="flex items-center gap-6 pl-[38vw] md:gap-10" style={{ x }}>
          {DRIVERS.map((driver) => (
            <DriverPanel key={driver.number} driver={driver} />
          ))}
          {/* End card */}
          <div className="flex h-[70vh] w-[60vw] shrink-0 items-center justify-center md:w-[30vw]">
            <p className="text-balance text-center text-3xl font-extralight leading-tight text-muted-foreground md:text-4xl">
              {t.drivers.endCard}
              <br />
              <span className="font-black text-foreground">{t.drivers.endCardHighlight}</span>
            </p>
          </div>
        </motion.div>

        {/* Scroll direction hint */}
        <div className="absolute bottom-8 right-5 flex items-center gap-3 md:right-10" aria-hidden="true">
          <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
            {t.drivers.scrollHint}
          </span>
          <motion.span
            className="block h-px w-12 bg-primary"
            animate={{ scaleX: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </div>
    </section>
  )
}
