import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'
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

    const screenNames = mvp_screens.map((s: any) => s.name)

    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 8000,
      system: `Eres un diseñador de wireframes. Genera UN ÚNICO archivo HTML con todas las pantallas navegables en formato web/desktop.

FORMATO DE RESPUESTA OBLIGATORIO:
===WIREFRAME===
<!DOCTYPE html>...HTML completo aquí...
===END===

Sin texto antes ni después. Sin JSON. Sin backticks. Solo el bloque delimitado.

ESTRUCTURA DEL HTML:
- DOCTYPE html completo y auto-contenido
- <script src="https://cdn.tailwindcss.com"></script> en el head
- body con: class="bg-gray-50 min-h-screen flex flex-col"

LAYOUT WEB/DESKTOP (NO mobile, NO teléfono, NO status bar):
1. Nav horizontal superior fija al tope:
   <nav id="top-nav" class="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-6 sticky top-0 z-10">
   - Logo/nombre del producto a la izquierda
   - Links de navegación por pantalla: <a data-screen="NOMBRE" onclick="showScreen('NOMBRE'); return false;" href="#" class="text-sm font-medium text-gray-900 border-b-2 border-gray-900 pb-1">Pantalla</a>
   - Primer link activo (border-b-2 border-gray-900), resto text-gray-400 sin border

2. Contenedor principal:
   <div id="app-content" class="flex-1">
   - Todas las pantallas van aquí como secciones

PANTALLAS dentro de #app-content:
- Cada pantalla: <div id="screen-NOMBRE" class="screen min-h-screen px-6 py-8 max-w-5xl mx-auto">
- Primera pantalla visible, resto con class="screen min-h-screen px-6 py-8 max-w-5xl mx-auto hidden"
- Si la pantalla tiene sidebar: usa grid de 2 columnas (sidebar 240px + contenido principal)
- Si es dashboard: usa grid de cards en fila
- Si es formulario: usa columna centrada de max-w-lg

NAVEGACIÓN JS — incluir al final del body:
<script>
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById('screen-' + id).classList.remove('hidden');
  document.querySelectorAll('#top-nav a[data-screen]').forEach(a => {
    a.classList.remove('text-gray-900', 'border-b-2', 'border-gray-900');
    a.classList.add('text-gray-400');
  });
  const active = document.querySelector('#top-nav a[data-screen="' + id + '"]');
  if (active) {
    active.classList.remove('text-gray-400');
    active.classList.add('text-gray-900', 'border-b-2', 'border-gray-900');
  }
}
</script>

CONTENIDO DE CADA PANTALLA:
- Ancho completo del contenedor (max-w-5xl), nunca 375px ni limitado a mobile
- Inputs, botones, cards, tablas y listas según la función de la pantalla
- Solo colores grises y blancos (wireframe, no diseño final)
- Texto pequeño gris bajo cada elemento interactivo explicando su función
- Datos de ejemplo realistas coherentes con el producto
- Botones que navegan entre pantallas usan onclick="showScreen('NombrePantalla')"
- FABs reemplazados por botones primarios en el header de la sección`,
      messages: [
        {
          role: 'user',
          content: `Producto: "${product_name}"
Job principal: ${jtbd?.functional || 'No especificado'}
Componentes UI: ${component_inventory?.join(', ') || 'estándar'}

Pantallas a generar (en este orden):
${screensContext}

IDs de pantalla para showScreen(): ${screenNames.map((n: string) => `'${n.replace(/\s+/g, '')}'`).join(', ')}

Genera el único HTML navegable con todas las pantallas.`,
        },
      ],
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Respuesta inesperada del modelo')
    }

    const raw = content.text
    const match = /===WIREFRAME===\n([\s\S]+?)===END===/.exec(raw)
    const screens: { name: string; html: string }[] = []

    if (match) {
      screens.push({ name: 'app', html: match[1].trim() })
    }

    if (screens.length === 0) {
      throw new Error('No se encontró el wireframe en la respuesta')
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
