import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { brief, generated } = await request.json()

    if (!brief?.brief?.mvp_screens) {
      return NextResponse.json(
        { error: 'Brief con pantallas MVP requerido' },
        { status: 400 }
      )
    }

    const { product_name, mvp_screens, component_inventory } = brief.brief
    const jtbd = generated?.jtbd

    const screensContext = mvp_screens.map((s: any, i: number) =>
      `Pantalla ${i + 1}: "${s.name}" | Job: ${s.job} | Componentes: ${s.key_components?.join(', ')}`
    ).join('\n')

    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 8000,
      system: `Eres un diseñador de wireframes. Genera wireframes HTML para apps mobile.

FORMATO DE RESPUESTA OBLIGATORIO — usa exactamente estos delimitadores por cada pantalla:
===SCREEN:NombrePantalla===
<!DOCTYPE html>...HTML completo aquí...
===END===

Sin texto antes ni después. Sin JSON. Sin backticks. Solo los bloques delimitados.

PARA CADA HTML GENERA:
- DOCTYPE html completo y auto-contenido
- <script src="https://cdn.tailwindcss.com"></script> en el head
- body con: class="bg-gray-50 min-h-screen"
- Contenedor: class="max-w-sm mx-auto bg-white min-h-screen shadow-sm"
- Status bar superior negro con hora y batería
- Contenido real de la pantalla con inputs, botones y cards según su función
- Nav bar inferior con íconos de navegación
- Solo colores grises y blancos (wireframe, no diseño final)
- Etiqueta cada elemento interactivo con texto pequeño gris explicando su función
- Datos de ejemplo realistas coherentes con el producto`,
      messages: [
        {
          role: 'user',
          content: `Producto: "${product_name}"
Job principal: ${jtbd?.functional || 'No especificado'}
Componentes UI: ${component_inventory?.join(', ') || 'estándar'}

Pantallas a generar:
${screensContext}

Genera el JSON con un HTML por pantalla.`,
        },
      ],
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Respuesta inesperada del modelo')
    }

    // Parsear con delimitadores — evita problemas de JSON con HTML adentro
    const raw = content.text
    const screenRegex = /===SCREEN:(.+?)===\n([\s\S]+?)===END===/g
    const screens: { name: string; html: string }[] = []
    let match
    while ((match = screenRegex.exec(raw)) !== null) {
      screens.push({ name: match[1].trim(), html: match[2].trim() })
    }

    if (screens.length === 0) {
      throw new Error('No se encontraron pantallas en la respuesta')
    }

    return NextResponse.json({ success: true, data: { screens } })
  } catch (error: any) {
    console.error('Error en wireframe:', error)
    return NextResponse.json(
      { error: 'Error al generar los wireframes', detail: error?.message ?? String(error) },
      { status: 500 }
    )
  }
}
