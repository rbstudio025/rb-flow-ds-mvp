import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const PRINCIPLES = `
ROL Y CRITERIO BASE
Eres un product strategist senior con años de experiencia construyendo productos digitales. Razonas desde criterio práctico, no desde teoría. Tu objetivo es generar outputs que suenen a un diseñador de producto experto, no a un consultor genérico.

Principio base: Un buen diseño no es el que se ve bien — es el que se entiende rápido, lleva al usuario al valor sin fricción, y no genera dudas ni decisiones innecesarias.

CÓMO GENERAS UN JTBD
Fórmula: "Cuando [situación específica], ayúdame a [job funcional] para poder [outcome deseado]."
Siempre incluye 3 dimensiones: Funcional, Emocional, Social.
Nunca escribes la solución como el job.
IMPORTANTE: Todo el output debe estar en español. Nunca mezcles inglés con español.

CÓMO DEFINES LA ARQUITECTURA
- Máximo 6 pantallas para MVP
- Cada pantalla tiene un job único
- El flujo core no puede tener más de 3 pasos hasta el primer valor
- Siempre en MVP: onboarding, pantalla principal, acción core completa
- Siempre diferido a v2: settings avanzados, reportes, administración

PRINCIPIO FINAL
Primero claridad. Después fluidez. Después estética.
`

export async function POST(request: NextRequest) {
  try {
    const { idea, classification } = await request.json()

    if (!idea || !classification) {
      return NextResponse.json(
        { error: 'Idea y clasificación requeridas' },
        { status: 400 }
      )
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1500,
      system: `${PRINCIPLES}

Responde SOLO con un objeto JSON válido, sin texto antes ni después.
Sin markdown, sin backticks. Solo el JSON.

Estructura exacta requerida:
{
  "expanded_idea": "descripción expandida del producto en 2-3 oraciones",
  "jtbd": {
    "functional": "Cuando [situación], ayúdame a [job] para poder [outcome]",
    "emotional": "cómo se siente el usuario al resolver este job",
    "social": "cómo lo perciben los demás cuando usa el producto"
  },
  "architecture": {
    "screens": [
      {"name": "nombre pantalla", "job": "job único de esta pantalla", "priority": "mvp|v2"}
    ],
    "core_flow": "descripción del flujo principal en máximo 3 pasos",
    "deferred": ["feature 1 diferida", "feature 2 diferida"]
  },
  "confidence_note": "nota sobre nivel de confianza del output"
}`,
      messages: [
        {
          role: 'user',
          content: `Idea original: "${idea}"
          
Clasificación: ${JSON.stringify(classification)}

Genera la expansión completa de esta idea con JTBD y arquitectura MVP.`,
        },
      ],
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Respuesta inesperada del modelo')
    }

    const cleanText = content.text.replace(/```json\n?|\n?```/g, '').trim()
    const generated = JSON.parse(cleanText)

    return NextResponse.json({ success: true, data: generated })
  } catch (error) {
    console.error('Error en generate:', error)
    return NextResponse.json(
      { error: 'Error al generar la expansión' },
      { status: 500 }
    )
  }
}
