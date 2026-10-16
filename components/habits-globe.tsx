"use client"

import { useEffect, useRef, useState } from "react"
import { Users, RotateCcw, Building, Mountain, MapPin, Navigation, UserCheck } from "lucide-react"
import type { SocialHabit } from "@/lib/social-service"

interface HabitsGlobeProps {
  habits: SocialHabit[]
}

export default function HabitsGlobe({ habits }: HabitsGlobeProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const maplibregl = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null)
  const [nearbyFriends, setNearbyFriends] = useState<SocialHabit[]>([])
  const [showFriendProfile, setShowFriendProfile] = useState(false)
  const [selectedFriendData, setSelectedFriendData] = useState<SocialHabit | null>(null)

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    const initializeMap = async () => {
      try {
        maplibregl.current = await import("maplibre-gl")

        map.current = new maplibregl.current.Map({
          container: mapContainer.current!,
          style: {
            version: 8,
            sources: {
              "osm-tiles": {
                type: "raster",
                tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
                tileSize: 256,
                attribution: "© OpenStreetMap contributors",
              },
            },
            layers: [
              {
                id: "osm-layer",
                type: "raster",
                source: "osm-tiles",
              },
            ],
          },
          center: [-8.2245, 39.3999], // Portugal center
          zoom: 6,
          pitch: 45,
          bearing: 0,
          antialias: true,
        })

        const addHabitPins = () => {
          if (!map.current || !maplibregl.current || !habits.length) return

          try {
            const validHabits = habits.filter(
              (habit) =>
                habit.location &&
                typeof habit.location.lat === "number" &&
                typeof habit.location.lng === "number" &&
                !isNaN(habit.location.lat) &&
                !isNaN(habit.location.lng),
            )

            if (validHabits.length === 0) {
              console.warn("No valid habits with coordinates found")
              return
            }

            const geojsonData = {
              type: "FeatureCollection",
              features: validHabits.map((habit, index) => {
                const timestamp =
                  habit.timestamp instanceof Date
                    ? habit.timestamp.toLocaleString("pt-PT")
                    : new Date().toLocaleString("pt-PT")

                return {
                  type: "Feature",
                  properties: {
                    id: index,
                    userName: habit.userName,
                    habitName: habit.habitName,
                    category: habit.category,
                    points: habit.points,
                    locationName: habit.location.name,
                    timestamp: timestamp,
                    color: getMarkerColor(habit.category),
                  },
                  geometry: {
                    type: "Point",
                    coordinates: [habit.location.lng, habit.location.lat],
                  },
                }
              }),
            }

            if (map.current.getSource("habit-pins")) {
              map.current.getSource("habit-pins").setData(geojsonData)
            } else {
              map.current.addSource("habit-pins", {
                type: "geojson",
                data: geojsonData,
              })
            }

            if (!map.current.getLayer("habit-pins-circle")) {
              map.current.addLayer({
                id: "habit-pins-circle",
                type: "circle",
                source: "habit-pins",
                paint: {
                  "circle-radius": ["interpolate", ["linear"], ["zoom"], 6, 8, 14, 16, 18, 24],
                  "circle-color": ["get", "color"],
                  "circle-stroke-width": 3,
                  "circle-stroke-color": "#ffffff",
                  "circle-opacity": 0.9,
                },
              })
            }

            map.current.on("click", "habit-pins-circle", (e: any) => {
              const feature = e.features[0]
              const coordinates = e.lngLat
              const properties = feature.properties

              new maplibregl.current.Popup({ offset: 25 })
                .setLngLat(coordinates)
                .setHTML(`
                  <div class="p-3 min-w-[200px]">
                    <div class="font-semibold text-gray-800 mb-2">${properties.userName}</div>
                    <div class="text-sm text-gray-600 mb-1">${properties.habitName}</div>
                    <div class="text-xs text-gray-500 mb-2">
                      📍 ${properties.locationName} • ${properties.category}
                    </div>
                    <div class="text-xs text-blue-600 font-semibold mb-2">+${properties.points} pontos</div>
                    <div class="text-xs text-gray-400 mb-3">${properties.timestamp}</div>
                    <button onclick="window.navigateToFriend('${properties.userName}')" 
                            class="w-full bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 transition-colors">
                      Ver Perfil do Amigo
                    </button>
                  </div>
                `)
                .addTo(map.current)

              setSelectedFriend(properties.userName)
              findNearbyFriends(coordinates.lng, coordinates.lat)
            })

            map.current.on("mouseenter", "habit-pins-circle", () => {
              map.current.getCanvas().style.cursor = "pointer"
            })

            map.current.on("mouseleave", "habit-pins-circle", () => {
              map.current.getCanvas().style.cursor = ""
            })
          } catch (error) {
            console.error("Error adding habit pins:", error)
            setError("Erro ao adicionar pins dos hábitos")
          }
        }

        map.current.on("load", () => {
          setMapLoaded(true)
          setIsLoading(false)
          addHabitPins()
        })

        map.current.on("error", (e: any) => {
          console.error("Map error details:", e.error || e)
          setError(`Erro no mapa: ${e.error?.message || "Erro desconhecido"}`)
          setIsLoading(false)
        })
        ;(window as any).navigateToFriend = (userName: string) => {
          const friendData = habits.find((h) => h.userName === userName)
          if (friendData) {
            setSelectedFriendData(friendData)
            setShowFriendProfile(true)
            setSelectedFriend(userName)
          }
        }
      } catch (err) {
        console.error("Error initializing map:", err)
        setError("Erro ao inicializar mapa")
        setIsLoading(false)
      }
    }

    initializeMap()

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [habits])

  const getMarkerColor = (category: string) => {
    const colors: { [key: string]: string } = {
      ginásio: "#ef4444",
      corrida: "#22c55e",
      hidroginástica: "#3b82f6",
      aulas: "#eab308",
      trabalho: "#6b7280",
      leitura: "#a855f7",
      meditação: "#f97316",
    }
    return colors[category.toLowerCase()] || "#6b7280"
  }

  const findNearbyFriends = (lng: number, lat: number) => {
    const nearby = habits.filter((habit) => {
      const distance = Math.sqrt(Math.pow(habit.location.lng - lng, 2) + Math.pow(habit.location.lat - lat, 2))
      return distance < 0.01 // Approximately 1km
    })
    setNearbyFriends(nearby)
  }

  const flyToFriend = (habit: SocialHabit) => {
    if (map.current) {
      map.current.flyTo({
        center: [habit.location.lng, habit.location.lat],
        zoom: 16,
        pitch: 60,
        duration: 2000,
      })
      setSelectedFriend(habit.userName)
    }
  }

  const flyToLisbon = () => {
    if (map.current) {
      map.current.flyTo({
        center: [-9.1393, 38.7223],
        zoom: 14,
        pitch: 60,
        bearing: 0,
        duration: 2000,
      })
    }
  }

  const flyToPorto = () => {
    if (map.current) {
      map.current.flyTo({
        center: [-8.6291, 41.1579],
        zoom: 14,
        pitch: 60,
        bearing: 0,
        duration: 2000,
      })
    }
  }

  const resetView = () => {
    if (map.current) {
      map.current.flyTo({
        center: [-8.2245, 39.3999],
        zoom: 6,
        pitch: 45,
        bearing: 0,
        duration: 2000,
      })
    }
    setSelectedFriend(null)
    setNearbyFriends([])
  }

  const toggleSatellite = () => {
    if (map.current && mapLoaded) {
      try {
        const currentStyle = map.current.getStyle()
        const currentSource = currentStyle.sources["maplibre-demo-tiles"] || currentStyle.sources["osm-tiles"]

        if (currentSource) {
          const newStyle = map.current.getStyle().sources["satellite"]
            ? "https://demotiles.maplibre.org/style.json"
            : {
                version: 8,
                sources: {
                  satellite: {
                    type: "raster",
                    tiles: [
                      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                    ],
                    tileSize: 256,
                    attribution: "© Esri",
                  },
                },
                layers: [
                  {
                    id: "satellite-layer",
                    type: "raster",
                    source: "satellite",
                  },
                ],
              }

          map.current.setStyle(newStyle)

          map.current.once("styledata", () => {
            if (mapLoaded) {
              setTimeout(() => {
                if (map.current.getSource("habit-pins")) {
                  map.current.getSource("habit-pins").setData({
                    type: "FeatureCollection",
                    features: habits.map((habit, index) => {
                      const timestamp =
                        habit.timestamp instanceof Date
                          ? habit.timestamp.toLocaleString("pt-PT")
                          : new Date().toLocaleString("pt-PT")

                      return {
                        type: "Feature",
                        properties: {
                          id: index,
                          userName: habit.userName,
                          habitName: habit.habitName,
                          category: habit.category,
                          points: habit.points,
                          locationName: habit.location.name,
                          timestamp: timestamp,
                          color: getMarkerColor(habit.category),
                        },
                        geometry: {
                          type: "Point",
                          coordinates: [habit.location.lng, habit.location.lat],
                        },
                      }
                    }),
                  })
                }
              }, 100)
            }
          })
        }
      } catch (error) {
        console.error("Error toggling satellite:", error)
      }
    }
  }

  const closeFriendProfile = () => {
    setShowFriendProfile(false)
    setSelectedFriendData(null)
  }

  const flyToFriendFromModal = () => {
    if (selectedFriendData && map.current) {
      map.current.flyTo({
        center: [selectedFriendData.location.lng, selectedFriendData.location.lat],
        zoom: 16,
        pitch: 60,
        duration: 2000,
      })
      closeFriendProfile()
    }
  }

  const getFriendProfileData = (userName: string) => {
    const friendHabits = habits.filter((h) => h.userName === userName)

    // Calculate most frequent habits
    const habitCounts: { [key: string]: number } = {}
    friendHabits.forEach((habit) => {
      habitCounts[habit.habitName] = (habitCounts[habit.habitName] || 0) + 1
    })

    const mostFrequentHabits = Object.entries(habitCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([habit, count]) => ({ habit, count }))

    const friendPhotos: { [key: string]: string } = {
      "Maria Santos": "/brunette-woman-profile.png",
      "Pedro Costa": "/man-profile-beard.png",
      "Ana Ferreira": "/blonde-woman-profile.png",
      "Carlos Oliveira": "/man-profile-glasses.png",
      "João Silva": "/young-man-profile.png",
    }

    const totalPoints = friendHabits.reduce((sum, h) => sum + h.points, 0)
    const totalHabits = friendHabits.length

    return {
      photo: friendPhotos[userName] || "/diverse-group.png",
      mostFrequentHabits,
      totalPoints,
      totalHabits,
      streak: Math.floor(Math.random() * 15) + 1, // Mock streak data
      ranking: Math.floor(Math.random() * 50) + 1, // Mock ranking
    }
  }

  if (error) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 font-semibold mb-2">Erro no Mapa</div>
          <div className="text-red-500 text-sm">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-800">Mapa Interativo - Hábitos dos Amigos</h3>
        <div className="ml-auto flex items-center gap-1 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          <span>{habits.length} atividades</span>
        </div>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={flyToLisbon}
          className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
        >
          <Building className="w-4 h-4" />
          Lisboa
        </button>
        <button
          onClick={flyToPorto}
          className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
        >
          <Mountain className="w-4 h-4" />
          Porto
        </button>
        <button
          onClick={resetView}
          className="flex items-center gap-1 px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
        >
          <RotateCcw className="w-4 h-4" />
          Vista Geral
        </button>
        <button
          onClick={toggleSatellite}
          className="flex items-center gap-1 px-3 py-1 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
        >
          🛰️ Satélite
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <div
            className="relative bg-gray-200 rounded-lg shadow-xl border-2 border-blue-200 overflow-hidden"
            style={{ height: "400px" }}
          >
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white z-10">
                <div className="text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <div>Carregando mapa interativo...</div>
                </div>
              </div>
            )}
            <div ref={mapContainer} className="w-full h-full" />
          </div>
        </div>

        <div className="col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-4 h-[400px] overflow-y-auto">
            <div className="flex items-center gap-2 mb-3">
              <Navigation className="w-4 h-4 text-blue-600" />
              <h4 className="font-semibold text-gray-800">Amigos</h4>
            </div>

            {selectedFriend && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-blue-800">{selectedFriend}</span>
                </div>
                <div className="text-xs text-blue-600">Amigo selecionado</div>
              </div>
            )}

            <div className="space-y-2">
              {habits.map((habit, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedFriend === habit.userName
                      ? "bg-blue-100 border-2 border-blue-300"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                  onClick={() => flyToFriend(habit)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getMarkerColor(habit.category) }}
                    ></div>
                    <span className="font-semibold text-sm">{habit.userName}</span>
                  </div>
                  <div className="text-xs text-gray-600 mb-1">{habit.habitName}</div>
                  <div className="text-xs text-gray-500">📍 {habit.location.name}</div>
                  <div className="text-xs text-blue-600 font-semibold">+{habit.points} pontos</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showFriendProfile && selectedFriendData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Perfil do Amigo</h3>
              <button onClick={closeFriendProfile} className="text-gray-500 hover:text-gray-700 text-xl">
                ×
              </button>
            </div>

            {(() => {
              const profileData = getFriendProfileData(selectedFriendData.userName)
              return (
                <>
                  <div className="text-center mb-6">
                    <img
                      src={profileData.photo || "/placeholder.svg"}
                      alt={selectedFriendData.userName}
                      className="w-20 h-20 rounded-full mx-auto mb-3 object-cover border-4 border-blue-200"
                    />
                    <h4 className="text-xl font-semibold text-gray-800">{selectedFriendData.userName}</h4>
                    <div className="text-sm text-gray-600">
                      #{profileData.ranking} no ranking • {profileData.streak} dias de streak
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                      <div className="text-sm font-semibold text-purple-700 mb-2">Hábitos Mais Frequentes</div>
                      <div className="space-y-2">
                        {profileData.mostFrequentHabits.map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-purple-600 text-sm">{item.habit}</span>
                            <span className="bg-purple-200 text-purple-800 px-2 py-1 rounded-full text-xs">
                              {item.count}x
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-blue-600">{profileData.totalPoints}</div>
                        <div className="text-xs text-blue-700">Pontos Totais</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-green-600">{profileData.totalHabits}</div>
                        <div className="text-xs text-green-700">Hábitos Completos</div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm font-semibold text-gray-700">Último Hábito</div>
                      <div className="text-gray-600">{selectedFriendData.habitName}</div>
                      <div className="text-xs text-gray-500 mt-1">📍 {selectedFriendData.location.name}</div>
                      <div className="text-xs text-blue-600 font-semibold mt-1">
                        +{selectedFriendData.points} pontos
                      </div>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-3">
                      <div className="text-sm font-semibold text-orange-700">Categoria Favorita</div>
                      <div className="flex items-center gap-2 mt-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getMarkerColor(selectedFriendData.category) }}
                        ></div>
                        <span className="text-orange-600 capitalize">{selectedFriendData.category}</span>
                      </div>
                    </div>
                  </div>
                </>
              )
            })()}

            <div className="flex gap-2">
              <button
                onClick={flyToFriendFromModal}
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Ver no Mapa
              </button>
              <button
                onClick={closeFriendProfile}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-600 bg-white rounded-lg p-3">
        <div className="font-semibold mb-1">Funcionalidades:</div>
        <div>• 📍 Pins fixos que não se movem durante rotação</div>
        <div>• 👥 Clique nos pins ou na lista para navegar para amigos</div>
        <div>• 🗺️ Mapa real interativo de Portugal com edifícios 3D</div>
        <div>• 🔍 Arraste para navegar, scroll para zoom</div>
        <div>• 🛰️ Alterne entre mapa e vista satélite</div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-3 text-center shadow-sm">
          <div className="text-2xl font-bold text-blue-600">{habits.length}</div>
          <div className="text-xs text-gray-600">Hábitos Hoje</div>
        </div>
        <div className="bg-white rounded-lg p-3 text-center shadow-sm">
          <div className="text-2xl font-bold text-green-600">{habits.reduce((sum, h) => sum + h.points, 0)}</div>
          <div className="text-xs text-gray-600">Pontos Totais</div>
        </div>
        <div className="bg-white rounded-lg p-3 text-center shadow-sm">
          <div className="text-2xl font-bold text-purple-600">{new Set(habits.map((h) => h.userName)).size}</div>
          <div className="text-xs text-gray-600">Amigos Ativos</div>
        </div>
      </div>
    </div>
  )
}
