import { AIContext } from './types'

export const F1_DOMAIN_REJECTION_MESSAGE =
  "I'm here to help with Formula 1 and information related to this exhibition. Please ask me an F1-related question."

// Broad list of F1 terms, drivers, teams, circuits, and technical terminology
const F1_TERMS_REGEX =
  /\b(f1|formula\s*1|formula\s*one|grand\s*prix|gp|fia|championship|driver|team|constructor|paddock|grid|pole\s*position|podium|pit\s*stop|pitstop|undercut|overcut|drs|ers|mgu-k|mgu-h|turbo|hybrid|v6|v8|v10|v12|engine|power\s*unit|downforce|aerodynamics?|aero|monocoque|chassis|halo|diffuser|front\s*wing|rear\s*wing|slick|tyres?|tires?|compound|soft|medium|hard|intermediate|wet|pirelli|safety\s*car|virtual\s*safety\s*car|vsc|flag|superlicense|telemetry|lap\s*time|apex|slipstream|tow|overtake|qualifying|q1|q2|q3|sprint|points|standings|dnf|steward|scuderia|ferrari|mercedes|red\s*bull|mclaren|aston\s*martin|alpine|williams|sauber|audi|haas|racing\s*bulls|alphatauri|toro\s*rosso|senna|prost|schumacher|hamilton|verstappen|vettel|alonso|leclerc|norris|piastri|russell|sainz|perez|gasly|ocon|albon|tsunoda|ricciardo|hulkenberg|bottas|magnussen|raikkonen|mansell|lauda|stewart|fangio|hunt|clark|monaco|silverstone|monza|spa|suzuka|interlagos|albert\s*park|melbourne|bahrain|sakhir|jeddah|miami|montreal|villeneuve|catalunya|barcelona|red\s*bull\s*ring|spielberg|hungaroring|budapest|zandvoort|madrid|baku|marinabay|singapore|austin|cota|mexico|las\s*vegas|lusail|qatar|yas\s*marina|abu\s*dhabi|carnival|exhibition|das|dual\s*axis|sidepod|ground\s*effect|porpoising|weight|speed|brake|gearbox|clutch)\b/i

// Clear non-F1 indicators that must be intercepted before making API requests
const STRICT_NON_F1_PATTERNS = [
  /\b(weather\s+today|forecast|what\s+is\s+the\s+weather|temperature\s+outside)\b/i,
  /\b(python|javascript|typescript|c\+\+|java\s+code|write\s+(a\s+)?code|write\s+(a\s+)?script|html|css|sql|function\s*\(|def\s+[a-z_])\b/i,
  /\b(tell\s+me\s+a\s+joke|make\s+me\s+laugh|riddle|knock\s+knock)\b/i,
  /\b(exchange\s+rate|currency|bitcoin|crypto|stock\s+price|forex|ethereum|invest(ment)?\s+advice)\b/i,
  /\b(who\s+is\s+(the\s+)?president|prime\s+minister|election|politics|democrat|republican|parliament)\b/i,
  /\b(math(s)?\s+homework|solve\s+this\s+equation|calculus|derivative|integral|algebra)\b/i,
  /\b(essay\s+about\s+(cats|dogs|animals|school|pollution)|write\s+an\s+essay|write\s+a\s+poem\s+about)\b/i,
  /\b(recipe\s+for|how\s+to\s+cook|bake\s+a\s+cake|chicken\s+soup|pasta\s+sauce)\b/i,
  /\b(medical\s+advice|symptoms\s+of|doctor|cure\s+for|headache|medicine)\b/i,
]

export class F1DomainGuard {
  /**
   * Fast local pre-check to verify if a query belongs to the Formula 1 domain.
   * If a context (e.g., currentCar or section) is active, deictic questions like
   * "Tell me about this car" or "What engine did it use?" are automatically allowed.
   */
  public static validate(
    prompt: string,
    context?: AIContext
  ): { isAllowed: boolean; rejectionReply?: string } {
    const cleanPrompt = prompt.trim()
    if (!cleanPrompt) {
      return {
        isAllowed: false,
        rejectionReply: 'Please ask a question about Formula 1 or this exhibition.',
      }
    }

    // 1. Check for blatant off-topic patterns
    for (const pattern of STRICT_NON_F1_PATTERNS) {
      if (pattern.test(cleanPrompt)) {
        return {
          isAllowed: false,
          rejectionReply: F1_DOMAIN_REJECTION_MESSAGE,
        }
      }
    }

    // 2. If the user is in context (e.g. at an Exhibition car or Carnival section),
    // allow contextual / deictic references such as "this car", "it", "who drove", "specs", "engine"
    if (context && (context.currentCar || context.section || context.location)) {
      const isContextualQuery =
        /\b(this|it|car|here|specs?|engine|power|weight|driver|chassis|team|explain|tell\s*me|who|what|why|how|learn\s*more|more\s*info)\b/i.test(
          cleanPrompt
        )
      if (isContextualQuery) {
        return { isAllowed: true }
      }
    }

    // 3. Check for presence of Formula 1 terminology
    if (F1_TERMS_REGEX.test(cleanPrompt)) {
      return { isAllowed: true }
    }

    // 4. Fallback: If very short query with generic words, redirect to F1
    return {
      isAllowed: false,
      rejectionReply: F1_DOMAIN_REJECTION_MESSAGE,
    }
  }
}
