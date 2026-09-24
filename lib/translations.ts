export type Language = 'en' | 'si'

export const TRANSLATIONS = {
  en: {
    nav: {
      home: 'Home',
      stories: 'Stories',
      drivers: 'Drivers',
      teams: 'Teams',
      machine: 'Machine',
      calendar: 'Calendar',
      nextRace: 'Next race',
    },
    loader: {
      engineIgnition: 'Welcome to 2026 Virtual F1 Carnival',
    },
    herocaption: {
      title0: 'FORMULAONE',
      title1: 'THEPINNACLEOF',
      title2: 'MOTORSPORT',
      title3: '',
      title4: '',
      subtitle:
        "Twenty drivers. Ten teams. One thousand horsepower. This is not a website — it's a race.",
      startEngine: 'Start engine',
      theGrid: 'The grid',
      scroll: 'Scroll',
    },
    marquee1: [
      'SEASON 2026',
      'HYBRID POWER',
      '20 DRIVERS',
      '10 TEAMS',
      '24 RACES',
      '350 KM/H',
    ],
    hero: {
      tag: 'SEASON 2026 — LIGHTS OUT',
      title0: 'GET READY FOR',
      title1: 'THE PINNACLE OF',
      title2: 'MOTORSPORT',
      title3: 'THE GREATEST',
      title4: 'FORMULA1',
      subtitle:
        "Twenty drivers. Ten teams. One thousand horsepower. This is not a website — it's a race.",
      startEngine: 'Start engine',
      theGrid: 'The grid',
      scroll: 'Scroll',
    },
    Hero: {
      tag: 'Dispatches from the paddock',
      title1: 'ABOUT',
      title2: 'FORMULA1.',
      subtitle:
        'Dispatches from the paddock. Long reads, quick laps, and everything in between.',
      items: [
        {
          tag: 'Inside the garage',
          title: '1.9 seconds. The anatomy of a perfect pit stop.',
          excerpt:
            'Twenty-two hands, four tyres, one heartbeat. What happens when a Formula One crew stops time.',
          meta: '08 min read — Technical',
        },
        {
          tag: 'Race craft',
          title: 'Wheel to wheel at 300 km/h.',
          excerpt:
            'The psychology of the overtake, told by the drivers who live it.',
          meta: '12 min read — Feature',
        },
        {
          tag: 'The podium',
          title: 'Champagne, confetti, and the weight of a season.',
          excerpt:
            'Ninety seconds on the podium can justify nine months of pain.',
          meta: '06 min read — Editorial',
        },
      ],
    },
    stories: {
      tag: 'Dispatches from the paddock',
      title1: 'READ',
      title2: 'F-ARTICLES',
      subtitle:
        'Dispatches from the paddock. Long reads, quick laps, and everything in between.',
      items: [
        {
          tag: 'Inside the garage',
          title: '1.9 seconds. The anatomy of a perfect pit stop.',
          excerpt:
            'Twenty-two hands, four tyres, one heartbeat. What happens when a Formula One crew stops time.',
          meta: '08 min read — Technical',
        },
        {
          tag: 'Race craft',
          title: 'Wheel to wheel at 300 km/h.',
          excerpt:
            'The psychology of the overtake, told by the drivers who live it.',
          meta: '12 min read — Feature',
        },
        {
          tag: 'The podium',
          title: 'Champagne, confetti, and the weight of a season.',
          excerpt:
            'Ninety seconds on the podium can justify nine months of pain.',
          meta: '06 min read — Editorial',
        },
      ],
    },
    drivers: {
      tag: '02 — The paddock',
      title1: '2026',
      title2: 'GRID.',
      wins: 'Wins',
      podiums: 'Podiums',
      poles: 'Poles',
      highlights: {
        '01': 'Youngest double world champion in history.',
        '07': 'The qualifying king — five consecutive pole streaks.',
        '23': 'Master of the rain. Untouchable when the sky opens.',
        '44': 'The veteran. 300 starts, still the last of the late brakers.',
      },
      endCard: 'Twenty drivers.',
      endCardHighlight: 'One crown.',
      scrollHint: 'Keep scrolling',
    },
    teams: {
      tag: '03 — Constructors',
      title1: 'THE',
      title2: 'TEAMS.',
      chassis: 'Current Chassis',
      constructorChampionships: 'Constructor Championships',
      driverChampionships: 'Driver Championships',
      powerUnit: 'Power unit',
      lineup: 'Lineup',
      racePace: 'Race pace — last 5 GP',
    },
    machine: {
      tag: '04 — Engineering',
      title1: 'F1',
      title2: 'GARAGE',
      subtitle:
        'Every surface has a purpose. Explore the anatomy of a modern Formula One car — tap the markers.',
      hotspots: {
        aero: {
          label: 'Front aerodynamics',
          spec: 'Multi-element front wing generating 40% of total downforce. Flexes within 15mm tolerance at speed.',
          valueLabel: 'Downforce at 250 km/h',
        },
        suspension: {
          label: 'Suspension',
          spec: 'Push-rod actuated torsion bars with inerter damping. Ride height controlled to the millimetre.',
          valueLabel: 'Ride height tolerance',
        },
        power: {
          label: 'Power unit',
          spec: '1.6L V6 turbo-hybrid revving to 15,000 rpm. Thermal efficiency beyond any road engine ever built.',
          valueLabel: 'Combined output',
        },
        ers: {
          label: 'Energy recovery',
          spec: 'MGU-K harvests braking energy; deployment of 120 kW gives a 33-second boost every lap.',
          valueLabel: 'Electrical deployment',
        },
        drs: {
          label: 'DRS rear wing',
          spec: 'Drag reduction system opens a 85mm slot gap, shedding drag for +12 km/h on the straights.',
          valueLabel: 'Straight-line gain',
        },
        tyres: {
          label: 'Tyres',
          spec: 'Slick compounds operating at 100°C surface temperature. Grip equivalent to 5g of cornering force.',
          valueLabel: 'Peak lateral load',
        },
      },
    },
    calendar: {
      tag: '05 — The journey',
      title1: 'RACE',
      title2: 'CALENDAR.',
      laps: 'laps',
      countdown: {
        days: 'days',
        hrs: 'hrs',
        min: 'min',
      },
      weathers: {
        monaco: '24°C — Clear night',
        suzuka: '19°C — Morning mist',
        singapore: '31°C — Humid',
        silverstone: '14°C — Chance of rain',
      },
    },
    interludes: {
      precision: 'PRECISION.',
      power: 'POWER.',
      lightsOut: 'LIGHTS OUT.',
    },
    finale: {
      tag: 'Lights out in',
      title1: 'SEE YOU AT',
      title2: 'THE APEX.',
      subtitle:
        'Get race weekends, telemetry deep-dives, and paddock stories delivered at racing speed.',
      placeholder: 'your@email.com',
      join: 'Join',
      credit1: 'F1 Reimagined — A cinematic concept experience',
      credit2: 'Built for speed. 2026.',
    },
    posts: {
      heroTag: 'Season 2026 — Editorial',
      heroTitle1: 'LATEST F1',
      heroTitle2: 'STORIES.',
      heroSubtitle:
        'Explore race updates, driver stories, technical analysis, team news, and Formula One insights.',
      featuredBadge: 'Featured story',
      readArticle: 'Read article',
      searchPlaceholder: 'Search articles, drivers, teams...',
      categories: {
        all: 'All',
        news: 'News',
        raceReports: 'Race Reports',
        drivers: 'Drivers',
        teams: 'Teams',
        tech: 'Technology',
        analysis: 'Analysis',
      },
      noResults: 'No stories found matching your query.',
      readingTimeSuffix: 'min read',
      tableOfContents: 'Table of contents',
      share: 'Share story',
      copied: 'Copied!',
      copyLink: 'Copy link',
      author: 'Written by',
      published: 'Published on',
      relatedTitle1: 'RELATED',
      relatedTitle2: 'STORIES.',
      backToStories: 'Back to all stories',
    },
  },
  si: {
    nav: {
      home: 'මුල් පිටුව',
      stories: 'කතාන්දර',
      drivers: 'රියදුරන්',
      teams: 'කණ්ඩායම්',
      machine: 'යන්ත්‍රය',
      calendar: 'දින දර්ශනය',
      nextRace: 'ඊළඟ තරඟය',
    },
    loader: {
      engineIgnition: 'එන්ජිම පණගැන්වීම',
    },
    herocaption: {
      title0: 'FORMULAONE',
      title1: 'THEPINNACLEOF',
      title2: 'MOTORSPORT',
      title3: '',
      title4: '',
      subtitle:
        "Twenty drivers. Ten teams. One thousand horsepower. This is not a website — it's a race.",
      startEngine: 'Start engine',
      theGrid: 'The grid',
      scroll: 'Scroll',
    },
    hero: {
      tag: '2026 වාරය — ලයිට් නිවී යයි',
      title0: 'සූදානම් වන්න',
      title1: 'මෝටර් රථ',
      title2: 'ක්‍රීඩාවේ',
      title3: 'විශිෂ්ටතම',
      title4: 'FORMULA1',
      subtitle:
        'රියදුරන් විස්සයි. කණ්ඩායම් දහයයි. අශ්ව බල දහසයි. මෙය වෙබ් අඩවියක් නොවේ — මෙය තරඟයකි.',
      startEngine: 'එන්ජිම අරඹන්න',
      theGrid: 'ධාවන පථය',
      scroll: 'පහළට යන්න',
    },
    marquee1: [
      '2026 වාරය',
      'හයිබ්‍රිඩ් බලය',
      'රියදුරන් 20',
      'කණ්ඩායම් 10',
      'තරඟ 24',
      'පැ.කි. 350',
    ],
    Hero: {
      tag: 'පැඩොක් වෙතින් නවතම පුවත්',
      title1: 'නවතම',
      title2: 'කතාන්දර.',
      subtitle:
        'පැඩොක් වෙතින් නවතම පුවත්. දීර්ඝ ලිපි, වේගවත් වට සහ සියලුම තොරතුරු.',
      items: [
        {
          tag: 'ගරාජය තුළ',
          title: 'තත්පර 1.9 යි. නිවැරදි පිට් ස්ටොප් එකක රහස.',
          excerpt:
            'අත් විසිදෙකක්, රෝද හතරක්, එක් හෘද ස්පන්දනයක්. ෆෝමියුලා වන් කණ්ඩායමක් කාලය නතර කරන විට සිදුවන දේ.',
          meta: 'මිනිත්තු 08 යි — තාක්ෂණික',
        },
        {
          tag: 'ධාවන හැකියාව',
          title: 'පැයට කිලෝමීටර් 300 ක වේගයෙන් රෝදයෙන් රෝදය ගැටෙමින්.',
          excerpt:
            'ඉදිරියට යාමේ මනෝවිද්‍යාව, එය අත්විඳින රියදුරන් විසින්ම විස්තර කරයි.',
          meta: 'මිනිත්තු 12 යි — විශේෂාංගය',
        },
        {
          tag: 'ජයග්‍රාහී වේදිකාව',
          title: 'ෂැම්පේන්, කොන්ෆෙටි සහ වාරයක බර.',
          excerpt:
            'ජයග්‍රාහී වේදිකාවේ තත්පර අනූවක් වෙනුවෙන් මාස නවයක වේදනාව යුක්ති සහගත කළ හැකිය.',
          meta: 'මිනිත්තු 06 යි — කතුවැකිය',
        },
      ],
    },
    stories: {
      tag: 'පැඩොක් වෙතින් නවතම පුවත්',
      title1: 'නවතම',
      title2: 'කතාන්දර.',
      subtitle:
        'පැඩොක් වෙතින් නවතම පුවත්. දීර්ඝ ලිපි, වේගවත් වට සහ සියලුම තොරතුරු.',
      items: [
        {
          tag: 'ගරාජය තුළ',
          title: 'තත්පර 1.9 යි. නිවැරදි පිට් ස්ටොප් එකක රහස.',
          excerpt:
            'අත් විසිදෙකක්, රෝද හතරක්, එක් හෘද ස්පන්දනයක්. ෆෝමියුලා වන් කණ්ඩායමක් කාලය නතර කරන විට සිදුවන දේ.',
          meta: 'මිනිත්තු 08 යි — තාක්ෂණික',
        },
        {
          tag: 'ධාවන හැකියාව',
          title: 'පැයට කිලෝමීටර් 300 ක වේගයෙන් කරට කර.',
          excerpt:
            'සුපිරි පසුකර යාමක මනෝවිද්‍යාව, එය අත්විඳින රියදුරන්ගේ වචනයෙන්.',
          meta: 'මිනිත්තු 12 යි — විශේෂ',
        },
        {
          tag: 'ජයග්‍රාහී පීඨිකාව',
          title: 'ෂැම්පේන්, කොන්ෆෙටි සහ වාරයක කැපවීම.',
          excerpt:
            'පීඨිකාවේ ගතවන තත්පර අනූව මාස නවයක කැපවීම සාධාරණීකරණය කරයි.',
          meta: 'මිනිත්තු 06 යි — කර්තෘ',
        },
      ],
    },
    drivers: {
      tag: '02 — පැඩොක් එක',
      title1: 'ධාවන',
      title2: 'පථය.',
      wins: 'ජයග්‍රහණ',
      podiums: 'පීඨිකා',
      poles: 'පෝල් ස්ථාන',
      highlights: {
        '01': 'ඉතිහාසයේ ලාබාලතම දෙවතාවක් ලෝක ශූරයා.',
        '07': 'සුදුසුකම් ලැබීමේ රජු — පෝල් ස්ථාන පහක් පේළියට.',
        '23': 'වැස්සේ රජු. අහස අඳුරු වන විට පරාජය කළ නොහැක.',
        '44': 'ප්‍රවීණයා. තරඟ 300 යි, තවමත් අවසානය තෙක් බ්‍රේක් නොගහන ධාවකයා.',
      },
      endCard: 'රියදුරන් විස්සයි.',
      endCardHighlight: 'එක් කිරුළයි.',
      scrollHint: 'තවත් පහළට යන්න',
    },
    teams: {
      tag: '03 — නිෂ්පාදකයින්',
      title1: 'පැඩොක්',
      title2: 'ගරාජය.',
      chassis: 'Current Chassis',
      constructorChampionships: 'Constructor Championships',
      driverChampionships: 'Driver Championships',
      powerUnit: 'බල ඒකකය',
      lineup: 'ධාවකයින්',
      racePace: 'ධාවන වේගය — අවසන් තරඟ 5',
    },
    machine: {
      tag: '04 — ඉංජිනේරු විද්‍යාව',
      title1: 'සුපිරි',
      title2: 'යන්ත්‍රය.',
      subtitle:
        'සෑම මතුපිටකටම අරමුණක් ඇත. නූතන ෆෝමියුලා වන් රථයක නිර්මාණය අධ්‍යයනය කරන්න — සලකුණු තට්ටු කරන්න.',
      hotspots: {
        aero: {
          label: 'ඉදිරි වායුගතික විද්‍යාව',
          spec: 'මුළු පහළ බලයෙන් 40% ක් ජනනය කරන ඉදිරි පියාපත. වේගයේදී මි.මී. 15 ක නම්‍යශීලීතාවයක් දක්වයි.',
          valueLabel: 'පැ.කි. 250 දී පහළ බලය',
        },
        suspension: {
          label: 'සස්පෙන්ෂන් පද්ධතිය',
          spec: 'මිලිමීටරයට පාලනය වන ධාවන උස සහිත උසස් සස්පෙන්ෂන් පද්ධතිය.',
          valueLabel: 'ධාවන උස නම්‍යතාවය',
        },
        power: {
          label: 'බල ඒකකය',
          spec: 'ආර්.පී.එම්. 15,000 දක්වා කැරකෙන ලීටර් 1.6 V6 ටර්බෝ-හයිබ්‍රිඩ් එන්ජිම.',
          valueLabel: 'එකතු කළ බලය',
        },
        ers: {
          label: 'බලශක්ති නැවත ලබාගැනීම',
          spec: 'තිරිංග යෙදීමේදී ශක්තිය එක්රැස් කර සෑම වටයකම තත්පර 33 ක අමතර බලයක් ලබා දෙයි.',
          valueLabel: 'විදුලි බලය මුදාහැරීම',
        },
        drs: {
          label: 'DRS පසුපස පියාපත',
          spec: 'ඍජු පථයන්හිදී පැයට කිලෝමීටර් 12 ක අමතර වේගයක් ලබා දෙන DRS පද්ධතිය.',
          valueLabel: 'ඍජු පථයේ ලබාගන්නා වේගය',
        },
        tyres: {
          label: 'ටයර් පද්ධතිය',
          spec: 'සෙල්සියස් අංශක 100 ක උෂ්ණත්වයක ක්‍රියාත්මක වන 5g බලයක් සහිත ටයර්.',
          valueLabel: 'උපරිම පාර්ශ්වික බර',
        },
      },
    },
    calendar: {
      tag: '05 — ගමනාන්තය',
      title1: 'තරඟ',
      title2: 'දින දර්ශනය.',
      laps: 'වට',
      countdown: {
        days: 'දින',
        hrs: 'පැය',
        min: 'මිනි',
      },
      weathers: {
        monaco: '24°C — පැහැදිලි රාත්‍රිය',
        suzuka: '19°C — උදෑසන මීදුම',
        singapore: '31°C — තෙතමනය සහිත',
        silverstone: '14°C — වැසි සහිත',
      },
    },
    interludes: {
      precision: 'සුපරීක්ෂාකාරීත්වය.',
      power: 'බලය.',
      lightsOut: 'ලයිට් නිවී යයි.',
    },
    finale: {
      tag: 'ලයිට් නිවී යාමට',
      title1: 'අවසන් මහා',
      title2: 'තරඟයෙන් හමුවෙමු.',
      subtitle:
        'තරඟ සතිඅන්ත, තාක්ෂණික තොරතුරු සහ පැඩොක් පුවත් ඉක්මනින් ලබා ගන්න.',
      placeholder: 'your@email.com',
      join: 'එක්වන්න',
      credit1: 'F1 Reimagined — සිනමාටික් අත්දැකීමක්',
      credit2: 'වේගය උදෙසාම නිර්මාණය විය. 2026.',
    },
    posts: {
      heroTag: '2026 වාරය — පුවත්පත් අංශය',
      heroTitle1: 'නවතම F1',
      heroTitle2: 'කතාන්දර.',
      heroSubtitle:
        'තරඟ තොරතුරු, රියදුරු පුවත්, තාක්ෂණික විශ්ලේෂණ සහ පැඩොක් තොරතුරු ගවේෂණය කරන්න.',
      featuredBadge: 'විශේෂාංග ලිපිය',
      readArticle: 'ලිපිය කියවන්න',
      searchPlaceholder: 'ලිපි, රියදුරන්, කණ්ඩායම් සොයන්න...',
      categories: {
        all: 'සියල්ල',
        news: 'පුවත්',
        raceReports: 'තරඟ වාර්තා',
        drivers: 'රියදුරන්',
        teams: 'කණ්ඩායම්',
        tech: 'තාක්ෂණය',
        analysis: 'විශ්ලේෂණ',
      },
      noResults: 'ඔබ සෙවූ පුවත් සොයාගත නොහැකි විය.',
      readingTimeSuffix: 'මිනිත්තු කියවීමක්',
      tableOfContents: 'පටුන',
      share: 'ලිපිය බෙදාගන්න',
      copied: 'පිටපත් විය!',
      copyLink: 'ලිංක් එක පිටපත් කරන්න',
      author: 'කර්තෘ',
      published: 'ප්‍රකාශිත දිනය',
      relatedTitle1: 'සම්බන්ධිත',
      relatedTitle2: 'කතාන්දර.',
      backToStories: 'සියලුම කතාන්දර වෙත',
    },
  },
}
