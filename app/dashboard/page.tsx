"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Heart,
  LogOut,
  Activity,
  Sparkles,
  Utensils,
  BookHeart,
  Scale,
  Settings,
  Droplets,
  Flower2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { StreakCounter } from "@/components/streak-counter"
import { DailyTasks } from "@/components/daily-tasks"
import type { HealthLog, Task, Project } from "@/types"
import { addDays } from "date-fns"

export default function DashboardPage() {
  const generateLongStreakData = () => {
    const today = new Date()
    const simulatedHealthLogs: HealthLog[] = []
    const simulatedTasks: Task[] = []

    for (let i = 0; i < 30; i++) {
      const date = addDays(today, -i)
      simulatedHealthLogs.push({
        id: `log-${i}`,
        date,
        uid: "user1",
        weight: 65 - i * 0.05,
        sleep: 7.5 + (Math.random() * 1 - 0.5),
        exercises: [],
        meals: `Alimentação saudável dia ${i + 1}`,
      })
      simulatedTasks.push({
        id: `task-${i}`,
        date,
        completed: true,
        description: i % 2 === 0 ? "Beber 2L de água" : "30 min de caminhada",
        text: i % 2 === 0 ? "Beber 2L de água" : "30 min de caminhada",
        category: "Autocuidado",
        importance: 5,
        urgency: 5,
        type: "Saúde",
        order: i,
      })
    }
    return { simulatedHealthLogs, simulatedTasks }
  }

  const { simulatedHealthLogs, simulatedTasks } = generateLongStreakData()
  const [healthLogs] = useState<HealthLog[]>(simulatedHealthLogs)
  const [tasks, setTasks] = useState<Task[]>(simulatedTasks)
  const [projects] = useState<Project[]>([
    { id: "proj1", name: "Projeto Verão" },
    { id: "proj2", name: "Reeducação Alimentar" },
  ])

  const handleAddTask = (newTask: Omit<Task, "id" | "uid" | "date">) => {
    const newId = (tasks.length > 0 ? Math.max(...tasks.map((t) => Number.parseInt(t.id.replace("task-", "")))) : 0) + 1
    setTasks((prevTasks) => [...prevTasks, { ...newTask, id: `task-${newId}`, uid: "user1", date: new Date() }])
  }

  const handleToggleTask = (id: string) => {
    setTasks((prevTasks) => prevTasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  const handleDeleteTask = (id: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id))
  }

  return (
    <div className="min-h-screen bg-rose-50/50 p-4 font-sans text-slate-800 pb-20">
      <div className="container mx-auto max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-rose-100 p-2 rounded-full text-rose-500"><Flower2 className="h-8 w-8" /></div>
            <h1 className="text-3xl font-bold text-slate-700">Meu Cantinho</h1>
          </div>
          <Button variant="ghost" size="sm" className="text-rose-400 hover:text-rose-600 hover:bg-rose-100/50"><LogOut className="mr-2 h-4 w-4" />Sair</Button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
            <Card className="border-none shadow-md bg-gradient-to-br from-rose-400 to-pink-500 text-white overflow-hidden relative">
              <Sparkles className="absolute top-4 right-4 opacity-20 h-16 w-16" />
              <CardHeader><CardTitle className="flex items-center gap-2 text-2xl"><Heart className="h-6 w-6 fill-white" />Bom dia, Linda! ✨</CardTitle></CardHeader>
              <CardContent className="space-y-6 relative z-10">
                <p className="text-rose-50 text-lg font-medium">&quot;Cada escolha saudável que fazes hoje é um abraço no teu eu de amanhã. Tu consegues!&quot;</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  <Button asChild className="w-full bg-white/20 hover:bg-white/30 border-none text-white backdrop-blur-sm justify-start"><Link href="/dashboard/fitness/weight-loss"><Scale className="mr-3 h-5 w-5" />O meu Peso</Link></Button>
                  <Button asChild className="w-full bg-white/20 hover:bg-white/30 border-none text-white backdrop-blur-sm justify-start"><Link href="/dashboard/habits"><Droplets className="mr-3 h-5 w-5" />Rotina &amp; Água</Link></Button>
                  <Button asChild className="w-full bg-white/20 hover:bg-white/30 border-none text-white backdrop-blur-sm justify-start"><Link href="/dashboard/fitness"><Activity className="mr-3 h-5 w-5" />Meus Treinos</Link></Button>
                  <Button asChild className="w-full bg-white/20 hover:bg-white/30 border-none text-white backdrop-blur-sm justify-start"><Link href="/dashboard/studies"><Utensils className="mr-3 h-5 w-5" />Receitas Leves</Link></Button>
                  <Button asChild className="w-full bg-white/20 hover:bg-white/30 border-none text-white backdrop-blur-sm justify-start"><Link href="/dashboard/social"><BookHeart className="mr-3 h-5 w-5" />Meu Diário</Link></Button>
                  <Button asChild className="w-full bg-white/20 hover:bg-white/30 border-none text-white backdrop-blur-sm justify-start"><Link href="/dashboard/profile"><Settings className="mr-3 h-5 w-5" />Configurações</Link></Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="h-full">
            <div className="bg-white rounded-xl shadow-sm border border-rose-100 p-1 h-full"><StreakCounter tasks={tasks} healthLogs={healthLogs} /></div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="md:col-span-2 bg-white rounded-xl shadow-sm border border-rose-100 p-1 mt-2">
            <DailyTasks tasks={tasks} projects={projects} onAddTask={handleAddTask} onToggleTask={handleToggleTask} onDeleteTask={handleDeleteTask} onUpdateTaskOrder={setTasks} />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
