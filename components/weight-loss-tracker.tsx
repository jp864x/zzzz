"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import {
  Scale,
  Target,
  TrendingDown,
  TrendingUp,
  Activity,
  Utensils,
  Calculator,
  Zap,
  Plus,
  Loader2,
  Award,
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { motion } from "framer-motion"
import {
  analyzeFoodWithAI,
  calculateTDEE,
  calculateExerciseCalories,
  estimateWeightLoss,
  generateWeightLossTips,
  type FoodItem,
  type UserProfile,
  type Exercise,
  type WeightEntry,
} from "@/lib/nutrition-ai"

export function WeightLossTracker() {
  const [showQuestionnaire, setShowQuestionnaire] = useState(false)
  const [questionnaireData, setQuestionnaireData] = useState({
    age: "",
    gender: "male" as "male" | "female",
    height: "",
    weight: "",
    activityLevel: "sedentary" as "sedentary" | "light" | "moderate" | "active" | "very_active",
    goal: "lose" as "lose" | "maintain" | "gain",
  })

  // Estados do perfil do utilizador
  const [profile, setProfile] = useState<UserProfile>({
    age: 25,
    gender: "male",
    height: 175,
    weight: 70,
    activityLevel: "moderate",
    goal: "lose",
  })

  // Estados dos dados
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([])
  const [foodEntries, setFoodEntries] = useState<FoodItem[]>([])
  const [exercises, setExercises] = useState<Exercise[]>([])

  // Estados do formulário
  const [newWeight, setNewWeight] = useState<string>("")
  const [foodDescription, setFoodDescription] = useState("")
  const [selectedMeal, setSelectedMeal] = useState<"breakfast" | "lunch" | "snack" | "dinner">("breakfast")
  const [exerciseName, setExerciseName] = useState("")
  const [exerciseDuration, setExerciseDuration] = useState<string>("")

  // Estados de loading
  const [isAnalyzingFood, setIsAnalyzingFood] = useState(false)

  useEffect(() => {
    const savedProfile = localStorage.getItem("weightLossProfile")
    const savedWeightEntries = localStorage.getItem("weightEntries")
    const savedFoodEntries = localStorage.getItem("foodEntries")
    const savedExercises = localStorage.getItem("exercises")

    if (!savedProfile) {
      setShowQuestionnaire(true)
    } else {
      setProfile(JSON.parse(savedProfile))
    }

    if (savedWeightEntries) setWeightEntries(JSON.parse(savedWeightEntries))
    if (savedFoodEntries) setFoodEntries(JSON.parse(savedFoodEntries))
    if (savedExercises) setExercises(JSON.parse(savedExercises))
  }, [])

  // Guarda dados no localStorage
  useEffect(() => {
    localStorage.setItem("weightLossProfile", JSON.stringify(profile))
  }, [profile])

  useEffect(() => {
    localStorage.setItem("weightEntries", JSON.stringify(weightEntries))
  }, [weightEntries])

  useEffect(() => {
    localStorage.setItem("foodEntries", JSON.stringify(foodEntries))
  }, [foodEntries])

  useEffect(() => {
    localStorage.setItem("exercises", JSON.stringify(exercises))
  }, [exercises])

  // Cálculos principais
  const stats = useMemo(() => {
    const tdee = calculateTDEE(profile)
    const targetCalories = profile.goal === "lose" ? tdee - 500 : profile.goal === "gain" ? tdee + 300 : tdee

    const todayFood = foodEntries.filter(
      (food) => format(new Date(), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd"),
    )
    const todayCalories = todayFood.reduce((sum, food) => sum + food.calories, 0)

    const todayExercises = exercises.filter((ex) => format(ex.date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd"))
    const todayBurnedCalories = todayExercises.reduce((sum, ex) => sum + ex.caloriesBurned, 0)

    const netCalories = todayCalories - todayBurnedCalories
    const calorieDeficit = targetCalories - netCalories

    const recentWeights = weightEntries.slice(-7)
    const weightTrend =
      recentWeights.length >= 2 ? recentWeights[recentWeights.length - 1].weight - recentWeights[0].weight : 0

    const estimatedWeeklyLoss = estimateWeightLoss(Math.max(calorieDeficit, 0), 7)

    return {
      tdee: Math.round(tdee),
      targetCalories: Math.round(targetCalories),
      todayCalories,
      todayBurnedCalories,
      netCalories,
      calorieDeficit,
      weightTrend,
      estimatedWeeklyLoss,
      currentWeight: weightEntries.length > 0 ? weightEntries[weightEntries.length - 1].weight : profile.weight,
    }
  }, [profile, foodEntries, exercises, weightEntries])

  // Adicionar peso
  const handleAddWeight = () => {
    if (newWeight) {
      const entry: WeightEntry = {
        id: Date.now().toString(),
        weight: Number.parseFloat(newWeight),
        date: new Date(),
      }
      setWeightEntries((prev) => [...prev, entry])
      setNewWeight("")
    }
  }

  const handleQuestionnaireComplete = () => {
    const newProfile: UserProfile = {
      age: Number.parseInt(questionnaireData.age),
      gender: questionnaireData.gender,
      height: Number.parseInt(questionnaireData.height),
      weight: Number.parseInt(questionnaireData.weight),
      activityLevel: questionnaireData.activityLevel,
      goal: questionnaireData.goal,
    }

    setProfile(newProfile)
    setShowQuestionnaire(false)

    // Add initial weight entry
    const initialWeight: WeightEntry = {
      id: Date.now().toString(),
      weight: newProfile.weight,
      date: new Date(),
    }
    setWeightEntries([initialWeight])
  }

  const handleAnalyzeFood = async () => {
    if (!foodDescription.trim()) return

    setIsAnalyzingFood(true)
    try {
      const foodItem = await analyzeFoodWithAI(foodDescription, selectedMeal)
      setFoodEntries((prev) => [...prev, foodItem])
      setFoodDescription("")
    } catch (error) {
      console.error("Erro ao analisar comida:", error)
    } finally {
      setIsAnalyzingFood(false)
    }
  }

  const handleAddExercise = () => {
    if (!exerciseName.trim()) {
      alert("Por favor, insira o tipo de exercício")
      return
    }

    if (!exerciseDuration || Number.parseInt(exerciseDuration) <= 0) {
      alert("Por favor, insira uma duração válida em minutos")
      return
    }

    const duration = Number.parseInt(exerciseDuration)
    const caloriesBurned = calculateExerciseCalories(exerciseName, duration, stats.currentWeight)

    if (caloriesBurned <= 0) {
      alert("Erro no cálculo de calorias. Verifique se o exercício e duração estão corretos.")
      return
    }

    const exercise: Exercise = {
      id: Date.now().toString(),
      name: exerciseName,
      duration,
      caloriesBurned,
      date: new Date(),
    }

    setExercises((prev) => [...prev, exercise])
    setExerciseName("")
    setExerciseDuration("")

    alert(`Exercício adicionado: ${exerciseName} por ${duration} minutos (${caloriesBurned} kcal queimadas)`)
  }

  // Dados para o gráfico de peso
  const weightChartData = useMemo(() => {
    return weightEntries.map((entry) => ({
      date: format(entry.date, "dd/MM"),
      peso: entry.weight,
      fullDate: format(entry.date, "dd 'de' MMMM", { locale: ptBR }),
    }))
  }, [weightEntries])

  const todayFoodByMeal = useMemo(() => {
    const today = format(new Date(), "yyyy-MM-dd")
    const todayFood = foodEntries.filter((food) => format(food.date, "yyyy-MM-dd") === today)

    return {
      breakfast: todayFood.filter((f) => f.mealType === "breakfast"),
      lunch: todayFood.filter((f) => f.mealType === "lunch"),
      snack: todayFood.filter((f) => f.mealType === "snack"),
      dinner: todayFood.filter((f) => f.mealType === "dinner"),
    }
  }, [foodEntries])

  const tips = generateWeightLossTips(stats.todayCalories, stats.targetCalories, Math.abs(stats.weightTrend))

  if (showQuestionnaire) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Configuração Inicial
              </CardTitle>
              <p className="text-center text-gray-600">Vamos calcular o seu gasto calórico diário personalizado</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Idade</Label>
                  <Input
                    type="number"
                    value={questionnaireData.age}
                    onChange={(e) => setQuestionnaireData((prev) => ({ ...prev, age: e.target.value }))}
                    placeholder="Ex: 25"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Género</Label>
                  <Select
                    value={questionnaireData.gender}
                    onValueChange={(value: "male" | "female") =>
                      setQuestionnaireData((prev) => ({ ...prev, gender: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Masculino</SelectItem>
                      <SelectItem value="female">Feminino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Altura (cm)</Label>
                  <Input
                    type="number"
                    value={questionnaireData.height}
                    onChange={(e) => setQuestionnaireData((prev) => ({ ...prev, height: e.target.value }))}
                    placeholder="Ex: 175"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Peso atual (kg)</Label>
                  <Input
                    type="number"
                    value={questionnaireData.weight}
                    onChange={(e) => setQuestionnaireData((prev) => ({ ...prev, weight: e.target.value }))}
                    placeholder="Ex: 70"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Nível de Atividade</Label>
                <Select
                  value={questionnaireData.activityLevel}
                  onValueChange={(value: any) => setQuestionnaireData((prev) => ({ ...prev, activityLevel: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentário (pouco ou nenhum exercício)</SelectItem>
                    <SelectItem value="light">Ligeiro (exercício 1-3 dias/semana)</SelectItem>
                    <SelectItem value="moderate">Moderado (exercício 3-5 dias/semana)</SelectItem>
                    <SelectItem value="active">Ativo (exercício 6-7 dias/semana)</SelectItem>
                    <SelectItem value="very_active">Muito Ativo (exercício intenso diário)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Objetivo</Label>
                <Select
                  value={questionnaireData.goal}
                  onValueChange={(value: any) => setQuestionnaireData((prev) => ({ ...prev, goal: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lose">Perder Peso</SelectItem>
                    <SelectItem value="maintain">Manter Peso</SelectItem>
                    <SelectItem value="gain">Ganhar Peso</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleQuestionnaireComplete}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                disabled={!questionnaireData.age || !questionnaireData.height || !questionnaireData.weight}
              >
                Começar Jornada
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="relative overflow-hidden border-green-500/20 bg-gradient-to-br from-green-500/10 to-transparent">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Peso Atual</p>
                  <p className="text-2xl font-bold text-green-500">{stats.currentWeight}kg</p>
                </div>
                <div className="flex items-center gap-1">
                  {stats.weightTrend < 0 ? (
                    <TrendingDown className="h-4 w-4 text-green-500" />
                  ) : stats.weightTrend > 0 ? (
                    <TrendingUp className="h-4 w-4 text-red-500" />
                  ) : null}
                  <Scale className="h-8 w-8 text-green-500/60" />
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
          <Card className="relative overflow-hidden border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-transparent">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Calorias Hoje</p>
                  <p className="text-2xl font-bold text-blue-500">{stats.todayCalories}</p>
                </div>
                <Utensils className="h-8 w-8 text-blue-500/60" />
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
                  <p className="text-sm font-medium text-muted-foreground">Queimadas</p>
                  <p className="text-2xl font-bold text-orange-500">{stats.todayBurnedCalories}</p>
                </div>
                <Activity className="h-8 w-8 text-orange-500/60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="relative overflow-hidden border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-transparent">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Meta Semanal</p>
                  <p className="text-2xl font-bold text-purple-500">-{stats.estimatedWeeklyLoss.toFixed(1)}kg</p>
                </div>
                <Target className="h-8 w-8 text-purple-500/60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Perfil do Utilizador */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Perfil e Configurações
            </CardTitle>
            <CardDescription>Configure os seus dados para cálculos precisos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Altura (cm)</Label>
                <Input
                  type="number"
                  value={profile.height}
                  onChange={(e) => setProfile((prev) => ({ ...prev, height: Number.parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Idade</Label>
                <Input
                  type="number"
                  value={profile.age}
                  onChange={(e) => setProfile((prev) => ({ ...prev, age: Number.parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Género</Label>
                <Select
                  value={profile.gender}
                  onValueChange={(value: "male" | "female") => setProfile((prev) => ({ ...prev, gender: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Masculino</SelectItem>
                    <SelectItem value="female">Feminino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4 p-4 bg-muted/20 rounded-lg">
              <p className="text-sm font-medium mb-2">
                Gasto Energético Diário: <span className="text-primary">{stats.tdee} kcal</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Meta Calórica: <span className="text-primary">{stats.targetCalories} kcal</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Input Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Registo de Peso */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-green-500" />
              Registar Peso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Peso (kg)</Label>
              <Input
                type="number"
                step="0.1"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                placeholder="Ex: 70.5"
              />
            </div>
            <Button onClick={handleAddWeight} className="w-full" disabled={!newWeight}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Peso
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5 text-blue-500" />
              Analisar Comida
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Refeição</Label>
              <Select value={selectedMeal} onValueChange={(value: any) => setSelectedMeal(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Pequeno-almoço</SelectItem>
                  <SelectItem value="lunch">Almoço</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                  <SelectItem value="dinner">Jantar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Descreva o que comeu</Label>
              <Textarea
                value={foodDescription}
                onChange={(e) => setFoodDescription(e.target.value)}
                placeholder="Ex: 100g de frango grelhado com arroz"
                className="min-h-[80px]"
              />
            </div>
            <Button
              onClick={handleAnalyzeFood}
              className="w-full"
              disabled={!foodDescription.trim() || isAnalyzingFood}
            >
              {isAnalyzingFood ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
              Analisar com IA
            </Button>
          </CardContent>
        </Card>

        {/* Registo de Exercício */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-500" />
              Registar Exercício
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Exercício</Label>
              <Input
                value={exerciseName}
                onChange={(e) => setExerciseName(e.target.value)}
                placeholder="Ex: Caminhada, Corrida, Ginásio"
              />
            </div>
            <div className="space-y-2">
              <Label>Duração (minutos)</Label>
              <Input
                type="number"
                min="1"
                value={exerciseDuration}
                onChange={(e) => setExerciseDuration(e.target.value)}
                placeholder="Ex: 30"
              />
            </div>
            <Button
              onClick={handleAddExercise}
              className="w-full"
              disabled={!exerciseName.trim() || !exerciseDuration || Number.parseInt(exerciseDuration) <= 0}
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Exercício
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Peso */}
      {weightChartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-primary" />
                Evolução do Peso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weightChartData}>
                    <defs>
                      <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis domain={["dataMin - 2", "dataMax + 2"]} className="text-xs" />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background/95 p-3 shadow-lg backdrop-blur-sm">
                              <p className="font-medium">{payload[0]?.payload?.fullDate}</p>
                              <p className="text-sm text-green-500">Peso: {payload[0]?.value}kg</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="peso"
                      stroke="#10b981"
                      fillOpacity={1}
                      fill="url(#colorWeight)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Refeições de Hoje</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(todayFoodByMeal).map(([mealType, foods]) => {
              const mealNames = {
                breakfast: "Pequeno-almoço",
                lunch: "Almoço",
                snack: "Snacks",
                dinner: "Jantar",
              }

              return (
                <div key={mealType} className="border rounded-lg p-3">
                  <h4 className="font-medium text-sm text-gray-700 mb-2">
                    {mealNames[mealType as keyof typeof mealNames]} ({foods.reduce((sum, f) => sum + f.calories, 0)}{" "}
                    kcal)
                  </h4>
                  {foods.length === 0 ? (
                    <p className="text-xs text-gray-400">Nenhuma refeição registada</p>
                  ) : (
                    <div className="space-y-1">
                      {foods.map((food) => (
                        <div key={food.id} className="flex justify-between text-xs">
                          <span>{food.name}</span>
                          <span className="text-gray-500">{food.calories} kcal</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Exercícios de Hoje */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-orange-500" />
            Exercícios de Hoje
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.todayBurnedCalories > 0 ? (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
                <p className="text-sm font-medium text-orange-700">
                  Total queimado hoje: {stats.todayBurnedCalories} kcal
                </p>
              </div>
            ) : null}

            {exercises.filter((ex) => format(ex.date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")).length ===
            0 ? (
              <div className="border rounded-lg p-4 text-center">
                <Activity className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Nenhum exercício registado hoje</p>
                <p className="text-xs text-gray-300 mt-1">Adicione exercícios para ver o progresso</p>
              </div>
            ) : (
              <div className="space-y-2">
                {exercises
                  .filter((ex) => format(ex.date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd"))
                  .map((exercise) => (
                    <div
                      key={exercise.id}
                      className="border rounded-lg p-3 bg-gradient-to-r from-orange-50 to-transparent"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-orange-500" />
                          <span className="font-medium text-sm">{exercise.name}</span>
                        </div>
                        <span className="text-xs text-orange-600 font-medium">{exercise.caloriesBurned} kcal</span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-500">{exercise.duration} minutos</span>
                        <span className="text-xs text-gray-400">{format(exercise.date, "HH:mm")}</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dicas Personalizadas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Dicas Personalizadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tips.map((tip, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-muted/20 rounded-lg">
                  <Zap className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-sm">{tip}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
