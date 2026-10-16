"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  GanttChartSquare,
  CheckCircle,
  ArrowRight,
  LogIn,
  Lock,
  Target,
  ClipboardCheck,
  BarChart,
  Sparkles,
  Zap,
  TrendingUp,
  Users,
  Dumbbell,
  BookOpen,
  PieChart,
  Play,
  Pause,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import RotatingStar from "@/components/rotating-star"

const features = [
  {
    icon: Target,
    title: "Planeamento Estratégico",
    description:
      "Defina os seus grandes objetivos de vida e desdobre-os em projetos acionáveis. A nossa estrutura guia-o desde a visão até ao primeiro passo.",
    gradient: "from-blue-500 to-cyan-500",
    delay: 0,
  },
  {
    icon: ClipboardCheck,
    title: "Execução Focada",
    description:
      "Com a Matriz de Prioridades e a gestão de tarefas diárias, saberá sempre qual é a sua próxima ação mais importante para avançar nos seus projetos.",
    gradient: "from-purple-500 to-pink-500",
    delay: 0.2,
  },
  {
    icon: BarChart,
    title: "Análise e Melhoria",
    description:
      "Receba relatórios semanais, mensais e anuais sobre o seu progresso. A nossa IA oferece dicas e resumos para o ajudar a melhorar continuamente.",
    gradient: "from-emerald-500 to-teal-500",
    delay: 0.4,
  },
]

const featureShowcase = [
  {
    id: "estudos",
    title: "Gestão de Estudos",
    description: "Organize o seu horário académico e sessões de estudo",
    icon: BookOpen,
    color: "from-blue-500 to-cyan-500",
    screenshot: "/screenshots/estudos.png",
  },
  {
    id: "habitos",
    title: "Hábitos Diários",
    description: "Acompanhe e desenvolva hábitos saudáveis",
    icon: CheckCircle,
    color: "from-emerald-500 to-teal-500",
    screenshot: "/screenshots/habitos.png",
  },
  {
    id: "relatorios",
    title: "Relatórios Semanais",
    description: "Análises detalhadas do seu desempenho e progresso",
    icon: PieChart,
    color: "from-violet-500 to-purple-500",
    screenshot: "/screenshots/relatorios.png",
  },
  {
    id: "fitness",
    title: "Fitness Tracker",
    description: "Acompanhe os seus treinos e objetivos de saúde",
    icon: Dumbbell,
    color: "from-orange-500 to-red-500",
    screenshot: "/screenshots/fitness.png",
  },
  {
id: "diary",
  title: "Diário",
  description: "Regista o teu estado e acompanha a tua evolução",
    icon: Users,
    color: "from-purple-500 to-pink-500",
    screenshot: "/screenshots/social.png",
  },
  {
    id: "emagrecimento",
    title: "Sistema de Emagrecimento",
    description: "Gerencie peso, calorias e objetivos de saúde",
    icon: Target,
    color: "from-pink-500 to-rose-500",
    screenshot: "/screenshots/emagrecimento.png",
  },
]

export default function LandingPage() {
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [alreadySubmitted, setAlreadySubmitted] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (typeof window !== "undefined") {
      const submitted = localStorage.getItem("waitlist_submitted")
      if (submitted === "true") {
        setAlreadySubmitted(true)
      }
    }
  }, [])

  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % featureShowcase.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [isPlaying])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting || alreadySubmitted) return
    setSubmitting(true)

    try {
      await new Promise((r) => setTimeout(r, 900))
      console.log("Email submitted:", email)
      toast({
        title: "Inscrição Recebida!",
        description: "Obrigado por se juntar à nossa lista. Entraremos em contacto em breve.",
      })
      setEmail("")
      setAlreadySubmitted(true)
      if (typeof window !== "undefined") {
        localStorage.setItem("waitlist_submitted", "true")
      }
    } catch (error) {
      console.error("Error submitting email:", error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="relative flex min-h-screen flex-col text-foreground overflow-x-hidden">
        <div
          className="absolute inset-0 -z-20"
          style={{
            backgroundImage: "url('/background.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-black/60 -z-10" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_600px_at_80%_40%,_rgba(168,85,247,0.25),_transparent_70%)]" />

        <div className="relative z-10 flex min-h-screen flex-col">
          <header className="p-4">
            <div className="container mx-auto flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GanttChartSquare className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold">JP</h1>
              </div>

              <Button asChild variant="outline" className="bg-transparent hover:bg-primary/10">
                <Link href="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Link>
              </Button>
            </div>
          </header>

          <main className="container relative z-10 mx-auto flex flex-grow items-center justify-center px-4">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-4 flex items-center justify-center gap-2">
                <Badge variant="secondary" className="bg-black/20 text-white backdrop-blur border-white/30">
                  <Lock className="mr-2 h-4 w-4" />
                  Private Beta • Acesso Bloqueado
                </Badge>
              </div>

              <div>
                <GanttChartSquare className="mx-auto mb-6 h-16 w-16 text-primary drop-shadow-[0_0_20px_rgba(168,85,247,0.35)]" />
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                  <div className="w-32 h-32 opacity-30">
                    <RotatingStar />
                  </div>
                </div>
                <h2 className="mb-4 bg-gradient-to-r from-fuchsia-400 via-violet-300 to-fuchsia-300 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent md:text-6xl relative z-10">
                  Eleve o seu Potencial.
                </h2>
              </div>

              <p className="mx-auto mb-8 max-w-xl text-lg text-muted-foreground">
                A plataforma definitiva para o autodesenvolvimento está a chegar. Junte-se à lista de espera para ter
                acesso antecipado.
              </p>

              <form onSubmit={handleSubmit} className="mx-auto mb-8 flex max-w-md flex-col gap-2 sm:flex-row">
                <Input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={alreadySubmitted ? "Obrigado pela sua inscrição!" : "O seu melhor email..."}
                  required
                  className="flex-grow bg-background/80 text-center backdrop-blur sm:text-left"
                  aria-label="Endereço de email para a lista de espera"
                  disabled={alreadySubmitted}
                />
                <Button
                  type="submit"
                  size="lg"
                  className="group relative w-full overflow-hidden sm:w-auto"
                  disabled={submitting || alreadySubmitted}
                >
                  <span className="relative z-10 flex items-center">
                    {submitting ? (
                      <>
                        <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        A enviar...
                      </>
                    ) : alreadySubmitted ? (
                      <>
                        <CheckCircle className="mr-2" />
                        Inscrito
                      </>
                    ) : (
                      <>
                        <span>Aderir à Lista</span>
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </span>
                </Button>
              </form>

              <div className="mx-auto mb-10 flex max-w-2xl flex-col items-center justify-center gap-6 text-muted-foreground sm:flex-row">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Análise de performance</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Metas personalizadas</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Insights com IA</span>
                </div>
              </div>

              <div className="mx-auto max-w-xl rounded-xl border border-white/20 bg-black/30 p-4 text-sm text-white backdrop-blur">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-white/90" />
                    <span className="text-white">Estado: Bloqueado (Acesso restrito)</span>
                  </div>
                  <span className="text-white/90">Beta</span>
                </div>
                <div className="relative h-2 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full w-2/3 animate-pulse bg-gradient-to-r from-fuchsia-500 via-violet-400 to-fuchsia-400"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={66}
                  />
                </div>
                <p className="mt-2 text-xs text-white/90">Junte-se para ser o primeiro a desbloquear o acesso.</p>
              </div>
            </div>
          </main>

          <footer className="z-10 p-4 text-center text-sm text-muted-foreground">
            <Link href="#features" className="hover:text-primary transition-colors">
              Saber Mais
            </Link>
          </footer>
        </div>
      </div>

      <section className="relative bg-gradient-to-b from-background to-muted/20 py-20 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-tr from-violet-500/20 to-transparent blur-3xl" />
        </div>

        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-2 text-sm font-medium text-primary-foreground">
              <Sparkles className="h-4 w-4" />
              Preview das Features
            </div>

            <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Explore a{" "}
              <span className="bg-gradient-to-r from-primary via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
                Plataforma
              </span>
            </h2>

            <p className="mt-6 text-xl leading-8 text-muted-foreground">
              Veja em tempo real como cada funcionalidade irá transformar a sua experiência de autodesenvolvimento.
            </p>
          </div>

          {/* Feature Showcase */}
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start">
              <div className="xl:col-span-1 space-y-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Funcionalidades</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                </div>

                {featureShowcase.map((feature, index) => (
                  <button
                    key={feature.id}
                    className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                      index === activeFeature
                        ? "border-primary/50 bg-primary/20 text-primary-foreground"
                        : "border-border hover:border-primary/30 hover:bg-muted/50"
                    }`}
                    onClick={() => {
                      setActiveFeature(index)
                      setIsPlaying(false)
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br ${feature.color}`}
                      >
                        <feature.icon className="h-3 w-3 text-white" />
                      </div>
                      <div>
                        <div
                          className={`text-sm font-medium ${index === activeFeature ? "text-primary-foreground" : "text-foreground"}`}
                        >
                          {feature.title}
                        </div>
                        <div
                          className={`text-xs ${index === activeFeature ? "text-primary-foreground/80" : "text-muted-foreground"}`}
                        >
                          {feature.description}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="xl:col-span-3">
                <div className="relative">
                  <div className="rounded-xl border bg-background shadow-2xl overflow-hidden">
                    {/* Browser header */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 border-b">
                      <div className="flex gap-2">
                        <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                        <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
                        <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
                      </div>
                      <div className="flex-1 text-center">
                        <div className="text-xs text-muted-foreground bg-background rounded px-2 py-0.5 inline-block">
                          jp-platform.com/{featureShowcase[activeFeature].id}
                        </div>
                      </div>
                    </div>

                    {/* Screenshot area - adjusted to contain full image */}
                    <div
                      className="bg-muted/20 flex items-center justify-center relative overflow-hidden"
                      style={{ minHeight: "400px" }}
                    >
                      <img
                        src={featureShowcase[activeFeature].screenshot || "/placeholder.svg"}
                        alt={`Screenshot da ${featureShowcase[activeFeature].title}`}
                        className="max-w-full max-h-full object-contain transition-opacity duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/5 to-transparent pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex justify-center gap-2 mt-4">
                    {featureShowcase.map((_, index) => (
                      <button
                        key={index}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          index === activeFeature ? "bg-primary w-6" : "bg-muted w-2 hover:bg-muted-foreground/50"
                        }`}
                        onClick={() => {
                          setActiveFeature(index)
                          setIsPlaying(false)
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="relative bg-gradient-to-b from-muted/20 via-background to-muted/20 py-20 sm:py-32 overflow-hidden"
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-tr from-violet-500/20 to-transparent blur-3xl" />
        </div>

        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-2 text-sm font-medium text-primary-foreground">
              <Sparkles className="h-4 w-4" />
              Funcionalidades Principais
            </div>

            <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Descubra o Poder da{" "}
              <span className="bg-gradient-to-r from-primary via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
                Plataforma
              </span>
            </h2>

            <p className="mt-6 text-xl leading-8 text-muted-foreground">
              Uma ferramenta integrada para transformar as suas ambições em realidade. Desde a definição de objetivos de
              alto nível até à execução de tarefas diárias.
            </p>
          </div>

          <div className="mx-auto mt-20 max-w-7xl">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {features.map((feature, index) => (
                <div key={feature.title} className="group relative">
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary/20 via-violet-500/20 to-fuchsia-500/20 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />

                  <div className="relative h-full rounded-2xl border border-white/10 bg-gradient-to-br from-background/80 via-background/60 to-muted/40 p-8 backdrop-blur-sm transition-all duration-500 group-hover:border-white/20 group-hover:shadow-2xl">
                    <div
                      className={`mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-lg`}
                    >
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>

                    <h3 className="mb-4 text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                      {feature.title}
                    </h3>

                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>

                    <div className="mt-6 flex items-center text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-sm font-medium">Saber mais</span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              { icon: TrendingUp, value: "300%", label: "Aumento de Produtividade" },
              { icon: Zap, value: "24/7", label: "Insights Inteligentes" },
              { icon: Target, value: "95%", label: "Taxa de Sucesso" },
            ].map((stat, index) => (
              <div key={stat.label} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <footer className="relative z-10 mt-20 p-4 text-center text-sm text-muted-foreground">
          <p>
            {"© "}
            {new Date().getFullYear()} JP Platform. Todos os direitos reservados.
          </p>
        </footer>
      </section>
    </>
  )
}
