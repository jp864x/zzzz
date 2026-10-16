// AI Tips Generator for Weekly Reports
// Simulates AI-generated personalized tips based on user performance

interface WeeklyTipResponse {
  tip: string
  success: boolean
}

export async function suggestWeeklyTip(performanceSummary: string): Promise<WeeklyTipResponse> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Parse performance data from summary
  const disciplineMatch = performanceSummary.match(/Disciplina geral: (\d+)%/)
  const completionsMatch = performanceSummary.match(/Hábitos completados: (\d+)/)
  const streakMatch = performanceSummary.match(/Maior streak: (\d+) dias/)

  const discipline = disciplineMatch ? Number.parseInt(disciplineMatch[1]) : 0
  const completions = completionsMatch ? Number.parseInt(completionsMatch[1]) : 0
  const longestStreak = streakMatch ? Number.parseInt(streakMatch[1]) : 0

  // Generate personalized tips based on performance
  let tip = ""

  if (discipline >= 80) {
    const excellentTips = [
      "🎉 Excelente consistência! Para manter este nível, considere adicionar um novo hábito desafiante que complemente os existentes.",
      "🔥 Está no caminho certo! Tente aumentar a dificuldade de um dos seus hábitos atuais para continuar a crescer.",
      "⭐ Performance fantástica! Considere ser mentor de alguém - ensinar outros pode fortalecer os seus próprios hábitos.",
      "🚀 Disciplina exemplar! Que tal definir uma meta de streak ainda maior para o próximo mês?",
    ]
    tip = excellentTips[Math.floor(Math.random() * excellentTips.length)]
  } else if (discipline >= 60) {
    const goodTips = [
      "💪 Boa consistência! Foque no hábito com menor taxa de conclusão - pequenas melhorias fazem grande diferença.",
      "📈 Progresso sólido! Tente identificar que horas do dia é mais produtivo e agende os hábitos mais difíceis nesse período.",
      "🎯 Está a meio caminho da excelência! Considere usar lembretes visuais ou alarmes para os hábitos que mais falha.",
      "⚡ Bom trabalho! Que tal criar um sistema de recompensas para quando completar todos os hábitos num dia?",
    ]
    tip = goodTips[Math.floor(Math.random() * goodTips.length)]
  } else if (discipline >= 40) {
    const improvementTips = [
      "🌱 Há espaço para crescimento! Comece por focar apenas nos 2-3 hábitos mais importantes até criar consistência.",
      "🔄 Considere reduzir temporariamente a dificuldade dos seus hábitos - é melhor fazer pouco consistentemente do que muito esporadicamente.",
      "📅 Tente associar os seus hábitos a rotinas já estabelecidas - por exemplo, meditar logo após escovar os dentes.",
      "🤝 Encontre um parceiro de accountability ou partilhe os seus objetivos com alguém próximo para aumentar a motivação.",
    ]
    tip = improvementTips[Math.floor(Math.random() * improvementTips.length)]
  } else {
    const motivationalTips = [
      "🌟 Todos os grandes sucessos começam com pequenos passos! Escolha apenas 1 hábito e foque nele durante uma semana.",
      "💝 Seja gentil consigo mesmo - formar hábitos leva tempo. Celebre cada pequena vitória no caminho.",
      "🎯 Simplifique! Comece com versões muito fáceis dos seus hábitos (ex: 1 flexão em vez de 20) para criar o momentum.",
      "🔥 O importante não é a perfeição, mas a persistência. Mesmo 1% de melhoria diária resulta em 37x de crescimento anual!",
    ]
    tip = motivationalTips[Math.floor(Math.random() * motivationalTips.length)]
  }

  // Add streak-specific advice
  if (longestStreak >= 7) {
    tip += ` Parabéns pelo streak de ${longestStreak} dias - isso mostra que tem a disciplina necessária!`
  } else if (longestStreak >= 3) {
    tip += ` O seu streak de ${longestStreak} dias é um bom começo - tente estendê-lo gradualmente.`
  }

  return {
    tip,
    success: true,
  }
}

// Additional utility function for habit-specific tips
export function getHabitSpecificTip(habitName: string, completionRate: number): string {
  const tips: { [key: string]: string[] } = {
    exercicio: [
      "Comece com 5 minutos de exercício - consistência é mais importante que intensidade.",
      "Prepare a roupa de exercício na noite anterior para eliminar barreiras.",
      "Encontre uma atividade que genuinamente goste - dança, caminhada, natação.",
    ],
    leitura: [
      "Leia apenas 1 página por dia para criar o hábito - pode sempre ler mais se quiser.",
      "Tenha sempre um livro à mão - no telemóvel, na mesa de cabeceira, na mochila.",
      "Junte-se a um clube de leitura ou partilhe resumos nas redes sociais para accountability.",
    ],
    meditacao: [
      "Comece com apenas 2-3 minutos de respiração consciente.",
      "Use apps como Headspace ou Calm para sessões guiadas.",
      "Medite sempre no mesmo local e hora para criar uma âncora mental.",
    ],
    agua: [
      "Tenha uma garrafa de água sempre visível na sua secretária.",
      "Beba um copo de água logo ao acordar e antes de cada refeição.",
      "Use apps que enviam lembretes regulares para beber água.",
    ],
  }

  const habitKey = habitName.toLowerCase()
  const habitTips = tips[habitKey] || [
    "Torne o hábito mais fácil removendo barreiras e criando lembretes visuais.",
    "Associe este hábito a algo que já faz consistentemente todos os dias.",
    "Celebre cada pequena vitória - o reconhecimento reforça o comportamento.",
  ]

  return habitTips[Math.floor(Math.random() * habitTips.length)]
}
