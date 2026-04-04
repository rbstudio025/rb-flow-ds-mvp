import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { idea, classification, validated_output } = await request.json()

    if (!idea || !validated_output) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 3000,
      system: `Sé conciso en las descripciones. Máximo 2 oraciones por campo de texto. Eres un product strategist senior generando un design brief completo.
Este brief es el entregable final — lo usará un diseñador para trabajar en Figma.
Responde SOLO con JSON válido, sin texto antes ni después, sin backticks.

El brief debe ser accionable, específico y listo para diseño.

Schema exacto:
{
  "brief": {
    "product_name": "nombre sugerido del producto",
    "tagline": "propuesta de valor en una línea",
    "overview": "descripción del producto en 3-4 oraciones",
    "target_user": {
      "primary": "descripción del usuario principal",
      "pain_points": ["pain point 1", "pain point 2", "pain point 3"]
    },
    "jtbd": {
      "functional": "...",
      "emotional": "...",
      "social": "..."
    },
    "mvp_screens": [
      {
        "name": "nombre pantalla",
        "job": "job único de esta pantalla",
        "key_components": ["componente 1", "componente 2"],
        "user_flow": "qué hace el usuario en esta pantalla"
      }
    ],
    "core_flow": "flujo principal paso a paso",
    "design_principles": ["principio 1", "principio 2", "principio 3"],
    "component_inventory": ["componente UI 1", "componente UI 2"],
    "deferred_to_v2": ["feature 1", "feature 2"],
    "success_metrics": ["métrica 1", "métrica 2"]
  }
}`,
      messages: [
        {
          role: 'user',
          content: `Idea original: "${idea}"
Clasificación: ${JSON.stringify(classification)}
Output validado por el usuario: ${JSON.stringify(validated_output)}

Genera el design brief completo listo para Figma.`,
        },
      ],
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Respuesta inesperada del modelo')
    }

    const cleanText = content.text.replace(/```json\n?|\n?```/g, '').trim()
    const brief = JSON.parse(cleanText)

    return NextResponse.json({ success: true, data: brief })
  } catch (error) {
    console.error('Error en brief:', error)
    return NextResponse.json(
      { error: 'Error al generar el brief' },
      { status: 500 }
    )
  }
}