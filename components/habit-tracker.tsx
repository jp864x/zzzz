"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Calendar, Target, TrendingUp, MapPin, Settings, Bell, Eye, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface HabitData {
  [day: number]: {
    [habit: string]: boolean
  }
}

interface HabitStats {
  name: string
  completed: number
  total: number
  percentage: number
}

interface StoredHabit {
  id: string
  name: string
  completions: { [key: string]: boolean }
}

interface HabitLocation {
  name: string
  latitude: number
  longitude: number
  radius: number // in meters
  activityType?: string
}

const ACTIVITY_TYPES = {
  ginasio: { name: "Ginásio", icon: "💪", defaultRadius: 50, color: "bg-red-500" },
  aulas: { name: "Aulas", icon: "📚", defaultRadius: 100, color: "bg-blue-500" },
  trabalho: { name: "Trabalho", icon: "💼", defaultRadius: 75, color: "bg-gray-500" },
  hidroginastica: { name: "Hidroginástica", icon: "🏊", defaultRadius: 50, color: "bg-cyan-500" },
  corrida: { name: "Corrida", icon: "🏃", defaultRadius: 25, color: "bg-green-500" },
  biblioteca: { name: "Biblioteca", icon: "📖", defaultRadius: 50, color: "bg-purple-500" },
  parque: { name: "Parque", icon: "🌳", defaultRadius: 100, color: "bg-emerald-500" },
  clinica: { name: "Clínica", icon: "🏥", defaultRadius: 50, color: "bg-pink-500" },
}

export function HabitTracker() {
  const [habits, setHabits] = useState<string[]>(["Ginásio", "Andar", "Correr", "Ler", "Meditar"])
  const [newHabit, setNewHabit] = useState("")
  const [habitData, setHabitData] = useState<HabitData>({})
  const [currentMonth] = useState(new Date().getMonth())
  const [currentYear] = useState(new Date().getFullYear())

  const [habitLocations, setHabitLocations] = useState<{ [habit: string]: HabitLocation }>({})
  const [showLocationSettings, setShowLocationSettings] = useState(false)
  const [selectedHabitForLocation, setSelectedHabitForLocation] = useState<string>("")
  const [locationName, setLocationName] = useState("")
  const [locationRadius, setLocationRadius] = useState(100)
  const [isTrackingLocation, setIsTrackingLocation] = useState(false)
  const [notifications, setNotifications] = useState<string[]>([])
  const [selectedActivityType, setSelectedActivityType] = useState<string>("")
  const [placeSuggestions, setPlaceSuggestions] = useState<any[]>([])
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string>("")
  const [selectedPlace, setSelectedPlace] = useState<{ name: string; latitude: number; longitude: number } | null>(null)
  const [showLocations, setShowLocations] = useState(false)

  useEffect(() => {
    const savedHabits = localStorage.getItem("habits")
    const savedHabitData = localStorage.getItem("habitData")
    const savedLocations = localStorage.getItem("habitLocations")

    if (savedHabits) {
      try {
        const parsedHabits = JSON.parse(savedHabits)
        if (Array.isArray(parsedHabits)) {
          setHabits(parsedHabits)
        }
      } catch (error) {
        console.error("Error loading habits:", error)
      }
    }

    if (savedHabitData) {
      try {
        const parsedHabitData = JSON.parse(savedHabitData)
        setHabitData(parsedHabitData)
      } catch (error) {
        console.error("Error loading habit data:", error)
      }
    }

    if (savedLocations) {
      try {
        setHabitLocations(JSON.parse(savedLocations))
      } catch (error) {
        console.error("Error loading habit locations:", error)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("habits", JSON.stringify(habits))

    const compatibleHabits: StoredHabit[] = habits.map((habit, index) => ({
      id: `habit-${index}`,
      name: habit,
      completions: {},
    }))

    Object.entries(habitData).forEach(([day, dayHabits]) => {
      Object.entries(dayHabits).forEach(([habitName, completed]) => {
        const habitIndex = habits.indexOf(habitName)
        if (habitIndex !== -1) {
          const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
          compatibleHabits[habitIndex].completions[dateKey] = completed
        }
      })
    })

    localStorage.setItem("weeklyReportHabits", JSON.stringify(compatibleHabits))
  }, [habits, habitData, currentMonth, currentYear])

  useEffect(() => {
    localStorage.setItem("habitData", JSON.stringify(habitData))
  }, [habitData])

  useEffect(() => {
    localStorage.setItem("habitLocations", JSON.stringify(habitLocations))
  }, [habitLocations])

  useEffect(() => {
    let watchId: number | null = null

    if (isTrackingLocation && Object.keys(habitLocations).length > 0) {
      if ("geolocation" in navigator) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            checkLocationForHabits(position.coords.latitude, position.coords.longitude)
          },
          (error) => {
            console.error("Geolocation error:", error)
            if (error.code === error.TIMEOUT) {
              addNotification("Timeout na localização - tente novamente")
            } else if (error.code === error.PERMISSION_DENIED) {
              addNotification("Permissão de localização negada")
            } else {
              addNotification("Erro ao aceder à localização")
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 30000, // Increased to 30 seconds
            maximumAge: 300000, // 5 minutes cache
          },
        )
      }
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [isTrackingLocation, habitLocations])

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const monthName = new Date(currentYear, currentMonth).toLocaleDateString("pt-PT", { month: "long" })

  const habitStats: HabitStats[] = habits.map((habit) => {
    const completed = days.filter((day) => habitData[day]?.[habit]).length
    const total = days.length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
    return { name: habit, completed, total, percentage }
  })

  const addHabit = () => {
    if (newHabit.trim() && !habits.includes(newHabit.trim())) {
      setHabits([...habits, newHabit.trim()])
      setNewHabit("")
    }
  }

  const removeHabit = (habitToRemove: string) => {
    setHabits(habits.filter((habit) => habit !== habitToRemove))
    const newHabitData = { ...habitData }
    Object.keys(newHabitData).forEach((day) => {
      delete newHabitData[Number.parseInt(day)][habitToRemove]
    })
    setHabitData(newHabitData)
    removeHabitLocation(habitToRemove)
  }

  const toggleHabit = (day: number, habit: string) => {
    setHabitData((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [habit]: !prev[day]?.[habit],
      },
    }))
  }

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return "from-green-500 to-emerald-600"
    if (percentage >= 60) return "from-yellow-500 to-orange-500"
    if (percentage >= 40) return "from-orange-500 to-red-500"
    return "from-red-500 to-red-600"
  }

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lon2 - lon1) * Math.PI) / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }

  const searchPlaces = async (query: string) => {
    if (query.length < 3) {
      setPlaceSuggestions([])
      return
    }

    setIsLoadingPlaces(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=pt&addressdetails=1`,
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data && data.length > 0) {
        const formattedResults = data.map((place: any) => ({
          name: place.display_name,
          place_id: place.place_id,
          geometry: {
            location: {
              lat: Number.parseFloat(place.lat),
              lng: Number.parseFloat(place.lon),
            },
          },
        }))
        setPlaceSuggestions(formattedResults)
      } else {
        const commonPlaces = getCommonPlaces(query)
        setPlaceSuggestions(commonPlaces)
      }
    } catch (error) {
      console.error("Error searching places:", error)
      const commonPlaces = getCommonPlaces(query)
      setPlaceSuggestions(commonPlaces)
      if (commonPlaces.length === 0) {
        addNotification("Erro ao procurar locais. Tente escrever o nome completo.")
      }
    }
    setIsLoadingPlaces(false)
  }

  const getCommonPlaces = (query: string) => {
    const commonPlaces = [
      { name: "Ginásio Holmes Place, Lisboa", coords: { lat: 38.7223, lng: -9.1393 } },
      { name: "Ginásio Solinca, Porto", coords: { lat: 41.1579, lng: -8.6291 } },
      { name: "Universidade de Lisboa", coords: { lat: 38.7504, lng: -9.1553 } },
      { name: "Universidade do Porto", coords: { lat: 41.1496, lng: -8.6109 } },
      { name: "Centro Comercial Colombo, Lisboa", coords: { lat: 38.7569, lng: -9.1896 } },
      { name: "Piscina Municipal, Lisboa", coords: { lat: 38.7223, lng: -9.1393 } },
      { name: "Biblioteca Municipal, Porto", coords: { lat: 41.1579, lng: -8.6291 } },
      { name: "Parque da Cidade, Porto", coords: { lat: 41.1621, lng: -8.6756 } },
      { name: "Estação de Metro, Lisboa", coords: { lat: 38.7223, lng: -9.1393 } },
      { name: "Campus Universitário, Coimbra", coords: { lat: 40.2033, lng: -8.4103 } },
    ]

    return commonPlaces
      .filter((place) => place.name.toLowerCase().includes(query.toLowerCase()))
      .map((place) => ({
        name: place.name,
        place_id: `common_${place.name.replace(/\s+/g, "_")}`,
        geometry: {
          location: {
            lat: place.coords.lat,
            lng: place.coords.lng,
          },
        },
      }))
  }

  const checkLocationForHabits = (currentLat: number, currentLon: number) => {
    const today = new Date().getDate()
    const debugMessages: string[] = []

    debugMessages.push(`📍 Atual: ${currentLat.toFixed(6)}, ${currentLon.toFixed(6)}`)

    Object.entries(habitLocations).forEach(([habit, location]) => {
      if (location.latitude === 0 && location.longitude === 0) {
        debugMessages.push(`⚠️ ${habit}: Coordenadas inválidas (0,0)!`)
        return
      }

      const distance = calculateDistance(currentLat, currentLon, location.latitude, location.longitude)
      const isWithinRadius = distance <= location.radius
      const isAlreadyChecked = habitData[today]?.[habit]

      debugMessages.push(
        `🎯 ${habit}: ${Math.round(distance)}m de ${location.name} (Raio: ${location.radius}m) ${isWithinRadius ? "✅" : "❌"} ${isAlreadyChecked ? "[JÁ MARCADO]" : "[DISPONÍVEL]"}`,
      )

      if (isWithinRadius && !isAlreadyChecked) {
        setHabitData((prev) => ({
          ...prev,
          [today]: {
            ...prev[today],
            [habit]: true,
          },
        }))
        addNotification(`✅ ${habit} marcado automaticamente em ${location.name}! (${Math.round(distance)}m)`)
        debugMessages.push(`🎉 ${habit} MARCADO AUTOMATICAMENTE!`)
      }
    })

    setDebugInfo(debugMessages.join(" | "))
  }

  const addNotification = (message: string) => {
    setNotifications((prev) => [...prev, message])
    setTimeout(() => {
      setNotifications((prev) => prev.slice(1))
    }, 5000)
  }

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          const newLocation: HabitLocation = {
            name: locationName || "Localização Atual",
            latitude,
            longitude,
            radius: locationRadius,
            activityType: selectedActivityType,
          }

          setHabitLocations((prev) => ({
            ...prev,
            [selectedHabitForLocation]: newLocation,
          }))

          setShowLocationSettings(false)
          setLocationName("")
          setSelectedHabitForLocation("")
          setSelectedActivityType("")
          setLocationRadius(100)
          setSelectedPlace(null)
          addNotification(`Localização configurada para ${selectedHabitForLocation}`)
        },
        (error) => {
          console.error("Error getting location:", error)
          addNotification("Erro ao obter localização atual")
        },
      )
    } else {
      addNotification("Geolocalização não suportada neste dispositivo")
    }
  }

  const removeHabitLocation = (habit: string) => {
    setHabitLocations((prev) => {
      const newLocations = { ...prev }
      delete newLocations[habit]
      return newLocations
    })
  }

  const toggleLocationTracking = () => {
    setIsTrackingLocation(!isTrackingLocation)
    if (!isTrackingLocation) {
      addNotification("Rastreamento de localização ativado")
    } else {
      addNotification("Rastreamento de localização desativado")
    }
  }

  const autoSyncWithHabits = (activityType: string) => {
    const activityName = ACTIVITY_TYPES[activityType as keyof typeof ACTIVITY_TYPES]?.name.toLowerCase()
    const matchingHabit = habits.find(
      (habit) => habit.toLowerCase().includes(activityName) || activityName.includes(habit.toLowerCase()),
    )

    if (matchingHabit) {
      setSelectedHabitForLocation(matchingHabit)
      addNotification(`Sincronizado com hábito: ${matchingHabit}`)
    }
  }

  const selectPlace = (place: any) => {
    const lat = place.geometry.location.lat
    const lng = place.geometry.location.lng

    if (lat === 0 && lng === 0) {
      addNotification("⚠️ Localização inválida selecionada")
      return
    }

    setSelectedPlace(place)
    setLocationName(place.name)
    setPlaceSuggestions([])

    const newLocation: HabitLocation = {
      name: place.name,
      latitude: lat,
      longitude: lng,
      radius: locationRadius,
      activityType: selectedActivityType,
    }

    setHabitLocations((prev) => ({
      ...prev,
      [selectedHabitForLocation]: newLocation,
    }))

    setShowLocationSettings(false)
    setLocationName("")
    setSelectedHabitForLocation("")
    setSelectedActivityType("")
    setLocationRadius(100)
    setSelectedPlace(null)
    addNotification(`📍 Localização configurada: ${place.name}`)
  }

  const configureLocationForHabit = () => {
    if (!selectedHabitForLocation || !locationName) {
      addNotification("Por favor, selecione um hábito e local")
      return
    }

    if (selectedPlace) {
      const newLocation: HabitLocation = {
        name: selectedPlace.name,
        latitude: selectedPlace.latitude,
        longitude: selectedPlace.longitude,
        radius: locationRadius,
        activityType: selectedActivityType,
      }

      setHabitLocations((prev) => ({
        ...prev,
        [selectedHabitForLocation]: newLocation,
      }))

      setShowLocationSettings(false)
      setLocationName("")
      setSelectedHabitForLocation("")
      setSelectedActivityType("")
      setLocationRadius(100)
      setSelectedPlace(null)
      addNotification(`Localização configurada: ${selectedPlace.name} para ${selectedHabitForLocation}`)
    } else {
      getCurrentLocation()
    }
  }

  return (
    <div className="space-y-6">
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map((notification, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
            >
              <Bell className="h-4 w-4" />
              {notification}
            </motion.div>
          ))}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              Mês Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold capitalize">{monthName}</p>
            <p className="text-blue-100">{daysInMonth} dias</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-teal-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5" />
              Hábitos Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{habits.length}</p>
            <p className="text-green-100">hábitos a acompanhar</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5" />
              Média Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {habitStats.length > 0
                ? Math.round(habitStats.reduce((acc, stat) => acc + stat.percentage, 0) / habitStats.length)
                : 0}
              %
            </p>
            <p className="text-orange-100">de conclusão</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5" />
              Localização
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{Object.keys(habitLocations).length}</p>
            <p className="text-purple-100">locais configurados</p>

            <div className="flex gap-2 mt-2">
              <Button variant="secondary" size="sm" className="flex-1" onClick={toggleLocationTracking}>
                {isTrackingLocation ? "Desativar" : "Ativar"} GPS
              </Button>
              {Object.keys(habitLocations).length > 0 && (
                <Button variant="secondary" size="sm" onClick={() => setShowLocations(!showLocations)} className="px-3">
                  <Eye className="h-4 w-4" />
                </Button>
              )}
            </div>

            {showLocations && Object.keys(habitLocations).length > 0 && (
              <div className="mt-3 space-y-2 border-t border-purple-400 pt-3">
                <p className="text-sm font-medium text-purple-100">Locais Configurados:</p>
                {Object.entries(habitLocations).map(([habit, location]) => (
                  <div key={habit} className="bg-white/10 rounded-lg p-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{habit}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-white/20 px-2 py-1 rounded">{location.radius}m</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            removeHabitLocation(habit)
                            addNotification(`Localização removida para ${habit}`)
                          }}
                          className="h-6 w-6 p-0 text-red-300 hover:text-red-100 hover:bg-red-500/20"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-purple-100 text-xs mt-1 truncate">📍 {location.name}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Gerir Hábitos
              <Button variant="outline" size="sm" onClick={() => setShowLocationSettings(!showLocationSettings)}>
                <Settings className="h-4 w-4 mr-2" />
                Localizações
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Adicionar novo hábito..."
                value={newHabit}
                onChange={(e) => setNewHabit(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addHabit()}
                className="flex-1"
              />
              <Button onClick={addHabit} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {habits.map((habit) => (
                <Badge key={habit} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                  {habit}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeHabit(habit)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>

            {showLocationSettings && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                  <h3 className="text-xl font-bold mb-4">Configurar Localização</h3>

                  {debugInfo && (
                    <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
                      <strong>Debug:</strong> {debugInfo}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Tipo de Atividade</label>
                      <select
                        value={selectedActivityType}
                        onChange={(e) => {
                          setSelectedActivityType(e.target.value)
                          if (e.target.value) {
                            const activityConfig = ACTIVITY_TYPES[e.target.value as keyof typeof ACTIVITY_TYPES]
                            setLocationRadius(activityConfig.defaultRadius)
                            autoSyncWithHabits(e.target.value)
                          }
                        }}
                        className="w-full p-2 border rounded-lg"
                      >
                        <option value="">Selecionar tipo...</option>
                        {Object.entries(ACTIVITY_TYPES).map(([key, config]) => (
                          <option key={key} value={key}>
                            {config.icon} {config.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Hábito</label>
                      <select
                        value={selectedHabitForLocation}
                        onChange={(e) => setSelectedHabitForLocation(e.target.value)}
                        className="w-full p-2 border rounded-lg"
                      >
                        <option value="">Selecionar hábito...</option>
                        {habits.map((habit) => (
                          <option key={habit} value={habit}>
                            {habit}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nome do Local</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={locationName}
                          onChange={(e) => {
                            setLocationName(e.target.value)
                            searchPlaces(e.target.value)
                          }}
                          placeholder="Digite o nome do local (ex: Ginásio XYZ)"
                          className="w-full p-2 border rounded-lg"
                        />

                        {placeSuggestions.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {isLoadingPlaces && <div className="p-2 text-gray-500">Procurando locais...</div>}
                            {placeSuggestions.map((place, index) => (
                              <button
                                key={place.place_id || index}
                                onClick={() => selectPlace(place)}
                                className="w-full p-2 text-left hover:bg-gray-100 border-b last:border-b-0"
                              >
                                <div className="font-medium">{place.name}</div>
                                {place.address && <div className="text-sm text-gray-500">{place.address}</div>}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Raio de Detecção: {locationRadius}m</label>
                      <input
                        type="range"
                        min="10"
                        max="500"
                        value={locationRadius}
                        onChange={(e) => setLocationRadius(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={configureLocationForHabit}
                        className="flex-1 bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
                      >
                        Configurar Local
                      </button>
                      <button
                        onClick={getCurrentLocation}
                        className="px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                      >
                        📍 Usar Atual
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowLocationSettings(false)}
                    className="mt-4 w-full bg-gray-500 text-white p-2 rounded-lg"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas dos Hábitos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {habitStats.map((stat) => (
                <div
                  key={stat.name}
                  className={cn("p-4 rounded-lg bg-gradient-to-r text-white", getCompletionColor(stat.percentage))}
                >
                  <h3 className="font-semibold text-lg">{stat.name}</h3>
                  <p className="text-2xl font-bold">{stat.percentage}%</p>
                  <p className="text-sm opacity-90">
                    {stat.completed}/{stat.total} dias
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Tabela de Hábitos - {monthName.charAt(0).toUpperCase() + monthName.slice(1)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-border p-2 bg-muted font-semibold text-left">Dia</th>
                    {habits.map((habit) => (
                      <th
                        key={habit}
                        className="border border-border p-2 bg-muted font-semibold text-center min-w-[80px]"
                      >
                        {habit}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {days.map((day) => (
                    <tr key={day} className="hover:bg-muted/50">
                      <td className="border border-border p-2 font-medium">{day}</td>
                      {habits.map((habit) => (
                        <td
                          key={habit}
                          className={cn(
                            "border border-border p-2 text-center cursor-pointer transition-colors",
                            habitData[day]?.[habit]
                              ? "bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800"
                              : "hover:bg-muted",
                          )}
                          onClick={() => toggleHabit(day, habit)}
                        >
                          {habitData[day]?.[habit] ? (
                            <span className="text-green-600 dark:text-green-400 text-xl">✓</span>
                          ) : (
                            <span className="text-muted-foreground">○</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default HabitTracker
