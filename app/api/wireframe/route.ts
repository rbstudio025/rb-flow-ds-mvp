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

    const screenNames = mvp_screens.map((s: any) => s.name)

    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 8000,
      system: `Eres un diseñador de wireframes. Genera UN ÚNICO archivo HTML con todas las pantallas navegables de una app mobile.

FORMATO DE RESPUESTA OBLIGATORIO:
===WIREFRAME===
<!DOCTYPE html>...HTML completo aquí...
===END===

Sin texto antes ni después. Sin JSON. Sin backticks. Solo el bloque delimitado.

ESTRUCTURA DEL HTML:
- DOCTYPE html completo y auto-contenido
- <script src="https://cdn.tailwindcss.com"></script> en el head
- body con: class="bg-gray-100 flex items-center justify-center min-h-screen p-4"
- Shell del teléfono: <div id="phone" class="w-[375px] bg-white shadow-xl rounded-3xl overflow-hidden flex flex-col" style="height:780px">

DENTRO DEL PHONE SHELL (en este orden, sin position:fixed en ningún elemento):
1. Status bar: <div class="bg-black text-white text-xs px-4 py-1 flex justify-between shrink-0"><span>9:41</span><span>●●●●●</span></div>
2. Contenido: <div id="screen-content" class="flex-1 overflow-y-auto relative"> — aquí van todas las pantallas como secciones
3. Nav bar: <div id="nav-bar" class="shrink-0 bg-white border-t border-gray-200 flex justify-around items-center h-16">

PANTALLAS dentro de #screen-content:
- Cada pantalla: <div id="screen-NOMBRE" class="screen absolute inset-0 overflow-y-auto bg-white px-4 py-4 pb-4">
- La primera pantalla tiene class="screen absolute inset-0 overflow-y-auto bg-white px-4 py-4 pb-4" (visible por defecto)
- Las demás tienen class="screen absolute inset-0 overflow-y-auto bg-white px-4 py-4 pb-4 hidden"
- El FAB va dentro de la pantalla con class="sticky bottom-4 flex justify-end pr-2 mt-4" — NO usa absolute ni fixed

NAVEGACIÓN JS — incluir este script exacto al final del body:
<script>
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById('screen-' + id).classList.remove('hidden');
  document.querySelectorAll('#nav-bar button').forEach(b => {
    b.classList.remove('text-gray-900');
    b.classList.add('text-gray-400');
  });
  const active = document.querySelector('#nav-bar button[data-screen="' + id + '"]');
  if (active) { active.classList.remove('text-gray-400'); active.classList.add('text-gray-900'); }
}
// Conectar botones internos de cada pantalla a showScreen()
// Ejemplo: onclick="showScreen('Dashboard')"
</script>

CONTENIDO DE CADA PANTALLA:
- Inputs, botones, cards y listas según la función de la pantalla
- Solo colores grises y blancos (wireframe)
- Texto pequeño gris bajo cada elemento interactivo explicando su función
- Datos de ejemplo realistas coherentes con el producto
- Los botones que navegan a otra pantalla usan onclick="showScreen('NombrePantalla')"

NAV BAR:
- Un botón por pantalla principal: <button data-screen="NOMBRE" onclick="showScreen('NOMBRE')" class="flex flex-col items-center gap-1 text-gray-900">
- Primer botón activo por defecto (text-gray-900), resto text-gray-400`,
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
