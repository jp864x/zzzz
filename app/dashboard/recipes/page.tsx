"use client"

import Link from "next/link"
import { ArrowLeft, Clock3, Flame, Heart, Leaf, Utensils } from "lucide-react"
import { Button } from "@/components/ui/button"

const recipes = [
  { name: "Bowl mediterrânico", meal: "Almoço", kcal: 420, protein: "24 g proteína", time: "20 min", color: "bg-[#b9f3d0]/15 text-[#b9f3d0]" },
  { name: "Tosta de abacate e ovo", meal: "Pequeno-almoço", kcal: 310, protein: "15 g proteína", time: "10 min", color: "bg-[#fbd38d]/15 text-[#fbd38d]" },
  { name: "Salmão com legumes", meal: "Jantar", kcal: 485, protein: "32 g proteína", time: "30 min", color: "bg-[#ff907b]/15 text-[#ffad9d]" },
  { name: "Iogurte, fruta e sementes", meal: "Snack", kcal: 220, protein: "12 g proteína", time: "5 min", color: "bg-[#93c5fd]/15 text-[#93c5fd]" },
]

export default function RecipesPage() {
  return (
    <main className="min-h-screen bg-[#0b1117] px-4 py-6 text-[#edf4f1] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex items-center justify-between">
          <Button asChild variant="ghost" className="text-[#a9bbb5] hover:bg-white/5 hover:text-white"><Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" />Voltar ao meu cantinho</Link></Button>
          <div className="flex items-center gap-2 text-[#b9f3d0]"><Utensils className="h-5 w-5" /><span className="text-sm font-medium">Receitas leves</span></div>
        </header>
        <section className="mb-8 rounded-[28px] border border-white/10 bg-[#15201f] p-7 sm:p-10">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#91a59f]">Nutrição sem complicar</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Receitas simples para te sentires bem.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#a9bbb5]">Ideias equilibradas com calorias, proteína e tempo de preparação para escolheres com confiança.</p>
          <div className="mt-6 flex flex-wrap gap-3 text-xs text-[#c5d0cc]"><span className="rounded-full bg-[#b9f3d0]/10 px-3 py-2 text-[#b9f3d0]">Até 500 kcal</span><span className="rounded-full bg-white/5 px-3 py-2">Rápidas</span><span className="rounded-full bg-white/5 px-3 py-2">Ricas em proteína</span></div>
        </section>
        <div className="mb-4 flex items-end justify-between"><div><p className="text-[10px] uppercase tracking-[0.24em] text-[#91a59f]">Para hoje</p><h2 className="mt-1 text-xl font-semibold">Escolhe o que te apetece.</h2></div><Leaf className="h-5 w-5 text-[#b9f3d0]" /></div>
        <section className="grid gap-4 sm:grid-cols-2">
          {recipes.map((recipe) => <article key={recipe.name} className="rounded-2xl border border-white/10 bg-[#111a20] p-5 transition hover:-translate-y-0.5 hover:border-[#b9f3d0]/40"><div className="mb-8 flex items-start justify-between"><span className={`rounded-full px-3 py-1 text-xs ${recipe.color}`}>{recipe.meal}</span><Heart className="h-4 w-4 text-[#5f746d]" /></div><h3 className="text-lg font-medium">{recipe.name}</h3><div className="mt-4 flex flex-wrap gap-4 text-xs text-[#91a59f]"><span className="flex items-center gap-1 text-[#fbd38d]"><Flame className="h-3.5 w-3.5" />{recipe.kcal} kcal</span><span>{recipe.protein}</span><span className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{recipe.time}</span></div></article>)}
        </section>
      </div>
    </main>
  )
}
