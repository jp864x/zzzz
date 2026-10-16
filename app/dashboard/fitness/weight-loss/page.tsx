"use client"

import { WeightLossTracker } from "@/components/weight-loss-tracker"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Target, LogOut } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

export default function WeightLossPage() {
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
            <Link href="/dashboard/fitness">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </Link>
            <Target className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Sistema de Emagrecimento</h1>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <LogOut className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
        </motion.div>

        <WeightLossTracker />
      </div>
    </div>
  )
}
