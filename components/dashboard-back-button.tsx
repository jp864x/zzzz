"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export function DashboardBackButton() {
  const router = useRouter()

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="group inline-flex items-center gap-2 rounded-full border border-[#caa85e]/40 bg-[#17130d]/90 px-4 py-2.5 text-xs font-semibold tracking-wide text-[#f1d58a] shadow-[0_12px_34px_rgba(75,52,14,0.2)] backdrop-blur-xl transition hover:-translate-x-0.5 hover:border-[#e6c875] hover:bg-[#221b0e] hover:text-[#fff3c4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#caa85e]/50"
      aria-label="Voltar para a página anterior"
    >
      <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
      <span>Voltar</span>
    </button>
  )
}
