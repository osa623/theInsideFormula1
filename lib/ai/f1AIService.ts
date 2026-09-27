import { F1DomainGuard } from './f1DomainGuard'
import { AIChatRequest, AIChatResponse, AIContext } from './types'

export class F1AIService {
  private static instance: F1AIService | null = null

  public static getInstance(): F1AIService {
    if (!F1AIService.instance) {
      F1AIService.instance = new F1AIService()
    }
    return F1AIService.instance
  }

  /**
   * Ask the F1 AI Core a question with rich situational context.
   */
  public async ask(
    prompt: string,
    context?: AIContext,
    history?: { role: 'user' | 'assistant'; content: string }[]
  ): Promise<AIChatResponse> {
    const cleanPrompt = prompt.trim()
    if (!cleanPrompt) {
      return {
        reply: 'Please ask an F1 or exhibition question.',
        isF1Related: false,
        source: 'domain_guard',
      }
    }

    // ── Layer 1: Client Pre-validation ──
    const validation = F1DomainGuard.validate(cleanPrompt, context)
    if (!validation.isAllowed) {
      return {
        reply: validation.rejectionReply || "I'm here to help with Formula 1 and information related to this exhibition. Please ask me an F1-related question.",
        isF1Related: false,
        source: 'domain_guard',
      }
    }

    // ── Post to server proxy route ──
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: cleanPrompt,
          context,
          history,
        } as AIChatRequest),
      })

      if (!res.ok) {
        throw new Error(`API returned HTTP ${res.status}`)
      }

      const data: AIChatResponse = await res.json()
      return data
    } catch (err: any) {
      console.warn('[F1AIService] Network request failed, returning client fallback: ', err)
      return {
        reply:
          'Formula 1 single-seater prototypes operate at the cutting edge of engineering. ' +
          'If you need specific data on the displayed cars, please explore the exhibition stands or ask about our 1991, 2017, 2018, 2019, 2020, and 2021 machines.',
        isF1Related: true,
        source: 'knowledge_base',
      }
    }
  }
}

export const f1AIService = F1AIService.getInstance()
