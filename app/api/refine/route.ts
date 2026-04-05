import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { idea, classification, current_output, adjustment } = await request.json()

    if (!idea || !current_output || !adjustment) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1500,
      system: `Eres un product strategist senior refinando una propuesta de producto.
El usuario aprobó parcialmente el output anterior pero quiere ajustes específicos.
Responde SOLO con JSON válido, sin texto antes ni después, sin backticks.

Mantén todo lo que el usuario NO pidió cambiar.
Solo modifica lo que el ajuste indica explícitamente.
Todo el output debe estar en español. Si el JTBD funcional existe, debe seguir la fórmula: "Cuando [situación], ayúdame a [job] para poder [outcome]".

Devuelve el mismo schema JSON que recibiste, con los cambios aplicados:
{
  "expanded_idea": "...",
  "jtbd": {
    "functional": "...",
    "emotional": "...",
    "social": "..."
  },
  "architecture": {
    "screens": [...],
    "core_flow": "...",
    "deferred": [...]
  },
  "confidence_note": "...",
  "changes_made": "descripción breve de qué cambió en este refinamiento"
}`,
      messages: [
        {
          role: 'user',
          content: `Idea original: "${idea}"
Clasificación: ${JSON.stringify(classification)}

Output actual que quiero ajustar:
${JSON.stringify(current_output)}

Ajuste solicitado: "${adjustment}"

Aplica el ajuste y devuelve el JSON actualizado.`,
        },
      ],
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Respuesta inesperada del modelo')
    }

    const cleanText = content.text.replace(/```json\n?|\n?```/g, '').trim()
    const refined = JSON.parse(cleanText)

    return NextResponse.json({ success: true, data: refined })
  } catch (error) {
    console.error('Error en refine:', error)
    return NextResponse.json(
      { error: 'Error al refinar el output' },
      { status: 500 }
    )
  }
}
