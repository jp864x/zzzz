"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { addDays, format, isSameDay, startOfWeek } from "date-fns"
import { pt } from "date-fns/locale"
import { ArrowLeft, CalendarDays, Check, ChevronLeft, ChevronRight, Droplets, Dumbbell, Plus, Scale } from "lucide-react"

const events = [
  { offset: 0, title: "Check-in de bem-estar", type: "Rotina", icon: Scale },
  { offset: 1, title: "Treino de força", type: "Movimento", icon: Dumbbell },
  { offset: 2, title: "Beber 2L de água", type: "Hidratação", icon: Droplets },
  { offset: 4, title: "Preparar receitas leves", type: "Nutrição", icon: CalendarDays },
]

export default function CalendarPage() {
  const [selected, setSelected] = useState(new Date())
  const [week, setWeek] = useState(new Date())
  const start = startOfWeek(week, { weekStartsOn: 1 })
  const days = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(start, index)), [start])
  const todayStart = new Date().setHours(0, 0, 0, 0)
  const dayOffset = (date: Date) => Math.round((date.getTime() - todayStart) / 86400000)
  const selectedEvents = events.filter((event) => event.offset === dayOffset(selected))

  return (
    <main className="min-h-screen bg-[#081018] px-4 py-6 text-[#edf4f1] sm:px-8 lg:px-12 lg:py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <Link href="/dashboard" className="mb-5 inline-flex items-center gap-2 text-sm text-[#8bd8c3] hover:text-white"><ArrowLeft className="h-4 w-4" />Voltar ao dashboard</Link>
            <p className="text-xs uppercase tracking-[.25em] text-[#8da4a7]">Organiza o teu ritmo</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">Calendário de bem-estar</h1>
          </div>
          <div className="hidden rounded-2xl border border-white/10 bg-[#111b24] p-4 sm:block"><CalendarDays className="h-6 w-6 text-[#8bd8c3]" /></div>
        </header>

        <section className="rounded-[28px] border border-white/10 bg-[#111b24] p-5 sm:p-8">
          <div className="mb-7 flex items-center justify-between">
            <div><p className="text-sm font-medium">{format(week, "MMMM yyyy", { locale: pt })}</p><p className="mt-1 text-xs text-[#8da4a7]">Planeia sem pressão, acompanha com intenção.</p></div>
            <div className="flex gap-2"><button aria-label="Semana anterior" onClick={() => setWeek(addDays(week, -7))} className="rounded-xl border border-white/10 p-2 hover:bg-white/10"><ChevronLeft className="h-4 w-4" /></button><button aria-label="Próxima semana" onClick={() => setWeek(addDays(week, 7))} className="rounded-xl border border-white/10 p-2 hover:bg-white/10"><ChevronRight className="h-4 w-4" /></button></div>
          </div>
          <div className="grid grid-cols-7 gap-2">{days.map((day) => { const active = isSameDay(day, selected); const hasEvent = events.some((event) => event.offset === dayOffset(day)); return <button key={day.toISOString()} onClick={() => setSelected(day)} className={`min-h-24 rounded-2xl border p-2 text-left transition sm:min-h-32 sm:p-4 ${active ? "border-[#8bd8c3] bg-[#8bd8c3]/10" : "border-white/10 bg-white/[.02] hover:bg-white/[.06]"}`}><p className="text-[10px] uppercase text-[#8da4a7]">{format(day, "EEE", { locale: pt })}</p><p className={`mt-2 text-xl font-semibold ${active ? "text-[#8bd8c3]" : "text-white"}`}>{format(day, "d")}</p>{hasEvent && <span className="mt-3 block h-1.5 w-1.5 rounded-full bg-[#f5a6c8]" />}</button> })}</div>
        </section>

        <section className="mt-5 grid gap-5 md:grid-cols-[1fr_.6fr]">
          <div className="rounded-[24px] border border-white/10 bg-[#111b24] p-6"><div className="mb-5 flex items-center justify-between"><div><p className="text-xs uppercase tracking-[.2em] text-[#8da4a7]">Agenda</p><h2 className="mt-1 text-xl font-semibold">{format(selected, "d 'de' MMMM", { locale: pt })}</h2></div><button className="rounded-xl bg-[#8bd8c3] p-2 text-[#081018]" aria-label="Adicionar evento"><Plus className="h-4 w-4" /></button></div>{selectedEvents.length ? <div className="space-y-3">{selectedEvents.map((event) => { const Icon = event.icon; return <div key={event.title} className="flex items-center gap-3 rounded-2xl border border-white/10 p-4"><div className="rounded-xl bg-[#8bd8c3]/10 p-2 text-[#8bd8c3]"><Icon className="h-4 w-4" /></div><div className="flex-1"><p className="text-sm font-medium">{event.title}</p><p className="text-xs text-[#8da4a7]">{event.type}</p></div><Check className="h-4 w-4 text-[#8bd8c3]" /></div> })}</div> : <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-[#8da4a7]">Dia livre. Usa-o para recuperar ou adicionar uma intenção.</div>}</div>
          <div className="rounded-[24px] border border-white/10 bg-[#14231f] p-6"><p className="text-xs uppercase tracking-[.2em] text-[#9dbab0]">Resumo semanal</p><p className="mt-3 text-4xl font-semibold text-[#8bd8c3]">4</p><p className="mt-1 text-sm text-[#c3d4ce]">momentos planeados</p><div className="mt-6 h-2 rounded-full bg-white/10"><div className="h-2 w-3/5 rounded-full bg-[#8bd8c3]" /></div><p className="mt-3 text-xs leading-5 text-[#9dbab0]">O equilíbrio também inclui espaço para não fazer nada.</p></div>
        </section>
      </div>
    </main>
  )
}
