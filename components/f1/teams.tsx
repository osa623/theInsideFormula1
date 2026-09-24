'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { useLanguage } from '@/lib/language-context'
import { CountUp, LetterReveal } from './reveal'

const TEAMS = [
  {
    name: "SCUDERIA FERRARI",
    base: "Maranello, Italy",
    color: "#E8002D",
    car: "SF-26",
    engine: "Ferrari Power Unit",
    constructorChampionships: 16,
    driverChampionships: 15,
    drivers: ["Charles Leclerc", "Lewis Hamilton"],
    pace: [96, 94, 92, 97, 95],
  },

  {
    name: "MERCEDES-AMG PETRONAS",
    base: "Brackley, UK",
    color: "#00A19C",
    car: "W17",
    engine: "Mercedes Power Unit",
    constructorChampionships: 8,
    driverChampionships: 9,
    drivers: ["George Russell", "Kimi Antonelli"],
    pace: [93, 96, 91, 94, 95],
  },

  {
    name: "McLAREN RACING",
    base: "Woking, UK",
    color: "#FF8000",
    car: "MCL40",
    engine: "Mercedes Power Unit",
    constructorChampionships: 10,
    driverChampionships: 12,
    drivers: ["Lando Norris", "Oscar Piastri"],
    pace: [98, 96, 95, 97, 94],
  },

  {
    name: "ORACLE RED BULL RACING",
    base: "Milton Keynes, UK",
    color: "#3671C6",
    car: "RB22",
    engine: "Honda RBPT Power Unit",
    constructorChampionships: 6,
    driverChampionships: 8,
    drivers: ["Max Verstappen", "Isack Hadjar"],
    pace: [99, 97, 98, 96, 95],
  },

  {
    name: "ASTON MARTIN ARMCO F1 TEAM",
    base: "Silverstone, UK",
    color: "#229971",
    car: "AMR26",
    engine: "Mercedes Power Unit",
    constructorChampionships: 0,
    driverChampionships: 0,
    drivers: ["Fernando Alonso", "Lance Stroll"],
    pace: [88, 90, 87, 91, 89],
  },

  {
    name: "ALPINE F1 TEAM",
    base: "Enstone, UK",
    color: "#0093CC",
    car: "A526",
    engine: "Mercedes Power Unit",
    constructorChampionships: 2,
    driverChampionships: 2,
    drivers: ["Pierre Gasly", "Franco Colapinto"],
    pace: [86, 88, 85, 89, 87],
  },

  {
    name: "HAAS F1 TEAM",
    base: "Kannapolis, USA",
    color: "#B6BABD",
    car: "VF-26",
    engine: "Ferrari Power Unit",
    constructorChampionships: 0,
    driverChampionships: 0,
    drivers: ["Esteban Ocon", "Oliver Bearman"],
    pace: [82, 85, 83, 86, 84],
  },

  {
    name: "RACING BULLS",
    base: "Faenza, Italy",
    color: "#6692FF",
    car: "VCARB03",
    engine: "Honda RBPT Power Unit",
    constructorChampionships: 0,
    driverChampionships: 0,
    drivers: ["Liam Lawson", "Arvid Lindblad"],
    pace: [84, 87, 85, 88, 86],
  },

  {
    name: "WILLIAMS RACING",
    base: "Grove, UK",
    color: "#005AFF",
    car: "FW48",
    engine: "Mercedes Power Unit",
    constructorChampionships: 9,
    driverChampionships: 7,
    drivers: ["Carlos Sainz", "Alexander Albon"],
    pace: [87, 89, 86, 90, 88],
  },

  {
    name: "AUDI REVOLUT F1 TEAM",
    base: "Hinwil, Switzerland",
    color: "#E30613",
    car: "R26",
    engine: "Audi Power Unit",
    constructorChampionships: 0,
    driverChampionships: 0,
    drivers: ["Nico Hulkenberg", "Gabriel Bortoleto"],
    pace: [80, 83, 81, 84, 82],
  },

  {
    name: "CADILLAC FORMULA 1 TEAM",
    base: "Silverstone, UK",
    color: "#111111",
    car: "MAC-26",
    engine: "Ferrari Power Unit",
    constructorChampionships: 0,
    driverChampionships: 0,
    drivers: ["Sergio Perez", "Valtteri Bottas"],
    pace: [78, 80, 79, 81, 80],
  },
];

function PaceChart({ pace, color }: { pace: number[]; color: string }) {
  return (
    <div className="flex h-16 items-end gap-1.5" role="img" aria-label="Recent race pace chart">
      {pace.map((v, i) => (
        <motion.div
          key={i}
          className="w-full"
          style={{ backgroundColor: color }}
          initial={{ height: 0 }}
          animate={{ height: `${v}%` }}
          transition={{ delay: 0.15 + i * 0.07, duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
        />
      ))}
    </div>
  )
}

export function Teams() {
  const [open, setOpen] = useState<string | null>(TEAMS[0].name)
  const { t } = useLanguage()

  return (
    <section id="teams" className="carbon relative py-28 md:py-44" aria-label="The teams">
      {/* HUD frame lines */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-5 top-14 flex justify-between font-mono text-[9px] uppercase tracking-[0.4em] text-muted-foreground md:inset-x-10">
        <span>SYS // GARAGE_04</span>
        <span>TELEMETRY LIVE</span>
      </div>

      <div className="px-5 md:px-10">
        <header className="mb-16 md:mb-24">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.5em] text-speed">
            {t.teams.tag}
          </p>
          <h2 className="font-black leading-[0.85] tracking-tighter">
            <LetterReveal text={t.teams.title1} className="block text-[13vw] md:text-[8vw]" />
            <LetterReveal text={t.teams.title2} className="block text-[13vw] text-primary md:text-[8vw]" delay={0.2} />
          </h2>
        </header>

        <div className="flex flex-col border-t border-border">
          {TEAMS.map((team) => {
            const isOpen = open === team.name
            return (
              <div key={team.name} className="border-b border-border">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : team.name)}
                  aria-expanded={isOpen}
                  className="light-sweep group flex w-full items-center justify-between gap-4 py-6 text-left md:py-8"
                >
                  <div className="flex items-center gap-4 md:gap-8">
                    <span
                      aria-hidden="true"
                      className="block h-10 w-1 transition-all duration-500 group-hover:h-14"
                      style={{ backgroundColor: team.color }}
                    />
                    <div>
                      <h3 className="text-2xl font-black tracking-tight transition-colors md:text-5xl">
                        {team.name}
                      </h3>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                        {team.base}
                      </p>
                    </div>
                  </div>
                  <motion.span
                    className="font-mono text-2xl text-muted-foreground"
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.4 }}
                    aria-hidden="true"
                  >
                    +
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      key="panel"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-2 gap-8 pb-10 pl-5 md:grid-cols-4 md:pl-16">

                        <div>
                          <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-muted-foreground">
                            {t.teams.constructorChampionships}
                          </p>
                          <p className="mt-2 text-4xl font-black tabular-nums md:text-6xl">
                            <CountUp value={team.constructorChampionships} />
                          </p>
                        </div>
                        <div>
                          <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-muted-foreground">
                            {t.teams.driverChampionships}
                          </p>
                          <p className="mt-2 text-4xl font-black tabular-nums md:text-6xl">
                            <CountUp value={team.driverChampionships} />
                          </p>
                        </div>
                        <div>
                          <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-muted-foreground">
                            {t.teams.chassis}
                          </p>
                          <p className="mt-2 text-lg font-extralight md:text-xl">{team.car}</p>
                          <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-muted-foreground">
                            {t.teams.powerUnit}
                          </p>
                          <p className="mt-2 text-lg font-extralight md:text-xl">{team.engine}</p>
                          <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.4em] text-muted-foreground">
                            {t.teams.lineup}
                          </p>
                          <ul className="mt-1">
                            {team.drivers.map((d, i) => (
                              <motion.li
                                key={d}
                                className="text-sm font-extralight text-foreground"
                                initial={{ x: -16, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.2 + i * 0.1 }}
                              >
                                {d}
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.4em] text-muted-foreground">
                            {t.teams.racePace}
                          </p>
                          <PaceChart pace={team.pace} color={team.color} />
                        </div>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
