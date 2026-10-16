"use client"

import { useState } from "react"
import { FitnessTracker } from "@/components/fitness-tracker"
import type { HealthLog } from "@/types"
import { GanttChartSquare, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function FitnessPage() {
  const [logs, setLogs] = useState<HealthLog[]>([
    {
      id: "1",
      date: new Date("2025-08-08T10:00:00Z"),
      uid: "user1",
      weight: 70.5,
      sleep: 7.5,
      exercises: [
        { name: "Bench Press", sets: 3, reps: 10, weight: 60 },
        { name: "Squat", sets: 3, reps: 10, weight: 80 },
      ],
      meals: "Pequeno-almoço: Aveia com frutas. Almoço: Frango grelhado com salada. Jantar: Salmão com vegetais.",
    },
    {
      id: "2",
      date: new Date("2025-08-09T10:00:00Z"),
      uid: "user1",
      weight: 69.8,
      sleep: 8.0,
      exercises: [
        { name: "Deadlift", sets: 3, reps: 5, weight: 100 },
        { name: "Bicep Curl", sets: 3, reps: 12, weight: 15 },
      ],
      meals: "Pequeno-almoço: Ovos mexidos. Almoço: Arroz integral com lentilhas. Jantar: Sopa de legumes.",
    },
    {
      id: "3",
      date: new Date("2025-08-10T10:00:00Z"),
      uid: "user1",
      weight: 69.0,
      sleep: 6.5,
      exercises: [
        { name: "Bench Press", sets: 3, reps: 8, weight: 65 },
        { name: "Squat", sets: 3, reps: 8, weight: 85 },
      ],
      meals: "Pequeno-almoço: Smoothie de proteína. Almoço: Salada de atum. Jantar: Bife com batata doce.",
    },
    {
      id: "4",
      date: new Date("2025-08-11T10:00:00Z"),
      uid: "user1",
      weight: 68.5,
      sleep: 7.0,
      training: "Dia de descanso ativo: Caminhada leve 45 minutos.", // Example of old training field
      meals: "Pequeno-almoço: Panquecas de banana. Almoço: Wrap de frango. Jantar: Pizza caseira (dia livre!).",
    },
    {
      id: "5",
      date: new Date("2025-08-12T10:00:00Z"),
      uid: "user1",
      weight: 68.2,
      sleep: 7.2,
      exercises: [
        { name: "Bench Press", sets: 3, reps: 5, weight: 70 },
        { name: "Squat", sets: 3, reps: 5, weight: 90 },
        { name: "Overhead Press", sets: 3, reps: 10, weight: 30 },
      ],
      meals: "Pequeno-almoço: Iogurte com granola. Almoço: Quinoa com vegetais assados. Jantar: Frango com brócolos.",
    },
    {
      id: "6",
      date: new Date("2025-08-13T10:00:00Z"),
      uid: "user1",
      weight: 68.0,
      sleep: 7.8,
      exercises: [
        { name: "Deadlift", sets: 3, reps: 3, weight: 105 },
        { name: "Bicep Curl", sets: 3, reps: 10, weight: 17.5 },
      ],
      meals: "Pequeno-almoço: Torradas com abacate. Almoço: Sopa de lentilhas. Jantar: Omelete com espinafres.",
    },
    {
      id: "7",
      date: new Date("2025-08-14T10:00:00Z"),
      uid: "user1",
      weight: 67.9,
      sleep: 8.1,
      exercises: [
        { name: "Bench Press", sets: 3, reps: 3, weight: 72.5 },
        { name: "Squat", sets: 3, reps: 3, weight: 95 },
        { name: "Row", sets: 4, reps: 8, weight: 40 },
      ],
      meals: "Pequeno-almoço: Batido de frutas. Almoço: Salada de grão de bico. Jantar: Peixe assado com batatas.",
    },
  ])

  const handleAddLog = (newLog: Omit<HealthLog, "id" | "date" | "uid">) => {
    const newId = (logs.length > 0 ? Math.max(...logs.map((log) => Number.parseInt(log.id))) : 0) + 1
    setLogs((prevLogs) => [
      ...prevLogs,
      {
        id: newId.toString(),
        date: new Date(), // Current date for new logs
        uid: "user1", // Assuming a default user for now
        ...newLog,
      },
    ])
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
            <h1 className="text-3xl font-bold">Fitness Tracker</h1>
          </div>
          <Button variant="outline" size="sm">
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </motion.div>

        <FitnessTracker logs={logs} onAddLog={handleAddLog} />
      </div>
    </div>
  )
}
