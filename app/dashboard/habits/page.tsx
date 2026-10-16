"use client"

import { motion } from "framer-motion"
import { GanttChartSquare, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HabitTracker } from "@/components/habit-tracker"

export default function HabitsPage() {
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
            <h1 className="text-3xl font-bold">Hábitos Diários</h1>
          </div>
          <Button variant="outline" size="sm">
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </motion.div>

        <HabitTracker />
      </div>
    </div>
  )
}
