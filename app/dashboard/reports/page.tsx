"use client"

import { useState, useEffect } from "react"
import { WeeklyReport } from "@/components/weekly-report"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ReportsPage() {
  const router = useRouter()
  const [habits, setHabits] = useState<
    Array<{
      id: string
      name: string
      completions: { [key: string]: boolean }
    }>
  >([])

  useEffect(() => {
    const savedHabits = localStorage.getItem("weeklyReportHabits")
    if (savedHabits) {
      try {
        const parsedHabits = JSON.parse(savedHabits)
        setHabits(parsedHabits)
      } catch (error) {
        console.error("Error loading habits for reports:", error)
        setHabits([])
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Relatórios Semanais
            </h1>
            <p className="text-gray-600 mt-2">Análise da sua disciplina e consistência</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2 hover:bg-red-50 hover:border-red-200 bg-transparent"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        <WeeklyReport habits={habits} />
      </div>
    </div>
  )
}
