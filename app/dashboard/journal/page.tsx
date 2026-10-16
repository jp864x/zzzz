"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, BookHeart, CalendarDays, Plus, Smile } from "lucide-react"
import { Button } from "@/components/ui/button"

const moods = ["Tranquila", "Feliz", "Cansada", "Ansiosa"]

export default function JournalPage() {
  const [entry, setEntry] = useState("")
  const [mood, setMood] = useState("Tranquila")
  const [saved, setSaved] = useState(false)

  function saveEntry() {
    if (!entry.trim()) return
    setSaved(true)
    setEntry("")
  }

  return (
    <main className="min-h-screen bg-[#0b1117] px-4 py-6 text-[#edf4f1] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 flex items-center justify-between">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-[#91a59f] transition hover:text-[#b9f3d0]">
            <ArrowLeft className="h-4 w-4" /> Voltar ao meu cantinho
          </Link>
          <div className="flex items-center gap-2 text-[#b9f3d0]"><BookHeart className="h-5 w-5" /><span className="text-sm font-semibold">Meu diário</span></div>
        </header>

        <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[28px] border border-white/10 bg-[#15201f] p-6 sm:p-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#91a59f]">Hoje, um momento só teu</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">Como te estás a sentir?</h1>
            <p className="mt-3 text-sm leading-6 text-[#a9bbb5]">Escreve sem filtros. Este espaço é privado e serve para acompanhares o teu caminho.</p>

            <div className="mt-7 flex flex-wrap gap-2" aria-label="Escolher humor">
              {moods.map((item) => <button key={item} type="button" onClick={() => setMood(item)} className={`rounded-full border px-4 py-2 text-sm transition ${mood === item ? "border-[#b9f3d0]/60 bg-[#b9f3d0]/15 text-[#b9f3d0]" : "border-white/10 text-[#a9bbb5] hover:border-white/25"}`}>{item}</button>)}
            </div>

            <textarea value={entry} onChange={(event) => setEntry(event.target.value)} placeholder="O que gostarias de guardar sobre hoje?" className="mt-6 min-h-44 w-full resize-none rounded-2xl border border-white/10 bg-[#0f181d] p-4 text-sm text-[#edf4f1] outline-none transition placeholder:text-[#5f746d] focus:border-[#b9f3d0]/50" />
            <Button type="button" onClick={saveEntry} className="mt-4 rounded-xl bg-[#b9f3d0] text-[#0b1117] hover:bg-[#d2f9df]"><Plus className="mr-2 h-4 w-4" />Guardar entrada</Button>
            {saved && <p className="mt-3 text-sm text-[#b9f3d0]" role="status">Entrada guardada no teu diário.</p>}
          </div>

          <aside className="rounded-[28px] border border-white/10 bg-[#111a20] p-6 sm:p-8">
            <div className="flex items-center gap-3"><div className="rounded-xl bg-[#b9f3d0]/10 p-3 text-[#b9f3d0]"><CalendarDays className="h-5 w-5" /></div><div><p className="text-sm font-semibold">As tuas reflexões</p><p className="text-xs text-[#91a59f]">O teu espaço de calma</p></div></div>
            <div className="mt-8 rounded-2xl border border-white/10 bg-[#0f181d] p-5"><div className="flex items-center gap-2 text-[#fbd38d]"><Smile className="h-4 w-4" /><span className="text-xs font-semibold uppercase tracking-[0.18em]">Humor de hoje</span></div><p className="mt-3 text-2xl font-semibold">{mood}</p><p className="mt-2 text-sm leading-6 text-[#91a59f]">Pequenas notas ajudam-te a perceber o que precisas.</p></div>
            <p className="mt-6 text-center text-xs leading-5 text-[#5f746d]">Não precisas de escrever muito. Uma frase honesta já é um cuidado.</p>
          </aside>
        </section>
      </div>
    </main>
  )
}
