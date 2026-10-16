"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Activity, ArrowUpRight, BookHeart, CalendarDays, Check, Droplets, Dumbbell, Flame, HeartPulse, Home, LogOut, Menu, Scale, Settings, Sparkles, Users, Utensils, X } from "lucide-react"
import { addDays, format } from "date-fns"
import { pt } from "date-fns/locale"
import { StreakCounter } from "@/components/streak-counter"
import { DailyTasks } from "@/components/daily-tasks"
import type { HealthLog, Project, Task } from "@/types"

const nav = [
  { label: "Visão geral", href: "/dashboard", icon: Home },
  { label: "Calendário", href: "/dashboard/calendar", icon: CalendarDays },
  { label: "Peso e nutrição", href: "/dashboard/fitness/weight-loss", icon: Scale },
  { label: "Treinos", href: "/dashboard/fitness", icon: Dumbbell },
  { label: "Receitas", href: "/dashboard/recipes", icon: Utensils },
  { label: "Diário", href: "/dashboard/journal", icon: BookHeart },
  { label: "Social hub", href: "/dashboard/social", icon: Users },
  { label: "Relatórios", href: "/dashboard/reports", icon: Activity },
]

const cards = [
  { title: "Peso e nutrição", detail: "Acompanha medidas, kcal e evolução", href: "/dashboard/fitness/weight-loss", icon: Scale, color: "coral" },
  { title: "Rotina e água", detail: "Hábitos, hidratação e consistência", href: "/dashboard/habits", icon: Droplets, color: "mint" },
  { title: "Meus treinos", detail: "Planos, movimento e recuperação", href: "/dashboard/fitness", icon: Dumbbell, color: "violet" },
  { title: "Receitas leves", detail: "Refeições com calorias e macros", href: "/dashboard/recipes", icon: Utensils, color: "amber" },
  { title: "Meu diário", detail: "Humor, pensamentos e autocuidado", href: "/dashboard/journal", icon: BookHeart, color: "sky" },
  { title: "Social hub", detail: "Comunidade, desafios e conquistas", href: "/dashboard/social", icon: Users, color: "pink" },
]

export default function DashboardPage() {
  const [gender, setGender] = useState<"female" | "male">("female")
  const [menuOpen, setMenuOpen] = useState(false)
  const today = new Date()
  useEffect(() => {
    const saved = sessionStorage.getItem("wellness-gender")
    if (saved === "male" || saved === "female") setGender(saved)
  }, [])

  const healthLogs: HealthLog[] = useMemo(() => Array.from({ length: 30 }, (_, i) => ({ id: `log-${i}`, date: addDays(today, -i), uid: "user1", weight: 65 - i * 0.05, sleep: 7.5, exercises: [], meals: "Alimentação equilibrada" })), [])
  const [tasks, setTasks] = useState<Task[]>(() => Array.from({ length: 5 }, (_, i) => ({ id: `task-${i}`, date: today, completed: i < 2, description: ["Beber 2L de água", "Caminhar 30 minutos", "Registar humor", "Alongar 10 minutos", "Preparar uma refeição leve"][i], text: ["Beber 2L de água", "Caminhar 30 minutos", "Registar humor", "Alongar 10 minutos", "Preparar uma refeição leve"][i], category: "Autocuidado", importance: 5, urgency: 5, type: "Saúde", order: i })))
  const projects: Project[] = [{ id: "proj1", name: "Bem-estar diário" }]
  const accent = gender === "female" ? "#f5a6c8" : "#8bd8c3"
  const surface = gender === "female" ? "#20151e" : "#111b24"
  const muted = gender === "female" ? "#c6aebd" : "#9db2bd"

  const handleAddTask = (task: Omit<Task, "id" | "uid" | "date">) => setTasks((current) => [...current, { ...task, id: `task-${Date.now()}`, uid: "user1", date: new Date() }])
  return (
    <main className={`min-h-screen text-[#edf4f1] ${gender === "female" ? "bg-[#120e14]" : "bg-[#081018]"}`}>
      <div className="mx-auto flex max-w-[1500px]">
        <aside className="hidden min-h-screen w-64 shrink-0 border-r border-white/10 px-5 py-7 lg:block" style={{ backgroundColor: surface }}>
          <Link href="/dashboard" className="mb-10 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: accent, color: "#101719" }}><HeartPulse className="h-5 w-5" /></div><div><p className="text-sm font-semibold">Meu Cantinho</p><p className="text-[10px] uppercase tracking-[.2em]" style={{ color: muted }}>wellness space</p></div></Link>
          <nav className="space-y-1">{nav.map((item) => { const Icon = item.icon; return <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#9eaaa9] transition hover:bg-white/10 hover:text-white"><Icon className="h-4 w-4" />{item.label}</Link> })}</nav>
          <div className="mt-10 rounded-2xl border border-white/10 p-4"><p className="text-xs font-medium">O teu ritmo importa</p><p className="mt-2 text-xs leading-5" style={{ color: muted }}>Constância antes da perfeição. Um passo de cada vez.</p></div>
          <Link href="/dashboard/profile" className="mt-6 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#9eaaa9] hover:bg-white/10"><Settings className="h-4 w-4" />Configurações</Link>
        </aside>
        <section className="min-w-0 flex-1 px-4 py-5 sm:px-8 lg:px-12 lg:py-8">
          <header className="mb-8 flex items-center justify-between"><div className="flex items-center gap-3 lg:hidden"><button aria-label="Abrir menu" onClick={() => setMenuOpen(true)} className="rounded-xl border border-white/10 p-2"><Menu className="h-5 w-5" /></button><span className="font-semibold">Meu Cantinho</span></div><div className="hidden lg:block"><p className="text-xs uppercase tracking-[.25em]" style={{ color: muted }}>Hoje, {format(today, "d 'de' MMMM", { locale: pt })}</p></div><div className="ml-auto flex items-center gap-3"><div className="hidden rounded-full border border-white/10 px-3 py-1.5 text-xs text-[#aebdb9] sm:block">{gender === "female" ? "Espaço dela" : "Espaço dele"}</div><Link href="/login" className="rounded-xl p-2 text-[#91a59f] hover:bg-white/10" aria-label="Sair"><LogOut className="h-4 w-4" /></Link></div></header>
          {menuOpen && <div className="fixed inset-0 z-50 bg-black/70 lg:hidden" onClick={() => setMenuOpen(false)}><div className="h-full w-80 max-w-[85vw] border-r border-white/10 p-5" style={{ backgroundColor: surface }} onClick={(event) => event.stopPropagation()}><button onClick={() => setMenuOpen(false)} className="mb-8 ml-auto block" aria-label="Fechar menu"><X /></button>{nav.map((item) => { const Icon = item.icon; return <Link onClick={() => setMenuOpen(false)} key={item.href} href={item.href} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#c3cfcb]"><Icon className="h-4 w-4" />{item.label}</Link> })}</div></div>}
          <div className="mb-8 grid gap-5 xl:grid-cols-[1.4fr_.6fr]"><motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-[28px] border border-white/10 p-7 sm:p-10" style={{ backgroundColor: surface }}><div className="absolute -right-10 -top-20 h-64 w-64 rounded-full blur-3xl" style={{ backgroundColor: `${accent}20` }} /><div className="relative"><div className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.23em]" style={{ color: accent }}><Sparkles className="h-4 w-4" />{gender === "female" ? "Bom dia, Linda" : "Bom dia"}</div><h1 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl">Pequenos passos. <span style={{ color: accent }}>Grandes mudanças.</span></h1><p className="mt-4 max-w-xl text-sm leading-6" style={{ color: muted }}>Cada escolha saudável que fazes hoje é um abraço no teu eu de amanhã. Tu consegues.</p><div className="mt-7 flex flex-wrap gap-3"><Link href="/dashboard/calendar" className="rounded-xl px-4 py-2.5 text-sm font-medium text-[#101719]" style={{ backgroundColor: accent }}>Ver o meu dia</Link><Link href="/dashboard/journal" className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10">Escrever no diário</Link></div></div></motion.div><div className="rounded-[28px] border border-white/10 p-6" style={{ backgroundColor: surface }}><div className="flex items-start justify-between"><div><p className="text-[10px] uppercase tracking-[.22em]" style={{ color: muted }}>Dopamine streak</p><p className="mt-2 text-6xl font-semibold" style={{ color: accent }}>30</p></div><div className="rounded-full p-3" style={{ backgroundColor: `${accent}18`, color: accent }}><Flame className="h-5 w-5" /></div></div><p className="mt-3 text-sm text-[#d7e1dd]">dias de consistência</p><div className="mt-6 flex gap-1">{Array.from({ length: 14 }, (_, i) => <span key={i} className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: i < 11 ? accent : "#ffffff14" }} />)}</div><p className="mt-4 text-xs" style={{ color: muted }}>Mais 5 dias para desbloquear o próximo marco.</p></div></div>
          <section className="mb-8"><div className="mb-4 flex items-end justify-between"><div><p className="text-[10px] uppercase tracking-[.25em]" style={{ color: muted }}>O teu espaço</p><h2 className="mt-1 text-xl font-semibold">Tudo o que precisas, num só lugar.</h2></div><Link href="/dashboard/reports" className="text-xs" style={{ color: accent }}>Ver progresso <ArrowUpRight className="ml-1 inline h-3 w-3" /></Link></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{cards.map((card, index) => { const Icon = card.icon; return <motion.div key={card.href} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .04 }}><Link href={card.href} className="group flex min-h-[112px] items-center gap-4 rounded-2xl border border-white/10 p-4 transition hover:-translate-y-1 hover:border-white/25" style={{ backgroundColor: `${surface}cc` }}><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${accent}18`, color: accent }}><Icon className="h-5 w-5" /></div><div className="min-w-0 flex-1"><p className="font-medium">{card.title}</p><p className="mt-1 text-xs leading-5" style={{ color: muted }}>{card.detail}</p></div><ArrowUpRight className="h-4 w-4 text-[#5f746d] transition group-hover:text-white" /></Link></motion.div> })}</div></section>
          <section className="grid gap-5 xl:grid-cols-[.8fr_1.2fr]"><div className="rounded-[24px] border border-white/10 p-2" style={{ backgroundColor: surface }}><StreakCounter tasks={tasks} healthLogs={healthLogs} /></div><div className="rounded-[24px] border border-white/10 p-2" style={{ backgroundColor: surface }}><DailyTasks tasks={tasks} projects={projects} onAddTask={handleAddTask} onToggleTask={(id) => setTasks((current) => current.map((task) => task.id === id ? { ...task, completed: !task.completed } : task))} onDeleteTask={(id) => setTasks((current) => current.filter((task) => task.id !== id))} onUpdateTaskOrder={setTasks} /></div></section>
        </section>
      </div>
    </main>
  )
}
