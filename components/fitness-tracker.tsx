"use client"

import type React from "react"
import { useState, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Label } from "./ui/label"
import { Badge } from "./ui/badge"
import {
  Plus,
  Scale,
  Bed,
  Dumbbell,
  Activity,
  TrendingUp,
  TrendingDown,
  Calendar,
  Target,
  BarChart3,
  Zap,
  X,
  Award,
  Footprints,
  Waves,
  Banknote,
  Book,
  Sparkles,
} from "lucide-react"
import type { HealthLog, ExerciseLog, PersonalBestRecord } from "@/types" // Import PersonalBestRecord
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts"
import { motion, AnimatePresence } from "framer-motion"

interface FitnessTrackerProps {
  logs: HealthLog[]
  onAddLog: (log: Omit<HealthLog, "id" | "date" | "uid">) => void
}

const COMMON_EXERCISES = ["Bench Press", "Squat", "Deadlift", "Overhead Press", "Bicep Curl", "Row"]

// Mapeia categorias para ícones para exibição
const personalBestCategoryIcons: { [key in PersonalBestRecord["category"]]: React.ElementType } = {
  Ginásio: Dumbbell,
  Corrida: Footprints,
  Natação: Waves,
  Finanças: Banknote,
  Leitura: Book,
  Outros: Sparkles,
}

export function FitnessTracker({ logs, onAddLog }: FitnessTrackerProps) {
  const [weight, setWeight] = useState<number | "">("")
  const [sleep, setSleep] = useState<number | "">("")
  const [meals, setMeals] = useState("")
  const [exercises, setExercises] = useState<ExerciseLog[]>([])
  const [activeChart, setActiveChart] = useState<"line" | "area" | "bar">("area")

  // Dados de exemplo para recordes pessoais de outras categorias
  const [otherPersonalBests, setOtherPersonalBests] = useState<PersonalBestRecord[]>([
    {
      id: "pb-run-5k",
      category: "Corrida",
      name: "5k Run",
      value: "22:30",
      unit: "min",
      dateAchieved: new Date("2024-07-15"),
    },
    {
      id: "pb-swim-1k",
      category: "Natação",
      name: "1km Freestyle",
      value: "18:45",
      unit: "min",
      dateAchieved: new Date("2024-06-20"),
    },
    {
      id: "pb-finance-savings",
      category: "Finanças",
      name: "Poupança Mensal",
      value: 500,
      unit: "€",
      dateAchieved: new Date("2024-08-01"),
    },
    {
      id: "pb-reading-books",
      category: "Leitura",
      name: "Livros Lidos (Ano)",
      value: 12,
      unit: "livros",
      dateAchieved: new Date("2024-12-31"),
    },
    {
      id: "pb-other-project",
      category: "Outros",
      name: "Projeto Concluído",
      value: "JP Platform",
      dateAchieved: new Date("2025-08-11"),
    },
  ])

  const addExerciseRow = useCallback(() => {
    setExercises((prev) => [...prev, { name: "", sets: 0, reps: 0, weight: 0 }])
  }, [])

  const updateExerciseRow = useCallback((index: number, field: keyof ExerciseLog, value: string | number) => {
    setExercises((prev) => prev.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex)))
  }, [])

  const removeExerciseRow = useCallback((index: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const isNumericLogValid = weight !== "" && sleep !== ""
    const isTextLogValid = meals.trim() !== ""
    const isExerciseLogValid = exercises.some(
      (ex) => ex.name.trim() !== "" && ex.sets > 0 && ex.reps > 0 && ex.weight > 0,
    )

    if (isNumericLogValid || isTextLogValid || isExerciseLogValid) {
      onAddLog({
        weight: weight !== "" ? weight : undefined,
        sleep: sleep !== "" ? sleep : undefined,
        meals: meals.trim() || undefined,
        exercises: exercises.filter((ex) => ex.name.trim() !== "" && ex.sets > 0 && ex.reps > 0 && ex.weight > 0),
      })
      setWeight("")
      setSleep("")
      setMeals("")
      setExercises([])
    }
  }

  const isSubmittable =
    (weight !== "" && sleep !== "") ||
    meals.trim() !== "" ||
    exercises.some((ex) => ex.name.trim() !== "" && ex.sets > 0 && ex.reps > 0 && ex.weight > 0)

  const chartData = useMemo(() => {
    return logs
      .filter((log) => log.weight != null && log.sleep != null)
      .slice()
      .reverse()
      .map((log) => ({
        date: format(log.date, "dd/MM"),
        fullDate: format(log.date, "dd 'de' MMMM", { locale: ptBR }),
        Peso: log.weight,
        Sono: log.sleep,
      }))
  }, [logs])

  const stats = useMemo(() => {
    const recentLogs = logs.slice(-7) // Últimos 7 registos
    const weightLogs = recentLogs.filter((log) => log.weight != null)
    const sleepLogs = recentLogs.filter((log) => log.sleep != null)

    const avgWeight =
      weightLogs.length > 0 ? weightLogs.reduce((sum, log) => sum + log.weight!, 0) / weightLogs.length : 0
    const avgSleep = sleepLogs.length > 0 ? sleepLogs.reduce((sum, log) => sum + log.sleep!, 0) / sleepLogs.length : 0

    const weightTrend = weightLogs.length >= 2 ? weightLogs[weightLogs.length - 1].weight! - weightLogs[0].weight! : 0
    const sleepTrend = sleepLogs.length >= 2 ? sleepLogs[sleepLogs.length - 1].sleep! - sleepLogs[0].sleep! : 0

    // Deriva recordes pessoais de ginásio dos logs
    const gymPersonalBests: PersonalBestRecord[] = []
    const maxWeights: { [key: string]: { weight: number; date: Date } } = {}

    logs.forEach((log) => {
      log.exercises?.forEach((ex) => {
        if (!maxWeights[ex.name] || ex.weight > maxWeights[ex.name].weight) {
          maxWeights[ex.name] = { weight: ex.weight, date: log.date }
        }
      })
    })

    Object.entries(maxWeights).forEach(([exerciseName, data]) => {
      gymPersonalBests.push({
        id: `pb-gym-${exerciseName.toLowerCase().replace(/\s/g, "-")}`,
        category: "Ginásio",
        name: exerciseName,
        value: data.weight,
        unit: "kg",
        dateAchieved: data.date,
      })
    })

    // Combina recordes de ginásio com outros recordes pessoais
    const allPersonalBests = [...gymPersonalBests, ...otherPersonalBests]

    return {
      avgWeight: avgWeight.toFixed(1),
      avgSleep: avgSleep.toFixed(1),
      weightTrend,
      sleepTrend,
      totalWorkouts: logs.filter((log) => log.exercises && log.exercises.length > 0).length,
      totalEntries: logs.length,
      personalBests: allPersonalBests, // Agora inclui todas as categorias
    }
  }, [logs, otherPersonalBests]) // Depende de otherPersonalBests também

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background/95 p-3 shadow-lg backdrop-blur-sm">
          <p className="font-medium">{payload[0]?.payload?.fullDate}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey}: {entry.value}
              {entry.dataKey === "Peso" ? "kg" : "h"}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    }

    switch (activeChart) {
      case "line":
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="date" className="text-xs" />
            <YAxis yAxisId="left" stroke="#8b5cf6" domain={["dataMin - 2", "dataMax + 2"]} className="text-xs" />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#10b981"
              domain={["dataMin - 1", "dataMax + 1"]}
              className="text-xs"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="Peso"
              stroke="#8b5cf6"
              strokeWidth={3}
              dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: "#8b5cf6", strokeWidth: 2 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="Sono"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2 }}
            />
          </LineChart>
        )
      case "area":
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorPeso" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorSono" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="date" className="text-xs" />
            <YAxis yAxisId="left" stroke="#8b5cf6" domain={["dataMin - 2", "dataMax + 2"]} className="text-xs" />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#10b981"
              domain={["dataMin - 1", "dataMax + 1"]}
              className="text-xs"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="Peso"
              stroke="#8b5cf6"
              fillOpacity={1}
              fill="url(#colorPeso)"
              strokeWidth={2}
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="Sono"
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#colorSono)"
              strokeWidth={2}
            />
          </AreaChart>
        )
      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="date" className="text-xs" />
            <YAxis yAxisId="left" stroke="#8b5cf6" domain={["dataMin - 2", "dataMax + 2"]} className="text-xs" />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#10b981"
              domain={["dataMin - 1", "dataMax + 1"]}
              className="text-xs"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar yAxisId="left" dataKey="Peso" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            <Bar yAxisId="right" dataKey="Sono" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="relative overflow-hidden border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-transparent">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Peso Médio</p>
                  <p className="text-2xl font-bold text-violet-500">{stats.avgWeight}kg</p>
                </div>
                <div className="flex items-center gap-1">
                  {stats.weightTrend > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : stats.weightTrend < 0 ? (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  ) : null}
                  <Scale className="h-8 w-8 text-violet-500/60" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="relative overflow-hidden border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sono Médio</p>
                  <p className="text-2xl font-bold text-emerald-500">{stats.avgSleep}h</p>
                </div>
                <div className="flex items-center gap-1">
                  {stats.sleepTrend > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : stats.sleepTrend < 0 ? (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  ) : null}
                  <Bed className="h-8 w-8 text-emerald-500/60" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="relative overflow-hidden border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-transparent">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Treinos</p>
                  <p className="text-2xl font-bold text-orange-500">{stats.totalWorkouts}</p>
                </div>
                <Dumbbell className="h-8 w-8 text-orange-500/60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="relative overflow-hidden border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-transparent">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Registos</p>
                  <p className="text-2xl font-bold text-blue-500">{stats.totalEntries}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-500/60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Personal Bests */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card className="relative overflow-hidden border-border/50 bg-background/80">
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-2">
                <Award className="h-5 w-5 text-primary" />
              </div>
              Recordes Pessoais
            </CardTitle>
            <CardDescription>Os seus melhores resultados em diversas áreas.</CardDescription>
          </CardHeader>
          <CardContent className="relative">
            {stats.personalBests.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.personalBests.map((pb) => {
                  const IconComponent = personalBestCategoryIcons[pb.category]
                  return (
                    <div key={pb.id} className="flex items-center justify-between rounded-md bg-muted/20 p-3">
                      <div className="flex items-center gap-2">
                        {IconComponent && <IconComponent className="h-5 w-5 text-primary" />}
                        <span className="font-medium text-foreground">{pb.name}</span>
                      </div>
                      <Badge variant="secondary" className="text-sm font-bold">
                        {pb.value}
                        {pb.unit}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                Adicione registos para ver os seus recordes pessoais!
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Input Form */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-violet-500/5" />
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-2">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              Registo de Fitness
            </CardTitle>
            <CardDescription>Adicione os seus dados diários de fitness para acompanhar o progresso.</CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight" className="flex items-center gap-2 font-medium">
                    <Scale className="h-4 w-4 text-violet-500" />
                    Peso (kg)
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value ? Number.parseFloat(e.target.value) : "")}
                    placeholder="Ex: 75.5"
                    className="h-11 transition-all duration-200 focus:ring-2 focus:ring-violet-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sleep" className="flex items-center gap-2 font-medium">
                    <Bed className="h-4 w-4 text-emerald-500" />
                    Sono (horas)
                  </Label>
                  <Input
                    id="sleep"
                    type="number"
                    step="0.5"
                    value={sleep}
                    onChange={(e) => setSleep(e.target.value ? Number.parseFloat(e.target.value) : "")}
                    placeholder="Ex: 8"
                    className="h-11 transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              {/* Structured Exercise Input */}
              <div className="space-y-4 border-t border-border/50 pt-4">
                <Label className="flex items-center gap-2 font-medium">
                  <Dumbbell className="h-4 w-4 text-orange-500" />
                  Registo de Treino (Exercícios)
                </Label>
                {exercises.map((exercise, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-2 items-end">
                    <div className="flex-1 space-y-2 w-full">
                      <Label htmlFor={`exercise-name-${index}`} className="sr-only">
                        Nome do Exercício
                      </Label>
                      <Input
                        id={`exercise-name-${index}`}
                        type="text"
                        value={exercise.name}
                        onChange={(e) => updateExerciseRow(index, "name", e.target.value)}
                        placeholder="Nome do Exercício (Ex: Bench Press)"
                        list="common-exercises"
                        className="h-11 transition-all duration-200 focus:ring-2 focus:ring-orange-500/20"
                      />
                      <datalist id="common-exercises">
                        {COMMON_EXERCISES.map((name) => (
                          <option key={name} value={name} />
                        ))}
                      </datalist>
                    </div>
                    <div className="w-full sm:w-24 space-y-2">
                      <Label htmlFor={`sets-${index}`} className="sr-only">
                        Séries
                      </Label>
                      <Input
                        id={`sets-${index}`}
                        type="number"
                        value={exercise.sets || ""}
                        onChange={(e) => updateExerciseRow(index, "sets", Number.parseInt(e.target.value) || 0)}
                        placeholder="Séries"
                        className="h-11 transition-all duration-200 focus:ring-2 focus:ring-orange-500/20"
                      />
                    </div>
                    <div className="w-full sm:w-24 space-y-2">
                      <Label htmlFor={`reps-${index}`} className="sr-only">
                        Repetições
                      </Label>
                      <Input
                        id={`reps-${index}`}
                        type="number"
                        value={exercise.reps || ""}
                        onChange={(e) => updateExerciseRow(index, "reps", Number.parseInt(e.target.value) || 0)}
                        placeholder="Reps"
                        className="h-11 transition-all duration-200 focus:ring-2 focus:ring-orange-500/20"
                      />
                    </div>
                    <div className="w-full sm:w-24 space-y-2">
                      <Label htmlFor={`weight-${index}`} className="sr-only">
                        Peso (kg)
                      </Label>
                      <Input
                        id={`weight-${index}`}
                        type="number"
                        step="0.1"
                        value={exercise.weight || ""}
                        onChange={(e) => updateExerciseRow(index, "weight", Number.parseFloat(e.target.value) || 0)}
                        placeholder="Peso (kg)"
                        className="h-11 transition-all duration-200 focus:ring-2 focus:ring-orange-500/20"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeExerciseRow(index)}
                      className="h-11 w-11 shrink-0"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remover Exercício</span>
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addExerciseRow} className="w-full bg-transparent">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Exercício
                </Button>
              </div>

              <div className="space-y-2 border-t border-border/50 pt-4">
                <Label htmlFor="meals" className="flex items-center gap-2 font-medium">
                  <Target className="h-4 w-4 text-blue-500" />
                  Refeições do Dia
                </Label>
                <Textarea
                  id="meals"
                  value={meals}
                  onChange={(e) => setMeals(e.target.value)}
                  placeholder="Descreva as suas principais refeições..."
                  className="min-h-[100px] resize-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <Button
                type="submit"
                className="w-full sm:w-auto bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={!isSubmittable}
                size="lg"
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Registo
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-violet-500/5" />
          <CardHeader className="relative">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  Gráficos de Progressão
                </CardTitle>
                <CardDescription>Visualize a sua evolução ao longo do tempo.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={activeChart === "area" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveChart("area")}
                  className="transition-all duration-200"
                >
                  Área
                </Button>
                <Button
                  variant={activeChart === "line" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveChart("line")}
                  className="transition-all duration-200"
                >
                  Linha
                </Button>
                <Button
                  variant={activeChart === "bar" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveChart("bar")}
                  className="transition-all duration-200"
                >
                  Barras
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {renderChart()}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-blue-500/5" />
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-2">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              Histórico de Treinos e Refeições
            </CardTitle>
            <CardDescription>Acompanhe o seu registo de atividades e alimentação.</CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <div className="max-h-[500px] overflow-y-auto space-y-3 pr-2">
              <AnimatePresence>
                {logs
                  .filter((log) => (log.exercises && log.exercises.length > 0) || log.meals)
                  .map((log, index) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="group relative rounded-xl border border-border/50 bg-gradient-to-r from-background/80 to-muted/20 p-4 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg"
                    >
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-violet-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      <div className="relative">
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="rounded-lg bg-primary/10 p-1.5">
                              <Dumbbell className="h-4 w-4 text-primary" />
                            </div>
                            <p className="font-semibold text-sm">
                              {format(log.date, "dd 'de' MMMM, yyyy", { locale: ptBR })}
                            </p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            <Zap className="mr-1 h-3 w-3" />
                            Registo
                          </Badge>
                        </div>
                        {log.exercises && log.exercises.length > 0 && (
                          <div className="mb-3 rounded-lg bg-orange-500/10 p-3">
                            <p className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-1">💪 Treino:</p>
                            <ul className="list-disc list-inside text-sm text-muted-foreground">
                              {log.exercises.map((ex, exIndex) => (
                                <li key={exIndex}>
                                  <strong>{ex.name}:</strong> {ex.sets} séries de {ex.reps} repetições com {ex.weight}kg
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {log.meals && (
                          <div className="rounded-lg bg-blue-500/10 p-3">
                            <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">🍽️ Refeições:</p>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{log.meals}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
              </AnimatePresence>
              {logs.filter((log) => (log.exercises && log.exercises.length > 0) || log.meals).length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-muted/50 p-4 mb-4">
                    <Calendar className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">Ainda não há registos de treinos ou refeições.</p>
                  <p className="text-sm text-muted-foreground mt-1">Comece a adicionar os seus dados acima!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
