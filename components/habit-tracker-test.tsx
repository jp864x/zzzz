"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function HabitTracker() {
  const [habits] = useState<string[]>(["Ginásio", "Andar", "Correr"])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hábitos Diários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {habits.map((habit) => (
              <div key={habit} className="p-2 border rounded">
                {habit}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default HabitTracker
