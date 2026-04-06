'use client'

import { useState } from 'react'
import { Button, Card, CardContent, CardHeader, Chip, Switch, TextArea, Separator, Tabs } from '@heroui/react'

type Stage = 'input' | 'classifying' | 'classified' | 'generating' | 'generated' | 'refining' | 'briefing' | 'complete' | 'wireframing' | 'wireframe'

const startingOptions = [
  { id: 'new', icon: '💡', title: 'Crear algo nuevo', desc: 'Tengo una idea y quiero hacerla realidad.' },
  { id: 'improve', icon: '🧩', title: 'Mejorar algo existente', desc: 'Ya tengo algo y quiero sumarle o cambiarlo.' },
  { id: 'problem', icon: '🎯', title: 'Resolver un problema', desc: 'Tengo un dolor y necesito una solución.' },
  { id: 'explore', icon: '🧭', title: 'Explorar ideas', desc: 'No tengo claro qué hacer, quiero inspirarme.' },
]

const ambitionOptions = [
  { id: 'sketch', icon: '⭐', title: 'Explorar idea', desc: 'Rápido y ligero, solo lo esencial.' },
  { id: 'prototype', icon: '🧑', title: 'Prototipo personal', desc: 'Para probar y validar la idea.' },
  { id: 'share', icon: '👥', title: 'Producto para compartir', desc: 'Con más detalle y listo para mostrar.' },
  { id: 'launch', icon: '🚀', title: 'Listo para lanzar', desc: 'Profundo y completo, para construir en serio.', recommended: true },
]

export default function Home() {
  const [stage, setStage] = useState<Stage>('input')
  const [idea, setIdea] = useState('')
  const [startingPoint, setStartingPoint] = useState<string>('')
  const [ambitionLevel, setAmbitionLevel] = useState<string>('launch')
  const [classification, setClassification] = useState<any>(null)
  const [generated, setGenerated] = useState<any>(null)
  const [brief, setBrief] = useState<any>(null)
  const [adjustment, setAdjustment] = useState('')
  const [error, setError] = useState('')
  const [isDark, setIsDark] = useState(false)
  const [wireframes, setWireframes] = useState<{name: string, html: string}[]>([])
  const [wireframeIndex, setWireframeIndex] = useState(0)

  function toggleTheme() {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark')
  }

  async function handleClassify() {
    if (!startingPoint) return
    const selectedStart = startingOptions.find(o => o.id === startingPoint)
    const selectedAmbition = ambitionOptions.find(o => o.id === ambitionLevel)
    const contextPrefix = selectedStart ? `${selectedStart.title}: ${selectedStart.desc} ` : ''
    const ambitionSuffix = selectedAmbition ? ` Nivel de ambición: ${selectedAmbition.title}.` : ''
    const finalIdea = idea.trim()
      ? `${contextPrefix}${idea.trim()}${ambitionSuffix}`
      : `${contextPrefix}${ambitionSuffix}`
    if (!finalIdea.trim()) return

    setStage('classifying')
    setError('')
    try {
      const res = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: finalIdea }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setClassification(data.data)
      setStage('classified')
    } catch (e: any) {
      setError(e.message)
      setStage('input')
    }
  }

  async function handleGenerate() {
    setStage('generating')
    setError('')
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, classification }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setGenerated(data.data)
      setStage('generated')
    } catch (e: any) {
      setError(e.message)
      setStage('classified')
    }
  }

  async function handleRefine() {
    if (!adjustment.trim()) return
    setStage('refining')
    setError('')
    try {
      const res = await fetch('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, classification, current_output: generated, adjustment }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setGenerated(data.data)
      setAdjustment('')
      setStage('generated')
    } catch (e: any) {
      setError(e.message)
      setStage('generated')
    }
  }

  async function handleBrief() {
    setStage('briefing')
    setError('')
    try {
      const res = await fetch('/api/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, classification, validated_output: generated }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setBrief(data.data)
      setStage('complete')
    } catch (e: any) {
      setError(e.message)
      setStage('generated')
    }
  }

  async function handleWireframe() {
    setStage('wireframing')
    setError('')
    try {
      const res = await fetch('/api/wireframe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief, generated }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setWireframes(data.data.screens)
      setWireframeIndex(0)
      setStage('wireframe')
    } catch (e: any) {
      setError(e.message)
      setStage('complete')
    }
  }

  function handleEditBrief() {
    setStage('generated')
  }

  function downloadJSON() {
    const blob = new Blob([JSON.stringify(brief, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${brief.brief.product_name?.replace(/\s+/g, '-').toLowerCase() || 'brief'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function downloadMarkdown() {
    const b = brief.brief
    const lines = [
      `# ${b.product_name}`,
      `> ${b.tagline}`,
      ``,
      `## Descripción`,
      b.overview,
      ``,
      `## Usuario objetivo`,
      b.target_user?.primary,
      ``,
      `### Pain points`,
      ...(b.target_user?.pain_points?.map((p: string) => `- ${p}`) ?? []),
      ``,
      `## JTBD (Jobs to be Done)`,
      generated?.jtbd?.functional ? `**Funcional:** ${generated.jtbd.functional}` : '',
      generated?.jtbd?.emotional ? `**Emocional:** ${generated.jtbd.emotional}` : '',
      generated?.jtbd?.social ? `**Social:** ${generated.jtbd.social}` : '',
      ``,
      `## Pantallas MVP`,
      ...(b.mvp_screens?.flatMap((s: any) => [
        `### ${s.name}`,
        `**Job:** ${s.job}`,
        `**Componentes clave:** ${s.key_components?.join(', ')}`,
        ``,
      ]) ?? []),
      `## Inventario de componentes UI`,
      b.component_inventory?.join(', ') ?? '',
    ]
    const blob = new Blob([lines.filter(Boolean).join('\n')], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${b.product_name?.replace(/\s+/g, '-').toLowerCase() || 'brief'}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleReset() {
    setStage('input')
    setIdea('')
    setStartingPoint('')
    setAmbitionLevel('launch')
    setClassification(null)
    setGenerated(null)
    setBrief(null)
    setError('')
    setAdjustment('')
  }

  const isInputStage = stage === 'input' || stage === 'classifying'

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 transition-colors">

      {/* NAVBAR — input stage */}
      {isInputStage && (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-zinc-950/95 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">RBStudio Flow</span>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded">BETA</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Historial
            </button>
            <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
              <svg className="w-4 h-4 text-zinc-500 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </nav>
      )}

      <div className={`mx-auto px-6 transition-all ${isInputStage ? 'pt-20 pb-12 max-w-5xl' : 'py-12 max-w-2xl'}`}>

        {/* HEADER — otras etapas */}
        {!isInputStage && (
          <div className="flex items-start justify-between mb-12">
            <div>
              <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">RBStudio Flow</h1>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5">De idea a brief de diseño en minutos</p>
            </div>
            <Switch isSelected={isDark} onChange={toggleTheme} size="sm" className="mt-1" />
          </div>
        )}

        {/* ERROR */}
        {error && (
          <Card className="mb-6 border border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
            <CardContent>
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* ETAPA 1 — INPUT */}
        {isInputStage && (
          <>
            {/* Hero heading */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                Convierte una idea en una<br />
                primera versión de{' '}
                <span className="text-indigo-500">tu producto</span>
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 mt-3 text-base">
                Te guiamos desde tu idea hasta un brief y un preview visual en minutos.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Columna izquierda — formulario */}
              <div className="lg:col-span-2">
                <Card className="shadow-none border border-zinc-200 dark:border-zinc-800">
                  <CardContent className="flex flex-col gap-0 p-0">

                    {/* Step 1 */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs flex items-center justify-center font-semibold shrink-0">1</span>
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100">¿Desde dónde partes?</span>
                        </div>
                        <button className="flex items-center gap-1 text-sm text-indigo-500 hover:text-indigo-600 transition-colors">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          ¿Cuál elijo?
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {startingOptions.map(option => (
                          <button
                            key={option.id}
                            onClick={() => setStartingPoint(option.id)}
                            className={`relative flex flex-col items-center text-center gap-2 p-4 rounded-xl border-2 transition-all ${
                              startingPoint === option.id
                                ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950 dark:border-indigo-500'
                                : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                            }`}
                          >
                            {startingPoint === option.id && (
                              <span className="absolute top-2 right-2 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center">
                                <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </span>
                            )}
                            <span className="text-2xl">{option.icon}</span>
                            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 leading-tight">{option.title}</span>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 leading-snug">{option.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-zinc-100 dark:border-zinc-800" />

                    {/* Step 2 */}
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="w-6 h-6 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs flex items-center justify-center font-semibold shrink-0">2</span>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">¿Qué tan lejos quieres llegar?</span>
                      </div>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 ml-9 mb-4">Esto nos ayuda a ajustar el nivel de detalle del resultado.</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {ambitionOptions.map(option => (
                          <button
                            key={option.id}
                            onClick={() => setAmbitionLevel(option.id)}
                            className={`relative flex flex-col items-center text-center gap-2 p-4 rounded-xl border-2 transition-all ${
                              ambitionLevel === option.id && option.recommended
                                ? 'border-rose-400 bg-rose-50 dark:bg-rose-950 dark:border-rose-500'
                                : ambitionLevel === option.id
                                ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950 dark:border-indigo-500'
                                : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                            }`}
                          >
                            {ambitionLevel === option.id && (
                              <span className={`absolute top-2 right-2 w-4 h-4 ${option.recommended ? 'bg-rose-500' : 'bg-indigo-500'} rounded-full flex items-center justify-center`}>
                                <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </span>
                            )}
                            <span className="text-2xl">{option.icon}</span>
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 leading-tight">{option.title}</span>
                              {option.recommended && (
                                <span className="text-[9px] font-bold text-rose-500 tracking-wide">RECOMENDADO</span>
                              )}
                            </div>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 leading-snug">{option.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-zinc-100 dark:border-zinc-800" />

                    {/* Step 3 — textarea opcional */}
                    <div className="p-6 flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">💡</span>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">Cuéntanos tu idea</span>
                        <span className="text-xs font-medium px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded">Opcional</span>
                      </div>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Escríbela como se te ocurra, en una frase o un párrafo. No te preocupes si no está perfecta.
                      </p>
                      <div>
                        <TextArea
                          value={idea}
                          onChange={(e) => setIdea(e.target.value.slice(0, 500))}
                          placeholder="Ej: Quiero crear una plataforma donde asesores de moda puedan ofrecer consultas online, gestionar sus citas y recibir pagos, y los clientes puedan encontrar el asesor ideal para su estilo."
                          rows={4}
                          className="w-full"
                        />
                        <p className="text-xs text-zinc-400 mt-1 text-right">{idea.length}/500</p>
                      </div>
                    </div>

                    <div className="px-6 pb-6 flex flex-col gap-4">
                      {/* Info banner */}
                      <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 dark:bg-blue-950 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                        <span className="shrink-0 text-blue-500">✦</span>
                        <span>
                          No necesitas tenerlo claro.{' '}
                          <span className="font-medium underline underline-offset-2 cursor-pointer">Nosotros te ayudamos a darle forma.</span>
                        </span>
                      </div>

                      {/* CTA */}
                      <div className="flex items-center gap-4 flex-wrap">
                        <Button
                          onPress={handleClassify}
                          isPending={stage === 'classifying'}
                          isDisabled={!startingPoint || stage === 'classifying'}
                          className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-3 text-base font-medium rounded-xl"
                        >
                          {stage === 'classifying' ? 'Analizando...' : 'Continuar →'}
                        </Button>
                        <p className="text-sm text-zinc-400">🔒 Toma ~1 minuto · Sin tarjeta de crédito</p>
                      </div>
                    </div>

                  </CardContent>
                </Card>
              </div>

              {/* Columna derecha — sidebar */}
              <div className="flex flex-col gap-5">
                <Card className="shadow-none border border-zinc-200 dark:border-zinc-800">
                  <CardContent className="flex flex-col gap-5 p-5">
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">Así funciona</p>
                    <div className="flex flex-col gap-4">
                      {[
                        { n: 1, title: 'Cuéntanos tu idea', desc: 'Elige desde dónde partes y escríbenos en tus palabras.' },
                        { n: 2, title: 'Analizamos y entendemos', desc: 'Detectamos lo clave, te hacemos 1 o 2 preguntas si hace falta.' },
                        { n: 3, title: 'Recibes tu brief y preview', desc: 'Un brief completo + una primera versión visual para que lo veas al instante.' },
                      ].map((step) => (
                        <div key={step.n} className="flex gap-3">
                          <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-semibold text-zinc-600 dark:text-zinc-400 shrink-0 mt-0.5">
                            {step.n}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{step.title}</p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">{step.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-blue-500 text-sm">✦</span>
                        <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Nuestro objetivo</p>
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        Ahorrarte horas de planificación para que empieces a diseñar con claridad y confianza.
                      </p>
                    </div>

                    <div className="flex items-start gap-2 text-xs text-zinc-400 dark:text-zinc-500">
                      <svg className="w-3.5 h-3.5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span>Tu información está segura.<br />No la compartimos con terceros.</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

            </div>
          </>
        )}

        {/* ETAPA 2 — CLASIFICACION */}
        {stage === 'classified' && classification && (
          <Card className="shadow-none border border-zinc-200 dark:border-zinc-800">
            <CardContent className="gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Tipo detectado</p>
                  <p className="text-xl font-semibold capitalize text-zinc-900 dark:text-zinc-100">{classification.type}</p>
                  <p className="text-sm text-zinc-500 mt-1">{classification.matched_template}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-400 mb-1">Confianza</p>
                  <p className={`text-3xl font-bold ${classification.confidence > 70 ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {classification.confidence}%
                  </p>
                </div>
              </div>
              <Separator />
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{classification.reason}</p>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" onPress={() => setStage('input')}>
                  ← Editar idea
                </Button>
                <Button
                  onPress={handleGenerate}
                  className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                  size="sm"
                >
                  Generar JTBD (Jobs to be Done) y arquitectura →
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* LOADING GENERATE */}
        {stage === 'generating' && (
          <Card className="shadow-none border border-zinc-200 dark:border-zinc-800">
            <CardContent className="py-16 items-center gap-2">
              <p className="text-zinc-600 dark:text-zinc-400">Generando JTBD (Jobs to be Done) y arquitectura...</p>
              <p className="text-sm text-zinc-400">Esto toma unos segundos</p>
            </CardContent>
          </Card>
        )}

        {/* ETAPA 3 — GENERATED */}
        {(stage === 'generated' || stage === 'refining') && generated && (
          <div className="flex flex-col gap-4">
            <Card className="shadow-none border border-zinc-200 dark:border-zinc-800">
              <CardHeader>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">Idea expandida</p>
              </CardHeader>
              <CardContent className="gap-4 pt-0">
                <p className="text-zinc-600 dark:text-zinc-400 text-sm">{generated.expanded_idea}</p>
                <Separator />
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">JTBD — Jobs to be Done</p>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Chip size="sm" variant="soft" className="shrink-0">Funcional</Chip>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {generated.jtbd?.functional && (() => {
                        const text: string = generated.jtbd.functional
                        const idx = text.indexOf(' ')
                        return idx > 0
                          ? <><strong>{text.slice(0, idx)}</strong>{text.slice(idx)}</>
                          : text
                      })()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Chip size="sm" variant="soft" className="shrink-0">Emocional</Chip>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{generated.jtbd?.emotional}</p>
                  </div>
                  <div className="flex gap-2">
                    <Chip size="sm" variant="soft" className="shrink-0">Social</Chip>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{generated.jtbd?.social}</p>
                  </div>
                </div>
                <Separator />
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Pantallas MVP</p>
                <div className="flex flex-col gap-2">
                  {generated.architecture?.screens?.filter((s: any) => s.priority === 'mvp').map((screen: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                      <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{screen.name}</p>
                      <p className="text-xs text-zinc-400">{screen.job}</p>
                    </div>
                  ))}
                </div>
                {generated.changes_made && (
                  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900">
                    <p className="text-xs text-blue-600 dark:text-blue-400">{generated.changes_made}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-none border border-zinc-200 dark:border-zinc-800">
              <CardHeader>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">¿Qué quieres ajustar?</p>
              </CardHeader>
              <CardContent className="gap-4 pt-0">
                <TextArea
                  value={adjustment}
                  onChange={(e) => setAdjustment(e.target.value)}
                  placeholder="Ej: enfoca más en B2B, agrega pantalla de reportes al MVP..."
                  rows={2}
                  />

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={handleRefine}
                    isPending={stage === 'refining'}
                    isDisabled={!adjustment.trim()}
                  >
                    Aplicar ajuste ↻
                  </Button>
                  <Button
                    size="sm"
                    onPress={handleBrief}
                    isDisabled={stage === 'refining'}
                    className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                  >
                    Generar brief final →
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* LOADING BRIEF */}
        {stage === 'briefing' && (
          <Card className="shadow-none border border-zinc-200 dark:border-zinc-800">
            <CardContent className="py-16 items-center gap-2">
              <p className="text-zinc-600 dark:text-zinc-400">Generando brief de diseño...</p>
              <p className="text-sm text-zinc-400">Esto puede tomar 30 segundos</p>
            </CardContent>
          </Card>
        )}

        {/* ETAPA 4 — BRIEF COMPLETO */}
        {stage === 'complete' && brief?.brief && (
          <div className="flex flex-col gap-4">

            <Card className="shadow-none border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950">
              <CardContent>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">Brief de diseño listo</p>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{brief.brief.product_name}</h2>
                <p className="text-zinc-600 dark:text-zinc-400 mt-1">{brief.brief.tagline}</p>
              </CardContent>
            </Card>

            <Card className="shadow-none border border-zinc-200 dark:border-zinc-800">
              <CardContent>
                <Tabs>
                  <Tabs.ListContainer>
                    <Tabs.List>
                      <Tabs.Tab id="resumen">Resumen</Tabs.Tab>
                      <Tabs.Tab id="usuario">Usuario</Tabs.Tab>
                      <Tabs.Tab id="pantallas">Pantallas MVP</Tabs.Tab>
                      <Tabs.Tab id="componentes">Componentes</Tabs.Tab>
                    </Tabs.List>
                  </Tabs.ListContainer>

                  <Tabs.Panel id="resumen" className="pt-4">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{brief.brief.overview}</p>
                  </Tabs.Panel>

                  <Tabs.Panel id="usuario" className="pt-4 flex flex-col gap-3">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{brief.brief.target_user?.primary}</p>
                    <div className="flex flex-col gap-1">
                      {brief.brief.target_user?.pain_points?.map((p: string, i: number) => (
                        <div key={i} className="flex gap-2 items-start">
                          <span className="text-zinc-400 text-sm mt-0.5">–</span>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">{p}</p>
                        </div>
                      ))}
                    </div>
                  </Tabs.Panel>

                  <Tabs.Panel id="pantallas" className="pt-4 flex flex-col gap-4">
                    {brief.brief.mvp_screens?.map((s: any, i: number) => (
                      <div key={i}>
                        <p className="font-medium text-sm text-zinc-800 dark:text-zinc-200">{s.name}</p>
                        <p className="text-xs text-zinc-400 mb-2">{s.job}</p>
                        <div className="flex flex-wrap gap-1">
                          {s.key_components?.map((c: string, j: number) => (
                            <Chip key={j} size="sm" variant="soft">{c}</Chip>
                          ))}
                        </div>
                        {i < brief.brief.mvp_screens.length - 1 && <Separator className="mt-4" />}
                      </div>
                    ))}
                  </Tabs.Panel>

                  <Tabs.Panel id="componentes" className="pt-4">
                    <div className="flex flex-wrap gap-2">
                      {brief.brief.component_inventory?.map((c: string, i: number) => (
                        <Chip key={i} size="sm" color="accent" variant="soft">{c}</Chip>
                      ))}
                    </div>
                  </Tabs.Panel>
                </Tabs>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <Button variant="outline" size="sm" onPress={downloadJSON} className="w-fit">↓ Descargar JSON</Button>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">Exporta el brief como archivo .json con toda la estructura de datos. Útil para guardar o procesar después.</p>
              </div>
              <div className="flex flex-col gap-1">
                <Button variant="outline" size="sm" onPress={downloadMarkdown} className="w-fit">↓ Descargar Markdown</Button>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">Exporta el brief como archivo .md legible. Listo para pegar en Notion, Drive o compartir con el equipo.</p>
              </div>
              <div className="flex flex-col gap-1">
                <Button variant="outline" size="sm" onPress={handleEditBrief} className="w-fit">↩ Editar brief</Button>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">Regresa a la Etapa 3 para hacer más ajustes y regenerar el brief sin perder el contexto de la sesión.</p>
              </div>
              <div className="flex flex-col gap-1">
                <Button variant="outline" size="sm" onPress={handleReset} className="w-fit">← Nueva idea</Button>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">Resetea todo y empieza desde cero.</p>
              </div>
              <div className="flex flex-col gap-1">
                <Button variant="outline" size="sm" onPress={handleWireframe} className="w-fit">⬡ Ver wireframe preview</Button>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">Genera una vista visual de cada pantalla del MVP lista para revisar con tu equipo.</p>
              </div>
            </div>

          </div>
        )}

        {/* WIREFRAME — LOADING */}
        {stage === 'wireframing' && (
          <Card className="shadow-none border border-zinc-200 dark:border-zinc-800">
            <CardContent className="py-16 items-center gap-2">
              <p className="text-zinc-600 dark:text-zinc-400">Generando wireframes de cada pantalla...</p>
              <p className="text-sm text-zinc-400">Esto puede tomar 20-30 segundos</p>
            </CardContent>
          </Card>
        )}

        {/* WIREFRAME — PREVIEW */}
        {stage === 'wireframe' && wireframes.length > 0 && (
          <div className="flex flex-col gap-4">

            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Wireframe preview</p>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{wireframes[wireframeIndex].name}</h2>
                <p className="text-xs text-zinc-400 mt-0.5">{wireframeIndex + 1} / {wireframes.length} pantallas</p>
              </div>
              <div className="flex gap-2 mt-1">
                <Button
                  variant="outline" size="sm"
                  isDisabled={wireframeIndex === 0}
                  onPress={() => setWireframeIndex(i => i - 1)}
                >←</Button>
                <Button
                  variant="outline" size="sm"
                  isDisabled={wireframeIndex === wireframes.length - 1}
                  onPress={() => setWireframeIndex(i => i + 1)}
                >→</Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {wireframes.map((s, i) => (
                <Button
                  key={i}
                  size="sm"
                  variant={i === wireframeIndex ? 'primary' : 'outline'}
                  onPress={() => setWireframeIndex(i)}
                >
                  {s.name}
                </Button>
              ))}
            </div>

            <Card className="shadow-none border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <iframe
                srcDoc={wireframes[wireframeIndex].html}
                className="w-full h-[600px] border-0"
                title={wireframes[wireframeIndex].name}
                sandbox="allow-scripts"
              />
            </Card>

            <Button variant="outline" size="sm" onPress={() => setStage('complete')} className="w-fit">
              ← Volver al brief
            </Button>

          </div>
        )}

      </div>
    </main>
  )
}
