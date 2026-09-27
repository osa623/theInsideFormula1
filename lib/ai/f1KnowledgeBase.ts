import { ExhibitionCarKnowledge, SmartGuideZone } from './types'

export const EXHIBITION_CARS_KNOWLEDGE: Record<string, ExhibitionCarKnowledge> = {
  'senna-mp4-6': {
    id: 'senna-mp4-6',
    year: '1991',
    name: 'McLaren MP4/6 Honda V12',
    chassis: 'McLaren Carbon Fiber Composite Monocoque (designed by Neil Oatley)',
    engine: 'Honda RA121E 60° 3.5L Naturally Aspirated V12',
    power: '780 BHP @ 14,800 RPM',
    weight: '505 kg (Minimum Regulation Weight)',
    drivers: 'Ayrton Senna & Gerhard Berger',
    championshipResult: '1991 Formula 1 World Drivers Championship (Ayrton Senna) & Constructors Championship (McLaren-Honda)',
    technicalInnovations: 'Last manual H-pattern gearbox and V12 engine to win a Formula 1 World Championship; revolutionary Honda variable-length intake trumpets.',
    overview:
      'The McLaren MP4/6 is one of the most iconic racing machines in motorsport history. Driven by Ayrton Senna to his third and final World Drivers Championship in 1991, it won 8 Grands Prix and secured 10 pole positions. Its glorious, high-revving Honda 3.5L V12 produced an unforgettable symphonic roar.',
    audioGuide:
      'Standing before you is the historic 1991 McLaren MP4/6, powered by Honda’s legendary three-point-five liter naturally aspirated V12 engine. Ayrton Senna drove this masterpiece to eight victories and his third World Championship. It remains the final V12 and manual transmission car to ever claim the Formula One title.',
    suggestedQuestions: [
      'Who drove the McLaren MP4/6?',
      'What engine powered this car?',
      'How much horsepower did the 1991 Honda V12 produce?',
      'Why is the MP4/6 historically significant?',
    ],
  },
  '2017': {
    id: '2017',
    year: '2017',
    name: '2017 Formula 1 Technical Generation (Mercedes F1 W08 / Ferrari SF70H)',
    chassis: 'Moulded Carbon Fibre & Honeycomb Composite Structure (2,000mm wide track)',
    engine: '1.6L 90° V6 Turbocharged Hybrid with MGU-K & MGU-H',
    power: '950+ BHP (Combined ICE + ERS)',
    weight: '728 kg',
    drivers: 'Lewis Hamilton, Valtteri Bottas, Sebastian Vettel, Kimi Räikkönen',
    championshipResult: 'Constructors: Mercedes-AMG Petronas | Drivers: Lewis Hamilton',
    technicalInnovations: 'Massive aerodynamic regulation overhaul: wider 2-meter track, 25% wider Pirelli tyres, aggressive swept-back front wings, and T-wings.',
    overview:
      'The 2017 season marked the dawn of ultra-high downforce in modern F1. Cars became wider, lower, and dramatically faster, slicing up to 4-5 seconds per lap off previous records. Cornering speeds reached unprecedented lateral loads in excess of 5G.',
    audioGuide:
      'Welcome to the 2017 display. In 2017, Formula One overhauled technical regulations to make cars look aggressive and lap significantly faster. With wider tracks, broader tyres, and deep swept wings, lateral cornering loads routinely surpassed five Gs.',
    suggestedQuestions: [
      'What changed in the 2017 F1 regulations?',
      'How fast were 2017 F1 cars compared to 2016?',
      'Who won the 2017 World Championship?',
      'What engine did 2017 F1 cars use?',
    ],
  },
  '2018': {
    id: '2018',
    year: '2018',
    name: '2018 Formula 1 Generation (Mercedes F1 W09 / Ferrari SF71H)',
    chassis: 'Carbon Fibre Monocoque with Grade 5 Titanium Halo Cockpit Protection',
    engine: '1.6L V6 Turbo Hybrid (15,000 RPM maximum)',
    power: '980+ BHP',
    weight: '733 kg (increased by 5kg to accommodate Halo and mountings)',
    drivers: 'Lewis Hamilton, Sebastian Vettel, Max Verstappen, Daniel Ricciardo',
    championshipResult: 'Constructors: Mercedes-AMG Petronas | Drivers: Lewis Hamilton (5th title)',
    technicalInnovations: 'Mandatory introduction of the Halo cockpit safety system capable of supporting 12 tonnes of force (equivalent to two double-decker buses); hypersoft tyre compound.',
    overview:
      '2018 introduced the revolutionary Titanium Halo cockpit protection structure. Despite initial aesthetic debates, it quickly proved invaluable for driver safety. The season featured a fierce championship battle known as the "Fight for Five" between Lewis Hamilton and Sebastian Vettel.',
    audioGuide:
      'Here is the 2018 Formula One generation. This year marked the mandatory introduction of the titanium Halo cockpit protection system, engineered to withstand twelve tonnes of impact force. Lewis Hamilton clinched his fifth World Drivers Championship.',
    suggestedQuestions: [
      'How strong is the F1 Halo introduced in 2018?',
      'Who competed in the 2018 Fight for Five?',
      'What was the minimum weight of a 2018 F1 car?',
      'What engine power did 2018 hybrids achieve?',
    ],
  },
  '2019': {
    id: '2019',
    year: '2019',
    name: '2019 Formula 1 Generation (Mercedes-AMG F1 W10 EQ Power+)',
    chassis: 'Carbon Fibre Composite Monocoque with simplified 200mm wider front wing',
    engine: 'Mercedes-AMG M10 EQ Power+ 1.6L V6 Turbo Hybrid',
    power: '1,000+ BHP (Peak thermal efficiency surpassing 50%)',
    weight: '743 kg',
    drivers: 'Lewis Hamilton, Valtteri Bottas, Charles Leclerc, Max Verstappen',
    championshipResult: 'Constructors: Mercedes-AMG Petronas | Drivers: Lewis Hamilton (6th title)',
    technicalInnovations: 'Simplified front wing endplates to reduce dirty air outwash; 1000th Formula 1 World Championship Grand Prix celebrated in Shanghai; introduction of bonus point for Fastest Lap.',
    overview:
      'The 2019 season celebrated the 1,000th World Championship race in Formula 1 history. Mercedes delivered historic domination with the W10, claiming 15 wins and 10 pole positions. Engine thermal efficiency breached the 50% milestone, setting an all-time internal combustion benchmark.',
    audioGuide:
      'You are observing the 2019 Formula One car. In this historic season, Formula One celebrated its one-thousandth Grand Prix in China. The front wings were simplified to promote closer racing, and Mercedes-AMG’s power unit achieved an unprecedented fifty percent thermal efficiency.',
    suggestedQuestions: [
      'Who won the 1000th Formula 1 Grand Prix in 2019?',
      'What aerodynamic changes were made to 2019 front wings?',
      'What was the horsepower of the 2019 Mercedes power unit?',
      'Who drove for Ferrari in 2019?',
    ],
  },
  '2020': {
    id: '2020',
    year: '2020',
    name: '2020 Formula 1 Generation (Mercedes-AMG F1 W11 EQ Performance)',
    chassis: 'Advanced Carbon-Honeycomb Monocoque with Dual-Axis Steering (DAS)',
    engine: 'Mercedes-AMG M11 EQ Performance 1.6L V6 Turbo Hybrid',
    power: '1,025+ BHP',
    weight: '746 kg',
    drivers: 'Lewis Hamilton, Valtteri Bottas, Max Verstappen, Sergio Pérez',
    championshipResult: 'Constructors: Mercedes-AMG | Drivers: Lewis Hamilton (Equalized Michael Schumacher with 7 titles)',
    technicalInnovations: 'Dual-Axis Steering (DAS) allowing drivers to adjust front toe-angle on straightaways; all-time fastest lap records set across Monza, Silverstone, and Spa.',
    overview:
      'Widely regarded as the fastest racing car ever built in the history of human motorsport. The Mercedes W11 shattered lap records across the globe. At Monza, Lewis Hamilton completed the fastest lap in Formula 1 history with an average speed of 264.362 km/h (164.267 mph).',
    audioGuide:
      'Before you stands the 2020 generation, universally recognized as the fastest Formula One car in motorsport history. Armed with innovative Dual-Axis Steering and over one thousand horsepower, Lewis Hamilton set the all-time fastest lap at Monza at an average speed exceeding two hundred and sixty-four kilometers per hour.',
    suggestedQuestions: [
      'Why is the 2020 Mercedes W11 considered the fastest F1 car ever?',
      'How did Dual-Axis Steering (DAS) work?',
      'What was the fastest lap in F1 history set at Monza 2020?',
      'How many championships did Lewis Hamilton reach in 2020?',
    ],
  },
  '2021': {
    id: '2021',
    year: '2021',
    name: '2021 Formula 1 Generation (Red Bull RB16B / Mercedes W12)',
    chassis: 'Carbon-Composite Monocoque with revised triangular floor cutouts',
    engine: 'Honda RA621H / Mercedes-AMG M12 E Performance 1.6L V6 Turbo Hybrid',
    power: '1,030+ BHP',
    weight: '752 kg',
    drivers: 'Max Verstappen, Lewis Hamilton, Valtteri Bottas, Sergio Pérez',
    championshipResult: 'Drivers: Max Verstappen (Red Bull Racing) | Constructors: Mercedes-AMG',
    technicalInnovations: 'Regulated triangular floor cutout reducing downforce by ~10% for tyre safety; historic high-rake vs low-rake aerodynamic war.',
    overview:
      'The 2021 season hosted one of the most thrilling and dramatic championship duels in sporting history. Max Verstappen and Lewis Hamilton entered the season finale in Abu Dhabi tied on points. Max Verstappen clinched his maiden World Drivers Championship on the final lap.',
    audioGuide:
      'Here is the 2021 Formula One generation. This car represents one of the most dramatic title fights in sports history between Max Verstappen and Lewis Hamilton, entering the final round tied on points. Max Verstappen clinched his first World Championship on the final lap in Abu Dhabi.',
    suggestedQuestions: [
      'Who won the 2021 Formula 1 World Drivers Championship?',
      'What was the floor aerodynamic regulation change in 2021?',
      'What engine powered Red Bull Racing in 2021?',
      'How many points did Hamilton and Verstappen have entering Abu Dhabi 2021?',
    ],
  },
}

export const CARNIVAL_ZONES_KNOWLEDGE: Record<string, SmartGuideZone> = {
  exhibitionEntrance: {
    id: 'exhibitionEntrance',
    triggerName: 'holohraphic_main_01',
    title: 'Formula 1 Exhibition Hall',
    subtitle: 'Historic Grand Prix Championship Collection & AI Terminal',
    eyebrow: 'CARNIVAL PORTAL // EXHIBITION HALL',
    description:
      'Step inside the state-of-the-art virtual exhibition hall featuring Ayrton Senna’s 1991 McLaren MP4/6 and the turbo-hybrid golden era cars from 2017 to 2021. Includes interactive QR dossiers and the AI Exhibition Research Terminal.',
    audioNarration:
      'You are approaching the entrance to the Formula One Exhibition Hall. Step inside to discover Ayrton Senna’s iconic McLaren MP4/6 and Championship machines from 2017 to 2021, accompanied by interactive technical dossiers and the AI Exhibition Terminal. Press E to enter.',
    bullets: [
      'Ayrton Senna 1991 McLaren MP4/6 Honda V12',
      '2017 to 2021 Turbo-Hybrid Championship Cars',
      'Interactive QR technical dossiers for mobile inspection',
      'AI Exhibition Terminal with Observation Mode',
    ],
    suggestedQuestions: [
      'What cars are displayed inside the Exhibition Hall?',
      'Can I scan the QR codes on the car stands with my phone?',
      'What is the AI Exhibition Terminal?',
    ],
    actionPrompt: 'Press [E] to Enter Exhibition Hall',
    accentColor: '#e10600',
  },
  tyres: {
    id: 'tyres',
    triggerName: 'Symmbol.004',
    title: 'Formula 1 Tyre Technology',
    subtitle: 'Pirelli Compound Dynamics, Thermal Windows & Degradation',
    eyebrow: 'EDUCATIONAL ZONE // SYMBOL 004',
    description:
      'The four contact patches that connect 1,000 horsepower to the asphalt. Learn about Pirelli 18-inch low-profile tyres, compound working ranges from C1 to C5, thermal management, tyre degradation, and pit-stop strategy.',
    audioNarration:
      'Welcome to the Formula One Tyre Technology station. An F1 car relies on four contact patches barely larger than a smartphone footprint to transmit over one thousand horsepower. Discover Pirelli compound grades from C1 to C5, thermal working windows, and the physics of tyre degradation.',
    bullets: [
      'Pirelli 18-inch low-profile construction introduced in 2022',
      'Compounds range from C1 (Hardest) to C5 (Softest)',
      'Optimal tread surface temperature: 100°C to 110°C',
      'Tyre pressures carefully monitored via tire-pressure sensors (TPMS)',
    ],
    suggestedQuestions: [
      'Why are soft tyres faster than hard tyres?',
      'What is tyre blistering and graining in F1?',
      'What is an undercut vs an overcut pit stop strategy?',
      'What temperature do F1 tyres need to operate at?',
    ],
    accentColor: '#ffb000',
  },
  chassis: {
    id: 'chassis',
    triggerName: 'Symmbol.003',
    title: 'Chassis & Survival Cell Architecture',
    subtitle: 'Carbon Fiber Monocoque, Titanium Halo & Crash Loads',
    eyebrow: 'EDUCATIONAL ZONE // SYMBOL 003',
    description:
      'Explore aerospace-grade carbon fiber monocoque safety cell construction. Learn how pre-preg carbon weaves and aluminium honeycomb dissipate colossal 35G impact forces, and discover the 120 kN structural test requirements of the titanium Halo.',
    audioNarration:
      'This is the Chassis and Safety Cell station. The modern F1 survival cell is crafted from high-tensile carbon fiber and aluminium honeycomb, engineered to withstand fifty-G impacts while keeping the driver intact. The titanium Halo can support twelve tonnes of static load.',
    bullets: [
      'Autoclave-cured carbon fiber and Kevlar anti-intrusion panels',
      'Titanium Halo supports 120 kN (equivalent to 12 metric tonnes)',
      'Front Impact Structure (FIAS) provides controlled crash deceleration',
      'Minimum complete car weight regulation strictly maintained at 798 kg',
    ],
    suggestedQuestions: [
      'What is an F1 monocoque made of?',
      'How does the Halo protect Formula 1 drivers?',
      'How heavy is a modern Formula 1 chassis?',
      'What crash tests does the FIA mandate for F1 cars?',
    ],
    accentColor: '#00d2be',
  },
  tracks: {
    id: 'tracks',
    triggerName: 'Symmbol.002',
    title: 'Circuit Technology & Track Demands',
    subtitle: 'Asphalt Topography, Apex Speeds & Aerodynamic Setup',
    eyebrow: 'EDUCATIONAL ZONE // SYMBOL 002',
    description:
      'Examine the world’s greatest motorsport arenas. From high-speed temples like Monza and Spa to precision street circuits like Monaco and Singapore, discover how asphalt micro-roughness, elevation, and weather dictate car setups.',
    audioNarration:
      'You are at the Circuit Technology station. Every Grand Prix circuit poses unique challenges. Low-drag temples like Monza require minimal wing angles for top speeds over three hundred and fifty kilometers per hour, whereas Monaco demands maximum downforce for tight street corners.',
    bullets: [
      'High-downforce circuits (Monaco, Budapest) vs Low-drag (Monza, Baku)',
      'Asphalt friction index (macro vs micro texture affects tyre wear)',
      'DRS zones calibrated to produce ~18-22 km/h delta for overtaking',
      'Elevation changes up to 102 meters per lap at Circuit de Spa-Francorchamps',
    ],
    suggestedQuestions: [
      'How does circuit altitude affect F1 engines and downforce in Mexico?',
      'What is the difference between street circuits and permanent tracks?',
      'Why is Monza called the Temple of Speed?',
      'How does track temperature impact race pace and strategy?',
    ],
    accentColor: '#00f076',
  },
  formula: {
    id: 'formula',
    triggerName: 'Symmbol.001',
    title: 'Formula Racing Ecosystem & Regulations',
    subtitle: 'The Single-Seater Pyramid from Karting to Formula 1',
    eyebrow: 'EDUCATIONAL ZONE // SYMBOL 001',
    description:
      'The ladder to motorsport glory. Explore the FIA progression ladder from Karting to Formula 4, Formula Regional, Formula 3, Formula 2, and the pinnacle Formula 1. Discover the FIA Superlicense point system and financial cost cap rules.',
    audioNarration:
      'Welcome to the Formula Racing Ecosystem station. To reach Formula One, young drivers climb the FIA ladder through Formula Four, Formula Three, and Formula Two, accumulating forty Superlicense points across three seasons to earn the right to race at the pinnacle.',
    bullets: [
      'FIA Superlicense requires 40 points accumulated over 3 seasons',
      'Formula 2 feeder series features spec 620 HP Mechachrome V6 turbo cars',
      'Formula 1 budget cost cap introduced to promote competitive parity',
      '2026 Engine regulations split hybrid power 50% ICE and 50% Electric',
    ],
    suggestedQuestions: [
      'How does a driver earn an FIA Superlicense for Formula 1?',
      'What is the difference between Formula 2 and Formula 1 cars?',
      'What are the new 2026 Formula 1 engine regulations?',
      'What is the Formula 1 budget cost cap?',
    ],
    accentColor: '#e10600',
  },
  championship: {
    id: 'championship',
    triggerName: 'Racing_Champion_Section_path',
    title: 'F1 World Championship Archive (2000–2025)',
    subtitle: 'A Quarter-Century of Drivers & Constructors Champions',
    eyebrow: 'SECOND MAIN AREA // CHAMPIONSHIP SECTION',
    description:
      'Explore legendary World Champions across modern F1 eras: Michael Schumacher’s Ferrari dynasty, Fernando Alonso’s Renault crowns, Sebastian Vettel’s Red Bull streak, Lewis Hamilton’s Mercedes supremacy, and Max Verstappen’s dominant title runs.',
    audioNarration:
      'You have entered the Championship Section, commemorating Formula One World Champions from 2000 through 2025. Relive Michael Schumacher’s five consecutive titles with Ferrari, Sebastian Vettel’s reign with Red Bull, Lewis Hamilton’s seven championships, and Max Verstappen’s recent dominance.',
    bullets: [
      'Michael Schumacher: 5 consecutive titles with Ferrari (2000-2004)',
      'Sebastian Vettel: 4 consecutive titles with Red Bull (2010-2013)',
      'Lewis Hamilton: 6 titles with Mercedes (2014, 2015, 2017, 2018, 2019, 2020)',
      'Max Verstappen: 4 consecutive titles with Red Bull (2021-2024)',
    ],
    suggestedQuestions: [
      'Who won the 2019 F1 World Championship?',
      'Which drivers hold the record with 7 World Championships?',
      'How many consecutive championships did Red Bull and Mercedes win?',
      'Who is the youngest Formula 1 World Champion in history?',
    ],
    accentColor: '#ffd166',
  },
  exam: {
    id: 'exam',
    triggerName: 'Walking_Path_Racing_Exam',
    title: 'F1 Driving Academy Knowledge Exam',
    subtitle: '40-Question Technical & Regulatory Certification Quiz',
    eyebrow: 'SECOND MAIN AREA // KNOWLEDGE EXAM',
    description:
      'Test your motorsport mastery with the official 40-question F1 driving academy evaluation kiosk. Study the six technical boards covering aerodynamic downforce, flags, powertrain hybridization, and sporting regulations before taking the quiz.',
    audioNarration:
      'Welcome to the F1 Academy Exam Zone. Test your technical and regulatory racing knowledge across forty rigorous questions. Review the six study boards surrounding the kiosk to prepare for your certification exam.',
    bullets: [
      '6 Detailed Technical Study Boards on flags, aerodynamics & safety',
      '40-Question interactive certification kiosk',
      '30 questions derived from study boards + 10 general F1 trivia',
      'Instant grading and performance telemetry feedback',
    ],
    suggestedQuestions: [
      'What do all the F1 racing flags mean?',
      'What is the 107% qualifying rule in Formula 1?',
      'How does the FIA safety car restart protocol work?',
      'What are the penalties for exceeding track limits?',
    ],
    accentColor: '#a78bfa',
  },
  gaming: {
    id: 'gaming',
    triggerName: 'Real_Racing_Entering_Path',
    title: 'Interactive F1 Racing Experience',
    subtitle: 'Simulated Cockpit Driving & Apex Telemetry Trial',
    eyebrow: 'SECOND MAIN AREA // GAMING ZONE',
    description:
      'Step into the high-octane 2D F1 racing simulator stations. Test your steering response, braking thresholds, throttle modulation, and launch control.',
    audioNarration:
      'You are at the F1 Gaming Zone. Test your racing reflexes behind the wheel in the interactive racing simulation stations. Master braking markers, acceleration points, and hot lap consistency.',
    bullets: [
      'Interactive 2D Grand Prix racing stations',
      'Braking and throttle telemetry tracking',
      'Leaderboard hot-lap challenge trial',
    ],
    suggestedQuestions: [
      'How can I get the fastest lap in the racing game?',
      'What is trail braking in Formula 1?',
      'How do F1 drivers practice in simulators?',
    ],
    accentColor: '#00d4ff',
  },
}

/**
 * Intelligent local fallback responder when Gemini API key is not yet set or network fails.
 * Guarantees zero crashes and immediate, accurate F1 answers.
 */
export function getLocalF1KnowledgeResponse(prompt: string, context?: { currentCar?: string | null; section?: string | null }): string {
  const p = prompt.toLowerCase()

  // 1. Current car context responses
  if (context?.currentCar) {
    const carKey = context.currentCar.toLowerCase()
    const match =
      carKey.includes('senna') || carKey.includes('1991') || carKey.includes('mp4')
        ? EXHIBITION_CARS_KNOWLEDGE['senna-mp4-6']
        : EXHIBITION_CARS_KNOWLEDGE[context.currentCar] || Object.values(EXHIBITION_CARS_KNOWLEDGE).find(c => c.year === context.currentCar)

    if (match) {
      if (p.includes('engine') || p.includes('power') || p.includes('motor')) {
        return `The ${match.year} ${match.name} was powered by: ${match.engine}, delivering ${match.power}. Weight: ${match.weight}.`
      }
      if (p.includes('who') || p.includes('driver')) {
        return `The ${match.year} car was piloted by ${match.drivers}. Result: ${match.championshipResult}.`
      }
      if (p.includes('spec') || p.includes('weight') || p.includes('chassis')) {
        return `Technical Specifications for the ${match.year} ${match.name}:\n• Chassis: ${match.chassis}\n• Engine: ${match.engine} (${match.power})\n• Weight: ${match.weight}\n• Innovations: ${match.technicalInnovations}`
      }
      return `${match.overview}\n\nKey Highlights:\n• Engine: ${match.engine}\n• Power: ${match.power}\n• Drivers: ${match.drivers}\n• Result: ${match.championshipResult}`
    }
  }

  // 2. Specific F1 FAQ matchers
  if (p.includes('2019') && (p.includes('champion') || p.includes('who won'))) {
    return 'Lewis Hamilton won the 2019 Formula 1 World Drivers Championship driving for Mercedes-AMG Petronas, securing 413 points and 11 Grand Prix victories. Mercedes also won the 2019 Constructors Championship.'
  }

  if (p.includes('soft') && (p.includes('tyre') || p.includes('faster') || p.includes('tire'))) {
    return 'Soft tyres are faster because their rubber compound is engineered with high viscoelasticity, allowing the tyre to conform intimately into the microscopic crevices of the track asphalt. This creates immense adhesion and mechanical grip, enabling higher cornering speeds and shorter braking distances, though at the cost of rapid thermal degradation.'
  }

  if (p.includes('undercut') || p.includes('overcut')) {
    return 'The Undercut occurs when a chasing car pits a lap earlier for fresh tyres, utilizing the superior initial grip of new rubber to set an ultra-fast out-lap and pass the leading car when it subsequently pits. The Overcut is the reverse: staying out longer while the rival gets stuck in traffic or struggles on cold tyres, pushing hard in clean air before pitting.'
  }

  if (p.includes('drs') || p.includes('drag reduction')) {
    return 'DRS (Drag Reduction System) is a driver-controlled mechanism introduced in 2011 to promote overtaking. When within 1 second of the car ahead in a designated DRS zone, an actuator opens a flap in the rear wing, reducing aerodynamic drag by ~20-25% and boosting top speed by 10-22 km/h.'
  }

  if (p.includes('constructor') && p.includes('championship')) {
    return "The Formula 1 World Constructors' Championship is awarded to the team that scores the highest cumulative points across both of their cars over the season. It determines the official team title and forms the basis for commercial prize money distribution."
  }

  // 3. Current section context response
  if (context?.section && CARNIVAL_ZONES_KNOWLEDGE[context.section]) {
    const zone = CARNIVAL_ZONES_KNOWLEDGE[context.section]
    return `${zone.description}\n\nKey Information:\n${zone.bullets.map(b => `• ${b}`).join('\n')}`
  }

  // 4. Default high-quality F1 overview
  return (
    'Formula 1 is the pinnacle of international motorsport and automotive engineering. ' +
    'Governed by the FIA, teams design bespoke single-seater prototypes utilizing 1.6L turbocharged hybrid power units delivering over 1,000 horsepower, advanced carbon-composite monocoques, and precision aerodynamics.'
  )
}
