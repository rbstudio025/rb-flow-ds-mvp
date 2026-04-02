import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { idea } = await request.json()

    if (!idea) {
      return NextResponse.json({ error: 'Idea requerida' }, { status: 400 })
    }

    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 300,
      system: `Eres un clasificador de productos digitales. 
Analiza la idea del usuario y responde SOLO con un objeto JSON válido.
No agregues texto antes ni después del JSON.

El JSON debe tener exactamente esta estructura:
{
  "type": "dashboard|marketplace|saas|landing|app-contenido|herramienta|otro",
  "confidence": número entre 0 y 100,
  "matched_template": "nombre descriptivo del template",
  "reason": "explicación breve en español de por qué clasificaste así"
}`,
      messages: [
        {
          role: 'user',
          content: `Clasifica esta idea de producto: "${idea}"`,
        },
      ],
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Respuesta inesperada del modelo')
    }

   const cleanText = content.text.replace(/```json\n?|\n?```/g, '').trim()
    const classification = JSON.parse(cleanText)

    return NextResponse.json({ success: true, data: classification })
  } catch (error) {
    console.error('Error en classify:', error)
    return NextResponse.json(
      { error: 'Error al clasificar la idea' },
      { status: 500 }
    )
  }
}
