'use client'

import { useState } from 'react'
import { Button, Card, CardContent, CardHeader, Chip, Switch, TextArea, Separator } from '@heroui/react'

type Stage = 'input' | 'classifying' | 'classified' | 'generating' | 'generated' | 'refining' | 'briefing' | 'complete'

export default function Home() {
  const [stage, setStage] = useState<Stage>('input')
  const [idea, setIdea] = useState('')
  const [classification, setClassification] = useState<any>(null)
  const [generated, setGenerated] = useState<any>(null)
  const [brief, setBrief] = useState<any>(null)
  const [adjustment, setAdjustment] = useState('')
  const [error, setError] = useState('')
  const [isDark, setIsDark] = useState(false)

  function toggleTheme() {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark')
  }

  async function handleClassify() {
    if (!idea.trim()) return
    setStage('classifying')
    setError('')
    try {
      const res = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea }),
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

  function handleReset() {
    setStage('input')
    setIdea('')
    setClassification(null)
    setGenerated(null)
    setBrief(null)
    setError('')
    setAdjustment('')
  }

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors">
      <div className="max-w-2xl mx-auto px-6 py-12">

        {/* HEADER */}
        <div className="flex items-start justify-between mb-12">
          <div>
            <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100">RBStudio Flow</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">De idea a brief de diseño en minutos</p>
          </div>
          <Switch
            isSelected={isDark}
            onChange={toggleTheme}
            size="sm"
            className="mt-1"
          />
        </div>

        {/* ERROR */}
        {error && (
          <Card className="mb-6 border border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
            <CardContent>
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* ETAPA 1 — INPUT */}
        {(stage === 'input' || stage === 'classifying') && (
          <Card className="shadow-none border border-zinc-200 dark:border-zinc-800">
            <CardHeader className="pb-0">
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">¿Cuál es tu idea?</p>
            </CardHeader>
            <CardContent className="gap-4">
              <TextArea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Describe tu producto en una o dos oraciones..."
                rows={4}
              />
              <Button
                onPress={handleClassify}
                isPending={stage === 'classifying'}
                isDisabled={!idea.trim()}
                className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 w-fit"
              >
                {stage === 'classifying' ? 'Clasificando...' : 'Analizar idea →'}
              </Button>
            </CardContent>
          </Card>
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
                  Generar JTBD y arquitectura →
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* LOADING GENERATE */}
        {stage === 'generating' && (
          <Card className="shadow-none border border-zinc-200 dark:border-zinc-800">
            <CardContent className="py-16 items-center gap-2">
              <p className="text-zinc-600 dark:text-zinc-400">Generando JTBD y arquitectura...</p>
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
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">JTBD</p>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Chip size="sm" variant="soft" className="shrink-0">Funcional</Chip>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{generated.jtbd?.functional}</p>
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
                <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-3">{brief.brief.overview}</p>
              </CardContent>
            </Card>

            <Card className="shadow-none border border-zinc-200 dark:border-zinc-800">
              <CardHeader><p className="font-semibold">Usuario objetivo</p></CardHeader>
              <CardContent className="pt-0 gap-3">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{brief.brief.target_user?.primary}</p>
                <div className="flex flex-col gap-1">
                  {brief.brief.target_user?.pain_points?.map((p: string, i: number) => (
                    <div key={i} className="flex gap-2 items-start">
                      <span className="text-zinc-400 text-sm mt-0.5">–</span>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">{p}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-none border border-zinc-200 dark:border-zinc-800">
              <CardHeader><p className="font-semibold">Pantallas MVP</p></CardHeader>
              <CardContent className="pt-0 gap-4">
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
              </CardContent>
            </Card>

            <Card className="shadow-none border border-zinc-200 dark:border-zinc-800">
              <CardHeader><p className="font-semibold">Componentes UI</p></CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2">
                  {brief.brief.component_inventory?.map((c: string, i: number) => (
                    <Chip key={i} size="sm" color="accent" variant="soft">{c}</Chip>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button variant="outline" onPress={handleReset} className="w-fit">
              ← Nueva idea
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}