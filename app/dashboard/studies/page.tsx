"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  BookOpen,
  Clock,
  GraduationCap,
  Plus,
  Calendar,
  TrendingUp,
  Award,
  LogOut,
  CheckCircle,
  Users,
  Brain,
  AlertCircle,
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

interface Subject {
  id: string
  name: string
  color: string
  totalHours: number
  targetHours: number
}

interface StudySession {
  id: string
  subjectId: string
  subjectName: string
  hours: number
  date: Date
  notes?: string
}

interface ClassEvent {
  id: string
  subjectId?: string
  title: string
  start: Date
  end: Date
  attendance?: boolean
  coveredTopics?: string
  studySessionId?: string
  externalKnowledge?: string
  location?: string
  description?: string
}

const ICS_URL =
  "https://inforestudante.ipc.pt/nonio/util/sincronizaHorarioNonio.do?chave=5a21e43ff7da7b11f80d2ffb867a69e4&locale=PT"

export default function StudiesPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [studySessions, setStudySessions] = useState<StudySession[]>([])
  const [classEvents, setClassEvents] = useState<ClassEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<ClassEvent | null>(null)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [isCalendarSynced, setIsCalendarSynced] = useState(false)
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [selectedSubject, setSelectedSubject] = useState("")
  const [studyHours, setStudyHours] = useState("")
  const [studyNotes, setStudyNotes] = useState("")

  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-teal-500",
    "bg-red-500",
    "bg-indigo-500",
  ]

  const handleAddStudySession = () => {
    if (!selectedSubject || !studyHours) return

    const hours = Number.parseFloat(studyHours)
    if (hours <= 0 || hours > 24) {
      alert("As horas de estudo devem estar entre 0.1 e 24 horas.")
      return
    }

    const subject = subjects.find((s) => s.id === selectedSubject)
    if (!subject) return

    const session: StudySession = {
      id: Date.now().toString(),
      subjectId: selectedSubject,
      subjectName: subject.name,
      hours: hours,
      date: new Date(),
      notes: studyNotes || undefined,
    }

    setStudySessions((prev) => [...prev, session])
    setSubjects((prev) => prev.map((s) => (s.id === selectedSubject ? { ...s, totalHours: s.totalHours + hours } : s)))

    // Save to localStorage
    const updatedSessions = [...studySessions, session]
    const updatedSubjects = subjects.map((s) =>
      s.id === selectedSubject ? { ...s, totalHours: s.totalHours + hours } : s,
    )

    localStorage.setItem("studySessions", JSON.stringify(updatedSessions))
    localStorage.setItem("studySubjects", JSON.stringify(updatedSubjects))

    // Reset form
    setSelectedSubject("")
    setStudyHours("")
    setStudyNotes("")
  }

  useEffect(() => {
    const savedEvents = localStorage.getItem("classEvents")
    const savedSyncStatus = localStorage.getItem("isCalendarSynced")

    if (savedEvents && savedSyncStatus === "true") {
      const savedSubjects = localStorage.getItem("studySubjects")
      const savedSessions = localStorage.getItem("studySessions")

      if (savedSubjects) setSubjects(JSON.parse(savedSubjects))
      if (savedSessions) {
        const sessions = JSON.parse(savedSessions)
        setStudySessions(sessions.map((s: any) => ({ ...s, date: new Date(s.date) })))
      }

      const events = JSON.parse(savedEvents)
      setClassEvents(events.map((e: any) => ({ ...e, start: new Date(e.start), end: new Date(e.end) })))
      setIsCalendarSynced(true)
    } else {
      localStorage.removeItem("studySubjects")
      localStorage.removeItem("studySessions")
      localStorage.removeItem("classEvents")
      localStorage.removeItem("isCalendarSynced")
      setSubjects([])
      setStudySessions([])
      setClassEvents([])
      setIsCalendarSynced(false)
    }
  }, [])

  useEffect(() => {
    if (classEvents.length === 0 && !isCalendarSynced && !isLoadingCalendar && !syncError) {
      fetchCalendarEvents()
    }
  }, [])

  const syncCalendarWithSubjects = (events: ClassEvent[]) => {
    const uniqueSubjectNames = [
      ...new Set(
        events.map((event) => {
          const subjectName = event.title.split(" - ")[0] || event.title
          return subjectName.trim()
        }),
      ),
    ]

    const newSubjects: Subject[] = []

    uniqueSubjectNames.forEach((subjectName, index) => {
      const existingSubject = subjects.find((s) => s.name.toLowerCase() === subjectName.toLowerCase())

      if (!existingSubject) {
        const newSubject: Subject = {
          id: `calendar-${Date.now()}-${index}`,
          name: subjectName,
          color: colors[subjects.length + (index % colors.length)],
          totalHours: 0,
          targetHours: 60,
        }
        newSubjects.push(newSubject)
      }
    })

    if (newSubjects.length > 0) {
      setSubjects((prev) => [...prev, ...newSubjects])

      const allSubjects = [...subjects, ...newSubjects]
      localStorage.setItem("studySubjects", JSON.stringify(allSubjects))

      const updatedEvents = events.map((event) => {
        const subjectName = event.title.split(" - ")[0] || event.title
        const subject = [...subjects, ...newSubjects].find(
          (s) => s.name.toLowerCase() === subjectName.trim().toLowerCase(),
        )

        return {
          ...event,
          subjectId: subject?.id,
        }
      })

      setClassEvents(updatedEvents)
      setIsCalendarSynced(true)
    }
  }

  const findSubjectByTitle = (title: string) => {
    return subjects.find(
      (s) => title.toLowerCase().includes(s.name.toLowerCase()) || s.name.toLowerCase().includes(title.toLowerCase()),
    )
  }

  const updateEvent = (eventId: string, updates: Partial<ClassEvent>) => {
    setClassEvents((prev) => {
      const existingIndex = prev.findIndex((e) => e.id === eventId)
      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex] = { ...updated[existingIndex], ...updates }
        return updated
      } else {
        return [...prev, { ...selectedEvent!, ...updates }]
      }
    })

    if (selectedEvent) {
      setSelectedEvent({ ...selectedEvent, ...updates })
    }
  }

  const handleAddStudySessionFromEvent = (event: ClassEvent) => {
    if (event.subjectId) {
      const subject = subjects.find((s) => s.id === event.subjectId)
      if (subject) {
        const duration = (event.end.getTime() - event.start.getTime()) / (1000 * 60 * 60) // hours

        let externalHours = 0
        if (event.externalKnowledge) {
          const hourMatches = event.externalKnowledge.match(/(\d+(?:\.\d+)?)\s*(h|horas?)/gi) || []
          externalHours = hourMatches.reduce((sum, match) => {
            const num = Number.parseFloat(match.match(/\d+(?:\.\d+)?/)?.[0] || "0")
            return sum + num * 0.5 // External knowledge counts as 50% of regular study
          }, 0)
        }

        const totalHours = duration + externalHours

        const session: StudySession = {
          id: Date.now().toString(),
          subjectId: event.subjectId,
          subjectName: subject.name,
          hours: totalHours,
          date: new Date(),
          notes: `Estudo relacionado à aula: ${event.title}${externalHours > 0 ? ` (inclui ${externalHours}h de conhecimento externo)` : ""}`,
        }

        setStudySessions((prev) => [...prev, session])
        setSubjects((prev) =>
          prev.map((s) => (s.id === event.subjectId ? { ...s, totalHours: s.totalHours + totalHours } : s)),
        )

        updateEvent(event.id, { studySessionId: session.id })

        // Save to localStorage
        const updatedSessions = [...studySessions, session]
        const updatedSubjects = subjects.map((s) =>
          s.id === event.subjectId ? { ...s, totalHours: s.totalHours + totalHours } : s,
        )

        localStorage.setItem("studySessions", JSON.stringify(updatedSessions))
        localStorage.setItem("studySubjects", JSON.stringify(updatedSubjects))
      }
    }
  }

  const fetchCalendarEvents = async () => {
    setIsLoadingCalendar(true)
    setSyncError(null)

    try {
      const corsProxy = "https://api.allorigins.win/raw?url="
      const encodedUrl = encodeURIComponent(ICS_URL)
      const proxyUrl = corsProxy + encodedUrl

      console.log("[v0] Attempting to fetch calendar from:", proxyUrl)

      const response = await fetch(proxyUrl, {
        method: "GET",
        headers: {
          Accept: "text/calendar, text/plain, */*",
        },
      })

      if (!response.ok) {
        throw new Error(`Falha no fetch: ${response.status} ${response.statusText}`)
      }

      const icsData = await response.text()
      console.log("[v0] ICS data received, length:", icsData.length)

      const events = parseICSData(icsData)
      console.log("[v0] Parsed events:", events.length)

      if (events.length === 0) {
        console.log("[v0] No events found in calendar")
        setClassEvents([])
        setSubjects([])
        setStudySessions([])
        localStorage.removeItem("classEvents")
        localStorage.removeItem("studySubjects")
        localStorage.removeItem("studySessions")
        localStorage.removeItem("isCalendarSynced")
        setSyncError("Calendário não contém eventos. Aguarde até estar inscrito nas turmas.")
        setIsCalendarSynced(false)
        return
      }

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const futureEvents = events.filter((e) => e.start >= today)

      if (futureEvents.length === 0) {
        console.log("[v0] No future events found")
        setClassEvents([])
        setSubjects([])
        setStudySessions([])
        localStorage.removeItem("classEvents")
        localStorage.removeItem("studySubjects")
        localStorage.removeItem("studySessions")
        localStorage.removeItem("isCalendarSynced")
        setSyncError("Não há aulas futuras no calendário.")
        setIsCalendarSynced(false)
        return
      }

      console.log("[v0] Found", futureEvents.length, "future events")
      setClassEvents(futureEvents)
      syncCalendarWithSubjects(futureEvents)
      setIsCalendarSynced(true)
      setLastSyncTime(new Date())
      setSyncError(null)

      localStorage.setItem("classEvents", JSON.stringify(futureEvents))
      localStorage.setItem("isCalendarSynced", "true")
    } catch (error) {
      console.error("[v0] Erro no sync:", error)
      setClassEvents([])
      setSubjects([])
      setStudySessions([])
      localStorage.removeItem("classEvents")
      localStorage.removeItem("studySubjects")
      localStorage.removeItem("studySessions")
      localStorage.removeItem("isCalendarSynced")
      setSyncError("Não foi possível conectar ao calendário escolar. Verifique a ligação à internet.")
      setIsCalendarSynced(false)
    } finally {
      setIsLoadingCalendar(false)
    }
  }

  const parseICSData = (icsData: string): ClassEvent[] => {
    const events: ClassEvent[] = []
    const lines = icsData.split(/\r?\n/) // Better split for CRLF/LF
    let currentEvent: Partial<ClassEvent> = {}
    let inEvent = false
    let lastKey: string | null = null

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      // Handle line continuations (lines starting with space)
      if (line.startsWith(" ") && lastKey && currentEvent[lastKey as keyof ClassEvent]) {
        const currentValue = currentEvent[lastKey as keyof ClassEvent] as string
        currentEvent[lastKey as keyof ClassEvent] = (currentValue + line.substring(1)) as any
        continue
      }

      if (line === "BEGIN:VEVENT") {
        inEvent = true
        currentEvent = { id: `${Date.now()}-${Math.random()}` }
        lastKey = null
      } else if (line === "END:VEVENT" && inEvent) {
        if (currentEvent.title && currentEvent.start && currentEvent.end) {
          events.push(currentEvent as ClassEvent)
        }
        currentEvent = {}
        inEvent = false
        lastKey = null
      } else if (inEvent) {
        const colonIndex = line.indexOf(":")
        if (colonIndex > -1) {
          const key = line.substring(0, colonIndex)
          const value = line.substring(colonIndex + 1)
          lastKey = key.toLowerCase()

          if (key === "SUMMARY") {
            currentEvent.title = value
          } else if (key === "DTSTART") {
            currentEvent.start = parseICSDate(value)
          } else if (key === "DTEND") {
            currentEvent.end = parseICSDate(value)
          } else if (key === "LOCATION") {
            currentEvent.location = value
          } else if (key === "DESCRIPTION") {
            currentEvent.description = value
          }
        }
      }
    }

    return events
  }

  const parseICSDate = (dateStr: string): Date => {
    // Handle UTC timezone (Z suffix)
    if (dateStr.endsWith("Z")) {
      return new Date(dateStr)
    }

    // Handle YYYYMMDDTHHMMSS format
    if (dateStr.length >= 15) {
      const year = Number.parseInt(dateStr.substring(0, 4))
      const month = Number.parseInt(dateStr.substring(4, 6)) - 1
      const day = Number.parseInt(dateStr.substring(6, 8))
      const hour = Number.parseInt(dateStr.substring(9, 11))
      const minute = Number.parseInt(dateStr.substring(11, 13))
      const second = dateStr.length >= 17 ? Number.parseInt(dateStr.substring(13, 15)) : 0
      return new Date(year, month, day, hour, minute, second)
    }

    // Fallback to current date
    return new Date()
  }

  const attendanceStats = useMemo(() => {
    return subjects.map((subject) => {
      const subjectEvents = classEvents.filter((e) => e.subjectId === subject.id)
      const attendedEvents = subjectEvents.filter((e) => e.attendance)
      const attendanceRate = subjectEvents.length > 0 ? (attendedEvents.length / subjectEvents.length) * 100 : 0

      const attendedHours = attendedEvents.reduce((sum, event) => {
        const duration = (event.end.getTime() - event.start.getTime()) / (1000 * 60 * 60)
        return sum + duration
      }, 0)

      const totalStudyHours = subject.totalHours + attendedHours
      const knowledgePercent = Math.min(100, (totalStudyHours / subject.targetHours) * 100)

      return {
        subjectId: subject.id,
        subjectName: subject.name,
        attendanceRate,
        totalClasses: subjectEvents.length,
        attendedClasses: attendedEvents.length,
        knowledgePercent,
        attendedHours,
        totalStudyHours,
      }
    })
  }, [subjects, classEvents])

  const unstudiedClasses = useMemo(() => {
    return classEvents.filter((event) => {
      return event.attendance && !event.studySessionId
    })
  }, [classEvents])

  const calculateStats = () => attendanceStats

  const getUnstudiedClasses = () => unstudiedClasses

  const stats = {
    totalSubjects: subjects.length,
    totalHours: studySessions.reduce((sum, session) => sum + session.hours, 0),
    weeklyHours: studySessions
      .filter((session) => {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return session.date >= weekAgo
      })
      .reduce((sum, session) => sum + session.hours, 0),
    averageDaily: studySessions.length > 0 ? studySessions.reduce((sum, session) => sum + session.hours, 0) / 7 : 0,
    totalClasses: classEvents.length,
    attendedClasses: classEvents.filter((e) => e.attendance).length,
    attendanceRate:
      classEvents.length > 0 ? (classEvents.filter((e) => e.attendance).length / classEvents.length) * 100 : 0,
    globalKnowledgePercent:
      subjects.length > 0 ? attendanceStats.reduce((sum, stat) => sum + stat.knowledgePercent, 0) / subjects.length : 0,
    unstudiedClasses: unstudiedClasses.length,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-4">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Gestão de Estudos
              </h1>
              <p className="text-muted-foreground mt-1">Acompanhe o seu progresso académico</p>
            </div>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="shadow-sm bg-transparent">
              <LogOut className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Cadeiras</p>
                    <p className="text-3xl font-bold">{stats.totalSubjects}</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Total Horas</p>
                    <p className="text-3xl font-bold">{stats.totalHours.toFixed(1)}h</p>
                  </div>
                  <Clock className="h-8 w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Esta Semana</p>
                    <p className="text-3xl font-bold">{stats.weeklyHours.toFixed(1)}h</p>
                  </div>
                  <Calendar className="h-8 w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Média Diária</p>
                    <p className="text-3xl font-bold">{stats.averageDaily.toFixed(1)}h</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-teal-500 to-teal-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-teal-100 text-sm font-medium">Presenças</p>
                    <p className="text-3xl font-bold">{stats.attendanceRate.toFixed(1)}%</p>
                  </div>
                  <Users className="h-8 w-8 text-teal-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-100 text-sm font-medium">Conhecimento</p>
                    <p className="text-3xl font-bold">{stats.globalKnowledgePercent.toFixed(1)}%</p>
                  </div>
                  <Brain className="h-8 w-8 text-indigo-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <Card className="mb-8 border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                Sincronização com Calendário Escolar
              </CardTitle>
            </CardHeader>
            <CardContent>
              {syncError && (
                <div className="flex items-center gap-4 p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                  <div className="flex-1">
                    <p className="font-medium text-red-800">Erro na Sincronização</p>
                    <p className="text-sm text-red-600">{syncError}</p>
                  </div>
                  <Button onClick={fetchCalendarEvents} disabled={isLoadingCalendar} variant="outline" size="sm">
                    Tentar Novamente
                  </Button>
                </div>
              )}

              {isLoadingCalendar && (
                <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <div>
                    <p className="font-medium text-blue-800">Sincronizando Calendário</p>
                    <p className="text-sm text-blue-600">A carregar eventos do sistema académico...</p>
                  </div>
                </div>
              )}

              {classEvents.length > 0 && !isLoadingCalendar ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <div className="flex-1">
                      <p className="font-medium text-green-800">Sistema Sincronizado</p>
                      <p className="text-sm text-green-600">
                        {classEvents.length} eventos carregados • {subjects.length} cadeiras criadas automaticamente
                      </p>
                      {lastSyncTime && (
                        <p className="text-xs text-green-500 mt-1">
                          Última sincronização: {format(lastSyncTime, "dd/MM/yyyy HH:mm")}
                        </p>
                      )}
                    </div>
                    <Button onClick={fetchCalendarEvents} disabled={isLoadingCalendar} variant="outline" size="sm">
                      Sincronizar Agora
                    </Button>
                  </div>
                </div>
              ) : !isLoadingCalendar ? (
                <div className="text-center py-8">
                  <div className="p-4 bg-gray-50 rounded-full inline-block mb-4">
                    <Calendar className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Aguardando Sincronização</h3>
                  <p className="text-muted-foreground mb-4">
                    As cadeiras serão criadas automaticamente quando o calendário for sincronizado.
                  </p>
                  <Button onClick={fetchCalendarEvents} disabled={isLoadingCalendar}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Sincronizar Calendário
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </motion.div>

        {subjects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Card className="mb-8 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  Minhas Cadeiras
                  <Badge variant="secondary" className="ml-auto">
                    {subjects.length} cadeiras
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {subjects.map((subject, index) => {
                    const subjectStats = attendanceStats.find((s) => s.subjectId === subject.id)
                    return (
                      <motion.div
                        key={subject.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.9 + index * 0.1 }}
                        className="relative p-6 border-0 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`w-4 h-4 rounded-full ${subject.color} shadow-sm`} />
                          <h3 className="font-semibold text-lg">{subject.name}</h3>
                          <Badge variant="outline" className="ml-auto text-xs">
                            <Calendar className="h-3 w-3 mr-1" />
                            Auto
                          </Badge>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <p className="text-sm font-medium text-muted-foreground">Progresso de Estudo</p>
                              <p className="text-sm font-bold text-primary">
                                {((subject.totalHours / subject.targetHours) * 100).toFixed(1)}%
                              </p>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                              <div
                                className={`h-3 rounded-full ${subject.color} transition-all duration-500`}
                                style={{
                                  width: `${Math.min((subject.totalHours / subject.targetHours) * 100, 100)}%`,
                                }}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {subject.totalHours.toFixed(1)}h / {subject.targetHours}h
                            </p>
                          </div>

                          {subjectStats && (
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                              {subjectStats.totalClasses > 0 && (
                                <div className="text-center">
                                  <p className="text-2xl font-bold text-teal-600">
                                    {subjectStats.attendanceRate.toFixed(0)}%
                                  </p>
                                  <p className="text-xs text-muted-foreground">Presenças</p>
                                </div>
                              )}
                              <div className="text-center">
                                <p className="text-2xl font-bold text-purple-600">
                                  {subjectStats.knowledgePercent.toFixed(0)}%
                                </p>
                                <p className="text-xs text-muted-foreground">Conhecimento</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {unstudiedClasses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <Card className="mb-8 border-0 shadow-lg border-l-4 border-l-orange-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-white" />
                  </div>
                  Aulas Pendentes de Estudo
                  <Badge variant="destructive" className="ml-auto">
                    {unstudiedClasses.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {unstudiedClasses.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 border border-orange-200 rounded-lg bg-orange-50/50 cursor-pointer hover:bg-orange-100/50 transition-colors"
                      onClick={() => {
                        setSelectedEvent(event)
                        setIsEventModalOpen(true)
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500 rounded-lg">
                          <Clock className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-muted-foreground">{format(event.start, "dd/MM/yyyy HH:mm")}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="shadow-sm bg-transparent">
                        Registar Estudo
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {subjects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
          >
            <Card className="mb-8 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                    <Plus className="h-5 w-5 text-white" />
                  </div>
                  Registar Nova Sessão de Estudo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Cadeira</Label>
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                      <SelectTrigger className="shadow-sm">
                        <SelectValue placeholder="Selecionar cadeira" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${subject.color}`} />
                              {subject.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Horas Estudadas</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={studyHours}
                      onChange={(e) => setStudyHours(e.target.value)}
                      placeholder="Ex: 2.5"
                      className="shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Notas (opcional)</Label>
                    <Input
                      value={studyNotes}
                      onChange={(e) => setStudyNotes(e.target.value)}
                      placeholder="Ex: Estudei capítulo 3"
                      className="shadow-sm"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={handleAddStudySession}
                      className="w-full shadow-sm"
                      disabled={!selectedSubject || !studyHours}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Registar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedEvent?.title} - {selectedEvent && format(selectedEvent.start, "dd/MM/yyyy HH:mm")}
              </DialogTitle>
            </DialogHeader>
            {selectedEvent && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={selectedEvent.attendance || false}
                    onCheckedChange={(checked) => updateEvent(selectedEvent.id, { attendance: checked })}
                  />
                  <Label>Estive presente nesta aula</Label>
                  {selectedEvent.attendance && <CheckCircle className="h-4 w-4 text-green-500" />}
                </div>

                <div className="space-y-2">
                  <Label>Conteúdo dado na aula</Label>
                  <Textarea
                    placeholder="Ex: Capítulo 3 - React Hooks, exercícios práticos..."
                    value={selectedEvent.coveredTopics || ""}
                    onChange={(e) => updateEvent(selectedEvent.id, { coveredTopics: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Conhecimento externo (links, recursos)</Label>
                  <Textarea
                    placeholder="Ex: Vídeo YouTube sobre hooks: 2h, Artigo MDN sobre APIs: 1h..."
                    value={selectedEvent.externalKnowledge || ""}
                    onChange={(e) => updateEvent(selectedEvent.id, { externalKnowledge: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    💡 Dica: Mencione a duração (ex: "2h") para calcular automaticamente as horas de conhecimento
                    externo
                  </p>
                </div>

                {selectedEvent.studySessionId && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Sessão de estudo já registada para esta aula
                    </p>
                  </div>
                )}

                {selectedEvent.subjectId && !selectedEvent.studySessionId && (
                  <Button
                    onClick={() => {
                      handleAddStudySessionFromEvent(selectedEvent)
                      setIsEventModalOpen(false)
                    }}
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Registar Sessão de Estudo Relacionada
                  </Button>
                )}

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsEventModalOpen(false)}>
                    Fechar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg">
                  <Award className="h-5 w-5 text-white" />
                </div>
                Sessões Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {studySessions.length > 0 ? (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  <AnimatePresence>
                    {studySessions
                      .slice()
                      .reverse()
                      .slice(0, 10)
                      .map((session, index) => {
                        const subject = subjects.find((s) => s.id === session.subjectId)
                        return (
                          <motion.div
                            key={session.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="flex items-center justify-between p-4 border-0 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-4 h-4 rounded-full ${subject?.color || "bg-gray-500"} shadow-sm`} />
                              <div>
                                <p className="font-medium">{session.subjectName}</p>
                                <p className="text-sm text-muted-foreground">
                                  {format(session.date, "dd 'de' MMMM, yyyy", { locale: ptBR })}
                                </p>
                                {session.notes && <p className="text-xs text-muted-foreground mt-1">{session.notes}</p>}
                              </div>
                            </div>
                            <Badge variant="secondary" className="shadow-sm font-medium">
                              {session.hours}h
                            </Badge>
                          </motion.div>
                        )
                      })}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="p-4 bg-gray-50 rounded-full inline-block mb-4">
                    <Award className="h-12 w-12 text-gray-400" />
                  </div>
                  <p className="text-muted-foreground">Ainda não há sessões de estudo registadas.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Comece a registar as suas sessões de estudo para acompanhar o progresso.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
