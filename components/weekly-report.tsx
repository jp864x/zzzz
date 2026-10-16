"use client"

import { useMemo, useState, useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { startOfWeek, endOfWeek, eachDayOfInterval, format, subDays } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Award, CheckCircle, Lightbulb, GitCommitHorizontal, Target, LoaderCircle, Star, Flame } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"
import { Button } from "./ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "./ui/chart"
import { cn } from "../lib/utils"
import { suggestWeeklyTip } from "../lib/ai" // Declare the variable before using it

interface WeeklyReportProps {
  habits: Array<{
    id: string
    name: string
    completions: { [key: string]: boolean }
  }>
}

export function WeeklyReport({ habits }: WeeklyReportProps) {
  const [isPending, startTransition] = useTransition()
  const [tip, setTip] = useState("")
  const [error, setError] = useState("")

  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 })
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const weeklySummary = useMemo(() => {
    const last7Days = Array.from({ length: 7 }).map((_, i) => subDays(today, 6 - i))

    // Enhanced habit analysis
    const habitWeeklyStats = habits.map((habit) => {
      let weeklyCompletions = 0
      let totalDays = 0

      last7Days.forEach((day) => {
        const dayKey = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`
        if (habit.completions[dayKey]) {
          weeklyCompletions++
        }
        totalDays++
      })

      return {
        name: habit.name,
        completions: weeklyCompletions,
        rate: totalDays > 0 ? (weeklyCompletions / totalDays) * 100 : 0,
      }
    })

    // Daily habit completion data for charts
    const dailyHabitData = last7Days.map((day) => {
      const dayData: any = {
        date: format(day, "EEE", { locale: ptBR }),
        fullDate: format(day, "dd/MM"),
      }

      let dailyTotal = 0
      habits.forEach((habit) => {
        const dayKey = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`
        const completed = habit.completions[dayKey] ? 1 : 0
        dayData[habit.name] = completed
        dailyTotal += completed
      })

      dayData.Completas = dailyTotal
      dayData.Criadas = habits.length

      return dayData
    })

    // Advanced metrics
    const totalPossibleCompletions = habits.length * 7
    const totalActualCompletions = habitWeeklyStats.reduce((sum, habit) => sum + habit.completions, 0)
    const overallDiscipline =
      totalPossibleCompletions > 0 ? (totalActualCompletions / totalPossibleCompletions) * 100 : 0

    // Find most productive day
    const mostProductiveDayData = dailyHabitData.reduce((max, day) => (day.Completas > max.Completas ? day : max), {
      Completas: -1,
      date: "N/A",
    })
    const mostProductiveDay = mostProductiveDayData.Completas > 0 ? mostProductiveDayData.date : "N/A"

    // Habit chart data for horizontal bar chart
    const habitChartData = habitWeeklyStats.map((h) => ({
      name: h.name,
      value: Math.round(h.rate),
    }))

    // Streak calculation
    const currentStreaks = habits.map((habit) => {
      let streak = 0
      for (let i = 0; i < 30; i++) {
        const checkDay = subDays(today, i)
        const dayKey = `${checkDay.getFullYear()}-${String(checkDay.getMonth() + 1).padStart(2, "0")}-${String(checkDay.getDate()).padStart(2, "0")}`
        if (habit.completions[dayKey]) {
          streak++
        } else {
          break
        }
      }
      return { name: habit.name, streak }
    })

    const longestStreak = currentStreaks.reduce(
      (max, habit) => (habit.streak > max.streak ? habit : max),
      currentStreaks[0] || { name: "N/A", streak: 0 },
    )

    return {
      habitWeeklyStats,
      dailyHabitData,
      habitChartData,
      overallDiscipline,
      totalCompletions: totalActualCompletions,
      mostProductiveDay,
      longestStreak,
    }
  }, [habits, today])

  const habitChartConfig = useMemo(() => {
    const config: ChartConfig = {}
    const colors = [
      "hsl(262, 83%, 58%)", // Purple
      "hsl(346, 77%, 49%)", // Pink
      "hsl(221, 83%, 53%)", // Blue
      "hsl(142, 71%, 45%)", // Green
      "hsl(35, 91%, 62%)", // Orange
      "hsl(271, 91%, 65%)", // Violet
      "hsl(204, 94%, 44%)", // Sky blue
      "hsl(159, 64%, 52%)", // Teal
    ]

    weeklySummary.habitChartData.forEach((habit, index) => {
      config[habit.name] = {
        label: habit.name,
        color: colors[index % colors.length],
      }
    })
    return config
  }, [weeklySummary.habitChartData])

  const handleGenerateTip = () => {
    startTransition(async () => {
      setError("")
      setTip("")
      try {
        const performanceSummary = `
          Disciplina geral: ${weeklySummary.overallDiscipline.toFixed(0)}%
          Hábitos completados: ${weeklySummary.totalCompletions}
          Dia mais produtivo: ${weeklySummary.mostProductiveDay}
          Maior streak: ${weeklySummary.longestStreak.streak} dias (${weeklySummary.longestStreak.name})
          
          Performance por hábito:
          ${weeklySummary.habitWeeklyStats.map((h) => `- ${h.name}: ${h.rate.toFixed(0)}% (${h.completions}/7 dias)`).join("\n")}
        `
        const result = await suggestWeeklyTip(performanceSummary)
        if (result.tip) {
          setTip(result.tip)
        } else {
          setError("Não foi possível gerar a dica. Tente novamente.")
        }
      } catch (e) {
        setError("Ocorreu um erro ao comunicar com a IA. Tente novamente mais tarde.")
      }
    })
  }

  const summaryCards = [
    {
      title: "Hábitos Concluídos",
      value: weeklySummary.totalCompletions,
      icon: CheckCircle,
      gradient: "from-primary to-blue-400",
    },
    {
      title: "Disciplina",
      value: `${weeklySummary.overallDiscipline.toFixed(0)}%`,
      icon: Target,
      gradient: "from-green-500 to-teal-400",
    },
    {
      title: "Maior Streak",
      value: `${weeklySummary.longestStreak.streak}`,
      icon: Flame,
      gradient: "from-orange-500 to-amber-400",
    },
  ]

  const highlights = [
    { title: "Dia de Pico", value: weeklySummary.mostProductiveDay, description: "O seu dia mais produtivo!" },
    {
      title: "Melhor Hábito",
      value: weeklySummary.longestStreak.name || "N/A",
      description: "O hábito com maior streak.",
    },
  ]

  return (
    <div className="space-y-8">
      <Card className="border-none bg-transparent shadow-none">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Relatório Semanal</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Análise de {format(weekStart, "dd/MM")} a {format(weekEnd, "dd/MM")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {summaryCards.map((card, index) => (
              <Card key={index} className={cn("text-white border-none shadow-lg")}>
                <div className={cn("h-full w-full rounded-lg p-6 bg-gradient-to-br", card.gradient)}>
                  <div className="flex justify-between items-start">
                    <card.icon className="h-10 w-10 opacity-80" />
                    <p className="text-5xl font-black drop-shadow-md">{card.value}</p>
                  </div>
                  <p className="text-lg font-semibold mt-4 drop-shadow-sm">{card.title}</p>
                </div>
              </Card>
            ))}
          </div>

          {/* Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {highlights.map((item, i) => (
              <Card key={i} className="bg-muted/30">
                <CardContent className="p-6 flex items-center gap-6">
                  <div className="p-4 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl text-white shadow-lg">
                    <Award className="w-10 h-10" />
                  </div>
                  <div>
                    <CardDescription>{item.title}</CardDescription>
                    <p className="text-2xl font-bold text-foreground capitalize">{item.value}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Desempenho Diário</CardTitle>
                <CardDescription>Hábitos concluídos por dia da semana.</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] w-full">
                <ChartContainer config={{}} className="h-full w-full">
                  <BarChart data={weeklySummary.dailyHabitData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                    <Bar dataKey="Completas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Consistência dos Hábitos</CardTitle>
                <CardDescription>Taxa de conclusão de cada hábito esta semana.</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] w-full flex flex-col items-center justify-center">
                {weeklySummary.habitChartData.length > 0 ? (
                  <ChartContainer config={habitChartConfig} className="w-full h-full">
                    <BarChart
                      accessibilityLayer
                      data={weeklySummary.habitChartData}
                      layout="vertical"
                      margin={{ left: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" dataKey="value" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tickLine={false}
                        axisLine={false}
                        width={80}
                        tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                      />
                      <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                      {weeklySummary.habitChartData.map((habit, index) => (
                        <Bar
                          key={habit.name}
                          dataKey="value"
                          fill={habitChartConfig[habit.name]?.color || "hsl(var(--primary))"}
                          radius={5}
                        />
                      ))}
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <GitCommitHorizontal className="mx-auto h-12 w-12" />
                    <p className="mt-2">Sem hábitos para analisar.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* AI Tip */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb /> Dica da Semana
            </CardTitle>
            <CardDescription>Uma sugestão personalizada para melhorar na próxima semana.</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={handleGenerateTip} disabled={isPending}>
            {isPending ? <LoaderCircle className="animate-spin" /> : <Star />}
          </Button>
        </CardHeader>
        <CardContent>
          {isPending && (
            <div className="flex items-center text-muted-foreground">
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />A gerar a sua dica personalizada...
            </div>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {tip && (
            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertTitle>A sua Dica Personalizada</AlertTitle>
              <AlertDescription>{tip}</AlertDescription>
            </Alert>
          )}
          {!isPending && !tip && !error && (
            <p className="text-sm text-muted-foreground">
              Clique na estrela para receber uma dica personalizada com base no seu desempenho semanal.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
