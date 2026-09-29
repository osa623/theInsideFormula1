import { NextRequest, NextResponse } from 'next/server'
import { F1DomainGuard, F1_DOMAIN_REJECTION_MESSAGE } from '@/lib/ai/f1DomainGuard'
import {
  getLocalF1KnowledgeResponse,
  EXHIBITION_CARS_KNOWLEDGE,
  resolveLocationQuery,
} from '@/lib/ai/f1KnowledgeBase'
import { AIChatRequest, AIChatResponse } from '@/lib/ai/types'
import { webSearchService } from '@/lib/ai/search/WebSearchService'
import { searchCache } from '@/lib/ai/search/SearchCache'
import { SearchResult } from '@/lib/ai/search/types'

/**
 * Checks whether an Exhibition Hall inquiry can be answered reliably from local exhibition knowledge.
 * If true, local context is sufficient. If false, external web search should be triggered.
 */
function isLocalExhibitionKnowledgeSufficient(
  prompt: string,
  context?: { currentCar?: string | null }
): boolean {
  const p = prompt.toLowerCase()

  // 1. If user is in front of an exhibition car and asking direct spec/driver questions about that car
  if (context?.currentCar) {
    const isDirectCarSpecQuery =
      /\b(this|it|the car|specs?|engine|power|weight|driver|who drove|innovations?|chassis)\b/i.test(p)
    if (isDirectCarSpecQuery) return true
  }

  // 2. Specific questions about the 6 exhibition cars that have full local records
  const isStaticCarSpec =
    /\b(mp4|mp4\/6|senna.*car|1991.*mclaren|w11.*engine|w11.*power|das.*steering)\b/i.test(p) &&
    !/\b(20\d\d|19\d\d|recent|latest|news|contract|transfer|standings|schedule|calendar|race result|who won|champion|title)\b/i.test(p)

  if (isStaticCarSpec) return true

  // 3. Current calendar, live championship standings, historical champions, race results, or modern F1 questions require web search
  return false
}

export async function POST(req: NextRequest) {
  try {
    const body: AIChatRequest = await req.json()
    const { prompt, context, history } = body

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { reply: 'Please provide a valid question.', isF1Related: false, source: 'domain_guard' } as AIChatResponse,
        { status: 400 }
      )
    }

    // ── Layer 1: Intent Classification & F1 Domain Validation ──
    const validation = F1DomainGuard.validate(prompt, context)
    if (!validation.isAllowed) {
      return NextResponse.json({
        reply: validation.rejectionReply || F1_DOMAIN_REJECTION_MESSAGE,
        isF1Related: false,
        source: 'domain_guard',
      } as AIChatResponse)
    }

    // ── Priority 1: Category A — Location & Wayfinding Queries ──
    if (validation.category === 'LOCATION') {
      const locationAnswer = resolveLocationQuery(context, prompt)
      return NextResponse.json({
        reply: locationAnswer,
        isF1Related: true,
        source: 'knowledge_base',
        contextUsed: {
          location: context?.currentLocation || context?.location,
          currentCar: context?.currentCar,
          section: context?.currentSection || context?.section,
        },
      } as AIChatResponse)
    }

    // ── Priority 2: Category B — Formula One Knowledge Queries ──
    const isExhibitionMode = context?.mode === 'exhibition'
    let exhibitionSearchResults: SearchResult[] = []
    let searchGroundingPrompt = ''

    // FEATURE 1: Web search capability for the Exhibition Hall AI Screen
    // FLOW: get question -> not in local knowledge -> find answer from internet (Wikipedia) -> summarize and display
    if (isExhibitionMode) {
      const canUseLocalKnowledge = isLocalExhibitionKnowledgeSufficient(prompt, context)

      if (!canUseLocalKnowledge) {
        // 1. Check cache first
        const cached = searchCache.get(prompt)
        if (cached && cached.length > 0) {
          exhibitionSearchResults = cached
        } else {
          // 2. Perform live web search (Wikipedia + DuckDuckGo + Google)
          try {
            exhibitionSearchResults = await webSearchService.search(prompt, 4)
            if (exhibitionSearchResults.length > 0) {
              searchCache.set(prompt, exhibitionSearchResults)
            }
          } catch (err: any) {
            console.warn('[Exhibition WebSearch] Search failed:', err?.message)
          }
        }

        if (exhibitionSearchResults.length > 0) {
          searchGroundingPrompt = webSearchService.formatForPrompt(exhibitionSearchResults)
        }
      }
    }

    // Check API Keys (OpenAI preferred or Gemini)
    const openaiApiKey = process.env.OPENAI_API_KEY
    const isOpenAiConfigured = Boolean(
      openaiApiKey &&
      openaiApiKey !== 'YOUR_OPENAI_API_KEY_HERE' &&
      openaiApiKey.trim().length > 10
    )

    const geminiApiKey = process.env.GEMINI_API_KEY
    const isGeminiConfigured = Boolean(
      geminiApiKey &&
      geminiApiKey !== 'YOUR_GEMINI_API_KEY_HERE' &&
      geminiApiKey.trim().length > 10
    )

    // Contextual summary for grounding
    let contextPromptAddition = ''
    if (context?.currentCar) {
      const carKey = context.currentCar.toLowerCase()
      const match =
        carKey.includes('senna') || carKey.includes('1991') || carKey.includes('mp4')
          ? EXHIBITION_CARS_KNOWLEDGE['senna-mp4-6']
          : EXHIBITION_CARS_KNOWLEDGE[context.currentCar] ||
            Object.values(EXHIBITION_CARS_KNOWLEDGE).find((c) => c.year === context.currentCar)

      if (match) {
        contextPromptAddition += `\n[EXHIBITION CONTEXT: The user is currently standing directly in front of the ${match.year} ${match.name}. Specs: Engine: ${match.engine}, Power: ${match.power}, Weight: ${match.weight}, Drivers: ${match.drivers}, Result: ${match.championshipResult}, Innovations: ${match.technicalInnovations}. If the user says 'this car' or 'it', they refer directly to this machine.]\n`
      }
    }

    if (searchGroundingPrompt) {
      contextPromptAddition += `\n${searchGroundingPrompt}\n`
    }

    const systemInstructionText = isExhibitionMode
      ? 'You are a Formula 1 knowledge assistant. ' +
        'Provide a direct, factually accurate answer to the user\'s question. ' +
        'Respond in 2 to 3 sentences. Do not include any meta-commentary, formatting instructions, or constraint checks in your response. ' +
        (searchGroundingPrompt
          ? 'Base your answer on the following verified web search results and summarize the key facts clearly. '
          : '') +
        'If the question is not about Formula 1 or motorsport, reply with: "That question is outside my scope. I can help you with Formula One information or guide you around this experience." ' +
        contextPromptAddition
      : 'You are a Formula 1 knowledge assistant for "The Inside Formula One" experience. ' +
        'Answer Formula 1 questions directly and concisely. Respond in 2 to 3 sentences. ' +
        'Answer the user\'s actual question — never replace an F1 answer with a location description. ' +
        'If the question is not about Formula 1 or motorsport, reply with: "That question is outside my scope. I can help you with Formula One information or guide you around this experience." ' +
        contextPromptAddition

    // Format sources to return to client if web search was used
    const returnedSources = exhibitionSearchResults.map((r) => ({
      title: r.title,
      url: r.url,
      domain: r.domain,
    }))

    // ── Attempt OpenAI API Integration ──
    if (isOpenAiConfigured) {
      try {
        const openaiMessages: Array<{ role: string; content: string }> = [
          { role: 'system', content: systemInstructionText },
        ]

        if (Array.isArray(history) && history.length > 0) {
          history.slice(-4).forEach((h) => {
            openaiMessages.push({
              role: h.role === 'assistant' ? 'assistant' : 'user',
              content: h.content,
            })
          })
        }

        openaiMessages.push({ role: 'user', content: prompt })

        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), 9000)

        const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiApiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: openaiMessages,
            temperature: 0.35,
            max_tokens: 350,
          }),
          signal: controller.signal,
        })
        clearTimeout(timer)

        if (openaiRes.ok) {
          const openaiData = await openaiRes.json()
          const candidateText = openaiData?.choices?.[0]?.message?.content?.trim()
          if (candidateText) {
            return NextResponse.json({
              reply: candidateText,
              isF1Related: true,
              source: 'openai',
              sources: returnedSources.length > 0 ? returnedSources : undefined,
              contextUsed: {
                location: context?.currentLocation || context?.location,
                currentCar: context?.currentCar,
                section: context?.currentSection || context?.section,
              },
            } as AIChatResponse)
          }
        }
      } catch (openAiErr: any) {
        console.warn('[OpenAI API] Request error or timeout: ', openAiErr?.message)
      }
    }

    // ── Attempt Gemini API Integration (with model cascade) ──
    if (isGeminiConfigured) {
      const candidateModels = [
        'gemini-3.5-flash',
        'gemini-3.5-flash-lite',
        'gemini-3.8-flash',
      ]

      const contents: Array<{ role: string; parts: Array<{ text: string }> }> = []

      if (Array.isArray(history) && history.length > 0) {
        history.slice(-4).forEach((h) => {
          contents.push({
            role: h.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: h.content }],
          })
        })
      }

      contents.push({
        role: 'user',
        parts: [{ text: prompt }],
      })

      for (const modelName of candidateModels) {
        try {
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiApiKey}`

          const controller = new AbortController()
          const timer = setTimeout(() => controller.abort(), 7000)

          const geminiRes = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents,
              systemInstruction: {
                parts: [{ text: systemInstructionText }],
              },
              generationConfig: {
                temperature: 0.25,
                topK: 40,
                topP: 0.9,
                maxOutputTokens: 350,
              },
            }),
            signal: controller.signal,
          })
          clearTimeout(timer)

          if (geminiRes.ok) {
            const geminiData = await geminiRes.json()
            const candidateText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
            if (candidateText && candidateText.length > 20) {
              // Quality gate: reject meta-commentary responses from Gemini
              const isMetaGarbage =
                /^(check constraints|format:|note:|here is|i need to|let me|as an ai)/i.test(candidateText) ||
                candidateText.includes('1-2 paragraphs') ||
                candidateText.includes('2-3 sentences')
              if (!isMetaGarbage) {
                return NextResponse.json({
                  reply: candidateText,
                  isF1Related: true,
                  source: 'gemini',
                  sources: returnedSources.length > 0 ? returnedSources : undefined,
                  contextUsed: {
                    location: context?.currentLocation || context?.location,
                    currentCar: context?.currentCar,
                    section: context?.currentSection || context?.section,
                  },
                } as AIChatResponse)
              }
              console.warn(`[Gemini: ${modelName}] Rejected meta-commentary response:`, candidateText.slice(0, 60))
            }
          }
        } catch (geminiErr: any) {
          console.warn(`[Gemini API: ${modelName}] Request error:`, geminiErr?.message)
        }
      }
    }

    // ── Layer 3: Direct Web Search Summarization (guaranteed factual answer) ──
    // If web search returned results, summarize them directly rather than showing a generic knowledge base answer!
    if (exhibitionSearchResults.length > 0) {
      const summarizedAnswer = webSearchService.summarizeSearchResults(prompt, exhibitionSearchResults)
      return NextResponse.json({
        reply: summarizedAnswer,
        isF1Related: true,
        source: 'knowledge_base',
        sources: returnedSources,
        contextUsed: {
          location: context?.currentLocation || context?.location,
          currentCar: context?.currentCar,
          section: context?.currentSection || context?.section,
        },
      } as AIChatResponse)
    }

    // ── Layer 4: Offline Local Knowledge Base (only when no external data could be found) ──
    const localAnswer = getLocalF1KnowledgeResponse(prompt, {
      currentCar: context?.currentCar,
      section: context?.currentSection || context?.section,
      location: context?.currentLocation || context?.location,
      currentLocation: context?.currentLocation,
    })

    return NextResponse.json({
      reply: localAnswer,
      isF1Related: true,
      source: 'knowledge_base',
      sources: returnedSources.length > 0 ? returnedSources : undefined,
      contextUsed: {
        location: context?.currentLocation || context?.location,
        currentCar: context?.currentCar,
        section: context?.currentSection || context?.section,
      },
    } as AIChatResponse)
  } catch (err: any) {
    console.error('[API /api/ai/chat] Unexpected server error: ', err)
    return NextResponse.json(
      {
        reply: "I'm having trouble connecting right now. Please try again.",
        isF1Related: true,
        source: 'knowledge_base',
      } as AIChatResponse,
      { status: 200 }
    )
  }
}
