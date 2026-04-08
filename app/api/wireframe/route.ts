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
      system: `Eres un diseñador de wireframes. Genera UN ÚNICO archivo HTML auto-contenido con todas las pantallas navegables en formato web/desktop.

CRÍTICO: NO uses CDN externos (sin Tailwind CDN, sin Bootstrap, sin Google Fonts). Todo el CSS va en un bloque <style> inline en el <head>. El HTML debe funcionar sin conexión a internet.

FORMATO DE RESPUESTA:
===WIREFRAME===
<!DOCTYPE html>...HTML completo...
===END===

BLOQUE <style> OBLIGATORIO en el <head> — copia exactamente este CSS:
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f9fafb;color:#111827;min-height:100vh;display:flex;flex-direction:column;filter:grayscale(100%)}
nav{background:#fff;border-bottom:1px solid #e5e7eb;padding:12px 24px;display:flex;align-items:center;gap:24px;position:sticky;top:0;z-index:10}
nav .logo{font-weight:700;font-size:16px;color:#111827;margin-right:8px}
nav a{font-size:14px;font-weight:500;color:#9ca3af;text-decoration:none;padding-bottom:4px;border-bottom:2px solid transparent;cursor:pointer}
nav a.active{color:#111827;border-bottom-color:#111827}
.screen{display:none;padding:32px 24px;max-width:960px;margin:0 auto;width:100%}
.screen.visible{display:block}
h1{font-size:24px;font-weight:700;margin-bottom:8px}
h2{font-size:18px;font-weight:600;margin-bottom:16px}
h3{font-size:15px;font-weight:600;margin-bottom:8px}
p{font-size:14px;color:#6b7280;margin-bottom:8px}
.hint{font-size:11px;color:#9ca3af;margin-top:4px}
.card{background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin-bottom:16px}
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.sidebar-layout{display:grid;grid-template-columns:220px 1fr;gap:24px}
.sidebar{background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:16px}
.sidebar a{display:block;padding:8px 12px;border-radius:6px;font-size:14px;color:#374151;text-decoration:none;cursor:pointer;margin-bottom:4px}
.sidebar a.active,.sidebar a:hover{background:#f3f4f6}
.btn{display:inline-block;padding:8px 16px;border-radius:6px;font-size:14px;font-weight:500;cursor:pointer;border:none}
.btn-primary{background:#111827;color:#fff}
.btn-secondary{background:#fff;color:#374151;border:1px solid #d1d5db}
.btn-sm{padding:5px 12px;font-size:12px}
input,select,textarea{width:100%;padding:8px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;color:#111827;background:#fff;margin-top:4px}
label{font-size:13px;font-weight:500;color:#374151}
.form-group{margin-bottom:16px}
.stat{font-size:28px;font-weight:700;color:#111827}
.badge{display:inline-block;padding:2px 8px;border-radius:12px;font-size:12px;background:#f3f4f6;color:#374151}
table{width:100%;border-collapse:collapse;font-size:14px}
th{text-align:left;padding:10px 12px;border-bottom:2px solid #e5e7eb;color:#6b7280;font-weight:500}
td{padding:10px 12px;border-bottom:1px solid #f3f4f6;color:#374151}
.row{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #f3f4f6}
.avatar{width:36px;height:36px;border-radius:50%;background:#e5e7eb;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;color:#6b7280;flex-shrink:0}
.section-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
.mb-4{margin-bottom:16px}.mb-8{margin-bottom:32px}.mt-4{margin-top:16px}.flex{display:flex}.gap-2{gap:8px}.gap-3{gap:12px}.items-center{align-items:center}.justify-between{justify-content:space-between}
.tabs{display:flex;gap:4px;border-bottom:1px solid #e5e7eb;margin-bottom:20px}
.tab-btn{padding:8px 16px;border:none;background:none;font-size:14px;color:#6b7280;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px}
.tab-btn.active{color:#111827;border-bottom-color:#111827;font-weight:500}
</style>

ESTRUCTURA DEL HTML:
1. Nav: <nav id="top-nav"> con logo y links. Primer link con class="active", resto sin.
2. Contenido: <div id="app-content"> con todas las pantallas.
3. Cada pantalla: <div id="screen-NOMBRE" class="screen visible"> (primera) o <div id="screen-NOMBRE" class="screen"> (resto)

NAVEGACIÓN JS al final del body — copia exactamente:
<script>
function showScreen(id){
  document.querySelectorAll('.screen').forEach(function(s){s.classList.remove('visible')});
  var el=document.getElementById('screen-'+id);
  if(el){el.classList.add('visible')}else{console.warn('Screen not found: screen-'+id)}
  document.querySelectorAll('#top-nav a[data-screen]').forEach(function(a){a.classList.remove('active')});
  var nav=document.querySelector('#top-nav a[data-screen="'+id+'"]');
  if(nav)nav.classList.add('active');
}
function showTab(tabGroupId,tabId){
  document.querySelectorAll('[data-tab-group="'+tabGroupId+'"]').forEach(function(el){el.style.display='none'});
  var tab=document.getElementById(tabGroupId+'-'+tabId);
  if(tab)tab.style.display='block';
  document.querySelectorAll('[data-tab-btn-group="'+tabGroupId+'"]').forEach(function(b){b.classList.remove('active')});
  var btn=document.querySelector('[data-tab-btn-group="'+tabGroupId+'"][data-tab="'+tabId+'"]');
  if(btn)btn.classList.add('active');
}
</script>

REGLA DE IDs: El id de cada pantalla DEBE ser exactamente "screen-" + el mismo string que usas en showScreen() y en data-screen del nav. Sin espacios, sin acentos. Ejemplo: id="screen-Dashboard" ↔ showScreen('Dashboard') ↔ data-screen="Dashboard".

TABS INTERNAS — cuando una pantalla tenga pestañas usa este patrón:
<div class="tabs"><button class="tab-btn active" data-tab-btn-group="GRUPO" data-tab="TAB1" onclick="showTab('GRUPO','TAB1')">Label</button>...</div>
<div id="GRUPO-TAB1" data-tab-group="GRUPO">contenido</div>
<div id="GRUPO-TAB2" data-tab-group="GRUPO" style="display:none">contenido</div>

ESCALA DE GRISES ESTRICTA — NINGÚN color que no sea gris o blanco:
- Fondo de página: #f9fafb
- Cards y nav: #ffffff
- Bordes: #e5e7eb
- Texto principal: #111827
- Texto secundario: #6b7280
- Texto hints: #9ca3af
- Botón primario: background #111827, color #fff
- Botón secundario: background #fff, border #d1d5db, color #374151
- Badge/tag: background #f3f4f6, color #374151
- Estado activo/seleccionado: background #111827, color #fff
- PROHIBIDO: azul, verde, rojo, morado, naranja o cualquier color con saturación

CONTENIDO DE CADA PANTALLA:
- Usar clases del <style> (card, grid-2, btn-primary, sidebar-layout, etc.)
- Datos de ejemplo realistas y coherentes con el producto
- Clase .hint bajo cada elemento explicando su función
- Botones de nav entre pantallas: onclick="showScreen('ID')" donde ID es el mismo string del nav
- NO usar SVG — usar texto como placeholder: [Ícono] [Logo] [Avatar]`,
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
    const screens: { name: string; html: string }[] = []

    // Strategy 1: find ===WIREFRAME=== marker and take everything after it
    const startMarker = raw.indexOf('===WIREFRAME===')
    if (startMarker !== -1) {
      let html = raw.slice(startMarker + '===WIREFRAME==='.length).trim()
      const endMarker = html.indexOf('===END===')
      if (endMarker !== -1) html = html.slice(0, endMarker).trim()
      screens.push({ name: 'app', html })
    }

    // Strategy 2: extract <!DOCTYPE html> block directly
    if (screens.length === 0) {
      const doctypeIdx = raw.search(/<!DOCTYPE html/i)
      if (doctypeIdx !== -1) {
        screens.push({ name: 'app', html: raw.slice(doctypeIdx).trim() })
      }
    }

    if (screens.length === 0) {
      throw new Error(`No se encontró el wireframe en la respuesta. Raw preview: ${raw.slice(0, 200)}`)
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
