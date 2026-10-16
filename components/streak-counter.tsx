"use client"

import { useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Flame } from "lucide-react"
import type { Task, HealthLog } from "@/types"
import { differenceInCalendarDays, startOfDay, format } from "date-fns"
import { cn } from "@/lib/utils"
import { celebrate } from "@/components/confetti"
import { motion } from "framer-motion"

interface StreakCounterProps {
  tasks: Task[]
  healthLogs: HealthLog[]
}

export function StreakCounter({ tasks, healthLogs }: StreakCounterProps) {
  const streak = useMemo(() => {
    const taskDates = tasks.map((t) => startOfDay(new Date(t.date)))
    const logDates = healthLogs.map((l) => startOfDay(new Date(l.date)))

    const allActivityDates = [...taskDates, ...logDates].map((d) => d.getTime())
    const uniqueSortedDates = [...new Set(allActivityDates)].sort((a, b) => b - a) // Sort descending

    if (uniqueSortedDates.length === 0) return 0

    let currentStreak = 0
    const today = startOfDay(new Date())

    // Check if there's activity today or yesterday
    const mostRecentDate = new Date(uniqueSortedDates[0])
    const daysSinceLastActivity = differenceInCalendarDays(today, mostRecentDate)

    if (daysSinceLastActivity > 1) {
      return 0 // Streak is broken if last activity was more than 1 day ago
    }

    // If there was activity today or yesterday, start counting
    currentStreak = daysSinceLastActivity <= 1 ? 1 : 0
    if (currentStreak === 0 && uniqueSortedDates.length > 0) return 0 // Ensure 0 if no recent activity

    let lastDate = mostRecentDate

    for (let i = 1; i < uniqueSortedDates.length; i++) {
      const currentDate = new Date(uniqueSortedDates[i])
      const diff = differenceInCalendarDays(lastDate, currentDate)

      if (diff === 1) {
        currentStreak++
        lastDate = currentDate
      } else {
        break // Streak is broken
      }
    }
    return currentStreak
  }, [tasks, healthLogs])

  // Define dynamic animation properties based on streak
  const flameAnimation = useMemo(() => {
    if (streak === 0) {
      return { scale: 1, opacity: 0.5 } // Dim, no animation
    } else if (streak < 7) {
      return {
        scale: [1, 1.05, 1],
        opacity: [1, 0.8, 1],
        transition: { duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
      }
    } else if (streak < 30) {
      return {
        scale: [1, 1.08, 1],
        opacity: [1, 0.9, 1],
        transition: { duration: 1.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
      }
    } else {
      return {
        scale: [1, 1.1, 1],
        opacity: [1, 1, 1], // More consistent brightness
        transition: { duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
      }
    }
  }, [streak])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const todayString = format(new Date(), "yyyy-MM-dd")
      const lastCelebratedDate = localStorage.getItem("last_celebrated_streak_date")

      if (streak > 0 && lastCelebratedDate !== todayString) {
        celebrate()
        localStorage.setItem("last_celebrated_streak_date", todayString)
      }
    }
  }, [streak])

  return (
    <Card className="bg-background/80 border-border/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Dopamine Streak</CardTitle>
        <motion.div // Wrap Flame in motion.div
          animate={flameAnimation}
        >
          <Flame className={cn("h-6 w-6", streak > 0 ? "text-orange-500" : "text-muted-foreground")} />
        </motion.div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">
          {streak} {streak === 1 ? "dia" : "dias"}
        </div>
        <p className="text-xs text-muted-foreground">
          {streak > 0 ? "Continue assim! Não quebre a corrente." : "Complete uma tarefa ou registo hoje para começar."}
        </p>
      </CardContent>
    </Card>
  )
}
