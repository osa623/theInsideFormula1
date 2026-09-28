import { AIContext } from './types'

export const F1_DOMAIN_REJECTION_MESSAGE =
  'That question is outside my scope. I can help you with Formula One information or guide you around this experience.'

export type QuestionCategory = 'LOCATION' | 'F1' | 'UNRELATED'

// Explicit Location and Wayfinding Patterns (Priority 1)
const LOCATION_PATTERNS = [
  // Current position queries
  /\bwhere\s+(am\s+i|i\s+am|are\s+we)\b/i,
  /\bwhat\s+(area|section|zone|place)\s+(am\s+i\s+in|is\s+this|are\s+we\s+in)\b/i,
  /\bwhat\s+is\s+this\s+(place|area|zone|section)\b/i,
  /\bwhat\s+area\s+is\s+this\b/i,
  /\bwhat\s+section\s+is\s+this\b/i,
  /\bwhat\s+zone\s+is\s+this\b/i,
  /\bwhat\s+is\s+this\b/i,
  /\bcurrent\s+location\b/i,
  /\bwhat\s+(can\s+i\s+(see|find)|is)\s+here\b/i,
  /\bwhat\s+is\s+near\s+(me|here)\b/i,
  /\bwhat\s+is\s+around\s+(me|here)\b/i,
  /\btell\s+me\s+about\s+this\s+(area|place|section|zone)\b/i,
  // Wayfinding & directions to carnival exhibits
  /\bwhere\s+(is|are|can\s+i\s+find)\s+(the\s+)?(educational\s+zone|education\s+zone|championship\s+section|champions\s+section|exhibition\s+hall|exhibition|museum|quiz|exam|kiosk|gaming\s+area|gaming|simulator|car\s+park|parking|racing\s+game|hall\s+of\s+champions|second\s+main\s+area)\b/i,
  /\bhow\s+do\s+i\s+(get\s+to|enter)\s+(the\s+)?(exhibition\s+hall|exhibition|educational\s+zone|championship\s+section|second\s+main\s+area|gaming\s+area|car\s+park)\b/i,
  /\bwhere\s+does\s+(this|the)\s+path\s+lead\b/i,
]

// Explicit Formula One Terminology, Drivers, Teams, Circuits & Technical Rules (Priority 2)
const F1_TERMS_REGEX =
  /\b(f1|formula\s*1|formula\s*one|grand\s*prix|gp|fia|championship|champion|drivers?|teams?|constructors?|paddock|grid|pole\s*position|podium|pit\s*stop|pitstop|undercut|overcut|drs|ers|mgu-k|mgu-h|turbo|hybrid|v6|v8|v10|v12|engine|power\s*unit|downforce|aerodynamics?|aero|monocoque|chassis|halo|diffuser|front\s*wing|rear\s*wing|slick|tyres?|tires?|compound|soft|medium|hard|intermediate|wet|pirelli|safety\s*car|virtual\s*safety\s*car|vsc|flags?|superlicense|telemetry|lap\s*time|apex|slipstream|tow|overtake|qualifying|q1|q2|q3|sprint|points|standings|dnf|stewards?|scuderia|ferrari|mercedes|red\s*bull|mclaren|aston\s*martin|alpine|williams|sauber|audi|haas|racing\s*bulls|alphatauri|toro\s*rosso|senna|prost|schumacher|hamilton|verstappen|vettel|alonso|leclerc|norris|piastri|russell|sainz|perez|gasly|ocon|albon|tsunoda|ricciardo|hulkenberg|bottas|magnussen|raikkonen|mansell|lauda|stewart|fangio|hunt|clark|monaco|silverstone|monza|spa|suzuka|interlagos|albert\s*park|melbourne|bahrain|sakhir|jeddah|miami|montreal|villeneuve|catalunya|barcelona|red\s*bull\s*ring|spielberg|hungaroring|budapest|zandvoort|madrid|baku|marinabay|singapore|austin|cota|mexico|las\s*vegas|lusail|qatar|yas\s*marina|abu\s*dhabi|das|dual\s*axis|sidepods?|ground\s*effect|porpoising|speed|brakes?|gearbox|clutch|trail\s*braking|w11|mp4|mp4\/6|f2|formula\s*2|formula\s*racing|motorsport|racing|temple\s*of\s*speed)\b/i

// Strict Non-F1 and Off-Topic Patterns (Priority 3)
const STRICT_NON_F1_PATTERNS = [
  /\b(weather|forecast|what\s+is\s+the\s+weather|temperature\s+outside|is\s+it\s+raining)\b/i,
  /\b(python|javascript|typescript|c\+\+|java\s+code|write\s+(a\s+)?code|write\s+(a\s+)?program|write\s+(a\s+)?script|html|css|sql|function\s*\(|def\s+[a-z_])\b/i,
  /\b(tell\s+me\s+a\s+joke|make\s+me\s+laugh|riddle|knock\s+knock)\b/i,
  /\b(exchange\s+rate|currency|bitcoin|crypto|stock\s+price|forex|ethereum|invest(ment)?\s+advice)\b/i,
  /\b(who\s+is\s+(the\s+)?president|prime\s+minister|election|politics|democrat|republican|parliament)\b/i,
  /\b(math(s)?\s+homework|solve\s+this\s+equation|calculus|derivative|integral|algebra|mathematics)\b/i,
  /\b(essay\s+about|write\s+an\s+essay|write\s+a\s+poem\s+about)\b/i,
  /\b(recipe\s+for|how\s+to\s+cook|bake\s+a\s+cake|chicken\s+soup|pasta\s+sauce|recipe)\b/i,
  /\b(medical\s+advice|symptoms\s+of|doctor|cure\s+for|headache|medicine)\b/i,
  /\b(capital\s+of\s+[a-z]+|population\s+of\s+[a-z]+)\b/i,
]

export class F1DomainGuard {
  /**
   * Classifies user question into one of three strict categories:
   * 1. 'LOCATION' - Current location or carnival wayfinding query
   * 2. 'F1' - Formula One knowledge, drivers, teams, technical regulations, cars
   * 3. 'UNRELATED' - General non-F1 questions, coding, weather, politics, jokes, etc.
   */
  public static classify(prompt: string, context?: AIContext): QuestionCategory {
    const cleanPrompt = prompt.trim()
    if (!cleanPrompt) return 'UNRELATED'

    // Priority 1 — Explicit Location Intent
    for (const pattern of LOCATION_PATTERNS) {
      if (pattern.test(cleanPrompt)) {
        return 'LOCATION'
      }
    }

    // Check for obvious non-F1 queries (e.g. weather, coding, joke, math)
    for (const pattern of STRICT_NON_F1_PATTERNS) {
      if (pattern.test(cleanPrompt)) {
        return 'UNRELATED'
      }
    }

    // Priority 2 — Explicit F1 Knowledge Intent
    if (F1_TERMS_REGEX.test(cleanPrompt)) {
      return 'F1'
    }

    // If standing in front of an exhibition car and asking deictic car questions
    if (context?.currentCar) {
      const isCarQuery = /\b(this|it|car|specs?|engine|power|weight|driver|who\s+drove|innovations?)\b/i.test(
        cleanPrompt
      )
      if (isCarQuery) {
        return 'F1'
      }
    }

    // Priority 3 — Unrelated / Off-topic
    return 'UNRELATED'
  }

  /**
   * Validates if a query belongs to the allowed domain (LOCATION or F1).
   */
  public static validate(
    prompt: string,
    context?: AIContext
  ): { isAllowed: boolean; category: QuestionCategory; rejectionReply?: string } {
    const category = F1DomainGuard.classify(prompt, context)

    if (category === 'LOCATION' || category === 'F1') {
      return { isAllowed: true, category }
    }

    return {
      isAllowed: false,
      category: 'UNRELATED',
      rejectionReply: F1_DOMAIN_REJECTION_MESSAGE,
    }
  }
}
