"use client"

import type React from "react"
import { useState, useMemo, useEffect } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card"
import { Checkbox } from "./ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import {
  ClipboardList,
  Plus,
  Trash2,
  Briefcase,
  BookOpen,
  User,
  ActivitySquare,
  FolderKanban,
  Info,
  GripVertical,
} from "lucide-react"
import type { Task, Category, Project } from "@/types"
import { Label } from "./ui/label"
import { Slider } from "./ui/slider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import Confetti from "react-confetti" // Ensure this is imported correctly
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface DailyTasksProps {
  tasks: Task[]
  projects: Project[]
  onAddTask: (newTask: Omit<Task, "id" | "uid" | "date">) => void
  onToggleTask: (id: string) => void
  onDeleteTask: (id: string) => void
  onUpdateTaskOrder: (tasks: Task[]) => void
}

const categoryIcons: { [key in Category]: React.ReactNode } = {
  Trabalho: <Briefcase className="w-4 h-4" />,
  Estudo: <BookOpen className="w-4 h-4" />,
  Saúde: <ActivitySquare className="w-4 h-4" />,
  Pessoal: <User className="w-4 h-4" />,
}

// This function is not directly used for sorting in the current logic,
// as 'order' property is now primary. Keeping it for potential future use or context.
function extractTime(text: string): number | null {
  const regex = /(\d{1,2})[:h](\d{2})?(\s*(am|pm))?|às\s*(\d{1,2})h?/i
  const match = text.match(regex)
  if (!match) return null
  let hour = Number.parseInt(match[1] || match[5], 10)
  const minutes = Number.parseInt(match[2] || "0", 10)
  const period = match[4]?.toLowerCase()
  if (period === "pm" && hour < 12) hour += 12
  if (period === "am" && hour === 12) hour = 0

  if (hour > 23) return null
  return hour * 60 + minutes
}

const SortableTaskItem = ({
  task,
  projects,
  onToggleTask,
  onDeleteTask,
}: {
  task: Task
  projects: Project[]
  onToggleTask: (id: string) => void
  onDeleteTask: (id: string) => void
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-3 rounded-md bg-background border border-border/50 transition-colors group" // Removed hover:bg-secondary
    >
      <div className="flex items-center gap-3 flex-grow">
        <Button variant="ghost" size="icon" {...attributes} {...listeners} className="cursor-grab h-8 w-8">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </Button>
        <Checkbox
          id={`task-${task.id}`}
          checked={task.completed}
          onCheckedChange={() => onToggleTask(task.id)}
          className="transition-transform active:scale-90"
        />
        <label
          htmlFor={`task-${task.id}`}
          className={`flex-grow cursor-pointer transition-colors ${task.completed ? "text-muted-foreground line-through" : ""}`}
        >
          {task.text}
        </label>
        <div className="flex items-center gap-2 text-muted-foreground">
          {task.projectId && (
            <FolderKanban
              className="w-4 h-4"
              title={projects.find((p) => p.id === task.projectId)?.name || "Projeto"}
            />
          )}
          <span title={task.category}>{categoryIcons[task.category]}</span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out" // Removed group-hover:scale-110
        onClick={() => onDeleteTask(task.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function DailyTasks({
  tasks,
  projects,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onUpdateTaskOrder,
}: DailyTasksProps) {
  const [newTaskText, setNewTaskText] = useState("")
  const [newTaskCategory, setNewTaskCategory] = useState<Category>("Pessoal")
  const [newTaskProjectId, setNewTaskProjectId] = useState<string>("")
  const [importance, setImportance] = useState([5])
  const [urgency, setUrgency] = useState([5])
  const [showConfetti, setShowConfetti] = useState(false)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      // Primary sort: user-defined order
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order
      }
      // Fallback sort for tasks without an order (e.g., legacy tasks)
      const timeA = extractTime(a.text)
      const timeB = extractTime(b.text)
      if (timeA !== null && timeB !== null) return timeA - timeB
      if (timeA !== null) return -1
      if (timeB !== null) return 1
      return new Date(a.date).getTime() - new Date(b.date).getTime()
    })
  }, [tasks])

  const completedTasksCount = tasks.filter((t) => t.completed).length
  const totalTasksCount = tasks.length

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }
    if (typeof window !== "undefined") {
      handleResize()
      window.addEventListener("resize", handleResize)
      return () => window.removeEventListener("resize", handleResize)
    }
  }, [])

  // Confetti trigger: when all tasks are completed
  useEffect(() => {
    const allTasksCompleted = totalTasksCount > 0 && completedTasksCount === totalTasksCount
    if (allTasksCompleted) {
      setShowConfetti(true)
      const timer = setTimeout(() => setShowConfetti(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [completedTasksCount, totalTasksCount])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTaskText.trim()) {
      const taskData: Omit<Task, "id" | "uid" | "date"> = {
        text: newTaskText.trim(),
        category: newTaskCategory,
        completed: false,
        importance: importance[0],
        urgency: urgency[0],
        type: "Execução",
        order: tasks.length, // Add to the end of the list
      }
      if (newTaskProjectId) {
        taskData.projectId = newTaskProjectId
      }
      onAddTask(taskData)
      setNewTaskText("")
      setImportance([5])
      setUrgency([5])
      setNewTaskProjectId("")
      setNewTaskCategory("Pessoal")
    }
  }

  const handleProjectChange = (value: string) => {
    setNewTaskProjectId(value === "Nenhum" ? "" : value)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = sortedTasks.findIndex((item) => item.id === active.id)
      const newIndex = sortedTasks.findIndex((item) => item.id === over.id)

      const newOrderedTasks = arrayMove(sortedTasks, oldIndex, newIndex)

      // Update the 'order' property for all tasks
      const tasksWithNewOrder = newOrderedTasks.map((task, index) => ({
        ...task,
        order: index,
      }))

      onUpdateTaskOrder(tasksWithNewOrder)
    }
  }

  return (
    <Card className="bg-background/80 border-border/50">
      {showConfetti && <Confetti width={windowSize.width} height={windowSize.height} />}
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="w-6 h-6" />
            Tarefas de Hoje
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 text-sm text-muted-foreground cursor-help">
                  <span>
                    {completedTasksCount}/{totalTasksCount}
                  </span>
                  <Info className="w-4 h-4" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {completedTasksCount} de {totalTasksCount} tarefas concluídas hoje.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription>Adicione e gira as suas tarefas diárias. Arraste para reordenar.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-4">
          <Input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="Nova tarefa..."
          />
          <div className="space-y-3">
            <div className="grid gap-2">
              <Label htmlFor="importance">
                Importância: <span className="text-primary font-bold">{importance}</span>
              </Label>
              <Slider id="importance" min={1} max={10} step={1} value={importance} onValueChange={setImportance} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="urgency">
                Urgência: <span className="text-primary font-bold">{urgency}</span>
              </Label>
              <Slider id="urgency" min={1} max={10} step={1} value={urgency} onValueChange={setUrgency} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Select onValueChange={(value: Category) => setNewTaskCategory(value)} defaultValue={newTaskCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(categoryIcons) as Category[]).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    <div className="flex items-center gap-2">
                      {categoryIcons[cat]} {cat}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={handleProjectChange} value={newTaskProjectId || "Nenhum"}>
              <SelectTrigger>
                <SelectValue placeholder="Projeto (Opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Nenhum">Nenhum</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    <div className="flex items-center gap-2">
                      <FolderKanban className="w-4 h-4" /> {project.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full">
            <Plus className="h-4 w-4 mr-2" /> Adicionar Tarefa
          </Button>
        </form>
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {sortedTasks.length > 0 ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={sortedTasks} strategy={verticalListSortingStrategy}>
                {sortedTasks.map((task) => (
                  <SortableTaskItem
                    key={task.id}
                    task={task}
                    projects={projects}
                    onToggleTask={onToggleTask}
                    onDeleteTask={onDeleteTask}
                  />
                ))}
              </SortableContext>
            </DndContext>
          ) : (
            <p className="text-center text-muted-foreground py-4">Sem tarefas para hoje. Adicione uma!</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
