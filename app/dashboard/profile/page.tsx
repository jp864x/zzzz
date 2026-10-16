"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import ProfileEditor from "@/components/profile-editor"

export default function ProfilePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard")}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Dashboard</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-8">
        <ProfileEditor />
      </div>
    </div>
  )
}
