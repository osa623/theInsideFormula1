import { NextRequest, NextResponse } from 'next/server'
import { F1DomainGuard } from '@/lib/ai/f1DomainGuard'
import { getLocalF1KnowledgeResponse, EXHIBITION_CARS_KNOWLEDGE, CARNIVAL_ZONES_KNOWLEDGE } from '@/lib/ai/f1KnowledgeBase'
import { AIChatRequest, AIChatResponse } from '@/lib/ai/types'

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

    // ── Layer 1: Local F1 Domain Guard Check ──
    const validation = F1DomainGuard.validate(prompt, context)
    if (!validation.isAllowed) {
      return NextResponse.json({
        reply: validation.rejectionReply || "I'm here to help with Formula 1 and information related to this exhibition. Please ask me an F1-related question.",
        isF1Related: false,
        source: 'domain_guard',
      } as AIChatResponse)
    }

    // ── Check Gemini API Key ──
    const apiKey = process.env.GEMINI_API_KEY
    const isApiKeyConfigured = Boolean(
      apiKey &&
      apiKey !== 'YOUR_GEMINI_API_KEY_HERE' &&
      apiKey.trim().length > 10
    )

    // Contextual summary for grounding
    let contextPromptAddition = ''
    if (context?.currentCar) {
      const carKey = context.currentCar.toLowerCase()
      const match =
        carKey.includes('senna') || carKey.includes('1991') || carKey.includes('mp4')
          ? EXHIBITION_CARS_KNOWLEDGE['senna-mp4-6']
          : EXHIBITION_CARS_KNOWLEDGE[context.currentCar] || Object.values(EXHIBITION_CARS_KNOWLEDGE).find(c => c.year === context.currentCar)

      if (match) {
        contextPromptAddition += `\n[EXHIBITION CONTEXT: The user is currently standing directly in front of the ${match.year} ${match.name}. Specs: Engine: ${match.engine}, Power: ${match.power}, Weight: ${match.weight}, Drivers: ${match.drivers}, Result: ${match.championshipResult}, Innovations: ${match.technicalInnovations}. If the user says 'this car' or 'it', they refer directly to this machine.]\n`
      }
    }

    if (context?.section && CARNIVAL_ZONES_KNOWLEDGE[context.section]) {
      const zone = CARNIVAL_ZONES_KNOWLEDGE[context.section]
      contextPromptAddition += `\n[CARNIVAL CONTEXT: The user is currently in the '${zone.title}' zone (${zone.subtitle}). Key highlights: ${zone.bullets.join('; ')}.]\n`
    }

    // If API key is not configured or in placeholder mode, use the intelligent F1 Knowledge Engine
    if (!isApiKeyConfigured) {
      const localAnswer = getLocalF1KnowledgeResponse(prompt, {
        currentCar: context?.currentCar,
        section: context?.section,
      })

      return NextResponse.json({
        reply: localAnswer,
        isF1Related: true,
        source: 'knowledge_base',
        contextUsed: {
          location: context?.location,
          currentCar: context?.currentCar,
          section: context?.section,
        },
      } as AIChatResponse)
    }

    // ── Layer 2: Live Gemini API with F1 Strict System Instructions ──
    const systemInstructionText =
      'You are the official Formula 1 Interactive Exhibition and Carnival AI Guide. ' +
      'Your role is to educate, explain, and answer questions exclusively about Formula 1, motorsport history, engineering, technical regulations, circuits, drivers, teams, and the cars displayed in this exhibition. ' +
      'STRICT RULE: Reject all unrelated non-F1 queries politely with: "I\'m here to help with Formula 1 and information related to this exhibition. Please ask me an F1-related question." ' +
      'Keep your responses clear, factual, engaging, concise, and formatted with clean paragraphs or bullet points suitable for an interactive museum display. ' +
      contextPromptAddition

    // Prepare contents array for Gemini
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

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 9000)

    try {
      const geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          systemInstruction: {
            parts: [{ text: systemInstructionText }],
          },
          generationConfig: {
            temperature: 0.35,
            topK: 40,
            topP: 0.9,
            maxOutputTokens: 500,
          },
        }),
        signal: controller.signal,
      })
      clearTimeout(timer)

      if (!geminiRes.ok) {
        console.warn(`[Gemini API] Returned HTTP ${geminiRes.status}, falling back to local F1 knowledge.`)
        const localAnswer = getLocalF1KnowledgeResponse(prompt, {
          currentCar: context?.currentCar,
          section: context?.section,
        })
        return NextResponse.json({
          reply: localAnswer,
          isF1Related: true,
          source: 'knowledge_base',
          contextUsed: {
            location: context?.location,
            currentCar: context?.currentCar,
            section: context?.section,
          },
        } as AIChatResponse)
      }

      const geminiData = await geminiRes.json()
      const candidateText =
        geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ||
        getLocalF1KnowledgeResponse(prompt, {
          currentCar: context?.currentCar,
          section: context?.section,
        })

      return NextResponse.json({
        reply: candidateText,
        isF1Related: true,
        source: 'gemini',
        contextUsed: {
          location: context?.location,
          currentCar: context?.currentCar,
          section: context?.section,
        },
      } as AIChatResponse)
    } catch (fetchErr: any) {
      clearTimeout(timer)
      console.warn('[Gemini API] Request error or timeout, falling back gracefully: ', fetchErr?.message)
      const localAnswer = getLocalF1KnowledgeResponse(prompt, {
        currentCar: context?.currentCar,
        section: context?.section,
      })
      return NextResponse.json({
        reply: localAnswer,
        isF1Related: true,
        source: 'knowledge_base',
        contextUsed: {
          location: context?.location,
          currentCar: context?.currentCar,
          section: context?.section,
        },
      } as AIChatResponse)
    }
  } catch (err: any) {
    console.error('[API /api/ai/chat] Unexpected server error: ', err)
    return NextResponse.json(
      {
        reply: "The AI assistant is momentarily unavailable. Please try asking again.",
        isF1Related: true,
        source: 'knowledge_base',
      } as AIChatResponse,
      { status: 200 }
    )
  }
}
