"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Activity, ArrowUpRight, BookHeart, Droplets, Flower2, Heart, LogOut, Scale, Settings, Sparkles, Utensils } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { StreakCounter } from "@/components/streak-counter"
import { DailyTasks } from "@/components/daily-tasks"
import type { HealthLog, Project, Task } from "@/types"
import { addDays } from "date-fns"

const quickLinks = [
  { label: "O meu peso", detail: "Acompanha o teu progresso", href: "/dashboard/fitness/weight-loss", icon: Scale, tone: "coral" },
  { label: "Rotina & água", detail: "Mantém o ritmo diário", href: "/dashboard/habits", icon: Droplets, tone: "mint" },
  { label: "Meus treinos", detail: "Move-te ao teu ritmo", href: "/dashboard/fitness", icon: Activity, tone: "violet" },
  { label: "Receitas leves", detail: "Ideias simples e nutritivas", href: "/dashboard/recipes", icon: Utensils, tone: "amber" },
  { label: "Meu diário", detail: "Regista como te sentes", href: "/dashboard/journal", icon: BookHeart, tone: "sky" },
  { label: "Configurações", detail: "Personaliza o teu espaço", href: "/dashboard/profile", icon: Settings, tone: "slate" },
]

export default function DashboardPage() {
  const [gender, setGender] = useState<"female" | "male">("female")
  useEffect(() => {
    const savedGender = sessionStorage.getItem("wellness-gender")
    if (savedGender === "male" || savedGender === "female") setGender(savedGender)
  }, [])

  const today = new Date()
  const healthLogs: HealthLog[] = Array.from({ length: 30 }, (_, i) => ({ id: `log-${i}`, date: addDays(today, -i), uid: "user1", weight: 65 - i * 0.05, sleep: 7.5, exercises: [], meals: `Alimentação saudável dia ${i + 1}` }))
  const [tasks, setTasks] = useState<Task[]>(Array.from({ length: 30 }, (_, i) => ({ id: `task-${i}`, date: addDays(today, -i), completed: true, description: i % 2 === 0 ? "Beber 2L de água" : "30 min de caminhada", text: i % 2 === 0 ? "Beber 2L de água" : "30 min de caminhada", category: "Autocuidado", importance: 5, urgency: 5, type: "Saúde", order: i })))
  const [projects] = useState<Project[]>([{ id: "proj1", name: "Projeto Verão" }, { id: "proj2", name: "Reeducação Alimentar" }])

  const handleAddTask = (newTask: Omit<Task, "id" | "uid" | "date">) => setTasks((current) => [...current, { ...newTask, id: `task-${Date.now()}`, uid: "user1", date: new Date() }])
  const handleToggleTask = (id: string) => setTasks((current) => current.map((task) => task.id === id ? { ...task, completed: !task.completed } : task))
  const handleDeleteTask = (id: string) => setTasks((current) => current.filter((task) => task.id !== id))

  return (
    <main className={`min-h-screen px-4 py-6 text-[#edf4f1] transition-colors duration-500 sm:px-8 lg:px-12 ${gender === "female" ? "bg-[#170f18]" : "bg-[#0b1117]"}`}>
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#b9f3d0] text-[#0b1117]"><Flower2 className="h-5 w-5" /></div>
            <div><p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#91a59f]">Espaço pessoal</p><h1 className="text-xl font-semibold tracking-tight">Meu Cantinho</h1></div>
          </div>
          <Button variant="ghost" size="sm" className="text-[#91a59f] hover:bg-white/5 hover:text-white"><LogOut className="mr-2 h-4 w-4" />Sair</Button>
        </header>

        <section className="mb-8 grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#15201f] p-7 sm:p-9">
            <div className={`absolute -right-12 -top-16 h-56 w-56 rounded-full blur-3xl ${gender === "female" ? "bg-[#f5a6c8]/15" : "bg-[#b9f3d0]/10"}`} />
            <div className="relative z-10 max-w-xl"><div className={`mb-5 flex items-center gap-2 ${gender === "female" ? "text-[#f5a6c8]" : "text-[#b9f3d0]"}`}><Heart className="h-4 w-4 fill-current" /><span className="text-xs font-semibold uppercase tracking-[0.22em]">{gender === "female" ? "Bom dia, Linda" : "Bom dia"}</span><Sparkles className="h-4 w-4" /></div><h2 className="max-w-lg text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">Pequenos passos. <span className={gender === "female" ? "text-[#f5a6c8]" : "text-[#b9f3d0]"}>Grandes mudanças.</span></h2><p className="mt-4 max-w-md text-sm leading-6 text-[#a9bbb5]">Cada escolha saudável que fazes hoje é um abraço no teu eu de amanhã. Tu consegues.</p></div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-[28px] border border-white/10 bg-[#111a20] p-6"><div className="mb-8 flex items-start justify-between"><div><p className="text-[10px] uppercase tracking-[0.22em] text-[#91a59f]">Dopamine streak</p><p className="mt-2 text-5xl font-semibold tracking-tight text-[#b9f3d0]">30</p></div><div className="rounded-full bg-[#b9f3d0]/10 p-3 text-[#b9f3d0]"><Sparkles className="h-5 w-5" /></div></div><p className="text-sm text-[#d7e1dd]">dias de consistência</p><div className="mt-5 flex gap-1">{Array.from({ length: 12 }, (_, i) => <span key={i} className={`h-1.5 flex-1 rounded-full ${i < 10 ? "bg-[#b9f3d0]" : "bg-white/10"}`} />)}</div><p className="mt-3 text-xs text-[#91a59f]">Continua assim, estás a criar algo bonito.</p></motion.div>
        </section>

        <section className="mb-8"><div className="mb-4 flex items-end justify-between"><div><p className="text-[10px] uppercase tracking-[0.24em] text-[#91a59f]">Acesso rápido</p><h2 className="mt-1 text-xl font-semibold">Cuida de ti, um dia de cada vez.</h2></div></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{quickLinks.map((item, index) => { const Icon = item.icon; return <motion.div key={item.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}><Link href={item.href} className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-[#111a20] p-4 transition hover:-translate-y-0.5 hover:border-[#b9f3d0]/40 hover:bg-[#17231f]"><div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${item.tone === "coral" ? "bg-[#ff907b]/15 text-[#ffad9d]" : item.tone === "mint" ? "bg-[#b9f3d0]/15 text-[#b9f3d0]" : item.tone === "violet" ? "bg-[#c4b5fd]/15 text-[#c4b5fd]" : item.tone === "amber" ? "bg-[#fbd38d]/15 text-[#fbd38d]" : item.tone === "sky" ? "bg-[#93c5fd]/15 text-[#93c5fd]" : "bg-white/10 text-[#c5d0cc]"}`}><Icon className="h-5 w-5" /></div><div className="min-w-0 flex-1"><p className="font-medium">{item.label}</p><p className="mt-1 truncate text-xs text-[#91a59f]">{item.detail}</p></div><ArrowUpRight className="h-4 w-4 text-[#5f746d] transition group-hover:text-[#b9f3d0]" /></Link></motion.div> })}</div></section>

        <section className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]"><div className="rounded-[24px] border border-white/10 bg-[#111a20] p-2"><StreakCounter tasks={tasks} healthLogs={healthLogs} /></div><div className="rounded-[24px] border border-white/10 bg-[#111a20] p-2"><DailyTasks tasks={tasks} projects={projects} onAddTask={handleAddTask} onToggleTask={handleToggleTask} onDeleteTask={handleDeleteTask} onUpdateTaskOrder={setTasks} /></div></section>
      </div>
    </main>
  )
}
