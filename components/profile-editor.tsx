"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Camera, Save, Bell, Shield, Palette, Globe } from "lucide-react"

interface UserProfile {
  name: string
  email: string
  avatar: string
  bio: string
  age: number
  gender: string
  location: string
  timezone: string
  language: string
  theme: string
  notifications: {
    habits: boolean
    social: boolean
    achievements: boolean
    reminders: boolean
  }
  privacy: {
    profilePublic: boolean
    showLocation: boolean
    showStats: boolean
  }
  goals: {
    dailyHabits: number
    weeklyWorkouts: number
    monthlyWeight: number
  }
}

const defaultProfile: UserProfile = {
  name: "Utilizador",
  email: "user@example.com",
  avatar: "",
  bio: "Focado em melhorar os meus hábitos diários!",
  age: 25,
  gender: "masculino",
  location: "Lisboa, Portugal",
  timezone: "Europe/Lisbon",
  language: "pt",
  theme: "system",
  notifications: {
    habits: true,
    social: true,
    achievements: true,
    reminders: true,
  },
  privacy: {
    profilePublic: true,
    showLocation: false,
    showStats: true,
  },
  goals: {
    dailyHabits: 5,
    weeklyWorkouts: 3,
    monthlyWeight: 0,
  },
}

export default function ProfileEditor() {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("personal")

  useEffect(() => {
    // Load profile from localStorage
    const savedProfile = localStorage.getItem("userProfile")
    if (savedProfile) {
      setProfile({ ...defaultProfile, ...JSON.parse(savedProfile) })
    }
  }, [])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      localStorage.setItem("userProfile", JSON.stringify(profile))
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      alert("Perfil guardado com sucesso!")
    } catch (error) {
      alert("Erro ao guardar perfil")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfile((prev) => ({ ...prev, avatar: e.target?.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const tabs = [
    { id: "personal", label: "Pessoal", icon: User },
    { id: "notifications", label: "Notificações", icon: Bell },
    { id: "privacy", label: "Privacidade", icon: Shield },
    { id: "preferences", label: "Preferências", icon: Palette },
  ]

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Meu Perfil
          </h1>
          <p className="text-gray-600 mt-1">Customize as suas informações e preferências</p>
        </div>
        <Button onClick={handleSave} disabled={isLoading} className="bg-gradient-to-r from-purple-600 to-pink-600">
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? "A guardar..." : "Guardar"}
        </Button>
      </div>

      {/* Profile Overview */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profile.avatar || "/placeholder.svg"} />
                <AvatarFallback className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-2xl">
                  {profile.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50">
                <Camera className="w-4 h-4 text-gray-600" />
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
              <p className="text-gray-600">{profile.email}</p>
              <p className="text-gray-500 mt-1">{profile.bio}</p>
              <div className="flex items-center space-x-2 mt-3">
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  <Globe className="w-3 h-3 mr-1" />
                  {profile.location}
                </Badge>
                <Badge variant="secondary" className="bg-pink-100 text-pink-700">
                  {profile.age} anos
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-all ${
                activeTab === tab.id ? "bg-white shadow-sm text-purple-600" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "personal" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>Atualize as suas informações pessoais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile((prev) => ({ ...prev, bio: e.target.value }))}
                  placeholder="Conte-nos sobre si..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalhes Pessoais</CardTitle>
              <CardDescription>Informações adicionais sobre si</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="age">Idade</Label>
                <Input
                  id="age"
                  type="number"
                  value={profile.age}
                  onChange={(e) => setProfile((prev) => ({ ...prev, age: Number.parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="gender">Género</Label>
                <Select
                  value={profile.gender}
                  onValueChange={(value) => setProfile((prev) => ({ ...prev, gender: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="feminino">Feminino</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                    <SelectItem value="prefiro-nao-dizer">Prefiro não dizer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location">Localização</Label>
                <Input
                  id="location"
                  value={profile.location}
                  onChange={(e) => setProfile((prev) => ({ ...prev, location: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "notifications" && (
        <Card>
          <CardHeader>
            <CardTitle>Notificações</CardTitle>
            <CardDescription>Gerir as suas preferências de notificação</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Hábitos</h4>
                <p className="text-sm text-gray-600">Notificações sobre os seus hábitos diários</p>
              </div>
              <Switch
                checked={profile.notifications.habits}
                onCheckedChange={(checked) =>
                  setProfile((prev) => ({
                    ...prev,
                    notifications: { ...prev.notifications, habits: checked },
                  }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Social</h4>
                <p className="text-sm text-gray-600">Atividades dos seus amigos</p>
              </div>
              <Switch
                checked={profile.notifications.social}
                onCheckedChange={(checked) =>
                  setProfile((prev) => ({
                    ...prev,
                    notifications: { ...prev.notifications, social: checked },
                  }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Conquistas</h4>
                <p className="text-sm text-gray-600">Quando alcançar novos marcos</p>
              </div>
              <Switch
                checked={profile.notifications.achievements}
                onCheckedChange={(checked) =>
                  setProfile((prev) => ({
                    ...prev,
                    notifications: { ...prev.notifications, achievements: checked },
                  }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Lembretes</h4>
                <p className="text-sm text-gray-600">Lembretes para completar hábitos</p>
              </div>
              <Switch
                checked={profile.notifications.reminders}
                onCheckedChange={(checked) =>
                  setProfile((prev) => ({
                    ...prev,
                    notifications: { ...prev.notifications, reminders: checked },
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "privacy" && (
        <Card>
          <CardHeader>
            <CardTitle>Privacidade</CardTitle>
            <CardDescription>Controle quem pode ver as suas informações</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Perfil Público</h4>
                <p className="text-sm text-gray-600">Permitir que outros utilizadores vejam o seu perfil</p>
              </div>
              <Switch
                checked={profile.privacy.profilePublic}
                onCheckedChange={(checked) =>
                  setProfile((prev) => ({
                    ...prev,
                    privacy: { ...prev.privacy, profilePublic: checked },
                  }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Mostrar Localização</h4>
                <p className="text-sm text-gray-600">Partilhar a sua localização com amigos</p>
              </div>
              <Switch
                checked={profile.privacy.showLocation}
                onCheckedChange={(checked) =>
                  setProfile((prev) => ({
                    ...prev,
                    privacy: { ...prev.privacy, showLocation: checked },
                  }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Mostrar Estatísticas</h4>
                <p className="text-sm text-gray-600">Permitir que outros vejam as suas estatísticas</p>
              </div>
              <Switch
                checked={profile.privacy.showStats}
                onCheckedChange={(checked) =>
                  setProfile((prev) => ({
                    ...prev,
                    privacy: { ...prev.privacy, showStats: checked },
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "preferences" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Aparência</CardTitle>
              <CardDescription>Personalize a aparência da aplicação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="theme">Tema</Label>
                <Select
                  value={profile.theme}
                  onValueChange={(value) => setProfile((prev) => ({ ...prev, theme: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Escuro</SelectItem>
                    <SelectItem value="system">Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="language">Idioma</Label>
                <Select
                  value={profile.language}
                  onValueChange={(value) => setProfile((prev) => ({ ...prev, language: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt">Português</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="timezone">Fuso Horário</Label>
                <Select
                  value={profile.timezone}
                  onValueChange={(value) => setProfile((prev) => ({ ...prev, timezone: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Europe/Lisbon">Lisboa</SelectItem>
                    <SelectItem value="Europe/Madrid">Madrid</SelectItem>
                    <SelectItem value="Europe/London">Londres</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Metas</CardTitle>
              <CardDescription>Defina as suas metas pessoais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="dailyHabits">Hábitos Diários</Label>
                <Input
                  id="dailyHabits"
                  type="number"
                  value={profile.goals.dailyHabits}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      goals: { ...prev.goals, dailyHabits: Number.parseInt(e.target.value) },
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="weeklyWorkouts">Treinos Semanais</Label>
                <Input
                  id="weeklyWorkouts"
                  type="number"
                  value={profile.goals.weeklyWorkouts}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      goals: { ...prev.goals, weeklyWorkouts: Number.parseInt(e.target.value) },
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="monthlyWeight">Meta de Peso (kg)</Label>
                <Input
                  id="monthlyWeight"
                  type="number"
                  step="0.1"
                  value={profile.goals.monthlyWeight}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      goals: { ...prev.goals, monthlyWeight: Number.parseFloat(e.target.value) },
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
