"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Users, Trophy, Globe, Bell, Search, UserPlus, Star } from "lucide-react"
import HabitsGlobe from "./habits-globe"

// Mock data for testing instead of Firebase calls
const mockUserProfile = {
  id: "user123",
  name: "João Silva",
  email: "joao@example.com",
  avatar: "/young-man-profile.png",
  totalPoints: 1250,
  following: ["user456", "user789"],
  followers: ["user456", "user999"],
  createdAt: new Date(),
}

const mockFriendsHabits = [
  {
    id: "habit1",
    userId: "user456",
    userName: "Maria Santos",
    userAvatar: "/brunette-woman-profile.png",
    habitName: "Treino de Força",
    category: "ginásio",
    location: { name: "Fitness Hut Colombo", lat: 38.7578, lng: -9.2039 },
    points: 15,
    timestamp: { toDate: () => new Date(Date.now() - 2 * 60 * 60 * 1000) },
  },
  {
    id: "habit2",
    userId: "user789",
    userName: "Pedro Costa",
    userAvatar: "/man-profile-beard.png",
    habitName: "Corrida Matinal",
    category: "corrida",
    location: { name: "Parque Eduardo VII", lat: 38.7267, lng: -9.1545 },
    points: 10,
    timestamp: { toDate: () => new Date(Date.now() - 4 * 60 * 60 * 1000) },
  },
  {
    id: "habit3",
    userId: "user456",
    userName: "Maria Santos",
    userAvatar: "/brunette-woman-profile.png",
    habitName: "Aula de Yoga",
    category: "aulas",
    location: { name: "Yoga Studio Lisboa", lat: 38.7071, lng: -9.1359 },
    points: 8,
    timestamp: { toDate: () => new Date(Date.now() - 6 * 60 * 60 * 1000) },
  },
  {
    id: "habit4",
    userId: "user999",
    userName: "Ana Ferreira",
    userAvatar: "/blonde-woman-profile.png",
    habitName: "Hidroginástica",
    category: "hidroginástica",
    location: { name: "Piscina Municipal", lat: 38.7223, lng: -9.1393 },
    points: 12,
    timestamp: { toDate: () => new Date(Date.now() - 8 * 60 * 60 * 1000) },
  },
]

const mockLeaderboard = [
  {
    userId: "user456",
    userName: "Maria Santos",
    userAvatar: "/brunette-woman-profile.png",
    totalPoints: 1580,
    rank: 1,
  },
  { userId: "user789", userName: "Pedro Costa", userAvatar: "/man-profile-beard.png", totalPoints: 1420, rank: 2 },
  { userId: "user123", userName: "João Silva", userAvatar: "/young-man-profile.png", totalPoints: 1250, rank: 3 },
  { userId: "user999", userName: "Ana Ferreira", userAvatar: "/blonde-woman-profile.png", totalPoints: 1180, rank: 4 },
  {
    userId: "user555",
    userName: "Carlos Oliveira",
    userAvatar: "/man-profile-glasses.png",
    totalPoints: 980,
    rank: 5,
  },
]

const mockSearchResults = [
  {
    id: "user456",
    name: "Maria Santos",
    email: "maria@example.com",
    avatar: "/brunette-woman-profile.png",
    totalPoints: 1580,
    following: [],
    followers: [],
    createdAt: new Date(),
  },
  {
    id: "user789",
    name: "Pedro Costa",
    email: "pedro@example.com",
    avatar: "/man-profile-beard.png",
    totalPoints: 1420,
    following: [],
    followers: [],
    createdAt: new Date(),
  },
  {
    id: "user999",
    name: "Ana Ferreira",
    email: "ana@example.com",
    avatar: "/blonde-woman-profile.png",
    totalPoints: 1180,
    following: [],
    followers: [],
    createdAt: new Date(),
  },
]

export default function SocialHub() {
  const [userProfile, setUserProfile] = useState(() => {
    if (typeof window !== "undefined") {
      const savedProfile = localStorage.getItem("userProfile")
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile)
        return { ...mockUserProfile, ...parsed }
      }
    }
    return mockUserProfile
  })
  const [friendsHabits, setFriendsHabits] = useState(mockFriendsHabits)

  const [leaderboard, setLeaderboard] = useState(() => {
    // Replace the mock user entry with actual user profile data
    const updatedLeaderboard = mockLeaderboard.map((entry) => {
      if (entry.userId === "user123") {
        return {
          ...entry,
          userName: userProfile.name,
          userAvatar: userProfile.avatar,
          totalPoints: userProfile.totalPoints,
        }
      }
      return entry
    })
    return updatedLeaderboard
  })

  const [searchResults, setSearchResults] = useState<typeof mockSearchResults>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("feed")
  const [selectedFriend, setSelectedFriend] = useState<(typeof mockSearchResults)[0] | null>(null)

  useEffect(() => {
    setLeaderboard((prev) =>
      prev.map((entry) => {
        if (entry.userId === userProfile.id) {
          return {
            ...entry,
            userName: userProfile.name,
            userAvatar: userProfile.avatar,
            totalPoints: userProfile.totalPoints,
          }
        }
        return entry
      }),
    )
  }, [userProfile])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    if (term.length > 2) {
      const filtered = mockSearchResults.filter((user) => user.name.toLowerCase().includes(term.toLowerCase()))
      setSearchResults(filtered)
    } else {
      setSearchResults([])
    }
  }

  const handleFollow = (targetUserId: string) => {
    // Mock follow action
    console.log(`Following user: ${targetUserId}`)
    setUserProfile((prev) => ({
      ...prev,
      following: [...prev.following, targetUserId],
    }))
  }

  const handleUnfollow = (targetUserId: string) => {
    // Mock unfollow action
    console.log(`Unfollowing user: ${targetUserId}`)
    setUserProfile((prev) => ({
      ...prev,
      following: prev.following.filter((id) => id !== targetUserId),
    }))
  }

  const handleViewProfile = (friend: (typeof mockSearchResults)[0]) => {
    setSelectedFriend(friend)
  }

  const handleCloseProfile = () => {
    setSelectedFriend(null)
  }

  const getHabitPoints = (category: string) => {
    const pointsMap: { [key: string]: number } = {
      ginásio: 15,
      corrida: 10,
      hidroginástica: 12,
      aulas: 8,
      trabalho: 5,
      leitura: 6,
      meditação: 8,
    }
    return pointsMap[category.toLowerCase()] || 5
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Pontos Totais</p>
                <p className="text-2xl font-bold">{userProfile?.totalPoints || 0}</p>
              </div>
              <Star className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">A Seguir</p>
                <p className="text-2xl font-bold">{userProfile?.following.length || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Seguidores</p>
                <p className="text-2xl font-bold">{userProfile?.followers.length || 0}</p>
              </div>
              <UserPlus className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">Ranking</p>
                <p className="text-2xl font-bold">
                  #{leaderboard.findIndex((entry) => entry.userId === userProfile.id) + 1 || "-"}
                </p>
              </div>
              <Trophy className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Friend Profile Modal */}
      {selectedFriend && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Perfil do Amigo</CardTitle>
                <Button variant="ghost" size="sm" onClick={handleCloseProfile}>
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedFriend.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-lg">{selectedFriend.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedFriend.name}</h3>
                  <p className="text-muted-foreground">{selectedFriend.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{selectedFriend.totalPoints}</p>
                  <p className="text-sm text-muted-foreground">Pontos</p>
                </div>
                <div className="text-center p-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    #{mockLeaderboard.findIndex((entry) => entry.userId === selectedFriend.id) + 1 || "-"}
                  </p>
                  <p className="text-sm text-muted-foreground">Ranking</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Hábitos Recentes</h4>
                {friendsHabits
                  .filter((habit) => habit.userId === selectedFriend.id)
                  .slice(0, 3)
                  .map((habit) => (
                    <div key={habit.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                      <Badge variant="secondary" className="text-xs">
                        {habit.category}
                      </Badge>
                      <span className="text-sm">{habit.habitName}</span>
                      <Badge variant="outline" className="text-xs ml-auto">
                        +{habit.points} pts
                      </Badge>
                    </div>
                  ))}
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => {
                    if (userProfile?.following.includes(selectedFriend.id)) {
                      handleUnfollow(selectedFriend.id)
                    } else {
                      handleFollow(selectedFriend.id)
                    }
                  }}
                >
                  {userProfile?.following.includes(selectedFriend.id) ? "Deixar de Seguir" : "Seguir"}
                </Button>
                <Button variant="outline" onClick={handleCloseProfile}>
                  Fechar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="feed">Feed</TabsTrigger>
          <TabsTrigger value="globe">Globo</TabsTrigger>
          <TabsTrigger value="leaderboard">Ranking</TabsTrigger>
          <TabsTrigger value="friends">Amigos</TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Feed de Hábitos dos Amigos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {friendsHabits.map((habit) => (
                  <div key={habit.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <Avatar>
                      <AvatarImage src={habit.userAvatar || "/placeholder.svg"} />
                      <AvatarFallback>{habit.userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{habit.userName}</span>
                        <Badge variant="secondary">{habit.category}</Badge>
                        <Badge variant="outline">+{habit.points} pts</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Completou <strong>{habit.habitName}</strong>
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {habit.location.name}
                        <span className="ml-2">{habit.timestamp.toDate().toLocaleString("pt-PT")}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="globe">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Globo de Hábitos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <HabitsGlobe habits={friendsHabits} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Ranking Global
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {leaderboard.map((entry, index) => (
                  <div
                    key={entry.userId}
                    className={`flex items-center gap-4 p-3 rounded-lg ${
                      entry.userId === userProfile.id ? "bg-primary/10 border-2 border-primary" : "bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold text-sm">
                      {entry.rank}
                    </div>
                    <Avatar>
                      <AvatarImage src={entry.userAvatar || "/placeholder.svg"} />
                      <AvatarFallback>{entry.userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold">{entry.userName}</p>
                      <p className="text-sm text-muted-foreground">{entry.totalPoints} pontos</p>
                    </div>
                    {entry.userId === userProfile.id && <Badge variant="default">Você</Badge>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="friends">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Encontrar Amigos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Procurar utilizadores..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />

              {searchResults.length > 0 && (
                <div className="space-y-2">
                  {searchResults.map((searchUser) => (
                    <div key={searchUser.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <Avatar>
                        <AvatarImage src={searchUser.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{searchUser.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold">{searchUser.name}</p>
                        <p className="text-sm text-muted-foreground">{searchUser.totalPoints} pontos</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleViewProfile(searchUser)}>
                          Ver Perfil
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleFollow(searchUser.id)}
                          disabled={userProfile?.following.includes(searchUser.id)}
                        >
                          {userProfile?.following.includes(searchUser.id) ? "A seguir" : "Seguir"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {searchTerm.length === 0 && (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Digite para procurar utilizadores</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
