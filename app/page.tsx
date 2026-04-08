'use client'

import { useState, useEffect, useRef, type ReactNode } from 'react'
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

const screenIcons = [
  // home
  <svg key="home" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  // plus-circle
  <svg key="plus" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  // folder
  <svg key="folder" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" /></svg>,
  // photo
  <svg key="photo" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  // user
  <svg key="user" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  // credit-card
  <svg key="card" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
]

function Tooltip({ text, children }: { text: string; children: ReactNode }) {
  return (
    <span className="relative group inline-flex items-center cursor-help">
      {children}
      <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 w-60 px-3 py-2 bg-zinc-900 dark:bg-zinc-700 text-white text-xs rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none leading-relaxed text-center">
        {text}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900 dark:border-t-zinc-700" />
      </span>
    </span>
  )
}

function StepLoader({ steps, totalSeconds = 50 }: { steps: string[]; totalSeconds?: number }) {
  const [stepIndex, setStepIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const progressRef = useRef(0)

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setStepIndex(i => Math.min(i + 1, steps.length - 1))
    }, 8000)

    const tickMs = 100
    const increment = 90 / ((totalSeconds * 1000) / tickMs)
    const progressInterval = setInterval(() => {
      progressRef.current = Math.min(progressRef.current + increment, 90)
      setProgress(progressRef.current)
    }, tickMs)

    return () => {
      clearInterval(stepInterval)
      clearInterval(progressInterval)
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 gap-8">
      {/* Spinner */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-zinc-100 dark:border-zinc-800" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse" />
        </div>
      </div>

      {/* Step text */}
      <div className="text-center">
        <p className="text-base font-medium text-zinc-800 dark:text-zinc-200 transition-all duration-500">
          {steps[stepIndex]}
        </p>
        <p className="text-sm text-zinc-400 mt-2">Esto toma entre 30 y 60 segundos</p>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xs">
        <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-300 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-xs text-zinc-400">{Math.round(progress)}%</span>
          <span className="text-xs text-zinc-400">Paso {Math.min(stepIndex + 1, steps.length)} de {steps.length}</span>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const [stage, setStage] = useState<Stage>('input')
  const [idea, setIdea] = useState('')
  const [startingPoint, setStartingPoint] = useState<string>('')
  const [ambitionLevel, setAmbitionLevel] = useState<string>('launch')
  const [editingCard, setEditingCard] = useState<string | null>(null)
  const [classifiedFields, setClassifiedFields] = useState({ problem: '', user: '', productType: '', goal: '' })
  const [expandedDetail, setExpandedDetail] = useState<string | null>(null)
  const [detailText, setDetailText] = useState<Record<string, string>>({})
  const [quickType, setQuickType] = useState<string>('')
  const [classification, setClassification] = useState<any>(null)
  const [generated, setGenerated] = useState<any>(null)
  const [jtbdFields, setJtbdFields] = useState({ functional: '', emotional: '', social: '' })
  const [editingJtbd, setEditingJtbd] = useState<string | null>(null)
  const [editableScreens, setEditableScreens] = useState<any[]>([])
  const [editingScreen, setEditingScreen] = useState<number | null>(null)
  const [editScreenData, setEditScreenData] = useState({ name: '', job: '' })
  const [showAddScreen, setShowAddScreen] = useState(false)
  const [newScreenData, setNewScreenData] = useState({ name: '', job: '' })
  const [brief, setBrief] = useState<any>(null)
  const [adjustment, setAdjustment] = useState('')
  const [error, setError] = useState('')
  const [isDark, setIsDark] = useState(false)
  const [wireframes, setWireframes] = useState<{name: string, html: string}[]>([])
  const [wireframeIndex, setWireframeIndex] = useState(0)
  const [briefTab, setBriefTab] = useState('resumen')

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
      setQuickType(data.data.type || '')
      setClassifiedFields({
        problem: data.data.problem || '',
        user: data.data.user || '',
        productType: data.data.matched_template || data.data.type || '',
        goal: data.data.goal || '',
      })
      // Auto-generate after classify
      await handleGenerateWith(data.data, finalIdea)
    } catch (e: any) {
      setError(e.message)
      setStage('input')
    }
  }

  async function handleGenerateWith(classData: any, ideaText: string) {
    setStage('generating')
    setError('')
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: ideaText, classification: classData }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setGenerated(data.data)
      setJtbdFields({
        functional: data.data.jtbd?.functional || '',
        emotional: data.data.jtbd?.emotional || '',
        social: data.data.jtbd?.social || '',
      })
      setEditableScreens(data.data.architecture?.screens?.filter((s: any) => s.priority === 'mvp') ?? [])
      setStage('generated')
    } catch (e: any) {
      setError(e.message)
      setStage('classified')
    }
  }

  async function handleGenerate() {
    await handleGenerateWith(classification, idea)
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
      setJtbdFields({
        functional: data.data.jtbd?.functional || '',
        emotional: data.data.jtbd?.emotional || '',
        social: data.data.jtbd?.social || '',
      })
      setEditableScreens(data.data.architecture?.screens?.filter((s: any) => s.priority === 'mvp') ?? [])
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
      if (!data.success) throw new Error(data.detail ? `${data.error} — ${data.detail}` : data.error)
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
    setEditingCard(null)
    setClassifiedFields({ problem: '', user: '', productType: '', goal: '' })
    setQuickType('')
    setClassification(null)
    setGenerated(null)
    setJtbdFields({ functional: '', emotional: '', social: '' })
    setEditableScreens([])
    setEditingJtbd(null)
    setEditingScreen(null)
    setShowAddScreen(false)
    setExpandedDetail(null)
    setDetailText({})
    setBrief(null)
    setBriefTab('resumen')
    setError('')
    setAdjustment('')
  }

  const isInputStage = stage === 'input' || stage === 'classifying'
  const isCombinedStage = stage === 'classified' || stage === 'generating' || stage === 'generated' || stage === 'refining'
  const isLoading = stage === 'generating' || stage === 'refining'

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 transition-colors">

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-zinc-950/95 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">RBStudio Flow</span>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded">BETA</span>
          </div>
          <span className="hidden sm:block text-zinc-300 dark:text-zinc-700">|</span>
          <span className="hidden sm:block text-sm text-zinc-400 dark:text-zinc-500">Transformamos ideas en especificaciones listas para construir en minutos</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Historial
          </button>
          <div className="flex items-center gap-1 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
            <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <svg className="w-3 h-3 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </nav>

      <div className={`mx-auto px-6 pt-20 pb-12 transition-all ${isCombinedStage ? 'max-w-6xl' : 'max-w-5xl'}`}>

        {/* ERROR */}
        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* ── ETAPA 1: INPUT ── */}
        {isInputStage && (
          <>
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                Transformamos ideas en{' '}
                <span className="text-indigo-500">especificaciones listas</span>
                {' '}para construir en minutos
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 mt-3 text-base">
                Alinea negocio, diseño y desarrollo antes de escribir una línea de código.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

                    {/* Step 3 */}
                    <div className="p-6 flex flex-col gap-3 bg-zinc-50 dark:bg-zinc-900">
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
                      <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 dark:bg-blue-950 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                        <span className="shrink-0 text-blue-500">✦</span>
                        <span>
                          No necesitas tenerlo claro.{' '}
                          <span className="font-medium underline underline-offset-2 cursor-pointer">Nosotros te ayudamos a darle forma.</span>
                        </span>
                      </div>
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

              {/* Sidebar */}
              <div className="flex flex-col gap-5">
                <Card className="shadow-none border border-zinc-200 dark:border-zinc-800">
                  <CardContent className="flex flex-col gap-5 p-5">
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">Así funciona</p>
                    <div className="flex flex-col gap-4">
                      {[
                        { n: 1, title: 'Cuéntanos tu idea', desc: 'Elige desde dónde partes y escríbenos en tus palabras.' },
                        { n: 2, title: 'Analizamos y entendemos', desc: 'Detectamos lo clave, te hacemos 1 o 2 preguntas si hace falta.' },
                        { n: 3, title: 'Recibes tu especificación y preview', desc: 'Una especificación completa + una primera versión visual para que lo veas al instante.' },
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

        {/* ── ETAPA 2: VISTA COMBINADA (generating / generated / refining) ── */}
        {isCombinedStage && classification && (
          <div className="flex gap-6 items-start">

            {/* LEFT SIDEBAR NAV */}
            <aside className="w-44 shrink-0 sticky top-20 self-start hidden lg:flex flex-col gap-1">
              {[
                {
                  id: 'resumen', label: 'Resumen', sub: 'Lo que entendimos',
                  icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                },
                {
                  id: 'jtbd', label: 'JTBD', sub: 'Jobs to be done',
                  icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                },
                {
                  id: 'pantallas', label: 'Pantallas MVP', sub: 'Lo esencial v1',
                  icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                },
                {
                  id: 'ajustes', label: 'Ajustes', sub: 'Refina tu idea',
                  icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                },
                {
                  id: 'siguiente', label: 'Siguiente paso', sub: 'Generar especificación',
                  icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                },
              ].map((item, i) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all group ${
                    i === 0
                      ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300'
                      : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <span className={i === 0 ? 'text-indigo-500' : 'text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'}>
                    {item.icon}
                  </span>
                  <div>
                    <p className="text-xs font-semibold leading-tight">{item.label}</p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-tight mt-0.5">{item.sub}</p>
                  </div>
                </a>
              ))}

              {/* Tip card */}
              <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-950 rounded-xl border border-emerald-100 dark:border-emerald-900">
                <div className="flex items-center gap-1.5 mb-1">
                  <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Navegación rápida</p>
                </div>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Usá el menú para saltar a las secciones y revisar cada parte.
                </p>
              </div>
            </aside>

            {/* MAIN CONTENT */}
            <div className="flex-1 flex flex-col gap-8 min-w-0">

              {/* ── HEADER ── */}
              <div id="resumen" className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400 text-lg">
                    ✦
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Esto entendimos de tu idea</h2>
                      <span className="text-xs font-medium px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded">Borrador</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">Revisá, editalo o ajustá lo que detectamos. Así generamos la mejor especificación para vos.</p>
                      <button className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 whitespace-nowrap shrink-0">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        ¿Por qué esto?
                      </button>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-zinc-400 mb-1 flex items-center gap-1 justify-end">
                    Confianza
                    <Tooltip text="Qué tan seguro está el sistema de haber interpretado bien tu idea. Un 80%+ indica una lectura muy precisa.">
                      <svg className="w-3 h-3 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </Tooltip>
                  </p>
                  <p className={`text-4xl font-bold ${classification.confidence > 70 ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {classification.confidence}%
                  </p>
                  <div className="w-32 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full mt-2">
                    <div
                      className={`h-full rounded-full ${classification.confidence > 70 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      style={{ width: `${classification.confidence}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* ── 4 CARDS ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { id: 'problem', label: 'PROBLEMA', color: 'text-blue-500', iconBg: 'bg-blue-100 dark:bg-blue-900', icon: '🎯', value: classifiedFields.problem },
                  { id: 'user', label: 'USUARIO', color: 'text-emerald-500', iconBg: 'bg-emerald-100 dark:bg-emerald-900', icon: '👥', value: classifiedFields.user },
                  { id: 'productType', label: 'TIPO DE PRODUCTO', color: 'text-purple-500', iconBg: 'bg-purple-100 dark:bg-purple-900', icon: '📦', value: classifiedFields.productType },
                  { id: 'goal', label: 'OBJETIVO PRINCIPAL', color: 'text-amber-500', iconBg: 'bg-amber-100 dark:bg-amber-900', icon: '🚩', value: classifiedFields.goal },
                ].map((card) => (
                  <div key={card.id} className="flex flex-col gap-3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
                    <div className="flex items-start justify-between">
                      <div className={`w-9 h-9 rounded-lg ${card.iconBg} flex items-center justify-center text-base`}>
                        {card.icon}
                      </div>
                      <button
                        onClick={() => setEditingCard(editingCard === card.id ? null : card.id)}
                        className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Editar
                      </button>
                    </div>
                    <p className={`text-[10px] font-bold tracking-widest uppercase ${card.color}`}>{card.label}</p>
                    {editingCard === card.id ? (
                      <textarea
                        value={card.value}
                        onChange={(e) => setClassifiedFields(prev => ({ ...prev, [card.id]: e.target.value }))}
                        onBlur={() => setEditingCard(null)}
                        autoFocus
                        rows={4}
                        className="text-sm text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 resize-none w-full focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      />
                    ) : (
                      <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed flex-1">
                        {card.value.split(/\*\*(.+?)\*\*/g).map((part, i) =>
                          i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                        )}
                      </p>
                    )}
                    {expandedDetail === card.id ? (
                      <div className="flex flex-col gap-2 mt-1">
                        <textarea
                          value={detailText[card.id] || ''}
                          onChange={(e) => setDetailText(prev => ({ ...prev, [card.id]: e.target.value }))}
                          autoFocus
                          rows={2}
                          placeholder="Agrega contexto adicional..."
                          className="text-xs text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 resize-none w-full focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const extra = detailText[card.id]?.trim()
                              if (extra) setClassifiedFields(prev => ({ ...prev, [card.id]: prev[card.id as keyof typeof prev] + '\n\n' + extra }))
                              setDetailText(prev => ({ ...prev, [card.id]: '' }))
                              setExpandedDetail(null)
                            }}
                            className={`text-xs font-medium px-2 py-1 rounded-lg ${card.color} bg-zinc-100 dark:bg-zinc-800 hover:opacity-80 transition-opacity`}
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => { setDetailText(prev => ({ ...prev, [card.id]: '' })); setExpandedDetail(null) }}
                            className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors px-2 py-1"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setExpandedDetail(card.id)}
                        className={`flex items-center gap-1 text-xs ${card.color} hover:opacity-70 transition-opacity mt-auto`}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Agregar detalle
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* ── AJUSTES RÁPIDOS ── */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="shrink-0">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Ajustes rápidos</p>
                  <p className="text-xs text-zinc-400">Cambia lo esencial en 1 clic</p>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { id: 'saas', label: 'SaaS' },
                    { id: 'app-movil', label: 'App móvil' },
                    { id: 'sitio-web', label: 'Sitio web' },
                  ].map((t) => {
                    const active = quickType === t.id
                    return (
                      <button
                        key={t.id}
                        onClick={() => setQuickType(t.id)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          active
                            ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                            : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                        }`}
                      >
                        {t.label}
                        {active && (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    )
                  })}
                </div>
                <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-700 shrink-0" />
                <div className="flex items-center gap-1.5 flex-wrap">
                  {startingOptions.map((opt) => {
                    const active = startingPoint === opt.id
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setStartingPoint(opt.id)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          active
                            ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                            : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                        }`}
                      >
                        {opt.title}
                        {active && (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    )
                  })}
                </div>
                <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-700 shrink-0" />
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs text-zinc-500">Nivel de claridad:</span>
                  {[
                    { id: 'sketch', label: 'Explorando' },
                    { id: 'launch', label: 'Tengo claro' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setAmbitionLevel(opt.id)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        ambitionLevel === opt.id
                          ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                          : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                      }`}
                    >
                      {opt.label}
                      {ambitionLevel === opt.id && (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── JTBD SECTION ── */}
              <div id="jtbd" className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">JTBD — Lo que tu usuario necesita lograr</h3>
                    <Tooltip text="Jobs to be Done: las razones reales por las que alguien usaría tu producto, más allá de las funciones técnicas.">
                      <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </Tooltip>
                  </div>
                </div>

                {isLoading || !generated ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-700 animate-pulse">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800" />
                          <div className="h-4 w-20 bg-zinc-100 dark:bg-zinc-800 rounded" />
                        </div>
                        <div className="space-y-2">
                          <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-full" />
                          <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-5/6" />
                          <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-4/6" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      {
                        key: 'functional' as const,
                        type: 'Funcional',
                        iconBg: 'bg-rose-100 dark:bg-rose-950',
                        iconColor: 'text-rose-500',
                        ringColor: 'focus:ring-rose-300',
                        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
                      },
                      {
                        key: 'emotional' as const,
                        type: 'Emocional',
                        iconBg: 'bg-violet-100 dark:bg-violet-950',
                        iconColor: 'text-violet-500',
                        ringColor: 'focus:ring-violet-300',
                        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                      },
                      {
                        key: 'social' as const,
                        type: 'Social',
                        iconBg: 'bg-amber-100 dark:bg-amber-950',
                        iconColor: 'text-amber-500',
                        ringColor: 'focus:ring-amber-300',
                        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
                      },
                    ].map((item) => (
                      <div key={item.type} className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl ${item.iconBg} flex items-center justify-center ${item.iconColor}`}>
                              {item.icon}
                            </div>
                            <p className="font-semibold text-zinc-800 dark:text-zinc-200">{item.type}</p>
                          </div>
                          <button
                            onClick={() => setEditingJtbd(editingJtbd === item.key ? null : item.key)}
                            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            Editar
                          </button>
                        </div>
                        {editingJtbd === item.key ? (
                          <textarea
                            value={jtbdFields[item.key]}
                            onChange={(e) => setJtbdFields(prev => ({ ...prev, [item.key]: e.target.value }))}
                            onBlur={() => setEditingJtbd(null)}
                            autoFocus
                            rows={4}
                            className={`text-sm text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 resize-none w-full focus:outline-none focus:ring-2 ${item.ringColor}`}
                          />
                        ) : (
                          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{jtbdFields[item.key]}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── MVP SCREENS ── */}
              <div id="pantallas" className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">PANTALLAS MVP — Lo esencial en la versión 1</h3>
                  <Tooltip text="Las pantallas mínimas necesarias para que tu producto funcione. Podés editar, eliminar o agregar nuevas según tu visión.">
                    <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </Tooltip>
                </div>

                {isLoading || !generated ? (
                  <div className="flex flex-col items-center py-10 gap-6">
                    <div className="relative w-10 h-10">
                      <div className="absolute inset-0 rounded-full border-4 border-zinc-100 dark:border-zinc-800" />
                      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin" />
                    </div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Definiendo pantallas del MVP...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {editableScreens.map((screen: any, i: number) => (
                      <div key={i} className="relative p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
                        {editingScreen === i ? (
                          <div className="flex flex-col gap-2">
                            <input
                              value={editScreenData.name}
                              onChange={(e) => setEditScreenData(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Nombre de la pantalla"
                              className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-indigo-300"
                            />
                            <textarea
                              value={editScreenData.job}
                              onChange={(e) => setEditScreenData(prev => ({ ...prev, job: e.target.value }))}
                              placeholder="Descripción del job"
                              rows={2}
                              className="text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 w-full resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditableScreens(prev => prev.map((s, idx) => idx === i ? { ...s, name: editScreenData.name, job: editScreenData.job } : s))
                                  setEditingScreen(null)
                                }}
                                className="text-xs font-medium px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 hover:opacity-80 transition-opacity"
                              >
                                Guardar
                              </button>
                              <button onClick={() => setEditingScreen(null)} className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors px-2 py-1">
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-3">
                            <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 shrink-0">
                              {screenIcons[i % screenIcons.length]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 leading-tight">{screen.name}</p>
                              <p className="text-[10px] text-zinc-400 leading-snug mt-0.5">{screen.job}</p>
                              {screen.components?.length > 0 && (
                                <div className="mt-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                                  <div className="max-h-64 overflow-y-auto flex flex-col pr-1">
                                    {screen.components.map((comp: any, j: number) => (
                                      <div key={j} className={j > 0 ? 'pt-3 mt-3 border-t border-zinc-100 dark:border-zinc-800' : ''}>
                                        <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{comp.name}</p>
                                        {comp.action && (
                                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">{comp.action}</p>
                                        )}
                                        {comp.states?.length > 0 && (
                                          <div className="flex flex-wrap gap-1 mt-1.5">
                                            {comp.states.map((s: string, k: number) => (
                                              <span key={k} className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">{s}</span>
                                            ))}
                                          </div>
                                        )}
                                        <div className="mt-1 flex flex-col gap-0.5">
                                          {([['Trigger', comp.trigger], ['Feedback', comp.feedback], ['Edge case', comp.edge_case]] as [string, string][]).map(([label, val]) =>
                                            val ? (
                                              <div key={label} className="flex gap-2">
                                                <span className="text-[10px] text-zinc-400 w-[58px] shrink-0 pt-px">{label}</span>
                                                <span className="text-[10px] text-zinc-700 dark:text-zinc-300">{val}</span>
                                              </div>
                                            ) : null
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col gap-1 shrink-0">
                              <button
                                onClick={() => { setEditingScreen(i); setEditScreenData({ name: screen.name, job: screen.job }) }}
                                className="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 flex items-center justify-center text-zinc-400 hover:text-indigo-500 transition-colors"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => setEditableScreens(prev => prev.filter((_, idx) => idx !== i))}
                                className="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-950 flex items-center justify-center text-zinc-400 hover:text-red-500 transition-colors"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        )}
                        <span className="absolute bottom-2 left-2 w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-[10px] font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                      </div>
                    ))}

                    {/* Add new screen */}
                    {showAddScreen ? (
                      <div className="p-4 rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-950 flex flex-col gap-2">
                        <input
                          value={newScreenData.name}
                          onChange={(e) => setNewScreenData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Nombre de la pantalla"
                          autoFocus
                          className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        />
                        <textarea
                          value={newScreenData.job}
                          onChange={(e) => setNewScreenData(prev => ({ ...prev, job: e.target.value }))}
                          placeholder="¿Qué hace el usuario aquí?"
                          rows={2}
                          className="text-xs text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 w-full resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              if (newScreenData.name.trim()) {
                                setEditableScreens(prev => [...prev, { name: newScreenData.name, job: newScreenData.job, priority: 'mvp' }])
                                setNewScreenData({ name: '', job: '' })
                                setShowAddScreen(false)
                              }
                            }}
                            className="text-xs font-medium px-2 py-1 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
                          >
                            Agregar
                          </button>
                          <button onClick={() => { setShowAddScreen(false); setNewScreenData({ name: '', job: '' }) }} className="text-xs text-zinc-400 hover:text-zinc-600 px-2 py-1">
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowAddScreen(true)}
                        className="p-4 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950 flex flex-col items-center justify-center gap-2 text-zinc-400 hover:text-indigo-500 transition-all min-h-[80px]"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="text-xs font-medium">Agregar pantalla</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* ── AJUSTE INPUT ── */}
              <div id="ajustes" className="flex items-start gap-4 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-500 shrink-0 mt-0.5">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">¿Querés ajustar algo?</p>
                  <p className="text-xs text-zinc-400 mb-3">Contanos en lenguaje natural y lo adaptamos al instante.</p>
                  <div className="flex gap-2">
                    <textarea
                      value={adjustment}
                      onChange={(e) => setAdjustment(e.target.value)}
                      placeholder="Ej: enfoca más en B2B, agrega pantalla de reportes al MVP..."
                      rows={2}
                      className="flex-1 text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-700 text-zinc-700 dark:text-zinc-300 placeholder-zinc-400"
                    />
                    <button
                      onClick={handleRefine}
                      disabled={!adjustment.trim() || stage === 'refining'}
                      className="w-9 h-9 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center shrink-0 self-end transition-colors"
                    >
                      {stage === 'refining' ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* ── FOOTER ── */}
              <div id="siguiente" className="flex items-center justify-between gap-3 flex-wrap">
                <Button variant="outline" onPress={handleReset}>
                  ← Volver a la idea
                </Button>
                <Button
                  variant="outline"
                  onPress={handleClassify}
                  isPending={stage === 'generating'}
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Regenerar interpretación
                </Button>
                <Button
                  onPress={handleBrief}
                  isDisabled={!generated || stage === 'generating' || stage === 'refining'}
                  className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 font-medium rounded-xl"
                >
                  Generar especificación final →
                </Button>
              </div>

            </div>
          </div>
        )}

        {/* ── LOADING BRIEF ── */}
        {stage === 'briefing' && (
          <Card className="shadow-none border border-zinc-200 dark:border-zinc-800">
            <CardContent className="p-0">
              <StepLoader steps={[
                'Analizando tu idea...',
                'Identificando usuarios y contexto...',
                'Definiendo pantallas del MVP...',
                'Especificando componentes y comportamientos...',
                'Preparando tu especificación...',
              ]} totalSeconds={50} />
            </CardContent>
          </Card>
        )}

        {/* ── ETAPA 3: BRIEF COMPLETO ── */}
        {stage === 'complete' && brief?.brief && (() => {
          const b = brief.brief
          return (
            <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">

              {/* Header */}
              <div className="flex items-center justify-between gap-4 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-2xl shrink-0">
                    ✦
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Especificación lista</p>
                    <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight">{b.product_name}</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-0.5">{b.tagline}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-zinc-400 mb-1 flex items-center gap-1 justify-end">
                    Confianza
                    <Tooltip text="Qué tan seguro está el sistema de haber interpretado bien tu idea.">
                      <svg className="w-3 h-3 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </Tooltip>
                  </p>
                  <p className={`text-4xl font-bold ${(classification?.confidence ?? 85) > 70 ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {classification?.confidence ?? 85}%
                  </p>
                  <div className="w-32 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full mt-2">
                    <div
                      className={`h-full rounded-full ${(classification?.confidence ?? 85) > 70 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      style={{ width: `${classification?.confidence ?? 85}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Custom tabs */}
              {(() => {
                const tabs = [
                  {
                    id: 'resumen', label: 'Resumen',
                    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
                  },
                  {
                    id: 'usuario', label: 'Usuario',
                    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
                  },
                  {
                    id: 'pantallas', label: 'Pantallas MVP',
                    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
                  },
                  {
                    id: 'componentes', label: 'Componentes',
                    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>,
                  },
                ]
                return (
                  <div className="flex flex-col gap-3">
                    {/* Tab bar */}
                    <div className="flex gap-1 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                      {tabs.map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setBriefTab(tab.id)}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            briefTab === tab.id
                              ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300'
                              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                          }`}
                        >
                          <span className={briefTab === tab.id ? 'text-indigo-500' : ''}>{tab.icon}</span>
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Tab content */}
                    <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 min-h-[120px]">
                      {briefTab === 'resumen' && (
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{b.overview}</p>
                      )}
                      {briefTab === 'usuario' && (
                        <div className="flex flex-col gap-3">
                          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{b.target_user?.primary}</p>
                          {b.target_user?.pain_points?.length > 0 && (
                            <div className="flex flex-col gap-1.5 mt-1">
                              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Pain points</p>
                              {b.target_user.pain_points.map((p: string, i: number) => (
                                <div key={i} className="flex gap-2 items-start">
                                  <span className="text-zinc-300 dark:text-zinc-600 mt-0.5">–</span>
                                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{p}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      {briefTab === 'pantallas' && (
                        <div className="flex flex-col gap-4">
                          {b.mvp_screens?.map((s: any, i: number) => (
                            <div key={i}>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                                <p className="font-semibold text-sm text-zinc-800 dark:text-zinc-200">{s.name}</p>
                              </div>
                              <p className="text-xs text-zinc-400 mb-2 ml-7">{s.job}</p>
                              <div className="flex flex-wrap gap-1 ml-7">
                                {s.key_components?.map((c: string, j: number) => (
                                  <Chip key={j} size="sm" variant="soft">{c}</Chip>
                                ))}
                              </div>
                              {i < b.mvp_screens.length - 1 && <Separator className="mt-4" />}
                            </div>
                          ))}
                        </div>
                      )}
                      {briefTab === 'componentes' && (
                        <div className="flex flex-wrap gap-2">
                          {b.component_inventory?.map((c: string, i: number) => (
                            <Chip key={i} size="sm" color="accent" variant="soft">{c}</Chip>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })()}

              {/* Action grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    label: 'Descargar JSON', desc: 'Exporta la especificación como archivo .json con toda la estructura de datos.',
                    iconBg: 'bg-emerald-100 dark:bg-emerald-900', iconColor: 'text-emerald-600 dark:text-emerald-400',
                    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
                    action: downloadJSON,
                  },
                  {
                    label: 'Descargar Markdown', desc: 'Exporta la especificación como archivo .md legible. Listo para pegar en Notion o Drive.',
                    iconBg: 'bg-violet-100 dark:bg-violet-900', iconColor: 'text-violet-600 dark:text-violet-400',
                    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
                    action: downloadMarkdown,
                  },
                  {
                    label: 'Editar especificación', desc: 'Regresa para hacer más ajustes sin perder el contexto.',
                    iconBg: 'bg-indigo-100 dark:bg-indigo-900', iconColor: 'text-indigo-600 dark:text-indigo-400',
                    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
                    action: handleEditBrief,
                  },
                  {
                    label: 'Nueva idea', desc: 'Resetea todo y empieza desde cero.',
                    iconBg: 'bg-amber-100 dark:bg-amber-900', iconColor: 'text-amber-600 dark:text-amber-400',
                    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
                    action: handleReset,
                  },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="flex items-center gap-4 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm transition-all text-left"
                  >
                    <div className={`w-11 h-11 rounded-xl ${item.iconBg} flex items-center justify-center ${item.iconColor} shrink-0`}>
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{item.label}</p>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Wireframe — full width */}
              <button
                onClick={handleWireframe}
                className="flex items-center gap-4 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-rose-200 dark:hover:border-rose-800 hover:shadow-sm transition-all text-left w-full"
              >
                <div className="w-11 h-11 rounded-xl bg-rose-100 dark:bg-rose-900 flex items-center justify-center text-rose-500 shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Ver wireframe preview</p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">Genera una vista visual de cada pantalla del MVP.</p>
                </div>
              </button>

            </div>
          )
        })()}

        {/* ── WIREFRAME LOADING ── */}
        {stage === 'wireframing' && (
          <Card className="shadow-none border border-zinc-200 dark:border-zinc-800">
            <CardContent className="p-0">
              <StepLoader steps={[
                'Interpretando la especificación...',
                'Diseñando la estructura de cada pantalla...',
                'Generando el HTML de los wireframes...',
                'Casi listo...',
              ]} totalSeconds={35} />
            </CardContent>
          </Card>
        )}

        {/* ── WIREFRAME PREVIEW ── */}
        {stage === 'wireframe' && wireframes.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Wireframe preview</p>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Prototipo navegable</h2>
                <p className="text-xs text-zinc-400 mt-0.5">Usá la nav superior para navegar entre pantallas</p>
              </div>
            </div>

            {/* Browser frame */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden shadow-md">
              {/* Browser chrome */}
              <div className="bg-zinc-100 dark:bg-zinc-800 px-3 py-2 flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-700">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 bg-white dark:bg-zinc-900 rounded-md px-3 py-1 text-xs text-zinc-400 border border-zinc-200 dark:border-zinc-600 ml-1">
                  localhost:3000
                </div>
              </div>
              {/* iframe */}
              <iframe
                srcDoc={wireframes[0].html}
                sandbox="allow-scripts"
                className="w-full"
                style={{ height: 640, display: 'block' }}
                title="Wireframe preview"
              />
            </div>

            <Button variant="outline" size="sm" onPress={handleReset} className="w-fit">← Nueva idea</Button>
          </div>
        )}

      </div>
    </main>
  )
}
