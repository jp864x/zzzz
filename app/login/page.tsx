"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { GanttChartSquare, LogIn, LoaderCircle, Eye, EyeOff, ArrowLeft, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

export default function LoginPage() {
  const [email, setEmail] = useState("joao@exemplo.com")
  const [password, setPassword] = useState("123456")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showGenderStep, setShowGenderStep] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate authentication - replace with your actual auth logic
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // For demo purposes, accept any email/password
      if (email && password) {
        setShowGenderStep(true)
      } else {
        throw new Error("Invalid credentials")
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro no login.",
        description: "Por favor, verifique o seu email e palavra-passe.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-muted/20 p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-tr from-violet-500/20 to-transparent blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Back button */}
      <motion.div
        className="absolute left-4 top-4 z-10"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
      </motion.div>

      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.25, 0.25, 0, 1] }}
      >
        <Card className="relative overflow-hidden border-white/10 bg-background/80 backdrop-blur-xl shadow-2xl">
          {/* Glow effect */}
          <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-primary/20 via-violet-500/20 to-fuchsia-500/20 opacity-50 blur-xl" />

          <div className="relative">
            <CardHeader className="text-center pb-8">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Link href="/" className="mb-6 flex items-center justify-center space-x-2">
                  <motion.div whileHover={{ rotate: 360, scale: 1.1 }} transition={{ duration: 0.6 }}>
                    <GanttChartSquare className="h-10 w-10 text-primary drop-shadow-[0_0_20px_rgba(168,85,247,0.35)]" />
                  </motion.div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                    JP
                  </h1>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <Sparkles className="h-3 w-3" />
                  Acesso Exclusivo
                </div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
                  Bem-vindo de volta
                </CardTitle>
                <CardDescription className="mt-2 text-muted-foreground">
                  Insira as suas credenciais para aceder à plataforma.
                </CardDescription>
              </motion.div>
            </CardHeader>

            {showGenderStep ? (
              <CardContent className="space-y-6 py-10">
                <div className="text-center">
                  <div className="mb-3 text-4xl">Escolhe o teu espaço</div>
                  <CardTitle className="text-2xl">Como queres personalizar a tua experiência?</CardTitle>
                  <CardDescription className="mt-2">Usamos esta escolha apenas para adaptar o visual e a linguagem do teu painel.</CardDescription>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Button type="button" variant="outline" className="h-auto min-h-28 flex-col gap-2 border-pink-300/30 bg-pink-500/10 py-5 hover:bg-pink-500/20" onClick={() => { sessionStorage.setItem("wellness-gender", "female"); router.push("/dashboard") }}>
                    <span className="text-3xl">♀</span><span className="font-semibold">Feminino</span><span className="text-xs text-muted-foreground">Visual suave e acolhedor</span>
                  </Button>
                  <Button type="button" variant="outline" className="h-auto min-h-28 flex-col gap-2 border-sky-300/30 bg-sky-500/10 py-5 hover:bg-sky-500/20" onClick={() => { sessionStorage.setItem("wellness-gender", "male"); router.push("/dashboard") }}>
                    <span className="text-3xl">♂</span><span className="font-semibold">Masculino</span><span className="text-xs text-muted-foreground">Visual premium e confiante</span>
                  </Button>
                </div>
              </CardContent>
            ) : (
            <CardContent className="space-y-6">
              <motion.form
                onSubmit={handleSubmit}
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <motion.div className="space-y-2" whileFocus={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email"
                      required
                      disabled={isLoading}
                      className="h-12 bg-background/50 border-white/10 backdrop-blur-sm transition-all duration-300 focus:border-primary/50 focus:bg-background/80"
                    />
                  </div>
                </motion.div>

                <motion.div className="space-y-2" whileFocus={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Palavra-passe"
                      required
                      disabled={isLoading}
                      className="h-12 bg-background/50 border-white/10 backdrop-blur-sm pr-12 transition-all duration-300 focus:border-primary/50 focus:bg-background/80"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 p-0 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      <AnimatePresence mode="wait">
                        {showPassword ? (
                          <motion.div
                            key="eye-off"
                            initial={{ opacity: 0, rotate: -90 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            exit={{ opacity: 0, rotate: 90 }}
                            transition={{ duration: 0.2 }}
                          >
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="eye"
                            initial={{ opacity: 0, rotate: -90 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            exit={{ opacity: 0, rotate: 90 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Button>
                  </div>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    className="group relative h-12 w-full overflow-hidden bg-gradient-to-r from-primary via-violet-600 to-fuchsia-600 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-primary/25"
                    size="lg"
                    disabled={isLoading}
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      <AnimatePresence mode="wait">
                        {isLoading ? (
                          <motion.div
                            key="loading"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center"
                          >
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />A entrar...
                          </motion.div>
                        ) : (
                          <motion.div
                            key="login"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center"
                          >
                            <LogIn className="mr-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                            Entrar
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </span>
                    {/* Shimmer effect */}
                    <span className="absolute inset-0 -z-0 translate-x-[-100%] bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.2),transparent)] transition-transform duration-700 group-hover:translate-x-[100%]" />
                  </Button>
                </motion.div>
              </motion.form>

              <motion.div
                className="relative"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">ou</span>
                </div>
              </motion.div>

              <motion.p
                className="text-center text-sm text-muted-foreground"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                Ainda não tem acesso?{" "}
                <Link
                  href="/"
                  className="font-medium text-primary transition-colors hover:text-primary/80 hover:underline"
                >
                  Junte-se à lista de espera.
                </Link>
              </motion.p>
            </CardContent>
            )} 
          </div>
        </Card>
      </motion.div>

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
    </div>
  )
}
