"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { addDays, format, isSameDay, startOfWeek } from "date-fns"
import { pt } from "date-fns/locale"
import { ArrowLeft, CalendarDays, Check, ChevronLeft, ChevronRight, Droplets, Dumbbell, ExternalLink, Loader2, MapPin, Plus, Scale } from "lucide-react"

const events = [
  { offset: 0, title: "Check-in de bem-estar", type: "Rotina", icon: Scale },
  { offset: 1, title: "Treino de força", type: "Movimento", icon: Dumbbell },
  { offset: 2, title: "Beber 2L de água", type: "Hidratação", icon: Droplets },
  { offset: 4, title: "Rever horário escolar", type: "Estudos", icon: CalendarDays },
]

const SCHOOL_CALENDAR_URL = "https://inforestudante.ipc.pt/nonio/util/sincronizaHorarioNonio.do?chave=c56f307b13857690ba5febb6617cd06c&locale=PT"

export default function CalendarPage() {
  const [selected, setSelected] = useState(new Date())
  const [locationState, setLocationState] = useState<"idle" | "checking" | "detected" | "denied">("idle")
  const [locationText, setLocationText] = useState("")
  const [classCheckIn, setClassCheckIn] = useState(false)
  const [nonioUrl, setNonioUrl] = useState(SCHOOL_CALENDAR_URL)
  const [nonioState, setNonioState] = useState<"idle" | "syncing" | "synced" | "error">("idle")
  const [nonioEvents, setNonioEvents] = useState<Array<{ title: string; location: string; start: string }>>([])
  const [nonioMessage, setNonioMessage] = useState("")
  const [week, setWeek] = useState(new Date())
  const start = startOfWeek(week, { weekStartsOn: 1 })
  const days = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(start, index)), [start])
  const todayStart = new Date().setHours(0, 0, 0, 0)
  const dayOffset = (date: Date) => Math.round((date.getTime() - todayStart) / 86400000)
  const selectedEvents = events.filter((event) => event.offset === dayOffset(selected))

  const syncNonio = async () => {
    setNonioState("syncing")
    setNonioMessage("")
    try {
      const response = await fetch(`/api/calendar/nonio?url=${encodeURIComponent(nonioUrl)}`)
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setNonioEvents(data.events)
      setNonioState("synced")
      setNonioMessage(`${data.events.length} eventos importados. Sincronização automática ativa.`)
    } catch (error) {
      setNonioState("error")
      setNonioMessage(error instanceof Error ? error.message : "Não foi possível sincronizar o horário.")
    }
  }

  useEffect(() => {
    syncNonio()
  }, [])

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationState("denied")
      setLocationText("A localização não está disponível neste dispositivo.")
      return
    }
    setLocationState("checking")
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocationState("detected")
        setLocationText(`Localização detetada (${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}).`)
        const classEventToday = nonioEvents.some((event) => {
          const eventDate = new Date(event.start)
          const today = new Date()
          return eventDate.toDateString() === today.toDateString() && /aula|class|lesson|teórica|prática/i.test(`${event.title} ${event.location}`)
        })
        if (classEventToday) setClassCheckIn(true)
      },
      () => {
        setLocationState("denied")
        setLocationText("Não foi possível aceder à localização. Podes permitir o acesso no navegador.")
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    )
  }

  useEffect(() => {
    detectLocation()
  }, [])

  useEffect(() => {
    if (locationState !== "detected") return
    const classEventToday = nonioEvents.some((event) => {
      const eventDate = new Date(event.start)
      const today = new Date()
      return eventDate.toDateString() === today.toDateString() && /aula|class|lesson|teórica|prática/i.test(`${event.title} ${event.location}`)
    })
    if (classEventToday) setClassCheckIn(true)
  }, [locationState, nonioEvents])

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

        <section className="mb-5 grid gap-4 md:grid-cols-2">
          <a href={SCHOOL_CALENDAR_URL} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-[24px] border border-[#8bd8c3]/25 bg-[#14231f] p-5 transition hover:border-[#8bd8c3]/60">
            <div><p className="text-xs uppercase tracking-[.2em] text-[#9dbab0]">Calendário escolar</p><p className="mt-2 text-sm font-medium">Sincronizar horário do Nónio</p><p className="mt-1 text-xs text-[#9dbab0]">Abre o teu calendário escolar oficial.</p></div><ExternalLink className="h-5 w-5 text-[#8bd8c3]" />
          </a>
          <div className="rounded-[24px] border border-white/10 bg-[#111b24] p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-[.2em] text-[#8da4a7]">Check-in por localização</p><p className="mt-2 text-sm font-medium">Estás num local marcado?</p><p className="mt-1 text-xs text-[#8da4a7]">A plataforma verifica automaticamente a tua localização ao abrir o calendário.</p></div><MapPin className="h-5 w-5 shrink-0 text-[#f5a6c8]" /></div><button onClick={detectLocation} disabled={locationState === "checking"} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#8bd8c3] px-3 py-2 text-xs font-semibold text-[#081018] disabled:opacity-60">{locationState === "checking" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}{locationState === "detected" ? "Local marcado como feito" : "Detetar localização"}</button>{locationText && <p className="mt-3 text-xs text-[#9dbab0]" role="status">{locationText}</p>}</div>
        </section>

        <section className="mb-5 rounded-[24px] border border-[#f5a6c8]/25 bg-[#211923] p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <p className="text-xs uppercase tracking-[.2em] text-[#f5a6c8]">Horário escolar ligado</p>
              <h2 className="mt-2 text-xl font-semibold">Sincronização automática do Nónio</h2>
              <p className="mt-1 text-sm leading-6 text-[#d6c8d0]">O horário é consultado ao abrir esta página e atualizado periodicamente. Os eventos aparecem abaixo sem precisares de os copiar manualmente.</p>
            </div>
            <button onClick={syncNonio} disabled={nonioState === "syncing"} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#f5a6c8] px-4 py-2.5 text-sm font-semibold text-[#211923] disabled:opacity-60"><Loader2 className={`h-4 w-4 ${nonioState === "syncing" ? "animate-spin" : "hidden"}`} />{nonioState === "syncing" ? "A sincronizar..." : "Atualizar agora"}</button>
          </div>
          <label className="mt-5 block text-xs font-medium text-[#d6c8d0]" htmlFor="nonio-url">Endereço privado de exportação</label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row"><input id="nonio-url" value={nonioUrl} onChange={(event) => setNonioUrl(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-xs text-white outline-none ring-[#f5a6c8] focus:ring-2" /><button onClick={syncNonio} className="rounded-xl border border-[#f5a6c8]/40 px-4 py-2 text-xs font-semibold text-[#f5a6c8] hover:bg-[#f5a6c8]/10">Guardar e sincronizar</button></div>
          {nonioMessage && <p className={`mt-3 text-xs ${nonioState === "error" ? "text-red-300" : "text-[#a9e3d0]"}`} role="status">{nonioMessage}</p>}
          {classCheckIn && <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#8bd8c3]/30 bg-[#8bd8c3]/10 p-4"><Check className="mt-0.5 h-5 w-5 shrink-0 text-[#8bd8c3]" /><div><p className="text-sm font-semibold text-[#c9f4e6]">Aula detetada e marcada como feita</p><p className="mt-1 text-xs leading-5 text-[#a9e3d0]">Estás num local associado a uma aula do horário de hoje. O check-in foi refletido na tua rotina.</p><Link href="/dashboard/habits" className="mt-3 inline-flex text-xs font-semibold text-[#8bd8c3] underline-offset-4 hover:underline">Ver hábito “Aulas”</Link></div></div>}
          {nonioEvents.length > 0 && <div className="mt-5 grid gap-2 sm:grid-cols-2">{nonioEvents.slice(0, 6).map((event, index) => <div key={`${event.start}-${index}`} className="rounded-xl border border-white/10 bg-black/15 px-3 py-3"><p className="text-sm font-medium">{event.title}</p><p className="mt-1 text-xs text-[#b7a8b0]">{new Date(event.start).toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" })}{event.location ? ` · ${event.location}` : ""}</p></div>)}</div>}
        </section>

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
