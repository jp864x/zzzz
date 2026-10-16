"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export function DashboardBackButton() {
  const router = useRouter()

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="group inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white/90 px-3.5 py-2 text-xs font-medium text-neutral-600 shadow-[0_8px_28px_rgba(0,0,0,0.08)] backdrop-blur-xl transition hover:-translate-x-0.5 hover:border-black/[0.14] hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/40"
      aria-label="Voltar para a página anterior"
    >
      <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
      <span>Voltar</span>
    </button>
  )
}
