export interface ExerciseLog {
  name: string
  sets: number
  reps: number
  weight: number
}

export interface HealthLog {
  id: string
  date: Date
  uid: string
  weight?: number
  sleep?: number
  training?: string // This will become less critical, but kept for backward compatibility or general notes
  meals?: string
  exercises?: ExerciseLog[] // New field for structured exercise data
}

export type Category = "Trabalho" | "Estudo" | "Saúde" | "Pessoal"

export type TaskType = "Execução" | "Planeamento" // Example types

export interface Task {
  id: string
  date: Date
  completed: boolean
  description: string
  text: string // Added for consistency with your component
  category: Category
  projectId?: string
  importance: number
  urgency: number
  type: TaskType
  order: number // For drag-and-drop reordering
}

// Nova interface para diversos recordes pessoais
export interface PersonalBestRecord {
  id: string
  category: "Ginásio" | "Corrida" | "Natação" | "Finanças" | "Leitura" | "Outros"
  name: string
  value: number | string // Pode ser número (peso, distância) ou string (tempo, título do livro)
  unit?: string // Ex: "kg", "km", "min", "€", "livros"
  dateAchieved?: Date // Opcional: quando o recorde foi alcançado
}

export interface Project {
  id: string
  name: string
}

export interface Habit {
  id: string
  name: string
  description?: string
  category?: string
  color?: string
  createdAt: Date
  isActive: boolean
}

export interface HabitLog {
  id: string
  habitId: string
  date: string // Format: YYYY-MM-DD
  completed: boolean
  notes?: string
  completedAt?: Date
}

export interface WeeklyStats {
  totalCompleted: number
  taskCompletionRate: number
  taskConsistency: number
  habitDisciplineRate: number
  mostProductiveDay: string
  overallScore: number
}

export interface HabitStreak {
  habitId: string
  habitName: string
  currentStreak: number
  longestStreak: number
  lastCompletedDate?: string
}

export interface DailyProgress {
  date: string
  habitsCompleted: number
  totalHabits: number
  completionRate: number
  tasks?: Task[]
}

export interface AITipResponse {
  tip: string
  confidence?: number
  category?: "motivation" | "strategy" | "adjustment" | "celebration"
}

export interface PerformanceSummary {
  weeklyDiscipline: number
  monthlyDiscipline: number
  consistencyRate: number
  mostSuccessfulHabits: string[]
  areasForImprovement: string[]
  streakData: HabitStreak[]
}
