"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { GanttChartSquare, LogOut, MapPin, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HabitTracker } from "@/components/habit-tracker"

export default function HabitsPage() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <GanttChartSquare className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Hábitos Diários</h1>
          </div>
          <Button variant="outline" size="sm">
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </motion.div>

        <section className="mb-6 grid gap-4 md:grid-cols-[1.2fr_.8fr]">
          <div className="rounded-3xl border border-primary/20 bg-card p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary"><MapPin className="h-5 w-5" /></div>
              <div><p className="text-xs font-semibold uppercase tracking-[.18em] text-muted-foreground">Hábito inteligente</p><h2 className="mt-1 text-lg font-semibold">Aulas</h2><p className="mt-1 text-sm text-muted-foreground">Quando o calendário detetar que chegaste ao local de uma aula, marca este hábito automaticamente. Se a localização estiver bloqueada, podes confirmar manualmente.</p></div>
            </div>
            <Link href="/dashboard/calendar" className="mt-4 inline-flex items-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90">Ligar ao calendário</Link>
          </div>
          <div className="rounded-3xl border border-border bg-muted/30 p-5"><div className="flex items-center gap-2 text-primary"><Sparkles className="h-4 w-4" /><p className="text-sm font-semibold">Sugestão para manter o ritmo</p></div><p className="mt-3 text-sm leading-6 text-muted-foreground">Usa o check-in como uma pequena vitória: chegar à aula conta, mesmo nos dias em que a motivação está baixa.</p></div>
        </section>

        <HabitTracker />
      </div>
    </div>
  )
}
