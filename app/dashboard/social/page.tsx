"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import SocialHub from "@/components/social-hub"

export default function SocialPage() {
  const [loading] = useState(false)
  const router = useRouter()

  // Mock user for testing
  const user = { uid: "mock-user-123", email: "teste@exemplo.com" }

  const handleLogout = async () => {
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Hub Social
            </h1>
            <p className="text-muted-foreground">Conecte-se com amigos e partilhe os seus hábitos</p>
          </div>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Social Hub */}
        <SocialHub />
      </div>
    </div>
  )
}
