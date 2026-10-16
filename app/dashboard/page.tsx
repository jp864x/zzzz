"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  GanttChartSquare,
  User,
  LogOut,
  Activity,
  Target,
  BarChart3,
  BookOpen,
  Scale,
  Users,
  Settings,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { StreakCounter } from "@/components/streak-counter"
import { DailyTasks } from "@/components/daily-tasks" // Import DailyTasks
import type { HealthLog, Task, Project } from "@/types"
import { addDays } from "date-fns"

export default function DashboardPage() {
  // Generate 30 days of health logs and tasks for a long streak simulation
  const generateLongStreakData = () => {
    const today = new Date()
    const simulatedHealthLogs: HealthLog[] = []
    const simulatedTasks: Task[] = []

    for (let i = 0; i < 30; i++) {
      const date = addDays(today, -i) // Go back in time for each day
      simulatedHealthLogs.push({
        id: `log-${i}`,
        date: date,
        uid: "user1",
        weight: 70 - i * 0.1, // Dummy data
        sleep: 7.5 + i * 0.05, // Dummy data
        exercises: [],
        meals: `Refeições do dia ${i + 1}`,
      })
      simulatedTasks.push({
        id: `task-${i}`,
        date: date,
        completed: true,
        description: `Tarefa do dia ${i + 1}`,
        text: `Tarefa do dia ${i + 1}`, // Added text for consistency
        category: "Pessoal",
        importance: 5,
        urgency: 5,
        type: "Execução",
        order: i,
      })
    }
    return { simulatedHealthLogs, simulatedTasks }
  }

  const { simulatedHealthLogs, simulatedTasks } = generateLongStreakData()

  const [healthLogs, setHealthLogs] = useState<HealthLog[]>(simulatedHealthLogs)
  const [tasks, setTasks] = useState<Task[]>(simulatedTasks)
  const [projects, setProjects] = useState<Project[]>([
    { id: "proj1", name: "Projeto Alpha" },
    { id: "proj2", name: "Projeto Beta" },
  ])

  const handleAddTask = (newTask: Omit<Task, "id" | "uid" | "date">) => {
    const newId = (tasks.length > 0 ? Math.max(...tasks.map((t) => Number.parseInt(t.id.replace("task-", "")))) : 0) + 1
    setTasks((prevTasks) => [
      ...prevTasks,
      {
        ...newTask,
        id: `task-${newId}`,
        uid: "user1",
        date: new Date(),
      },
    ])
  }

  const handleToggleTask = (id: string) => {
    setTasks((prevTasks) => prevTasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  const handleDeleteTask = (id: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id))
  }

  const handleUpdateTaskOrder = (newOrderedTasks: Task[]) => {
    setTasks(newOrderedTasks)
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <GanttChartSquare className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Dashboard</h1>
          </div>
          <Button variant="outline" size="sm">
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Bem-vindo à Plataforma JP!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Parabéns! Conseguiu aceder com sucesso à plataforma. Esta é uma página de demonstração do dashboard.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Button asChild className="w-full">
                    <Link href="/dashboard/fitness">
                      <Activity className="mr-2 h-4 w-4" />
                      Fitness Tracker
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full bg-transparent">
                    <Link href="/dashboard/habits">
                      <Target className="mr-2 h-4 w-4" />
                      Hábitos Diários
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full bg-transparent">
                    <Link href="/dashboard/reports">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Relatórios
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0"
                  >
                    <Link href="/dashboard/studies">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Estudos
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full bg-gradient-to-r from-pink-500 to-orange-500 text-white border-0"
                  >
                    <Link href="/dashboard/social">
                      <Users className="mr-2 h-4 w-4" />
                      Social Hub
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white border-0"
                  >
                    <Link href="/dashboard/fitness/weight-loss">
                      <Scale className="mr-2 h-4 w-4" />
                      Sistema de Emagrecimento
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0"
                  >
                    <Link href="/dashboard/profile">
                      <Settings className="mr-2 h-4 w-4" />
                      Meu Perfil
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Streak Counter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <StreakCounter tasks={tasks} healthLogs={healthLogs} />
          </motion.div>

          {/* Daily Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="md:col-span-2" // Make it span full width on medium screens and up
          >
            <DailyTasks
              tasks={tasks}
              projects={projects}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onUpdateTaskOrder={handleUpdateTaskOrder}
            />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
