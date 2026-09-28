import { NextRequest, NextResponse } from 'next/server'
import { F1DomainGuard, F1_DOMAIN_REJECTION_MESSAGE } from '@/lib/ai/f1DomainGuard'
import {
  getLocalF1KnowledgeResponse,
  EXHIBITION_CARS_KNOWLEDGE,
  resolveLocationQuery,
} from '@/lib/ai/f1KnowledgeBase'
import { AIChatRequest, AIChatResponse } from '@/lib/ai/types'

/**
 * Searches the live internet for Formula 1 facts, articles, and real-time knowledge.
 * Acts as an online grounding source for Formula 1 queries.
 */
async function searchInternetForF1(query: string): Promise<string> {
  const cleanQ = query.replace(/[?.,!]/g, '').trim()
  const searchResults: string[] = []

  // 1. Live Wikipedia Knowledge Search API
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 4000)
    const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      cleanQ + ' Formula One'
    )}&format=json&utf8=1&srlimit=2`

    const res = await fetch(wikiUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      signal: controller.signal,
    })
    clearTimeout(timer)

    if (res.ok) {
      const data = await res.json()
      const searchItems = data?.query?.search || []
      for (const item of searchItems) {
        if (item.snippet) {
          const cleanSnippet = item.snippet
            .replace(/<[^>]+>/g, '')
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'")
            .replace(/&amp;/g, '&')
            .trim()
          if (cleanSnippet) {
            searchResults.push(`${item.title}: ${cleanSnippet}`)
          }
        }
      }
    }
  } catch (err: any) {
    // Graceful fallback if network is restricted
  }

  // 2. DuckDuckGo Instant Answer API
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 3500)
    const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(
      cleanQ + ' Formula 1'
    )}&format=json&no_html=1&skip_disambig=1`

    const res = await fetch(ddgUrl, { signal: controller.signal })
    clearTimeout(timer)

    if (res.ok) {
      const data = await res.json()
      if (data.AbstractText) {
        searchResults.push(data.AbstractText)
      } else if (data.RelatedTopics && data.RelatedTopics.length > 0) {
        for (const topic of data.RelatedTopics.slice(0, 2)) {
          if (topic.Text) searchResults.push(topic.Text)
        }
      }
    }
  } catch (err: any) {
    // Graceful fallback
  }

  return searchResults.join('\n')
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

    // ── Layer 1: Intent Classification & Domain Validation ──
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
    // Search the live internet for Formula 1 information
    let internetSearchResults = ''
    try {
      internetSearchResults = await searchInternetForF1(prompt)
    } catch {
      // Non-blocking fallback
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

    if (internetSearchResults) {
      contextPromptAddition += `\n[LIVE INTERNET SEARCH RESULTS: ${internetSearchResults}]\n`
    }

    const systemInstructionText =
      'You are the official Formula 1 Smart Guide for "The Inside Formula One". ' +
      'Answer questions exclusively about Formula 1, motorsport history, engineering, technical regulations, circuits, drivers, teams, and racing cars. ' +
      'Use the provided live internet search results and knowledge to give up-to-date, factually accurate answers. ' +
      'Keep answers concise, factual, and easy to read on a mobile phone interface using short paragraphs. ' +
      'CRITICAL RULE: The user question is the primary intent. NEVER replace an F1 answer with a location description. For example, if the user asks "Who is Lewis Hamilton?" or "What engine did the W11 use?", answer that question directly—do NOT describe their physical location in the carnival. ' +
      'STRICT RULE: Reject all unrelated non-F1 queries with: "That question is outside my scope. I can help you with Formula One information or guide you around this experience." ' +
      contextPromptAddition

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
              contextUsed: {
                location: context?.currentLocation || context?.location,
                currentCar: context?.currentCar,
                section: context?.currentSection || context?.section,
              },
            } as AIChatResponse)
          }
        } else {
          console.warn(`[OpenAI API] Returned HTTP ${openaiRes.status}`)
        }
      } catch (openAiErr: any) {
        console.warn('[OpenAI API] Request error or timeout: ', openAiErr?.message)
      }
    }

    // ── Attempt Gemini API Integration with Live Search Grounding ──
    if (isGeminiConfigured) {
      try {
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

        // Supported Gemini model with Google Search grounding
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${geminiApiKey}`

        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), 9000)

        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            systemInstruction: {
              parts: [{ text: systemInstructionText }],
            },
            tools: [{ googleSearch: {} }],
            generationConfig: {
              temperature: 0.35,
              topK: 40,
              topP: 0.9,
              maxOutputTokens: 400,
            },
          }),
          signal: controller.signal,
        })
        clearTimeout(timer)

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json()
          const candidateText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
          if (candidateText) {
            return NextResponse.json({
              reply: candidateText,
              isF1Related: true,
              source: 'gemini',
              contextUsed: {
                location: context?.currentLocation || context?.location,
                currentCar: context?.currentCar,
                section: context?.currentSection || context?.section,
              },
            } as AIChatResponse)
          }
        } else {
          console.warn(`[Gemini API] Returned HTTP ${geminiRes.status}`)
        }
      } catch (geminiErr: any) {
        console.warn('[Gemini API] Request error or timeout: ', geminiErr?.message)
      }
    }

    // ── Layer 3: Comprehensive Local F1 Knowledge Engine + Internet Search Grounding ──
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
